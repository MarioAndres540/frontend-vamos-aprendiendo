export interface User {
  id?: string | number
  email: string
  name?: string
  role?: string
}

export interface LoginResponse {
  access_token: string
  user?: User
}

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    sameSite: 'lax'
  })

  const user = useState<User | null>('auth_user', () => null)
  const loading = useState<boolean>('auth_loading', () => false)
  const error = useState<string | null>('auth_error', () => null)

  const config = useRuntimeConfig()


  const isAuthenticated = computed(() => !!token.value)
  const { $api } = useNuxtApp()

  /**
   * Iniciar sesión llamando al backend (NestJS: POST /auth/login)
   */
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (response && response.access_token) {
        token.value = response.access_token
        user.value = response.user || { email }

        // Redireccionar a la página protegida
        await navigateTo('/dashboard')
        return true
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err)
      error.value = err.data?.message || err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout
  }
}
