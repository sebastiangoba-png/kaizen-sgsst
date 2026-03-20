import { differenceInDays, format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { DIAS_ALERTA } from './constants'

export function calcularEstado(fechaVencimiento) {
  if (!fechaVencimiento) return 'sin_documento'
  const fecha = typeof fechaVencimiento === 'string' ? parseISO(fechaVencimiento) : fechaVencimiento
  if (!isValid(fecha)) return 'sin_documento'
  const dias = differenceInDays(fecha, new Date())
  if (dias < 0) return 'vencido'
  if (dias <= DIAS_ALERTA) return 'por_vencer'
  return 'vigente'
}

export function diasRestantes(fechaVencimiento) {
  if (!fechaVencimiento) return null
  const fecha = typeof fechaVencimiento === 'string' ? parseISO(fechaVencimiento) : fechaVencimiento
  if (!isValid(fecha)) return null
  return differenceInDays(fecha, new Date())
}

export function formatFecha(fecha) {
  if (!fecha) return '—'
  try {
    const f = typeof fecha === 'string' ? parseISO(fecha) : fecha
    if (!isValid(f)) return '—'
    return format(f, 'dd/MM/yyyy', { locale: es })
  } catch { return '—' }
}

export const ESTADO_CONFIG = {
  vigente: {
    label: 'Vigente',
    badge: 'badge-vigente',
    dot: 'bg-green-500',
    ring: 'ring-green-200',
    bg: 'bg-green-500',
    text: 'text-green-700',
    light: 'bg-green-50',
    border: 'border-green-200',
  },
  por_vencer: {
    label: 'Por Vencer',
    badge: 'badge-por-vencer',
    dot: 'bg-amber-500',
    ring: 'ring-amber-200',
    bg: 'bg-amber-400',
    text: 'text-amber-700',
    light: 'bg-amber-50',
    border: 'border-amber-200',
  },
  vencido: {
    label: 'Vencido',
    badge: 'badge-vencido',
    dot: 'bg-red-500',
    ring: 'ring-red-200',
    bg: 'bg-red-500',
    text: 'text-red-700',
    light: 'bg-red-50',
    border: 'border-red-200',
  },
  sin_documento: {
    label: 'Sin Documento',
    badge: 'badge-sin-doc',
    dot: 'bg-gray-400',
    ring: 'ring-gray-200',
    bg: 'bg-gray-400',
    text: 'text-gray-600',
    light: 'bg-gray-50',
    border: 'border-gray-200',
  },
}

export function calcularCumplimiento(documentos, totalEsperado = 8) {
  if (!documentos || documentos.length === 0) return 0
  const validos = documentos.filter(d => {
    const estado = calcularEstado(d.fecha_vencimiento)
    return estado === 'vigente' || estado === 'por_vencer' || (!d.fecha_vencimiento && d.id)
  }).length
  return Math.round((validos / totalEsperado) * 100)
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
