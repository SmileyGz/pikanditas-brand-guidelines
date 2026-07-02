import React from 'react'
import { Link } from 'react-router-dom'
import { useLangStore } from '../../store/langStore'
import './SellerLanding.css'

export default function SellerLanding() {
  const { lang } = useLangStore()

  const t = {
    es: {
      title: '¡Inicia tu Propio Negocio!',
      subtitle: 'El Programa de Mayoristas Pikanditas 🐻🌶️',
      paragraph: 'Conviértete en mayorista, sé tu propio jefe y empieza a generar ingresos extra vendiendo el snack favorito de Cancún en tu uni, con tus amigos o en tienditas.',
      mathTitle: 'Precios de Fábrica 🏭',
      profitHighlight: '63.3%',
      profitLabel: 'de margen de ganancia',
      profitText: 'Compra a precio de mayoreo y multiplica tu inversión al vender a precio público.',
      stepsTitle: '¿Cómo funciona?',
      steps: [
        { icon: '📦', title: '1. Pide tu caja', desc: 'Compra tu primera caja a precio de mayoreo.' },
        { icon: '🎓', title: '2. Vende a todos', desc: 'Véndelas en tu prepa, uni, oficina o a tienditas.' },
        { icon: '💸', title: '3. ¡Disfruta tus ganancias!', desc: 'Recupera tu inversión rapidísimo y quédate con la súper ganancia.' }
      ],
      joinBtn: '¡Quiero ser Mayorista!',
      contactBtn: 'Hablar con un Asesor'
    },
    en: {
      title: 'Start Your Own Business!',
      subtitle: 'The Pikanditas Wholesale Program 🐻🌶️',
      paragraph: 'Become a wholesaler, be your own boss, and start generating extra income by selling Cancún\'s favorite snack at school, with friends, or at local stores.',
      mathTitle: 'Factory Prices 🏭',
      profitHighlight: '63.3%',
      profitLabel: 'profit margin',
      profitText: 'Buy at wholesale prices and multiply your investment by selling at the public price.',
      stepsTitle: 'How it works:',
      steps: [
        { icon: '📦', title: '1. Order your box', desc: 'Buy your first box at wholesale price.' },
        { icon: '🎓', title: '2. Sell to everyone', desc: 'Sell them at school, college, office, or local stores.' },
        { icon: '💸', title: '3. Enjoy your profits!', desc: 'Get your investment back fast and keep the super profit.' }
      ],
      joinBtn: 'I want to be a Wholesaler!',
      contactBtn: 'Talk to an Advisor'
    }
  }

  const texts = t[lang]

  return (
    <div className="mayorista-root">
      {/* Immersive gradient background matching the image */}
      <div className="mayorista-bg-layer" />

      <div className="mayorista-content">
        <header className="mayorista-header">
          <h1 className="mayorista-title">{texts.title}</h1>
          <h2 className="mayorista-subtitle">{texts.subtitle}</h2>
          <p className="mayorista-intro">{texts.paragraph}</p>
        </header>

        <div className="mayorista-grid">
          {/* Left Column: Image */}
          <div className="mayorista-image-container">
            <img src="/mayoristas-hero.jpg" alt="Pikanditas Wholesale Bags" className="mayorista-hero-img" />
          </div>

          {/* Right Column: Math & Steps */}
          <div className="mayorista-info-panel">
            <div className="math-box glass-panel">
              <h3 style={{ color: 'var(--color-secondary)' }}>{texts.mathTitle}</h3>
              <div className="math-compare" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <div className="math-item buy" style={{ width: '100%', background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.1)' }}>
                  <span className="price text-gradient" style={{ fontSize: '3.5rem' }}>{texts.profitHighlight}</span>
                  <span className="label" style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{texts.profitLabel}</span>
                </div>
              </div>
              <div className="math-profit" style={{ marginTop: '1rem', color: 'var(--color-text-primary)', background: 'transparent', border: 'none', padding: '0.5rem 0' }}>
                {texts.profitText}
              </div>
            </div>

            <div className="steps-box glass-panel">
              <h3>{texts.stepsTitle}</h3>
              <div className="steps-list">
                {texts.steps.map((step, idx) => (
                  <div key={idx} className="step-item">
                    <div className="step-icon">{step.icon}</div>
                    <div className="step-text">
                      <strong>{step.title}</strong>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mayorista-ctas">
              <Link to="/seller" className="btn btn-primary btn-lg btn-jiggle">
                {texts.joinBtn}
              </Link>
              <a href="https://wa.me/9543388332?text=Hola, quiero unirme al programa de Mayoristas" target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
                {texts.contactBtn}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
