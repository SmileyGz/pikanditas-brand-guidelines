import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import StoreFormModal from '../components/StoreFormModal'
import SaleReceiptModal from '../components/SaleReceiptModal'
import AgreementModal from '../components/AgreementModal'

export default function AdminStoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: store, isLoading } = useQuery({
    queryKey: ['store-detail', id],
    queryFn: async () => {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select(`
          *,
          assigned_seller:profiles!stores_assigned_seller_fkey ( name, phone )
        `)
        .eq('id', id)
        .single()

      if (storeError) throw storeError

      // Fetch all related timeline events in parallel
      const [agreementsRes, consignmentsRes, visitsRes, panicsRes] = await Promise.all([
        supabase.from('agreements').select('*, profiles(name)').eq('store_id', id),
        supabase.from('consignments').select('*').eq('store_id', id),
        supabase.from('visits').select('*').eq('store_id', id),
        supabase.from('panic_events').select('*').eq('store_id', id)
      ])

      // Compile the timeline
      const timeline = []
      
      agreementsRes.data?.forEach(a => timeline.push({
        type: 'agreement', date: new Date(a.created_at), title: 'Acuerdo Firmado',
        desc: `Cerrado por: ${a.profiles?.name || 'Vendedor'}\nTipo: ${a.type === 'consignacion' ? 'Consignación' : 'Contado'} | Estado: ${a.status}`, icon: '📄', color: 'badge-info'
      }))
      
      consignmentsRes.data?.forEach(c => timeline.push({
        type: 'consignment', date: new Date(c.created_at), title: 'Consignación Registrada',
        desc: `Entregado: ${c.stock_delivered} bolsas | Restante: ${c.stock_remaining || '?' }`, icon: '📦', color: 'badge-success'
      }))
      
      visitsRes.data?.forEach(v => timeline.push({
        type: 'visit', date: new Date(v.created_at), title: 'Visita de Ruta',
        desc: `Tipo: ${v.visit_type || 'Visita'} | Notas: ${v.notes || 'Sin notas'}`, icon: '📍', color: 'badge-neutral'
      }))
      
      panicsRes.data?.forEach(p => timeline.push({
        type: 'panic', date: new Date(p.created_at), title: 'Alerta de Pánico',
        desc: `Motivo: ${p.reason} | Estado: ${p.status}`, icon: '🚨', color: 'badge-danger'
      }))

      // Sort timeline descending
      timeline.sort((a, b) => b.date - a.date)

      return {
        ...storeData,
        timeline,
        activeConsignment: consignmentsRes.data?.find(c => c.status === 'active')
      }
    },
    enabled: !!id
  })

  if (isLoading) return <div className="admin-page"><p>Cargando perfil del cliente...</p></div>
  if (!store) return <div className="admin-page"><p>No se encontró el cliente.</p></div>

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas ELIMINAR la tienda "${store.name}" y todo su historial de visitas, pánicos y acuerdos? Esta acción no se puede deshacer.`)) return
    
    setDeleting(true)
    try {
      const { error } = await supabase.from('stores').delete().eq('id', store.id)
      if (error) throw error
      
      queryClient.invalidateQueries(['admin-stores'])
      navigate('/admin/tiendas')
    } catch (err) {
      console.error(err)
      alert('Error al borrar la tienda: ' + err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">
            <Link to="/admin/tiendas" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '0.5rem' }}>←</Link>
            {store.name}
          </h1>
          <p className="admin-page-subtitle">Perfil del Cliente CRM</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(true)}>
            ✏️ Editar Perfil
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Borrando...' : '🗑️ Borrar Tienda'}
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* LEFT/CENTER: Client Info & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Main Info Card */}
          <div className="card animate-float-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Encargado</p>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{store.owner_name || 'Desconocido'}</p>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>📞 {store.phone || 'Sin número'}</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Nivel de Cliente</p>
                <p style={{ marginTop: 4 }}><span className="badge badge-success">{store.tier.replace('tiendita_', '$').replace('distributor_', '$')}</span></p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Zona & Visita</p>
                <p style={{ fontWeight: 600 }}>{store.zone || 'Sin zona'}</p>
                <p className="text-muted">Día: {store.visit_day || 'No asignado'}</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Vendedor Asignado</p>
                <p style={{ fontWeight: 600 }}>{store.assigned_seller?.name || 'Sin asignar'}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card animate-float-in" style={{ animationDelay: '0.1s' }}>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>Línea de Tiempo del Cliente</h2>
            {store.timeline.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No hay historial registrado aún.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {store.timeline.map((event, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.5rem', background: 'var(--color-bg-admin)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {event.icon}
                    </div>
                    <div style={{ flex: 1, borderBottom: i === store.timeline.length - 1 ? 'none' : '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700 }}>{event.title}</span>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {event.date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: 4, whiteSpace: 'pre-wrap' }}>{event.desc}</p>
                      <span className={`badge ${event.color}`} style={{ marginTop: 8 }}>{event.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Financials & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card animate-float-in" style={{ animationDelay: '0.2s', borderTop: '4px solid var(--color-primary)' }}>
            <h3>Estado Financiero</h3>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {store.activeConsignment ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Consignación</span>
                    <span className="badge badge-warning">Activa</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Entregadas</span>
                    <strong>{store.activeConsignment.stock_delivered} bolsas</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Última revisión</span>
                    <strong>{store.activeConsignment.last_review_date ? new Date(store.activeConsignment.last_review_date).toLocaleDateString() : 'Pendiente'}</strong>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p className="text-muted">No hay deuda activa.</p>
                  <span className="badge badge-success">Sano</span>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => setShowSaleModal(true)} className="btn btn-success btn-sm btn-full" style={{ background: 'var(--color-success)', color: 'white' }}>💰 Registrar Venta de Contado</button>
              <Link to="/admin/visitas" className="btn btn-primary btn-sm btn-full">📦 Registrar Revisión de Consigna</Link>
              <button onClick={() => setShowAgreementModal(true)} className="btn btn-ghost btn-sm btn-full">📄 Crear Nuevo Acuerdo</button>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && <StoreFormModal store={store} onClose={() => setShowEditModal(false)} />}
      {showSaleModal && <SaleReceiptModal preselectedStoreId={store.id} onClose={() => setShowSaleModal(false)} />}
      {showAgreementModal && <AgreementModal preselectedStoreId={store.id} onClose={() => setShowAgreementModal(false)} />}
    </div>
  )
}
