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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl  = Deno.env.get('SUPABASE_URL')!
    const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey      = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verificar que el llamante está autenticado y es admin
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) return json({ error: 'No autenticado' }, 401)

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: prof } = await adminClient
      .from('profesionales_kaizen')
      .select('rol')
      .eq('user_id', user.id)
      .eq('activo', true)
      .maybeSingle()

    if (!prof || prof.rol !== 'admin') return json({ error: 'Sin permisos' }, 403)

    // Cambiar contraseña
    const { user_id, password } = await req.json()
    if (!user_id || !password) return json({ error: 'Faltan datos' }, 400)

    const { error } = await adminClient.auth.admin.updateUserById(user_id, { password })
    if (error) throw new Error(error.message)

    return json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error interno'
    return json({ error: msg }, 500)
  }
})
