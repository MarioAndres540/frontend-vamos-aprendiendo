// Tipos alineados con PresenceService.getAppStatus del backend (GET /presence/me)
export interface AppSessionStudent {
  id: string
  firstName: string
  lastName: string
}

export interface AppStatus {
  client: 'unity' | 'web'
  isOnline: boolean
  serverTime: string
  heartbeatIntervalSeconds: number
  timeoutSeconds: number
  current: {
    sessionId: string
    startedAt: string
    lastHeartbeatAt: string
    durationSeconds: number
    deviceInfo: string | null
    student: AppSessionStudent | null
  } | null
  lastSession: {
    sessionId: string
    startedAt: string
    endedAt: string
    durationSeconds: number
    endReason: 'app_closed' | 'logout' | 'timeout' | null
    deviceInfo: string | null
    student: AppSessionStudent | null
  } | null
  today: {
    sessionsCount: number
    totalSeconds: number
  }
}

// Cada cuánto se consulta el estado (el backend da la sesión por terminada tras 45 s sin latidos)
const POLL_INTERVAL_MS = 10_000

/**
 * Estado de conexión de la app de Unity para la cuenta actual (tutor o adulto).
 * Consulta el backend periódicamente y mantiene un reloj local para que la duración
 * de la sesión activa avance cada segundo.
 */
export const useAppPresence = () => {
  const { $api } = useNuxtApp()
  const status = ref<AppStatus | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Diferencia entre el reloj del servidor y el del navegador, para no depender de la hora del equipo
  const clockOffsetMs = ref(0)
  const nowMs = ref(Date.now())

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let tickTimer: ReturnType<typeof setInterval> | null = null

  const fetchStatus = async () => {
    if (!status.value) loading.value = true
    try {
      const response = await $api<AppStatus>('/presence/me')
      clockOffsetMs.value = new Date(response.serverTime).getTime() - Date.now()
      status.value = response
      error.value = null
    } catch (err: any) {
      error.value = err?.data?.message || 'No pudimos consultar el estado de la app.'
    } finally {
      loading.value = false
    }
  }

  // Segundos de la sesión activa, calculados en vivo
  const liveDurationSeconds = computed(() => {
    const current = status.value?.current
    if (!current) return 0
    const serverNow = nowMs.value + clockOffsetMs.value
    return Math.max(0, Math.floor((serverNow - new Date(current.startedAt).getTime()) / 1000))
  })

  // Total del día, sumando en vivo la sesión activa
  const liveTodaySeconds = computed(() => {
    const today = status.value?.today
    if (!today) return 0
    const current = status.value?.current
    if (!current) return today.totalSeconds
    // El total del backend ya incluye la sesión activa hasta serverTime; se suma lo transcurrido desde entonces
    const elapsedSinceResponse = Math.max(
      0,
      Math.floor((nowMs.value + clockOffsetMs.value - new Date(status.value!.serverTime).getTime()) / 1000),
    )
    return today.totalSeconds + elapsedSinceResponse
  })

  // Pausa la consulta cuando la pestaña no está visible y la reanuda al volver
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') fetchStatus()
  }

  onMounted(() => {
    fetchStatus()
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') fetchStatus()
    }, POLL_INTERVAL_MS)
    tickTimer = setInterval(() => {
      nowMs.value = Date.now()
    }, 1000)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
    if (tickTimer) clearInterval(tickTimer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return { status, loading, error, liveDurationSeconds, liveTodaySeconds, refresh: fetchStatus }
}
