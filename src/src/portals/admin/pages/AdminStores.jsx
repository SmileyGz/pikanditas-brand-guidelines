import React from 'react'
export default function AdminStores() {
  return (
    <div className="admin-page">
      <header className="admin-page-header"><h1 className="admin-page-title">🏪 Tiendas</h1><p className="admin-page-subtitle">Gestión de puntos de venta</p></header>
      <div className="card" style={{maxWidth:600,textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🏪</div>
        <h2 style={{fontFamily:'var(--font-heading)'}}>Gestión de Tiendas — En construcción</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>Próximamente: agregar tiendas, asignar vendedores, ver historial de visitas y acuerdos por tienda.</p>
      </div>
    </div>
  )
}
