import { supabase } from './supabase'

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`

export const adminApi = {
  async cambiarPassword(userId, password) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) throw new Error('Sin sesión')
    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'cambiar_password', payload: { user_id: userId, password } }),
    })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error ?? 'Error al cambiar contraseña')
    return data
  },
  async listar() {
    const [{ data: profesionales, error: e1 }, { data: trabajadores, error: e2 }] = await Promise.all([
      supabase.from('profesionales_kaizen').select('*').order('nombres'),
      supabase.from('trabajadores').select('id, nombres, apellidos, numero_documento, cargo, activo, user_id').order('nombres'),
    ])
    if (e1) throw new Error(e1.message)
    if (e2) throw new Error(e2.message)
    return { profesionales: profesionales ?? [], trabajadores: trabajadores ?? [] }
  },

  async crearProfesional({ nombres, apellidos, email_usuario, rol }) {
    const email = `${String(email_usuario).trim()}@kaizen.internal`
    const { error } = await supabase.from('profesionales_kaizen').insert({
      nombres, apellidos, email, rol, activo: true
    })
    if (error) throw new Error(error.message)
  },

  async editarProfesional({ id, nombres, apellidos, rol, activo }) {
    const { error } = await supabase.from('profesionales_kaizen')
      .update({ nombres, apellidos, rol, activo })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },
}
