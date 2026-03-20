import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROL_LABELS = {
  admin:       { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
  profesional: { label: 'Profesional',   color: 'bg-blue-100 text-blue-700' },
  consultor:   { label: 'Consultor',     color: 'bg-gray-100 text-gray-700' },
  cliente:     { label: 'Cliente',       color: 'bg-green-100 text-green-700' },
  trabajador:  { label: 'Trabajador',    color: 'bg-yellow-100 text-yellow-700' },
}

const nav = [
  {
    name: 'Dashboard',
    href: '/',
    roles: ['admin', 'profesional', 'consultor'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Empresas',
    href: '/empresas',
    roles: ['admin', 'profesional', 'consultor'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: 'Trabajadores',
    href: '/trabajadores',
    roles: ['admin', 'profesional', 'consultor', 'cliente'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
]

export default function Layout({ children }) {
  const location   = useLocation()
  const navigate   = useNavigate()
  const { perfil, logout } = useAuth()

  const rol        = perfil?.rol ?? ''
  const rolConfig  = ROL_LABELS[rol] ?? { label: rol, color: 'bg-gray-100 text-gray-700' }
  const nombreCompleto = perfil
    ? `${perfil.nombres ?? ''} ${perfil.apellidos ?? ''}`.trim()
    : ''

  const navVisible = nav.filter(item => item.roles.includes(rol))

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-extrabold text-xl select-none">K</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">Kaizen</h1>
            <p className="text-xs text-blue-600 font-medium">Gestión SGSST</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navVisible.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={active ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
                {item.name}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </Link>
            )
          })}
        </nav>

        {/* Usuario + Logout */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
          {nombreCompleto && (
            <div>
              <p className="text-xs font-semibold text-gray-800 truncate">{nombreCompleto}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${rolConfig.color}`}>
                {rolConfig.label}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-sm select-none">K</span>
          </div>
          <span className="font-bold text-gray-900 flex-1">Kaizen SGSST</span>
          {nombreCompleto && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rolConfig.color}`}>
              {rolConfig.label}
            </span>
          )}
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-20 safe-area-bottom">
          {navVisible.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className={active ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
