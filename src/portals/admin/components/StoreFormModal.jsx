import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useSettings } from '../../../hooks/useSettings'

export default function StoreFormModal({ store, onClose }) {
  const queryClient = useQueryClient()
  const { settings } = useSettings()
  const isEdit = !!store

  const [formData, setFormData] = useState({
    name: store?.name || '',
    owner_name: store?.owner_name || '',
    phone: store?.phone || '',
    zone: store?.zone || '',
    tier: store?.tier || 'tiendita_12',
    visit_day: store?.visit_day || 'Lunes',
    assigned_seller: store?.assigned_seller || '',
    owner_profile_id: store?.owner_profile_id || '',
    lat: store?.location?.lat || '',
    lng: store?.location?.lng || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch available sellers
  const { data: sellers = [] } = useQuery({
    queryKey: ['available-sellers'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, name, phone').eq('role', 'seller')
      return data || []
    }
  })

  // Fetch available store owners (B2B users)
  const { data: storeOwners = [] } = useQuery({
    queryKey: ['available-store-owners'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, name, phone').eq('role', 'store')
      return data || []
    }
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Convert empty assigned_seller and owner_profile_id to null for Supabase uuid relation
      const payload = { ...formData }
      if (!payload.assigned_seller) payload.assigned_seller = null
      if (!payload.owner_profile_id) payload.owner_profile_id = null
      
      if (payload.lat && payload.lng) {
        payload.location = {
          lat: parseFloat(payload.lat),
          lng: parseFloat(payload.lng)
        }
      }
      delete payload.lat
      delete payload.lng

      if (isEdit) {
        const { error: err } = await supabase.from('stores').update(payload).eq('id', store.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('stores').insert([payload])
        if (err) throw err
      }
      queryClient.invalidateQueries(['admin-stores'])
      queryClient.invalidateQueries(['recent-stores'])
      queryClient.invalidateQueries(['store-detail', store?.id])
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
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
      <div className="card animate-float-in" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: 'var(--space-4)' }}>{isEdit ? 'Editar Cliente' : 'Nuevo Cliente / Tienda'}</h2>
        
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: 4 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Nombre del Negocio *</label>
            <input name="name" className="input-field" value={formData.name} onChange={handleChange} required placeholder="Ej. Abarrotes Los Pérez" />
          </div>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Nombre del Encargado</label>
            <input name="owner_name" className="input-field" value={formData.owner_name} onChange={handleChange} placeholder="Ej. Doña María" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Teléfono</label>
              <input name="phone" type="tel" className="input-field" value={formData.phone} onChange={handleChange} placeholder="10 dígitos" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Día de Visita</label>
              <select name="visit_day" className="input-field" value={formData.visit_day} onChange={handleChange}>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Zona</label>
              <select name="zone" className="input-field" value={formData.zone} onChange={handleChange}>
                <option value="">-- Selecciona --</option>
                {(settings?.zonas_activas || []).map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Nivel de Precio (Tier)</label>
              <select name="tier" className="input-field" value={formData.tier} onChange={handleChange}>
                <option value="tiendita_12">Tiendita ($12)</option>
                <option value="distributor_10">Distribuidor ($10)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Latitud (GPS) Opcional</label>
              <input name="lat" className="input-field" value={formData.lat} onChange={handleChange} placeholder="Ej. 21.1619" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Longitud (GPS) Opcional</label>
              <input name="lng" className="input-field" value={formData.lng} onChange={handleChange} placeholder="Ej. -86.8515" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Vendedor Asignado</label>
              <select name="assigned_seller" className="input-field" value={formData.assigned_seller} onChange={handleChange}>
                <option value="">Sin asignar (Ruta libre)</option>
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.phone}</option>
                ))}
              </select>
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Dueño de la Tienda (Cuenta B2B)</label>
              <select name="owner_profile_id" className="input-field" value={formData.owner_profile_id} onChange={handleChange}>
                <option value="">Ninguno (Tienda sin App)</option>
                {storeOwners.map(o => (
                  <option key={o.id} value={o.id}>{o.name || o.phone}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full">Cancelar</button>
            <button type="submit" disabled={loading} className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}>
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
