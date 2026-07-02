import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { Link } from 'react-router-dom'
import StoreFormModal from '../components/StoreFormModal'

export default function AdminStores() {
  const [showModal, setShowModal] = React.useState(false)

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: async () => {
      // Fetch stores along with their active consignments
      const { data } = await supabase.from('stores')
        .select(`
          *,
          consignments (
            id,
            status,
            last_review_date
          )
        `)
      return data || []
    }
  })

  // Calculate Semáforo de Rotación
  const getSemaforo = (store) => {
    const activeConsignment = store.consignments?.find(c => c.status === 'active')
    if (!activeConsignment || !activeConsignment.last_review_date) {
      return { color: 'badge-neutral', label: 'Sin Datos', dot: '⚪' }
    }
    const lastDate = new Date(activeConsignment.last_review_date)
    const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 14) return { color: 'badge-success', label: 'Buena Rotación', dot: '🟢' }
    if (diffDays <= 23) return { color: 'badge-warning', label: 'Atención (Por expirar)', dot: '🟡' }
    return { color: 'badge-danger', label: 'Alerta (>23 días)', dot: '🔴' }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">🏪 Tiendas y Clientes</h1>
        <p className="admin-page-subtitle">Monitoreo del semáforo de rotación</p>
      </header>
      
      <div className="card animate-float-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Directorio de Puntos de Venta</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Nueva Tienda</button>
        </div>
        
        {isLoading ? <p>Cargando tiendas...</p> : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Semáforo Rotación</th>
                <th>Tienda</th>
                <th>Zona</th>
                <th>Vendedor Asignado</th>
                <th>Tipo de Cliente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 && (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No hay tiendas registradas.</td></tr>
              )}
              {stores.map(s => {
                const semaforo = getSemaforo(s)
                return (
                  <tr key={s.id}>
                    <td>
                      <span className={`badge ${semaforo.color}`} title={semaforo.label}>
                        {semaforo.dot} {semaforo.label}
                      </span>
                    </td>
                    <td>
                      <strong>{s.name}</strong><br/>
                      <small className="text-muted">{s.owner_name}</small>
                    </td>
                    <td>{s.zone || 'N/A'}<br/><small className="text-muted">{s.visit_day ? `Visita: ${s.visit_day}` : ''}</small></td>
                    <td>{s.assigned_seller ? 'Asignado' : 'Sin Vendedor'}</td>
                    <td><span className="badge badge-info">{s.tier.replace('tiendita_', '$').replace('distributor_', '$')}</span></td>
                    <td>
                      <Link to={`/admin/tiendas/${s.id}`} className="btn btn-ghost btn-sm">Ver info</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {showModal && <StoreFormModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
