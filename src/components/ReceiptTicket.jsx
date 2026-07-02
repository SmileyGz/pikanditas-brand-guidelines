import React from 'react'

export default function ReceiptTicket({ data }) {
  // Extract a short folio from the UUID
  const folio = data.id ? data.id.split('-')[0].toUpperCase() : 'PENDIENTE'
  const dateObj = data.date instanceof Date ? data.date : new Date()

  const dd = String(dateObj.getDate()).padStart(2, '0')
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0') // numeric month
  const yy = String(dateObj.getFullYear()).slice(-2)

  const pricePerUnit = data.quantity > 0 ? (data.total / data.quantity) : 0

  return (
    <div id="receipt-ticket" style={{
      background: '#fff',
      color: '#000',
      width: '100%',
      maxWidth: '320px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      fontFamily: 'monospace, sans-serif'
    }}>
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo ticket.png" alt="Pikanditas" style={{ width: '220px', height: 'auto', margin: '0 auto' }} />
      </div>

      {/* ── Meta ── */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>NOTA DE VENTA</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
          <span>Folio:</span>
          <strong>{folio}</strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
          <span>Fecha:</span>
          <strong>{dd}/{mm}/{yy}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
          <span>Cliente:</span>
          <strong style={{ textAlign: 'right', maxWidth: '60%' }}>{data.clientName}</strong>
        </div>
      </div>

      {/* ── Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '0.4rem 0' }}>Descripción</th>
            <th style={{ textAlign: 'center', padding: '0.4rem 0' }}>Cant.</th>
            <th style={{ textAlign: 'right', padding: '0.4rem 0' }}>P.U.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0.6rem 0' }}>
              Pikanditas 60 g<br/>
              <small style={{ fontSize: '0.7rem', color: '#555' }}>{data.typeLabel}</small>
            </td>
            <td style={{ textAlign: 'center', padding: '0.6rem 0', fontWeight: 'bold' }}>{data.quantity}</td>
            <td style={{ textAlign: 'right', padding: '0.6rem 0' }}>${pricePerUnit}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #000' }}>
            <th colSpan="2" style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '1rem' }}>TOTAL</th>
            <th style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '1.1rem' }}>${data.total}</th>
          </tr>
        </tfoot>
      </table>

      {/* ── Signature ── */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto', paddingTop: '0.5rem' }}>
          Firma
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '2px dashed #000', paddingTop: '1rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>954 3388 332</div>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>@Pikanditasmx</div>
      </div>
    </div>
  )
}
