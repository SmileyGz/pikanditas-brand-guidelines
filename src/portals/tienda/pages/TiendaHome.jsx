import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import '../../seller/pages/SellerHome.css'

export default function TiendaHome() {
  const { user } = useAuthStore()

  // Fetch store data from Supabase
  const { data: store, isLoading } = useQuery({
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

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>

  if (!store) {
    return (
      <div className="seller-home" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: 'var(--space-6)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }} className="animate-jiggle">🐻</div>
        <h2>¡Bienvenido a Pikanditas B2B!</h2>
        <p className="text-muted" style={{ maxWidth: 400, marginTop: '1rem' }}>
          Tu cuenta ha sido creada exitosamente. Estamos en proceso de vincularla con tu tiendita física. Por favor, comunícate con tu vendedor o con soporte para que activen tu panel de control.
        </p>
      </div>
    )
  }

  return (
    <div className="seller-home">
      {/* ── Greeting ── */}
      <section className="seller-greeting animate-float-in">
        <div className="greeting-left">
          <h1>¡Hola, {store?.owner_name}! 🐻</h1>
          <p className="greeting-role">{store?.name}</p>
        </div>
        <div className="greeting-badge">
          <span className="tier-badge" style={{ background: 'var(--color-secondary)', color: 'white' }}>
            🏪 Punto de Venta
          </span>
        </div>
      </section>

      {/* ── Dashboard Cards ── */}
      <section className="seller-section">
        <div className="kpi-grid-seller">
          <div className="kpi-card animate-float-in">
            <div className="kpi-icon">📅</div>
            <div className="kpi-label">Próxima Visita</div>
            <div className="kpi-value" style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }}>
              {store?.visit_day || 'Pendiente'}
            </div>
            <div className="kpi-target">Por tu vendedor asignado</div>
          </div>

          <div className="kpi-card animate-float-in delay-1">
            <div className="kpi-icon">💲</div>
            <div className="kpi-label">Tu Precio Actual</div>
            <div className="kpi-value" style={{ color: 'var(--color-success)' }}>
              {store?.tier === 'distributor_10' ? '$10.00' : '$12.00'} MXN
            </div>
            <div className="kpi-target">Véndelas a $20.00 (Ganancia $8.00)</div>
          </div>
        </div>
      </section>

      {/* ── Progress to Next Tier ── */}
      <section className="seller-section animate-float-in delay-2">
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Nivel de Tiendita</span>
            <span style={{ color: 'var(--color-primary)' }}>{store?.bags_sold_this_week || 0} / 50 bolsas</span>
          </h3>
          <div style={{ width: '100%', background: 'var(--color-border)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${store?.sales_progress || 0}%`, background: 'var(--color-primary)', height: '100%', transition: 'width 1s ease' }} />
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            ¡Vende <strong>{store?.bags_for_next_tier || 0} bolsitas más</strong> esta semana para bajar tu precio de compra a <strong>$10.00 MXN</strong>!
          </p>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="seller-section">
        <h2 className="seller-section-title">Acciones Rápidas</h2>
        <div className="seller-quick-actions">
          <Link to="../pedidos" className="sqa-btn">
            <span>📦</span>
            <span>Ver Pedidos</span>
          </Link>
          <Link to="../acuerdo" className="sqa-btn">
            <span>📄</span>
            <span>Mi Acuerdo</span>
          </Link>
          <button onClick={() => window.open('https://wa.me/9543388332?text=¡Hola!%20Necesito%20ayuda%20con%20mi%20tiendita', '_blank')} className="sqa-btn">
            <span>💬</span>
            <span>Soporte</span>
          </button>
          <Link to="../panico" className="sqa-btn sqa-panic">
            <span>🚨</span>
            <span>Urgencia</span>
          </Link>
        </div>
      </section>

      <footer className="portal-footer" style={{ margin: 'var(--space-8) 0 0' }}>
        pikanditas.com · 🌶️ Pika la vida
        <div className="powered-by">Powered by Jonla Agencia</div>
      </footer>
    </div>
  )
}
