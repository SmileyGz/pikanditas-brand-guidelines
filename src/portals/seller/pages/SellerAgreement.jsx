import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { supabase } from '../../../lib/supabase'
import SignatureCanvas from 'react-signature-canvas'
import PrintableAgreement from '../../../components/PrintableAgreement'
import { captureAndShare } from '../../../utils/shareUtils'

export default function SellerAgreement() {
  const { storeIdParam } = useParams()
  const { user } = useAuthStore()
  const [stores, setStores] = useState([])
  
  const [step, setStep] = useState(1) // Empezar siempre en paso 1 para elegir tipo de acuerdo
  const [storeId, setStoreId] = useState(storeIdParam || '')
  const [agreementType, setAgreementType] = useState('consignacion')
  const [initialQuantity, setInitialQuantity] = useState(10)
  const [signerName, setSignerName] = useState('')
  const [signatureData, setSignatureData] = useState(null)
  const [photoIdFile, setPhotoIdFile] = useState(null)
  
  const [savedAgreementId, setSavedAgreementId] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const sigCanvas = useRef(null)

  useEffect(() => {
    async function loadStores() {
      if (!user) return
      const { data } = await supabase.from('stores').select('id, name').eq('assigned_seller', user.id)
      if (data) setStores(data)
    }
    loadStores()
  }, [user])

  const clearSignature = () => sigCanvas.current?.clear()

  const handleNext = () => {
    if (step === 1 && !storeId) return setError('Selecciona una tienda')
    if (step === 2 && !signerName) return setError('Ingresa el nombre de quien firma')
    if (step === 2) {
      if (sigCanvas.current?.isEmpty()) return setError('La firma es obligatoria')
      // Guardar la firma antes de desmontar el canvas
      try {
        setSignatureData(sigCanvas.current.getCanvas().toDataURL('image/png'))
      } catch (err) {
        console.error("Firma Error:", err)
        return setError('Error al capturar la firma: ' + err.message)
      }
    }
    setError(null)
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    if (!photoIdFile) return setError('Sube una foto de la INE')
    
    setLoading(true)
    setError(null)
    
    try {
      // 1. Usa la firma guardada en el estado
      const signatureDataUrl = signatureData
      
      // 2. Upload Photo ID to Supabase Storage
      const fileExt = photoIdFile.name.split('.').pop()
      const fileName = `${storeId}-${Date.now()}.${fileExt}`
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('photo-ids')
        .upload(fileName, photoIdFile)

      if (uploadError) throw uploadError

      const photoIdUrl = supabase.storage.from('photo-ids').getPublicUrl(fileName).data.publicUrl

      // 3. Create Agreement Record
      const { data: agreement, error: agreementError } = await supabase.from('agreements').insert({
        store_id: storeId,
        type: agreementType,
        signed_by_seller: user.id,
        canvas_signature: signatureDataUrl,
        photo_id_url: photoIdUrl,
        initial_quantity: parseInt(initialQuantity),
        status: 'active'
      }).select().single()

      if (agreementError) throw agreementError

      // 4. Create Consignment Record if it's a consignment
      if (agreementType === 'consignacion') {
        const { error: consError } = await supabase.from('consignments').insert({
          agreement_id: agreement.id,
          store_id: storeId,
          delivered_qty: parseInt(initialQuantity),
          remaining_qty: 0,
          status: 'active',
          next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        if (consError) throw consError
      } else {
        // Direct Sale -> Create Sales Receipt
        let pricePerBag = agreementType === 'compra_directa_10' ? 10 : 12
        const totalMxn = parseInt(initialQuantity) * pricePerBag

        const { error: saleErr } = await supabase.from('sales_receipts').insert({
          store_id: storeId,
          sale_type: agreementType,
          quantity: parseInt(initialQuantity),
          total_mxn: totalMxn,
          payment_method: 'por definir',
          payment_status: 'pending',
          seller_id: user?.id
        })
        if (saleErr) console.error('Error inserting sale:', saleErr)
      }

      // Update the store's next_visit_date in the agenda CRM
      const { error: storeErr } = await supabase.from('stores').update({
        next_visit_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }).eq('id', storeId)
      if (storeErr) console.error('Error updating store agenda:', storeErr)

      setSavedAgreementId(agreement.id)
      setSuccess(true)
      setStep(4) // Success step
    } catch (err) {
      console.error(err)
      setError('Error al guardar el acuerdo: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 'var(--space-5)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
        📄 Nuevo Acuerdo
      </h1>
      
      {error && <div className="card" style={{ background: '#f8d7da', color: '#721c24', marginBottom: '1rem' }}>❌ {error}</div>}

      {step === 1 && (
        <div className="card animate-float-in">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Paso 1: Datos Generales</h2>
          <div className="form-group">
            <label>Tienda / Cliente</label>
            <select className="input-field" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              <option value="">Selecciona una tienda...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Acuerdo</label>
            <select className="input-field" value={agreementType} onChange={(e) => setAgreementType(e.target.value)}>
              <option value="consignacion">Consignación (A dejar producto)</option>
              <option value="compra_directa_12">Compra Directa ($12 Mayoreo)</option>
              <option value="compra_directa_10">Compra Directa ($10 Distribuidor)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Cantidad de Bolsas</label>
            <input 
              type="number" 
              className="input-field" 
              value={initialQuantity} 
              onChange={(e) => setInitialQuantity(e.target.value)} 
              min="1"
            />
          </div>
          <button className="btn btn-primary btn-full" onClick={handleNext}>Continuar →</button>
        </div>
      )}

      {step === 2 && (
        <div className="card animate-float-in">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Paso 2: Firma Digital</h2>
          <div className="form-group">
            <label>Nombre de quien firma</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Juan Pérez" 
              value={signerName} 
              onChange={(e) => setSignerName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Firma en el recuadro</label>
            <div style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ width: 300, height: 150, className: 'sigCanvas' }}
              />
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', width: '100%' }} onClick={clearSignature}>
              Borrar firma
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Atrás</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleNext}>Continuar →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card animate-float-in">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Paso 3: Foto de INE</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Toma una foto clara de la identificación oficial (frente).
          </p>
          <div className="form-group">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={(e) => setPhotoIdFile(e.target.files[0])}
              style={{ padding: '1rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', width: '100%' }}
            />
          </div>
          {photoIdFile && <p style={{ fontSize: '0.85rem', color: 'green', marginBottom: '1rem' }}>✅ Imagen capturada</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)} disabled={loading}>← Atrás</button>
            <button className={`btn btn-primary ${loading ? 'loading' : ''}`} style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Finalizar y Guardar'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && !showReceipt && (
        <div className="card animate-float-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Acuerdo Guardado</h2>
          <p className="text-muted">El acuerdo ha sido registrado exitosamente con firma digital.</p>
          
          <button className="btn btn-secondary btn-full" style={{ marginTop: '2rem' }} onClick={() => setShowReceipt(true)}>
            📄 Ver Comprobante
          </button>
          
          <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} onClick={() => {
            setStep(1); setStoreId(''); setSignerName(''); setPhotoIdFile(null); setShowReceipt(false);
          }}>
            Crear otro acuerdo
          </button>
        </div>
      )}

      {step === 4 && showReceipt && (
        <div className="card animate-float-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Comprobante de Acuerdo</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowReceipt(false)}>Cerrar</button>
          </div>
          
          <div id="agreement-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', padding: '10px', background: '#fff', maxWidth: '100%' }}>
              <PrintableAgreement data={{
                id: savedAgreementId,
                type: agreementType,
                initial_quantity: initialQuantity,
                canvas_signature: signatureData,
                created_at: new Date().toISOString(),
                stores: { 
                  name: stores.find(s => s.id === storeId)?.name,
                  owner_name: signerName || stores.find(s => s.id === storeId)?.owner_name
                }
              }} />
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-full" 
            style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: '#25D366', color: 'white', borderColor: '#25D366' }}
            onClick={async (e) => {
              const btn = e.currentTarget;
              btn.disabled = true;
              btn.innerHTML = '⏳ Generando...';
              await captureAndShare('agreement-container', `Acuerdo_Pikanditas_${savedAgreementId?.split('-')[0]}.png`);
              btn.disabled = false;
              btn.innerHTML = '📲 Enviar por WhatsApp';
            }}
          >
            📲 Enviar por WhatsApp
          </button>
        </div>
      )}
    </div>
  )
}
