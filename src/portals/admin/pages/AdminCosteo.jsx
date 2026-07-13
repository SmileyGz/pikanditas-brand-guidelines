import React from 'react'
import CostCalculator from '../../../CostCalculator'

export default function AdminCosteo() {
  return (
    <div className="admin-page animate-fade-in" style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Costeo & Pricing</h1>
        <p className="page-subtitle">Calculadora de costos de producción y márgenes de ganancia.</p>
      </header>
      <div style={{ background: 'var(--color-surface)', borderRadius: '12px', padding: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <CostCalculator />
      </div>
    </div>
  )
}
