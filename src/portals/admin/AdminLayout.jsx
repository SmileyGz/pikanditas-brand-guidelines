import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import GlobalAlerts from '../../components/GlobalAlerts'
import './AdminLayout.css'

const NAV = [
  { to: 'dashboard',  icon: '📊', label: 'Dashboard' },
  { to: 'tiendas',    icon: '🏪', label: 'Tiendas' },
  { to: 'vendedores', icon: '👤', label: 'Vendedores' },
  { to: 'inventario', icon: '📦', label: 'Inventario' },
  { to: 'resurtido',  icon: '🚚', label: 'Resurtido B2B' },
  { to: 'ventas',     icon: '💰', label: 'Ventas' },
  { to: 'visitas',    icon: '🗓️', label: 'Visitas' },
  { to: 'mapa',       icon: '🗺️', label: 'Mapa Global' },
  { to: 'acuerdos',   icon: '📄', label: 'Acuerdos' },
  { to: 'alertas',    icon: '🚨', label: 'Alertas' },
  { to: 'config',     icon: '⚙️', label: 'Config' },
]

export default function AdminLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin', { replace: true })
  }

  // Global panic fetcher
  const { data: openPanicCount = 0 } = useQuery({
    queryKey: ['count-panic'],
    queryFn: async () => {
      const { count } = await supabase.from('panic_events').select('*', { count: 'exact', head: true }).eq('status', 'open')
      return count ?? 0
    },
    refetchInterval: 10000, // Poll every 10 seconds for emergencies
    enabled: !!import.meta.env.VITE_SUPABASE_URL,
  })

  return (
    <div className="admin-layout portal-admin">
      <GlobalAlerts />
      {openPanicCount > 0 && <div className="panic-overlay" />}
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-logo">
          <img src="/logo.png" alt="Pikanditas" className="sidebar-logo-img" />
          <span>Pikanditas</span>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="admin-nav-divider" />

          <a
            href="/"
            className="admin-nav-item"
            target="_blank"
            rel="noreferrer"
          >
            <span className="nav-icon">🛍️</span>
            Ver tienda
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">👤</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.email?.split('@')[0] || 'Admin'}</span>
              <span className="sidebar-user-role">Administrador</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-full sidebar-signout" onClick={handleSignOut}>
            🚪 Cerrar sesión
          </button>
          <p className="powered-by" style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.65rem', opacity: 0.5 }}>
            Powered by Jonla Agencia
          </p>
        </div>
      </aside>

      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Content ── */}
      <main className="admin-content">
        {/* Topbar */}
        <header className="admin-topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-brand">
            <img src="/logo.png" alt="" className="topbar-logo" />
            <span>Admin</span>
          </div>
          <div className="topbar-spacer" />
          <NavLink to="/admin/alertas" className="topbar-panic-indicator" id="panic-indicator" style={{ textDecoration: 'none' }}>
            {openPanicCount > 0 && <span className="animate-panic-pulse" style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(255,0,0,0.8))' }}>🚨</span>}
          </NavLink>
        </header>

        {/* Page content via router */}
        <Outlet />
      </main>
    </div>
  )
}
