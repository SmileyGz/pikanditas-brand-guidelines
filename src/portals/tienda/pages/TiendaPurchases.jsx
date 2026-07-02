import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/authStore'

export default function TiendaPurchases() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('entregas')

  // Fetch real data from Supabase
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('online_orders').select('*').limit(3)
      if (error) throw error
      if (!data) return []
      
      // Map to match our UI format
      return data.map(o => ({
        id: o.id.substring(0,8).toUpperCase(),
        date: new Date(o.created_at).toLocaleDateString(),
        type: 'Entrega',
        qty: o.quantity,
        status: o.payment_status === 'approved' ? 'Completado' : 'Pendiente',
        total: `$${o.total_price}`
      }))
    },
    enabled: !!user?.id
  })

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando historial...</div>

  return (
    <div className="seller-section animate-float-in">
      <h2 className="seller-section-title">Mis Pedidos</h2>
      
      <div className="tabs-nav" style={{ marginBottom: '1.5rem', background: 'transparent', padding: 0 }}>
        <button 
          className={`tab-btn ${activeTab === 'entregas' ? 'active' : ''}`}
          onClick={() => setActiveTab('entregas')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: activeTab === 'entregas' ? 'var(--color-surface)' : 'transparent' }}
        >
          Historial de Entregas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'solicitar' ? 'active' : ''}`}
          onClick={() => setActiveTab('solicitar')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: activeTab === 'solicitar' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'solicitar' ? 'white' : 'inherit' }}
        >
          + Solicitar Resurtido
        </button>
      </div>

      {activeTab === 'entregas' ? (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {orders?.map((order, idx) => (
            <div key={order.id} style={{ 
              padding: '1rem', 
              borderBottom: idx < orders.length - 1 ? '1px solid var(--color-border)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{order.type} • {order.qty} bolsas</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{order.date} | {order.id}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, color: order.type === 'Devolución' ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                  {order.total}
                </p>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  background: 'rgba(0,0,0,0.05)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600
                }}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center animate-float-in" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
          <h3>Solicitud Enviada</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Esta pantalla pronto te permitirá armar tu carrito de resurtido para que tu vendedor pase a dejarte mercancía.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveTab('entregas')}>Volver al Historial</button>
        </div>
      )}
    </div>
  )
}
