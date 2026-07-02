import React from 'react'
export default function AdminSellers() {
  return (
    <div className="admin-page">
      <header className="admin-page-header"><h1 className="admin-page-title">👤 Vendedores</h1><p className="admin-page-subtitle">Gestión de equipo de ventas · Evaluación Día 30/60/90</p></header>
      <div className="card" style={{maxWidth:600,textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>👤</div>
        <h2 style={{fontFamily:'var(--font-heading)'}}>Portal de Vendedores — En construcción</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>Próximamente: creación de cuentas, asignación de zonas, evaluación de KPIs y comisiones.</p>
      </div>
    </div>
  )
}
