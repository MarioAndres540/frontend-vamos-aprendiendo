// Tipos alineados con TelemetryService del backend (src/modules/telemetry)
export interface CategoryProgress {
  id: string
  name: string
  description: string | null
  level: number
  score: number
  initialScore: number
  goal: number
  played: boolean
  updatedAt: string | null
}

export type MetricStatus = 'within' | 'below' | 'above'

export interface PerformanceMetric {
  key: string
  label: string
  unit: '%' | 's'
  value: number | null
  samples: number
  expectedMin: number | null
  expectedMax: number | null
  status: MetricStatus | null
}

export interface PerformanceAlert {
  createdAt: string
  element: string
  expected: string
  message: string
}

export interface PerformanceResponse {
  studentId: string | null
  age: number | null
  days: number
  from: string
  gameSessionsCount: number
  metrics: PerformanceMetric[]
  alerts: PerformanceAlert[]
}

const apiErrorMessage = (err: any, fallback: string) => {
  const message = err?.data?.message
  if (Array.isArray(message) && message.length > 0) return message.join('. ')
  if (typeof message === 'string' && message.trim()) return message
  return fallback
}

/**
 * Progreso por categoría cognitiva (GET /telemetry/progress). Sin studentId: el del propio usuario.
 */
export const useCategoryProgress = () => {
  const { $api } = useNuxtApp()
  const categories = ref<CategoryProgress[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProgress = async (studentId?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await $api<{ categories: CategoryProgress[] }>('/telemetry/progress', {
        query: studentId ? { studentId } : undefined,
      })
      categories.value = response.categories
    } catch (err: any) {
      categories.value = []
      error.value = apiErrorMessage(err, 'No pudimos cargar las actividades. Intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }

  return { categories, loading, error, fetchProgress }
}

/**
 * Desempeño en el juego frente a lo esperado para la edad (GET /telemetry/performance)
 */
export const usePerformance = () => {
  const { $api } = useNuxtApp()
  const performance = ref<PerformanceResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPerformance = async (days: number, studentId?: string) => {
    loading.value = true
    error.value = null
    try {
      performance.value = await $api<PerformanceResponse>('/telemetry/performance', {
        query: studentId ? { studentId, days } : { days },
      })
    } catch (err: any) {
      performance.value = null
      error.value = apiErrorMessage(err, 'No pudimos cargar el desempeño en el juego. Intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }

  return { performance, loading, error, fetchPerformance }
}
