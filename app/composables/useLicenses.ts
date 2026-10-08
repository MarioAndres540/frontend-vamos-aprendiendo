export type LicensePlan = 'free' | 'trial' | 'pro'
export type LicenseOrigin = 'personal' | 'institucional'

export interface EffectiveLicense {
  planType: LicensePlan
  origin: LicenseOrigin
  isActive: boolean
  startsAt: string
  expiresAt: string | null
  daysRemaining: number | null
  institutionName?: string | null
  features: {
    unlimitedActivities: boolean
    advancedAnalytics: boolean
    multiProfile: boolean
    exportReports: boolean
  }
}

export const useLicenses = () => {
  const { $api } = useNuxtApp()
  const currentLicense = useState<EffectiveLicense | null>('current_license', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtiene los beneficios y días restantes del plan vigente
   */
  const fetchCurrentLicense = async (studentId?: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await $api<EffectiveLicense>('/licenses/current', {
        method: 'GET',
        query: studentId ? { studentId } : undefined,
      })
      currentLicense.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Error al consultar la licencia'
      return null
    } finally {
      loading.value = false
    }
  }

  const isPro = computed(() => currentLicense.value?.planType === 'pro' && currentLicense.value?.isActive)
  const isTrial = computed(() => currentLicense.value?.planType === 'trial' && currentLicense.value?.isActive)
  const isFree = computed(() => currentLicense.value?.planType === 'free' || !currentLicense.value?.isActive)

  return {
    currentLicense,
    loading,
    error,
    isPro,
    isTrial,
    isFree,
    fetchCurrentLicense,
  }
}
