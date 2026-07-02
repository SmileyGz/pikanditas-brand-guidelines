import React from 'react'
export default function AdminAgreements() {
  return (
    <div className="admin-page">
      <header className="admin-page-header"><h1 className="admin-page-title">📄 Acuerdos</h1><p className="admin-page-subtitle">Acuerdos de compra directa y hojas de consignación</p></header>
      <div className="agreement-types-info card" style={{marginBottom:'2rem'}}>
        <h3 style={{fontFamily:'var(--font-heading)',marginBottom:'1rem'}}>Tipos de acuerdo disponibles</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
          <div style={{background:'rgba(255,0,85,0.05)',borderRadius:'12px',padding:'1rem',borderLeft:'4px solid var(--color-primary)'}}>
            <strong>🤝 Compra Directa</strong><br/>
            <span style={{fontSize:'0.85rem',color:'var(--color-text-muted)'}}>$12 tiendita · $10 distribuidor</span>
          </div>
          <div style={{background:'rgba(255,153,0,0.05)',borderRadius:'12px',padding:'1rem',borderLeft:'4px solid var(--color-secondary)'}}>
            <strong>📋 Consignación</strong><br/>
            <span style={{fontSize:'0.85rem',color:'var(--color-text-muted)'}}>$12 solo lo vendido · revisión ≤23 días</span>
          </div>
        </div>
      </div>
      <div className="card" style={{maxWidth:600,textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📄</div>
        <h2 style={{fontFamily:'var(--font-heading)'}}>Firma digital — En construcción</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>Próximamente: formulario digital, firma en canvas, upload de foto ID, generación de PDF y envío por WhatsApp.</p>
      </div>
    </div>
  )
}
