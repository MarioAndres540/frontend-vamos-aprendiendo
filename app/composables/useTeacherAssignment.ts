// Tipos alineados con AssignmentSummary y TeacherStudentDetail del backend (src/modules/teacher/interfaces).
// Spec 0001: backend/docs/specs/0001-modulo-profesor.md. Solo datos del contexto escolar.

export interface AssignmentStudentSummary {
  id: string
  firstName: string
  lastName: string
  age: number | null
  hasAccount: boolean
  completed: number
  total: number
  /** Aprobados / total en %. null sin datos */
  mastery: number | null
  attempts: number
  lastActivityAt: string | null
  hasData: boolean
}

export interface AssignmentSummary {
  assignment: {
    id: string
    institution: { id: string; name: string }
    group: { id: string; name: string; grade: string; academicYear: number }
    subject: { id: string; name: string }
  }
  totalExercises: number
  enrolled: number
  withActiveLicense: number
  activeRecently: number
  activeWindowDays: number
  averageMastery: number | null
  withoutData: number
  students: AssignmentStudentSummary[]
}

export type ExerciseStatus = 'completed' | 'in_progress' | 'pending'

export interface TeacherStudentDetail {
  student: {
    id: string
    firstName: string
    lastName: string
    birthDate: string | null
    age: number | null
    documentType: string | null
    documentNumber: string | null
  }
  institution: { id: string; name: string }
  group: { id: string; name: string; grade: string; academicYear: number }
  subjects: {
    id: string
    name: string
    averageAccuracy: number | null
    lastActivityAt: string | null
    routes: {
      id: string
      name: string
      total: number
      completed: number
      inProgress: number
      pending: number
      exercises: { id: string; label: string; status: ExerciseStatus; attempts: number; bestAccuracy: number | null }[]
    }[]
  }[]
  xp: { total: number }
  appTime: { days: number; seconds: number }
}

/** Indicadores de un grupo y materia asignados (GET /teacher/assignments/:id/summary) */
export const useAssignmentSummary = () => {
  const { $api } = useNuxtApp()
  const data = ref<AssignmentSummary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  // Evita que una respuesta lenta de otro grupo pise la del grupo elegido
  let requestId = 0

  const fetchSummary = async (assignmentId: string) => {
    const current = ++requestId
    loading.value = true
    error.value = null
    try {
      const result = await $api<AssignmentSummary>(`/teacher/assignments/${assignmentId}/summary`)
      if (current === requestId) data.value = result
    } catch (err: any) {
      if (current === requestId) {
        data.value = null
        error.value = apiErrorMessage(err, 'No pudimos cargar los indicadores del grupo. Intenta de nuevo.')
      }
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  return { data, loading, error, fetchSummary }
}

/** Seguimiento escolar de un estudiante (GET /teacher/assignments/:id/students/:studentId) */
export const useTeacherStudent = () => {
  const { $api } = useNuxtApp()
  const data = ref<TeacherStudentDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notFound = ref(false)

  const fetchStudent = async (assignmentId: string, studentId: string) => {
    loading.value = true
    error.value = null
    notFound.value = false
    try {
      data.value = await $api<TeacherStudentDetail>(`/teacher/assignments/${assignmentId}/students/${studentId}`)
    } catch (err: any) {
      data.value = null
      notFound.value = err?.response?.status === 404
      error.value = notFound.value
        ? 'Este estudiante no está en tus grupos.'
        : apiErrorMessage(err, 'No pudimos cargar el seguimiento del estudiante. Intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, notFound, fetchStudent }
}
