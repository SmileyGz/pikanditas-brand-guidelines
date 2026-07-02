import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useSettings } from '../../../hooks/useSettings'
import { supabase } from '../../../lib/supabase'

export default function SellerNewStore() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { settings } = useSettings()
  
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    zone: ''
  })
  
  const [location, setLocation] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGetLocation = () => {
    setGpsLoading(true)
    setGpsError('')
    
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta GPS.')
      setGpsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
      },
      (err) => {
        setGpsError('No pudimos obtener tu ubicación. Verifica los permisos.')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.name || !formData.owner_name || !formData.phone || !formData.zone) {
      setError('Por favor llena todos los campos.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: insertError } = await supabase.from('stores').insert([{
        name: formData.name,
        owner_name: formData.owner_name,
        phone: formData.phone,
        zone: formData.zone,
        assigned_seller: user?.id,
        location: location // JSONB field {lat, lng}
      }]).select().single()

      if (insertError) throw insertError

      // Redirigir a la firma del contrato
      navigate(`/seller/acuerdo/${data.id}`)
    } catch (err) {
      console.error(err)
      setError('Error al registrar tienda: ' + err.message)
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 'var(--space-4)', paddingBottom: '100px' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>📍 Alta de Tiendita</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Registra un nuevo punto de venta y su GPS.</p>
      </header>

      {error && (
        <div style={{ background: 'var(--color-danger)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card animate-float-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Nombre Comercial</label>
          <input 
            type="text" 
            name="name"
            className="input-field" 
            placeholder="Ej. Abarrotes Doña Lety"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Nombre del Dueño/Encargado</label>
          <input 
            type="text" 
            name="owner_name"
            className="input-field" 
            placeholder="Ej. Leticia Gómez"
            value={formData.owner_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Teléfono (WhatsApp)</label>
          <input 
            type="tel" 
            name="phone"
            className="input-field" 
            placeholder="10 dígitos"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Zona de Reparto</label>
          <select 
            name="zone" 
            className="input-field" 
            value={formData.zone} 
            onChange={handleChange}
            style={{ height: '48px' }}
          >
            <option value="">-- Selecciona una Zona --</option>
            {(settings?.zonas_activas || []).map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        <div style={{ padding: '1rem', background: location ? 'rgba(0, 204, 136, 0.1)' : 'var(--color-bg-admin)', borderRadius: '8px', border: location ? '1px solid var(--color-success)' : '1px solid var(--color-border)' }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {location ? '✅ Ubicación Guardada' : '🛰️ Geolocalización'}
          </label>
          
          {!location ? (
            <button 
              type="button" 
              className={`btn btn-secondary btn-full ${gpsLoading ? 'loading' : ''}`}
              onClick={handleGetLocation}
              disabled={gpsLoading}
              style={{ marginTop: '0.5rem' }}
            >
              {gpsLoading ? 'Buscando satélites...' : '📍 Capturar GPS Actual'}
            </button>
          ) : (
            <div style={{ color: 'var(--color-success)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Lat: {location.lat.toFixed(5)} <br/> Lng: {location.lng.toFixed(5)}
              <button 
                type="button" 
                onClick={handleGetLocation} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', display: 'block', marginTop: '0.5rem', padding: 0 }}
              >
                Volver a capturar
              </button>
            </div>
          )}
          {gpsError && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{gpsError}</p>}
        </div>

        <button 
          type="submit" 
          className={`btn btn-primary btn-full ${submitting ? 'loading' : ''}`} 
          style={{ height: '54px', fontSize: '1.1rem', marginTop: '1rem' }}
          disabled={submitting || !formData.name || !formData.zone || !location}
        >
          {submitting ? 'Registrando...' : 'Guardar y Firmar Contrato 📝'}
        </button>

      </form>
    </div>
  )
}
