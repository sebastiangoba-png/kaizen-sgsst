import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MiPerfil() {
  const { perfil, logout } = useAuth()
  const navigate = useNavigate()
  const [showPwd,  setShowPwd]  = useState(false)
  const [pwd,      setPwd]      = useState({ nueva: '', confirmar: '' })
  const [pwdState, setPwdState] = useState({ loading: false, error: '', ok: false })

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  async function handleCambiarPwd(e) {
    e.preventDefault()
    if (pwd.nueva.length < 6)             { setPwdState({ loading: false, error: 'Mínimo 6 caracteres.', ok: false }); return }
    if (pwd.nueva !== pwd.confirmar)      { setPwdState({ loading: false, error: 'Las contraseñas no coinciden.', ok: false }); return }
    setPwdState({ loading: true, error: '', ok: false })
    const { error } = await supabase.auth.updateUser({ password: pwd.nueva })
    if (error) {
      setPwdState({ loading: false, error: error.message, ok: false })
    } else {
      setPwd({ nueva: '', confirmar: '' })
      setPwdState({ loading: false, error: '', ok: true })
      setTimeout(() => { setShowPwd(false); setPwdState({ loading: false, error: '', ok: false }) }, 2000)
    }
  }

  if (!perfil) return null

  const nombre = `${perfil.nombres ?? ''} ${perfil.apellidos ?? ''}`.trim()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 shadow-sm">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-extrabold text-base select-none">K</span>
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-base leading-tight">Kaizen SGSST</h1>
          <p className="text-xs text-blue-600 font-medium">Mi perfil</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Salir
        </button>
      </header>

      {/* Contenido */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">

        {/* Avatar y nombre */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-4 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold text-3xl">
              {(perfil.nombres ?? '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{nombre || 'Sin nombre'}</h2>
          <span className="mt-1 inline-block bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-0.5 rounded-full">
            Trabajador
          </span>
        </div>

        {/* Datos personales */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Datos personales
          </h3>

          <DataRow label="Cédula" value={perfil.numero_documento} />
          <DataRow label="Nombre completo" value={nombre} />
          {perfil.cargo && <DataRow label="Cargo" value={perfil.cargo} />}
          {perfil.area && <DataRow label="Área" value={perfil.area} />}
          {perfil.telefono && <DataRow label="Teléfono" value={perfil.telefono} />}
          {perfil.email && <DataRow label="Correo" value={perfil.email} />}
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 overflow-hidden">
          <button
            onClick={() => { setShowPwd(v => !v); setPwdState({ loading: false, error: '', ok: false }) }}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Cambiar contraseña
            </span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showPwd ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPwd && (
            <div className="px-6 pb-5 border-t border-gray-50">
              {pwdState.ok ? (
                <p className="text-sm text-green-600 font-medium py-3">Contraseña actualizada correctamente.</p>
              ) : (
                <form onSubmit={handleCambiarPwd} className="space-y-3 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nueva contraseña</label>
                    <input type="password" value={pwd.nueva} onChange={e => setPwd(p => ({ ...p, nueva: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar contraseña</label>
                    <input type="password" value={pwd.confirmar} onChange={e => setPwd(p => ({ ...p, confirmar: e.target.value }))}
                      placeholder="Repite la contraseña"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {pwdState.error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{pwdState.error}</p>}
                  <button type="submit" disabled={pwdState.loading}
                    className="w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors">
                    {pwdState.loading ? 'Guardando...' : 'Actualizar contraseña'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Mensaje informativo */}
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-sm text-blue-700">
            Para actualizar tus datos o documentos, comunícate con el equipo Kaizen.
          </p>
        </div>
      </main>
    </div>
  )
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value ?? '—'}</span>
    </div>
  )
}
