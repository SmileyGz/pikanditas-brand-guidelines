import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { supabase } from '../../../lib/supabase'
import SpiceMeter from '../../../components/SpiceMeter'
import { QRCodeSVG } from 'qrcode.react'
import PrintableReceipt from '../../../components/PrintableReceipt'

export default function SellerCortes() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [stores, setStores] = useState([])
  
  // Seller Profile State
  const [sellerType, setSellerType] = useState('externo')
  const [mobileInventory, setMobileInventory] = useState(0)
  
  // Wizard State
  const [step, setStep] = useState(1)
  const [selectedStore, setSelectedStore] = useState(null)
  const [visitType, setVisitType] = useState('consignacion') // 'consignacion' o 'venta_directa'
  const [deliveredQty, setDeliveredQty] = useState(0) // Lo que tenían antes
  
  // Input State
  const [leftQty, setLeftQty] = useState('') // Cuántas sobraron en el mostrador
  const [restockQty, setRestockQty] = useState('') // Cuántas nuevas dejamos/compran
  const [sellerRating, setSellerRating] = useState(5) // Calificación de interacción
  
  // UX State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [qrUrl, setQrUrl] = useState(null)
  
  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false)
  const [savedSaleData, setSavedSaleData] = useState(null)

  // Fetch stores that the seller needs to visit
  useEffect(() => {
    async function loadStores() {
      if (!user) return
      // We join agreements to know if they are consignment or direct sale
      const { data, error } = await supabase
        .from('stores')
        .select(`
          id, name, tier,
          agreements (id, type),
          consignments (delivered_qty)
        `)
        .eq('assigned_seller', user.id)
      
      if (data) {
        // Also fetch profile for mobile inventory
        const { data: profile } = await supabase.from('profiles').select('seller_type, mobile_inventory').eq('id', user.id).single()
        if (profile) {
          setSellerType(profile.seller_type || 'externo')
          setMobileInventory(profile.mobile_inventory || 0)
        }

        // Filter out stores that don't have agreements yet
        const storesWithAgreements = data.filter(s => s.agreements && s.agreements.length > 0)
        setStores(storesWithAgreements)

        // Auto-select if storeId is provided in URL
        const queryStoreId = searchParams.get('storeId')
        if (queryStoreId) {
          const matchedStore = storesWithAgreements.find(s => s.id === queryStoreId)
          if (matchedStore) {
            setSelectedStore(matchedStore)
            const mainAgreement = matchedStore.agreements[0]
            if (mainAgreement.type === 'consignacion') {
              setVisitType('consignacion')
              setDeliveredQty(matchedStore.consignments?.[0]?.delivered_qty || 0)
            } else {
              setVisitType('venta_directa')
              setDeliveredQty(0)
            }
            setStep(2) // Jump directly to physical count
          }
        }
      }
    }
    loadStores()
  }, [user, searchParams])

  const handleSelectStore = (e) => {
    const storeId = e.target.value
    if (!storeId) {
      setSelectedStore(null)
      return
    }
    const store = stores.find(s => s.id === storeId)
    setSelectedStore(store)
    
    // Determine visit type based on active agreement
    const mainAgreement = store.agreements[0]
    if (mainAgreement.type === 'consignacion') {
      setVisitType('consignacion')
      const cons = store.consignments && store.consignments[0]
      setDeliveredQty(cons ? cons.delivered_qty : 0)
    } else {
      setVisitType('venta_directa')
      setDeliveredQty(0) // En venta directa, no llevamos saldo nuestro, ya lo pagaron. Solo revisamos caducidad/rotación.
    }
    
    setStep(2)
  }

  // Calculations
  const parsedLeft = parseInt(leftQty) || 0
  const parsedRestock = parseInt(restockQty) || 0
  
  let soldQty = 0
  let cashToCollect = 0
  let pricePerBag = 12

  if (selectedStore) {
    if (selectedStore.agreements[0]?.type === 'compra_directa_10') pricePerBag = 10
  }

  if (visitType === 'consignacion') {
    soldQty = Math.max(0, deliveredQty - parsedLeft)
    cashToCollect = soldQty * pricePerBag
  } else {
    // Venta Directa
    soldQty = 0 // No nos deben las que vendieron, ya las habían pagado
    cashToCollect = parsedRestock * pricePerBag // Nos pagan las NUEVAS que compren hoy
  }

  const handleSubmit = async () => {
    if (leftQty === '' || restockQty === '') return setError('Llena todos los campos.')
    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('process_store_visit', {
        p_store_id: selectedStore.id,
        p_seller_id: user.id,
        p_visit_type: visitType,
        p_left_qty: parsedLeft,
        p_sold_qty: soldQty,
        p_restock_qty: parsedRestock,
        p_cash_collected: cashToCollect,
        p_seller_rating: sellerRating,
        p_payment_method: paymentMethod
      })

      if (rpcError) throw rpcError

      // Save sale data for the receipt
      setSavedSaleData({
        id: data.sale_id || `temp-${Date.now()}`,
        sale_type: visitType === 'consignacion' ? 'consignment_collection' : 'b2b_12',
        quantity: soldQty || parsedRestock,
        restock_qty: visitType === 'consignacion' ? parsedRestock : 0,
        unit_price: pricePerBag,
        total_mxn: cashToCollect,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
        store_name: selectedStore.name,
        seller_name: user?.user_metadata?.name || 'Agente Pikanditas'
      })

      if (sellerType === 'inhouse') {
        // Deduct the restocked bags from the seller's mobile inventory
        await supabase.from('profiles').update({ mobile_inventory: mobileInventory - parsedRestock }).eq('id', user.id)
        setMobileInventory(prev => prev - parsedRestock)
      }

      if (paymentMethod === 'mercado_pago_qr' && data.sale_id) {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
        const res = await fetch(`${SUPABASE_URL}/functions/v1/create-mp-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'b2b',
            saleId: data.sale_id,
            items: [{
              title: `Corte Pikanditas (${soldQty || parsedRestock} pzas)`,
              quantity: 1,
              unit_price: cashToCollect,
              currency_id: 'MXN'
            }],
            buyerInfo: {
              name: selectedStore.name,
              email: 'b2b@pikanditas.com'
            }
          })
        })
        const mpData = await res.json()
        if (mpData.init_point) {
          setQrUrl(mpData.init_point)
        } else {
          throw new Error('No se pudo generar el código QR')
        }
      } else {
        setSuccess(true)
        setStep(4)
      }
    } catch (err) {
      console.error(err)
      setError('Error al procesar el corte: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 0, minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: '#4f46e5', color: 'white', padding: 'var(--space-6) var(--space-5)', paddingBottom: '3rem', borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
          📋 Corte de Ruta
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '1rem' }}>
          Realiza inventario físico, cobra ventas y resurte tus tienditas.
          {sellerType === 'inhouse' && (
            <span style={{ display: 'block', marginTop: '0.5rem', fontWeight: 700, color: '#fbbf24' }}>
              🎒 Inventario Móvil: {mobileInventory} bolsas
            </span>
          )}
        </p>
      </div>

      <div style={{ padding: '0 var(--space-5)', marginTop: '-2rem', position: 'relative', zIndex: 10 }}>

      {error && <div className="alert alert-error">{error}</div>}

      {/* STEP 1: Seleccionar Tienda */}
      {step === 1 && (
        <div className="card animate-float-in">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Paso 1: ¿A quién visitas?</h2>
          <div className="form-group">
            <select className="input-field" onChange={handleSelectStore} defaultValue="">
              <option value="" disabled>Selecciona una tienda...</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.agreements[0]?.type === 'consignacion' ? 'Consignación' : 'Venta Directa'})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* STEP 2: Inventario Físico (Sobró) */}
      {step === 2 && (
        <div className="card animate-float-in">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Paso 2: Inventario Físico</h2>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Tienda: <strong>{selectedStore?.name}</strong>
          </p>

          {visitType === 'consignacion' && (
            <div style={{ background: 'var(--color-primary-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ margin: 0, color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
                Bolsas que dejamos la última vez: {deliveredQty}
              </p>
            </div>
          )}

          <div className="form-group">
            <label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              ¿Cuántas bolsas sobraron en exhibición?
            </label>
            <input 
              type="number" 
              inputMode="numeric"
              className="input-field" 
              placeholder="Ej. 2"
              value={leftQty}
              onChange={e => setLeftQty(e.target.value)}
              style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Cambiar Tienda</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
              if (leftQty !== '') setStep(3)
              else setError('Ingresa cuántas bolsas sobraron.')
            }}>Siguiente →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Resurtido y Cobro */}
      {step === 3 && (
        <div className="card animate-float-in">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Paso 3: Cobro y Resurtido</h2>
          
          {/* Cálculo de Cobro */}
          <div style={{ border: '2px solid var(--color-success)', borderRadius: '8px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem', background: '#f0fdf4' }}>
            <p style={{ margin: 0, color: '#166534', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Debe pagar: <span style={{ fontSize: '2rem' }}>${cashToCollect}</span>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#15803d', fontSize: '0.9rem' }}>
              {visitType === 'consignacion' 
                ? `Por ${soldQty} bolsas vendidas (a $${pricePerBag} c/u)` 
                : `Por la compra nueva de ${parsedRestock} bolsas (a $${pricePerBag} c/u)`}
            </p>
          </div>

          {/* Resurtido */}
          <div className="form-group">
            <label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {visitType === 'consignacion' ? '¿Cuántas NUEVAS bolsas dejarás en resguardo?' : '¿Cuántas bolsas van a COMPRAR HOY?'}
            </label>
            {visitType === 'venta_directa' && (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Nota: Asegúrate de rotar el producto que sobró ({parsedLeft} bolsas) cambiándolo por producto fresco sin costo adicional.
              </p>
            )}
            <input 
              type="number" 
              inputMode="numeric"
              className="input-field" 
              placeholder="Ej. 10"
              value={restockQty}
              onChange={e => setRestockQty(e.target.value)}
              style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center', marginTop: '0.5rem' }}
            />
          </div>

          <div style={{ background: 'var(--color-surface-hover)', borderRadius: '8px', padding: '1rem', textAlign: 'center', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>¿Qué tan picante estuvo tu visita? 🥵</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Califica el trato del cliente y si el exhibidor estaba en buen estado.</p>
            <SpiceMeter level={sellerRating} onChange={setSellerRating} max={5} />
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Método de Pago</label>
            <select 
              className="input-field" 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="efectivo">Efectivo 💵</option>
              <option value="transferencia">Transferencia 🏦</option>
              <option value="mercado_pago_qr">Mercado Pago (QR) 💳</option>
            </select>
          </div>

          {paymentMethod === 'transferencia' && (
            <div className="card" style={{ background: '#f8f9fa', border: '2px dashed var(--color-primary)', textAlign: 'center', marginTop: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Datos Bancarios</h3>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600 }}>Banco: Banco Azteca</p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '2px' }}>127180016518102384</p>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Titular: José Luis González</p>
            </div>
          )}

          {qrUrl && (
            <div className="card animate-float-in" style={{ textAlign: 'center', border: '2px solid #4f46e5', background: '#eef2ff', marginTop: '1rem' }}>
              <h3 style={{ color: '#4f46e5', marginBottom: '1rem' }}>Escanea para Pagar</h3>
              <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '1rem' }}>
                <QRCodeSVG value={qrUrl} size={250} />
              </div>
              <p style={{ marginTop: '1rem', color: '#555' }}>Pídele al tendero que escanee este código para pagar.</p>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => { setSuccess(true); setStep(4); }}>
                Simular Pago Completado (Dev)
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Atrás</button>
            {!qrUrl && (
              <button className={`btn btn-primary ${loading ? 'loading' : ''}`} style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar Cobro ✅'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Éxito */}
      {step === 4 && !showReceipt && (
        <div className="card animate-float-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Corte Exitoso</h2>
          <p className="text-muted">El inventario se ha actualizado y la venta se guardó en el sistema.</p>
          
          <button className="btn btn-primary btn-full" style={{ marginTop: '2rem' }} onClick={() => setShowReceipt(true)}>
            📄 Ver / Enviar Ticket
          </button>
          
          <button className="btn btn-ghost btn-full" style={{ marginTop: '0.5rem' }} onClick={() => {
            setStep(1); setSelectedStore(null); setLeftQty(''); setRestockQty(''); setSellerRating(5); setQrUrl(null); setShowReceipt(false); setSavedSaleData(null);
          }}>
            Hacer otro corte
          </button>
          <Link to="/seller" className="btn btn-ghost btn-full" style={{ marginTop: '0.5rem' }}>
            Volver al Menú
          </Link>
        </div>
      )}

      {step === 4 && showReceipt && (
        <div className="card animate-float-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Comprobante de Visita</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowReceipt(false)}>Cerrar</button>
          </div>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', transform: 'scale(0.9)', transformOrigin: 'top center', marginBottom: '-10%' }}>
            <PrintableReceipt data={savedSaleData} />
          </div>
          
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(`🌶️ *Pikanditas* 🐻\n\n¡Gracias por tu compra, ${selectedStore?.name}!\n\n📄 *Detalle del Corte*\nTotal Pagado: $${savedSaleData?.total_mxn?.toFixed(2)}\nBolsas Cobradas: ${savedSaleData?.quantity}\nBolsas Nuevas (Resurtido): ${savedSaleData?.restock_qty || 0}\n\nEste es un comprobante digital de tu pago en ${paymentMethod}.`)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary btn-full" 
            style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: '#25D366', color: 'white', borderColor: '#25D366' }}
          >
            📲 Enviar por WhatsApp
          </a>
        </div>
      )}

      </div>
    </div>
  )
}
