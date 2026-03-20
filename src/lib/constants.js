// IDs reales de la tabla tipos_documento en Supabase
export const TIPOS_DOCUMENTO_SST = [
  {
    id: 'f112c84b-d43d-4bcb-adbd-8d20b164d30e',
    nombre: 'ARL',
    descripcion: 'Afiliación a Aseguradora de Riesgos Laborales',
    tiene_vencimiento: true,
    icono: '🛡️',
  },
  {
    id: '25008775-82ff-4272-8fb5-9b503679dfac',
    nombre: 'EPS',
    descripcion: 'Afiliación a Entidad Promotora de Salud',
    tiene_vencimiento: true,
    icono: '🏥',
  },
  {
    id: '0aa5c02d-c219-40d4-81fe-433e49265e7c',
    nombre: 'Aptitud médica',
    descripcion: 'Certificado de aptitud médico-ocupacional',
    tiene_vencimiento: true,
    icono: '🩺',
  },
  {
    id: '017c9c38-6b4a-4c32-ae63-451fa79854f7',
    nombre: 'Carnet de vacunas',
    descripcion: 'Esquema de vacunación completo',
    tiene_vencimiento: false,
    icono: '💉',
  },
  {
    id: 'be10419b-e016-4596-a419-097316188655',
    nombre: 'Trabajo en alturas',
    descripcion: 'Certificación para trabajo en alturas (Res. 4272)',
    tiene_vencimiento: true,
    icono: '⛑️',
  },
  {
    id: '56034de7-b4d7-4f24-b37a-687ed85ee7cb',
    nombre: 'Riesgo eléctrico',
    descripcion: 'Certificación para trabajo con riesgo eléctrico',
    tiene_vencimiento: true,
    icono: '⚡',
  },
  {
    id: 'bcfa329c-782c-4451-820e-13b99a5ffee3',
    nombre: 'Espacios confinados',
    descripcion: 'Certificación para entrada a espacios confinados',
    tiene_vencimiento: true,
    icono: '🕳️',
  },
  {
    id: 'b30eb9c9-effd-4d03-a4e3-c8db25ca6156',
    nombre: 'EPP',
    descripcion: 'Entrega y capacitación en Equipos de Protección Personal',
    tiene_vencimiento: true,
    icono: '🦺',
  },
]

export const TIPOS_EXAMEN_MEDICO = [
  { id: 'ingreso',         nombre: 'Examen de Ingreso' },
  { id: 'periodico',       nombre: 'Examen Periódico' },
  { id: 'egreso',          nombre: 'Examen de Egreso' },
  { id: 'post_incapacidad',nombre: 'Post Incapacidad' },
]

export const CONCEPTOS_EXAMEN = {
  apto:                   { label: 'Apto',                   clases: 'bg-green-100 text-green-800' },
  apto_con_restricciones: { label: 'Apto c/ Restricciones',  clases: 'bg-amber-100 text-amber-800' },
  no_apto:                { label: 'No Apto',                clases: 'bg-red-100 text-red-800' },
  pendiente:              { label: 'Pendiente',              clases: 'bg-gray-100 text-gray-600' },
}

export const DIAS_ALERTA = 30
