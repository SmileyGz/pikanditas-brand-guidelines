import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/authStore'

export default function TiendaPanic() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [storeData, setStoreData] = useState(null)
  const [reason, setReason] = useState('Me quedé sin producto por completo')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Fetch real data from Supabase
  useEffect(() => {
    async function fetchStore() {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_profile_id', user.id)
        .maybeSingle()
        
      if (!error && data) {
        setStoreData(data)
      }
    }
    fetchStore()
  }, [user?.id])

  const handlePanic = async (e) => {
    e.preventDefault()
    if (!window.confirm('¿Confirmas activar la alerta de pánico? Esto notificará a central de inmediato.')) return
    
    setLoading(true)
    setSuccess(false)
    
    const { error } = await supabase.from('panic_events').insert({
      seller_id: storeData?.assigned_seller || null,
      store_id: storeData?.id || null,
      reason: `[TIENDA]: ${reason}`,
      status: 'open'
    })
    
    setLoading(false)
    if (error) {
      alert('Error enviando alerta: ' + error.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div style={{padding:'var(--space-5)'}} className="animate-float-in">
      <h1 style={{fontFamily:'var(--font-heading)',fontSize:'1.4rem',fontWeight:800,marginBottom:'var(--space-2)'}}>🚨 Botón de Pánico</h1>
      <p style={{color:'var(--color-text-muted)',marginBottom:'var(--space-6)'}}>Usa esta herramienta si tienes una emergencia grave con tu inventario de Pikanditas.</p>
      
      {success && (
        <div className="card animate-float-in" style={{ background: '#d4edda', color: '#155724', marginBottom: '1rem', border: '2px solid #c3e6cb' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>✅ ¡Alerta recibida en Central!</p>
          <p style={{ fontSize: '0.9rem' }}>Tu vendedor ha sido notificado y se comunicará contigo a la brevedad posible.</p>
          <button className="btn btn-sm btn-ghost" style={{marginTop:'1rem'}} onClick={() => navigate('/tienda/inicio')}>Volver al Inicio</button>
        </div>
      )}

      <div className="card" style={{ borderRadius:'var(--radius-lg)' }}>
        <form onSubmit={handlePanic}>
          <div className="form-group">
            <label>Tienda Afectada</label>
            <input type="text" className="input-field" value={storeData?.name || 'Cargando...'} disabled />
          </div>
          
          <div className="form-group">
            <label>Detalle de la Urgencia</label>
            <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)} disabled={success}>
              <option value="Me quedé sin producto por completo">Me quedé sin producto por completo</option>
              <option value="El producto se echó a perder / Dañado">El producto se echó a perder / Dañado</option>
              <option value="Tengo un problema urgente / Otro">Tengo un problema urgente / Otro</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={`btn btn-full ${loading ? 'loading' : ''}`} 
            style={{ background: 'var(--color-danger)', color: 'white', fontSize: '1.2rem', padding: '1rem', animation: !success && !loading ? 'jiggle 3s infinite' : 'none' }}
            disabled={loading || success || !storeData}
          >
            {loading ? 'Transmitiendo Alerta...' : '🚨 ACTIVAR PÁNICO'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes jiggle {
          0%, 100% { transform: rotate(-1deg) scale(1); }
          50% { transform: rotate(1deg) scale(1.02); }
        }
      `}</style>
    </div>
  )
}
