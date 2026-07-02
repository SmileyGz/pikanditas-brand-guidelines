import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export default function ProductionEditModal({ log, onClose }) {
  const queryClient = useQueryClient()
  const [kilos, setKilos] = useState(log.kilos)
  const [notes, setNotes] = useState(log.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const bagsYield = kilos ? Math.floor(parseFloat(kilos) * 23) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!kilos || isNaN(kilos) || kilos <= 0) return
    
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('production_logs')
        .update({ kilos: parseFloat(kilos), bags_yield: bagsYield, notes })
        .eq('id', log.id)
      
      if (err) throw err
      
      queryClient.invalidateQueries(['production-logs'])
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
      <div className="card animate-float-in" style={{ width: '100%', maxWidth: 400 }}>
        <h2 style={{ marginBottom: 'var(--space-4)' }}>✏️ Editar Registro de Producción</h2>
        
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: 4 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Kilos procesados</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                className="input-field" 
                value={kilos} 
                onChange={(e) => setKilos(e.target.value)} 
                required 
              />
              <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>kg</span>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Rendimiento Estimado (Bolsas)</label>
            <input 
              type="text" 
              className="input-field" 
              value={`${bagsYield} bolsas`} 
              disabled 
              style={{ background: 'var(--color-bg-admin)', fontWeight: 700, color: 'var(--color-success)' }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Notas (Opcional)</label>
            <input 
              type="text" 
              className="input-field" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full">Cancelar</button>
            <button type="submit" disabled={loading || !kilos} className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
