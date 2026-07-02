import React from 'react'
export default function AdminPanic() {
  return (
    <div className="admin-page">
      <header className="admin-page-header"><h1 className="admin-page-title">🚨 Alertas de Pánico</h1><p className="admin-page-subtitle">Solicitudes urgentes de reabastecimiento</p></header>
      <div className="card" style={{maxWidth:600,textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🚨</div>
        <h2 style={{fontFamily:'var(--font-heading)'}}>Centro de Alertas — En construcción</h2>
        <p style={{color:'var(--color-text-muted)',marginTop:'1rem'}}>Próximamente: alertas en tiempo real vía Supabase Realtime, triage de solicitudes urgentes, notificaciones por WhatsApp.</p>
      </div>
    </div>
  )
}
