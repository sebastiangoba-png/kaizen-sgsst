const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://omuklyheyrqnvumyuomy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdWtseWhleXJxbnZ1bXl1b215Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMTk0MCwiZXhwIjoyMDg5NTA3OTQwfQ.oRLcgqg-UTRRDs1THSTw2C571IAwKLi97yXTbsHQ-3Q'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  const usuario  = process.argv[2]
  const password = process.argv[3]

  if (!usuario || !password) {
    console.log('\nUso: node reset-password.cjs <usuario> <nueva_contraseña>')
    console.log('Ejemplos:')
    console.log('  node reset-password.cjs diego          NuevaClave123')
    console.log('  node reset-password.cjs asistente1     NuevaClave123')
    console.log('  node reset-password.cjs 1070624803     NuevaClave123\n')
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('❌ La contraseña debe tener mínimo 6 caracteres.')
    process.exit(1)
  }

  const email = usuario.includes('@') ? usuario : `${usuario}@kaizen.internal`
  console.log(`\nBuscando usuario: ${email}`)

  // Buscar el usuario en Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listError) { console.error('❌ Error:', listError.message); process.exit(1) }

  const user = users.find(u => u.email === email)
  if (!user) {
    console.error(`❌ Usuario "${email}" no encontrado en Auth.`)
    console.log('\nUsuarios disponibles:')
    users.forEach(u => console.log(' -', u.email?.replace('@kaizen.internal', '')))
    process.exit(1)
  }

  console.log(`✅ Usuario encontrado: ${user.email} (${user.id})`)

  // Cambiar contraseña
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password })
  if (error) { console.error('❌ Error al cambiar contraseña:', error.message); process.exit(1) }

  console.log(`✅ Contraseña actualizada correctamente para "${usuario}"\n`)
}

main().catch(err => { console.error('❌ Error inesperado:', err.message); process.exit(1) })
