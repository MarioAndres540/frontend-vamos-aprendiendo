<script setup lang="ts">
import type { StudentAssessmentSummary } from '~/composables/useMyStudents'

// Pestaña Diagnósticos: resultado del formulario inicial (respuestas, nivel de alerta, áreas y hallazgos).
// El tutor ve al hijo elegido en el menú de su cuenta; el adulto y el tester, su propio formulario.
definePageMeta({
  layout: 'user-panel',
  headerTitle: 'Diagnósticos',
  headerSubtitle: 'Resultado del formulario inicial',
  // Al elegir otro hijo en el menú de la cuenta la página se actualiza en lugar de ir al dashboard
  showsSelectedStudent: true,
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const { profileType, firstName, user } = useAuth()
const isTutor = computed(() => profileType.value === 'tutor')

const {
  students,
  loaded: studentsLoaded,
  selected,
  selectingId,
  loading: studentsLoading,
  error: studentsError,
  fetchStudents,
} = useMyStudents()
const { history, loading: historyLoading, error: historyError, fetchHistory } = useAssessmentHistory()
const { kidsQuestions, adultsQuestions } = useAssessment()

onMounted(() => {
  if (!isTutor.value) {
    fetchHistory()
    return
  }
  if (selected.value) fetchHistory(selected.value.id)
  fetchStudents(true)
})

// Cambio de hijo desde el menú de la cuenta (o primera carga de la lista)
watch(
  () => selected.value?.id,
  (id) => {
    if (isTutor.value && id) fetchHistory(id)
  },
)

const ownName = computed(() => titleCase(firstName.value || user.value?.firstName || ''))

// Formularios del historial. El formulario del registro se guardó sin estudiante: si el backend se lo
// asignó al hijo (cuenta con un solo hijo) llega en latestAssessment aunque el historial esté vacío.
const assessments = computed<StudentAssessmentSummary[]>(() => {
  if (history.value.length) return history.value
  const fallback = isTutor.value ? selected.value?.latestAssessment : null
  return fallback ? [fallback] : []
})
const assessment = computed(() => assessments.value[0] ?? null)

const loading = computed(() => {
  // Hasta la primera carga de la lista no se sabe si el tutor tiene hijos (evita "Aún no tienes hijos" por un instante)
  if (isTutor.value) {
    return (
      (!studentsLoaded.value && !studentsError.value) ||
      (studentsLoading.value && !selected.value) ||
      selectingId.value !== null ||
      historyLoading.value
    )
  }
  return historyLoading.value
})
const error = computed(() => (isTutor.value ? studentsError.value : null) ?? (assessment.value ? null : historyError.value))

const person = computed(() => {
  if (isTutor.value) {
    const s = selected.value
    if (!s) return null
    return {
      name: titleCase(`${s.firstName} ${s.lastName}`),
      firstName: titleCase(s.firstName),
      details: [s.grade, s.age != null ? `${s.age} años` : null, s.institution?.name ?? 'Sin colegio asignado']
        .filter(Boolean)
        .join(' · '),
    }
  }
  return { name: ownName.value || 'Mi formulario', firstName: ownName.value, details: '' }
})

// Preguntas del formulario (mismo banco que initial-assessment.vue)
const questions = computed(() => (assessment.value?.targetType === 'adulto' ? adultsQuestions : kidsQuestions))

const answerRows = computed(() =>
  [...(assessment.value?.answers ?? [])]
    .sort((a, b) => a.questionId - b.questionId)
    .map((answer) => {
      const question = questions.value.find((q) => q.id === answer.questionId)
      return {
        id: answer.questionId,
        title: question?.title ?? `Pregunta ${answer.questionId}`,
        description: question?.description ?? '',
        area: areaLabel(answer.dimension),
        score: answer.score,
        answer: answerLabel(answer.score),
        tone: areaTone(answer.score),
      }
    }),
)

const areas = computed(() =>
  assessment.value ? scoreAreas(assessment.value.answers, assessment.value.primaryCondition) : [],
)
const summary = computed(() =>
  assessment.value ? summarizeAreas(assessment.value.answers, assessment.value.primaryCondition) : null,
)
const findings = computed(() => describeFindings(areas.value, assessment.value?.primaryCondition))

// Área de enfoque: la condición principal calculada por el backend
const primaryArea = computed(() => areas.value.find((a) => a.dimension === assessment.value?.primaryCondition) ?? null)
const primaryQuestions = computed(() =>
  answerRows.value.filter((row) => primaryArea.value?.questionIds.includes(row.id)).map((row) => row.title),
)
const primaryPoints = computed(() => {
  const area = primaryArea.value
  if (!area) return null
  return { earned: Math.round(area.score * area.questionIds.length), max: area.questionIds.length * 5 }
})

// Escala del nivel de alerta: segmentos proporcionales a los límites del backend y marcador en el puntaje
const scale = computed(() => {
  const a = assessment.value
  if (!a) return null
  const { low, moderate } = riskThresholds(a.targetType)
  const max = a.maxScore || 40
  const pct = (value: number) => `${Math.min(100, Math.max(0, (value / max) * 100))}%`
  return {
    low,
    moderate,
    lowWidth: pct(low),
    moderateWidth: pct(moderate - low),
    highWidth: pct(max - moderate),
    marker: pct(a.totalScore),
  }
})

const recommendedRoute = computed(() => recommendedRouteOf(assessment.value?.recommendations))

const formLabel = computed(() => (assessment.value?.targetType === 'adulto' ? 'Formulario de adultos' : 'Formulario de niños'))

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

const repeatLink = computed(() => {
  if (isTutor.value && selected.value) return { path: ROUTES.initialAssessment, query: { studentId: selected.value.id } }
  // El tester puede volver al formulario siempre; el adulto solo lo llena una vez (middleware profile-access)
  if (profileType.value === 'tester') return { path: ROUTES.initialAssessment }
  return null
})

const printReport = () => window.print()
</script>

<template>
  <main class="diagnostics-body">
    <p v-if="loading && !assessment" class="state-card muted">Cargando diagnóstico…</p>

    <p v-else-if="error" class="state-card error" role="alert">{{ error }}</p>

    <!-- Tutor sin hijos registrados -->
    <div v-else-if="isTutor && students.length === 0" class="state-card">
      <p class="muted">Aún no tienes hijos o menores registrados.</p>
      <NuxtLink to="/settings" class="btn-primary">Agregar hijo o menor</NuxtLink>
    </div>

    <template v-else-if="person">
      <!-- Persona evaluada y acciones -->
      <section class="card person-row" aria-label="Persona evaluada">
        <div class="person">
          <span class="avatar" aria-hidden="true">{{ initials(person.name) }}</span>
          <div class="person-text">
            <h2>{{ person.name }}</h2>
            <span v-if="person.details" class="person-details">{{ person.details }}</span>
            <span v-if="assessment" class="muted small">
              {{ formLabel }}
              <template v-if="isTutor && ownName"> respondido por {{ ownName }}</template>
              el {{ formatDate(assessment.createdAt) }} · {{ assessment.answers.length }} preguntas
            </span>
          </div>
        </div>
        <div class="actions no-print">
          <button v-if="assessment" type="button" class="btn-secondary" @click="printReport">
            <i class="pi pi-download" aria-hidden="true"></i> Imprimir o guardar PDF
          </button>
          <NuxtLink v-if="repeatLink" :to="repeatLink" class="btn-primary">
            <i class="pi pi-refresh" aria-hidden="true"></i>
            {{ assessment ? 'Repetir formulario' : 'Hacer formulario inicial' }}
          </NuxtLink>
        </div>
      </section>

      <!-- Sin formulario todavía -->
      <section v-if="!assessment" class="card state-inline">
        <p class="muted">
          {{
            isTutor
              ? `Aún no hay formulario inicial de ${person.firstName}. Llénalo para ver aquí sus resultados.`
              : 'Aún no has completado el formulario inicial.'
          }}
        </p>
      </section>

      <template v-else>
        <!-- Resumen -->
        <section class="grid-3" aria-label="Resumen del resultado">
          <article class="card summary-card">
            <div class="row-between">
              <h3 class="card-label">Nivel de alerta</h3>
              <span class="risk-pill" :class="`risk-${assessment.riskLevel}`">{{ RISK_LABELS[assessment.riskLevel] }}</span>
            </div>
            <p class="score">
              <span class="score-value">{{ assessment.totalScore }}</span>
              <span class="score-max">/ {{ assessment.maxScore }} puntos</span>
            </p>
            <div v-if="scale" class="scale">
              <div class="scale-bar" aria-hidden="true">
                <span class="seg seg-low" :style="{ width: scale.lowWidth }"></span>
                <span class="seg seg-moderate" :style="{ width: scale.moderateWidth }"></span>
                <span class="seg seg-high" :style="{ width: scale.highWidth }"></span>
                <span class="scale-marker" :style="{ left: scale.marker }"></span>
              </div>
              <div class="scale-labels">
                <span>Bajo ≤ {{ scale.low }}</span>
                <span>Moderado {{ scale.low + 1 }}–{{ scale.moderate }}</span>
                <span>Alto ≥ {{ scale.moderate + 1 }}</span>
              </div>
            </div>
          </article>

          <article class="card summary-card">
            <h3 class="card-label">Área de enfoque principal</h3>
            <template v-if="primaryArea">
              <div class="focus">
                <span class="focus-icon" aria-hidden="true"><img :src="primaryArea.icon" alt="" /></span>
                <div>
                  <p class="focus-title">{{ primaryArea.label }}</p>
                  <p v-if="primaryPoints" class="muted small">
                    {{ primaryArea.questionIds.length }}
                    {{ primaryArea.questionIds.length === 1 ? 'pregunta' : 'preguntas' }},
                    {{ primaryPoints.earned }} de {{ primaryPoints.max }} puntos
                  </p>
                </div>
              </div>
              <p class="body-text">
                {{ joinList(primaryQuestions) }}: respuesta
                <strong>"{{ answerLabel(primaryArea.score).toLowerCase() }}"</strong>.
              </p>
            </template>
            <p v-else class="body-text">Sin un área que se destaque.</p>
          </article>

          <article class="card summary-card">
            <h3 class="card-label">Ruta recomendada</h3>
            <p class="route-title">{{ recommendedRoute ?? 'Seguimiento general' }}</p>
            <p class="body-text">
              {{ RISK_LABELS[assessment.riskLevel] }}<template v-if="primaryArea && assessment.riskLevel !== 'bajo'">
                en {{ primaryArea.label }}</template>. Las actividades de la app se ajustan a este resultado.
            </p>
          </article>
        </section>

        <!-- Perfil por área + hallazgos -->
        <section class="grid-3">
          <article class="card span-2" aria-labelledby="areas-title">
            <div class="row-between wrap">
              <h3 id="areas-title" class="card-title">Perfil por área</h3>
              <span class="muted small">Frecuencia con la que se observa la dificultad (1 = nunca, 5 = siempre)</span>
            </div>
            <ul class="area-list">
              <li v-for="area in areas" :key="area.dimension" class="area-row">
                <div class="area-name">
                  <span class="area-label">{{ area.label }}</span>
                  <span class="muted small">
                    {{ area.questionIds.length === 1 ? 'Pregunta' : 'Preguntas' }} {{ joinList(area.questionIds.map(String)) }}
                    <template v-if="area.dimension === assessment.primaryCondition"> · enfoque principal</template>
                  </span>
                </div>
                <div class="area-track" aria-hidden="true">
                  <span class="area-fill" :class="`tone-${area.tone}`" :style="{ width: `${(area.score / 5) * 100}%` }"></span>
                </div>
                <span class="answer-pill" :class="`tone-${area.tone}`">
                  {{ Number.isInteger(area.score) ? area.score : area.score.toFixed(1) }} · {{ answerLabel(area.score) }}
                </span>
              </li>
            </ul>
            <div class="legend">
              <span><span class="legend-dot tone-strength"></span>Fortaleza (nunca o rara vez)</span>
              <span><span class="legend-dot tone-watch"></span>A observar (a veces)</span>
              <span><span class="legend-dot tone-reinforce"></span>A reforzar (frecuentemente o siempre)</span>
            </div>
          </article>

          <article class="card" aria-labelledby="findings-title">
            <h3 id="findings-title" class="card-title">Lo que encontramos</h3>
            <div v-if="summary" class="chip-group">
              <span class="chip-label">Fortalezas</span>
              <div v-if="summary.strengths.length" class="chips">
                <span v-for="a in summary.strengths" :key="a.dimension" class="chip tone-strength">{{ a.label }}</span>
              </div>
              <p v-else class="muted small">Aún no se destacan áreas fuertes.</p>
            </div>
            <div v-if="summary" class="chip-group">
              <span class="chip-label">A reforzar</span>
              <div v-if="summary.toImprove.length" class="chips">
                <span v-for="a in summary.toImprove" :key="a.dimension" class="chip tone-reinforce">{{ a.label }}</span>
              </div>
              <p v-else class="muted small">No hay áreas que requieran refuerzo.</p>
            </div>
            <ul class="findings">
              <li v-for="finding in findings" :key="finding">{{ finding }}</li>
            </ul>
          </article>
        </section>

        <!-- Respuestas del formulario -->
        <section class="card" aria-labelledby="answers-title">
          <div class="row-between wrap">
            <h3 id="answers-title" class="card-title">Respuestas del formulario</h3>
            <span class="muted small">{{ formLabel }} · {{ formatDate(assessment.createdAt) }}</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col" class="col-n">#</th>
                  <th scope="col">Pregunta</th>
                  <th scope="col" class="col-area">Área</th>
                  <th scope="col" class="col-answer">Respuesta</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in answerRows" :key="row.id">
                  <td class="col-n muted">{{ row.id }}</td>
                  <td>
                    <span class="q-title">{{ row.title }}</span>
                    <span v-if="row.description" class="q-text">{{ row.description }}</span>
                  </td>
                  <td>{{ row.area }}</td>
                  <td>
                    <span class="answer-pill" :class="`tone-${row.tone}`">{{ row.score }} · {{ row.answer }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Próximos pasos + historial -->
        <section class="grid-3">
          <article class="card span-2" aria-labelledby="steps-title">
            <h3 id="steps-title" class="card-title">Próximos pasos</h3>
            <ol class="steps">
              <li v-if="summary?.toImprove.length">
                Jugar las actividades de <strong>{{ joinList(summary.toImprove.map((a) => a.label)) }}</strong> en la app de Vamos Aprendiendo.
              </li>
              <li v-else>Seguir con las actividades de la app para mantener el buen desempeño.</li>
              <li>Volver a esta pestaña después de varias sesiones de juego.</li>
              <li>Repetir el formulario más adelante para comparar la evolución en el historial.</li>
            </ol>
            <p class="disclaimer">
              Este resultado es una orientación basada en lo que observa {{ isTutor ? 'el tutor' : 'la persona' }};
              <strong>no es un diagnóstico clínico</strong>. Si las dificultades continúan, consulte con un profesional
              (psicopedagogía o fonoaudiología).
            </p>
          </article>

          <article class="card" aria-labelledby="history-title">
            <h3 id="history-title" class="card-title">Historial</h3>
            <ul class="history">
              <li v-for="(item, index) in assessments" :key="item.id" class="history-item">
                <div class="history-text">
                  <span class="history-date">{{ formatDate(item.createdAt) }}</span>
                  <span class="muted small">
                    {{ index === assessments.length - 1 ? 'Formulario inicial' : 'Repetición' }} · {{ item.totalScore }}/{{ item.maxScore }}
                    <template v-if="index === 0"> · actual</template>
                  </span>
                </div>
                <span class="risk-pill" :class="`risk-${item.riskLevel}`">{{ RISK_LABELS[item.riskLevel] }}</span>
              </li>
            </ul>
            <p v-if="assessments.length === 1" class="muted small">
              Cuando repitas el formulario, aquí verás la comparación entre evaluaciones.
            </p>
          </article>
        </section>
      </template>
    </template>
  </main>
</template>

<style lang="scss" scoped>
$color-brand-indigo: #4f46e5;
$color-text-dark: #1e293b;
$color-text-muted: #64748b;
$color-border-subtle: #e2e8f0;

// Colores por lectura del puntaje: se distinguen también por claridad, no solo por tono
$tone-strength: #60a5fa;
$tone-watch: #f59e0b;
$tone-reinforce: #9a3412;

.diagnostics-body {
  padding: 1.75rem 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem;
  }
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ffffff;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;

  @media (max-width: 640px) {
    padding: 1.15rem;
    border-radius: 18px;
  }
}

.state-card {
  @extend .card;
  align-items: flex-start;
  margin: 0;
}

.state-inline {
  align-items: flex-start;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.span-2 {
  grid-column: span 2;

  @media (max-width: 1100px) {
    grid-column: auto;
  }
}

.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  &.wrap {
    flex-wrap: wrap;
    align-items: baseline;
  }
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: $color-text-dark;
}

.card-label {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #475569;
}

.muted {
  margin: 0;
  color: $color-text-muted;
}

.small {
  font-size: 0.8rem;
}

.error {
  color: #b91c1c;
  font-weight: 600;
}

.body-text {
  margin: 0;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.5;
}

// Persona evaluada
.person-row {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.person {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff, #f5f3ff);
  color: $color-brand-indigo;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.15rem;
}

.person-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: $color-text-dark;
    overflow-wrap: anywhere;
  }
}

.person-details {
  font-size: 0.88rem;
  font-weight: 700;
  color: #047857;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 1.1rem;
  border-radius: 9999px;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid $color-brand-indigo;
    outline-offset: 2px;
  }
}

.btn-primary {
  background: $color-brand-indigo;
  border: 1px solid $color-brand-indigo;
  color: #ffffff;

  &:hover {
    background: #4338ca;
  }
}

.btn-secondary {
  background: #ffffff;
  border: 1px solid $color-border-subtle;
  color: #334155;

  &:hover {
    background: #f8fafc;
  }
}

// Resumen
.summary-card {
  gap: 0.85rem;
}

.risk-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;

  &.risk-bajo { background: #eff6ff; color: #1d4ed8; }
  &.risk-moderado { background: #fffbeb; color: #92400e; }
  &.risk-alto { background: #fff7ed; color: #9a3412; }
}

.score {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;

  .score-value {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: $color-text-dark;
  }

  .score-max {
    font-size: 1rem;
    font-weight: 600;
    color: $color-text-muted;
  }
}

.scale {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.scale-bar {
  position: relative;
  height: 12px;
  display: flex;
  gap: 3px;

  .seg {
    display: block;
    height: 100%;
  }

  .seg-low { background: #bfdbfe; border-radius: 9999px 0 0 9999px; }
  .seg-moderate { background: $tone-watch; }
  .seg-high { background: $tone-reinforce; border-radius: 0 9999px 9999px 0; }
}

.scale-marker {
  position: absolute;
  top: -5px;
  width: 4px;
  height: 22px;
  margin-left: -2px;
  background: $color-text-dark;
  border-radius: 2px;
  box-shadow: 0 0 0 2px #ffffff;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: $color-text-muted;
}

.focus {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.focus-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #fff7ed;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 26px;
    height: 26px;
    object-fit: contain;
  }
}

.focus-title,
.route-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: $color-text-dark;
  line-height: 1.3;
}

// Perfil por área
.area-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.area-row {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 160px;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) auto;

    .area-track {
      grid-column: 1 / -1;
      grid-row: 2;
    }
  }
}

.area-name {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  min-width: 0;
}

.area-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: $color-text-dark;
}

.area-track {
  height: 14px;
  background: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
}

.area-fill {
  display: block;
  height: 100%;
  border-radius: 9999px;

  &.tone-strength { background: $tone-strength; }
  &.tone-watch { background: $tone-watch; }
  &.tone-reinforce { background: $tone-reinforce; }
}

.answer-pill {
  justify-self: start;
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;

  &.tone-strength { background: #eff6ff; color: #1d4ed8; }
  &.tone-watch { background: #fffbeb; color: #92400e; }
  &.tone-reinforce { background: #fff7ed; color: #9a3412; }
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1.1rem;
  padding-top: 0.6rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.8rem;
  color: #475569;

  > span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;

  &.tone-strength { background: $tone-strength; }
  &.tone-watch { background: $tone-watch; }
  &.tone-reinforce { background: $tone-reinforce; }
}

// Hallazgos
.chip-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.chip-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: $color-text-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.88rem;
  font-weight: 700;

  &.tone-strength { background: #eff6ff; color: #1d4ed8; }
  &.tone-reinforce { background: #fff7ed; color: #9a3412; }
}

.findings,
.steps {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.55;
}

// Respuestas
.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 0.88rem;

  th {
    text-align: left;
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid $color-border-subtle;
    font-size: 0.74rem;
    font-weight: 700;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  td {
    padding: 0.85rem 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
    color: #334155;
  }

  .col-n { width: 36px; font-weight: 700; }
  .col-area { width: 170px; }
  .col-answer { width: 180px; }
}

.q-title {
  display: block;
  font-weight: 700;
  color: $color-text-dark;
}

.q-text {
  display: block;
  margin-top: 0.15rem;
  color: #475569;
  line-height: 1.45;
}

// Próximos pasos e historial
.disclaimer {
  margin: 0;
  padding: 0.75rem 0.9rem;
  border-radius: 14px;
  background: #f8fafc;
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.5;
}

.history {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid $color-border-subtle;
  border-radius: 14px;
}

.history-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.history-date {
  font-size: 0.9rem;
  font-weight: 700;
  color: $color-text-dark;
}

// Reporte impreso o guardado en PDF: sin botones
@media print {
  .no-print {
    display: none !important;
  }

  .diagnostics-body {
    padding: 0;
    max-width: none;
  }

  .card {
    box-shadow: none;
    border: 1px solid $color-border-subtle;
    break-inside: avoid;
  }
}
</style>
