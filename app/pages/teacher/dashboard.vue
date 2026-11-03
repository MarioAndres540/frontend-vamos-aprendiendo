<script setup lang="ts">
import fondoImg from '~/assets/img/fondo.png'

// Dashboard de profesores: solo perfil profesor (nunca ve el formulario inicial).
// Muestra únicamente los grupos y materias que tiene asignados y, por cada uno, sus indicadores escolares
// (spec 0001: backend/docs/specs/0001-modulo-profesor.md). Nunca datos del hogar ni documentos en el listado.
definePageMeta({
  middleware: 'profile-access',
  allowedProfiles: ['profesor'],
})

const route = useRoute()
const router = useRouter()
const { data, loading, error, fetchDashboard } = useTeacherDashboard()
const { data: summary, loading: summaryLoading, error: summaryError, fetchSummary } = useAssignmentSummary()

const search = ref('')
const onlyWithoutData = ref(false)

onMounted(fetchDashboard)

const teacherName = computed(() =>
  data.value ? `${data.value.teacher.firstName} ${data.value.teacher.lastName}`.trim() : '',
)

const institutionName = (id: string) => data.value?.institutions.find((i) => i.id === id)?.name ?? 'Colegio'

// Con varios colegios el nombre del colegio va en la etiqueta para distinguir grupos que se llaman igual
const assignmentLabel = (a: { institutionId: string; group: { name: string }; subject: { name: string } }) => {
  const base = `${a.group.name} · ${a.subject.name}`
  return (data.value?.institutions.length ?? 0) > 1 ? `${institutionName(a.institutionId)} · ${base}` : base
}

const assignments = computed(() => data.value?.assignments ?? [])

// La asignación elegida va en la URL (?asignacion=): al volver del seguimiento de un estudiante se conserva
const selected = computed(() => {
  const wanted = typeof route.query.asignacion === 'string' ? route.query.asignacion : null
  return assignments.value.find((a) => a.id === wanted) ?? assignments.value[0] ?? null
})

const selectAssignment = (id: string) => {
  router.replace({ query: { ...route.query, asignacion: id } })
}

watch(
  () => selected.value?.id,
  (id) => {
    search.value = ''
    onlyWithoutData.value = false
    if (id) fetchSummary(id)
  },
  { immediate: true },
)

const filteredStudents = computed(() => {
  let students = summary.value?.students ?? []
  if (onlyWithoutData.value) students = students.filter((s) => !s.hasData)
  const term = normalizeText(search.value.trim())
  if (!term) return students
  return students.filter((s) => normalizeText(`${s.firstName} ${s.lastName}`).includes(term))
})

const studentLink = (studentId: string) =>
  selected.value ? `/teacher/assignments/${selected.value.id}/students/${studentId}` : '#'
</script>

<template>
  <div class="panel-page" :style="{ backgroundImage: `url(${fondoImg})` }">
    <LayoutPanelHeader badge="Docente" :user-name="teacherName" />

    <main class="panel-content">
      <section class="welcome">
        <h1 class="welcome-title">
          Hola{{ data?.teacher.firstName ? `, ${data.teacher.firstName}` : '' }}
        </h1>
        <p class="welcome-text">Estos son los grupos y materias que tienes asignados.</p>
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
        <p v-if="!data.institutions.length" class="card empty-state">
          Aún no tienes un colegio asignado. Cuando tu colegio te vincule, verás aquí a tus grupos.
        </p>
        <p v-else-if="!selected" class="card empty-state">
          Todavía no tienes grupos asignados. El colegio debe asignarte un grupo y una materia.
        </p>

        <template v-else>
          <!-- Grupo y materia elegidos -->
          <section class="assignment-bar">
            <div>
              <h2 class="assignment-title">{{ selected.group.name }} · {{ selected.subject.name }}</h2>
              <p class="card-subtitle">{{ selected.group.grade }} · {{ institutionName(selected.institutionId) }}</p>
            </div>
            <label v-if="assignments.length > 1" class="select-field">
              <i class="pi pi-sitemap"></i>
              <select
                :value="selected.id"
                aria-label="Elegir grupo y materia"
                @change="selectAssignment(($event.target as HTMLSelectElement).value)"
              >
                <option v-for="a in assignments" :key="a.id" :value="a.id">{{ assignmentLabel(a) }}</option>
              </select>
            </label>
          </section>

          <div v-if="summaryError" class="state-card error" role="alert">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ summaryError }}</span>
            <button type="button" class="retry-button" @click="fetchSummary(selected.id)">Reintentar</button>
          </div>

          <template v-else>
            <!-- Indicadores del grupo: solo actividad escolar -->
            <section class="stats-grid" aria-label="Indicadores del grupo" :aria-busy="summaryLoading">
              <article class="stat-card">
                <span class="stat-icon tone-purple"><i class="pi pi-users"></i></span>
                <div class="stat-body">
                  <span class="stat-label">Matriculados</span>
                  <strong class="stat-value">{{ summary?.enrolled ?? '…' }}</strong>
                  <span v-if="summary" class="stat-note">{{ summary.withActiveLicense }} con licencia vigente</span>
                </div>
              </article>
              <article class="stat-card">
                <span class="stat-icon tone-green"><i class="pi pi-bolt"></i></span>
                <div class="stat-body">
                  <span class="stat-label">Activos en el colegio</span>
                  <strong class="stat-value">{{ summary?.activeRecently ?? '…' }}</strong>
                  <span v-if="summary" class="stat-note">últimos {{ summary.activeWindowDays }} días</span>
                </div>
              </article>
              <article class="stat-card">
                <span class="stat-icon tone-blue"><i class="pi pi-chart-line"></i></span>
                <div class="stat-body">
                  <span class="stat-label">Dominio promedio</span>
                  <strong class="stat-value" :class="{ small: summary && summary.averageMastery === null }">
                    {{ !summary ? '…' : summary.averageMastery === null ? 'Sin datos aún' : `${summary.averageMastery}%` }}
                  </strong>
                  <span v-if="summary" class="stat-note">
                    {{ summary.enrolled - summary.withoutData }} de {{ summary.enrolled }} con actividad en
                    {{ selected.subject.name }}
                  </span>
                </div>
              </article>
            </section>

            <!-- Estudiantes del grupo -->
            <section class="card">
              <div class="card-header">
                <div>
                  <h2 class="card-title">Estudiantes</h2>
                  <p class="card-subtitle">
                    Dominio = ejercicios de {{ selected.subject.name }} aprobados en el colegio
                    <template v-if="summary">(de {{ summary.totalExercises }})</template>.
                  </p>
                </div>
                <div class="toolbar">
                  <label class="search-field">
                    <i class="pi pi-search"></i>
                    <input v-model="search" type="search" placeholder="Buscar por nombre" aria-label="Buscar estudiantes" />
                  </label>
                  <label class="check-field">
                    <input v-model="onlyWithoutData" type="checkbox" />
                    Solo sin actividad
                  </label>
                </div>
              </div>

              <div v-if="summaryLoading && !summary" class="state-card">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Cargando estudiantes…</span>
              </div>

              <p v-else-if="filteredStudents.length === 0" class="empty-state">
                {{
                  search || onlyWithoutData
                    ? 'No hay estudiantes que coincidan con el filtro.'
                    : 'Este grupo todavía no tiene estudiantes matriculados.'
                }}
              </p>

              <div v-else class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Estudiante</th>
                      <th scope="col">Dominio</th>
                      <th scope="col">Aprobados</th>
                      <th scope="col">Intentos</th>
                      <th scope="col">Último intento</th>
                      <th scope="col"><span class="visually-hidden">Acciones</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="student in filteredStudents" :key="student.id">
                      <td>
                        <span class="person">
                          <span class="avatar">{{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}</span>
                          <span>
                            {{ student.firstName }} {{ student.lastName }}
                            <span v-if="!student.hasAccount" class="pill status-inactive">Sin cuenta</span>
                          </span>
                        </span>
                      </td>
                      <td>
                        <span v-if="student.mastery === null" class="pill status-inactive">Sin datos</span>
                        <span v-else class="mastery">
                          <span class="mastery-track" aria-hidden="true">
                            <span class="mastery-fill" :style="{ width: `${student.mastery}%` }"></span>
                          </span>
                          {{ student.mastery }}%
                        </span>
                      </td>
                      <td>{{ student.completed }} de {{ student.total }}</td>
                      <td>{{ student.attempts }}</td>
                      <td>{{ relativeDay(student.lastActivityAt) }}</td>
                      <td>
                        <NuxtLink :to="studentLink(student.id)" class="row-link">
                          Ver seguimiento <i class="pi pi-arrow-right"></i>
                        </NuxtLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </template>
        </template>

        <TeacherRecentActivityCard />
      </template>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/scss/panel' as *;

.assignment-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.assignment-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.stat-note {
  font-size: 12px;
  color: #64748b;
}

.check-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;

  input {
    width: 16px;
    height: 16px;
    accent-color: #3b50df;
  }
}

.mastery {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.mastery-track {
  width: 72px;
  height: 8px;
  border-radius: 9999px;
  background: #eef2f7;
  overflow: hidden;
}

.mastery-fill {
  display: block;
  height: 100%;
  border-radius: 9999px;
  background: #3b50df;
}

.row-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #3b50df;
  text-decoration: none;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
