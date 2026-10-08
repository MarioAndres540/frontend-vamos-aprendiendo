// Tipos alineados con TeacherDashboardData del backend (src/modules/teacher/interfaces)
export interface TeacherInstitution {
  id: string
  name: string
  code?: string
  address?: string
  phone?: string
  email?: string
}

export interface TeacherStudent {
  id: string
  firstName: string
  lastName: string
  documentType?: string
  documentNumber?: string
  grade: string | null
  birthDate?: string
  isActive: boolean
}

export interface TeacherDashboardData {
  teacher: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  institution: TeacherInstitution | null
  totalStudents: number
  students: TeacherStudent[]
}

/**
 * Datos del dashboard de profesores (GET /teacher/dashboard)
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
