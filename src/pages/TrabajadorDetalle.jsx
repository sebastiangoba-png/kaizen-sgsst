import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcularEstado, diasRestantes, formatFecha, ESTADO_CONFIG } from '../lib/utils'
import { TIPOS_DOCUMENTO_SST, TIPOS_EXAMEN_MEDICO, CONCEPTOS_EXAMEN } from '../lib/constants'

// ── Subir archivo a Supabase Storage ────────────────────────────
async function uploadFile(file, path) {
  const { data, error } = await supabase.storage
    .from('documentos-sst')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: url } = supabase.storage.from('documentos-sst').getPublicUrl(data.path)
  return url.publicUrl
}

// ── Modal Documento SST ──────────────────────────────────────────
function DocumentoModal({ tipo, doc, trabajadorId, onClose, onSaved }) {
  const [form, setForm] = useState({
    fecha_expedicion:  doc?.fecha_expedicion  ?? '',
    fecha_vencimiento: doc?.fecha_vencimiento ?? '',
    observaciones:     doc?.observaciones     ?? '',
  })
  const [file, setFile]     = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let archivo_url = doc?.archivo_url ?? null
      if (file) {
        const ext  = file.name.split('.').pop()
        const path = `${trabajadorId}/${tipo.id}_${Date.now()}.${ext}`
        archivo_url = await uploadFile(file, path)
      }

      const payload = {
        trabajador_id:     trabajadorId,
        tipo_documento_id: tipo.id,
        fecha_expedicion:  form.fecha_expedicion  || null,
        fecha_vencimiento: tipo.tiene_vencimiento ? (form.fecha_vencimiento || null) : null,
        observaciones:     form.observaciones     || null,
        archivo_url,
        updated_at: new Date().toISOString(),
      }

      let err
      if (doc?.id) {
        // UPDATE existente
        const { error: e } = await supabase
          .from('documentos_trabajador')
          .update(payload)
          .eq('id', doc.id)
        err = e
      } else {
        // INSERT nuevo
        const { error: e } = await supabase
          .from('documentos_trabajador')
          .insert(payload)
        err = e
      }
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Actualizar documento</p>
            <h3 className="font-semibold text-gray-900">{tipo.icono} {tipo.nombre}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Fecha de expedición / entrega</label>
            <input className="input" type="date" value={form.fecha_expedicion}
              onChange={e => set('fecha_expedicion', e.target.value)} />
          </div>
          {tipo.tiene_vencimiento && (
            <div>
              <label className="label">Fecha de vencimiento</label>
              <input className="input" type="date" value={form.fecha_vencimiento}
                onChange={e => set('fecha_vencimiento', e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">Adjuntar archivo (PDF, imagen)</label>
            <input
              className="input py-1.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-medium cursor-pointer"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={e => setFile(e.target.files[0] ?? null)}
            />
            {doc?.archivo_url && !file && (
              <a href={doc.archivo_url} target="_blank" rel="noreferrer"
                className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                Ver documento actual →
              </a>
            )}
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea className="input resize-none" rows={2} value={form.observaciones}
              onChange={e => set('observaciones', e.target.value)} placeholder="Notas adicionales…" />
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

// ── Modal Examen Médico ──────────────────────────────────────────
function ExamenModal({ examen, trabajadorId, onClose, onSaved }) {
  const [form, setForm] = useState(
    examen ?? {
      tipo_examen: 'periodico', fecha_examen: '', fecha_vencimiento: '',
      concepto: 'pendiente', medico: '', ips: '', observaciones: '',
    }
  )
  const [file, setFile]     = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let archivo_url = examen?.archivo_url ?? null
      if (file) {
        const ext  = file.name.split('.').pop()
        const path = `${trabajadorId}/examen_${form.tipo_examen}_${Date.now()}.${ext}`
        archivo_url = await uploadFile(file, path)
      }
      const payload = {
        trabajador_id:     trabajadorId,
        tipo_examen:       form.tipo_examen,
        fecha_examen:      form.fecha_examen,
        fecha_vencimiento: form.fecha_vencimiento || null,
        concepto:          form.concepto,
        medico:            form.medico            || null,
        ips:               form.ips               || null,
        observaciones:     form.observaciones      || null,
        archivo_url,
      }
      const { error: err } = examen?.id
        ? await supabase.from('examenes_medicos').update(payload).eq('id', examen.id)
        : await supabase.from('examenes_medicos').insert(payload)
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">{examen?.id ? 'Editar Examen' : 'Nuevo Examen Médico'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Tipo de examen *</label>
            <select className="input" required value={form.tipo_examen} onChange={e => set('tipo_examen', e.target.value)}>
              {TIPOS_EXAMEN_MEDICO.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha del examen *</label>
              <input className="input" type="date" required value={form.fecha_examen}
                onChange={e => set('fecha_examen', e.target.value)} />
            </div>
            <div>
              <label className="label">Fecha de vencimiento</label>
              <input className="input" type="date" value={form.fecha_vencimiento}
                onChange={e => set('fecha_vencimiento', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Concepto médico</label>
            <select className="input" value={form.concepto} onChange={e => set('concepto', e.target.value)}>
              {Object.entries(CONCEPTOS_EXAMEN).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Médico</label>
              <input className="input" value={form.medico} onChange={e => set('medico', e.target.value)} />
            </div>
            <div>
              <label className="label">IPS</label>
              <input className="input" value={form.ips} onChange={e => set('ips', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Archivo (PDF o imagen)</label>
            <input
              className="input py-1.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-medium cursor-pointer"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0] ?? null)}
            />
            {examen?.archivo_url && !file && (
              <a href={examen.archivo_url} target="_blank" rel="noreferrer"
                className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                Ver archivo actual →
              </a>
            )}
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea className="input resize-none" rows={2} value={form.observaciones}
              onChange={e => set('observaciones', e.target.value)} />
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

// ── Tarjeta de Documento SST ─────────────────────────────────────
function DocumentoCard({ tipo, doc, onEdit }) {
  const estado = doc
    ? (tipo.tiene_vencimiento
        ? calcularEstado(doc.fecha_vencimiento)
        : 'vigente')
    : 'sin_documento'
  const cfg  = ESTADO_CONFIG[estado]
  const dias = doc?.fecha_vencimiento ? diasRestantes(doc.fecha_vencimiento) : null

  return (
    <div className={`rounded-xl border p-4 ${cfg.border} ${cfg.light} transition-all hover:shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl flex-shrink-0">{tipo.icono}</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{tipo.nombre}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{tipo.descripcion}</p>
          </div>
        </div>
        <span className={`${cfg.badge} flex-shrink-0`}>{cfg.label}</span>
      </div>

      {doc ? (
        <div className="mt-3 space-y-1 text-xs text-gray-600">
          {doc.fecha_expedicion && (
            <p>Expedición: <span className="font-medium text-gray-800">{formatFecha(doc.fecha_expedicion)}</span></p>
          )}
          {tipo.tiene_vencimiento && (
            <p>
              Vence: <span className="font-medium text-gray-800">{formatFecha(doc.fecha_vencimiento)}</span>
              {dias !== null && (
                <span className={`ml-2 font-semibold ${cfg.text}`}>
                  {dias < 0  ? `(venció hace ${Math.abs(dias)}d)`
                   : dias === 0 ? '(hoy!)'
                   : `(${dias}d restantes)`}
                </span>
              )}
            </p>
          )}
          {doc.observaciones && (
            <p className="text-gray-400 italic truncate">{doc.observaciones}</p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-400">Sin documento registrado</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onEdit}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            doc
              ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {doc ? 'Actualizar' : '+ Agregar'}
        </button>
        {doc?.archivo_url && (
          <a href={doc.archivo_url} target="_blank" rel="noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            📎 Ver
          </a>
        )}
      </div>
    </div>
  )
}

// ── Tarjeta de Examen Médico ─────────────────────────────────────
function ExamenCard({ examen, onEdit }) {
  const estado = calcularEstado(examen.fecha_vencimiento)
  const cfg    = ESTADO_CONFIG[estado]
  const dias   = examen.fecha_vencimiento ? diasRestantes(examen.fecha_vencimiento) : null
  const con    = examen.concepto ? CONCEPTOS_EXAMEN[examen.concepto] : null
  const tipoLabel = TIPOS_EXAMEN_MEDICO.find(t => t.id === examen.tipo_examen)?.nombre ?? examen.tipo_examen

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{tipoLabel}</p>
          <p className="text-xs text-gray-500 mt-0.5">Realizado: {formatFecha(examen.fecha_examen)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {con && <span className={`badge ${con.clases}`}>{con.label}</span>}
          {examen.fecha_vencimiento && <span className={cfg.badge}>{cfg.label}</span>}
        </div>
      </div>

      <div className="mt-2 space-y-1 text-xs text-gray-600">
        {examen.fecha_vencimiento && (
          <p>
            Vence: <span className="font-medium">{formatFecha(examen.fecha_vencimiento)}</span>
            {dias !== null && (
              <span className={`ml-2 font-semibold ${cfg.text}`}>
                {dias < 0 ? `(venció hace ${Math.abs(dias)}d)` : `(${dias}d)`}
              </span>
            )}
          </p>
        )}
        {examen.medico && <p>Médico: <span className="font-medium">{examen.medico}</span></p>}
        {examen.ips    && <p>IPS: <span className="font-medium">{examen.ips}</span></p>}
        {examen.restricciones && <p className="text-amber-700">Restricciones: {examen.restricciones}</p>}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={onEdit}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          Editar
        </button>
        {examen.archivo_url && (
          <a href={examen.archivo_url} target="_blank" rel="noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            📎 Ver archivo
          </a>
        )}
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────
export default function TrabajadorDetalle() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const [tab, setTab] = useState('documentos')

  const [trabajador, setTrabajador] = useState(null)
  const [documentos, setDocumentos] = useState([])
  const [examenes, setExamenes]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalDoc, setModalDoc]     = useState(null)   // tipo object | null
  const [modalExam, setModalExam]   = useState(null)   // null | 'new' | examen

  async function load() {
    setLoading(true)
    const [{ data: t }, { data: docs }, { data: exams }] = await Promise.all([
      supabase
        .from('trabajadores')
        .select('*')
        .eq('id', id)
        .single(),
      supabase
        .from('documentos_trabajador')
        .select('*')
        .eq('trabajador_id', id),
      supabase
        .from('examenes_medicos')
        .select('*')
        .eq('trabajador_id', id)
        .order('fecha_examen', { ascending: false }),
    ])
    setTrabajador(t)
    setDocumentos(docs ?? [])
    setExamenes(exams ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  // Mapa tipo_documento_id → documento
  const docMap = Object.fromEntries((documentos ?? []).map(d => [d.tipo_documento_id, d]))

  // % cumplimiento = docs cargados / 8
  const cargados     = documentos.length
  const cumplimiento = Math.round((cargados / 8) * 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!trabajador) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Trabajador no encontrado.</p>
        <Link to="/trabajadores" className="text-blue-600 hover:underline mt-2 inline-block">← Volver</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Worker Header Card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow">
            <span className="text-white font-extrabold text-2xl">
              {trabajador.nombres?.charAt(0)}{trabajador.apellidos?.charAt(0)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {trabajador.nombres} {trabajador.apellidos}
              </h1>
              <span className={`badge ${trabajador.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {trabajador.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>{trabajador.tipo_documento ?? 'CC'} {trabajador.numero_documento}</span>
              {trabajador.cargo && <span>· {trabajador.cargo}</span>}
              {trabajador.area  && <span>· {trabajador.area}</span>}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
              {trabajador.fecha_ingreso && <span>Ingreso: {formatFecha(trabajador.fecha_ingreso)}</span>}
              {trabajador.telefono      && <span>📞 {trabajador.telefono}</span>}
              {trabajador.email         && <span>✉️ {trabajador.email}</span>}
            </div>
          </div>

          {/* Cumplimiento */}
          <div className="sm:text-right flex-shrink-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Documentos SST</p>
            <p className={`text-3xl font-extrabold leading-tight ${
              cumplimiento === 100 ? 'text-green-600' : cumplimiento >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>{cumplimiento}%</p>
            <p className="text-xs text-gray-400">{cargados} de 8 cargados</p>
            <div className="mt-1.5 w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden sm:ml-auto">
              <div
                className={`h-full rounded-full transition-all ${
                  cumplimiento === 100 ? 'bg-green-500' : cumplimiento >= 60 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${cumplimiento}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {[
          { id: 'documentos', label: `Documentos SST (8)` },
          { id: 'examenes',   label: `Exámenes Médicos (${examenes.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Documentos SST ── */}
      {tab === 'documentos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TIPOS_DOCUMENTO_SST.map(tipo => (
            <DocumentoCard
              key={tipo.id}
              tipo={tipo}
              doc={docMap[tipo.id] ?? null}
              onEdit={() => setModalDoc(tipo)}
            />
          ))}
        </div>
      )}

      {/* ── Tab Exámenes Médicos ── */}
      {tab === 'examenes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Historial de Exámenes</h2>
            <button onClick={() => setModalExam('new')} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Examen
            </button>
          </div>

          {examenes.length === 0 ? (
            <div className="card py-16 text-center text-gray-400">
              <div className="text-4xl mb-3">🩺</div>
              <p className="font-medium text-gray-600">Sin exámenes registrados</p>
              <button onClick={() => setModalExam('new')} className="btn-primary mx-auto mt-4">
                + Nuevo Examen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {examenes.map(ex => (
                <ExamenCard key={ex.id} examen={ex} onEdit={() => setModalExam(ex)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {modalDoc && (
        <DocumentoModal
          tipo={modalDoc}
          doc={docMap[modalDoc.id] ?? null}
          trabajadorId={id}
          onClose={() => setModalDoc(null)}
          onSaved={() => { setModalDoc(null); load() }}
        />
      )}
      {modalExam && (
        <ExamenModal
          examen={modalExam === 'new' ? null : modalExam}
          trabajadorId={id}
          onClose={() => setModalExam(null)}
          onSaved={() => { setModalExam(null); load() }}
        />
      )}
    </div>
  )
}
