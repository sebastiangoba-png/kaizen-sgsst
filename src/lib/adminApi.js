import { supabase } from './supabase'

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
