// Wrapper that renders the existing brand moodboard content
// The actual moodboard JSX stays here — App.jsx just routes to it
import React, { useState } from 'react'
import CostCalculator from '../../CostCalculator'

function BrandMoodboard() {
  const [activeTab, setActiveTab] = useState('brand')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex)
    alert(`¡Copiado ${hex} al portapapeles!`)
  }

  const handleUnlock = (e) => {
    e.preventDefault()
    if (password === 'pika2026' || password === '1234') setIsUnlocked(true)
    else alert('Contraseña incorrecta')
  }

  return (
    <div className="app-container" style={{ background: 'var(--color-bg-consumer)', minHeight: '100vh', padding: '120px 2rem 2rem' }}>
      <nav className="tabs-nav">
        <button className={`tab-btn ${activeTab === 'brand' ? 'active' : ''}`} onClick={() => setActiveTab('brand')}>
          Brand Guidelines
        </button>
        <button className={`tab-btn ${activeTab === 'costeo' ? 'active' : ''}`} onClick={() => setActiveTab('costeo')}>
          🔒 Costeo & Pricing
        </button>
      </nav>

      {activeTab === 'brand' && (
        <div className="moodboard brand-tab">
          <div className="card tagline-card tilt-left">
            <h2>Pika la vida</h2>
            <p>Dulce, picosito y delicioso. El antojo perfecto.</p>
            <p>Hecho en Cancún.</p>
          </div>
          <div className="card tilt-right polaroid">
            <div className="logo-container">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo de Pikanditas" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x400/FF0055/ffffff?text=Pikanditas' }} />
            </div>
            <p>Logo Oficial</p>
          </div>
          <div className="card tilt-right">
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>MISIÓN</h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>Crear momentos felices y sabrosos llevando gomitas enchiladas irresistibles a cada rincón.</p>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>VISIÓN</h3>
            <p style={{ fontSize: '0.95rem' }}>Ser la marca de gomitas enchiladas favorita en México, reconocida por su sabor único y personalidad vibrante.</p>
          </div>
          <div className="card tilt-left">
            <h3>Colores de la Marca</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Haz clic para copiar HEX</p>
            <div className="swatches">
              {[['#FF0055','Magenta Osito'],['#7ED321','Verde Letras'],['#FF9900','Naranja Dulce'],['#FF0000','Rojo Chile'],['#FFD6E0','Rosa Pastel'],['#2f3542','Texto Oscuro']].map(([hex, name]) => (
                <div key={hex} className="swatch" style={{ backgroundColor: hex }} onClick={() => copyToClipboard(hex)} title={name} />
              ))}
            </div>
          </div>
          <div className="card tilt-right">
            <h3>Personalidad</h3>
            <ul>
              <li className="neutral-check"><span><strong>Arquetipo:</strong> El Bufón · El Creador</span></li>
              <li className="neutral-check"><span><strong>Tono:</strong> Divertido, Juguetón, Amigable</span></li>
              <li className="neutral-check"><span><strong>Vibra:</strong> Local, Juvenil, Travieso</span></li>
              <li className="no-check"><span>Nunca agresivo, nunca vulgar</span></li>
            </ul>
          </div>
          <div className="card tilt-left tagline-card">
            <h3 style={{ marginBottom: '1rem' }}>Estrategia de Ventas</h3>
            <h2 style={{ fontSize: '1.5rem' }}>"Vende rotación. No dulces."</h2>
          </div>
        </div>
      )}

      {activeTab === 'costeo' && (
        <div className="moodboard costeo-tab">
          {!isUnlocked ? (
            <div className="card locked-card">
              <h3>🔒 Acceso Restringido</h3>
              <p>Información confidencial de costos y márgenes.</p>
              <form onSubmit={handleUnlock}>
                <input type="password" placeholder="Contraseña..." value={password} onChange={(e) => setPassword(e.target.value)} className="password-input" />
                <button type="submit" className="unlock-btn">Desbloquear</button>
              </form>
            </div>
          ) : <CostCalculator />}
        </div>
      )}

      <footer className="portal-footer">
        pikanditas.com · 954 3388 332 · @Pikanditasmx
        <div className="powered-by">Powered by Jonla Agencia</div>
      </footer>
    </div>
  )
}

export default BrandMoodboard
