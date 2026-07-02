import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useStock() {
  return useQuery({
    queryKey: ['global-stock'],
    queryFn: async () => {
      // 1. Total Producción
      const { data: prodData, error: prodErr } = await supabase.from('production_logs').select('bags_yield')
      if (prodErr && prodErr.code !== '42P01') throw prodErr
      const totalProduced = (prodData || []).reduce((sum, log) => sum + (log.bags_yield || 0), 0)

      // 2. Total Consignado (En Calle)
      const { data: consData, error: consErr } = await supabase.from('consignments').select('delivered_qty')
      if (consErr && consErr.code !== '42P01') throw consErr
      const totalConsigned = (consData || []).reduce((sum, c) => sum + (c.delivered_qty || 0), 0)

      // 3. Total Ventas B2B (Directas y de contado)
      const { data: salesData, error: salesErr } = await supabase.from('sales_receipts').select('quantity')
      if (salesErr && salesErr.code !== '42P01') throw salesErr
      const totalSalesB2B = (salesData || []).reduce((sum, s) => sum + (s.quantity || 0), 0)

      // 4. Total Ventas Online (StoreLanding)
      const { data: onlineData, error: onlineErr } = await supabase.from('online_orders').select('quantity').eq('payment_status', 'success')
      if (onlineErr && onlineErr.code !== '42P01') throw onlineErr
      const totalSalesOnline = (onlineData || []).reduce((sum, o) => sum + (o.quantity || 0), 0)

      // 5. Total In-house Sellers Mobile Inventory
      const { data: profilesData, error: profilesErr } = await supabase.from('profiles').select('mobile_inventory')
      if (profilesErr && profilesErr.code !== '42P01') throw profilesErr
      const totalInhouse = (profilesData || []).reduce((sum, p) => sum + (p.mobile_inventory || 0), 0)

      // Matemáticas
      const totalOut = totalConsigned + totalSalesB2B + totalSalesOnline + totalInhouse
      const availableStock = totalProduced - totalOut

      return {
        totalProduced,
        totalConsigned,
        totalSalesB2B,
        totalSalesOnline,
        totalInhouse,
        totalOut,
        availableStock: availableStock < 0 ? 0 : availableStock // Prevents negative UI if data is wonky
      }
    },
    refetchInterval: 1000 * 60, // Poll every 60 seconds
    staleTime: 1000 * 30,
  })
}
