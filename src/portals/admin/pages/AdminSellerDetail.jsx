import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import SellerGoalModal from '../components/SellerGoalModal'

export default function AdminSellerDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [showGoalModal, setShowGoalModal] = useState(false)

  const { data: seller, isLoading } = useQuery({
    queryKey: ['seller-detail', id],
    queryFn: async () => {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (profileErr) throw profileErr

      // First fetch assigned stores so we can use their IDs
      const storesRes = await supabase.from('stores').select('*').eq('assigned_seller', id)
      const assignedStoreIds = storesRes.data?.length ? storesRes.data.map(s => s.id).join(',') : '00000000-0000-0000-0000-000000000000'

      // Then fetch the rest of the timeline data
      const [visitsRes, consignmentsRes, agreementsRes] = await Promise.all([
        supabase.from('visits').select('*, store:stores(name)').eq('seller_id', id),
        supabase.from('consignments').select('*, store:stores(name)').filter('store_id', 'in', `(${assignedStoreIds})`),
        supabase.from('agreements').select('*, store:stores(name)').eq('signed_by_seller', id)
      ])

      const timeline = []
      visitsRes.data?.forEach(v => timeline.push({
        date: new Date(v.created_at), title: 'Visita de Ruta', desc: `Cliente: ${v.store?.name || '?'} | Notas: ${v.notes || ''}`, icon: '📍', color: 'badge-neutral'
      }))
      agreementsRes.data?.forEach(a => timeline.push({
        date: new Date(a.created_at), title: 'Acuerdo Firmado', desc: `Cliente: ${a.store?.name || '?'} | Tipo: ${a.type}`, icon: '📄', color: 'badge-info'
      }))

      timeline.sort((a, b) => b.date - a.date)

      return {
        ...profileData,
        assigned_stores: storesRes.data || [],
        timeline
      }
    },
    enabled: !!id
  })

  // We fetch unassigned stores to allow the admin to assign them
  const { data: allStores = [] } = useQuery({
    queryKey: ['all-stores-light'],
    queryFn: async () => {
      const { data } = await supabase.from('stores').select('id, name, assigned_seller').order('name')
      return data || []
    }
  })

  const getTier = (sales) => {
    if (sales >= 2000) return { label: 'Distribuidor 🏆', color: 'badge-warning' }
    if (sales >= 500) return { label: 'Pro 🌶️', color: 'badge-danger' }
    return { label: 'Semilla 🌱', color: 'badge-success' }
  }

  const handleAssignStore = async (storeId) => {
    if (!storeId) return
    await supabase.from('stores').update({ assigned_seller: id }).eq('id', storeId)
    queryClient.invalidateQueries(['seller-detail', id])
    queryClient.invalidateQueries(['all-stores-light'])
  }

  const handleToggleSellerType = async () => {
    const newType = seller.seller_type === 'inhouse' ? 'externo' : 'inhouse'
    if (!window.confirm(`¿Cambiar perfil a ${newType.toUpperCase()}?`)) return
    
    await supabase.from('profiles').update({ seller_type: newType }).eq('id', id)
    queryClient.invalidateQueries(['seller-detail', id])
  }

  const handleRemoveStore = async (storeId) => {
    await supabase.from('stores').update({ assigned_seller: null }).eq('id', storeId)
    queryClient.invalidateQueries(['seller-detail', id])
    queryClient.invalidateQueries(['all-stores-light'])
  }

  const handleRemoveSeller = async () => {
    if (!window.confirm('¿Estás seguro de dar de baja a este vendedor? Ya no tendrá acceso al portal y se desasignarán todas sus tiendas.')) return
    
    // Unassign all their stores first
    await supabase.from('stores').update({ assigned_seller: null }).eq('assigned_seller', id)
    // Demote their role to 'user' so they no longer appear as sellers
    await supabase.from('profiles').update({ role: 'user' }).eq('id', id)
    
    navigate('/admin/vendedores')
  }

  if (isLoading) return <div className="admin-page"><p>Cargando expediente...</p></div>
  if (!seller) return <div className="admin-page"><p>No se encontró el vendedor.</p></div>

  const tier = getTier(seller.total_sales_lifetime || 0)
  const monthSales = seller.total_sales_month || 0
  const goal = seller.monthly_goal || 1000
  const progress = Math.min((monthSales / goal) * 100, 100)

  // Unassigned stores available to be added
  const availableStores = allStores.filter(s => s.assigned_seller !== id)

  return (
    <div className="admin-page">
      <header className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">
            <Link to="/admin/vendedores" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '0.5rem' }}>←</Link>
            {seller.name || seller.phone}
          </h1>
          <p className="admin-page-subtitle">Expediente del Vendedor</p>
        </div>
        <button className="btn btn-ghost" style={{ color: 'var(--color-danger)' }} onClick={handleRemoveSeller}>
          🗑️ Dar de Baja
        </button>
      </header>

      {/* Main Info Card */}
      <div className="card animate-float-in" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Teléfono</p>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>📞 {seller.phone}</p>
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span>Tipo Operativo</span>
              <button className="btn btn-ghost" style={{ padding: 0, fontSize: '0.8rem', height: 'auto', minHeight: 0 }} onClick={handleToggleSellerType}>Cambiar</button>
            </p>
            <p style={{ marginTop: 4 }}>
              <span className={`badge ${seller.seller_type === 'inhouse' ? 'badge-primary' : 'badge-neutral'}`}>
                {seller.seller_type === 'inhouse' ? 'In-house (Inventario Móvil)' : 'Externo (Mayorista)'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Gamificación</p>
            <p style={{ marginTop: 4 }}><span className={`badge ${tier.color}`}>{tier.label}</span></p>
          </div>
          <div style={{ width: 250 }}>
            <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
              <span>Progreso del Mes</span>
              <button className="btn btn-ghost" style={{ padding: 0, fontSize: '0.8rem', height: 'auto', minHeight: 0 }} onClick={() => setShowGoalModal(true)}>Editar Meta</button>
            </p>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: 4 }}>{monthSales} / {goal} bolsas</div>
            <div style={{ height: 6, background: '#eee', borderRadius: 3, marginTop: 4 }}>
              <div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%`, borderRadius: 3 }} />
            </div>
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Ventas Históricas</p>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', textAlign: 'right' }}>{seller.total_sales_lifetime || 0}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* LEFT: Assigned Route (Stores) */}
        <div className="card animate-float-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ margin: 0 }}>📍 Mi Ruta Asignada</h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <select id="store-select" className="input-field" style={{ flex: 1, padding: '0.4rem 0.8rem' }} defaultValue="">
              <option value="" disabled>Selecciona una tienda para asignarle...</option>
              {availableStores.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.assigned_seller ? '(Robar de otro vendedor)' : ''}</option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              const val = document.getElementById('store-select').value;
              handleAssignStore(val)
            }}>
              Añadir
            </button>
          </div>

          {seller.assigned_stores.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '1rem 0' }}>No tiene tiendas asignadas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {seller.assigned_stores.map(store => (
                <div key={store.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-admin)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <strong><Link to={`/admin/tiendas/${store.id}`}>{store.name}</Link></strong>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{store.zone || 'Sin zona'}</div>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', height: 'auto', minHeight: 0, color: 'var(--color-danger)' }} onClick={() => handleRemoveStore(store.id)}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Activity Timeline */}
        <div className="card animate-float-in" style={{ animationDelay: '0.2s' }}>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>Línea de Tiempo (Actividad)</h2>
          {seller.timeline.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No hay actividad registrada aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {seller.timeline.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.2rem', background: 'var(--color-bg-admin)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {event.icon}
                  </div>
                  <div style={{ flex: 1, borderBottom: i === seller.timeline.length - 1 ? 'none' : '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{event.title}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {event.date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 2 }}>{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showGoalModal && <SellerGoalModal seller={seller} onClose={() => setShowGoalModal(false)} />}
    </div>
  )
}
