import React from 'react'

export default function PrintableAgreement({ data }) {
  if (!data) return null

  const isConsignment = data.type === 'consignacion'
  const title = isConsignment ? 'HOJA DE CONSIGNACIÓN' : 'HOJA DE VENTA DIRECTA'
  
  // Create a nice date string
  const dateObj = new Date(data.created_at || Date.now())
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const monthName = months[dateObj.getMonth()]
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()

  // For the schedule date, just a placeholder or +23 days if consignment
  const nextVisit = new Date(dateObj.getTime() + 23 * 24 * 60 * 60 * 1000)
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const nextVisitDay = days[nextVisit.getDay()]

  const priceStore = data.type === 'compra_directa_10' ? 10 : 12
  const qty = data.initial_quantity || 0
  const total = qty * priceStore

  return (
    <div id="printable-agreement" style={{
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#333',
      background: '#fff',
      padding: '40px 60px',
      maxWidth: '800px',
      minHeight: '1000px',
      margin: '0 auto',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      border: '1px solid #eaeaea',
      lineHeight: '1.6',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Background Watermark (Optional) ── */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
        <img src="/logo ticket.png" alt="" style={{ width: '600px', filter: 'grayscale(100%)' }} />
      </div>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
        <img src="/logo ticket.png" alt="Pikanditas" style={{ width: '150px', height: 'auto', filter: 'grayscale(100%)' }} />
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 5px 0', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {title}
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Folio: {data.id?.split('-')[0].toUpperCase()}</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Fecha: {day} de {monthName} del {year}</div>
        </div>
      </div>

      {/* ── Info ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '1.05rem', marginBottom: '30px', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <div>
          <strong style={{ color: '#555' }}>Establecimiento / Tienda:</strong><br/>
          <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{data.stores?.name || 'No especificado'}</span>
        </div>
        <div>
          <strong style={{ color: '#555' }}>Encargado / Responsable:</strong><br/>
          <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{data.stores?.owner_name || 'No especificado'}</span>
        </div>
      </div>

      {/* ── Product & Pricing Details ── */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#000', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>
          Detalles de Producto
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.05rem' }}>
          <thead>
            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Producto</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Condición</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Precio Unitario</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '15px 10px', borderBottom: '1px solid #eee' }}><strong>Pikanditas (60g)</strong></td>
              <td style={{ padding: '15px 10px', borderBottom: '1px solid #eee' }}>{isConsignment ? 'En Consignación' : 'Compra de Contado'}</td>
              <td style={{ padding: '15px 10px', borderBottom: '1px solid #eee' }}>${priceStore.toFixed(2)}</td>
              <td style={{ padding: '15px 10px', borderBottom: '1px solid #eee' }}>{qty > 0 ? qty : '____'}</td>
            </tr>
            <tr>
              <td colSpan="3" style={{ padding: '15px 10px', textAlign: 'right', fontSize: '1.1rem' }}>
                <strong>{isConsignment ? 'Valor de Mercancía en Resguardo:' : 'Total a Pagar:'}</strong>
              </td>
              <td style={{ padding: '15px 10px', fontSize: '1.2rem', fontWeight: 'bold', color: '#000' }}>
                {qty > 0 ? `$${total.toFixed(2)}` : '____'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Policy ── */}
      <div style={{ marginBottom: '50px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#000', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>
          Términos y Políticas
        </h3>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', textAlign: 'justify', color: '#444' }}>
          {isConsignment ? (
            <>
              El encargado recibe las piezas de producto para su venta en mostrador. <strong>Solo se paga lo vendido</strong> al momento de la revisión de inventario. El proveedor se compromete a visitar el establecimiento para revisar ventas y reponer producto en un lapso máximo de 23 días a partir de la firma de este documento.<br/><br/>
              <strong>Política de Rotación:</strong> Ofrecemos garantía total de rotación. Si el producto no presenta movimiento de venta, será reemplazado por producto fresco en el siguiente resurtido sin costo para el establecimiento, garantizando siempre la mejor calidad para el consumidor.
            </>
          ) : (
            <>
              El establecimiento adquiere las piezas de producto bajo un esquema de compra de contado, accediendo a nuestro precio preferencial B2B. El proveedor garantiza la entrega inmediata de producto fresco, visualmente atractivo y de la más alta calidad.<br/><br/>
              <strong>Garantía de Calidad:</strong> En caso de detectar cualquier defecto de fábrica o daño en el empaque, Pikanditas ofrece el cambio inmediato del producto afectado por uno nuevo.
            </>
          )}
        </p>
      </div>

      {/* ── Signatures ── */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: '60px', paddingTop: '20px' }}>
        <div style={{ textAlign: 'center', width: '40%' }}>
          {data.canvas_signature ? (
            <img src={data.canvas_signature} alt="Firma Encargado" style={{ width: '100%', maxWidth: '250px', height: 'auto', borderBottom: '1px solid #000', marginBottom: '10px' }} />
          ) : (
            <div style={{ borderBottom: '1px solid #000', height: '60px', width: '100%', marginBottom: '10px' }}></div>
          )}
          <div style={{ marginTop: '10px', width: '200px', height: '1px', background: '#000', margin: '10px auto' }}></div>
          <div style={{ fontWeight: 'bold' }}>Firma del Encargado</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>{data.stores?.owner_name || 'No especificado'}</div>
        </div>

        <div style={{ textAlign: 'center', width: '40%' }}>
          <div style={{ borderBottom: '1px solid #000', height: '60px', width: '100%', marginBottom: '10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.4rem', fontFamily: 'cursive', color: '#111', paddingBottom: '10px' }}>{data.profiles?.name}</span>
          </div>
          <div style={{ fontWeight: 'bold' }}>Representante Pikanditas</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Ventas B2B</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center', fontSize: '0.9rem', color: '#888', width: '100%', margin: 'auto auto 0 auto' }}>
        <div>¡Sabor travieso que alegra tu día! 🐻🌶️</div>
        <div style={{ marginTop: '5px' }}>www.pikanditas.com</div>
      </div>
    </div>
  )
}
