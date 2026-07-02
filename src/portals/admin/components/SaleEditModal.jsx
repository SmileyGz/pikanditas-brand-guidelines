import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export default function SaleEditModal({ row, onClose }) {
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(row.quantity)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isConsignment = row.isConsignment

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isConsignment) {
        // Edit consignment (stock_delivered)
        const { error: err } = await supabase
          .from('consignments')
          .update({ stock_delivered: parseInt(quantity) })
          .eq('id', row.id)
        if (err) throw err
      } else {
        // Edit sales_receipt (quantity and recalculate total)
        // We have to figure out the price. The row has `sale_type`? 
        // Wait, the row only has `typeLabel`, `total`, `quantity`.
        // The price is `total / original_quantity`.
        const pricePerBag = row.quantity > 0 ? (row.total / row.quantity) : 20
        const newTotal = parseInt(quantity) * pricePerBag

        const { error: err } = await supabase
          .from('sales_receipts')
          .update({ quantity: parseInt(quantity), total_mxn: newTotal })
          .eq('id', row.id)
        if (err) throw err
      }
      
      queryClient.invalidateQueries(['admin-sales-ledger'])
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
        <h2 style={{ marginBottom: 'var(--space-4)' }}>✏️ Editar Operación</h2>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          Editando bolsas para: <strong>{row.clientName}</strong> ({row.typeLabel})
        </p>
        
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: 4 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Cantidad (Bolsas)</label>
            <input 
              type="number" 
              min="1"
              className="input-field" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full">Cancelar</button>
            <button type="submit" disabled={loading} className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
