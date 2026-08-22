export interface User {
  id?: string | number
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role?: string
  hasCompletedChildSetup?: boolean
}

export interface ChildProfile {
  childName: string
  documentNumber: string
  birthDate: string | Date
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  age: number
  email: string
  phone: string
  acceptedTerms: boolean
  password: string
}

export interface LoginResponse {
  accessToken?: string
  access_token?: string
  refreshToken?: string
  expiresIn?: number
  user?: User
  message?: string
}

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    sameSite: 'lax'
  })

  const refreshToken = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    sameSite: 'lax'
  })

  const hasChildProfile = useCookie<boolean>('has_child_profile', {
    maxAge: 60 * 60 * 24 * 30, // 30 días
    sameSite: 'lax'
  })

  const childData = useState<ChildProfile | null>('child_profile_data', () => null)
  const user = useState<User | null>('auth_user', () => null)
  const loading = useState<boolean>('auth_loading', () => false)
  const error = useState<string | null>('auth_error', () => null)

  const config = useRuntimeConfig()

  const isAuthenticated = computed(() => !!token.value)
  const { $api } = useNuxtApp()

  /**
   * Actualizar estado de registro del niño
   */
  const setChildRegistered = (status: boolean, data?: ChildProfile) => {
    hasChildProfile.value = status
    if (data) {
      childData.value = data
    }
  }

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

      const authToken = response?.accessToken || response?.access_token

      if (authToken) {
        token.value = authToken
        if (response.refreshToken) {
          refreshToken.value = response.refreshToken
        }
        user.value = response.user || { email }

        // Redirigir a la vista de selección de perfil ("¿Quién está aprendiendo hoy?")
        await navigateTo('/profile-selection')
        return true
      } else {
        error.value = 'Respuesta inesperada del servidor. No se recibió el token de autenticación.'
        return false
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
   * Registrar nuevo usuario (NestJS: POST /auth/register)
   */
  const register = async (userData: RegisterPayload) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<LoginResponse>('/auth/register', {
        method: 'POST',
        body: userData
      })

      const authToken = response?.accessToken || response?.access_token

      if (authToken) {
        token.value = authToken
        if (response.refreshToken) {
          refreshToken.value = response.refreshToken
        }
        user.value = response.user || { email: userData.email, firstName: userData.firstName, lastName: userData.lastName }
        
        // Redirigir al registro del niño
        await navigateTo('/child-registration')
      } else {
        await navigateTo('/login')
      }
      return true
    } catch (err: any) {
      console.error('Error al registrar usuario:', err)
      error.value = err.data?.message || err.message || 'No se pudo completar el registro. Verifica los datos ingresados.'
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
    refreshToken.value = null
    user.value = null
    await navigateTo('/login')
  }

  return {
    token,
    refreshToken,
    user,
    childData,
    hasChildProfile,
    loading,
    error,
    isAuthenticated,
    setChildRegistered,
    login,
    register,
    logout
  }
}
