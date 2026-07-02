import React from 'react'
export default function AdminSettings() {
  return (
    <div className="admin-page">
      <header className="admin-page-header"><h1 className="admin-page-title">⚙️ Configuración</h1><p className="admin-page-subtitle">Ajustes de la plataforma</p></header>
      <div className="card" style={{maxWidth:600,textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>⚙️</div>
        <h2 style={{fontFamily:'var(--font-heading)'}}>Configuración — En construcción</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>Próximamente: tarifas por tier, zonas, integración Mercado Pago, configuración de notificaciones WhatsApp.</p>
      </div>
    </div>
  )
}
