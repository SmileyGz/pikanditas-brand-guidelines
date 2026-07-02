import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, Preference } from "npm:mercadopago"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Configure CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items, buyerInfo } = await req.json()
    
    // MP Token comes from Supabase Secrets
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) throw new Error("Missing MP_ACCESS_TOKEN")

    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
    const preference = new Preference(client)

    // Calculate total price
    const total_price = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0)
    const quantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0)

    // 1. Save pending order in Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: order, error: orderError } = await supabaseClient
      .from('online_orders')
      .insert({
        buyer_name: buyerInfo?.name || 'Cliente Online',
        buyer_email: buyerInfo?.email || 'contacto@pikanditas.com',
        quantity: quantity,
        total_price: total_price,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Create MP Preference
    const result = await preference.create({
      body: {
        items: items,
        external_reference: order.id, // Link to our DB order ID
        payment_methods: {
          excluded_payment_methods: [], // Enable OXXO and Cards
          installments: 1 // Force single payment for small items
        },
        back_urls: {
          success: "https://pikanditas.com/pago/exito",
          failure: "https://pikanditas.com/pago/fallo",
          pending: "https://pikanditas.com/pago/pendiente",
        },
        auto_return: "approved",
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`
      }
    })

    // 3. Update order with MP Preference ID
    await supabaseClient
      .from('online_orders')
      .update({ mp_preference_id: result.id })
      .eq('id', order.id)

    // Return the init_point (Checkout Pro URL)
    return new Response(
      JSON.stringify({ init_point: result.init_point, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
