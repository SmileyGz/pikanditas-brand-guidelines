import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'

export default function AdminPanic() {
  const queryClient = useQueryClient()

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data } = await supabase.from('panic_events')
        .select(`
          id,
          created_at,
          reason,
          status,
          profiles (name, phone),
          stores (name)
        `)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const resolveAlertMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('panic_events').update({ status: 'resolved' }).eq('id', id)
      if (error) throw new Error(error.message)
    },
    onError: (err) => {
      alert('Error al resolver la alerta: ' + err.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-alerts'])
      queryClient.invalidateQueries(['count-panic'])
    }
  })

  const openAlerts = alerts.filter(a => a.status === 'open')
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved')

  return (
    <div className={`admin-page ${openAlerts.length > 0 ? 'chamoy-drip' : ''}`} style={{ transition: 'all 0.5s', backgroundColor: openAlerts.length > 0 ? '#fff5f5' : 'transparent' }}>
      <header className="admin-page-header">
        <h1 className="admin-page-title">🚨 Central de Pánico</h1>
        <p className="admin-page-subtitle">Monitoreo de urgencias en campo</p>
      </header>
      
      {openAlerts.length > 0 && (
        <div className="card animate-panic-pulse" style={{ background: 'var(--color-danger)', color: 'white', border: 'none', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span> 
            ¡Hay {openAlerts.length} alerta(s) activa(s)!
          </h2>
          <p>Contacta inmediatamente a los vendedores o tiendas afectadas.</p>
        </div>
      )}

      <div className="card animate-float-in" style={{ marginBottom: '2rem' }}>
        <h2>Alertas Activas</h2>
        {isLoading ? <p>Cargando...</p> : openAlerts.length === 0 ? (
          <p className="text-muted" style={{ padding: '1rem 0' }}>✅ No hay alertas activas en este momento.</p>
        ) : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Origen</th>
                <th>Motivo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {openAlerts.map(a => (
                <tr key={a.id} style={{ background: '#ffebeb' }}>
                  <td>{new Date(a.created_at).toLocaleString('es-MX')}</td>
                  <td>
                    <strong>{a.profiles?.name || 'Vendedor Desconocido'}</strong><br/>
                    <small>{a.profiles?.phone}</small><br/>
                    <span className="badge badge-warning">{a.stores?.name || 'Inventario Móvil'}</span>
                  </td>
                  <td style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{a.reason}</td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => resolveAlertMutation.mutate(a.id)}
                      disabled={resolveAlertMutation.isLoading}
                    >
                      Marcar Resuelto
                    </button>
                    <a 
                      href={`https://wa.me/52${a.profiles?.phone}?text=Hola%20${a.profiles?.name},%20recibimos%20tu%20alerta%20de%20pánico:%20${a.reason}`} 
                      className="btn btn-whatsapp btn-sm" 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ marginLeft: '0.5rem' }}
                    >
                      WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card animate-float-in delay-1">
        <h2>Historial de Alertas Resueltas</h2>
        <table className="clients-table" style={{ opacity: 0.8 }}>
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Origen</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {resolvedAlerts.slice(0, 10).map(a => (
              <tr key={a.id}>
                <td>{new Date(a.created_at).toLocaleString('es-MX')}</td>
                <td>{a.profiles?.name} / {a.stores?.name || 'Móvil'}</td>
                <td>{a.reason}</td>
                <td><span className="badge badge-success">Resuelto</span></td>
              </tr>
            ))}
            {resolvedAlerts.length === 0 && (
              <tr><td colSpan="4">No hay historial.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
