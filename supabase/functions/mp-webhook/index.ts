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

      const externalRef = paymentInfo.external_reference || ""
      const status = paymentInfo.status

      if (externalRef) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        if (externalRef.startsWith('B2B_')) {
          const saleId = externalRef.replace('B2B_', '')
          
          if (status === 'approved') {
            await supabaseClient
              .from('sales')
              .update({ 
                payment_status: 'paid',
              })
              .eq('id', saleId)
          }

        } else if (externalRef.startsWith('B2C_') || !externalRef.includes('_')) {
          // Fallback for older references without prefix or with B2C_ prefix
          const orderId = externalRef.replace('B2C_', '')

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
            const { data: order } = await supabaseClient
              .from('online_orders')
              .select('*')
              .eq('id', orderId)
              .single()

            if (order) {
              await supabaseClient.from('sales').insert({
                sale_type: 'b2c_20',
                quantity: order.quantity,
                unit_price: 20,
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
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response("Internal Server Error", { status: 500 })
  }
})
