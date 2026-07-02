import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

/**
 * Custom hook to fetch and update global business settings
 * connected to the `business_settings` table.
 */
export function useSettings() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      // Intentar obtener los settings (ID: 1)
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('id', 1)
        .single()
        
      if (error && error.code !== 'PGRST116') { // Ignorar error de no filas (lo manejamos después)
        console.error("Error fetching settings:", error)
      }
      
      // Si no existe, devolvemos unos defaults (basados en Director Comercial)
      return data || {
        id: 1,
        costo_produccion: 7.34,
        precio_publico: 20.00,
        precio_mayoreo: 12.00,
        precio_distribuidor: 10.00,
        dias_gracia_consignacion: 23,
        telefono_soporte: '9543388332',
        zonas_activas: ['Zicatela', 'Puerto Escondido Centro', 'Punta Zicatela']
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour to prevent DB spam
  })

  const mutation = useMutation({
    mutationFn: async (newSettings) => {
      const { error } = await supabase
        .from('business_settings')
        .upsert({ ...newSettings, id: 1 }) // Upsert ensures we update or insert row 1
      
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['business-settings'])
    }
  })

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSettings: mutation.mutateAsync,
    isUpdating: mutation.isLoading
  }
}
