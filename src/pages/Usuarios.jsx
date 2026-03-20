import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../lib/adminApi'

const ROLES = ['admin', 'profesional', 'consultor', 'cliente']
const ROL_COLOR = {
  admin:       'bg-purple-100 text-purple-700',
  profesional: 'bg-blue-100 text-blue-700',
  consultor:   'bg-gray-100 text-gray-700',
  cliente:     'bg-green-100 text-green-700',
}

// ── Modal Crear ──────────────────────────────────────────────────

function ModalCrear({ onClose, onSaved }) {
  const [form, setForm]     = useState({ nombres: '', apellidos: '', email_usuario: '', rol: 'profesional' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombres || !form.email_usuario) { setError('Nombre y usuario son obligatorios.'); return }
    setLoading(true); setError('')
    try {
      await adminApi.crearProfesional(form)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal titulo="Nuevo profesional Kaizen" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombres *" value={form.nombres} onChange={set('nombres')} />
          <Field label="Apellidos" value={form.apellidos} onChange={set('apellidos')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <input
              type="text" value={form.email_usuario} onChange={set('email_usuario')}
              placeholder="diego"
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <span className="px-2 py-2 bg-gray-50 text-gray-400 text-sm border-l border-gray-300">
              @kaizen.internal
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select value={form.rol} onChange={set('rol')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <p className="text-xs text-gray-400">La contraseña se asigna desde el panel de Supabase.</p>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <BotonesModal onClose={onClose} loading={loading} labelOk="Crear profesional" />
      </form>
    </Modal>
  )
}

// ── Modal Editar ─────────────────────────────────────────────────

function ModalEditar({ prof, onClose, onSaved }) {
  const [form, setForm]       = useState({ nombres: prof.nombres ?? '', apellidos: prof.apellidos ?? '', rol: prof.rol, activo: prof.activo })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await adminApi.editarProfesional({ id: prof.id, ...form, activo: form.activo === true || form.activo === 'true' })
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal titulo="Editar profesional" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombres" value={form.nombres} onChange={set('nombres')} />
          <Field label="Apellidos" value={form.apellidos} onChange={set('apellidos')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={form.rol} onChange={set('rol')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={String(form.activo)} onChange={e => setForm(f => ({ ...f, activo: e.target.value === 'true' }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <BotonesModal onClose={onClose} loading={loading} labelOk="Guardar cambios" />
      </form>
    </Modal>
  )
}

// ── Modal Contraseña (admin) ─────────────────────────────────────

function ModalPassword({ prof, onClose }) {
  const [password, setPassword]   = useState('')
  const [confirm,  setConfirm]    = useState('')
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState('')
  const [ok,       setOk]         = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6)         { setError('Mínimo 6 caracteres.'); return }
    if (password !== confirm)        { setError('Las contraseñas no coinciden.'); return }
    if (!prof.user_id)               { setError('Este profesional aún no tiene usuario en Auth. Créalo primero desde Supabase.'); return }
    setLoading(true); setError('')
    try {
      await adminApi.cambiarPassword(prof.user_id, password)
      setOk(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const nombre = `${prof.nombres ?? ''} ${prof.apellidos ?? ''}`.trim()

  return (
    <Modal titulo="Cambiar contraseña" onClose={onClose}>
      {ok ? (
        <div className="text-center py-4 space-y-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">Contraseña actualizada</p>
          <p className="text-xs text-gray-500">{nombre} ya puede ingresar con la nueva contraseña.</p>
          <button onClick={onClose} className="mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Usuario: <span className="font-medium">{nombre}</span></p>
          <Field label="Nueva contraseña" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" />
          <Field label="Confirmar contraseña" value={confirm}  onChange={e => setConfirm(e.target.value)}  type="password" placeholder="Repite la contraseña" />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <BotonesModal onClose={onClose} loading={loading} labelOk="Cambiar contraseña" />
        </form>
      )}
    </Modal>
  )
}

// ── Página principal ─────────────────────────────────────────────

export default function Usuarios() {
  const [profesionales, setProfesionales] = useState([])
  const [trabajadores,  setTrabajadores]  = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [tab,           setTab]           = useState('profesionales')
  const [modal,         setModal]         = useState(null)
  const [busqueda,      setBusqueda]      = useState('')

  const cargar = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await adminApi.listar()
      setProfesionales(data.profesionales)
      setTrabajadores(data.trabajadores)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function cerrarYRecargar() { setModal(null); cargar() }

  const profFiltrados = profesionales.filter(p =>
    `${p.nombres} ${p.apellidos} ${p.email}`.toLowerCase().includes(busqueda.toLowerCase())
  )
  const trabFiltrados = trabajadores.filter(t =>
    `${t.nombres} ${t.apellidos} ${t.numero_documento}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de accesos al sistema</p>
        </div>
        <button
          onClick={() => setModal({ tipo: 'crear' })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo profesional
        </button>
      </div>

      {/* Tabs + Búsqueda */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'profesionales', label: `Equipo Kaizen (${profesionales.length})` },
            { key: 'trabajadores',  label: `Trabajadores (${trabajadores.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'profesionales' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profFiltrados.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Sin resultados</td></tr>
              )}
              {profFiltrados.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nombres} {p.apellidos}</td>
                  <td className="px-4 py-3 text-gray-500">{p.email?.replace('@kaizen.internal', '')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROL_COLOR[p.rol] ?? 'bg-gray-100 text-gray-700'}`}>{p.rol}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setModal({ tipo: 'editar', data: p })} className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors">
                        Editar
                      </button>
                      <button onClick={() => setModal({ tipo: 'password', data: p })} className="text-xs font-medium text-gray-600 hover:bg-gray-100 px-2.5 py-1 rounded-md transition-colors">
                        Contraseña
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cédula</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cargo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trabFiltrados.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Sin resultados</td></tr>
              )}
              {trabFiltrados.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.nombres} {t.apellidos}</td>
                  <td className="px-4 py-3 text-gray-500">{t.numero_documento}</td>
                  <td className="px-4 py-3 text-gray-500">{t.cargo ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.user_id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.user_id ? 'Con acceso' : 'Sin acceso'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.tipo === 'crear'    && <ModalCrear    onClose={() => setModal(null)} onSaved={cerrarYRecargar} />}
      {modal?.tipo === 'editar'   && <ModalEditar   prof={modal.data} onClose={() => setModal(null)} onSaved={cerrarYRecargar} />}
      {modal?.tipo === 'password' && <ModalPassword prof={modal.data} onClose={() => setModal(null)} />}
    </div>
  )
}

// ── Componentes auxiliares ───────────────────────────────────────

function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{titulo}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}

function BotonesModal({ onClose, loading, labelOk }) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
        Cancelar
      </button>
      <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors">
        {loading ? 'Guardando...' : labelOk}
      </button>
    </div>
  )
}
