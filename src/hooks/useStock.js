import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function useStock() {
  return useQuery({
    queryKey: ['global-stock'],
    queryFn: async () => {
      const isAdmin = useAuthStore.getState().role === 'admin'
      
      if (!isAdmin) {
        const { data, error } = await supabase.rpc('get_available_stock')
        if (error) {
          console.warn('RPC failed. Fallback 9999.', error)
          return { availableStock: 9999 }
        }
        return { availableStock: data || 0 }
      }

      try {
        // Attempt to fetch detailed stats (works for Admins)
        // 1. Total Producción
        const { data: prodData, error: prodErr } = await supabase.from('production_logs').select('bags_yield')
        if (prodErr && prodErr.code !== '42P01') throw prodErr
        const totalProduced = (prodData || []).reduce((sum, log) => sum + (log.bags_yield || 0), 0)

        // 2. Total Consignado (En Calle)
        const { data: consData, error: consErr } = await supabase.from('consignments').select('delivered_qty')
        if (consErr && consErr.code !== '42P01') throw consErr
        const totalConsigned = (consData || []).reduce((sum, c) => sum + (c.delivered_qty || 0), 0)

        // 3. Total Ventas B2B (Directas y de contado)
        const { data: salesData, error: salesErr } = await supabase.from('sales').select('quantity')
        if (salesErr && salesErr.code !== '42P01') throw salesErr
        const totalSalesB2B = (salesData || []).reduce((sum, s) => sum + (s.quantity || 0), 0)

        // 4. Total Ventas Online (StoreLanding)
        const { data: onlineData, error: onlineErr } = await supabase.from('online_orders').select('quantity').eq('payment_status', 'approved')
        if (onlineErr && onlineErr.code !== '42P01') throw onlineErr
        const totalSalesOnline = (onlineData || []).reduce((sum, o) => sum + (o.quantity || 0), 0)

        // 5. Total In-house Sellers Mobile Inventory
        const { data: profilesData, error: profilesErr } = await supabase.from('profiles').select('mobile_inventory')
        if (profilesErr && profilesErr.code !== '42P01') throw profilesErr
        const totalInhouse = (profilesData || []).reduce((sum, p) => sum + Math.max(0, p.mobile_inventory || 0), 0)

        // 6. Total Ventas Admin (B2C o CxC desde el CRM)
        const { data: adminSalesData, error: adminSalesErr } = await supabase.from('sales_receipts').select('quantity')
        if (adminSalesErr && adminSalesErr.code !== '42P01') throw adminSalesErr
        const totalAdminSales = (adminSalesData || []).reduce((sum, s) => sum + (s.quantity || 0), 0)

        // Matemáticas
        const totalOut = totalConsigned + totalSalesB2B + totalSalesOnline + totalInhouse + totalAdminSales
        const availableStock = totalProduced - totalOut

        return {
          totalProduced,
          totalConsigned,
          totalSalesB2B,
          totalSalesOnline,
          totalInhouse,
          totalAdminSales,
          totalOut,
          availableStock: availableStock < 0 ? 0 : availableStock // Prevents negative UI if data is wonky
        }
      } catch (err) {
        console.warn('Detailed JS math failed for admin. Fallback to RPC.', err)
        const { data, error } = await supabase.rpc('get_available_stock')
        return { availableStock: error ? 9999 : (data || 0) }
      }
    },
    refetchInterval: 1000 * 60, // Poll every 60 seconds
    staleTime: 1000 * 30,
  })
}
