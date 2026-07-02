import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './AdminLogin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn, role } = useAuthStore()
  const navigate = useNavigate()

  // Already logged in
  React.useEffect(() => {
    if (role === 'admin') { navigate('/admin/dashboard', { replace: true }) }
  }, [role, navigate])

  if (role === 'admin') return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      // Force a maximum timeout of 5 seconds for the login request to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
      const { error: err } = await Promise.race([
        signIn(email, password),
        timeoutPromise
      ]);
      
      if (err) { 
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
        setLoading(false)
      } else {
        const currentRole = useAuthStore.getState().role
        if (currentRole === 'admin') {
          navigate('/admin/dashboard', { replace: true })
        } else {
          setError(`No tienes permisos de administrador (Rol actual: ${currentRole || 'desconocido'}). Contacta a soporte para actualizar tu rol.`)
          useAuthStore.getState().signOut()
          setLoading(false)
        }
      }
    } catch (err) {
      console.error("Login exception:", err)
      setError("Error interno del navegador. Si usas Safari, deshabilita el bloqueo estricto de rastreo o usa Chrome/Firefox.")
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-root">
      <div className="admin-login-bg" />
      <div className="admin-login-card animate-float-in">
        <div className="admin-login-logo">
          <img src="/logo.png" alt="Pikanditas" className="animate-gummy-bounce" />
          <h1>Pikanditas Admin</h1>
          <p>Acceso restringido / Restricted access</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="admin-email">Correo electrónico</label>
            <input
              id="admin-email"
              className="input-field"
              type="email"
              placeholder="admin@pikanditas.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className={`btn btn-primary btn-full btn-lg ${loading ? 'loading' : ''}`} type="submit" disabled={loading}>
            {loading ? '⏳ Verificando...' : '🔐 Entrar al Panel'}
          </button>
        </form>

        <div className="login-links">
          <a href="/">← Ver tienda</a>
          <a href="/seller">Portal Vendedor →</a>
        </div>

        <footer className="admin-login-footer">
          <p className="powered-by">Powered by Jonla Agencia</p>
        </footer>
      </div>
    </div>
  )
}
