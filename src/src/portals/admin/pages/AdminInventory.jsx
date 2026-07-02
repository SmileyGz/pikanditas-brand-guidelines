import React from 'react'
import { Link } from 'react-router-dom'
export default function AdminInventory() {
  return (
    <div className="admin-page">
      <header className="admin-page-header"><h1 className="admin-page-title">📦 Inventario</h1><p className="admin-page-subtitle">Control de stock y semáforo de rotación</p></header>
      <div className="card" style={{maxWidth:600,textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📦</div>
        <h2 style={{fontFamily:'var(--font-heading)'}}>Inventario — En construcción</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>Próximamente: catálogo de productos, control de stock, semáforo verde/amarillo/rojo de rotación.</p>
      </div>
    </div>
  )
}
