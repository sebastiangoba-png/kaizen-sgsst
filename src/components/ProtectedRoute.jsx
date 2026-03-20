import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Roles con acceso total a rutas de admin/profesional
const ROLES_ADMIN = ['admin', 'profesional']

// Qué rutas puede ver cada rol
export const PERMISOS = {
  admin:        { rutas: ['/', '/empresas', '/trabajadores'], puedeEditar: true },
  profesional:  { rutas: ['/', '/empresas', '/trabajadores'], puedeEditar: true },
  consultor:    { rutas: ['/', '/empresas', '/trabajadores'], puedeEditar: false },
  cliente:      { rutas: ['/trabajadores'],                   puedeEditar: false },
  trabajador:   { rutas: ['/mi-perfil'],                      puedeEditar: true },
}

export default function ProtectedRoute({ children, rolesPermitidos }) {
  const { session, perfil, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && perfil && !rolesPermitidos.includes(perfil.rol)) {
    // Redirigir según el rol del usuario
    if (perfil.rol === 'trabajador') return <Navigate to="/mi-perfil" replace />
    return <Navigate to="/" replace />
  }

  return children
}
