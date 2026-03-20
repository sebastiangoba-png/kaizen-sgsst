import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcularEstado, formatFecha, ESTADO_CONFIG } from '../lib/utils'

// ── Modal Trabajador ─────────────────────────────────────────────
function TrabajadorModal({ trabajador, empresas, onClose, onSaved }) {
  const [form, setForm] = useState(
    trabajador
      ? {
          nombres:          trabajador.nombres          ?? '',
          apellidos:        trabajador.apellidos        ?? '',
          numero_documento: trabajador.numero_documento ?? '',
          tipo_documento:   trabajador.tipo_documento   ?? 'CC',
          cargo:            trabajador.cargo            ?? '',
          area:             trabajador.area             ?? '',
          empresa_id:       trabajador.empresa_id       ?? '',
          fecha_ingreso:    trabajador.fecha_ingreso    ?? '',
          telefono:         trabajador.telefono         ?? '',
          email:            trabajador.email            ?? '',
          activo:           trabajador.activo ?? true,
        }
      : {
          nombres: '', apellidos: '', numero_documento: '', tipo_documento: 'CC',
          cargo: '', area: '', empresa_id: empresas[0]?.id ?? '',
          fecha_ingreso: '', telefono: '', email: '', activo: true,
        }
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
      const { error: err } = trabajador?.id
        ? await supabase.from('trabajadores').update(payload).eq('id', trabajador.id)
        : await supabase.from('trabajadores').insert(payload)
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
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">
            {trabajador?.id ? 'Editar Trabajador' : 'Nuevo Trabajador'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombres *</label>
              <input className="input" required value={form.nombres} onChange={e => set('nombres', e.target.value)} />
            </div>
            <div>
              <label className="label">Apellidos *</label>
              <input className="input" required value={form.apellidos} onChange={e => set('apellidos', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo documento</label>
              <select className="input" value={form.tipo_documento} onChange={e => set('tipo_documento', e.target.value)}>
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="PA">Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div>
              <label className="label">Número documento *</label>
              <input className="input" required value={form.numero_documento} onChange={e => set('numero_documento', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cargo</label>
              <input className="input" value={form.cargo} onChange={e => set('cargo', e.target.value)} />
            </div>
            <div>
              <label className="label">Área</label>
              <input className="input" value={form.area} onChange={e => set('area', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Empresa</label>
            <select className="input" value={form.empresa_id} onChange={e => set('empresa_id', e.target.value)}>
              <option value="">— Sin empresa —</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de ingreso</label>
              <input className="input" type="date" value={form.fecha_ingreso} onChange={e => set('fecha_ingreso', e.target.value)} />
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.activo ? 'activo' : 'inactivo'} onChange={e => set('activo', e.target.value === 'activo')}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
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

// ── Fila trabajador ──────────────────────────────────────────────
function TrabajadorRow({ t, onEdit }) {
  // Estado de documentos: usar campo `estado` ya computado por el servidor
  const estadoDoc = (() => {
    if (!t.documentos_trabajador || t.documentos_trabajador.length === 0) return 'sin_documento'
    const estados = t.documentos_trabajador.map(d =>
      d.fecha_vencimiento ? calcularEstado(d.fecha_vencimiento) : (d.id ? 'vigente' : 'sin_documento')
    )
    if (estados.includes('vencido'))    return 'vencido'
    if (estados.includes('por_vencer')) return 'por_vencer'
    if (estados.includes('vigente'))    return 'vigente'
    return 'sin_documento'
  })()
  const cfg = ESTADO_CONFIG[estadoDoc]

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-4 py-3">
        <Link to={`/trabajadores/${t.id}`} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm">
            {t.nombres.charAt(0)}{t.apellidos.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
              {t.nombres} {t.apellidos}
            </p>
            <p className="text-xs text-gray-500">
              {t.tipo_documento ?? 'CC'} {t.numero_documento}
            </p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell">{t.cargo || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{t.area || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{formatFecha(t.fecha_ingreso)}</td>
      <td className="px-4 py-3">
        <span className={cfg.badge}>{cfg.label}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(t)} className="text-gray-400 hover:text-blue-600" title="Editar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <Link to={`/trabajadores/${t.id}`} className="text-gray-400 hover:text-blue-600" title="Ver ficha">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </td>
    </tr>
  )
}

// ── Página Trabajadores ──────────────────────────────────────────
export default function Trabajadores() {
  const [searchParams]            = useSearchParams()
  const [trabajadores, setTrab]   = useState([])
  const [empresas, setEmpresas]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filtroEmp, setFiltroEmp] = useState(searchParams.get('empresa') ?? '')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modal, setModal]         = useState(null)

  async function load() {
    setLoading(true)
    const [{ data: trabs }, { data: emps }] = await Promise.all([
      supabase
        .from('trabajadores')
        .select('id, nombres, apellidos, numero_documento, tipo_documento, cargo, area, fecha_ingreso, activo, empresa_id, telefono, email, documentos_trabajador(id, tipo_documento_id, fecha_vencimiento)')
        .order('apellidos'),
      supabase.from('empresas').select('id, nombre').order('nombre'),
    ])
    setTrab(trabs ?? [])
    setEmpresas(emps ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtrados = (trabajadores ?? []).filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      `${t.nombres} ${t.apellidos}`.toLowerCase().includes(q) ||
      (t.numero_documento ?? '').includes(q) ||
      (t.cargo ?? '').toLowerCase().includes(q) ||
      (t.area ?? '').toLowerCase().includes(q)
    const matchEmp    = !filtroEmp || t.empresa_id === filtroEmp
    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo'   && t.activo) ||
      (filtroEstado === 'inactivo' && !t.activo)
    return matchSearch && matchEmp && matchEstado
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trabajadores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtrados.length} de {trabajadores.length} trabajadores
          </p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input pl-9"
            placeholder="Buscar por nombre, documento, cargo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-48" value={filtroEmp} onChange={e => setFiltroEmp(e.target.value)}>
          <option value="">Todas las empresas</option>
          {empresas.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.nombre}</option>
          ))}
        </select>
        <select className="input sm:w-36" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <div className="text-5xl mb-4">👷</div>
            <p className="font-medium text-gray-600 text-lg">Sin resultados</p>
            <p className="text-sm mt-2">
              {trabajadores.length === 0
                ? 'Agrega el primer trabajador.'
                : 'Intenta con otro filtro de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trabajador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Cargo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Ingreso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Documentos</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(t => (
                  <TrabajadorRow key={t.id} t={t} onEdit={trab => setModal(trab)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <TrabajadorModal
          trabajador={modal === 'new' ? null : modal}
          empresas={empresas}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
