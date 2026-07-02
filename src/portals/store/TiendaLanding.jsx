import React from 'react'
import { Link } from 'react-router-dom'
import { useLangStore } from '../../store/langStore'
// We reuse the Mayorista CSS to keep the B2B funnels cohesive and share the immersive gradient
import './SellerLanding.css'

export default function TiendaLanding() {
  const { lang } = useLangStore()

  const t = {
    es: {
      title: 'Pikanditas en tu Tiendita 🏪',
      subtitle: '¡Vende rotación, no dulces!',
      paragraph: 'Aumenta tus ventas diarias con el snack favorito de Cancún. Te entregamos el producto directo en tu mostrador con cero riesgo para ti.',
      valueTitle: 'Cero Riesgo, Alta Ganancia 💸',
      valueProp1: 'Cero Inversión en Muebles',
      valueProp1Desc: 'El exhibidor va por nuestra cuenta.',
      valueProp2: 'Alta Rentabilidad',
      valueProp2Desc: 'Excelente margen en un producto que se vende solo.',
      stepsTitle: '¿Cómo funciona?',
      steps: [
        { icon: '🏪', title: '1. Exhibidor Gratis', desc: 'Te prestamos la icónica tira roja exhibidora a consignación para colocar en tu mostrador o pared.' },
        { icon: '🚚', title: '2. Entrega Directa', desc: 'Olvídate de ir a surtir. Nosotros pasamos a tu negocio a rellenar el producto regularmente.' },
        { icon: '💸', title: '3. Alta Rotación', desc: 'Un producto con excelente margen y venta rápida. ¡Gana dinero todos los días!' }
      ],
      joinBtn: 'Iniciar Sesión Tiendita',
      contactBtn: '¡Quiero mi Exhibidor!'
    },
    en: {
      title: 'Pikanditas in your Store 🏪',
      subtitle: 'Sell rotation, not candy!',
      paragraph: 'Increase your daily sales with Cancún\'s favorite snack. We deliver the product right to your counter with zero risk to you.',
      valueTitle: 'Zero Risk, High Profit 💸',
      valueProp1: 'Zero Investment in Displays',
      valueProp1Desc: 'The display rack is completely on us.',
      valueProp2: 'High Profitability',
      valueProp2Desc: 'Excellent margin on a product that sells itself.',
      stepsTitle: 'How it works:',
      steps: [
        { icon: '🏪', title: '1. Free Display', desc: 'We lend you the iconic red display strip on consignment for your counter or wall.' },
        { icon: '🚚', title: '2. Direct Delivery', desc: 'Forget about going to the wholesaler. We stop by your store to restock the product regularly.' },
        { icon: '💸', title: '3. High Turnover', desc: 'A product with excellent margin and fast sales. Make money every day!' }
      ],
      joinBtn: 'Retail Login',
      contactBtn: 'I want my Display!'
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
          <h2 className="mayorista-subtitle" style={{ color: 'var(--color-secondary)' }}>{texts.subtitle}</h2>
          <p className="mayorista-intro">{texts.paragraph}</p>
        </header>

        <div className="mayorista-grid">
          {/* Left Column: Image */}
          <div className="mayorista-image-container">
            <img src="/tienditas-hero.jpg" alt="Pikanditas Tiendita Displays" className="mayorista-hero-img" />
          </div>

          {/* Right Column: Value Prop & Steps */}
          <div className="mayorista-info-panel">
            <div className="math-box glass-panel">
              <h3 style={{ color: 'var(--color-secondary)' }}>{texts.valueTitle}</h3>
              <div className="math-compare" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <div className="math-item buy" style={{ width: '100%' }}>
                  <span className="price text-gradient" style={{ fontSize: '1.5rem' }}>{texts.valueProp1}</span>
                  <span className="label">{texts.valueProp1Desc}</span>
                </div>
                <div className="math-item sell" style={{ width: '100%' }}>
                  <span className="price text-gradient-secondary" style={{ fontSize: '1.5rem' }}>{texts.valueProp2}</span>
                  <span className="label">{texts.valueProp2Desc}</span>
                </div>
              </div>
            </div>

            <div className="steps-box glass-panel">
              <h3>{texts.stepsTitle}</h3>
              <div className="steps-list">
                {texts.steps.map((step, idx) => (
                  <div key={idx} className="step-item">
                    <div className="step-icon">{step.icon}</div>
                    <div className="step-text">
                      <strong style={{ color: 'var(--color-secondary)' }}>{step.title}</strong>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mayorista-ctas">
              <a href="https://wa.me/9543388332?text=Hola, quiero un exhibidor de Pikanditas para mi tiendita" target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg btn-jiggle">
                {texts.contactBtn}
              </a>
              <Link to="/tienda" className="btn btn-primary btn-lg">
                {texts.joinBtn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
