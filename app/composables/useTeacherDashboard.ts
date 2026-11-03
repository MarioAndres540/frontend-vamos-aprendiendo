// Tipos alineados con TeacherDashboardData del backend (src/modules/teacher/interfaces)
export interface TeacherInstitution {
  id: string
  name: string
  code?: string
  address?: string
  phone?: string
  email?: string
}

/** Estudiante de un grupo asignado (sin documento: va solo en el detalle) */
export interface TeacherStudent {
  id: string
  firstName: string
  lastName: string
  age: number | null
  hasAccount: boolean
}

/** Asignación académica: grupo de un colegio + materia */
export interface TeacherAssignment {
  id: string
  institutionId: string
  group: { id: string; name: string; grade: string; academicYear: number }
  subject: { id: string; name: string }
  totalStudents: number
  students: TeacherStudent[]
}

export interface TeacherDashboardData {
  teacher: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  institutions: TeacherInstitution[]
  assignments: TeacherAssignment[]
}

/**
 * Datos del dashboard de profesores (GET /teacher/dashboard): solo sus colegios y asignaciones activas
 */
export const useTeacherDashboard = () => {
  const { $api } = useNuxtApp()
  const data = ref<TeacherDashboardData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDashboard = async () => {
    loading.value = true
    error.value = null
    try {
      data.value = await $api<TeacherDashboardData>('/teacher/dashboard')
    } catch (err: any) {
      error.value = err?.data?.message || 'No pudimos cargar tu información. Intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchDashboard }
}
