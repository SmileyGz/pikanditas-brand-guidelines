import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import SignaturePad from '../../../components/SignaturePad'

export default function AgreementModal({ onClose, preselectedStoreId = '' }) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [formData, setFormData] = useState({
    store_id: preselectedStoreId,
    type: 'compra_directa_12',
    status: 'active',
    initial_quantity: 10
  })
  
  const [signatureData, setSignatureData] = useState(null)
  const [photoData, setPhotoData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { data: stores = [] } = useQuery({
    queryKey: ['stores-dropdown'],
    queryFn: async () => {
      const { data } = await supabase.from('stores').select('id, name').order('name')
      return data || []
    }
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Very basic resize/compress to avoid massive base64 strings
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const scaleSize = MAX_WIDTH / img.width
          canvas.width = MAX_WIDTH
          canvas.height = img.height * scaleSize
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          setPhotoData(dataUrl)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.store_id) return setError('Debes seleccionar una tienda.')
    if (!signatureData) return setError('La firma digital es obligatoria.')
    if (formData.type === 'consignacion' && !photoData) return setError('La foto del INE es obligatoria para acuerdos de concesión.')

    setLoading(true)
    setError(null)

    try {
      const payload = {
        store_id: formData.store_id,
        signed_by_seller: user?.id,
        type: formData.type,
        status: formData.status,
        canvas_signature: signatureData,
        photo_id_url: photoData,
        initial_quantity: parseInt(formData.initial_quantity)
      }

      const { data: agreementData, error: err } = await supabase.from('agreements').insert([payload]).select().single()
      if (err) throw err

      // 2. Insert into Consignments or Sales Receipts to populate accounting/seller data
      if (formData.type === 'consignacion') {
        const { error: consErr } = await supabase.from('consignments').insert([{
          agreement_id: agreementData.id,
          store_id: formData.store_id,
          stock_delivered: parseInt(formData.initial_quantity)
        }])
        if (consErr) console.error('Error inserting consignment:', consErr)
      } else {
        // Venta Directa -> Va a Cuentas por Cobrar
        let pricePerBag = formData.type === 'compra_directa_10' ? 10 : 12
        const totalMxn = parseInt(formData.initial_quantity) * pricePerBag

        const { error: saleErr } = await supabase.from('sales_receipts').insert([{
          store_id: formData.store_id,
          sale_type: formData.type,
          quantity: parseInt(formData.initial_quantity),
          total_mxn: totalMxn,
          payment_method: 'por definir',
          payment_status: 'pending', // Va a CxC
          seller_id: user?.id // Atribuye la venta al vendedor
        }])
        if (saleErr) console.error('Error inserting sale receipt:', saleErr)
      }

      queryClient.invalidateQueries(['admin-agreements-ledger'])
      queryClient.invalidateQueries(['admin-sales-ledger'])
      queryClient.invalidateQueries(['store-detail'])
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
      zIndex: 9999, padding: 'var(--space-4)',
      overflowY: 'auto'
    }}>
      <div className="card animate-float-in" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: 'var(--space-4)' }}>📄 Registrar Nuevo Acuerdo</h2>
        
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: 4 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Tienda (B2B)</label>
            <select name="store_id" className="input-field" value={formData.store_id} onChange={handleChange} required disabled={!!preselectedStoreId}>
              <option value="">-- Selecciona una tienda --</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Tipo de Acuerdo</label>
              <select name="type" className="input-field" value={formData.type} onChange={handleChange}>
                <option value="consignacion">Consignación (Dejar producto)</option>
                <option value="compra_directa_12">Compra Directa ($12 Mayoreo)</option>
                <option value="compra_directa_10">Compra Directa ($10 Distribuidor)</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Cantidad (Piezas)</label>
              <input type="number" name="initial_quantity" className="input-field" min="1" value={formData.initial_quantity} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Firma Digital (Obligatoria)</label>
            <SignaturePad onEnd={setSignatureData} />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Identificación Oficial (INE/IFE)</label>
            {formData.type === 'consignacion' && <span style={{fontSize: '0.8rem', color: 'var(--color-danger)'}}>Obligatoria para concesión</span>}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="input-field" style={{ padding: '0.5rem' }} />
            {photoData && <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: 4 }}>✅ Imagen capturada</p>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full">Cancelar</button>
            <button type="submit" disabled={loading} className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}>
              {loading ? 'Guardando...' : 'Firmar y Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
