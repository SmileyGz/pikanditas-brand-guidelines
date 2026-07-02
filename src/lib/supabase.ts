import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Typed helpers
export type UserRole = 'admin' | 'seller' | 'store'
export type AgreementType = 'compra_directa_12' | 'compra_directa_10' | 'consignacion' | 'custom'
export type PricingTier = 'tiendita_12' | 'distributor_10' | 'retail_20'
