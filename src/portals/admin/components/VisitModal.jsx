import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'

export default function VisitModal({ onClose, preselectedStoreId = '' }) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [formData, setFormData] = useState({
    store_id: preselectedStoreId,
    visit_type: 'review_consignment', // review_consignment, direct_sale, prospect, general
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [geoStatus, setGeoStatus] = useState('') // fetching, success, error

  const { data: stores = [] } = useQuery({
    queryKey: ['stores-dropdown'],
    queryFn: async () => {
      const { data } = await supabase.from('stores').select('id, name').order('name')
      return data || []
    }
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.store_id) {
      setError('Debes seleccionar una tienda.')
      return
    }

    setLoading(true)
    setError(null)
    setGeoStatus('fetching')

    // Capture geolocation
    if (!navigator.geolocation) {
      setGeoStatus('error')
      saveVisit(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoStatus('success')
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        saveVisit(location)
      },
      (geoError) => {
        console.error("GPS Error:", geoError)
        setGeoStatus('error')
        // We still save the visit even if GPS fails, but without location. 
        // A real strict CRM might block it, but for now we allow fallback.
        saveVisit(null)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const saveVisit = async (locationJSON) => {
    try {
      const payload = {
        store_id: formData.store_id,
        seller_id: user?.id,
        visit_type: formData.visit_type,
        notes: formData.notes,
        location: locationJSON
      }

      const { error: err } = await supabase.from('visits').insert([payload])
      if (err) throw err

      queryClient.invalidateQueries(['admin-visits-ledger'])
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 'var(--space-4)'
    }}>
      <div className="card animate-float-in" style={{ width: '100%', maxWidth: 400 }}>
        <h2 style={{ marginBottom: 'var(--space-4)' }}>📍 Registrar Visita (Check-in)</h2>
        
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: 4 }}>{error}</div>}
        
        {geoStatus === 'fetching' && (
          <div style={{ color: 'var(--color-primary)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,68,0,0.1)', borderRadius: 4, textAlign: 'center' }}>
            🛰️ Obteniendo ubicación GPS...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Tienda / Cliente</label>
            <select name="store_id" className="input-field" value={formData.store_id} onChange={handleChange} required disabled={!!preselectedStoreId}>
              <option value="">-- Selecciona una tienda --</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Motivo de la Visita</label>
            <select name="visit_type" className="input-field" value={formData.visit_type} onChange={handleChange} required>
              <option value="review_consignment">Revisión de Consigna</option>
              <option value="direct_sale">Venta de Contado</option>
              <option value="prospect">Prospección</option>
              <option value="general">Visita de Cortesía</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Notas o Resultados</label>
            <textarea 
              name="notes" 
              className="input-field" 
              value={formData.notes} 
              onChange={handleChange} 
              rows="3"
              placeholder="Ej. Dejé 10 bolsas, no estaba el dueño..."
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full" disabled={geoStatus === 'fetching'}>Cancelar</button>
            <button type="submit" disabled={loading || geoStatus === 'fetching'} className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}>
              {geoStatus === 'fetching' ? 'Validando...' : 'Hacer Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
