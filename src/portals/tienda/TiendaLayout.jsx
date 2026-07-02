import React from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export default function TiendaLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isHome = location.pathname === '/tienda/inicio' || location.pathname === '/tienda'

  const { data: store } = useQuery({
    queryKey: ['my-store', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_profile_id', user?.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user?.id
  })

  const handleSignOut = async () => {
    await signOut()
    navigate('/tienda', { replace: true })
  }

  return (
    <div className="portal-seller" style={{ paddingBottom: 72 }}>
      {/* ── Top Header ── */}
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-float)',
      }}>
        {!isHome && (
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0 0.5rem 0 0', color: 'var(--color-text)' }}
            aria-label="Volver"
          >
            ⬅️
          </button>
        )}
        <NavLink to="inicio" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}>
          <img src="/logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>
            Mi Tiendita
          </span>
        </NavLink>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" onClick={handleSignOut} title="Cerrar sesión">
          🚪 Salir
        </button>
      </header>

      {/* ── Main Content ── */}
      <Outlet />

      {/* ── Bottom Nav (Only show if linked to a store) ── */}
      {store && (
        <nav className="bottom-nav">
          <NavLink to="inicio" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🏠</span>
            <span>Inicio</span>
          </NavLink>
          <NavLink to="pedidos" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📦</span>
            <span>Pedidos</span>
          </NavLink>
          <NavLink to="acuerdo" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📄</span>
            <span>Acuerdo</span>
          </NavLink>
          <NavLink to="panico" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon animate-panic-pulse">🚨</span>
            <span>Pánico</span>
          </NavLink>
        </nav>
      )}
    </div>
  )
}
