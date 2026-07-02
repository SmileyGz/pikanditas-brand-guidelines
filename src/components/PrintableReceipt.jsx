import React from 'react'

export default function PrintableReceipt({ data }) {
  if (!data) return null

  const isB2C = data.sale_type === 'b2c_20'
  const isConsignment = data.sale_type === 'consignment_collection'
  
  let title = 'TICKET DE VENTA'
  if (isConsignment) title = 'RECIBO DE AUDITORÍA Y COBRO'
  else if (!isB2C) title = 'NOTA DE RESURTIDO B2B'

  // Date formatting
  const dateObj = new Date(data.created_at || Date.now())
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`

  const qty = data.quantity || 0
  const price = data.unit_price || 0
  const total = data.total_mxn || (qty * price)
  const method = data.payment_method || 'efectivo'
  
  const methodName = {
    'efectivo': 'Efectivo',
    'transferencia': 'Transferencia Bancaria',
    'mercado_pago_qr': 'Mercado Pago (QR)'
  }[method] || method

  return (
    <div id="printable-receipt" style={{
      fontFamily: '"Courier New", Courier, monospace',
      color: '#000',
      background: '#fff',
      padding: '20px',
      maxWidth: '350px',
      margin: '0 auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #ccc',
      lineHeight: '1.4',
      position: 'relative'
    }}>
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '15px', marginBottom: '15px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>PIKANDITAS</h1>
        <div style={{ fontSize: '0.85rem' }}>¡Sabor travieso que alegra tu día! 🐻🌶️</div>
        <div style={{ fontSize: '0.85rem' }}>www.pikanditas.com</div>
        <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>{title}</div>
      </div>

      {/* ── Info ── */}
      <div style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
        <div><strong>Folio:</strong> {data.id?.split('-')[0].toUpperCase()}</div>
        <div><strong>Fecha:</strong> {formattedDate}</div>
        {!isB2C && data.store_name && (
          <div style={{ marginTop: '5px' }}><strong>Cliente:</strong> {data.store_name}</div>
        )}
        <div><strong>Atendió:</strong> {data.seller_name || 'Agente Pikanditas'}</div>
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '15px 0' }}></div>

      {/* ── Product & Pricing ── */}
      <table style={{ width: '100%', fontSize: '0.9rem', marginBottom: '15px' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>Cant</th>
            <th>Descripción</th>
            <th style={{ textAlign: 'right' }}>Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ paddingTop: '5px' }}>{qty}</td>
            <td style={{ paddingTop: '5px' }}>Pikanditas (60g)</td>
            <td style={{ paddingTop: '5px', textAlign: 'right' }}>${total.toFixed(2)}</td>
          </tr>
          {data.restock_qty > 0 && (
            <tr>
              <td style={{ paddingTop: '5px', color: '#555' }}>{data.restock_qty}</td>
              <td style={{ paddingTop: '5px', color: '#555' }}>Resurtido a Consigna</td>
              <td style={{ paddingTop: '5px', textAlign: 'right', color: '#555' }}>$0.00</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ borderBottom: '1px dashed #000', margin: '15px 0' }}></div>

      {/* ── Totals ── */}
      <div style={{ fontSize: '1rem', textAlign: 'right', marginBottom: '15px' }}>
        <div><strong>TOTAL A PAGAR: ${total.toFixed(2)}</strong></div>
        <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>Método de Pago: {methodName}</div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '20px', color: '#555' }}>
        {isConsignment 
          ? 'Gracias por su preferencia. Le recordamos que el producto en consignación es propiedad de Pikanditas.'
          : '¡Gracias por su compra!'}
      </div>
    </div>
  )
}
