import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useLangStore } from '../../store/langStore'
import './StoreLanding.css'

export default function StoreLayout() {
  const { lang, setLang } = useLangStore()
  const location = useLocation()
  const navigate = useNavigate()
  
  const isHome = location.pathname === '/' || location.pathname === '/menu'

  const handleMenuClick = (e) => {
    e.preventDefault()
    if (isHome) {
      document.getElementById('bundles')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/#bundles')
    }
  }

  const handleOrderClick = (e) => {
    e.preventDefault()
    if (isHome) {
      document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/#checkout')
    }
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogoClick = (e) => {
    if (isHome) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="store-root">
      {/* ── Top Navigation Bar ── */}
      <nav className="store-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '0.25rem var(--space-6)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.05)'
      }}>
        <Link to="/" onClick={handleLogoClick} className="nav-brand-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Pikanditas Logo" className="nav-logo-img" />
          <span className="nav-logo-text" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>Pikanditas</span>
        </Link>
        
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="/#bundles" onClick={(e) => { handleMenuClick(e); handleLinkClick(); }}>{lang === 'es' ? 'Menú' : 'Menu'}</a>
          <Link to="/nosotros" onClick={handleLinkClick}>{lang === 'es' ? 'Nosotros' : 'About'}</Link>
          <Link to="/mayoristas" onClick={handleLinkClick} style={{ color: 'var(--color-primary)' }}>{lang === 'es' ? 'Mayoristas' : 'Wholesale'}</Link>
          <Link to="/tienditas" onClick={handleLinkClick} style={{ color: 'var(--color-secondary)' }}>{lang === 'es' ? 'Tienditas' : 'Retail'}</Link>
          
          <div className="nav-actions-mobile-only" style={{ display: 'none', marginTop: '1rem', width: '100%' }}>
            <a href="/#checkout" className="btn btn-primary btn-full" onClick={(e) => { handleOrderClick(e); handleLinkClick(); }}>
              {lang === 'es' ? 'Pedir Ahora' : 'Order Now'}
            </a>
          </div>
        </div>
        
        <div className="nav-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="lang-toggle" style={{ position: 'static', border: 'none', background: 'rgba(0,0,0,0.05)' }}>
            <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={() => setLang('es')} style={{ color: lang === 'es' ? '#fff' : 'inherit' }}>ES</button>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')} style={{ color: lang === 'en' ? '#fff' : 'inherit' }}>EN</button>
          </div>
          
          {/* Hamburger Icon for Mobile (placed after language toggle) */}
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
            ☰
          </button>

          <a href="/#checkout" className="btn btn-primary btn-sm btn-order-desktop" onClick={handleOrderClick}>
            {lang === 'es' ? 'Pedir Ahora' : 'Order Now'}
          </a>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <Outlet />

      {/* ── Global Footer (Original Home Footer) ── */}
      <footer className="main-footer" style={{ padding: 'var(--space-6)' }}>
        <div className="footer-content" style={{ gap: 'var(--space-4)' }}>
          <img src="/logo.png" alt="Pikanditas" className="footer-logo" style={{ height: '140px', width: 'auto', marginBottom: '1rem' }} />
          
          <div className="footer-links">
            <Link to="/terminos">{lang === 'es' ? 'Términos y Privacidad' : 'Terms & Privacy'}</Link>
          </div>
          
          <div className="footer-legal">
            <p>© {new Date().getFullYear()} Pikanditas. Todos los derechos reservados.</p>
            <p style={{ opacity: 0.5 }}>Powered by Jonla Agencia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
