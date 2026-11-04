<script setup lang="ts">
import { ref } from 'vue'

// Asset imports
import diagnosticoImg from '~/assets/img/diagnostico.png'
import letrasImg from '~/assets/img/letras.png'
import numeroImg from '~/assets/img/numero.png'
import logicaImg from '~/assets/img/logica.png'
import atencionImg from '~/assets/img/atencion.png'
import memoriaImg from '~/assets/img/memoria.png'
import boyImg from '~/assets/img/boy.png'

// Dashboard de usuarios: tutores y adultos (con el formulario inicial completo) y testers.
// El menú lateral, el saludo y el menú de la cuenta están en layouts/user-panel.vue
definePageMeta({
  layout: 'user-panel',
  // El título va centrado en el encabezado del layout (antes ocupaba una fila propia sobre las tarjetas)
  headerTitle: 'Panel de Progreso',
  headerSubtitle: 'Resumen general del aprendizaje',
  showsSelectedStudent: true,
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester', 'estudiante'],
})

const selectedTimeRange = ref('30d')

// ---- Datos reales del estudiante (tutor: el hijo elegido; adulto y tester: la propia cuenta) ----
const { isTutor, hasNoStudents, studentId, load } = usePanelSubject()
const { data: routeProgress, loading: routeLoading, error: routeError, fetchData: fetchRouteProgress } = useRouteProgress()
const { data: xp, loading: xpLoading, error: xpError, fetchData: fetchXp } = useXp()
const { data: monthly, loading: monthlyLoading, error: monthlyError, fetchData: fetchMonthly } = useMonthlyUsage()
const { performance, loading: performanceLoading, fetchPerformance } = usePerformance()

const loadStats = (id?: string) =>
  Promise.all([fetchRouteProgress(id), fetchXp(id), fetchMonthly(id), fetchPerformance(30, id)])

onMounted(async () => {
  if (isTutor.value) await load()
  if (!hasNoStudents.value) loadStats(studentId.value)
})

// Cambio de hijo desde el menú de la cuenta
watch(studentId, (id, previous) => {
  if (id && id !== previous) loadStats(id)
})

interface KpiTrend {
  direction: 'up' | 'down' | 'same'
  text: string
  label: string
}

interface KpiMetric {
  id: string
  title: string
  value: string
  // Esperando la respuesta del backend: se muestra un esqueleto en lugar del valor
  loading?: boolean
  detail?: string
  trend?: KpiTrend
  // Valor que aún no existe (no hay datos suficientes): se muestra atenuado, nunca como un número inventado
  unavailable?: boolean
  icon: string
  bgColor: string
  iconColor: string
}

const monthName = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { month: 'long', timeZone: 'America/Bogota' })

// Puntaje por actividades completadas: XP cobrado en el cofre del juego (10 por cada letra o número aprobado, una sola vez).
// El de los ejercicios aprobados que aún no se cobran se avisa aparte: no suma hasta que el jugador abre el cofre.
const xpMetric = computed<KpiMetric>(() => {
  const base = { id: 'xp', title: 'Puntaje por actividades completadas', icon: 'pi pi-trophy', bgColor: '#fef3c7', iconColor: '#d97706' }
  if (xpLoading.value && !xp.value) return { ...base, value: '', loading: true }
  if (!xp.value) return { ...base, value: '—', detail: xpError.value ?? undefined, unavailable: true }
  const count = xp.value.rewardsCount
  const pendingXp = xp.value.pendingXp ?? 0
  return {
    ...base,
    value: `${xp.value.totalXp.toLocaleString('es-CO')} XP`,
    detail: [
      count === 0 ? 'Aún sin ejercicios cobrados en el cofre' : `${count} ${count === 1 ? 'ejercicio cobrado' : 'ejercicios cobrados'}`,
      pendingXp > 0 ? `${pendingXp.toLocaleString('es-CO')} XP por cobrar en el cofre del juego` : null,
    ].filter(Boolean).join(' · '),
  }
})

// Tiempo con la app abierta este mes frente al mismo tramo del mes anterior (hora de Colombia)
const timeMetric = computed<KpiMetric>(() => {
  const base = { id: 'time', title: 'Tiempo total de juego', icon: 'pi pi-clock', bgColor: '#dbeafe', iconColor: '#2563eb' }
  if (monthlyLoading.value && !monthly.value) return { ...base, value: '', loading: true }
  if (!monthly.value) return { ...base, value: '—', detail: monthlyError.value ?? undefined, unavailable: true }

  const { current, previous, comparison, elapsedDays } = monthly.value
  const previousMonth = monthName(previous.from)
  const period = previous.capped ? `todo ${previousMonth}` : `el mismo tramo de ${previousMonth}`
  const trend: KpiTrend =
    comparison.percentChange === null
      ? { direction: 'same', text: 'Sin base', label: `${previousMonth} no tuvo tiempo registrado` }
      : { direction: comparison.direction, text: `${Math.abs(comparison.percentChange)}%`, label: `vs. ${period}` }

  const diff = comparison.differenceSeconds
  const diffText = diff === 0 ? 'Igual que' : `${diff > 0 ? '+' : '−'}${formatDuration(Math.abs(diff))} frente a`
  return {
    ...base,
    value: formatDuration(current.seconds),
    detail: `Con la app abierta del 1 al ${elapsedDays} de ${monthName(current.from)} · ${diffText} ${previousMonth}`,
    trend,
  }
})

// Precisión del trazo (forma, orden y dirección): solo con datos reales de la app. Mientras Unity no envíe esas
// métricas se muestra "No disponible"; el promedio pondera números y letras por cantidad de ejercicios.
const precision = computed(() => {
  const parts = (performance.value?.metrics ?? []).filter(
    (m) => (m.key === 'numbers_precision' || m.key === 'letters_precision') && m.value !== null && m.samples > 0,
  )
  const samples = parts.reduce((sum, m) => sum + m.samples, 0)
  if (!samples) return null
  return { value: Math.round(parts.reduce((sum, m) => sum + (m.value as number) * m.samples, 0) / samples), samples }
})

const precisionMetric = computed<KpiMetric>(() => {
  const base = { id: 'accuracy', title: 'Precisión promedio', icon: 'pi pi-bullseye', bgColor: '#fee2e2', iconColor: '#dc2626' }
  if (performanceLoading.value && !performance.value) return { ...base, value: '', loading: true }
  if (!precision.value) {
    return {
      ...base,
      value: 'No disponible',
      detail: 'Se mostrará cuando la app envíe el detalle de los trazos (forma, orden y dirección).',
      unavailable: true,
    }
  }
  return { ...base, value: `${precision.value.value}%`, detail: `Basado en ${precision.value.samples} ejercicios · últimos 30 días` }
})

// KPI Metrics (la primera tarjeta es la conexión a la app: AppConnectionCard)
const metrics = computed(() => [xpMetric.value, timeMetric.value, precisionMetric.value])

// Rendimiento por área: porcentaje de ejercicios completados de cada ruta, con datos reales (GET /telemetry/route-progress).
// Las áreas que todavía no existen en la app (Lógica, Atención, Memoria) se muestran vacías y marcadas "Próximamente";
// nunca llevan un porcentaje de ejemplo. Lectura y Creatividad no se muestran: aún no se están implementando.
interface AreaBar {
  name: string
  // null = sin datos (la app aún no envió ejercicios o el área no existe todavía)
  percentage: number | null
  note: string | null
  icon: string
  gradient: string
}

const routeStyles: Record<string, { icon: string; gradient: string }> = {
  matematicas: { icon: numeroImg, gradient: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)' },
  escritura: { icon: letrasImg, gradient: 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)' },
  consonantes: { icon: letrasImg, gradient: 'linear-gradient(180deg, #fb923c 0%, #f97316 100%)' },
}
const fallbackRouteStyle = { icon: letrasImg, gradient: 'linear-gradient(180deg, #94a3b8 0%, #64748b 100%)' }

const upcomingAreas = [
  { name: 'Lógica', icon: logicaImg, gradient: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)' },
  { name: 'Atención', icon: atencionImg, gradient: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)' },
  { name: 'Memoria', icon: memoriaImg, gradient: 'linear-gradient(180deg, #f472b6 0%, #ec4899 100%)' },
]

// Mientras llega el progreso por ruta, el gráfico muestra columnas de esqueleto (la altura es solo decoración)
const areasLoading = computed(() => routeLoading.value && !routeProgress.value)
const chartSkeletonHeights = ['72%', '48%', '84%', '58%', '66%', '40%', '76%']

const performanceAreas = computed<AreaBar[]>(() => {
  const progress = routeProgress.value
  const routes: AreaBar[] = (progress?.routes ?? []).map((route) => ({
    name: route.name,
    percentage: progress?.hasData && route.total ? route.percentCompleted : null,
    // Con datos, el pie del gráfico dice a qué corresponde el porcentaje (ej. "4 de 10"); lo mismo que ve el niño en Unity
    note: progress?.hasData && route.total ? `${route.completed} de ${route.total}` : 'Sin datos',
    ...(routeStyles[route.id] ?? fallbackRouteStyle),
  }))
  const upcoming: AreaBar[] = upcomingAreas.map((area) => ({ ...area, percentage: null, note: 'Próximamente' }))
  return [...routes, ...upcoming]
})

// Today's Activities List
const todayActivities = [
  {
    id: 1,
    title: 'Aventura de las letras',
    area: 'Lectura',
    time: '09:00 - 09:30',
    icon: letrasImg,
    bgColor: '#eff6ff',
    completed: true
  },
  {
    id: 2,
    title: 'Cuenta y resuelve',
    area: 'Matemáticas',
    time: '10:00 - 10:30',
    icon: numeroImg,
    bgColor: '#ecfdf5',
    completed: false
  },
  {
    id: 3,
    title: 'Laberinto lógico',
    area: 'Lógica',
    time: '14:00 - 14:30',
    icon: logicaImg,
    bgColor: '#fef3c7',
    completed: false
  }
]

// Mini Calendar Days
const currentDay = 17
const calendarDays = [
  { day: 1, current: false }, { day: 2, current: false }, { day: 3, current: false }, { day: 4, current: false },
  { day: 5, current: false }, { day: 6, current: false }, { day: 7, current: false }, { day: 8, hasDot: true },
  { day: 9, hasDot: true }, { day: 10, current: false }, { day: 11, current: false }, { day: 12, current: false },
  { day: 13, current: false }, { day: 14, current: false }, { day: 15, current: false }, { day: 16, current: false },
  { day: 17, isSelected: true }, { day: 18, hasDot: true }, { day: 19, current: false }, { day: 20, current: false },
  { day: 21, current: false }, { day: 22, hasDot: true }, { day: 23, current: false }, { day: 24, hasDot: true },
  { day: 25, hasDot: true }, { day: 26, current: false }, { day: 27, current: false }, { day: 28, hasDot: true }
]
</script>

<template>
  <main class="dashboard-body">
    <!-- 4 KPI Summary Cards Grid -->
    <section class="kpi-grid">
      <!-- Estado de conexión de la app de Unity (verde = activo, rojo = inactivo) -->
      <DashboardAppConnectionCard />

      <div v-for="metric in metrics" :key="metric.id" class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon-wrap" :style="{ backgroundColor: metric.bgColor, color: metric.iconColor }">
            <i :class="metric.icon"></i>
          </div>
          <span class="kpi-title">{{ metric.title }}</span>
        </div>
        <div class="kpi-bottom">
          <UiSkeleton v-if="metric.loading" width="7rem" height="2rem" radius="10px" />
          <span v-else class="kpi-value" :class="{ 'is-unavailable': metric.unavailable }">{{ metric.value }}</span>
          <div v-if="metric.trend" class="kpi-trend">
            <span class="trend-badge" :class="`is-${metric.trend.direction}`">
              <i v-if="metric.trend.direction !== 'same'" :class="metric.trend.direction === 'up' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
              {{ metric.trend.text }}
            </span>
            <span class="trend-label">{{ metric.trend.label }}</span>
          </div>
        </div>
        <UiSkeleton v-if="metric.loading" width="80%" height="0.8rem" />
        <p v-else-if="metric.detail" class="kpi-detail">{{ metric.detail }}</p>
      </div>
    </section>

    <!-- Middle Section Grid: Performance Chart, Route Progress Donut, Top Profile -->
    <section class="middle-grid">
      <!-- 1. Rendimiento por área (Bar Chart Card) -->
      <div class="dashboard-card performance-card">
        <div class="card-header-row">
          <h2 class="card-title">Rendimiento por área</h2>
          <span class="chart-caption">Ejercicios completados de cada área</span>
        </div>

        <div class="chart-container" :class="{ 'is-loading': areasLoading }">
          <!-- Mientras llega el progreso, el arte de la pestaña se dibuja detrás de las columnas de esqueleto -->
          <UiLoadingArt v-if="areasLoading" variant="inicio" class="chart-art" />
          <!-- Y-Axis Ticks -->
          <div class="chart-y-axis">
            <span>100%</span>
            <span>80%</span>
            <span>60%</span>
            <span>40%</span>
            <span>20%</span>
            <span>0%</span>
          </div>

          <!-- Bar Columns Grid -->
          <div class="chart-bars-row">
            <template v-if="areasLoading">
              <div v-for="h in chartSkeletonHeights" :key="h" class="bar-column" aria-hidden="true">
                <UiSkeleton width="28px" height="0.8rem" />
                <div class="bar-track">
                  <UiSkeleton width="100%" :height="h" radius="8px 8px 0 0" />
                </div>
                <div class="bar-footer">
                  <UiSkeleton circle height="28px" />
                  <UiSkeleton width="44px" height="0.6rem" />
                </div>
              </div>
            </template>
            <div v-for="area in performanceAreas" v-show="!areasLoading" :key="area.name" class="bar-column">
              <span class="bar-percent-label" :class="{ 'is-empty': area.percentage === null }">
                {{ area.percentage === null ? '—' : `${area.percentage}%` }}
              </span>
              <div class="bar-track">
                <div
                  v-if="area.percentage !== null"
                  class="bar-fill"
                  :style="{ height: `${area.percentage}%`, background: area.gradient }"
                ></div>
              </div>
              <div class="bar-footer" :class="{ 'is-upcoming': area.percentage === null }">
                <div class="bar-icon-wrap">
                  <img :src="area.icon" :alt="area.name" class="bar-icon-img" />
                </div>
                <span class="bar-name">{{ area.name }}</span>
                <span v-if="area.note" class="bar-note">{{ area.note }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Progreso por ruta: un indicador circular por ruta, con datos reales (ocupa dos columnas para que quepan las tres rutas) -->
      <DashboardRouteProgressCard :progress="routeProgress" :loading="routeLoading" :error="routeError" />
    </section>

    <!-- Bottom Section Grid: Calendar + Today Activities, Tutor de -->
    <section class="bottom-grid">
      <!-- 1. Calendario de actividades & Actividades de hoy -->
      <div class="dashboard-card calendar-activities-card">
        <!-- Left: Calendar Widget -->
        <div class="calendar-widget">
          <div class="calendar-header">
            <h3 class="cal-title">Calendario de actividades</h3>
            <div class="cal-nav">
              <span class="cal-month">Julio 2024</span>
              <div class="cal-arrows">
                <button type="button" class="cal-arrow-btn"><i class="pi pi-chevron-left"></i></button>
                <button type="button" class="cal-arrow-btn"><i class="pi pi-chevron-right"></i></button>
              </div>
            </div>
          </div>

          <!-- Days of week -->
          <div class="cal-grid">
            <span class="cal-day-label">Lun</span>
            <span class="cal-day-label">Mar</span>
            <span class="cal-day-label">Mié</span>
            <span class="cal-day-label">Jue</span>
            <span class="cal-day-label">Vie</span>
            <span class="cal-day-label">Sáb</span>
            <span class="cal-day-label">Dom</span>

            <div
              v-for="(dayItem, idx) in calendarDays"
              :key="idx"
              class="cal-day-cell"
              :class="{ 'day-selected': dayItem.isSelected }"
            >
              <span class="day-num">{{ dayItem.day }}</span>
              <span v-if="dayItem.hasDot" class="day-dot"></span>
            </div>
          </div>
        </div>

        <!-- Right: Today's Activities List -->
        <div class="today-activities-widget">
          <div class="widget-header">
            <h3 class="widget-title">Actividades de hoy</h3>
            <span class="widget-subtitle">Miércoles, 17 de Julio</span>
          </div>

          <div class="activities-list">
            <div v-for="activity in todayActivities" :key="activity.id" class="activity-row">
              <div class="activity-icon-wrap" :style="{ backgroundColor: activity.bgColor }">
                <img :src="activity.icon" :alt="activity.area" class="act-img" />
              </div>
              <div class="activity-details">
                <h4 class="act-title">{{ activity.title }}</h4>
                <span class="act-meta">{{ activity.area }} · {{ activity.time }}</span>
              </div>
              <div class="activity-status">
                <i v-if="activity.completed" class="pi pi-check-circle text-success status-check"></i>
                <button v-else type="button" class="act-play-btn">
                  <i class="pi pi-play"></i>
                </button>
              </div>
            </div>
          </div>

          <button type="button" class="btn-all-activities">
            Ver todas las actividades
          </button>
        </div>
      </div>

      <!-- 2. Tutor de (hijos con su formulario inicial) / Mi perfil (adulto y tester) -->
      <DashboardProfileSummaryCard />
    </section>
  </main>
</template>

<style lang="scss" scoped>
$color-brand-blue: #3b50df;
$color-brand-indigo: #4f46e5;
$color-bg-app: #f4f7fc;
$color-text-dark: #1e293b;
$color-text-body: #334155;
$color-text-muted: #64748b;
$color-card-bg: rgba(255, 255, 255, 0.95);
$color-border-subtle: #e2e8f0;

// ----------------------------------------------------
// Dashboard Body
// ----------------------------------------------------
.dashboard-body {
  padding: 1.75rem 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem;
  }
}

// ----------------------------------------------------
// KPI Cards Grid (4 Top Cards)
// ----------------------------------------------------
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.kpi-card {
  background: $color-card-bg;
  border: 1px solid #ffffff;
  border-radius: 20px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(59, 80, 223, 0.08);
  }

  .kpi-top {
    display: flex;
    align-items: center;
    gap: 0.85rem;

    .kpi-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .kpi-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: $color-text-body;
      line-height: 1.25;
    }
  }

  .kpi-detail {
    margin: -0.4rem 0 0;
    font-size: 0.78rem;
    line-height: 1.4;
    color: #64748b;
  }

  .kpi-bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    .kpi-value {
      font-size: 1.85rem;
      font-weight: 900;
      color: $color-text-dark;
      letter-spacing: -0.03em;

      // Sin datos suficientes: atenuado y más pequeño, para que no parezca una cifra
      &.is-unavailable {
        font-size: 1.15rem;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 0;
      }
    }

    .kpi-trend {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .trend-badge {
        font-size: 0.82rem;
        font-weight: 700;
        color: #16a34a;
        display: flex;
        align-items: center;
        gap: 0.2rem;

        &.is-down {
          color: #dc2626;
        }

        &.is-same {
          color: #64748b;
        }
      }

      .trend-label {
        font-size: 0.72rem;
        color: #94a3b8;
      }
    }
  }
}

// ----------------------------------------------------
// Generic Dashboard Card
// ----------------------------------------------------
.dashboard-card {
  background: $color-card-bg;
  border: 1px solid #ffffff;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: $color-text-dark;
  margin: 0;
  letter-spacing: -0.01em;
}

.chart-caption {
  font-size: 0.78rem;
  font-weight: 600;
  color: #94a3b8;
}

.select-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  background-color: #f8fafc;
  border: 1px solid $color-border-subtle;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

// ----------------------------------------------------
// Middle Section Grid
// ----------------------------------------------------
.middle-grid {
  display: grid;
  // Rendimiento por área + Progreso por ruta (ancho de dos columnas del bloque inferior)
  grid-template-columns: 1.6fr 2fr;
  gap: 1.25rem;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}

// Performance Chart
.performance-card {
  .chart-container {
    position: relative;
    display: flex;
    gap: 1rem;
    height: 250px;
    padding-top: 1rem;
  }

  .chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 0.72rem;
    color: #94a3b8;
    padding-bottom: 3.5rem;
  }

  // El arte va detrás de las columnas (un elemento posicionado se pinta encima de los demás sin z-index)
  .chart-art {
    opacity: 0.9;
  }

  // Mientras carga, las columnas dejan ver el arte que hay detrás
  .chart-container.is-loading .bar-track {
    background-color: rgba(241, 245, 249, 0.45);
  }

  .chart-y-axis,
  .chart-bars-row {
    position: relative;
    z-index: 1;
  }

  .chart-bars-row {
    flex: 1;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    border-bottom: 1px solid #f1f5f9;
  }

  .bar-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 48px;

    .bar-percent-label {
      font-size: 0.78rem;
      font-weight: 800;
      color: $color-text-dark;
      margin-bottom: 0.35rem;

      &.is-empty {
        color: #94a3b8;
      }
    }

    // Áreas que la app todavía no tiene: atenuadas, con su aviso debajo
    .bar-footer.is-upcoming {
      opacity: 0.6;
    }

    .bar-note {
      font-size: 0.62rem;
      font-weight: 600;
      color: #94a3b8;
      text-align: center;
      line-height: 1.1;
    }

    .bar-track {
      flex: 1;
      width: 32px;
      display: flex;
      align-items: flex-end;
      background-color: #f1f5f9;
      border-radius: 8px 8px 0 0;
      overflow: hidden;

      .bar-fill {
        width: 100%;
        border-radius: 8px 8px 0 0;
        transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .bar-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 0.5rem;
      gap: 0.2rem;

      .bar-icon-wrap {
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;

        .bar-icon-img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }
      }

      .bar-name {
        font-size: 0.72rem;
        font-weight: 700;
        color: #64748b;
      }
    }
  }
}

// ----------------------------------------------------
// Bottom Grid
// ----------------------------------------------------
.bottom-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}

// Combined Calendar + Today Activities Card
.calendar-activities-card {
  display: grid;
  grid-template-columns: 1.1fr 1.3fr;
  gap: 1.5rem;

  // Ocupa también la columna central, para no dejar un hueco en la fila
  @media (min-width: 1281px) {
    grid-column: span 2;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  .calendar-widget {
    border-right: 1px solid #f1f5f9;
    padding-right: 1.25rem;

    @media (max-width: 640px) {
      border-right: none;
      padding-right: 0;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
    }

    .calendar-header {
      margin-bottom: 1rem;

      .cal-title {
        font-size: 0.95rem;
        font-weight: 800;
        margin: 0 0 0.4rem 0;
      }

      .cal-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .cal-month {
          font-size: 0.85rem;
          font-weight: 700;
          color: $color-brand-indigo;
        }

        .cal-arrows {
          display: flex;
          gap: 0.25rem;

          .cal-arrow-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #64748b;
            font-size: 0.75rem;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;

            &:hover { background-color: #f1f5f9; }
          }
        }
      }
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.35rem;
      text-align: center;

      .cal-day-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: #94a3b8;
        margin-bottom: 0.25rem;
      }

      .cal-day-cell {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #334155;
        position: relative;
        cursor: pointer;

        &:hover {
          background-color: #f1f5f9;
        }

        &.day-selected {
          background-color: $color-brand-indigo;
          color: #ffffff;
          font-weight: 800;
        }

        .day-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #ef4444;
          position: absolute;
          bottom: 2px;
        }
      }
    }
  }

  .today-activities-widget {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .widget-header {
      margin-bottom: 0.85rem;

      .widget-title {
        font-size: 0.95rem;
        font-weight: 800;
        margin: 0 0 0.15rem 0;
      }

      .widget-subtitle {
        font-size: 0.78rem;
        color: #94a3b8;
      }
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .activity-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.65rem;
        background-color: #f8fafc;
        border-radius: 12px;

        .activity-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .act-img {
            width: 22px;
            height: 22px;
            object-fit: contain;
          }
        }

        .activity-details {
          flex: 1;

          .act-title {
            font-size: 0.82rem;
            font-weight: 700;
            margin: 0;
            color: $color-text-dark;
          }

          .act-meta {
            font-size: 0.72rem;
            color: #94a3b8;
          }
        }

        .status-check {
          font-size: 1.15rem;
          color: #10b981;
        }

        .act-play-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #e0e7ff;
          border: none;
          color: $color-brand-indigo;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &:hover {
            background: $color-brand-indigo;
            color: #ffffff;
          }
        }
      }
    }

    .btn-all-activities {
      width: 100%;
      padding: 0.55rem;
      background-color: #eff6ff;
      border: none;
      border-radius: 10px;
      color: $color-brand-indigo;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 0.75rem;
      transition: all 0.2s;

      &:hover {
        background-color: #e0e7ff;
      }
    }
  }
}

// Aparición suave de cada bloque cuando reemplaza al esqueleto
@keyframes dashboard-reveal {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .dashboard-body > section {
    animation: dashboard-reveal 0.28s ease-out both;
  }
}
</style>
