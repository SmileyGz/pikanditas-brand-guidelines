import React from 'react'
export default function AdminSales() {
  return (
    <div className="admin-page">
      <header className="admin-page-header"><h1 className="admin-page-title">💰 Ventas</h1><p className="admin-page-subtitle">Historial de ventas, notas de venta y analíticas</p></header>
      <div className="card" style={{maxWidth:600,textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>💰</div>
        <h2 style={{fontFamily:'var(--font-heading)'}}>Ventas y Analíticas — En construcción</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>Próximamente: todas las ventas (B2B + B2C web), Notas de Venta PDF, gráficas de rendimiento por vendedor y zona.</p>
      </div>
    </div>
  )
}
