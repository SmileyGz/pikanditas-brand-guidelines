import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'

export default function AdminRestock() {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-restock-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('online_orders')
        .select('*')
        .ilike('buyer_name', 'SELLER:%')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })

  const handleApprove = async (order) => {
    const isInhouse = order.buyer_name.includes('[INHOUSE]')
    const actionName = isInhouse ? 'Autorizar Traspaso (Inventario Móvil)' : 'Cobrar y Surtir (Externo)'
    const sellerId = order.buyer_name.split(': ')[1]

    if (!window.confirm(`¿${actionName} para el pedido de ${order.quantity} bolsas?`)) return
    
    setLoading(true)
    
    if (isInhouse && sellerId) {
      // Fetch current inventory and increment
      const { data: profile } = await supabase.from('profiles').select('mobile_inventory').eq('id', sellerId).single()
      if (profile) {
        await supabase.from('profiles').update({ mobile_inventory: (profile.mobile_inventory || 0) + order.quantity }).eq('id', sellerId)
      }
    }

    const { error } = await supabase
      .from('online_orders')
      .update({ payment_status: 'approved' })
      .eq('id', order.id)

    setLoading(false)
    if (error) {
      alert('Error al aprobar: ' + error.message)
    } else {
      queryClient.invalidateQueries(['admin-restock-requests'])
    }
  }

  const handleDelete = async (order) => {
    if (!window.confirm(`¿Seguro que deseas ELIMINAR este registro de resurtido de ${order.quantity} bolsas?`)) return
    
    setLoading(true)
    
    // Si ya estaba aprobado y era inhouse, debemos revertir el inventario móvil
    if (order.payment_status === 'approved') {
      const isInhouse = order.buyer_name.includes('[INHOUSE]')
      const sellerId = order.buyer_name.split(': ')[1]
      if (isInhouse && sellerId) {
        const { data: profile } = await supabase.from('profiles').select('mobile_inventory').eq('id', sellerId).single()
        if (profile) {
          const newInv = Math.max(0, (profile.mobile_inventory || 0) - order.quantity)
          await supabase.from('profiles').update({ mobile_inventory: newInv }).eq('id', sellerId)
        }
      }
    }

    const { error } = await supabase.from('online_orders').delete().eq('id', order.id)
    
    setLoading(false)
    if (error) {
      alert('Error al borrar: ' + error.message)
    } else {
      queryClient.invalidateQueries(['admin-restock-requests'])
    }
  }

  const pending = requests.filter(r => r.payment_status === 'pending')
  const completed = requests.filter(r => r.payment_status !== 'pending')

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">📦 Resurtido a Vendedores (B2B)</h1>
        <p className="admin-page-subtitle">Gestiona las solicitudes de inventario de tus vendedores / distribuidores.</p>
      </header>

      <div style={{ display: 'grid', gap: '2rem' }}>
        <div className="card animate-float-in">
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-warning)' }}>⏳ Solicitudes Pendientes ({pending.length})</h2>
          {isLoading ? <p>Cargando...</p> : pending.length === 0 ? (
            <p className="text-muted">No hay pedidos pendientes por surtir.</p>
          ) : (
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Vendedor</th>
                  <th>Bolsas Solicitadas</th>
                  <th>Valor Costo</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(req => (
                  <tr key={req.id}>
                    <td>
                      <strong>{new Date(req.created_at).toLocaleDateString('es-MX')}</strong>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(req.created_at).toLocaleTimeString('es-MX')}</div>
                    </td>
                    <td>{req.buyer_name.replace('SELLER: ', '')}</td>
                    <td><span className="badge badge-warning">{req.quantity} bolsas</span></td>
                    <td>${req.total_price} MXN</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
                        onClick={() => handleApprove(req)}
                        disabled={loading}
                      >
                        {req.buyer_name.includes('[INHOUSE]') ? '✅ Autorizar Traspaso' : '✅ Cobrar y Surtir'}
                      </button>
                      <button 
                        className="btn btn-ghost"
                        style={{ padding: '0.2rem 0.5rem', height: 'auto', minHeight: 0, color: 'var(--color-danger)', marginLeft: '0.5rem' }}
                        onClick={() => handleDelete(req)}
                        disabled={loading}
                        title="Eliminar Resurtido"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card animate-float-in" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-success)' }}>✅ Historial Surtido ({completed.length})</h2>
          {completed.length === 0 ? (
            <p className="text-muted">No hay historial de resurtido.</p>
          ) : (
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Vendedor</th>
                  <th>Bolsas Solicitadas</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(req => (
                  <tr key={req.id}>
                    <td>{new Date(req.created_at).toLocaleDateString('es-MX')}</td>
                    <td>{req.buyer_name.replace('SELLER: ', '')}</td>
                    <td>{req.quantity} bolsas</td>
                    <td>
                      <span className="badge badge-success">Surtido</span>
                      <button 
                        className="btn btn-ghost"
                        style={{ padding: '0.2rem 0.5rem', height: 'auto', minHeight: 0, color: 'var(--color-danger)', marginLeft: '1rem' }}
                        onClick={() => handleDelete(req)}
                        disabled={loading}
                        title="Revertir y Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
