import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function GlobalAlerts() {
  const [activeAlert, setActiveAlert] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Escuchar inserciones nuevas en la tabla panic_events usando WebSockets
    const channel = supabase
      .channel('public:panic_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'panic_events' },
        (payload) => {
          console.log('🚨 EVENTO REALTIME RECIBIDO:', payload)
          // Play a sound (if permitted by browser policy)
          try {
            const audio = new Audio('/alarm.mp3') // Assume an alarm exists or fallback to system beep
            audio.play().catch(() => {}) // Ignore if browser blocks autoplay
          } catch (e) {}
          
          setActiveAlert(payload.new)
        }
      )
      .subscribe((status, err) => {
        console.log('🔌 Estatus de conexión Realtime:', status, err || '')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!activeAlert) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999999,
      background: '#ff0000',
      color: 'white',
      padding: '1.5rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      boxShadow: '0 10px 30px rgba(255, 0, 0, 0.6)',
      animation: 'slideDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), flashBg 2s infinite',
      borderBottom: '5px solid #8b0000'
    }}>
      <span style={{ fontSize: '3rem', animation: 'jiggle 1s infinite' }}>🚨</span>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>¡Emergencia Reportada!</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '1.1rem', opacity: 1, fontWeight: 500 }}>
          Alguien acaba de activar el botón de pánico: <strong>"{activeAlert.reason}"</strong>
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          className="btn" 
          style={{ background: 'white', color: '#ff0000', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', padding: '0.8rem 1.5rem' }}
          onClick={() => {
            setActiveAlert(null)
            navigate('/admin/alertas')
          }}
        >
          Ir a Central
        </button>
        <button 
          className="btn btn-ghost" 
          style={{ color: 'white', opacity: 0.8 }}
          onClick={() => setActiveAlert(null)}
        >
          Cerrar
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes flashBg {
          0% { background-color: #ff0000; }
          50% { background-color: #d10000; }
          100% { background-color: #ff0000; }
        }
        @keyframes jiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  )
}
