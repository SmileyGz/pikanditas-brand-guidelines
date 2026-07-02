import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export default function SellerGoalModal({ seller, onClose }) {
  const queryClient = useQueryClient()
  const [goal, setGoal] = useState(seller.monthly_goal || 1000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ monthly_goal: goal })
        .eq('id', seller.id)
      if (err) throw err
      
      queryClient.invalidateQueries(['seller-detail', seller.id])
      queryClient.invalidateQueries(['admin-sellers'])
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
        <h2 style={{ marginBottom: 'var(--space-4)' }}>🎯 Editar Meta Mensual</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
          Ajusta la meta de ventas de bolsas para <strong>{seller.name || 'este vendedor'}</strong> este mes.
        </p>
        
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: 4 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Meta (bolsas)</label>
            <input 
              type="number" 
              className="input-field" 
              value={goal} 
              onChange={(e) => setGoal(Number(e.target.value))} 
              required 
              min="1"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full">Cancelar</button>
            <button type="submit" disabled={loading} className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
