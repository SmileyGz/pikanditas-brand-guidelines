import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import AgreementModal from '../components/AgreementModal'
import PrintableAgreement from '../../../components/PrintableAgreement'

export default function AdminAgreements() {
  const [dateFilter, setDateFilter] = useState('all') // all, week, month, today
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar este acuerdo permanentemente?')) return
    try {
      const { error } = await supabase.from('agreements').delete().eq('id', id)
      if (error) throw error
      queryClient.invalidateQueries(['admin-agreements-ledger'])
    } catch (err) {
      alert('Error al borrar: ' + err.message)
    }
  }

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ['admin-agreements-ledger', dateFilter],
    queryFn: async () => {
      let query = supabase.from('agreements')
        .select(`
          id,
          created_at,
          type,
          status,
          initial_quantity,
          canvas_signature,
          photo_id_url,
          profiles (name),
          stores (name, owner_name)
        `)
        .order('created_at', { ascending: false })

      if (dateFilter !== 'all') {
        const now = new Date()
        let fromDate = new Date()
        if (dateFilter === 'today') {
          fromDate.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'week') {
          const day = fromDate.getDay() || 7
          if (day !== 1) fromDate.setHours(-24 * (day - 1))
          fromDate.setHours(0,0,0,0)
        } else if (dateFilter === 'month') {
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
        }
        query = query.gte('created_at', fromDate.toISOString())
      }

      const { data } = await query
      return data || []
    }
  })

  return (
    <div className="admin-page">
      <header className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">📄 Acuerdos Comerciales</h1>
          <p className="admin-page-subtitle">Firmas digitales y control de concesiones B2B</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Registrar Acuerdo</button>
      </header>

      {/* ── Document Modal ── */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card animate-float-in" style={{ padding: '2rem', textAlign: 'center', maxWidth: selectedDoc.type === 'contract' ? 900 : 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{marginBottom: '1rem', display: 'none'}} className="hide-on-print">{selectedDoc.title}</h2>
            {selectedDoc.type === 'image' && selectedDoc.url ? (
              <img src={selectedDoc.url} alt="Document" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #ccc', background: '#fff' }} />
            ) : selectedDoc.type === 'contract' ? (
              <div style={{ textAlign: 'left' }}>
                <PrintableAgreement data={selectedDoc.data} />
                <button className="btn btn-primary btn-full hide-on-print" style={{ marginTop: '1.5rem' }} onClick={() => window.print()}>🖨️ Imprimir Contrato</button>
              </div>
            ) : <p>No hay documento disponible.</p>}
            <button className="btn btn-secondary btn-full hide-on-print" style={{ marginTop: '1.5rem' }} onClick={() => setSelectedDoc(null)}>Cerrar</button>
          </div>
        </div>
      )}
      
      <div className="card animate-float-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Bóveda de Contratos</h2>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`btn btn-sm ${dateFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setDateFilter('all')}>Histórico</button>
            <button className={`btn btn-sm ${dateFilter === 'month' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setDateFilter('month')}>Mes</button>
            <button className={`btn btn-sm ${dateFilter === 'week' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setDateFilter('week')}>Semana</button>
            <button className={`btn btn-sm ${dateFilter === 'today' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setDateFilter('today')}>Hoy</button>
          </div>
        </div>
        
        {isLoading ? <p>Cargando acuerdos...</p> : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Tienda</th>
                <th>Vendedor</th>
                <th>Tipo</th>
                <th>Firmante</th>
                <th>Documentos</th>
              </tr>
            </thead>
            <tbody>
              {agreements.length === 0 && (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No hay acuerdos registrados.</td></tr>
              )}
              {agreements.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{new Date(a.created_at).toLocaleDateString('es-MX')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(a.created_at).toLocaleTimeString('es-MX')}</div>
                  </td>
                  <td><strong>{a.stores?.name || 'Desconocida'}</strong></td>
                  <td>{a.profiles?.name || 'Vendedor'}</td>
                  <td>
                    {a.type === 'consignacion' ? (
                      <span className="badge badge-warning">Consignación</span>
                    ) : (
                      <span className="badge badge-success">Contado</span>
                    )}
                  </td>
                  <td>{a.stores?.owner_name || 'Sin Nombre'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedDoc({ title: 'Hoja de Acuerdo', type: 'contract', data: a })}
                      >
                        📄 Ver Hoja
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        disabled={!a.canvas_signature}
                        onClick={() => setSelectedDoc({ title: 'Firma Digital', type: 'image', url: a.canvas_signature })}
                      >
                        ✍️ Firma
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        disabled={!a.photo_id_url}
                        onClick={() => setSelectedDoc({ title: 'Identificación Oficial', type: 'image', url: a.photo_id_url })}
                      >
                        🪪 INE
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-danger)', padding: '0.2rem' }}
                        onClick={() => handleDelete(a.id)}
                        title="Borrar Acuerdo"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <AgreementModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
