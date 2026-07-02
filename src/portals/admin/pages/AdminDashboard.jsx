import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { Link } from 'react-router-dom'
import './AdminDashboard.css'

// ── Helpers ──────────────────────────────────────────────
function StatCard({ label, value, sub, target, icon, color }) {
  const pct = target ? (parseFloat(value) / target) * 100 : 100
  const status = !target ? '' : pct >= 100 ? 'on-target' : pct >= 80 ? 'at-risk' : 'critical'
  return (
    <div className={`stat-card ${status} animate-float-in`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {target && (
        <div className="stat-progress">
          <div className="stat-progress-bar" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────
export default function AdminDashboard() {
  // Summary queries — gracefully handle missing Supabase config
  const { data: storeCount = 0 } = useQuery({
    queryKey: ['count-stores'],
    queryFn: async () => {
      const { count } = await supabase.from('stores').select('*', { count: 'exact', head: true })
      return count ?? 0
    },
    enabled: !!import.meta.env.VITE_SUPABASE_URL,
    placeholderData: 3, // existing clients
  })

  const { data: consignActive = 0 } = useQuery({
    queryKey: ['count-consign-active'],
    queryFn: async () => {
      const { count } = await supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('status', 'active')
      return count ?? 0
    },
    enabled: !!import.meta.env.VITE_SUPABASE_URL,
    placeholderData: 0,
  })

  const { data: panicAlerts = 0 } = useQuery({
    queryKey: ['count-panic'],
    queryFn: async () => {
      const { count } = await supabase.from('panic_events').select('*', { count: 'exact', head: true }).eq('status', 'open')
      return count ?? 0
    },
    enabled: !!import.meta.env.VITE_SUPABASE_URL,
    placeholderData: 0,
  })

  const { data: pendingAgreements = 0 } = useQuery({
    queryKey: ['count-agreements-pending'],
    queryFn: async () => {
      const { count } = await supabase.from('agreements').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      return count ?? 0
    },
    enabled: !!import.meta.env.VITE_SUPABASE_URL,
    placeholderData: 0,
  })

  // Fetch 5 most recent stores
  const { data: recentStores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['recent-stores'],
    queryFn: async () => {
      const { data } = await supabase.from('stores')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      return data || []
    },
    enabled: !!import.meta.env.VITE_SUPABASE_URL,
  })

  const quickActions = [
    { icon: '🏪', label: 'Nueva Tienda', desc: 'Agregar cliente', to: '/admin/tiendas' },
    { icon: '📄', label: 'Nuevo Acuerdo', desc: 'Compra o consignación', to: '/admin/acuerdos' },
    { icon: '📦', label: 'Consignación', desc: 'Registrar entrega', to: '/admin/visitas' },
    { icon: '👤', label: 'Nuevo Vendedor', desc: 'Crear cuenta', to: '/admin/vendedores' },
  ]

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Dashboard 📊</h1>
        <p className="admin-page-subtitle">Resumen general de Pikanditas · {new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
      </header>

      {/* ── KPI Grid ── */}
      <div className="kpi-grid">
        <StatCard label="Tiendas activas" value={storeCount} sub="Clientes registrados" icon="🏪" />
        <StatCard label="Consignaciones activas" value={consignActive} sub="Pendientes de revisión" icon="📦" />
        <StatCard label="Acuerdos pendientes" value={pendingAgreements} sub="Sin firma" icon="📄" />
        <StatCard label="Alertas de pánico" value={panicAlerts} sub={panicAlerts > 0 ? '¡Atención requerida!' : 'Sin alertas'} icon="🚨" />
      </div>

      {/* ── Quick Actions ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Acciones rápidas</h2>
        <div className="quick-actions-grid">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="quick-action-card animate-float-in card-hover">
              <div className="qa-icon">{a.icon}</div>
              <div className="qa-label">{a.label}</div>
              <div className="qa-desc">{a.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Agreement Model Guide ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Tipos de acuerdo disponibles</h2>
        <div className="agreement-types-grid">
          <div className="agreement-type-card compra">
            <div className="at-header">
              <span className="at-icon">🤝</span>
              <h3>Compra Directa</h3>
            </div>
            <div className="at-rates">
              <div className="at-rate">
                <span className="rate-label">Tiendita</span>
                <span className="rate-price">$12 / bolsa</span>
              </div>
              <div className="at-rate">
                <span className="rate-label">Distribuidor</span>
                <span className="rate-price">$10 / bolsa</span>
              </div>
            </div>
            <p className="at-desc">La tienda paga al momento de la entrega o en términos acordados.</p>
            <Link to="/admin/acuerdos" className="btn btn-primary btn-sm">Crear acuerdo</Link>
          </div>

          <div className="agreement-type-card consig">
            <div className="at-header">
              <span className="at-icon">📋</span>
              <h3>Consignación</h3>
            </div>
            <div className="at-rates">
              <div className="at-rate">
                <span className="rate-label">Tasa</span>
                <span className="rate-price">$12 / vendido</span>
              </div>
              <div className="at-rate">
                <span className="rate-label">Revisión</span>
                <span className="rate-price">≤23 días</span>
              </div>
            </div>
            <p className="at-desc">La tienda recibe el producto y solo paga lo que vende en la revisión.</p>
            <Link to="/admin/acuerdos" className="btn btn-secondary btn-sm">Crear hoja</Link>
          </div>
        </div>
      </section>

      {/* ── Clientes existentes ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Clientes registrados</h2>
        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Tienda</th>
                <th>Encargado/a</th>
                <th>Día de visita</th>
                <th>Tasa</th>
                <th>Teléfono</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoadingStores && <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>Cargando clientes...</td></tr>}
              {!isLoadingStores && recentStores.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No hay clientes registrados aún.</td></tr>}
              {recentStores.map(store => (
                <tr key={store.id}>
                  <td><strong><Link to={`/admin/tiendas/${store.id}`}>{store.name}</Link></strong></td>
                  <td>{store.owner_name || '—'}</td>
                  <td>
                    {store.visit_day ? <span className="badge badge-info">{store.visit_day}</span> : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    {store.tier ? <span className="badge badge-success">{store.tier.replace('tiendita_', '$').replace('distributor_', '$')}</span> : '—'}
                  </td>
                  <td>
                    {store.phone ? <a href={`tel:${store.phone}`} className="phone-link">{store.phone}</a> : '—'}
                  </td>
                  <td>
                    {store.phone ? (
                      <a href={`https://wa.me/52${store.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hola! Soy de Pikanditas 🐻🌶️')}`} target="_blank" rel="noreferrer" className="wa-btn" title="WhatsApp">💬</a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link to="/admin/tiendas" className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-4)' }}>
          Ver todas las tiendas →
        </Link>
      </section>
    </div>
  )
}
