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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verificar autenticación y rol admin
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

    // Crear usuario en Auth
    const { nombres, apellidos, email_usuario, rol, password } = await req.json()
    const email = `${String(email_usuario).trim()}@kaizen.internal`

    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email, password, email_confirm: true
    })
    if (authErr) throw new Error(authErr.message)

    // Insertar en profesionales_kaizen
    const { error: dbErr } = await adminClient
      .from('profesionales_kaizen')
      .insert({ user_id: authData.user.id, nombres, apellidos, email, rol, activo: true })

    if (dbErr) {
      await adminClient.auth.admin.deleteUser(authData.user.id)
      throw new Error(dbErr.message)
    }

    return json({ ok: true, user_id: authData.user.id })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error interno'
    return json({ error: msg }, 500)
  }
})
