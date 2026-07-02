import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function SellerLogin() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signInWithPhone, verifyOtp, role } = useAuthStore()
  const navigate = useNavigate()

  if (role === 'seller' || role === 'admin') { navigate('/seller/home', { replace: true }); return null }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error: err } = await signInWithPhone(phone)
    if (err) { setError('No pudimos enviar el código. Verifica tu número.'); setLoading(false) }
    else { setStep('otp'); setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error: err } = await verifyOtp(phone, otp)
    if (err) { setError('Código incorrecto o expirado.'); setLoading(false) }
    else navigate('/seller/home', { replace: true })
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--color-bg-seller)',display:'flex',alignItems:'center',justifyContent:'center',padding:'var(--space-6)'}}>
      <div className="card animate-float-in" style={{width:'100%',maxWidth:400,borderRadius:'var(--radius-xl)',padding:'var(--space-10) var(--space-8)'}}>
        <div style={{textAlign:'center',marginBottom:'var(--space-8)'}}>
          <img src="/logo.png" alt="Pikanditas" className="animate-gummy-bounce" style={{width:72,height:72,objectFit:'contain',margin:'0 auto var(--space-4)',borderRadius:'50%',background:'rgba(255,0,85,0.08)',padding:'var(--space-2)'}} />
          <h1 style={{fontFamily:'var(--font-heading)',fontSize:'1.4rem',fontWeight:800}}>Portal Vendedor 🌶️</h1>
          <p style={{color:'var(--color-text-muted)',fontSize:'0.85rem',marginTop:'var(--space-1)'}}>Accede con tu número de WhatsApp</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
            <div className="input-group">
              <label className="input-label">Número de teléfono</label>
              <input className="input-field" type="tel" placeholder="998 123 4567" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
              <p style={{fontSize:'0.75rem',color:'var(--color-text-muted)',marginTop:'4px'}}>Recibirás un código SMS de verificación</p>
            </div>
            {error && <div style={{background:'rgba(255,0,0,0.07)',color:'var(--color-danger)',borderRadius:'var(--radius-md)',padding:'var(--space-3)',fontSize:'0.85rem'}}>{error}</div>}
            <button className={`btn btn-primary btn-full btn-lg ${loading?'loading':''}`} type="submit" disabled={loading}>{loading?'⏳ Enviando...':'📱 Enviar código'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
            <p style={{textAlign:'center',color:'var(--color-text-muted)',fontSize:'0.9rem'}}>Código enviado a <strong>+52 {phone}</strong></p>
            <div className="input-group">
              <label className="input-label">Código de 6 dígitos</label>
              <input className="input-field" type="number" placeholder="123456" value={otp} onChange={(e)=>setOtp(e.target.value)} required maxLength={6} style={{letterSpacing:'0.3em',textAlign:'center',fontSize:'1.5rem'}} />
            </div>
            {error && <div style={{background:'rgba(255,0,0,0.07)',color:'var(--color-danger)',borderRadius:'var(--radius-md)',padding:'var(--space-3)',fontSize:'0.85rem'}}>{error}</div>}
            <button className={`btn btn-primary btn-full btn-lg ${loading?'loading':''}`} type="submit" disabled={loading}>{loading?'⏳ Verificando...':'✅ Entrar al portal'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={()=>{setStep('phone');setOtp('')}}>← Cambiar número</button>
          </form>
        )}
        <div style={{textAlign:'center',marginTop:'var(--space-6)',fontSize:'0.75rem',color:'var(--color-text-muted)'}}>
          <a href="/">← Ver tienda</a> · <a href="/admin" style={{color:'var(--color-text-muted)'}}>Admin</a>
        </div>
        <p style={{textAlign:'center',marginTop:'var(--space-8)',fontSize:'0.65rem',opacity:0.5,color:'var(--color-text-muted)'}}>Powered by Jonla Agencia</p>
      </div>
    </div>
  )
}
