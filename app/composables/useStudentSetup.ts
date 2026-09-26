/**
 * useStudentSetup
 * Composable para enviar el diagnóstico inicial del estudiante al backend
 * y actualizar el estado local de autenticación.
 *
 * Endpoint: POST /students/setup
 */

export interface StudentSetupPayload {
  mode: 'kids' | 'adults'
  // Kids
  superPower?: string
  chosenRealm?: string
  selfEfficacy?: number
  playStyles?: string[]
  // Adults
  cognitiveGoal?: string
  learningStyle?: string
  topicInterests?: string[]
}

export const useStudentSetup = () => {
  const { $api } = useNuxtApp()
  const { user, hasChildProfile } = useAuth()

  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Envía los datos del diagnóstico al backend y actualiza el estado local.
   * Después de un envío exitoso, la cookie has_child_profile queda en true
   * y user.hasCompletedSetup también se actualiza.
   */
  const submitSetup = async (payload: StudentSetupPayload): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await $api<{ success: boolean }>('/students/setup', {
        method: 'POST',
        body: payload,
      })

      // Actualizar estado local para que el middleware y el auth lo reflejen
      hasChildProfile.value = true
      if (user.value) {
        user.value = { ...user.value, hasCompletedSetup: true }
      }

      return true
    } catch (err: any) {
      console.error('[useStudentSetup] Error al guardar diagnóstico:', err)
      error.value =
        err.data?.message ||
        err.message ||
        'No se pudo guardar la configuración. Intenta nuevamente.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Consulta el backend para verificar si el usuario ya completó el setup.
   * Útil para sincronización entre dispositivos.
   */
  const fetchSetupStatus = async (): Promise<boolean> => {
    try {
      const data = await $api<{ hasCompletedSetup: boolean }>('/students/setup-status', {
        method: 'GET',
      })
      hasChildProfile.value = data.hasCompletedSetup
      if (user.value) {
        user.value = { ...user.value, hasCompletedSetup: data.hasCompletedSetup }
      }
      return data.hasCompletedSetup
    } catch {
      return false
    }
  }

  return {
    loading,
    error,
    submitSetup,
    fetchSetupStatus,
  }
}
