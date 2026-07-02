import React, { useState, useEffect } from 'react'
import { useSettings } from '../../../hooks/useSettings'

export default function AdminSettings() {
  const { settings, isLoading, updateSettings } = useSettings()
  
  const [activeTab, setActiveTab] = useState('comercial')
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Sincronizar datos iniciales cuando cargan
  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  if (isLoading || !formData.id) {
    return <div style={{padding:'3rem',textAlign:'center'}}>Cargando configuración...</div>
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    try {
      await updateSettings(formData)
      setSuccessMsg('¡Configuración guardada exitosamente!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert('Error guardando configuración: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleZoneAdd = () => {
    const newZone = window.prompt('Nombre de la nueva zona:')
    if (newZone && newZone.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        zonas_activas: [...(prev.zonas_activas || []), newZone.trim()]
      }))
    }
  }

  const handleZoneRemove = (zoneToRemove) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la zona "${zoneToRemove}"?`)) return
    setFormData(prev => ({
      ...prev,
      zonas_activas: (prev.zonas_activas || []).filter(z => z !== zoneToRemove)
    }))
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">⚙️ Centro de Control</h1>
        <p className="admin-page-subtitle">Parámetros maestros del negocio (Director Comercial & Sistemas)</p>
      </header>

      {successMsg && (
        <div className="card animate-slide-down" style={{ background: 'var(--color-success)', color: 'white', border: 'none', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'comercial' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('comercial')}
        >
          💰 Comercial (Precios)
        </button>
        <button 
          className={`btn ${activeTab === 'ops' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('ops')}
        >
          📦 Operaciones
        </button>
        <button 
          className={`btn ${activeTab === 'zonas' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('zonas')}
        >
          🗺️ Zonas
        </button>
      </div>

      <form onSubmit={handleSave} className="card animate-float-in" style={{ maxWidth: '800px' }}>
        
        {activeTab === 'comercial' && (
          <div className="settings-section">
            <h2 style={{borderBottom:'1px solid var(--color-border)', paddingBottom:'0.5rem', marginBottom:'1.5rem'}}>
              Precios y Márgenes
            </h2>
            <p className="text-muted" style={{marginBottom:'1.5rem'}}>Estos valores alimentan los contratos, reportes de rentabilidad y la tienda web.</p>
            
            <div className="form-group" style={{ background: '#f5f5f7', padding: '1rem', borderRadius: '8px' }}>
              <label>Costo Exacto de Producción (MXN)</label>
              <input 
                type="number" step="0.01" className="input-field" 
                value={formData.costo_produccion || ''} 
                onChange={e => handleChange('costo_produccion', parseFloat(e.target.value))}
              />
              <small className="text-muted">Calculado por el Director Comercial (Incluye receta + empaque).</small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Precio Público Sugerido (B2C)</label>
                <input 
                  type="number" step="0.01" className="input-field" 
                  value={formData.precio_publico || ''} 
                  onChange={e => handleChange('precio_publico', parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Precio Mayoreo (Tienditas)</label>
                <input 
                  type="number" step="0.01" className="input-field" 
                  value={formData.precio_mayoreo || ''} 
                  onChange={e => handleChange('precio_mayoreo', parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Precio Distribuidor (B2B Gran Volumen)</label>
                <input 
                  type="number" step="0.01" className="input-field" 
                  value={formData.precio_distribuidor || ''} 
                  onChange={e => handleChange('precio_distribuidor', parseFloat(e.target.value))}
                />
              </div>
            </div>
            
            {/* Margen Demo */}
            <div style={{marginTop:'1.5rem', padding:'1rem', background:'rgba(255,0,85,0.05)', borderRadius:'8px', border:'1px solid var(--color-primary)'}}>
              <h4 style={{margin:0, color:'var(--color-primary)'}}>💡 Simulador de Margen (Basado en Configuración)</h4>
              <p style={{margin:'0.5rem 0 0'}}>
                Vendiendo a Tienditas, ganas <strong>${((formData.precio_mayoreo || 0) - (formData.costo_produccion || 0)).toFixed(2)}</strong> MXN por bolsa. <br/>
                Vendiendo a Público, ganas <strong>${((formData.precio_publico || 0) - (formData.costo_produccion || 0)).toFixed(2)}</strong> MXN por bolsa.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'ops' && (
          <div className="settings-section">
            <h2 style={{borderBottom:'1px solid var(--color-border)', paddingBottom:'0.5rem', marginBottom:'1.5rem'}}>
              Reglas de Operación
            </h2>
            
            <div className="form-group">
              <label>Días de Gracia para Consignaciones</label>
              <input 
                type="number" className="input-field" 
                value={formData.dias_gracia_consignacion || ''} 
                onChange={e => handleChange('dias_gracia_consignacion', parseInt(e.target.value, 10))}
              />
              <small className="text-muted">Cantidad de días estándar antes de requerir revisión de inventario.</small>
            </div>

            <div className="form-group">
              <label>Teléfono Central de Soporte / Pedidos (WhatsApp)</label>
              <input 
                type="text" className="input-field" 
                value={formData.telefono_soporte || ''} 
                onChange={e => handleChange('telefono_soporte', e.target.value)}
              />
              <small className="text-muted">A dónde se redirigen los clientes web y tiendas para ayuda (sin el +52).</small>
            </div>
          </div>
        )}

        {activeTab === 'zonas' && (
          <div className="settings-section">
            <h2 style={{borderBottom:'1px solid var(--color-border)', paddingBottom:'0.5rem', marginBottom:'1.5rem'}}>
              Zonas de Reparto Activas
            </h2>
            <p className="text-muted" style={{marginBottom:'1.5rem'}}>
              Estas zonas aparecen en los formularios cuando los vendedores registran una nueva tienda o cliente.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {(formData.zonas_activas || []).map((zona, idx) => (
                <div key={idx} style={{ background: 'var(--color-bg-elevated)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{zona}</span>
                  <button type="button" onClick={() => handleZoneRemove(zona)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>
              ))}
            </div>
            
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleZoneAdd}>
              + Añadir Nueva Zona
            </button>
          </div>
        )}

        <hr style={{ margin: '2rem 0', borderColor: 'var(--color-border)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>

      </form>
    </div>
  )
}
