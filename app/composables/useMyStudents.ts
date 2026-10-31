import type { AssessmentAnswer, RiskLevel } from '~/utils/assessment-areas'

// Tipos alineados con MyStudentsResponse del backend (src/modules/students/interfaces)
export interface StudentAssessmentSummary {
  id: string
  targetType: 'nino' | 'adulto'
  totalScore: number
  maxScore: number
  riskLevel: RiskLevel
  primaryCondition: string | null
  recommendations: string | null
  answers: AssessmentAnswer[]
  createdAt: string
}

export interface MyStudent {
  id: string
  firstName: string
  lastName: string
  documentType: string | null
  documentNumber: string | null
  grade: string | null
  age: number | null
  birthDate: string | null
  relationship: string | null
  institution: { id: string; name: string } | null
  latestAssessment: StudentAssessmentSummary | null
}

export interface MyStudentsResponse {
  totalStudents: number
  students: MyStudent[]
}

// Datos para agregar un hijo o menor (CreateChildItemDto del backend)
export interface NewStudentPayload {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  birthDate: string
  age: number
  grade?: string
  institutionId?: string
}

const apiErrorMessage = (err: any, fallback: string) => {
  const message = err?.data?.message
  if (Array.isArray(message) && message.length > 0) return message.join('. ')
  if (typeof message === 'string' && message.trim()) return message
  return fallback
}

/**
 * Hijos vinculados a la cuenta del tutor. El estado es compartido: el menú del encabezado, la tarjeta
 * "Tutor de" del dashboard y la vista de Configuración ven la misma lista y el mismo hijo seleccionado.
 */
export const useMyStudents = () => {
  const { $api } = useNuxtApp()
  const students = useState<MyStudent[]>('my_students', () => [])
  const loaded = useState<boolean>('my_students_loaded', () => false)
  const loading = useState<boolean>('my_students_loading', () => false)
  const error = useState<string | null>('my_students_error', () => null)

  // Hijo elegido en el menú del encabezado; el id se conserva al recargar la página
  const selectedId = useCookie<string | null>('selected_student_id', SESSION_COOKIE_OPTIONS)
  const selected = useState<MyStudent | null>('selected_student', () => null)
  const selectingId = useState<string | null>('selecting_student_id', () => null)
  const selectError = useState<string | null>('select_student_error', () => null)

  /** GET /students/mine. Con force = false no repite la consulta si ya se cargó. */
  const fetchStudents = async (force = false) => {
    if (loading.value || (loaded.value && !force)) return
    loading.value = true
    error.value = null
    try {
      const response = await $api<MyStudentsResponse>('/students/mine')
      students.value = response.students
      loaded.value = true

      // Mantiene el hijo seleccionado (o el de la cookie); si ya no existe, toma el primero
      const keepId = selected.value?.id ?? selectedId.value
      const current = response.students.find((s) => s.id === keepId) ?? response.students[0] ?? null
      selected.value = current
      selectedId.value = current?.id ?? null
    } catch (err: any) {
      error.value = apiErrorMessage(err, 'No pudimos cargar tus estudiantes. Intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }

  /** GET /students/:id: trae del backend la información del hijo elegido en el menú */
  const selectStudent = async (id: string) => {
    selectingId.value = id
    selectError.value = null
    try {
      const student = await $api<MyStudent>(`/students/${id}`)
      selected.value = student
      selectedId.value = student.id
      // Refresca también la lista, por si cambió algo (ej. un formulario recién completado)
      students.value = students.value.map((s) => (s.id === student.id ? student : s))
      return student
    } catch (err: any) {
      selectError.value = apiErrorMessage(err, 'No pudimos cargar la información de este estudiante.')
      return null
    } finally {
      selectingId.value = null
    }
  }

  /** POST /students: agrega un hijo o menor a la cuenta */
  const createStudent = async (payload: NewStudentPayload) => {
    const student = await $api<MyStudent>('/students', { method: 'POST', body: payload })
    students.value = [...students.value, student].sort((a, b) => a.firstName.localeCompare(b.firstName, 'es'))
    loaded.value = true
    return student
  }

  /** Al cerrar sesión: que la siguiente cuenta no vea los hijos de esta */
  const resetStudents = () => {
    students.value = []
    loaded.value = false
    selected.value = null
    selectedId.value = null
  }

  return {
    students,
    loaded,
    loading,
    error,
    selected,
    selectingId,
    selectError,
    fetchStudents,
    selectStudent,
    createStudent,
    resetStudents,
  }
}

// GET /assessments/history responde las filas de initial_assessments tal cual (snake_case)
const mapAssessmentRow = (row: any): StudentAssessmentSummary => ({
  id: row.id,
  targetType: row.target_type,
  totalScore: row.total_score,
  maxScore: row.max_score,
  riskLevel: row.risk_level,
  primaryCondition: row.primary_condition ?? null,
  recommendations: row.recommendations ?? null,
  answers: Array.isArray(row.answers) ? row.answers : [],
  createdAt: row.created_at,
})

/**
 * Formularios iniciales, del más reciente al más antiguo (GET /assessments/history).
 * Con studentId: los de ese hijo (el backend verifica que sea de la cuenta); sin él: los que llenó el usuario.
 */
export const useAssessmentHistory = () => {
  const { $api } = useNuxtApp()
  const history = ref<StudentAssessmentSummary[]>([])
  const loading = ref(false)
  // true después de la primera respuesta (con o sin error)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const fetchHistory = async (studentId?: string) => {
    loading.value = true
    error.value = null
    try {
      const rows = await $api<any[]>('/assessments/history', { query: studentId ? { studentId } : undefined })
      history.value = rows.map(mapAssessmentRow)
    } catch (err: any) {
      history.value = []
      error.value = apiErrorMessage(err, 'No pudimos cargar el historial de formularios. Intenta de nuevo.')
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  return { history, loading, loaded, error, fetchHistory }
}

/**
 * Último formulario inicial que llenó el propio usuario. Para adultos y testers.
 */
export const useMyLatestAssessment = () => {
  const { history, loading, loaded, error, fetchHistory } = useAssessmentHistory()
  const assessment = computed(() => history.value[0] ?? null)
  const fetchLatest = () => fetchHistory()
  return { assessment, loading, loaded, error, fetchLatest }
}
