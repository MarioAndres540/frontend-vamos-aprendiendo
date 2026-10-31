<script setup lang="ts">
import type { CategoryProgress } from '~/composables/useTelemetry'

// Pestaña Actividades: las 7 categorías cognitivas del juego, las recomendadas según el formulario inicial
// y el progreso que registra la app de Unity (progreso_categoria)
definePageMeta({
  layout: 'user-panel',
  headerTitle: 'Actividades',
  headerSubtitle: 'Lo que se juega en la app, por área',
  showsSelectedStudent: true,
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const { isTutor, ready, error: subjectError, hasNoStudents, studentId, assessment, subject, load } = usePanelSubject()
const { categories, loading: progressLoading, error: progressError, fetchProgress } = useCategoryProgress()

onMounted(async () => {
  await load()
  if (!hasNoStudents.value) fetchProgress(studentId.value)
})

// Cambio de hijo desde el menú de la cuenta
watch(studentId, (id, previous) => {
  if (id && id !== previous) fetchProgress(id)
})

// Recomendadas: categorías que trabajan las áreas a reforzar del formulario
const recommendations = computed(() =>
  assessment.value ? recommendedCategories(assessment.value.answers, assessment.value.primaryCondition) : [],
)
const recommendedIds = computed(() => new Set(recommendations.value.map((r) => r.categoryId)))

const recommendedCards = computed(() =>
  recommendations.value
    .map((r) => ({ ...r, category: categories.value.find((c) => c.id === r.categoryId) }))
    .filter((r): r is typeof r & { category: CategoryProgress } => !!r.category),
)

type Filter = 'all' | 'recommended' | 'unplayed'
const filter = ref<Filter>('all')
const filters = computed(() => [
  { id: 'all' as const, label: `Todas · ${categories.value.length}` },
  { id: 'recommended' as const, label: `Recomendadas · ${recommendedIds.value.size}` },
  { id: 'unplayed' as const, label: `Sin jugar · ${categories.value.filter((c) => !c.played).length}` },
])

const visibleCategories = computed(() => {
  if (filter.value === 'recommended') return categories.value.filter((c) => recommendedIds.value.has(c.id))
  if (filter.value === 'unplayed') return categories.value.filter((c) => !c.played)
  return categories.value
})

const progressPct = (c: CategoryProgress) => `${Math.min(100, Math.max(0, c.goal ? (c.score / c.goal) * 100 : 0))}%`
const formatPoints = (value: number) => (Number.isInteger(value) ? value : value.toFixed(1))

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })

const recommendedRoute = computed(() => recommendedRouteOf(assessment.value?.recommendations))
const loading = computed(() => !ready.value || (progressLoading.value && categories.value.length === 0))
const error = computed(() => subjectError.value ?? progressError.value)
</script>

<template>
  <main class="panel-body">
    <p v-if="loading" class="card state-card muted">Cargando actividades…</p>

    <p v-else-if="error" class="card state-card error" role="alert">{{ error }}</p>

    <div v-else-if="hasNoStudents" class="card state-card">
      <p class="muted">Aún no tienes hijos o menores registrados.</p>
      <NuxtLink to="/settings" class="btn-primary">Agregar hijo o menor</NuxtLink>
    </div>

    <template v-else-if="subject">
      <PanelSubjectHeader :name="subject.name" :details="subject.details">
        <p v-if="assessment" class="route-box">
          <i class="pi pi-compass" aria-hidden="true"></i>
          <span>
            <strong>Ruta recomendada:</strong>
            {{ recommendedRoute ?? 'seguimiento general' }}, según el formulario inicial del
            {{ formatDate(assessment.createdAt) }}.
          </span>
        </p>
        <NuxtLink v-else-if="isTutor && studentId" :to="{ path: ROUTES.initialAssessment, query: { studentId } }" class="btn-secondary">
          Hacer formulario inicial para ver recomendaciones
        </NuxtLink>
      </PanelSubjectHeader>

      <!-- Recomendadas -->
      <section v-if="recommendedCards.length" aria-labelledby="recommended-title" class="recommended">
        <div class="section-head">
          <h2 id="recommended-title" class="card-title">Recomendadas para {{ subject.firstName }}</h2>
          <span class="muted small">Áreas a reforzar en el formulario inicial</span>
        </div>
        <div class="recommended-grid">
          <article
            v-for="(r, index) in recommendedCards"
            :key="r.categoryId"
            class="card recommended-card"
            :class="`tone-${r.area.tone}`"
          >
            <div class="row">
              <h3>{{ r.category.name }}</h3>
              <span class="pill" :class="`tone-${r.area.tone}`">{{ index === 0 ? 'Prioridad alta' : 'A reforzar' }}</span>
            </div>
            <p class="body-text">
              {{ r.category.description }} En el formulario, {{ r.area.label.toLowerCase() }}:
              <strong>"{{ answerLabel(r.area.score).toLowerCase() }}"</strong>.
            </p>
            <div class="row footer">
              <span class="muted small">Nivel {{ r.category.level }} · {{ r.category.played ? `${formatPoints(r.category.score)} de ${r.category.goal} puntos` : 'aún sin jugar' }}</span>
              <span class="muted small">La app registra {{ CATEGORY_TRACKING[r.categoryId] ?? 'el avance en el juego.' }}</span>
            </div>
          </article>
        </div>
      </section>

      <!-- Todas las áreas -->
      <section class="card" aria-labelledby="all-title">
        <div class="section-head">
          <h2 id="all-title" class="card-title">Todas las áreas</h2>
          <div class="filter-group" role="group" aria-label="Filtrar áreas">
            <button
              v-for="f in filters"
              :key="f.id"
              type="button"
              class="filter-btn"
              :aria-pressed="filter === f.id"
              @click="filter = f.id"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <p v-if="visibleCategories.length === 0" class="muted">
          {{ filter === 'recommended' ? 'No hay áreas recomendadas: completa el formulario inicial para verlas.' : 'Todas las áreas ya se han jugado.' }}
        </p>

        <ul v-else class="category-grid">
          <li v-for="c in visibleCategories" :key="c.id" class="category">
            <div class="row">
              <h3>{{ c.name }}</h3>
              <span v-if="recommendedIds.has(c.id)" class="pill tone-reinforce">Recomendada</span>
            </div>
            <p class="body-text small-text">{{ c.description }}</p>
            <p class="muted small"><strong>La app registra:</strong> {{ CATEGORY_TRACKING[c.id] ?? 'el avance en el juego.' }}</p>
            <div class="progress">
              <div class="progress-labels">
                <span>Nivel {{ c.level }}</span>
                <span>{{ formatPoints(c.score) }} de {{ c.goal }} puntos</span>
              </div>
              <div
                class="progress-track"
                role="progressbar"
                :aria-valuenow="c.score"
                aria-valuemin="0"
                :aria-valuemax="c.goal"
                :aria-label="`Progreso en ${c.name}`"
              >
                <span class="progress-fill" :style="{ width: progressPct(c) }"></span>
              </div>
              <span class="muted small">{{ c.played && c.updatedAt ? `Último avance: ${formatDate(c.updatedAt)}` : 'Aún sin jugar' }}</span>
            </div>
          </li>
        </ul>
      </section>

      <p class="info-box">
        <i class="pi pi-mobile" aria-hidden="true"></i>
        <span>
          Las actividades se juegan en la <strong>app de Vamos Aprendiendo</strong> con tu cuenta.
          <template v-if="isTutor"> Al abrirla, elige a {{ subject.firstName }} para que su progreso quede guardado a su nombre.</template>
          Aquí verás el nivel y los puntos de cada área a medida que se juegue.
        </span>
      </p>
    </template>
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/user-panel' as *;

.route-box {
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  max-width: 540px;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: #f8fafc;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.45;

  i {
    color: $brand-indigo;
    margin-top: 0.15rem;
  }
}

.recommended {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.recommended-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.recommended-card {
  gap: 0.75rem;
  border-width: 2px;

  &.tone-reinforce { border-color: #fed7aa; }
  &.tone-watch { border-color: #fde68a; }
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  flex-wrap: wrap;

  h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: $text-dark;
  }

  &.footer {
    padding-top: 0.65rem;
    border-top: 1px solid #f1f5f9;
  }
}

.category-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.category {
  border: 1px solid $border-subtle;
  border-radius: 18px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  h3 {
    font-size: 0.95rem;
  }
}

.small-text {
  font-size: 0.82rem;
}

.progress {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  color: $text-muted;
}

.progress-track {
  height: 8px;
  background: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  background: $brand-indigo;
  border-radius: 9999px;
}
</style>
