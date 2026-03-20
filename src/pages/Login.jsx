import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, session, perfil, loading } = useAuth()
  const navigate = useNavigate()
  const [usuario,  setUsuario]  = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [enviando, setEnviando] = useState(false)

  // Si ya hay sesión activa, redirigir según rol
  useEffect(() => {
    if (loading) return
    if (session && perfil) {
      if (perfil.rol === 'trabajador') navigate('/mi-perfil', { replace: true })
      else navigate('/', { replace: true })
    }
  }, [session, perfil, loading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!usuario || !password) {
      setError('Ingresa tu cédula/usuario y contraseña.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await login(usuario, password)
      // La redirección la maneja el useEffect de arriba cuando perfil cargue
    } catch {
      setError('Usuario o contraseña incorrectos.')
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <span className="text-white font-extrabold text-3xl select-none">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kaizen SGSST</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Gestión de Seguridad</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cédula o usuario
              </label>
              <input
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder="Ej: 1070624803 o diego"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              {enviando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Kaizen SGSST v1.0
        </p>
      </div>
    </div>
  )
}
