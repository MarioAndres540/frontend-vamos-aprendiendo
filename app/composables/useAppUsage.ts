// Tipos alineados con PresenceService.getHistory del backend
export type AppEndReason = 'app_closed' | 'logout' | 'timeout'

export interface AppUsageSession {
  sessionId: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number
  endReason: AppEndReason | null
  isOpen: boolean
  student: { id: string; firstName: string; lastName: string } | null
}

export interface AppUsageDay {
  date: string // YYYY-MM-DD en hora de Colombia
  seconds: number
  sessionsCount: number
}

export interface AppUsageHistory {
  days: number
  from: string
  to: string
  summary: {
    sessionsCount: number
    totalSeconds: number
    averageSeconds: number
    longestSeconds: number
    lastStartedAt: string | null
  }
  daily: AppUsageDay[]
  sessions: AppUsageSession[]
}

/**
 * Historial de uso de la app de Unity de la cuenta (GET /presence/history)
 */
export const useAppUsage = () => {
  const { $api } = useNuxtApp()
  const history = ref<AppUsageHistory | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsage = async (days: number) => {
    loading.value = true
    error.value = null
    try {
      history.value = await $api<AppUsageHistory>('/presence/history', { query: { days } })
    } catch (err: any) {
      history.value = null
      error.value = err?.data?.message || 'No pudimos cargar el uso de la app. Intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }

  return { history, loading, error, fetchUsage }
}
