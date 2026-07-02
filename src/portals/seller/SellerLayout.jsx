import React from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: 'visitas', icon: '📍', label: 'Ruta' },
  { to: 'ventas',  icon: '🛒', label: 'Vender' },
  { to: 'cortes',  icon: '💰', label: 'Cortes' },
  { to: 'compras', icon: '📦', label: 'CEDIS' },
  { to: 'panico',  icon: '🚨', label: 'Pánico' },
]

export default function SellerLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isHome = location.pathname === '/seller/home' || location.pathname === '/seller/inicio' || location.pathname === '/seller'

  const handleSignOut = async () => {
    await signOut()
    navigate('/seller', { replace: true })
  }

  return (
    <div className="portal-seller" style={{ paddingBottom: 72 }}>
      {/* Topbar */}
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
        <NavLink to="home" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Pikanditas" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>
            Pikanditas
          </span>
        </NavLink>
        <div style={{ flex: 1 }} />
        <NavLink to="nueva-tienda" className="btn btn-primary btn-sm">
          + Nueva tienda
        </NavLink>
        <button className="btn btn-ghost btn-sm" onClick={handleSignOut} title="Cerrar sesión">
          🚪
        </button>
      </header>

      {/* Page content */}
      <Outlet />

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/9543388332?text=Hola%20Pikanditas%2C%20soy%20vendedor%20y%20necesito%20apoyo"
        className="whatsapp-fab"
        target="_blank"
        rel="noreferrer"
        title="Contactar Admin"
      >
        💬
      </a>
    </div>
  )
}
