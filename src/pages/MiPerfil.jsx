import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function MiPerfil() {
  const { perfil, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
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
