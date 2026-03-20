import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(undefined) // undefined = cargando
  const [perfil,  setPerfil]    = useState(null)
  const [loading, setLoading]   = useState(true)

  // Carga el perfil desde profesionales_kaizen o trabajadores
  async function cargarPerfil(userId, email) {
    // 1. Buscar en profesionales_kaizen
    const { data: prof } = await supabase
      .from('profesionales_kaizen')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .maybeSingle()

    if (prof) {
      setPerfil({ ...prof, tipo: 'profesional' })
      return
    }

    // 2. Si no, buscar en trabajadores por cédula (extraída del email interno)
    const cedula = email?.replace('@kaizen.internal', '')
    if (cedula) {
      const { data: trab } = await supabase
        .from('trabajadores')
        .select('id, nombres, apellidos, numero_documento, empresa_id')
        .eq('numero_documento', cedula)
        .maybeSingle()

      if (trab) {
        setPerfil({ ...trab, rol: 'trabajador', tipo: 'trabajador' })
        return
      }
    }

    // Sin perfil asignado
    setPerfil({ rol: 'sin_perfil', tipo: 'desconocido' })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        cargarPerfil(session.user.id, session.user.email).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setLoading(true)
        cargarPerfil(session.user.id, session.user.email).finally(() => setLoading(false))
      } else {
        setPerfil(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(cedula, password) {
    const email = `${cedula.trim()}@kaizen.internal`
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, perfil, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
