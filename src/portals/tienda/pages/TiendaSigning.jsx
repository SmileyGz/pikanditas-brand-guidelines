import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

export default function TiendaSigning() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [signed, setSigned] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSign = () => {
    setSigned(true)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from('agreements').update({ status: 'active' }).eq('id', id)
      if (error) throw error
      
      setLoading(false)
      alert('¡Acuerdo firmado con éxito! Tu vendedor recibirá la notificación.')
      navigate('/tienda/inicio')
    } catch (e) {
      console.error(e)
      alert('Error al firmar: ' + e.message)
      setLoading(false)
    }
  }

  return (
    <div className="seller-section animate-float-in">
      <h2 className="seller-section-title">Firmar Pagaré</h2>
      
      <div className="card" style={{ padding: '1.5rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Acuerdo de Consignación: <span style={{ color: 'var(--color-primary)' }}>{id}</span></p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Al firmar este documento, aceptas recibir mercancía a consignación y comprometes su pago o devolución en las fechas acordadas con tu vendedor.
        </p>

        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Firma Digital del Titular</label>
        
        <div style={{
          width: '100%',
          height: '200px',
          background: 'var(--color-bg-consumer)',
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'crosshair',
          marginBottom: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }} onClick={handleSign}>
          {!signed ? (
            <span style={{ color: 'var(--color-text-muted)', userSelect: 'none' }}>Toca aquí para simular firma</span>
          ) : (
            <svg viewBox="0 0 200 100" style={{ width: '80%', height: '80%', stroke: 'var(--color-text-primary)', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' }}>
              <path d="M 20 50 Q 40 10 60 50 T 100 50 T 140 30 T 180 50" strokeDasharray="300" strokeDashoffset="0" className="animate-draw" />
            </svg>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-ghost" 
            style={{ flex: 1 }}
            onClick={() => setSigned(false)}
          >
            Borrar
          </button>
          <button 
            className={`btn btn-primary ${loading ? 'loading' : ''}`} 
            style={{ flex: 2 }}
            onClick={handleSubmit}
            disabled={!signed || loading}
          >
            {loading ? 'Guardando...' : 'Aceptar y Firmar'}
          </button>
        </div>
      </div>
      <style>{`
        .animate-draw {
          animation: drawSignature 1.5s ease forwards;
        }
        @keyframes drawSignature {
          0% { stroke-dashoffset: 300; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
