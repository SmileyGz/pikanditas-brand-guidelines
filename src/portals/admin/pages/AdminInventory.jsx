import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import ProductionEditModal from '../components/ProductionEditModal'

import { useStock } from '../../../hooks/useStock'

export default function AdminInventory() {
  const queryClient = useQueryClient()
  const [kilos, setKilos] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState('all') // all, week, month
  const [editingLog, setEditingLog] = useState(null)

  // 1 Kilo = 23 Bags
  const bagsYield = kilos ? Math.floor(parseFloat(kilos) * 23) : 0

  const { data: stockData, isLoading: isLoadingStock } = useStock()
  const { totalProduced = 0, totalConsigned = 0, totalSalesB2B = 0, totalSalesOnline = 0, totalInhouse = 0, totalAdminSales = 0, availableStock = 0 } = stockData || {}

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['production-logs'],
    queryFn: async () => {
      const { data } = await supabase.from('production_logs').select('*').order('created_at', { ascending: false })
      return data || []
    }
  })

  const handleSaveProduction = async (e) => {
    e.preventDefault()
    if (!kilos || isNaN(kilos) || kilos <= 0) return
    
    setLoading(true)
    try {
      const { error } = await supabase.from('production_logs').insert([{
        kilos: parseFloat(kilos),
        bags_yield: bagsYield,
        notes: notes || 'Producción de rutina'
      }])
      
      if (error) throw error
      
      setKilos('')
      setNotes('')
      queryClient.invalidateQueries(['production-logs'])
      queryClient.invalidateQueries(['global-stock'])
    } catch (error) {
      console.error(error)
      alert(error.message === 'relation "public.production_logs" does not exist' 
        ? '¡Ups! Primero debes crear la tabla en Supabase corriendo el comando SQL.' 
        : `Error al guardar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este registro de producción?')) return
    const { error } = await supabase.from('production_logs').delete().eq('id', id)
    if (error) alert('Error al borrar: ' + error.message)
    else {
      queryClient.invalidateQueries(['production-logs'])
      queryClient.invalidateQueries(['global-stock'])
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">📦 Inventario Central</h1>
        <p className="admin-page-subtitle">Control de Producción y Rendimiento (1 Kilo = 23 bolsas)</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* LEFT PANEL: Production Calculator & Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* CALCULATOR */}
          <div className="card animate-float-in">
            <h2 style={{ marginBottom: 'var(--space-4)' }}>➕ Registrar Producción</h2>
            <form onSubmit={handleSaveProduction} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: 120 }}>
                <label className="input-label">Kilos procesados</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    className="input-field" 
                    value={kilos} 
                    onChange={(e) => setKilos(e.target.value)} 
                    placeholder="Ej. 10.5" 
                    required 
                  />
                  <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>kg</span>
                </div>
              </div>

              <div style={{ paddingBottom: '0.75rem', color: 'var(--color-text-muted)' }}>
                × 23 =
              </div>

              <div className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: 120 }}>
                <label className="input-label">Rendimiento (Bolsas)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={bagsYield > 0 ? `${bagsYield} bolsas` : ''} 
                  disabled 
                  style={{ background: 'var(--color-bg-admin)', fontWeight: 700, color: 'var(--color-success)' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0, flex: 2, minWidth: 200 }}>
                <label className="input-label">Notas (Opcional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Lote #, o sabor especial..." 
                />
              </div>

              <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={!kilos || loading} style={{ height: 42 }}>
                Guardar
              </button>
            </form>
          </div>

          {/* LEDGER */}
          <div className="card animate-float-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ margin: 0 }}>📖 Libro Mayor (Historial)</h2>
              <select className="input-field" style={{ width: 'auto', padding: '0.2rem 0.5rem' }} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">Todo el historial</option>
                <option value="month">Último Mes</option>
                <option value="week">Última Semana</option>
              </select>
            </div>
            
            {isLoading ? <p>Cargando historial...</p> : logs.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No hay registros en este periodo.</p>
            ) : (
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Materia Prima</th>
                    <th>Rendimiento</th>
                    <th>Notas</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <strong>{new Date(log.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(log.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>{log.kilos} kg</td>
                      <td><span className="badge badge-success">+{log.bags_yield} bolsas</span></td>
                      <td className="text-muted" style={{ fontSize: '0.9rem' }}>{log.notes}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', height: 'auto', minHeight: 0 }} onClick={() => setEditingLog(log)}>✏️</button>
                        <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', height: 'auto', minHeight: 0, color: 'var(--color-danger)' }} onClick={() => handleDelete(log.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Totals */}
        <div className="card animate-float-in" style={{ animationDelay: '0.2s', borderTop: '4px solid var(--color-success)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>📦 Almacén Central</h2>
          <div style={{ background: 'var(--color-bg-admin)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: availableStock > 0 ? 'var(--color-text-primary)' : 'var(--color-danger)', lineHeight: 1 }}>
              {isLoadingStock ? '...' : availableStock}
            </div>
            <div style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.85rem' }}>
              Bolsas Totales Disponibles
            </div>
          </div>
          
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px dashed var(--color-border)' }}>
              <span className="text-muted">Producidas (Total histórico)</span>
              <strong>{totalProduced}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px dashed var(--color-border)' }}>
              <span className="text-muted">En Consignación (Calle)</span>
              <span style={{ color: 'var(--color-warning)' }}>-{totalConsigned}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px dashed var(--color-border)' }}>
              <span className="text-muted">Ventas B2B / Distribuidores</span>
              <span style={{ color: 'var(--color-warning)' }}>-{totalSalesB2B}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px dashed var(--color-border)' }}>
              <span className="text-muted">Ventas Web (Store)</span>
              <span style={{ color: 'var(--color-warning)' }}>-{totalSalesOnline}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px dashed var(--color-border)' }}>
              <span className="text-muted">Ventas Admin / Manuales</span>
              <span style={{ color: 'var(--color-warning)' }}>-{totalAdminSales}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px dashed var(--color-border)' }}>
              <span className="text-muted">Inventario Móvil (In-house)</span>
              <span style={{ color: 'var(--color-warning)' }}>-{totalInhouse}</span>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem', letterSpacing: 1 }}>Equivalencias de Empaque</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-admin)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span>Unidad (1 pieza)</span>
                <strong>{availableStock} paq.</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-admin)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span>Paquete x 2 piezas</span>
                <strong>{Math.floor(availableStock / 2)} paq.</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-admin)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span>Paquete x 6 piezas</span>
                <strong>{Math.floor(availableStock / 6)} paq.</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-admin)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span>Paquete x 12 piezas</span>
                <strong>{Math.floor(availableStock / 12)} paq.</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-admin)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span>Paquete x 20 piezas</span>
                <strong>{Math.floor(availableStock / 20)} paq.</strong>
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
              Estos son los paquetes completos que se pueden armar con el stock actual.
            </p>
          </div>
        </div>

      </div>
      
      {editingLog && <ProductionEditModal log={editingLog} onClose={() => setEditingLog(null)} />}
    </div>
  )
}
