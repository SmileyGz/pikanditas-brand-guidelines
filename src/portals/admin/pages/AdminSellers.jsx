import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { Link } from 'react-router-dom'

export default function AdminSellers() {
  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'seller').order('total_sales_lifetime', { ascending: false })
      return data || []
    }
  })

  const getTier = (sales) => {
    if (sales >= 2000) return { label: 'Distribuidor 🏆', color: 'badge-warning' }
    if (sales >= 500) return { label: 'Pro 🌶️', color: 'badge-danger' }
    return { label: 'Semilla 🌱', color: 'badge-success' }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">👤 Vendedores & Gamificación</h1>
        <p className="admin-page-subtitle">Rendimiento y comisiones de tu fuerza de ventas</p>
      </header>
      
      <div className="card animate-float-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Fuerza de Ventas</h2>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Pide a tu vendedor que entre a pikanditas.com/vendedor e inicie sesión con su teléfono. Su cuenta aparecerá aquí automáticamente.')}>+ Invitar Vendedor</button>
        </div>
        
        {isLoading ? <p>Cargando vendedores...</p> : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Teléfono</th>
                <th>Nivel (Gamificación)</th>
                <th>Ventas Mes</th>
                <th>Meta Mes</th>
                <th>Ventas Históricas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sellers.length === 0 && (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No hay vendedores registrados.</td></tr>
              )}
              {sellers.map(s => {
                const tier = getTier(s.total_sales_lifetime || 0)
                const monthSales = s.total_sales_month || 0
                const goal = s.monthly_goal || 1000
                const progress = Math.min((monthSales / goal) * 100, 100)
                
                return (
                  <tr key={s.id}>
                    <td><strong>{s.name || 'Sin nombre'}</strong></td>
                    <td>{s.phone}</td>
                    <td><span className={`badge ${tier.color}`}>{tier.label}</span></td>
                    <td>
                      <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{monthSales} bolsas</div>
                      <div style={{ height: 4, background: '#eee', borderRadius: 2 }}>
                        <div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%`, borderRadius: 2 }} />
                      </div>
                    </td>
                    <td>{goal} bolsas</td>
                    <td><strong>{s.total_sales_lifetime || 0}</strong></td>
                    <td>
                      <Link to={`/admin/vendedores/${s.id}`} className="btn btn-ghost btn-sm">Ver Perfil</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
