export interface Institution {
  id: string
  nit: string
  name: string
  type: 'publico' | 'privado'
  city: string
  address: string
  phone?: string
  email?: string
}

export interface PreauthResult {
  isAuthorized: boolean
  preauthId?: string
  fullName?: string
}

export const useInstitutions = () => {
  const { $api } = useNuxtApp()
  const institutions = useState<Institution[]>('institutions_list', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtiene el listado de instituciones públicas y privadas
   */
  const fetchInstitutions = async (params?: { type?: string; search?: string }) => {
    loading.value = true
    error.value = null
    try {
      const data = await $api<Institution[]>('/institutions', {
        method: 'GET',
        query: params,
      })
      institutions.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Error al cargar las instituciones'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Valida si el docente está pre-autorizado por la institución
   */
  const checkTeacherPreauth = async (
    institutionId: string,
    documentNumber: string,
    email: string
  ): Promise<PreauthResult> => {
    loading.value = true
    error.value = null
    try {
      const response = await $api<PreauthResult>('/institutions/preauth-check', {
        method: 'POST',
        body: {
          institutionId,
          documentNumber,
          email,
        },
      })
      return response
    } catch (err: any) {
      const msg = err.data?.message || 'No figuras como docente autorizado por esta institución'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  return {
    institutions,
    loading,
    error,
    fetchInstitutions,
    checkTeacherPreauth,
  }
}
