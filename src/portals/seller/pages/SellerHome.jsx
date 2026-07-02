import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import './SellerHome.css'

export default function SellerHome() {
  const { user } = useAuthStore()
  const [showQR, setShowQR] = useState(false)

  // Fetch Seller Profile
  const { data: profile } = useQuery({
    queryKey: ['seller-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
      return data
    },
    enabled: !!user?.id
  })

  // Fetch Pika-Cast Broadcasts
  const { data: broadcasts = [] } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: async () => {
      const { data } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(3)
      return data || []
    }
  })

  // Fetch Agenda (Upcoming Visits)
  const { data: agenda = [] } = useQuery({
    queryKey: ['seller-agenda', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('stores')
        .select('id, name, next_visit_date, agreements(type)')
        .eq('assigned_seller', user?.id)
        .not('next_visit_date', 'is', null)
        .order('next_visit_date', { ascending: true })
      
      return data || []
    },
    enabled: !!user?.id
  })

  const name = profile?.name || user?.user_metadata?.name || user?.phone || 'Vendedor'
  
  // Gamification Logic
  const totalSales = profile?.total_sales_lifetime || 0
  const monthSales = profile?.total_sales_month || 0
  const monthlyGoal = profile?.monthly_goal || 1000

  let tier = 'Semilla 🌱'
  let nextTierSales = 500
  if (totalSales >= 2000) {
    tier = 'Distribuidor 🏆'
    nextTierSales = 5000
  } else if (totalSales >= 500) {
    tier = 'Pro 🌶️'
    nextTierSales = 2000
  }

  const tierProgress = Math.min((totalSales / nextTierSales) * 100, 100)
  const monthProgress = Math.min((monthSales / monthlyGoal) * 100, 100)

  return (
    <div className="seller-home">
      {/* ── Greeting ── */}
      <section className="seller-greeting animate-float-in">
        <div className="greeting-left">
          <h1 style={{color: 'white'}}>¡Hola, {name}! 🐻</h1>
          <p className="greeting-role" style={{color: 'rgba(255,255,255,0.8)'}}>Nivel: {tier}</p>
        </div>
        <div className="greeting-badge" onClick={() => setShowQR(true)} style={{cursor: 'pointer'}}>
          <span className="tier-badge" style={{background: 'white', color: 'var(--color-primary)'}}>
            📱 Mi QR
          </span>
        </div>
      </section>

      {/* ── QR Modal ── */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card animate-float-in" style={{ padding: '2rem', textAlign: 'center', maxWidth: 300 }} onClick={e => e.stopPropagation()}>
            <h2>Tu código QR</h2>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>Muestra este código a las tienditas para registro rápido.</p>
            <div style={{ background: 'white', padding: '1rem', borderRadius: 8, display: 'inline-block' }}>
              <QRCodeSVG value={`https://pikanditas.com/registro-tienda?vendedor=${user?.id}`} size={200} />
            </div>
            <button className="btn btn-secondary btn-full" style={{ marginTop: '1rem' }} onClick={() => setShowQR(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* ── Gamification: Monthly Goal ── */}
      <section className="seller-section delay-1">
        <h2 className="seller-section-title">🎯 Meta Mensual</h2>
        <div className="commission-card card">
          <div className="commission-amount">
            <span className="commission-value">{monthSales}</span>
            <span className="commission-label">de {monthlyGoal} bolsas este mes</span>
          </div>
          <div className="commission-bar-bg" style={{ height: 12, borderRadius: 6, background: 'var(--color-border)' }}>
            <div className="commission-bar-fill" style={{ width: `${monthProgress}%`, height: '100%', borderRadius: 6, background: 'var(--color-primary)', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </section>

      {/* ── Gamification: Lifetime Tier ── */}
      <section className="seller-section delay-2">
        <h2 className="seller-section-title">⭐ Tu Nivel ({tier})</h2>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span>Total Histórico: {totalSales} bolsas</span>
            <span>Siguiente nivel: {nextTierSales}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--color-border)', width: '100%' }}>
            <div style={{ width: `${tierProgress}%`, height: '100%', borderRadius: 4, background: 'var(--color-warning)' }} />
          </div>
        </div>
      </section>

      {/* ── Pika-Cast (Bulletin Board) ── */}
      <section className="seller-section delay-3">
        <h2 className="seller-section-title">📢 Pika-Cast (Avisos)</h2>
        <div className="pika-cast-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {broadcasts.length === 0 ? (
            <p className="text-muted">No hay avisos nuevos por ahora.</p>
          ) : (
            broadcasts.map(b => (
              <div key={b.id} className="card" style={{ borderLeft: b.priority === 'high' ? '4px solid var(--color-danger)' : '4px solid var(--color-primary)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>
                  {b.priority === 'high' && '🚨 '} {b.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{b.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="seller-section delay-1">
        <h2 className="seller-section-title">Acciones rápidas</h2>
        <div className="seller-quick-actions">
          <Link to="../nueva-tienda" className="sqa-btn">
            <span>🏪</span>
            <span>Nueva tienda</span>
          </Link>
          <Link to="../acuerdo" className="sqa-btn">
            <span>📄</span>
            <span>Crear acuerdo</span>
          </Link>
          <Link to="../compras" className="sqa-btn">
            <span>📦</span>
            <span>Resurtido</span>
          </Link>
          <Link to="../cortes" className="sqa-btn">
            <span>💰</span>
            <span>Mis Cortes</span>
          </Link>
          <Link to="../panico" className="sqa-btn sqa-panic">
            <span>🚨</span>
            <span>Pánico</span>
          </Link>
        </div>
      </section>

      {/* ── CRM Agenda ── */}
      <section className="seller-section delay-2">
        <h2 className="seller-section-title">📅 Mi Agenda</h2>
        {agenda.length === 0 ? (
          <p className="text-muted">No tienes visitas programadas aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {agenda.map(store => {
              const visitDate = new Date(store.next_visit_date)
              const today = new Date()
              const diffTime = visitDate - today
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              
              let statusColor = 'var(--color-success)'
              let statusText = `En ${diffDays} días`
              
              if (diffDays < 0) {
                statusColor = 'var(--color-danger)'
                statusText = `Atrasada (${Math.abs(diffDays)} días)`
              } else if (diffDays === 0) {
                statusColor = 'var(--color-warning)'
                statusText = 'Hoy'
              }

              return (
                <div key={store.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderLeft: `4px solid ${statusColor}` }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.2rem 0' }}>{store.name}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: statusColor, fontWeight: 'bold' }}>{statusText}</span>
                      <span className="text-muted">• {store.agreements?.[0]?.type === 'consignacion' ? 'Consignación' : 'Venta Directa'}</span>
                    </div>
                  </div>
                  <Link to={`../cortes?storeId=${store.id}`} className="btn btn-sm btn-primary">
                    Ir →
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <footer className="portal-footer" style={{ margin: 'var(--space-8) 0 0' }}>
        pikanditas.com · 🌶️ Pika la vida
        <div className="powered-by">Powered by Jonla Agencia</div>
      </footer>
    </div>
  )
}
