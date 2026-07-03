import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useStock() {
  return useQuery({
    queryKey: ['global-stock'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_stock')

      if (error) {
        console.warn('Could not fetch stock (maybe migration not run yet or RLS blocked). Falling back to 9999.')
        return { availableStock: 9999 }
      }

      return {
        availableStock: data || 0
      }
    },
    refetchInterval: 1000 * 60, // Poll every 60 seconds
    staleTime: 1000 * 30,
  })
}
