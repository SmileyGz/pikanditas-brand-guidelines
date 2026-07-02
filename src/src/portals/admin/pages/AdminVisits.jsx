import React from 'react'
export default function AdminVisits() {
  return (
    <div className="admin-page">
      <header className="admin-page-header"><h1 className="admin-page-title">🗓️ Visitas</h1><p className="admin-page-subtitle">Registro de visitas y consignaciones</p></header>
      <div className="card" style={{maxWidth:600,textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🗓️</div>
        <h2 style={{fontFamily:'var(--font-heading)'}}>Visitas y Consignaciones — En construcción</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>Próximamente: log de visitas, registro de consignaciones activas, agenda de revisiones.</p>
      </div>
    </div>
  )
}
