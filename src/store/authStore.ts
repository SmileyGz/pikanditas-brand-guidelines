import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, type UserRole } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  role: UserRole | null
  entityId: string | null
  tier: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  setSession: (session: Session | null) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      role: null,
      entityId: null,
      tier: null,
      loading: true,

      setSession: async (session) => {
        if (!session) {
          set({ user: null, session: null, role: null, entityId: null, tier: null })
          return
        }
        const meta = session.user?.app_metadata ?? {}
        set({
          user: session.user,
          session,
          role: meta.role ?? null,
          entityId: meta.entity_id ?? null,
          tier: meta.tier ?? null,
        })
        
        // Fetch actual profile data from database to ensure role is accurate
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, tier')
          .eq('id', session.user.id)
          .single()
          
        console.log("PROFILE FETCH RESULT:", { profile, error })
          
        if (profile) {
          set({
            role: profile.role,
            tier: profile.tier,
          })
        }
        console.log("Role inside setSession after DB fetch:", get().role)
      },

      signIn: async (email, password) => {
        console.log("Attempting sign in...")
        const { error, data } = await supabase.auth.signInWithPassword({ email, password })
        console.log("Sign in result:", { error, session: data.session })
        if (!error && data.session) await get().setSession(data.session)
        console.log("Role after setSession:", get().role)
        return { error: error as Error | null }
      },

      signInWithPhone: async (phone) => {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.startsWith('+') ? phone : `+52${phone}`,
        })
        return { error: error as Error | null }
      },

      verifyOtp: async (phone, token) => {
        const { error, data } = await supabase.auth.verifyOtp({
          phone: phone.startsWith('+') ? phone : `+52${phone}`,
          token,
          type: 'sms',
        })
        if (!error && data.session) await get().setSession(data.session)
        return { error: error as Error | null }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, role: null, entityId: null, tier: null })
      },
    }),
    {
      name: 'pikanditas-auth',
      partialize: (state) => ({
        role: state.role,
        entityId: state.entityId,
        tier: state.tier,
      }),
    }
  )
)

// Initialize session from Supabase on app load
supabase.auth.onAuthStateChange((_event, session) => {
  // Do not await setSession here! Awaiting a Supabase DB query inside onAuthStateChange 
  // causes a deadlock in gotrue-js because the query tries to read the token while the lock is held.
  useAuthStore.getState().setSession(session)
    .catch((err) => console.error("Error in onAuthStateChange setSession:", err))
    .finally(() => useAuthStore.setState({ loading: false }))
})

// Safety fallback: ensure loading never gets stuck forever
setTimeout(() => {
  if (useAuthStore.getState().loading) {
    console.warn("Auth loading state timed out, forcing to false")
    useAuthStore.setState({ loading: false })
  }
}, 5000)
