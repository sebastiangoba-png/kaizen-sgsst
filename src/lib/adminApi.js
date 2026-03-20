import { supabase } from './supabase'

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`

async function callAdmin(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Sin sesión')

  const res = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action, payload }),
  })

  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error ?? 'Error en el servidor')
  return data
}

export const adminApi = {
  listar:           ()       => callAdmin('listar'),
  crearProfesional: (p)      => callAdmin('crear', p),
  editarProfesional:(p)      => callAdmin('editar', p),
  cambiarPassword:  (p)      => callAdmin('cambiar_password', p),
}
