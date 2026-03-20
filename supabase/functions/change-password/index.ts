import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      part.length + (4 - (part.length % 4)) % 4, '='
    )
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url        = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Decodificar JWT para obtener user_id del llamante
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()
    const payload = decodeJWT(token)
    const callerId = payload?.sub as string | undefined

    if (!callerId) return json({ error: 'Token inválido o ausente' }, 401)

    // Verificar que el llamante es admin usando el cliente admin (bypass RLS)
    const { data: prof } = await admin
      .from('profesionales_kaizen')
      .select('rol')
      .eq('user_id', callerId)
      .eq('activo', true)
      .maybeSingle()

    if (!prof || prof.rol !== 'admin') return json({ error: 'Sin permisos de administrador' }, 403)

    // Cambiar contraseña
    const { user_id, password } = await req.json()
    if (!user_id || !password) return json({ error: 'Faltan user_id o password' }, 400)
    if (String(password).length < 6) return json({ error: 'Mínimo 6 caracteres' }, 400)

    const { error } = await admin.auth.admin.updateUserById(user_id, { password })
    if (error) throw new Error(error.message)

    return json({ ok: true })
  } catch (e: unknown) {
    return json({ error: e instanceof Error ? e.message : 'Error interno' }, 500)
  }
})
