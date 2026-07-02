import React, { useState, useEffect, useRef } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { useStock } from '../../hooks/useStock'
import { Link } from 'react-router-dom'
import { useLangStore } from '../../store/langStore'
import './StoreLanding.css'

const BUNDLES = {
  es: [
    { id: '1',  qty: 1,  label: '1 Bolsa',        emoji: '🐻',           price: 20,  originalPrice: null, badge: null,         sub: 'Pruébalo',       unitPrice: 20 },
    { id: '6',  qty: 6,  label: '6 Bolsas',       emoji: '🐻🐻🐻',       price: 120, originalPrice: null, badge: '🌶️ Popular',  sub: 'Six Pack',       unitPrice: 20 },
    { id: '12', qty: 12, label: '12 Bolsas',      emoji: '🐻🐻🐻🐻🐻',   price: 216, originalPrice: 240,  badge: '-10% 💥',     sub: 'Caja Completa',  unitPrice: 18 },
    { id: '24', qty: 24, label: '24 Bolsas',      emoji: '🎉🎉🎉',       price: 432, originalPrice: 480,  badge: '-10% 🎊',     sub: 'Party Pack',     unitPrice: 18 },
  ],
  en: [
    { id: '1',  qty: 1,  label: '1 Bag',          emoji: '🐻',           price: 20,  originalPrice: null, badge: null,         sub: 'Taste It',       unitPrice: 20 },
    { id: '6',  qty: 6,  label: '6 Bags',         emoji: '🐻🐻🐻',       price: 120, originalPrice: null, badge: '🌶️ Popular',  sub: 'Six Pack',       unitPrice: 20 },
    { id: '12', qty: 12, label: '12 Bags',        emoji: '🐻🐻🐻🐻🐻',   price: 216, originalPrice: 240,  badge: '-10% 💥',     sub: 'Full Box',       unitPrice: 18 },
    { id: '24', qty: 24, label: '24 Bags',        emoji: '🎉🎉🎉',       price: 432, originalPrice: 480,  badge: '-10% 🎊',     sub: 'Party Pack',     unitPrice: 18 },
  ]
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function StoreLanding() {
  const { settings } = useSettings()
  const { data: stockData } = useStock()
  const availableStock = stockData?.availableStock || 0
  
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { lang } = useLangStore()

  const t = {
    es: {
      heroTitle: '¡Pika la vida! 🌶️',
      heroSub: 'Gomitas enchiladas artesanales · Hecho en Cancún 🌴',
      btnOrder: 'Pedir Ahora 🐻',
      btnMenu: 'Ver el Menú ↓',
      showcaseTitle: 'El Antojo Perfecto',
      showcaseSub: 'Dulce, ácido y picosito. Hecho a mano todos los días.',
      flavorSweet: 'Dulce',
      flavorSweetDesc: 'Gomita suave y jugosa',
      flavorSpicy: 'Picosito',
      flavorSpicyDesc: 'Chile en polvo especial',
      flavorSour: 'Frutal',
      flavorSourDesc: 'Toque de chamoy casero',
      bundlesTitle: '🛍️ Pide tus Pikanditas',
      bundlesSub: `Gomitas 60g · $${settings?.precio_publico || 20} c/u · Entrega en Cancún`,
      outOfStock: 'Agotado',
      checkoutName: 'Tu nombre (opcional)',
      checkoutEmail: 'Tu correo para confirmación ✉️',
      btnPay: '💳 Ir a Pagar con Mercado Pago',
      btnWa: '💬 Pídelo por WhatsApp',
      whereTitle: '¿Dónde nos encuentras? 📍',
      socialTitle: 'Lo que dicen de nosotros 💬',
      privacy: 'Aviso de Privacidad',
      terms: 'Términos y Condiciones',
      allergen: 'Aviso: Contiene gomitas de gelatina. Producto artesanal.',
      paymentWait: '⏳ Redirigiendo...'
    },
    en: {
      heroTitle: 'Spice up your life! 🌶️',
      heroSub: 'Artisanal spicy gummies · Made in Cancún 🌴',
      btnOrder: 'Order Now 🐻',
      btnMenu: 'View Menu ↓',
      showcaseTitle: 'The Perfect Craving',
      showcaseSub: 'Sweet, sour, and spicy. Handmade every day.',
      flavorSweet: 'Sweet',
      flavorSweetDesc: 'Soft, juicy gummy',
      flavorSpicy: 'Spicy',
      flavorSpicyDesc: 'Special chili powder blend',
      flavorSour: 'Fruity',
      flavorSourDesc: 'Touch of homemade chamoy',
      bundlesTitle: '🛍️ Get your Pikanditas',
      bundlesSub: `60g gummies · $${settings?.precio_publico || 20} MXN ea · Cancún Delivery`,
      outOfStock: 'Sold Out',
      checkoutName: 'Your name (optional)',
      checkoutEmail: 'Your email for confirmation ✉️',
      btnPay: '💳 Pay securely with Mercado Pago',
      btnWa: '💬 Order via WhatsApp',
      whereTitle: 'Where to find us 📍',
      socialTitle: 'What people are saying 💬',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      allergen: 'Notice: Contains gelatin gummies. Artisanal product.',
      paymentWait: '⏳ Redirecting...'
    }
  }

  const texts = t[lang]
  const currentBundles = BUNDLES[lang]

  // Check for payment return
  const paymentStatus = window.location.pathname.includes('exito') ? 'success'
    : window.location.pathname.includes('pendiente') ? 'pending'
    : window.location.pathname.includes('fallo') ? 'failed'
    : null

  const handleCheckout = async () => {
    if (!selected) { setError(lang === 'es' ? 'Por favor selecciona una cantidad 🌶️' : 'Please select a quantity 🌶️'); return }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(lang === 'es' ? 'Correo no válido' : 'Invalid email'); return }
    setLoading(true); setError(null)
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON) {
        // Dev mode: WhatsApp fallback
        const waNumber = settings?.telefono_soporte || '9543388332'
        const msg = encodeURIComponent(`Hola Pikanditas 🐻🌶️! Quiero pedir ${selected.qty} bolsa(s) ($${selected.price} MXN)${name ? ` — soy ${name}` : ''}`)
        window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank')
        setLoading(false); return
      }
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-mp-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` },
        body: JSON.stringify({ 
          items: [{
            id: selected.id,
            title: `Pikanditas 60g - ${selected.label}`,
            quantity: selected.qty,
            unit_price: selected.unitPrice || settings?.precio_publico || 20,
            currency_id: 'MXN'
          }],
          buyerInfo: { name: name || undefined, email: email || undefined }
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Error al iniciar el pago')
      window.location.href = import.meta.env.DEV ? data.sandbox_init_point : data.init_point
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const waLink = (msg) => `https://wa.me/${settings?.telefono_soporte || '9543388332'}?text=${encodeURIComponent(msg)}`

  return (
    <div className="store-root">
      
      {/* ── Section 1: Cinematic Hero (Split Layout) ── */}
      <header className="store-hero" style={{ paddingTop: '80px' }}>
        <div className="hero-container">
          <div className="hero-content-left">
            {/* The image already has the logo on the bag, so we don't need a huge logo above the text here, just the text */}
            <h1 className="hero-title text-gradient" style={{ textAlign: 'left' }}>
              {texts.heroTitle}
            </h1>
            <p className="hero-sub" style={{ textAlign: 'left', marginTop: '1rem', color: 'var(--color-text-primary)' }}>
              {texts.heroSub}
            </p>
            <div className="hero-actions" style={{ alignItems: 'flex-start' }}>
              <a href="#checkout" className="btn btn-primary btn-lg btn-full" onClick={(e) => { e.preventDefault(); document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' }); }}>
                {texts.btnOrder}
              </a>
              <a href="#bundles" className="btn btn-ghost btn-full" style={{ color: '#fff', opacity: 0.8 }} onClick={(e) => { e.preventDefault(); document.getElementById('bundles').scrollIntoView({ behavior: 'smooth' }); }}>
                {texts.btnMenu}
              </a>
            </div>
          </div>
          <div className="hero-image-right">
            <img src="/hero-new.jpg" alt="Pikanditas Explosión de Sabor" className="hero-product-image" />
          </div>
        </div>
      </header>

      {/* ── Payment Status Banner ── */}
      {paymentStatus && (
        <div style={{ maxWidth: '800px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
          {paymentStatus === 'success' && (
            <div className="payment-banner success glass-panel">
              <span className="animate-check-pop">🎉</span>
              <div>
                <strong>¡Pago confirmado!</strong>
                <p>Tu pedido está en camino. ¡Gracias por tu antojo! Recibirás confirmación pronto.</p>
              </div>
            </div>
          )}
          {paymentStatus === 'pending' && (
            <div className="payment-banner pending glass-panel">
              <span>⏳</span>
              <div>
                <strong>Pago pendiente</strong>
                <p>Si pagaste en OXXO, se confirmará en minutos. También puedes escribirnos al WhatsApp.</p>
              </div>
            </div>
          )}
          {paymentStatus === 'failed' && (
            <div className="payment-banner failed glass-panel">
              <span>❌</span>
              <div>
                <strong>Pago no completado</strong>
                <p>Intenta de nuevo o pídelo por WhatsApp.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section 2: Product Showcase ── */}
      <section className="store-section">
        <div className="section-header">
          <h2>{texts.showcaseTitle}</h2>
          <p>{texts.showcaseSub}</p>
        </div>
        <div className="showcase-grid">
          <div className="showcase-image-container">
            <img src="/product-antojo.png" alt="Pikanditas con salsa" className="showcase-image" />
          </div>
          <div className="showcase-details">
            <div className="detail-item glass-panel">
              <div className="detail-icon">🍬</div>
              <div className="detail-text">
                <h3>{texts.flavorSweet}</h3>
                <p>{texts.flavorSweetDesc}</p>
              </div>
            </div>
            <div className="detail-item glass-panel">
              <div className="detail-icon">🌶️</div>
              <div className="detail-text">
                <h3>{texts.flavorSpicy}</h3>
                <p>{texts.flavorSpicyDesc}</p>
              </div>
            </div>
            <div className="detail-item glass-panel">
              <div className="detail-icon">🍓</div>
              <div className="detail-text">
                <h3>{texts.flavorSour}</h3>
                <p>{texts.flavorSourDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Bundles ── */}
      <section id="bundles" className="store-section" style={{ background: 'var(--color-bg-seller)', borderRadius: 'var(--radius-xl)' }}>
        <div className="section-header">
          <h2>{texts.bundlesTitle}</h2>
          <p>{texts.bundlesSub}</p>
        </div>
        <div className="bundles-container">
          {currentBundles.map((b) => {
            const isOutOfStock = b.qty > availableStock
            // Use the flatlay or simple image for bundles just for some visual flair
            return (
              <div 
                key={b.id}
                className={`bundle-card ${selected?.id === b.id ? 'selected' : ''}`}
                onClick={() => !isOutOfStock && setSelected(b)}
                style={{ opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
              >
                {isOutOfStock && <div style={{position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'inherit', color:'var(--color-danger)', fontWeight:'bold', fontSize:'1.5rem', transform:'rotate(-10deg)'}}>{texts.outOfStock}</div>}
                {b.badge && !isOutOfStock && <div className="bundle-badge">{b.badge}</div>}
                
                <span className="bundle-emoji">{b.emoji}</span>
                <h3 className="bundle-name">{b.sub}</h3>
                <p className="bundle-qty">{b.label}</p>
                
                <div className="bundle-price-wrap">
                  <span className="bundle-price">${b.price}</span>
                  {b.originalPrice && <span className="bundle-original-price">${b.originalPrice}</span>}
                </div>
                <div className="bundle-unit-price">${b.unitPrice} MXN c/u</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Section 4: Checkout ── */}
      <section id="checkout" className="store-section checkout-section">
        <div className="checkout-box">
          {selected ? (
            <div className="order-summary">
              <div>
                <div className="order-summary-title">✅ {selected.sub}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{selected.label}</div>
              </div>
              <div className="order-summary-price">${selected.price} MXN</div>
            </div>
          ) : (
            <div className="order-summary" style={{ justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              👆 {lang === 'es' ? 'Selecciona un paquete arriba' : 'Select a package above'}
            </div>
          )}

          <div className="checkout-fields">
            <input
              className="input-field"
              type="text"
              placeholder={texts.checkoutName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="input-field"
              type="email"
              placeholder={texts.checkoutEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <div className="checkout-error">⚠️ {error}</div>}

          <button
            className={`btn btn-primary btn-lg btn-full ${loading ? 'loading' : ''}`}
            onClick={handleCheckout}
            disabled={loading || !selected}
          >
            {loading ? texts.paymentWait : texts.btnPay}
          </button>

          <div className="payment-methods">💳 🏪 📱 🏦</div>

          <a
            href={waLink(lang === 'es' 
              ? `Hola Pikanditas 🐻🌶️! Me interesa pedir${selected ? ` ${selected.qty} bolsa(s) ($${selected.price} MXN)` : ' las gomitas'}`
              : `Hi Pikanditas 🐻🌶️! I want to order${selected ? ` ${selected.qty} bag(s) ($${selected.price} MXN)` : ' some gummies'}`
            )}
            className="btn btn-whatsapp btn-lg btn-full"
            target="_blank" rel="noreferrer"
          >
            {texts.btnWa}
          </a>
        </div>
      </section>

      {/* ── Section 5: Where to Find Us ── */}
      <section className="store-section">
        <div className="section-header">
          <h2>{texts.whereTitle}</h2>
        </div>
        <div className="where-grid">
          <div className="where-card">
            <div className="where-icon">🏪</div>
            <h3>Tienditas</h3>
            <p>Encuéntranos en tu tiendita de la esquina favorita en Cancún.</p>
          </div>
          <div className="where-card">
            <div className="where-icon">🛵</div>
            <h3>Delivery</h3>
            <p>Pedidos directos con entrega el mismo día en Cancún.</p>
          </div>
          <div className="where-card">
            <div className="where-icon">🎓</div>
            <h3>Mayoristas</h3>
            <p>¿Quieres revender? Únete a nuestro programa de emprendedores.</p>
            <Link to="/seller" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>Saber más →</Link>
          </div>
        </div>
      </section>

      {/* ── Section 6: Social Proof (Cinematic Background) ── */}
      <section className="store-section" style={{ 
        background: '#111 url(/social-img.jpg) center center no-repeat', 
        backgroundSize: 'cover',
        position: 'relative',
        borderRadius: 'var(--radius-xl)', 
        marginBottom: '4rem', 
        padding: 'var(--space-16) var(--space-8)',
        overflow: 'hidden'
      }}>
        {/* Dark overlay to ensure text legibility without hiding the beautiful chamoy */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))', zIndex: 0 }} />

        <div className="section-header" style={{ position: 'relative', zIndex: 1, color: 'white', marginBottom: '4rem' }}>
          <h2 style={{ color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>{texts.socialTitle}</h2>
          <p style={{ color: '#ffb6c1', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>La familia Pikanditas sigue creciendo 🐻</p>
        </div>

        <div className="social-proof-grid" style={{ position: 'relative', zIndex: 1 }}>
          <div className="testimonial-card" style={{ 
            background: 'rgba(255,255,255,0.05)', 
            backdropFilter: 'blur(15px)', 
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white'
          }}>
            <div className="stars" style={{ color: '#ffb6c1' }}>★★★★★</div>
            <div className="quote" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)', color: '#ffffff', fontWeight: 600 }}>"El balance perfecto entre dulce y picosito. Se han vuelto mi snack favorito para ver series."</div>
            <div className="author" style={{ color: '#ffb6c1' }}>— @soymaria_cun</div>
          </div>
          
          <div className="testimonial-card" style={{ 
            background: 'rgba(255,255,255,0.05)', 
            backdropFilter: 'blur(15px)', 
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white'
          }}>
            <div className="stars" style={{ color: '#ffb6c1' }}>★★★★★</div>
            <div className="quote" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)', color: '#ffffff', fontWeight: 600 }}>"Las llevé a una fiesta y volaron en 10 minutos. Definitivamente voy a pedir el Party Pack la próxima vez."</div>
            <div className="author" style={{ color: '#ffb6c1' }}>— @alex.99</div>
          </div>
          
          <div className="testimonial-card" style={{ 
            background: 'rgba(255,255,255,0.05)', 
            backdropFilter: 'blur(15px)', 
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white'
          }}>
            <div className="stars" style={{ color: '#ffb6c1' }}>★★★★★</div>
            <div className="quote" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)', color: '#ffffff', fontWeight: 600 }}>"Me encanta que el chamoy es súper espeso y no sabe artificial. ¡Las mejores de Cancún!"</div>
            <div className="author" style={{ color: '#ffb6c1' }}>— @dany_reyes</div>
          </div>
        </div>
      </section>



      {/* ── WhatsApp FAB ── */}
      <a
        href={waLink('Hola Pikanditas 🐻🌶️, quiero pedir mis gomitas!')}
        className="whatsapp-fab no-nav"
        target="_blank" rel="noreferrer"
        title="Pídelo por WhatsApp"
      >
        💬
      </a>
    </div>
  )
}
