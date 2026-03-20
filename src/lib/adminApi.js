import { supabase } from './supabase'

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

async function callFunction(endpoint, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Sin sesión')

  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error ?? 'Error en el servidor')
  return data
}

export const adminApi = {
  async listar() {
    const [{ data: profesionales, error: e1 }, { data: trabajadores, error: e2 }] = await Promise.all([
      supabase.from('profesionales_kaizen').select('*').order('nombres'),
      supabase.from('trabajadores').select('id, nombres, apellidos, numero_documento, cargo, activo, user_id').order('nombres'),
    ])
    if (e1) throw new Error(e1.message)
    if (e2) throw new Error(e2.message)
    return { profesionales: profesionales ?? [], trabajadores: trabajadores ?? [] }
  },

  async crearProfesional({ nombres, apellidos, email_usuario, rol, password }) {
    return callFunction('create-user', { nombres, apellidos, email_usuario, rol, password })
  },

  async editarProfesional({ id, nombres, apellidos, rol, activo }) {
    const { error } = await supabase.from('profesionales_kaizen')
      .update({ nombres, apellidos, rol, activo })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },

  async cambiarPassword(userId, password) {
    return callFunction('change-password', { user_id: userId, password })
  },
}
