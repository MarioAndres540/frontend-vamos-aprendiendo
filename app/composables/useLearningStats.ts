// Tipos alineados con TelemetryService y PresenceService del backend (módulos telemetry y presence)

export interface RouteProgress {
  id: string
  name: string
  total: number
  completed: number
  inProgress: number
  pending: number
  percentCompleted: number
  completedExerciseIds: string[]
}

export interface RouteProgressResponse {
  studentId: string | null
  // false mientras la app de Unity no haya enviado ningún ejercicio de este estudiante
  hasData: boolean
  routes: RouteProgress[]
}

export interface XpHistoryItem {
  exerciseId: string
  label: string
  xp: number
  awardedAt: string
}

export interface XpSummary {
  studentId: string | null
  /** XP ya cobrado en el cofre del juego */
  totalXp: number
  rewardsCount: number
  /** XP de ejercicios aprobados que el jugador aún no cobra en el cofre (no está en totalXp) */
  pendingXp?: number
  history: XpHistoryItem[]
}

export interface MonthlyUsage {
  timeZone: string
  studentId: string | null
  // Mide conexión de la app (latidos), no juego activo
  measures: 'app_connection'
  elapsedDays: number
  current: { from: string; to: string; seconds: number; sessionsCount: number }
  previous: { from: string; to: string; seconds: number; sessionsCount: number; capped: boolean }
  comparison: {
    differenceSeconds: number
    // null si el mes anterior no tiene tiempo (no hay base para comparar)
    percentChange: number | null
    direction: 'up' | 'down' | 'same'
  }
}

/**
 * Estado de una petición del dashboard: el dato, si está cargando y el mensaje de error.
 * Cada consulta falla por separado: una tarjeta sin datos no tumba a las demás.
 */
const useDashboardQuery = <T>(path: string, fallbackError: string) => {
  const { $api } = useNuxtApp()
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchData = async (studentId?: string) => {
    loading.value = true
    error.value = null
    try {
      data.value = await $api<T>(path, { query: studentId ? { studentId } : undefined })
    } catch (err: any) {
      data.value = null
      error.value = apiErrorMessage(err, fallbackError)
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchData }
}

/** Progreso por ruta de aprendizaje (GET /telemetry/route-progress) */
export const useRouteProgress = () =>
  useDashboardQuery<RouteProgressResponse>('/telemetry/route-progress', 'No pudimos cargar el progreso por ruta.')

/** Experiencia acumulada (GET /telemetry/xp) */
export const useXp = () => useDashboardQuery<XpSummary>('/telemetry/xp', 'No pudimos cargar el puntaje.')

/** Tiempo de la app este mes frente al mismo tramo del mes anterior (GET /presence/monthly-usage) */
export const useMonthlyUsage = () =>
  useDashboardQuery<MonthlyUsage>('/presence/monthly-usage', 'No pudimos cargar el tiempo de juego.')
