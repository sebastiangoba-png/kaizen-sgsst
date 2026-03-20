import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Empresas from './pages/Empresas'
import Trabajadores from './pages/Trabajadores'
import TrabajadorDetalle from './pages/TrabajadorDetalle'
import MiPerfil from './pages/MiPerfil'

const ROLES_ADMIN    = ['admin', 'profesional', 'consultor']
const ROLES_FULL     = ['admin', 'profesional', 'consultor', 'cliente']
const ROLES_TRABAJADOR = ['trabajador']

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Trabajador: solo su perfil */}
          <Route
            path="/mi-perfil"
            element={
              <ProtectedRoute rolesPermitidos={ROLES_TRABAJADOR}>
                <MiPerfil />
              </ProtectedRoute>
            }
          />

          {/* Admin / Profesional / Consultor */}
          <Route
            path="/"
            element={
              <ProtectedRoute rolesPermitidos={ROLES_ADMIN}>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/empresas"
            element={
              <ProtectedRoute rolesPermitidos={ROLES_ADMIN}>
                <Layout><Empresas /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trabajadores"
            element={
              <ProtectedRoute rolesPermitidos={ROLES_FULL}>
                <Layout><Trabajadores /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trabajadores/:id"
            element={
              <ProtectedRoute rolesPermitidos={ROLES_FULL}>
                <Layout><TrabajadorDetalle /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
