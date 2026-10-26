export enum Role {
  ADMIN = 'admin',
  USER = 'usuario',
  TEACHER = 'profesor',
  TEST = 'test',
}

export interface User {
  id?: string | number
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role?: string
  hasCompletedChildSetup?: boolean
  hasCompletedSetup?: boolean
  institutionId?: string | null
  profileType?: ProfileType
}

export interface ChildItemPayload {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  birthDate: string
  age: number
  institutionId?: string
  grade?: string
}

export interface RegisterPayload {
  role?: 'usuario' | 'test' | 'profesor'
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  birthDate?: string
  age: number
  email: string
  phone: string
  acceptedTerms: boolean
  password: string
  institutionId?: string
  professionalLicense?: string
  children?: ChildItemPayload[]
}

export interface LoginResponse {
  accessToken?: string
  access_token?: string
  refreshToken?: string
  expiresIn?: number
  user?: User
  license?: {
    plan: 'free' | 'trial' | 'pro'
    origin: 'personal' | 'institucional'
    daysRemaining?: number | null
    isActive: boolean
  }
  message?: string
  hasCompletedSetup?: boolean
  profileType?: ProfileType
  profile?: {
    firstName?: string
    lastName?: string
    institutionId?: string | null
  }
}

/**
 * Obtiene un mensaje legible a partir de un error de $fetch.
 * NestJS puede devolver `message` como texto o como lista (errores de class-validator).
 */
const extractApiErrorMessage = (err: any, fallback: string): string => {
  const message = err?.data?.message
  if (Array.isArray(message) && message.length > 0) return message.join('. ')
  if (typeof message === 'string' && message.trim()) return message
  // Sin respuesta del servidor: caído, sin red o bloqueado por CORS
  if (!err?.response) return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
  return fallback
}

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    sameSite: 'lax',
  })

  const refreshToken = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  const userRole = useCookie<string | null>('user_role', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  // true cuando el usuario ya completó el formulario inicial (has_completed_setup en el backend)
  const hasChildProfile = useCookie<boolean>('has_child_profile', SESSION_COOKIE_OPTIONS)

  // Tipo de perfil resuelto por el backend al iniciar sesión (admin, profesor, tester, tutor, adulto)
  const profileType = useCookie<ProfileType | null>('profile_type', SESSION_COOKIE_OPTIONS)

  // Nombre para el saludo de los dashboards ("Hola, Marisol"); se conserva al recargar la página
  const firstName = useCookie<string | null>('user_first_name', SESSION_COOKIE_OPTIONS)

  const user = useState<User | null>('auth_user', () => null)
  const loading = useState<boolean>('auth_loading', () => false)
  const error = useState<string | null>('auth_error', () => null)
  // Código HTTP del último error (ej. 409 = correo o documento ya registrado)
  const errorStatus = useState<number | null>('auth_error_status', () => null)

  const isAuthenticated = computed(() => !!token.value)
  const { $api } = useNuxtApp()

  /**
   * Iniciar sesión llamando al backend (NestJS: POST /auth/login)
   */
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    errorStatus.value = null

    try {
      const response = await $api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      const authToken = response?.accessToken || response?.access_token

      if (authToken) {
        token.value = authToken
        if (response.refreshToken) {
          refreshToken.value = response.refreshToken
        }
        const userData = response.user || { email }
        user.value = userData

        const normalizedRole = userData.role ? userData.role.toLowerCase() : 'usuario'
        userRole.value = normalizedRole

        const completedSetup = userData.hasCompletedSetup === true
        hasChildProfile.value = completedSetup

        const resolvedProfile = response.profileType ?? userData.profileType
        if (!isProfileType(resolvedProfile)) {
          error.value = 'No pudimos identificar el tipo de tu cuenta. Contacta al administrador.'
          token.value = null
          refreshToken.value = null
          return false
        }
        profileType.value = resolvedProfile
        firstName.value = response.profile?.firstName?.trim() || null
        user.value = { ...userData, firstName: response.profile?.firstName, lastName: response.profile?.lastName }

        // Destino según el perfil: admin → panel, profesor → su dashboard, tester → formulario,
        // tutor/adulto → formulario solo si no lo ha completado
        await navigateTo(resolveHomeRoute(resolvedProfile, completedSetup))
        return true
      } else {
        error.value = 'Respuesta inesperada del servidor. No se recibió el token de autenticación.'
        return false
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err)
      errorStatus.value = err?.response?.status ?? null
      error.value = extractApiErrorMessage(err, 'Credenciales inválidas. Verifica tu correo y contraseña.')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Registrar nuevo usuario (Tutor con N hijos, Docente o Adulto)
   */
  const register = async (userData: RegisterPayload) => {
    loading.value = true
    error.value = null
    errorStatus.value = null

    try {
      await $api('/auth/register', {
        method: 'POST',
        body: userData,
      })

      // El registro no inicia sesión: la persona entra desde el login, donde se decide su destino
      await navigateTo({ path: ROUTES.login, query: { registered: '1', email: userData.email } })
      return true
    } catch (err: any) {
      console.error('Error al registrar usuario:', err)
      errorStatus.value = err?.response?.status ?? null
      error.value = extractApiErrorMessage(err, 'No se pudo completar el registro. Verifica los datos ingresados.')
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
    userRole.value = null
    hasChildProfile.value = false
    profileType.value = null
    firstName.value = null
    user.value = null
    // Datos de la cuenta que no deben verse si otra persona inicia sesión en el mismo navegador
    useMyStudents().resetStudents()
    useState('my_profile').value = null
    await navigateTo(ROUTES.login)
  }

  return {
    token,
    refreshToken,
    userRole,
    user,
    hasChildProfile,
    profileType,
    firstName,
    loading,
    error,
    errorStatus,
    isAuthenticated,
    login,
    register,
    logout,
  }
}
