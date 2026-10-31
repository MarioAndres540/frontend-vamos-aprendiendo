<script setup lang="ts">
import type { AppUsageDay, AppEndReason } from '~/composables/useAppUsage'
import type { PerformanceMetric } from '~/composables/useTelemetry'
import type { StudentAssessmentSummary } from '~/composables/useMyStudents'

// Pestaña Analíticas: uso de la app de Unity (app_sessions), desempeño en el juego frente a lo esperado
// para la edad (telemetría) y evolución del formulario inicial
definePageMeta({
  layout: 'user-panel',
  headerTitle: 'Analíticas',
  headerSubtitle: 'Uso de la app y desempeño en el juego',
  showsSelectedStudent: true,
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const { isTutor, ready, error: subjectError, hasNoStudents, studentId, assessment, subject, load } = usePanelSubject()
const { history: usage, loading: usageLoading, error: usageError, fetchUsage } = useAppUsage()
const { performance, loading: performanceLoading, error: performanceError, fetchPerformance } = usePerformance()
const { history: assessments, fetchHistory } = useAssessmentHistory()

const PERIODS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 365, label: '1 año' },
]
const days = ref(30)

const loadSubjectData = () => {
  fetchPerformance(days.value, studentId.value)
  fetchHistory(studentId.value)
}

onMounted(async () => {
  fetchUsage(days.value)
  await load()
  if (!hasNoStudents.value) loadSubjectData()
})

watch(days, (value) => {
  fetchUsage(value)
  if (!hasNoStudents.value) fetchPerformance(value, studentId.value)
})

// Cambio de hijo desde el menú de la cuenta
watch(studentId, (id, previous) => {
  if (id && id !== previous) loadSubjectData()
})

// ----------------------------------------------------
// Formatos
// ----------------------------------------------------
const formatDuration = (seconds: number) => {
  if (seconds < 1) return 'menos de 1 s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h) return `${h} h ${m} min`
  if (m) return `${m} min ${s} s`
  return `${s} s`
}

// "2026-10-08" → fecha local (sin desfase de zona horaria)
const parseDay = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}
const shortDate = (date: Date) => date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })

const daysAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (diff <= 0) return 'hoy'
  if (diff === 1) return 'ayer'
  return `hace ${diff} días`
}

const END_REASONS: Record<AppEndReason, string> = {
  app_closed: 'Cerró la app',
  logout: 'Cerró sesión',
  timeout: 'Sin señal de la app',
}

// ----------------------------------------------------
// Uso de la app
// ----------------------------------------------------
interface Bar {
  key: string
  label: string
  seconds: number
}

// 7 días: un barra por día; 30 y 90: por semana; 1 año: por mes
const bars = computed<Bar[]>(() => {
  const daily: AppUsageDay[] = usage.value?.daily ?? []
  if (days.value <= 7) {
    return daily.map((d) => ({
      key: d.date,
      label: parseDay(d.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
      seconds: d.seconds,
    }))
  }
  if (days.value <= 90) {
    const weeks: Bar[] = []
    for (let i = 0; i < daily.length; i += 7) {
      const chunk = daily.slice(i, i + 7)
      const first = parseDay(chunk[0]!.date)
      const last = parseDay(chunk[chunk.length - 1]!.date)
      weeks.push({
        key: chunk[0]!.date,
        label: `${shortDate(first)} – ${shortDate(last)}`,
        seconds: chunk.reduce((sum, d) => sum + d.seconds, 0),
      })
    }
    return weeks
  }
  const months = new Map<string, Bar>()
  for (const d of daily) {
    const key = d.date.slice(0, 7)
    const bar = months.get(key) ?? {
      key,
      label: parseDay(d.date).toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
      seconds: 0,
    }
    bar.seconds += d.seconds
    months.set(key, bar)
  }
  return [...months.values()]
})

const barMax = computed(() => Math.max(60, ...bars.value.map((b) => b.seconds)))
const barsLabel = computed(() =>
  bars.value.map((b) => `${b.label}: ${b.seconds ? formatDuration(b.seconds) : 'sin uso'}`).join('; '),
)

const recentSessions = computed(() => (usage.value?.sessions ?? []).slice(0, 8))
const sessionsWithoutStudent = computed(() => (usage.value?.sessions ?? []).some((s) => !s.student))

// ----------------------------------------------------
// Desempeño en el juego
// ----------------------------------------------------
const formatMetric = (m: PerformanceMetric, value: number | null) =>
  value === null ? '—' : `${Number.isInteger(value) ? value : value.toFixed(1)}${m.unit === '%' ? ' %' : ' s'}`

const metricStatus = (m: PerformanceMetric) => {
  if (m.value === null) return { label: 'Sin datos de juego todavía', tone: 'tone-neutral' }
  if (m.status === 'within') return { label: 'Dentro de lo esperado', tone: 'tone-ok' }
  if (m.status === 'below') {
    return m.unit === '%'
      ? { label: 'Por debajo de lo esperado', tone: 'tone-reinforce' }
      : { label: 'Más rápido de lo esperado', tone: 'tone-watch' }
  }
  if (m.status === 'above') {
    return m.unit === '%'
      ? { label: 'Por encima de lo esperado', tone: 'tone-ok' }
      : { label: 'Más lento de lo esperado', tone: 'tone-watch' }
  }
  return { label: `${m.samples} ${m.samples === 1 ? 'registro' : 'registros'}`, tone: 'tone-neutral' }
}

// Barra del rango esperado: en % sobre 100; en segundos sobre una escala que incluya el valor
const metricScale = (m: PerformanceMetric) =>
  m.unit === '%' ? 100 : Math.max(10, (m.expectedMax ?? 0) * 1.5, (m.value ?? 0) * 1.1)
const pct = (value: number, scale: number) => `${Math.min(100, Math.max(0, (value / scale) * 100))}%`

// ----------------------------------------------------
// Evolución del formulario (del más antiguo al más reciente)
// ----------------------------------------------------
const evolution = computed<StudentAssessmentSummary[]>(() => {
  const list = assessments.value.length ? assessments.value : assessment.value ? [assessment.value] : []
  return [...list].reverse()
})
const evolutionPoint = (a: StudentAssessmentSummary, index: number) => ({
  left: evolution.value.length === 1 ? '50%' : `${8 + (index / (evolution.value.length - 1)) * 84}%`,
  bottom: pct(a.totalScore, a.maxScore || 40),
})

const loading = computed(() => !ready.value)
const error = computed(() => subjectError.value)
</script>

<template>
  <main class="panel-body">
    <p v-if="loading" class="card state-card muted">Cargando analíticas…</p>

    <p v-else-if="error" class="card state-card error" role="alert">{{ error }}</p>

    <template v-else>
      <!-- Persona y periodo -->
      <PanelSubjectHeader v-if="subject && !hasNoStudents" :name="subject.name" :details="subject.details">
        <div class="filter-group period" role="group" aria-label="Periodo">
          <button
            v-for="p in PERIODS"
            :key="p.days"
            type="button"
            class="filter-btn"
            :aria-pressed="days === p.days"
            @click="days = p.days"
          >
            {{ p.label }}
          </button>
        </div>
      </PanelSubjectHeader>

      <!-- Uso de la app (de la cuenta) -->
      <section aria-labelledby="usage-title" class="usage">
        <div class="section-head">
          <h2 id="usage-title" class="card-title">Uso de la app</h2>
          <span class="muted small">{{ isTutor ? 'Todas las sesiones de tu cuenta' : 'Sesiones de tu cuenta' }}</span>
        </div>

        <p v-if="usageError" class="card state-card error" role="alert">{{ usageError }}</p>
        <p v-else-if="usageLoading && !usage" class="card state-card muted">Cargando uso de la app…</p>

        <template v-else-if="usage">
          <div class="kpi-grid">
            <article class="card kpi">
              <span class="kpi-label">Tiempo en la app</span>
              <span class="kpi-value">{{ usage.summary.totalSeconds ? formatDuration(usage.summary.totalSeconds) : '0' }}</span>
              <span class="muted small">Últimos {{ usage.days }} días</span>
            </article>
            <article class="card kpi">
              <span class="kpi-label">Sesiones</span>
              <span class="kpi-value">{{ usage.summary.sessionsCount }}</span>
              <span class="muted small">En el periodo</span>
            </article>
            <article class="card kpi">
              <span class="kpi-label">Duración promedio</span>
              <span class="kpi-value">{{ usage.summary.sessionsCount ? formatDuration(usage.summary.averageSeconds) : '—' }}</span>
              <span class="muted small">
                {{ usage.summary.sessionsCount ? `La más larga: ${formatDuration(usage.summary.longestSeconds)}` : 'Sin sesiones' }}
              </span>
            </article>
            <article class="card kpi">
              <span class="kpi-label">Último ingreso</span>
              <span class="kpi-value">{{ usage.summary.lastStartedAt ? shortDate(new Date(usage.summary.lastStartedAt)) : '—' }}</span>
              <span class="muted small">
                {{
                  usage.summary.lastStartedAt
                    ? `${daysAgo(usage.summary.lastStartedAt)} · ${formatTime(usage.summary.lastStartedAt)}`
                    : 'Sin ingresos en el periodo'
                }}
              </span>
            </article>
          </div>

          <div class="usage-grid">
            <article class="card span-3" aria-labelledby="bars-title">
              <div class="section-head">
                <h3 id="bars-title" class="card-title">Tiempo en la app por {{ days <= 7 ? 'día' : days <= 90 ? 'semana' : 'mes' }}</h3>
              </div>
              <div class="bars" role="img" :aria-label="`Tiempo en la app: ${barsLabel}`">
                <div v-for="bar in bars" :key="bar.key" class="bar-col" aria-hidden="true">
                  <span class="bar-value">{{ bar.seconds ? formatDuration(bar.seconds) : '' }}</span>
                  <span class="bar" :class="{ empty: !bar.seconds }" :style="{ height: pct(bar.seconds, barMax) }"></span>
                  <span class="bar-label">{{ bar.label }}</span>
                </div>
              </div>
            </article>

            <article class="card span-2" aria-labelledby="sessions-title">
              <h3 id="sessions-title" class="card-title">Últimas sesiones</h3>
              <p v-if="recentSessions.length === 0" class="muted">No hubo sesiones en este periodo.</p>
              <ul v-else class="sessions">
                <li v-for="s in recentSessions" :key="s.sessionId">
                  <span class="session-when">{{ shortDate(new Date(s.startedAt)) }} · {{ formatTime(s.startedAt) }}</span>
                  <span class="session-what">
                    {{ s.isOpen ? 'En curso' : (s.endReason ? END_REASONS[s.endReason] : 'Cerrada') }}
                    <template v-if="s.student"> · {{ titleCase(s.student.firstName) }}</template>
                  </span>
                  <span class="session-duration">{{ formatDuration(s.durationSeconds) }}</span>
                </li>
              </ul>
              <p v-if="isTutor && sessionsWithoutStudent" class="warn-box">
                Algunas sesiones no indican qué hijo jugó: la app aún no envía el estudiante al abrir la sesión.
              </p>
            </article>
          </div>
        </template>
      </section>

      <template v-if="!hasNoStudents && subject">
        <!-- Desempeño en el juego -->
        <section class="card" aria-labelledby="performance-title">
          <div class="section-head">
            <h2 id="performance-title" class="card-title">Desempeño en el juego</h2>
            <span v-if="performance" class="muted small">
              {{ performance.age !== null ? `Comparado con lo esperado para ${performance.age} años` : 'Sin edad registrada para comparar' }}
              · {{ performance.gameSessionsCount }} {{ performance.gameSessionsCount === 1 ? 'sesión de juego' : 'sesiones de juego' }}
            </span>
          </div>

          <p v-if="performanceError" class="error" role="alert">{{ performanceError }}</p>
          <p v-else-if="performanceLoading && !performance" class="muted">Cargando desempeño…</p>

          <ul v-else-if="performance" class="metric-grid">
            <li v-for="m in performance.metrics" :key="m.key" class="metric">
              <span class="metric-label">{{ m.label }}</span>
              <span class="metric-value" :class="{ empty: m.value === null }">{{ formatMetric(m, m.value) }}</span>
              <div v-if="m.expectedMin !== null && m.expectedMax !== null" class="range">
                <div class="range-track" aria-hidden="true">
                  <span
                    class="range-band"
                    :style="{ left: pct(m.expectedMin, metricScale(m)), width: pct(m.expectedMax - m.expectedMin, metricScale(m)) }"
                  ></span>
                  <span v-if="m.value !== null" class="range-marker" :style="{ left: pct(m.value, metricScale(m)) }"></span>
                </div>
                <span class="range-text">Esperado: {{ formatMetric(m, m.expectedMin) }} – {{ formatMetric(m, m.expectedMax) }}</span>
              </div>
              <span v-else class="muted small">Sin rango esperado para comparar</span>
              <span class="pill" :class="metricStatus(m).tone">{{ metricStatus(m).label }}</span>
            </li>
          </ul>
        </section>

        <!-- Evolución + avisos -->
        <section class="two-cols">
          <article class="card" aria-labelledby="evolution-title">
            <h2 id="evolution-title" class="card-title">Evolución del formulario inicial</h2>
            <p v-if="evolution.length === 0" class="muted">Aún no hay formularios para comparar.</p>
            <template v-else>
              <div
                class="evolution"
                role="img"
                :aria-label="evolution.map((a) => `${shortDate(new Date(a.createdAt))}: ${a.totalScore} de ${a.maxScore}, alerta ${a.riskLevel}`).join('; ')"
              >
                <span class="axis top" aria-hidden="true">{{ evolution[evolution.length - 1]!.maxScore }}</span>
                <span class="axis bottom" aria-hidden="true">0</span>
                <span
                  v-for="(a, index) in evolution"
                  :key="a.id"
                  class="point"
                  :class="`risk-${a.riskLevel}`"
                  :style="evolutionPoint(a, index)"
                  aria-hidden="true"
                >
                  <span class="point-label">{{ a.totalScore }}/{{ a.maxScore }} · {{ shortDate(new Date(a.createdAt)) }}</span>
                </span>
              </div>
              <p class="muted small">
                Un puntaje más bajo es mejor (menos dificultades observadas).
                <template v-if="evolution.length === 1"> Al repetir el formulario aparecerán más puntos para comparar.</template>
              </p>
            </template>
          </article>

          <article class="card" aria-labelledby="alerts-title">
            <h2 id="alerts-title" class="card-title">Patrones a observar</h2>
            <ul v-if="performance?.alerts.length" class="alerts">
              <li v-for="a in performance.alerts" :key="a.createdAt + a.expected">
                <span class="pill tone-watch">{{ a.element === 'numero' ? 'Número' : a.element === 'letra' ? 'Letra' : 'Trazo' }} {{ a.expected }}</span>
                <span class="body-text">{{ a.message }}</span>
                <span class="muted small">{{ shortDate(new Date(a.createdAt)) }}</span>
              </li>
            </ul>
            <div v-else class="empty-alerts">
              <i class="pi pi-pencil" aria-hidden="true"></i>
              <p class="body-text">Aquí aparecerán avisos de los trazos, por ejemplo un número escrito de abajo hacia arriba o girado.</p>
              <p class="muted small">Sin trazos con avisos en este periodo</p>
            </div>
          </article>
        </section>
      </template>
    </template>
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/user-panel' as *;

.period {
  padding: 0.25rem;
  border-radius: 9999px;
  background: #ffffff;
  border: 1px solid $border-subtle;

  .filter-btn {
    min-height: 38px;
    border: none;
  }
}

.usage {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.kpi {
  gap: 0.35rem;
  padding: 1.1rem 1.25rem;
}

.kpi-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: $text-dark;
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.span-3 {
  grid-column: span 3;
}

.span-2 {
  grid-column: span 2;
}

@media (max-width: 1100px) {
  .span-3,
  .span-2 {
    grid-column: auto;
  }
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  height: 240px;
  padding-bottom: 2.4rem;
  border-bottom: 1px solid $border-subtle;
  overflow-x: auto;
}

.bar-col {
  flex: 1 1 0;
  min-width: 36px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
  position: relative;
}

.bar-value {
  font-size: 0.72rem;
  font-weight: 700;
  color: #334155;
  white-space: nowrap;
}

.bar {
  width: 60%;
  max-width: 56px;
  min-height: 3px;
  background: $brand-indigo;
  border-radius: 8px 8px 0 0;

  &.empty {
    background: $border-subtle;
  }
}

.bar-label {
  position: absolute;
  bottom: -2.1rem;
  font-size: 0.7rem;
  color: $text-muted;
  text-align: center;
  line-height: 1.2;
  white-space: normal;
  width: 100%;
}

.sessions {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr) auto;
    gap: 0.6rem;
    align-items: center;
    padding: 0.55rem 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.82rem;
  }
}

.session-when {
  font-weight: 700;
  color: #334155;
}

.session-what {
  color: #475569;
}

.session-duration {
  font-weight: 700;
  color: $text-dark;
}

.metric-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.metric {
  border: 1px solid $border-subtle;
  border-radius: 18px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  align-items: flex-start;
}

.metric-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  line-height: 1.35;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: $text-dark;

  &.empty {
    color: #94a3b8;
  }
}

.range {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.range-track {
  position: relative;
  height: 8px;
  background: #f1f5f9;
  border-radius: 9999px;
}

.range-band {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #bbf7d0;
  border-radius: 9999px;
}

.range-marker {
  position: absolute;
  top: -4px;
  width: 4px;
  height: 16px;
  margin-left: -2px;
  background: $text-dark;
  border-radius: 2px;
}

.range-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #047857;
}

.two-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.evolution {
  position: relative;
  height: 160px;
  margin: 1.25rem 0 0 2rem;
  border-left: 1px solid $border-subtle;
  border-bottom: 1px solid $border-subtle;
}

.axis {
  position: absolute;
  left: -2rem;
  font-size: 0.7rem;
  color: $text-muted;

  &.top { top: -0.4rem; }
  &.bottom { bottom: -0.4rem; }
}

.point {
  position: absolute;
  width: 14px;
  height: 14px;
  margin: 0 0 -7px -7px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #ffffff;

  &.risk-bajo { background: $tone-strength; }
  &.risk-moderado { background: $tone-watch; }
  &.risk-alto { background: $tone-reinforce; }
}

.point-label {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.72rem;
  font-weight: 700;
  color: #334155;
  white-space: nowrap;
}

.alerts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  li {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
    padding: 0.75rem 0.9rem;
    border: 1px solid $border-subtle;
    border-radius: 14px;
  }
}

.empty-alerts {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: #f8fafc;
  text-align: center;

  i {
    font-size: 1.5rem;
    color: $text-muted;
  }
}
</style>
