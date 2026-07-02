import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import SaleReceiptModal from '../components/SaleReceiptModal'
import SaleEditModal from '../components/SaleEditModal'
import ReceiptTicket from '../../../components/ReceiptTicket'

export default function AdminSales() {
  const queryClient = useQueryClient()
  const [dateFilter, setDateFilter] = useState('all') // all, week, month, today
  const [showModal, setShowModal] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [viewingReceipt, setViewingReceipt] = useState(null)

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['admin-sales-ledger', dateFilter],
    queryFn: async () => {
      // 1. Fetch Admin Sales Receipts (B2C or Admin B2B)
      let adminSalesQuery = supabase.from('sales_receipts').select('*, store:stores(name, tier)')
      
      // 2. Fetch Seller Sales (Mobile app sales)
      let mobileSalesQuery = supabase.from('sales').select('*, store:stores(name, tier), seller:profiles(name)')

      // 3. Fetch Consignments (CxC)
      let consQuery = supabase.from('consignments').select('*, store:stores(name, tier)')

      // Apply date filters
      if (dateFilter === 'today') {
        const today = new Date()
        today.setHours(0,0,0,0)
        adminSalesQuery = adminSalesQuery.gte('created_at', today.toISOString())
        mobileSalesQuery = mobileSalesQuery.gte('created_at', today.toISOString())
        consQuery = consQuery.gte('created_at', today.toISOString())
      } else if (dateFilter === 'week') {
        const lastWeek = new Date()
        lastWeek.setDate(lastWeek.getDate() - 7)
        adminSalesQuery = adminSalesQuery.gte('created_at', lastWeek.toISOString())
        mobileSalesQuery = mobileSalesQuery.gte('created_at', lastWeek.toISOString())
        consQuery = consQuery.gte('created_at', lastWeek.toISOString())
      } else if (dateFilter === 'month') {
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        adminSalesQuery = adminSalesQuery.gte('created_at', lastMonth.toISOString())
        mobileSalesQuery = mobileSalesQuery.gte('created_at', lastMonth.toISOString())
        consQuery = consQuery.gte('created_at', lastMonth.toISOString())
      }

      const [adminSalesRes, mobileSalesRes, consRes] = await Promise.all([adminSalesQuery, mobileSalesQuery, consQuery])

      const rawAdminSales = adminSalesRes.error ? [] : (adminSalesRes.data || [])
      const rawMobileSales = mobileSalesRes.error ? [] : (mobileSalesRes.data || [])
      const rawCons = consRes.error ? [] : (consRes.data || [])

      const combined = []

      rawAdminSales.forEach(s => {
        combined.push({
          id: s.id,
          table: 'sales_receipts',
          date: new Date(s.created_at),
          clientName: s.store?.name || s.client_name || 'B2C Público',
          typeLabel: s.sale_type === 'b2c_20' ? 'Venta Online/Pública' : (s.sale_type === 'compra_directa_12' ? 'Venta B2B ($12)' : 'Venta Mayorista ($10)'),
          quantity: s.quantity,
          total: s.total_mxn,
          status: s.payment_status,
          isConsignment: false
        })
      })

      rawMobileSales.forEach(s => {
        combined.push({
          id: s.id,
          table: 'sales',
          date: new Date(s.created_at),
          clientName: s.store?.name || 'Venta Ruta B2C',
          typeLabel: `Ruta (${s.seller?.name || 'Vendedor'})`,
          quantity: s.quantity,
          total: s.total_mxn,
          status: s.payment_status,
          isConsignment: false
        })
      })

      rawCons.forEach(c => {
        // Calculate theoretical CxC value based on store tier
        const tierPrice = c.store?.tier === 'distributor_10' ? 10 : 12
        combined.push({
          id: c.id,
          date: new Date(c.created_at),
          clientName: c.store?.name || 'Tienda Desconocida',
          typeLabel: 'Consignación',
          quantity: c.stock_delivered,
          total: c.stock_delivered * tierPrice,
          status: 'cxc', // Cuentas por Cobrar
          isConsignment: true
        })
      })

      // Sort chronological descending (newest first)
      combined.sort((a, b) => b.date - a.date)

      return combined
    }
  })

  // Group stats
  const totalBolsas = ledger.reduce((acc, row) => acc + (row.quantity || 0), 0)
  const totalCobrado = ledger.filter(r => r.status === 'paid').reduce((acc, r) => acc + (r.total || 0), 0)
  const totalCxC = ledger.filter(r => r.status === 'cxc' || r.status === 'pending').reduce((acc, r) => acc + (r.total || 0), 0)

  const handleDelete = async (row) => {
    if (!window.confirm(`¿Seguro que deseas eliminar esta operación de ${row.clientName}?`)) return
    
    const table = row.isConsignment ? 'consignments' : 'sales_receipts'
    const { error } = await supabase.from(table).delete().eq('id', row.id)
    
    if (error) {
      alert('Error al borrar: ' + error.message)
    } else {
      queryClient.invalidateQueries(['admin-sales-ledger'])
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">💰 Gran Libro Diario</h1>
        <p className="admin-page-subtitle">Historial de Salidas (Ventas Contado y Cuentas por Cobrar)</p>
      </header>
      
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Bolsas Totales (Periodo)</div>
          <div className="stat-value">{totalBolsas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dinero Cobrado</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>${totalCobrado.toLocaleString('es-MX')}</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid var(--color-warning)' }}>
          <div className="stat-label">Cuentas por Cobrar (CxC)</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>${totalCxC.toLocaleString('es-MX')}</div>
        </div>
      </div>

      <div className="card animate-float-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Registro de Movimientos</h2>
            <select className="input-field" style={{ width: 'auto', padding: '0.2rem 0.5rem', margin: 0 }} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">Todo el Historial</option>
              <option value="today">Hoy</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
            </select>
          </div>
          
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Nueva Operación</button>
        </div>
        
        {isLoading ? <p>Cargando libro diario...</p> : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente / Destino</th>
                <th>Tipo de Movimiento</th>
                <th>Bolsas</th>
                <th>Monto ($)</th>
                <th>Estatus</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 && (
                <tr><td colSpan="7" style={{textAlign:'center', padding:'2rem'}}>No hay operaciones registradas en este periodo.</td></tr>
              )}
              {ledger.map(row => (
                <tr key={`${row.isConsignment ? 'cons' : 'sale'}-${row.id}`}>
                  <td>
                    <strong>{row.date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</strong>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {row.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <strong>{row.clientName}</strong>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{row.typeLabel}</span>
                  </td>
                  <td>{row.quantity} bolsas</td>
                  <td><strong>${row.total?.toLocaleString('es-MX')}</strong></td>
                  <td>
                    {row.status === 'paid' ? (
                      <span className="badge badge-success">Pagado</span>
                    ) : row.status === 'cxc' ? (
                      <span className="badge badge-warning">CxC (Consignación)</span>
                    ) : (
                      <span className="badge badge-danger">Pendiente</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', height: 'auto', minHeight: 0 }} onClick={() => setViewingReceipt(row)} title="Ver Recibo">🧾</button>
                    <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', height: 'auto', minHeight: 0 }} onClick={() => setEditingRow(row)} title="Editar">✏️</button>
                    <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', height: 'auto', minHeight: 0, color: 'var(--color-danger)' }} onClick={() => handleDelete(row)} title="Borrar">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <SaleReceiptModal onClose={() => setShowModal(false)} />}
      {editingRow && <SaleEditModal row={editingRow} onClose={() => setEditingRow(null)} />}
      
      {/* ── Receipt View Modal ── */}
      {viewingReceipt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 'var(--space-4)'
        }}>
          <div className="card animate-float-in" style={{ width: '100%', maxWidth: 360, padding: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ReceiptTicket data={viewingReceipt} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} className="btn btn-secondary btn-full">🖨️ Imprimir</button>
                <button onClick={() => {
                  const text = `🧾 *NOTA DE VENTA PIKANDITAS*\n\nFolio: ${viewingReceipt.id.split('-')[0].toUpperCase()}\nFecha: ${viewingReceipt.date.toLocaleDateString('es-MX')}\nCliente: ${viewingReceipt.clientName}\n\nConcepto: ${viewingReceipt.quantity} bolsas Pikanditas 60g\nTotal: $${viewingReceipt.total} MXN\n\n🌶️ ¡Pika la vida!\nSíguenos: @Pikanditasmx`
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                }} className="btn btn-success btn-full" style={{ background: '#25D366', color: 'white' }}>💬 WhatsApp</button>
              </div>
              <button onClick={() => setViewingReceipt(null)} className="btn btn-ghost btn-full">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
