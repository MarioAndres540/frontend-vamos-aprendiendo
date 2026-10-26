// Tipos alineados con MyProfile del backend (src/modules/profile/profile.service.ts)
export interface MyProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  documentType: string | null
  documentNumber: string | null
  phone: string | null
}

export interface ProfileChanges {
  phone?: string
  documentType?: string
}

const apiErrorMessage = (err: any, fallback: string) => {
  const message = err?.data?.message
  if (Array.isArray(message) && message.length > 0) return message.join('. ')
  if (typeof message === 'string' && message.trim()) return message
  return fallback
}

/**
 * Datos personales de la cuenta para la vista de Configuración (GET/PATCH /profile/me)
 */
export const useProfile = () => {
  const { $api } = useNuxtApp()
  const { user } = useAuth()
  const profile = useState<MyProfile | null>('my_profile', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProfile = async () => {
    loading.value = true
    error.value = null
    try {
      profile.value = await $api<MyProfile>('/profile/me')
    } catch (err: any) {
      error.value = apiErrorMessage(err, 'No pudimos cargar tus datos. Intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }

  /** Cambia teléfono y/o tipo de documento. Lanza un Error con el mensaje para mostrarlo en el formulario. */
  const updateProfile = async (changes: ProfileChanges) => {
    try {
      profile.value = await $api<MyProfile>('/profile/me', { method: 'PATCH', body: changes })
    } catch (err: any) {
      throw new Error(apiErrorMessage(err, 'No pudimos guardar los cambios. Intenta de nuevo.'))
    }
  }

  /** Cambia el correo; el backend pide la contraseña actual para confirmarlo */
  const updateEmail = async (email: string, currentPassword: string) => {
    try {
      const response = await $api<{ message: string; email: string }>('/profile/me/email', {
        method: 'PATCH',
        body: { email, currentPassword },
      })
      if (profile.value) profile.value = { ...profile.value, email: response.email }
      if (user.value) user.value = { ...user.value, email: response.email }
      return response.message
    } catch (err: any) {
      throw new Error(apiErrorMessage(err, 'No pudimos cambiar tu correo. Intenta de nuevo.'))
    }
  }

  return { profile, loading, error, fetchProfile, updateProfile, updateEmail }
}
