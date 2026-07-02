import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function TiendaLogin() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1: phone, 2: otp
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signInWithPhone, verifyOtp, role } = useAuthStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (role === 'store' || role === 'admin') { navigate('/tienda/inicio', { replace: true }) }
  }, [role, navigate])

  if (role === 'store' || role === 'admin') return null

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error: err } = await signInWithPhone(phone)
    if (err) { setError('Error al enviar SMS. Verifica tu número.'); setLoading(false) }
    else { setStep(2); setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
      const { error: err } = await Promise.race([ verifyOtp(phone, otp), timeoutPromise ])
      
      if (err) { 
        setError('Código incorrecto o expirado. Intenta de nuevo.')
        setLoading(false) 
      } else {
        const currentRole = useAuthStore.getState().role
        if (currentRole === 'store' || currentRole === 'admin') {
          navigate('/tienda/inicio', { replace: true })
        } else {
          setError(`No eres una tienda (Rol: ${currentRole || 'desconocido'}). Contacta a tu vendedor.`)
          useAuthStore.getState().signOut()
          setLoading(false)
        }
      }
    } catch (err) {
      setError(`Error del sistema: ${err.message || err.toString()}`)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-seller)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
    }}>
      <div className="card animate-float-in" style={{
        width: '100%',
        maxWidth: 400,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-10) var(--space-8)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <img
            src="/logo.png"
            alt="Pikanditas"
            className="animate-gummy-bounce"
            style={{ width: 72, height: 72, objectFit: 'contain', margin: '0 auto var(--space-4)', borderRadius: '50%', background: 'rgba(255,0,85,0.08)', padding: 'var(--space-2)' }}
          />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
            Mi Tiendita 🏪
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            Portal exclusivo para puntos de venta
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label className="input-label">Teléfono celular (10 dígitos)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ padding: '0.75rem', background: 'var(--color-bg-consumer)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>+52</span>
                <input
                  type="tel"
                  placeholder="998 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  className="input-field"
                  style={{ flex: 1 }}
                  required
                />
              </div>
            </div>
            {error && <div style={{ background: 'rgba(255,0,0,0.07)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: '0.85rem' }}>{error}</div>}
            <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'loading' : ''}`} disabled={loading || phone.length < 10}>
              {loading ? '⏳ Enviando...' : '📱 Recibir código por SMS'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Enviado al +52 {phone}
            </p>
            <div className="input-group">
              <label className="input-label">Código de verificación (6 dígitos)</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="input-field"
                required
                style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.5rem' }}
              />
            </div>
            {error && <div style={{ background: 'rgba(255,0,0,0.07)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: '0.85rem' }}>{error}</div>}
            <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'loading' : ''}`} disabled={loading || otp.length < 6}>
              {loading ? '⏳ Verificando...' : '✅ Entrar a mi portal'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStep(1); setOtp('') }}>
              ← Cambiar número
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <a href="/">← Ir al inicio</a>
        </div>
      </div>
    </div>
  )
}
