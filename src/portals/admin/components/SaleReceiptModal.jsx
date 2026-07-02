import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import ReceiptTicket from '../../../components/ReceiptTicket'

export default function SaleReceiptModal({ onClose, preselectedStoreId = '' }) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    store_id: preselectedStoreId,
    client_name: '', // For B2C or new clients not in DB
    sale_type: 'b2c_20',
    quantity: 1,
    payment_method: 'efectivo',
    payment_status: 'paid'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [receiptData, setReceiptData] = useState(null) // Holds data for the generated receipt

  // Fetch available stores to link sale
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
    setLoading(true)
    setError(null)
    try {
      // Calculate total based on sale type
      let pricePerBag = 20
      if (formData.sale_type === 'compra_directa_12') pricePerBag = 12
      if (formData.sale_type === 'compra_directa_10') pricePerBag = 10
      
      const total = formData.quantity * pricePerBag

      const payload = {
        store_id: formData.store_id || null,
        client_name: formData.client_name || null,
        sale_type: formData.sale_type,
        quantity: parseInt(formData.quantity),
        total_mxn: total,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        seller_id: user?.id
      }

      const { data, error: err } = await supabase.from('sales_receipts').insert([payload]).select().single()
      if (err) throw err
      
      queryClient.invalidateQueries(['admin-sales-ledger'])
      
      // Instead of closing, show the receipt
      let clientNameDisplay = formData.client_name || 'B2C Público'
      if (formData.store_id) {
        const storeObj = stores.find(s => s.id === formData.store_id)
        if (storeObj) clientNameDisplay = storeObj.name
      }

      setReceiptData({
        id: data.id,
        date: new Date(data.created_at),
        clientName: clientNameDisplay,
        quantity: data.quantity,
        total: data.total_mxn,
        typeLabel: data.sale_type === 'b2c_20' ? 'Venta Online/Pública' : (data.sale_type === 'compra_directa_12' ? 'Venta B2B ($12)' : 'Venta Mayorista ($10)')
      })

    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    if (!receiptData) return
    const text = `🧾 *NOTA DE VENTA PIKANDITAS*\n\nFolio: ${receiptData.id.split('-')[0].toUpperCase()}\nFecha: ${receiptData.date.toLocaleDateString('es-MX')}\nCliente: ${receiptData.clientName}\n\nConcepto: ${receiptData.quantity} bolsas Pikanditas 60g\nTotal: $${receiptData.total} MXN\n\n🌶️ ¡Pika la vida!\nSíguenos: @Pikanditasmx`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 'var(--space-4)'
    }}>
      <div className="card animate-float-in" style={{ width: '100%', maxWidth: receiptData ? 360 : 450, padding: receiptData ? '1rem' : 'var(--space-6)' }}>
        {!receiptData ? (
          <>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>🧾 Registrar Nueva Venta</h2>
            
            {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: 4 }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Tipo de Venta</label>
                <select name="sale_type" className="input-field" value={formData.sale_type} onChange={handleChange} required>
                  <option value="b2c_20">Venta Pública / Online ($20)</option>
                  <option value="compra_directa_12">Tiendita B2B ($12)</option>
                  <option value="compra_directa_10">Distribuidor B2B ($10)</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Vincular a Tienda (Opcional)</label>
                <select name="store_id" className="input-field" value={formData.store_id} onChange={handleChange}>
                  <option value="">-- Sin Tienda (Venta al Público) --</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {!formData.store_id && (
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Nombre del Cliente (Si no es tienda)</label>
                  <input type="text" name="client_name" className="input-field" value={formData.client_name} onChange={handleChange} placeholder="Ej. Vecino, Transeúnte..." />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Bolsas</label>
                  <input type="number" name="quantity" className="input-field" min="1" value={formData.quantity} onChange={handleChange} required />
                </div>
                
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Método de Pago</label>
                  <select name="payment_method" className="input-field" value={formData.payment_method} onChange={handleChange}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Estatus</label>
                <select name="payment_status" className="input-field" value={formData.payment_status} onChange={handleChange}>
                  <option value="paid">Pagado</option>
                  <option value="pending">Pendiente de Pago</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={onClose} className="btn btn-ghost btn-full">Cancelar</button>
                <button type="submit" disabled={loading} className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}>
                  {loading ? 'Guardando...' : 'Registrar Venta'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ReceiptTicket data={receiptData} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handlePrint} className="btn btn-secondary btn-full">🖨️ Imprimir</button>
              <button onClick={handleWhatsApp} className="btn btn-success btn-full" style={{ background: '#25D366', color: 'white' }}>💬 WhatsApp</button>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-full">Cerrar</button>
          </div>
        )}
      </div>
    </div>
  )
}
