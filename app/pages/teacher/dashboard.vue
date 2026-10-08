<script setup lang="ts">
import fondoImg from '~/assets/img/fondo.png'

// Dashboard de profesores: solo perfil profesor (nunca ve el formulario inicial)
definePageMeta({
  middleware: 'profile-access',
  allowedProfiles: ['profesor'],
})

const { data, loading, error, fetchDashboard } = useTeacherDashboard()
const search = ref('')

onMounted(fetchDashboard)

const teacherName = computed(() =>
  data.value ? `${data.value.teacher.firstName} ${data.value.teacher.lastName}`.trim() : '',
)

const filteredStudents = computed(() => {
  const term = search.value.trim().toLowerCase()
  const students = data.value?.students ?? []
  if (!term) return students
  return students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.documentNumber ?? ''} ${s.grade ?? ''}`.toLowerCase().includes(term),
  )
})

// Grados distintos entre los estudiantes de la institución
const gradesCount = computed(() => new Set((data.value?.students ?? []).map((s) => s.grade).filter(Boolean)).size)

const ageFromBirthDate = (birthDate?: string) => {
  if (!birthDate) return '—'
  const years = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${years} años`
}
</script>

<template>
  <div class="panel-page" :style="{ backgroundImage: `url(${fondoImg})` }">
    <LayoutPanelHeader badge="Docente" :user-name="teacherName" />

    <main class="panel-content">
      <section class="welcome">
        <h1 class="welcome-title">
          Hola{{ data?.teacher.firstName ? `, ${data.teacher.firstName}` : '' }}
        </h1>
        <p class="welcome-text">Este es el resumen de tu institución y tus estudiantes.</p>
      </section>

      <div v-if="loading" class="state-card">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Cargando tu información…</span>
      </div>

      <div v-else-if="error" class="state-card error" role="alert">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ error }}</span>
        <button type="button" class="retry-button" @click="fetchDashboard">Reintentar</button>
      </div>

      <template v-else-if="data">
        <!-- Resumen -->
        <section class="stats-grid" aria-label="Resumen">
          <article class="stat-card">
            <span class="stat-icon tone-blue"><i class="pi pi-building"></i></span>
            <div class="stat-body">
              <span class="stat-label">Institución</span>
              <strong class="stat-value small">{{ data.institution?.name ?? 'Sin institución asignada' }}</strong>
            </div>
          </article>
          <article class="stat-card">
            <span class="stat-icon tone-purple"><i class="pi pi-users"></i></span>
            <div class="stat-body">
              <span class="stat-label">Estudiantes activos</span>
              <strong class="stat-value">{{ data.totalStudents }}</strong>
            </div>
          </article>
          <article class="stat-card">
            <span class="stat-icon tone-green"><i class="pi pi-book"></i></span>
            <div class="stat-body">
              <span class="stat-label">Grados</span>
              <strong class="stat-value">{{ gradesCount }}</strong>
            </div>
          </article>
        </section>

        <!-- Estudiantes -->
        <section class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Estudiantes</h2>
              <p class="card-subtitle">Estudiantes activos de tu institución.</p>
            </div>
            <label class="search-field">
              <i class="pi pi-search"></i>
              <input v-model="search" type="search" placeholder="Buscar por nombre, documento o grado" aria-label="Buscar estudiantes" />
            </label>
          </div>

          <p v-if="!data.institution" class="empty-state">
            Aún no tienes una institución asignada. Cuando tu colegio te vincule, verás aquí a tus estudiantes.
          </p>
          <p v-else-if="filteredStudents.length === 0" class="empty-state">
            {{ search ? 'No hay estudiantes que coincidan con la búsqueda.' : 'Todavía no hay estudiantes registrados en tu institución.' }}
          </p>

          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th scope="col">Estudiante</th>
                  <th scope="col">Documento</th>
                  <th scope="col">Grado</th>
                  <th scope="col">Edad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in filteredStudents" :key="student.id">
                  <td>
                    <span class="person">
                      <span class="avatar">{{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}</span>
                      {{ student.firstName }} {{ student.lastName }}
                    </span>
                  </td>
                  <td>{{ student.documentType }} {{ student.documentNumber ?? '—' }}</td>
                  <td>{{ student.grade ?? '—' }}</td>
                  <td>{{ ageFromBirthDate(student.birthDate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/scss/panel' as *;
</style>
