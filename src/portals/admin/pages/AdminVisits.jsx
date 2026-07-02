import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import VisitModal from '../components/VisitModal'

export default function AdminVisits() {
  const [viewMode, setViewMode] = useState('historico') // historico, agenda
  const [dateFilter, setDateFilter] = useState('all') // all, week, month, today
  const [showModal, setShowModal] = useState(false)

  // 1. Fetch Histórico de Visitas
  const { data: visits = [], isLoading: isLoadingVisits } = useQuery({
    queryKey: ['admin-visits-ledger', dateFilter],
    queryFn: async () => {
      let query = supabase.from('visits')
        .select(`
          id,
          created_at,
          visit_type,
          notes,
          location,
          profiles (name),
          stores (name)
        `)
        .order('created_at', { ascending: false })

      if (dateFilter !== 'all') {
        const now = new Date()
        let fromDate = new Date()
        if (dateFilter === 'today') {
          fromDate.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'week') {
          const day = fromDate.getDay() || 7
          if (day !== 1) fromDate.setHours(-24 * (day - 1))
          fromDate.setHours(0,0,0,0)
        } else if (dateFilter === 'month') {
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
        }
        query = query.gte('created_at', fromDate.toISOString())
      }

      const { data } = await query
      return data || []
    },
    enabled: viewMode === 'historico'
  })

  // 2. Fetch Agenda de Tiendas
  const { data: agenda = [], isLoading: isLoadingAgenda } = useQuery({
    queryKey: ['admin-agenda-global'],
    queryFn: async () => {
      const { data } = await supabase.from('stores')
        .select(`
          id, name, tier, assigned_seller, next_visit_date, 
          profiles:assigned_seller (name),
          agreements (type)
        `)
        .not('next_visit_date', 'is', null)
        .order('next_visit_date', { ascending: true })
      return data || []
    },
    enabled: viewMode === 'agenda'
  })

  return (
    <div className="admin-page">
      <header className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">📍 Libro Diario de Visitas</h1>
          <p className="admin-page-subtitle">Actividad en campo y Sello GPS de los vendedores</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Registrar Visita</button>
      </header>
      
      <div className="card animate-float-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface-hover)', padding: '0.25rem', borderRadius: 8 }}>
            <button 
              className={`btn btn-sm ${viewMode === 'historico' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setViewMode('historico')}
            >
              📖 Histórico
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'agenda' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setViewMode('agenda')}
            >
              📅 Agenda Global
            </button>
          </div>

          {viewMode === 'historico' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`btn btn-sm ${dateFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setDateFilter('all')}>Todo</button>
              <button className={`btn btn-sm ${dateFilter === 'month' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setDateFilter('month')}>Este Mes</button>
              <button className={`btn btn-sm ${dateFilter === 'week' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setDateFilter('week')}>Esta Sem.</button>
              <button className={`btn btn-sm ${dateFilter === 'today' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setDateFilter('today')}>Hoy</button>
            </div>
          )}
        </div>

        {viewMode === 'historico' ? (
          <div className="table-responsive">
            <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Vendedor</th>
                <th>Tienda</th>
                <th>Tipo de Visita</th>
                <th>Notas</th>
                <th style={{ textAlign: 'center' }}>Sello Mapa</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingVisits && <tr><td colSpan="6">Cargando...</td></tr>}
              {!isLoadingVisits && visits.length === 0 && (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No hay visitas registradas en este periodo.</td></tr>
              )}
              {visits.map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{new Date(v.created_at).toLocaleDateString('es-MX')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(v.created_at).toLocaleTimeString('es-MX')}</div>
                  </td>
                  <td>{v.profiles?.name || 'Vendedor'}</td>
                  <td><strong>{v.stores?.name || 'Desconocida'}</strong></td>
                  <td>
                    {v.visit_type === 'review_consignment' && <span className="badge badge-warning">Consigna</span>}
                    {v.visit_type === 'direct_sale' && <span className="badge badge-success">Venta</span>}
                    {v.visit_type === 'prospect' && <span className="badge badge-info">Prospecto</span>}
                    {v.visit_type === 'general' && <span className="badge badge-neutral">General</span>}
                  </td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.notes}>
                    {v.notes || '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {v.location ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${v.location.lat},${v.location.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        title={`Precisión: ${Math.round(v.location.accuracy || 0)}m`}
                        style={{ fontSize: '1.2rem', textDecoration: 'none' }}
                      >
                        📍
                      </a>
                    ) : (
                      <span title="Sin ubicación GPS" style={{ opacity: 0.3 }}>🚫</span>
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estatus</th>
                  <th>Tienda</th>
                  <th>Vendedor Asignado</th>
                  <th>Tipo Contrato</th>
                  <th>Próx. Visita</th>
                </tr>
              </thead>
              <tbody>
                {agenda.map(item => {
                  const visitDate = new Date(item.next_visit_date)
                  const today = new Date()
                  const diffTime = visitDate - today
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  let statusLabel = `En ${diffDays} días`
                  let dotColor = 'var(--color-success)'
                  
                  if (diffDays < 0) {
                    statusLabel = `Atrasada (${Math.abs(diffDays)}d)`
                    dotColor = 'var(--color-danger)'
                  } else if (diffDays === 0) {
                    statusLabel = 'Hoy'
                    dotColor = 'var(--color-warning)'
                  }

                  const contractType = item.agreements?.[0]?.type === 'consignacion' ? 'Consignación' : 'Venta Directa'

                  return (
                    <tr key={item.id}>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: dotColor }}></span>
                          <strong style={{ color: dotColor }}>{statusLabel}</strong>
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Tier: {item.tier}</div>
                      </td>
                      <td>{item.profiles?.name || 'Sin Asignar'}</td>
                      <td><span className="badge badge-outline">{contractType}</span></td>
                      <td>{visitDate.toLocaleDateString()}</td>
                    </tr>
                  )
                })}
                {agenda.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No hay tiendas en la agenda futura.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <VisitModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
