// Tipos alineados con AdminService.findAll del backend (GET /admin/users)
export type AdminUserRole = 'admin' | 'usuario' | 'test' | 'profesor'

export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  document_type: string
  document_number: string
  phone: string
  role: AdminUserRole
  is_active: boolean
  has_completed_setup: boolean | null
  institution_id: string | null
  trial_ends_at: string | null
  created_at: string
  days_remaining: number | null
}

export interface AdminUsersQuery {
  page?: number
  limit?: number
  role?: AdminUserRole | ''
  search?: string
}

export interface AdminUsersResponse {
  data: AdminUser[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * Gestión de usuarios para el perfil administrador
 */
export const useAdminUsers = () => {
  const { $api } = useNuxtApp()
  const users = ref<AdminUser[]>([])
  const meta = ref<AdminUsersResponse['meta']>({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsers = async (query: AdminUsersQuery = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await $api<AdminUsersResponse>('/admin/users', {
        query: {
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          role: query.role || undefined,
          search: query.search?.trim() || undefined,
        },
      })
      users.value = response.data
      meta.value = response.meta
    } catch (err: any) {
      error.value = err?.data?.message || 'No pudimos cargar los usuarios. Intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }

  return { users, meta, loading, error, fetchUsers }
}
