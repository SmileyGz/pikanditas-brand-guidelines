import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    
    // MP Webhooks usually send the type and id in the query or body
    const body = await req.json()
    const { type, data } = body

    if (type === "payment") {
      const paymentId = data.id
      
      // Fetch payment info from MP
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}` }
      })
      const paymentInfo = await response.json()

      // The external_reference is our online_orders ID
      const orderId = paymentInfo.external_reference
      const status = paymentInfo.status

      if (orderId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Update online_orders
        await supabaseClient
          .from('online_orders')
          .update({ 
            payment_status: status,
            mp_payment_id: paymentId.toString()
          })
          .eq('id', orderId)

        // If approved, create a sale record in the sales table for reporting
        if (status === 'approved') {
          // First fetch the order to get details
          const { data: order } = await supabaseClient
            .from('online_orders')
            .select('*')
            .eq('id', orderId)
            .single()

          if (order) {
            // Register public sale
            await supabaseClient.from('sales').insert({
              sale_type: 'b2c_20',
              quantity: order.quantity,
              unit_price: 20, // B2C price
              total_mxn: order.total_price,
              payment_method: 'mercado_pago',
              payment_status: 'paid',
              amount_collected: order.total_price,
              amount_pending: 0,
              notes: `Online Sale ID: ${order.id}`
            })
          }
        }
      }
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response("Internal Server Error", { status: 500 })
  }
})
