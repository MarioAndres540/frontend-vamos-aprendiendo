<script setup lang="ts">
import fondoImg from '~/assets/img/fondo.png'
import type { ExerciseStatus } from '~/composables/useTeacherAssignment'

// Seguimiento escolar de un estudiante, visto por su profesor (spec 0001, TPROG). Solo datos del colegio:
// lo que el niño hace en casa con la cuenta de su tutor no aparece. La consulta queda registrada en el backend.
definePageMeta({
  middleware: 'profile-access',
  allowedProfiles: ['profesor'],
})

const route = useRoute()
const assignmentId = computed(() => String(route.params.assignmentId))
const studentId = computed(() => String(route.params.studentId))

const { data, loading, error, notFound, fetchStudent } = useTeacherStudent()
const { data: dashboard, fetchDashboard } = useTeacherDashboard()

const load = () => fetchStudent(assignmentId.value, studentId.value)
onMounted(() => {
  load()
  fetchDashboard()
})
watch([assignmentId, studentId], load)

const teacherName = computed(() =>
  dashboard.value ? `${dashboard.value.teacher.firstName} ${dashboard.value.teacher.lastName}`.trim() : '',
)
const backLink = computed(() => ({ path: '/teacher/dashboard', query: { asignacion: assignmentId.value } }))

const fullName = computed(() => (data.value ? `${data.value.student.firstName} ${data.value.student.lastName}` : ''))

const STATUS_LABELS: Record<ExerciseStatus, string> = {
  completed: 'Aprobado',
  in_progress: 'En progreso',
  pending: 'Pendiente',
}

const progressPercent = (completed: number, total: number) => (total ? Math.round((completed / total) * 100) : 0)
</script>

<template>
  <div class="panel-page" :style="{ backgroundImage: `url(${fondoImg})` }">
    <LayoutPanelHeader badge="Docente" :user-name="teacherName" />

    <main class="panel-content">
      <NuxtLink :to="backLink" class="back-link"><i class="pi pi-arrow-left"></i> Volver al grupo</NuxtLink>

      <div v-if="loading && !data" class="state-card">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Cargando el seguimiento…</span>
      </div>

      <div v-else-if="error" class="state-card error" role="alert">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ error }}</span>
        <button v-if="!notFound" type="button" class="retry-button" @click="load">Reintentar</button>
      </div>

      <template v-else-if="data">
        <section class="welcome">
          <h1 class="welcome-title">{{ fullName }}</h1>
          <p class="welcome-text">
            {{ data.group.grade }} · Grupo {{ data.group.name }} · {{ data.institution.name }}
          </p>
        </section>

        <!-- Resumen escolar -->
        <section class="stats-grid" aria-label="Resumen escolar">
          <article class="stat-card">
            <span class="stat-icon tone-orange"><i class="pi pi-star"></i></span>
            <div class="stat-body">
              <span class="stat-label">XP en el colegio</span>
              <strong class="stat-value">{{ data.xp.total.toLocaleString('es-CO') }}</strong>
            </div>
          </article>
          <article class="stat-card">
            <span class="stat-icon tone-blue"><i class="pi pi-clock"></i></span>
            <div class="stat-body">
              <span class="stat-label">Tiempo de juego en el colegio</span>
              <strong class="stat-value small">{{ formatDuration(data.appTime.seconds) }}</strong>
              <span class="stat-note">últimos {{ data.appTime.days }} días</span>
            </div>
          </article>
        </section>

        <!-- Datos personales: solo en esta vista de detalle -->
        <section class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Datos del estudiante</h2>
              <p class="card-subtitle">Información personal de un menor: úsala solo para el seguimiento escolar.</p>
            </div>
          </div>
          <dl class="details-grid">
            <div>
              <dt>Nombre completo</dt>
              <dd>{{ fullName }}</dd>
            </div>
            <div>
              <dt>Fecha de nacimiento</dt>
              <dd>
                {{ longDate(data.student.birthDate) }}
                <template v-if="data.student.age != null"> ({{ data.student.age }} años)</template>
              </dd>
            </div>
            <div>
              <dt>Documento</dt>
              <dd>{{ data.student.documentType ?? '—' }} {{ data.student.documentNumber ?? '' }}</dd>
            </div>
            <div>
              <dt>Colegio</dt>
              <dd>{{ data.institution.name }}</dd>
            </div>
            <div>
              <dt>Grado y grupo</dt>
              <dd>{{ data.group.grade }} · {{ data.group.name }}</dd>
            </div>
            <div>
              <dt>Materias contigo</dt>
              <dd>{{ data.subjects.map((s) => s.name).join(', ') }}</dd>
            </div>
          </dl>
        </section>

        <!-- Progreso por materia asignada -->
        <section v-for="subject in data.subjects" :key="subject.id" class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">{{ subject.name }}</h2>
              <p class="card-subtitle">
                Exactitud promedio:
                <strong>{{ subject.averageAccuracy === null ? 'sin intentos' : `${subject.averageAccuracy}%` }}</strong>
                · Último intento: {{ relativeDay(subject.lastActivityAt) }}
              </p>
            </div>
          </div>

          <p v-if="!subject.routes.length" class="empty-state">Esta materia todavía no tiene rutas de aprendizaje en el juego.</p>

          <div v-for="routeItem in subject.routes" :key="routeItem.id" class="route-block">
            <div class="route-head">
              <h3 class="route-title">Ruta {{ routeItem.name }}</h3>
              <span class="route-counts">
                {{ routeItem.completed }} aprobados · {{ routeItem.inProgress }} en progreso · {{ routeItem.pending }} pendientes
              </span>
            </div>
            <div
              class="route-track"
              role="progressbar"
              :aria-valuenow="progressPercent(routeItem.completed, routeItem.total)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Ruta ${routeItem.name}: ${routeItem.completed} de ${routeItem.total} aprobados`"
            >
              <span class="route-fill" :style="{ width: `${progressPercent(routeItem.completed, routeItem.total)}%` }"></span>
            </div>

            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th scope="col">Ejercicio</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Intentos</th>
                    <th scope="col">Mejor exactitud</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="exercise in routeItem.exercises" :key="exercise.id">
                    <td>{{ exercise.label }}</td>
                    <td>
                      <span class="pill" :class="`exercise-${exercise.status}`">{{ STATUS_LABELS[exercise.status] }}</span>
                    </td>
                    <td>{{ exercise.attempts }}</td>
                    <td>{{ exercise.bestAccuracy === null ? '—' : `${exercise.bestAccuracy}%` }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '../../../../../assets/scss/panel' as *;

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #3b50df;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
}

.stat-note {
  font-size: 12px;
  color: #64748b;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px 24px;
  margin: 0;

  dt {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  dd {
    margin: 4px 0 0;
    font-size: 15px;
    color: #1e293b;
  }
}

.route-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.route-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.route-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.route-counts {
  font-size: 13px;
  color: #64748b;
}

.route-track {
  height: 10px;
  border-radius: 9999px;
  background: #eef2f7;
  overflow: hidden;
}

.route-fill {
  display: block;
  height: 100%;
  border-radius: 9999px;
  background: #10b981;
}

.pill {
  &.exercise-completed {
    background: #ecfdf5;
    color: #047857;
  }

  &.exercise-in_progress {
    background: #fff4e5;
    color: #b45309;
  }

  &.exercise-pending {
    background: #f1f5f9;
    color: #64748b;
  }
}
</style>
