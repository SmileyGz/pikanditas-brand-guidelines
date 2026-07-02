import React from 'react'
export default function SellerCatalog() {
  return (
    <div style={{padding:'var(--space-5)'}}>
      <h1 style={{fontFamily:'var(--font-heading)',fontSize:'1.4rem',fontWeight:800,marginBottom:'var(--space-2)'}}>📋 Catálogo</h1>
      <p style={{color:'var(--color-text-muted)',marginBottom:'var(--space-6)'}}>Productos y precios disponibles</p>
      <div className="card" style={{textAlign:'center',padding:'3rem',borderRadius:'var(--radius-lg)'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📋</div>
        <h2 style={{fontFamily:'var(--font-heading)',fontSize:'1.2rem'}}>Catálogo</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>En construcción — próximamente disponible 🌶️</p>
      </div>
    </div>
  )
}
