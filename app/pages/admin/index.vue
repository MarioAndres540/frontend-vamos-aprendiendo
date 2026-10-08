<script setup lang="ts">
import fondoImg from '~/assets/img/fondo.png'
import type { AdminUserRole } from '~/composables/useAdminUsers'

// Panel de administración: solo perfil admin (nunca ve el formulario inicial)
definePageMeta({
  middleware: 'profile-access',
  allowedProfiles: ['admin'],
})

const { users, meta, loading, error, fetchUsers } = useAdminUsers()

const filters = reactive({
  search: '',
  role: '' as AdminUserRole | '',
  page: 1,
})

const roleLabels: Record<AdminUserRole, string> = {
  admin: 'Administrador',
  profesor: 'Docente',
  usuario: 'Usuario',
  test: 'Tester',
}

const load = () => fetchUsers({ page: filters.page, limit: 10, role: filters.role, search: filters.search })

onMounted(load)

// Búsqueda con espera corta para no consultar en cada tecla
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(() => filters.search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.page = 1
    load()
  }, 350)
})

watch(() => filters.role, () => {
  filters.page = 1
  load()
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const goToPage = (page: number) => {
  if (page < 1 || page > meta.value.totalPages) return
  filters.page = page
  load()
}

// Resumen de la página actual
const activeCount = computed(() => users.value.filter((u) => u.is_active).length)
const pendingSetupCount = computed(() =>
  users.value.filter((u) => (u.role === 'usuario' || u.role === 'test') && !u.has_completed_setup).length,
)

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
</script>

<template>
  <div class="panel-page" :style="{ backgroundImage: `url(${fondoImg})` }">
    <LayoutPanelHeader badge="Administrador" />

    <main class="panel-content">
      <section class="welcome">
        <h1 class="welcome-title">Panel de administración</h1>
        <p class="welcome-text">Consulta las cuentas registradas en la plataforma.</p>
      </section>

      <!-- Resumen -->
      <section class="stats-grid" aria-label="Resumen">
        <article class="stat-card">
          <span class="stat-icon tone-blue"><i class="pi pi-users"></i></span>
          <div class="stat-body">
            <span class="stat-label">Usuarios {{ filters.role || filters.search ? '(con filtros)' : 'registrados' }}</span>
            <strong class="stat-value">{{ meta.total }}</strong>
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-icon tone-green"><i class="pi pi-check-circle"></i></span>
          <div class="stat-body">
            <span class="stat-label">Activos en esta página</span>
            <strong class="stat-value">{{ activeCount }}</strong>
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-icon tone-orange"><i class="pi pi-file-edit"></i></span>
          <div class="stat-body">
            <span class="stat-label">Sin formulario inicial (página)</span>
            <strong class="stat-value">{{ pendingSetupCount }}</strong>
          </div>
        </article>
      </section>

      <!-- Usuarios -->
      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Usuarios</h2>
            <p class="card-subtitle">Busca por nombre o correo y filtra por rol.</p>
          </div>
          <div class="toolbar">
            <label class="search-field">
              <i class="pi pi-search"></i>
              <input v-model="filters.search" type="search" placeholder="Buscar por nombre o correo" aria-label="Buscar usuarios" />
            </label>
            <label class="select-field">
              <i class="pi pi-filter"></i>
              <select v-model="filters.role" aria-label="Filtrar por rol">
                <option value="">Todos los roles</option>
                <option v-for="(label, value) in roleLabels" :key="value" :value="value">{{ label }}</option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="error" class="state-card error" role="alert">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ error }}</span>
          <button type="button" class="retry-button" @click="load">Reintentar</button>
        </div>

        <div v-else-if="loading && users.length === 0" class="state-card">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Cargando usuarios…</span>
        </div>

        <p v-else-if="users.length === 0" class="empty-state">No hay usuarios que coincidan con los filtros.</p>

        <div v-else class="table-wrapper" :aria-busy="loading">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Rol</th>
                <th scope="col">Estado</th>
                <th scope="col">Formulario inicial</th>
                <th scope="col">Prueba</th>
                <th scope="col">Registro</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>
                  <span class="person">
                    <span class="avatar">{{ u.first_name?.charAt(0) }}{{ u.last_name?.charAt(0) }}</span>
                    <span>
                      {{ u.first_name }} {{ u.last_name }}
                      <span class="person-detail">{{ u.email }}</span>
                    </span>
                  </span>
                </td>
                <td><span class="pill" :class="`role-${u.role}`">{{ roleLabels[u.role] ?? u.role }}</span></td>
                <td>
                  <span class="pill" :class="u.is_active ? 'status-active' : 'status-inactive'">
                    {{ u.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <template v-if="u.role === 'admin' || u.role === 'profesor'">No aplica</template>
                  <template v-else>{{ u.has_completed_setup ? 'Completado' : 'Pendiente' }}</template>
                </td>
                <td>{{ u.days_remaining !== null ? `${u.days_remaining} días` : '—' }}</td>
                <td>{{ formatDate(u.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="meta.totalPages > 1" class="pagination">
          <span>Página {{ meta.page }} de {{ meta.totalPages }} · {{ meta.total }} usuarios</span>
          <div class="pagination-buttons">
            <button type="button" class="page-button" :disabled="meta.page <= 1 || loading" @click="goToPage(meta.page - 1)">
              <i class="pi pi-angle-left"></i> Anterior
            </button>
            <button type="button" class="page-button" :disabled="meta.page >= meta.totalPages || loading" @click="goToPage(meta.page + 1)">
              Siguiente <i class="pi pi-angle-right"></i>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/scss/panel' as *;
</style>
