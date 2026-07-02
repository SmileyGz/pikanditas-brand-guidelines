import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/authStore'

export default function SellerPurchases() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [sellerType, setSellerType] = useState('externo')

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data } = await supabase.from('profiles').select('seller_type').eq('id', user.id).single()
      if (data) setSellerType(data.seller_type || 'externo')
    }
    loadProfile()
  }, [user])

  const catalog = [
    { id: 'box_12', name: 'Media Caja (Pack 12)', qty: 12, price: 144, icon: '🌶️' },
    { id: 'box_24', name: 'Caja Resurtido Básico', qty: 24, price: 288, icon: '📦' },
    { id: 'box_50', name: 'Caja Resurtido Pro', qty: 50, price: 600, icon: '🔥' }
  ]

  useEffect(() => {
    async function loadHistory() {
      if (!user) return
      const { data } = await supabase
        .from('online_orders')
        .select('*')
        .ilike('buyer_name', `SELLER:%`)
        .order('created_at', { ascending: false })
      
      if (data) {
        setHistory(data.filter(o => o.buyer_name.includes(user.id)))
      }
    }
    loadHistory()
  }, [user])

  const requestRestock = async (product) => {
    const actionText = sellerType === 'inhouse' ? `¿Solicitar traspaso de ${product.name} a tu inventario móvil?` : `¿Comprar ${product.name} al CEDIS central?`
    if (!window.confirm(actionText)) return
    
    setLoading(true)
    setError('')
    setSuccess(false)
    
    const { error: insertError } = await supabase.from('online_orders').insert({
      buyer_name: `SELLER-[${sellerType.toUpperCase()}]: ${user.id}`,
      buyer_email: user?.email || 'seller@pikanditas.com',
      quantity: product.qty,
      total_price: sellerType === 'inhouse' ? 0 : product.price, // In-house don't pay upfront
      payment_status: 'pending' // pending until CEDIS approves/delivers
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      // Refresh history
      const { data } = await supabase
        .from('online_orders')
        .select('*')
        .ilike('buyer_name', `SELLER:%`)
        .order('created_at', { ascending: false })
      if (data) setHistory(data.filter(o => o.buyer_name.includes(user.id)))
    }
  }

  return (
  return (
    <div style={{ padding: 0, minHeight: '100vh', background: '#fffbeb' }}>
      <div style={{ background: '#ea580c', color: 'white', padding: 'var(--space-6) var(--space-5)', paddingBottom: '3rem', borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
          📦 Resurtido CEDIS
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '1rem' }}>
          Pide mercancía al almacén central para tu ruta.
        </p>
      </div>

      <div style={{ padding: '0 var(--space-5)', marginTop: '-2rem', position: 'relative', zIndex: 10 }} className="animate-float-in">
      
      {error && (
        <div className="card" style={{ background: '#f8d7da', color: '#721c24', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {success && (
        <div className="card" style={{ background: '#d4edda', color: '#155724', marginBottom: '1rem' }}>
          ✅ Solicitud enviada al CEDIS. Prepara tu recolección.
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {catalog.map(product => (
          <div key={product.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{product.icon}</div>
              <h3 style={{ fontSize: '1.1rem', margin: '0' }}>{product.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Contiene {product.qty} bolsas</p>
            </div>
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={() => requestRestock(product)}
              disabled={loading}
            >
              {sellerType === 'inhouse' ? 'Traspasar' : 'Comprar'}
            </button>
          </div>
        ))}
      </div>

      <h2 style={{fontFamily:'var(--font-heading)',fontSize:'1.2rem', marginTop: '2rem', marginBottom: '1rem'}}>Historial de Solicitudes</h2>
      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No has realizado pedidos de resurtido aún.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {history.map((order, idx) => (
            <div key={order.id} style={{ 
              padding: '1rem', 
              borderBottom: idx < history.length - 1 ? '1px solid var(--color-border)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: 600 }}>Pedido #{order.id.substring(0,8).toUpperCase()}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{new Date(order.created_at).toLocaleDateString()} • {order.quantity} bolsas</p>
              </div>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '4px 8px', 
                borderRadius: '10px', 
                background: order.payment_status === 'pending' ? 'rgba(255,165,0,0.1)' : 'rgba(0,128,0,0.1)',
                color: order.payment_status === 'pending' ? '#cc8400' : 'var(--color-success)',
                fontWeight: 600
              }}>
                {order.payment_status === 'pending' ? 'Pendiente' : 'Aprobado'}
              </span>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
