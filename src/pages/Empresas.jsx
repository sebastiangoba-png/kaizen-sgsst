import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Modal Empresa ────────────────────────────────────────────────
function EmpresaModal({ empresa, onClose, onSaved }) {
  const [form, setForm] = useState(
    empresa ?? { nombre: '', nit: '', contacto: '', telefono: '', email: '', direccion: '' }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, updated_at: new Date().toISOString() }
      const { error: err } = empresa?.id
        ? await supabase.from('empresas').update(payload).eq('id', empresa.id)
        : await supabase.from('empresas').insert({ ...payload, activa: true })
      if (err) throw err
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{empresa?.id ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nombre de la empresa *</label>
            <input className="input" required value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">NIT</label>
              <input className="input" value={form.nit} onChange={e => set('nit', e.target.value)} placeholder="900.123.456-7" />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Contacto responsable SST</label>
            <input className="input" value={form.contacto} onChange={e => set('contacto', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input className="input" value={form.direccion} onChange={e => set('direccion', e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Tarjeta empresa ──────────────────────────────────────────────
function EmpresaCard({ empresa, onEdit }) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 font-bold text-xl">
              {empresa.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{empresa.nombre}</h3>
            {empresa.nit && <p className="text-xs text-gray-500 mt-0.5">NIT: {empresa.nit}</p>}
          </div>
        </div>
        {onEdit && (
          <button onClick={() => onEdit(empresa)} className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0" title="Editar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-gray-600">
        {empresa.contacto && (
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {empresa.contacto}
          </p>
        )}
        {empresa.telefono && (
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {empresa.telefono}
          </p>
        )}
        {empresa.email && (
          <p className="flex items-center gap-2 truncate">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{empresa.email}</span>
          </p>
        )}
        {empresa.direccion && (
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {empresa.direccion}
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-700">
          {empresa._count ?? 0} trabajador{(empresa._count ?? 0) !== 1 ? 'es' : ''}
        </span>
        <Link
          to={`/trabajadores?empresa=${empresa.id}`}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver trabajadores →
        </Link>
      </div>
    </div>
  )
}

// ── Página Empresas ──────────────────────────────────────────────
export default function Empresas() {
  const [empresas, setEmpresas]   = useState([])
  const [rlsAviso, setRlsAviso]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)

  async function load() {
    setLoading(true)

    // Intentar cargar desde tabla empresas
    const { data: empData, error: empError } = await supabase
      .from('empresas')
      .select('*')
      .order('nombre')

    if (!empError && empData && empData.length > 0) {
      // Contar trabajadores por empresa
      const { data: trabData } = await supabase
        .from('trabajadores')
        .select('empresa_id')
        .eq('activo', true)

      const conteo = {}
      ;(trabData ?? []).forEach(t => {
        if (t.empresa_id) conteo[t.empresa_id] = (conteo[t.empresa_id] ?? 0) + 1
      })

      setEmpresas(empData.map(e => ({ ...e, _count: conteo[e.id] ?? 0 })))
      setRlsAviso(false)
    } else {
      // Si empresas está bloqueada por RLS, reconstruir desde trabajadores
      setRlsAviso(true)
      const { data: trabData } = await supabase
        .from('trabajadores')
        .select('empresa_id')
      const ids = [...new Set((trabData ?? []).map(t => t.empresa_id).filter(Boolean))]
      // Mostrar tarjetas placeholder con el ID
      setEmpresas(ids.map(id => ({
        id,
        nombre: `Empresa (${id.slice(0, 8)}…)`,
        nit: null, contacto: null, telefono: null, email: null, direccion: null,
        _count: (trabData ?? []).filter(t => t.empresa_id === id).length,
      })))
    }

    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{empresas.length} empresa{empresas.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Empresa
        </button>
      </div>

      {/* Aviso RLS */}
      {rlsAviso && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <span className="text-amber-500 text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Tabla empresas sin acceso de lectura</p>
            <p className="text-xs text-amber-700 mt-1">
              La tabla <code className="bg-amber-100 px-1 rounded">empresas</code> tiene RLS activado sin política de lectura pública.
              En Supabase → Authentication → Policies → empresas → agrega: <br />
              <code className="bg-amber-100 px-1 rounded text-xs">CREATE POLICY &quot;read&quot; ON empresas FOR SELECT USING (true);</code>
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : empresas.length === 0 ? (
        <div className="card py-20 text-center text-gray-400">
          <div className="text-5xl mb-4">🏢</div>
          <p className="font-medium text-gray-600 text-lg">Sin empresas registradas</p>
          <button onClick={() => setModal('new')} className="btn-primary mx-auto mt-4">+ Nueva Empresa</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {empresas.map(e => (
            <EmpresaCard
              key={e.id}
              empresa={e}
              onEdit={rlsAviso ? null : emp => setModal(emp)}
            />
          ))}
        </div>
      )}

      {modal && (
        <EmpresaModal
          empresa={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
