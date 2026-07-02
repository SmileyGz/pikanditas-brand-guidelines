import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { supabase } from '../../../lib/supabase'

export default function SellerPanic() {
  const { user } = useAuthStore()
  const [stores, setStores] = useState([])
  const [storeId, setStoreId] = useState('me') // 'me' means seller is out of stock, otherwise it's a store
  const [reason, setReason] = useState('Me quedé sin producto')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchStores() {
      if (!user) return
      const { data } = await supabase.from('stores').select('id, name').eq('assigned_seller', user.id)
      if (data) setStores(data)
    }
    fetchStores()
  }, [user])

  const handlePanic = async (e) => {
    e.preventDefault()
    if (!window.confirm('¿Confirmas activar la alerta de pánico? Esto notificará a central.')) return
    
    setLoading(true)
    setSuccess(false)
    
    const targetStoreId = storeId === 'me' ? null : storeId
    
    const { error } = await supabase.from('panic_events').insert({
      seller_id: user.id,
      store_id: targetStoreId,
      reason: reason,
      status: 'open'
    })
    
    setLoading(false)
    if (!error) {
      setSuccess(true)
    } else {
      alert('Error enviando alerta: ' + error.message)
    }
  }

  return (
    <div style={{padding:'var(--space-5)'}}>
      <h1 style={{fontFamily:'var(--font-heading)',fontSize:'1.4rem',fontWeight:800,marginBottom:'var(--space-2)'}}>🚨 Botón de Pánico</h1>
      <p style={{color:'var(--color-text-muted)',marginBottom:'var(--space-6)'}}>Notifica urgencias al equipo central (CRM)</p>
      
      {success && (
        <div className="card" style={{ background: '#d4edda', color: '#155724', marginBottom: '1rem', border: '2px solid #c3e6cb' }}>
          ✅ ¡Alerta recibida! El equipo central se comunicará contigo de inmediato.
        </div>
      )}

      <div className="card" style={{ borderRadius:'var(--radius-lg)' }}>
        <form onSubmit={handlePanic}>
          <div className="form-group">
            <label>¿Quién se quedó sin producto?</label>
            <select className="input-field" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              <option value="me">🙋‍♂️ Yo (Vendedor / Mi inventario móvil)</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>🏪 Tienda: {s.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Detalle de la Urgencia</label>
            <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="Me quedé sin producto">Me quedé sin producto por completo</option>
              <option value="Un cliente grande vació mi inventario">Un cliente grande vació mi inventario</option>
              <option value="Necesito material de mercadotecnia urgente">Necesito material de mercadotecnia urgente</option>
              <option value="Problema con un cliente/tienda">Problema urgente con un cliente/tienda</option>
              <option value="Otro">Otro (Específica en WhatsApp)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={`btn btn-full ${loading ? 'loading' : ''}`} 
            style={{ background: 'var(--color-danger)', color: 'white', fontSize: '1.2rem', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Enviando...' : '🚨 ACTIVAR PÁNICO'}
          </button>
        </form>
      </div>
    </div>
  )
}
