import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { supabase } from '../../../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import PrintableReceipt from '../../../components/PrintableReceipt'

export default function SellerSales() {
  const { user } = useAuthStore()
  const [saleType] = useState('b2c_20') // Hardcoded
  const [quantity, setQuantity] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [amountCollected, setAmountCollected] = useState('')
  const [notes, setNotes] = useState('')
  const [sellerType, setSellerType] = useState('externo')
  const [mobileInventory, setMobileInventory] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [qrUrl, setQrUrl] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [savedSaleData, setSavedSaleData] = useState(null)

  // Auto-calculate unit price and total
  const unitPrice = saleType === 'b2c_20' ? 20 : saleType === 'b2b_12' || saleType === 'consignment_collection' ? 12 : 10
  const totalMxn = quantity ? parseInt(quantity) * unitPrice : 0
  const amountPending = totalMxn - (amountCollected ? parseFloat(amountCollected) : 0)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      
      const { data: profile } = await supabase.from('profiles').select('seller_type, mobile_inventory').eq('id', user.id).single()
      if (profile) {
        setSellerType(profile.seller_type || 'externo')
        setMobileInventory(profile.mobile_inventory || 0)
      }
    }
    loadData()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!quantity || quantity <= 0) {
      setError('Ingresa una cantidad válida')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)
    setQrUrl(null)
    setShowReceipt(false)

    try {
      const { data: newSale, error: insertError } = await supabase
        .from('sales')
        .insert({
          seller_id: user.id,
          store_id: null,
          sale_type: 'b2c_20',
          quantity: parseInt(quantity),
          unit_price: unitPrice,
          total_mxn: totalMxn,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'mercado_pago_qr' ? 'pending' : (amountPending <= 0 ? 'paid' : amountCollected > 0 ? 'partial' : 'pending'),
          amount_collected: amountCollected ? parseFloat(amountCollected) : 0,
          amount_pending: amountPending,
          notes: notes
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      if (sellerType === 'inhouse') {
        await supabase.from('profiles').update({ mobile_inventory: mobileInventory - quantity }).eq('id', user.id)
        setMobileInventory(prev => prev - quantity)
      }

      setSavedSaleData({
        ...newSale,
        seller_name: user?.user_metadata?.name || 'Agente Pikanditas',
        store_name: 'Público General'
      })

      if (paymentMethod === 'mercado_pago_qr') {
        // Generar preferencia de pago
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
        const res = await fetch(`${SUPABASE_URL}/functions/v1/create-mp-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'b2b',
            saleId: newSale.id,
            items: [{
              title: `Venta B2B Pikanditas (${quantity} pzas)`,
              quantity: 1, // Total as one item for simplicity
              unit_price: totalMxn,
              currency_id: 'MXN'
            }],
            buyerInfo: {
              name: 'Cliente Tiendita',
              email: 'b2b@pikanditas.com'
            }
          })
        })
        const data = await res.json()
        if (data.init_point) {
          setQrUrl(data.init_point)
        } else {
          throw new Error('No se pudo generar el código QR')
        }
      } else {
        setSuccess(true)
      }

      setQuantity('')
      setAmountCollected('')
      setNotes('')
    } catch (err) {
      console.error(err)
      setError('Error al registrar la venta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 0, minHeight: '100vh', background: 'var(--color-bg-consumer)' }}>
      <div style={{ background: 'var(--color-primary)', color: 'white', padding: 'var(--space-6) var(--space-5)', paddingBottom: '3rem', borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
          💰 Venta Directa
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '1rem' }}>
          Cobra y entrega mercancía al instante. Las ventas al público pagan 8% de comisión.
          {sellerType === 'inhouse' && (
            <span style={{ display: 'block', marginTop: '0.5rem', fontWeight: 700, color: 'var(--color-warning)' }}>
              🎒 Inventario Móvil: {mobileInventory} bolsas
            </span>
          )}
        </p>
      </div>

      <div style={{ padding: '0 var(--space-5)', marginTop: '-2rem', position: 'relative', zIndex: 10 }}>

      {success && !showReceipt && (
        <div className="card" style={{ background: '#d4edda', color: '#155724', marginBottom: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ margin: '0 0 1rem 0' }}>Venta Exitosa</h2>
          <p>La venta se registró correctamente.</p>
          <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} onClick={() => setShowReceipt(true)}>
            📄 Ver / Enviar Ticket
          </button>
          <button className="btn btn-ghost btn-full" style={{ marginTop: '0.5rem' }} onClick={() => {
            setSuccess(false)
            setSavedSaleData(null)
          }}>
            Hacer nueva venta
          </button>
        </div>
      )}

      {showReceipt && (
        <div className="card animate-float-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Ticket de Compra</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowReceipt(false)}>Cerrar</button>
          </div>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', transform: 'scale(0.9)', transformOrigin: 'top center', marginBottom: '-10%' }}>
            <PrintableReceipt data={savedSaleData} />
          </div>
          
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(`🌶️ *Pikanditas* 🐻\n\n¡Gracias por tu compra!\n\n📄 *Detalle de Venta*\nFolio: ${savedSaleData?.id?.split('-')[0].toUpperCase()}\nTotal Pagado: $${savedSaleData?.total_mxn?.toFixed(2)}\n\nEste es un comprobante digital de tu pago en ${paymentMethod}.`)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary btn-full" 
            style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: '#25D366', color: 'white', borderColor: '#25D366' }}
          >
            📲 Enviar por WhatsApp
          </a>
        </div>
      )}

      {error && (
        <div className="card" style={{ background: '#f8d7da', color: '#721c24', marginBottom: '1rem' }}>
          ❌ {error}
        </div>
      )}

      {!success && (
      <form onSubmit={handleSubmit} className="card">


        <div className="form-group">
          <label>Bolsas ({unitPrice} MXN c/u)</label>
          <input 
            type="number" 
            className="input-field" 
            min="1" 
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ background: 'var(--color-bg-consumer)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Total a Pagar:</span>
            <strong style={{ fontSize: '1.2rem' }}>${totalMxn.toFixed(2)}</strong>
          </div>
        </div>

        <div className="form-group">
          <label>Monto Cobrado Hoy (MXN)</label>
          <input 
            type="number" 
            className="input-field" 
            min="0" 
            step="0.5"
            max={totalMxn}
            placeholder={totalMxn.toString()}
            value={amountCollected}
            onChange={(e) => setAmountCollected(e.target.value)}
            required
          />
        </div>

        {amountPending > 0 && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ Quedará un saldo pendiente de ${amountPending.toFixed(2)} MXN
          </p>
        )}

        <div className="form-group">
          <label>Método de Pago</label>
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
          <div className="card" style={{ background: '#f8f9fa', border: '2px dashed var(--color-primary)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Datos Bancarios</h3>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600 }}>Banco: Banco Azteca</p>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '2px' }}>127180016518102384</p>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Titular: José Luis González</p>
          </div>
        )}

        {qrUrl && (
          <div className="card animate-float-in" style={{ textAlign: 'center', border: '2px solid #009ee3', background: '#f1faff' }}>
            <h3 style={{ color: '#009ee3', marginBottom: '1rem' }}>Escanea para Pagar</h3>
            <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '1rem' }}>
              <QRCodeSVG value={qrUrl} size={250} />
            </div>
            <p style={{ marginTop: '1rem', color: '#555' }}>Pídele al tendero que escanee este código con la cámara de su celular.</p>
          </div>
        )}


        <div className="form-group">
          <label>Notas (opcional)</label>
          <textarea 
            className="input-field" 
            placeholder="Algún detalle sobre la venta..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="2"
          />
        </div>

        {!qrUrl && (
          <button type="submit" className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Guardando...' : '💾 Guardar Registro'}
          </button>
        )}
      </form>
      )}
    </div>
    </div>
  )
}
