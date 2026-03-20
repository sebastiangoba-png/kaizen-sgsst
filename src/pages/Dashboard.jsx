import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcularEstado, diasRestantes, formatFecha, ESTADO_CONFIG } from '../lib/utils'
import { TIPOS_DOCUMENTO_SST } from '../lib/constants'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Mapa UUID → nombre del tipo de documento
const TIPO_NOMBRE = Object.fromEntries(
  TIPOS_DOCUMENTO_SST.map(t => [t.id, t.nombre])
)

const TIPO_EXAMEN_LABEL = {
  ingreso: 'Examen Ingreso',
  periodico: 'Examen Periódico',
  egreso: 'Examen Egreso',
  post_incapacidad: 'Examen Post Inc.',
}

// ── Semáforo visual ──────────────────────────────────────────────
function Semaforo({ counts }) {
  const { vencido = 0, por_vencer = 0, vigente = 0 } = counts
  const total = vencido + por_vencer + vigente

  const circles = [
    { key: 'vencido',    label: 'Vencidos',   val: vencido,    bg: 'bg-red-500',   shadow: 'shadow-red-200',   pulse: true  },
    { key: 'por_vencer', label: 'Por Vencer', val: por_vencer, bg: 'bg-amber-400', shadow: 'shadow-amber-200', pulse: false },
    { key: 'vigente',    label: 'Vigentes',   val: vigente,    bg: 'bg-green-500', shadow: 'shadow-green-200', pulse: false },
  ]

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
        Semáforo de Vencimientos
      </h2>
      <div className="flex items-end justify-around gap-4">
        {circles.map(({ key, label, val, bg, shadow, pulse }) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center shadow-lg ${shadow}`}>
                <span className="text-white font-extrabold text-2xl">{val}</span>
              </div>
              {pulse && val > 0 && (
                <span className={`absolute inset-0 rounded-full ${bg} animate-ping opacity-30`} />
              )}
            </div>
            <span className={`text-xs font-semibold uppercase ${ESTADO_CONFIG[key].text}`}>{label}</span>
          </div>
        ))}
      </div>

      {total > 0 && (
        <>
          <div className="mt-5 h-2.5 rounded-full bg-gray-100 flex overflow-hidden">
            {vencido > 0 && (
              <div className="bg-red-500 h-full transition-all" style={{ width: `${(vencido / total) * 100}%` }} />
            )}
            {por_vencer > 0 && (
              <div className="bg-amber-400 h-full transition-all" style={{ width: `${(por_vencer / total) * 100}%` }} />
            )}
            {vigente > 0 && (
              <div className="bg-green-500 h-full transition-all" style={{ width: `${(vigente / total) * 100}%` }} />
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            {total} documentos y exámenes con fecha de vencimiento
          </p>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, sub, color }) {
  const colors = {
    blue:  'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red:   'bg-red-50 text-red-700 border-red-100',
  }
  return (
    <div className={`card p-5 border ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-extrabold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  )
}

function AlertaRow({ item }) {
  const estado = calcularEstado(item.fecha_vencimiento)
  const dias   = diasRestantes(item.fecha_vencimiento)
  const cfg    = ESTADO_CONFIG[estado]

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <Link to={`/trabajadores/${item.trabajador_id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm">
          {item.trabajadores?.nombres} {item.trabajadores?.apellidos}
        </Link>
        <p className="text-xs text-gray-400">{item.trabajadores?.cargo ?? '—'}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.tipo_label}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{formatFecha(item.fecha_vencimiento)}</td>
      <td className="px-4 py-3">
        <span className={cfg.badge}>
          {dias === null ? cfg.label
            : dias < 0  ? `Venció hace ${Math.abs(dias)}d`
            : dias === 0 ? 'Vence hoy'
            : `${dias}d restantes`}
        </span>
      </td>
    </tr>
  )
}

// ── Página Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats]     = useState({ trabajadores: 0, empresas: 0 })
  const [counts, setCounts]   = useState({})
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Contar trabajadores activos
        const { count: cTrab } = await supabase
          .from('trabajadores')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)

        // Contar empresas distintas vía trabajadores (por si empresas tiene RLS)
        const { data: empData } = await supabase
          .from('trabajadores')
          .select('empresa_id')
          .eq('activo', true)
        const cEmp = new Set((empData ?? []).map(t => t.empresa_id).filter(Boolean)).size

        // Documentos con fecha de vencimiento
        const { data: docs } = await supabase
          .from('documentos_trabajador')
          .select('id, tipo_documento_id, fecha_vencimiento, trabajador_id, trabajadores(nombres, apellidos, cargo)')
          .not('fecha_vencimiento', 'is', null)

        // Exámenes con fecha de vencimiento
        const { data: exams } = await supabase
          .from('examenes_medicos')
          .select('id, tipo_examen, fecha_vencimiento, trabajador_id, trabajadores(nombres, apellidos, cargo)')
          .not('fecha_vencimiento', 'is', null)

        setStats({ trabajadores: cTrab ?? 0, empresas: cEmp })

        const allItems = [
          ...(docs  ?? []).map(d => ({ ...d, tipo_label: TIPO_NOMBRE[d.tipo_documento_id] ?? 'Documento' })),
          ...(exams ?? []).map(e => ({ ...e, tipo_label: TIPO_EXAMEN_LABEL[e.tipo_examen] ?? e.tipo_examen })),
        ]

        const c = { vencido: 0, por_vencer: 0, vigente: 0, sin_documento: 0 }
        allItems.forEach(d => { c[calcularEstado(d.fecha_vencimiento)]++ })
        setCounts(c)

        const urgentes = allItems
          .filter(d => ['vencido', 'por_vencer'].includes(calcularEstado(d.fecha_vencimiento)))
          .sort((a, b) => diasRestantes(a.fecha_vencimiento) - diasRestantes(b.fecha_vencimiento))
          .slice(0, 20)
        setAlertas(urgentes)
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hoy = format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 capitalize mt-0.5">{hoy}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Trabajadores activos"
          value={stats.trabajadores}
          sub={`${stats.empresas} empresa${stats.empresas !== 1 ? 's' : ''}`}
          color="blue"
        />
        <StatCard
          title="Documentos vigentes"
          value={counts.vigente ?? 0}
          sub="con fecha válida"
          color="green"
        />
        <StatCard
          title="Por vencer (≤30 días)"
          value={counts.por_vencer ?? 0}
          sub="requieren atención pronta"
          color="amber"
        />
        <StatCard
          title="Vencidos"
          value={counts.vencido ?? 0}
          sub="acción inmediata"
          color={(counts.vencido ?? 0) > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Semáforo */}
      <Semaforo counts={counts} />

      {/* Tabla alertas */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Alertas Críticas</h2>
          {alertas.length > 0 && (
            <span className="badge badge-vencido">{alertas.length} alertas</span>
          )}
        </div>

        {alertas.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-medium text-gray-600">Todo en orden</p>
            <p className="text-sm mt-1">Sin documentos vencidos ni por vencer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trabajador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Vencimiento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {alertas.map(item => (
                  <AlertaRow key={`${item.id}-${item.tipo_label}`} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
