import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Empresas from './pages/Empresas'
import Trabajadores from './pages/Trabajadores'
import TrabajadorDetalle from './pages/TrabajadorDetalle'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/trabajadores" element={<Trabajadores />} />
          <Route path="/trabajadores/:id" element={<TrabajadorDetalle />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}
