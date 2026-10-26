<script setup lang="ts">
import { ref } from 'vue'

// Asset imports
import diagnosticoImg from '~/assets/img/diagnostico.png'
import letrasImg from '~/assets/img/letras.png'
import numeroImg from '~/assets/img/numero.png'
import logicaImg from '~/assets/img/logica.png'
import atencionImg from '~/assets/img/atencion.png'
import memoriaImg from '~/assets/img/memoria.png'
import creatividadImg from '~/assets/img/creatividad.png'
import boyImg from '~/assets/img/boy.png'

// Dashboard de usuarios: tutores y adultos (con el formulario inicial completo) y testers.
// El menú lateral, el saludo y el menú de la cuenta están en layouts/user-panel.vue
definePageMeta({
  layout: 'user-panel',
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const selectedTimeRange = ref('30d')

// KPI Metrics (la primera tarjeta es la conexión a la app: AppConnectionCard)
const metrics = [
  {
    id: 'activities',
    title: 'Actividades completadas',
    value: '1,248',
    growth: '18%',
    icon: 'pi pi-trophy',
    bgColor: '#fef3c7',
    iconColor: '#d97706'
  },
  {
    id: 'time',
    title: 'Tiempo total de juego',
    value: '86 h',
    growth: '9%',
    icon: 'pi pi-clock',
    bgColor: '#dbeafe',
    iconColor: '#2563eb'
  },
  {
    id: 'accuracy',
    title: 'Precisión promedio',
    value: '87%',
    growth: '5%',
    icon: 'pi pi-bullseye',
    bgColor: '#fee2e2',
    iconColor: '#dc2626'
  }
]

// Performance by Area Chart Data
const performanceAreas = [
  {
    name: 'Lectura',
    percentage: 92,
    icon: letrasImg,
    gradient: 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)'
  },
  {
    name: 'Matemáticas',
    percentage: 85,
    icon: numeroImg,
    gradient: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)'
  },
  {
    name: 'Lógica',
    percentage: 78,
    icon: logicaImg,
    gradient: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)'
  },
  {
    name: 'Atención',
    percentage: 83,
    icon: atencionImg,
    gradient: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)'
  },
  {
    name: 'Memoria',
    percentage: 80,
    icon: memoriaImg,
    gradient: 'linear-gradient(180deg, #f472b6 0%, #ec4899 100%)'
  },
  {
    name: 'Creatividad',
    percentage: 88,
    icon: creatividadImg,
    gradient: 'linear-gradient(180deg, #a78bfa 0%, #8b5cf6 100%)'
  }
]

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

// Recent Activity Feed
const recentActivities = [
  {
    id: 1,
    text: 'Sofía completó',
    highlight: 'Aventura de las letras',
    time: 'Hace 20 min',
    icon: 'pi pi-check-circle',
    color: '#10b981',
    bgColor: '#dcfce7'
  },
  {
    id: 2,
    text: 'Mateo alcanzó nuevo logro',
    highlight: 'Experto en Sumatorias',
    time: 'Hace 1 h',
    icon: 'pi pi-star-fill',
    color: '#f59e0b',
    bgColor: '#fef3c7'
  },
  {
    id: 3,
    text: 'Lucía finalizó',
    highlight: 'Diagnóstico inicial',
    time: 'Hace 3 h',
    icon: 'pi pi-clipboard',
    color: '#6366f1',
    bgColor: '#e0e7ff'
  },
  {
    id: 4,
    text: 'Daniel mejoró en Concentración',
    highlight: '+12% esta semana',
    time: 'Hace 1 día',
    icon: 'pi pi-chart-line',
    color: '#0284c7',
    bgColor: '#e0f2fe'
  }
]

// Quick Action Buttons
const quickActions = [
  {
    id: 'diag',
    label: 'Nuevo Diagnóstico',
    icon: 'pi pi-clipboard',
    bgColor: '#f5f3ff',
    color: '#7c3aed',
    route: '/child-registration'
  },
  {
    id: 'act',
    label: 'Crear Actividad',
    icon: 'pi pi-play',
    bgColor: '#f0fdf4',
    color: '#16a34a',
    route: '#'
  },
  {
    id: 'export',
    label: 'Exportar Reporte',
    icon: 'pi pi-download',
    bgColor: '#f8fafc',
    color: '#475569',
    route: '#'
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
    <!-- Page Title Header -->
    <div class="page-title-row">
      <div>
        <h1 class="page-title">Panel de Progreso</h1>
        <p class="page-subtitle">Resumen general del aprendizaje</p>
      </div>
    </div>

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
          <span class="kpi-value">{{ metric.value }}</span>
          <div class="kpi-trend">
            <span class="trend-badge">
              <i class="pi pi-arrow-up"></i> {{ metric.growth }}
            </span>
            <span class="trend-label">vs. mes anterior</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Middle Section Grid: Performance Chart, Route Progress Donut, Top Profile -->
    <section class="middle-grid">
      <!-- 1. Rendimiento por área (Bar Chart Card) -->
      <div class="dashboard-card performance-card">
        <div class="card-header-row">
          <h2 class="card-title">Rendimiento por área</h2>
          <div class="select-pill">
            <span>Últimos 30 días</span>
            <i class="pi pi-chevron-down"></i>
          </div>
        </div>

        <div class="chart-container">
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
            <div v-for="area in performanceAreas" :key="area.name" class="bar-column">
              <span class="bar-percent-label">{{ area.percentage }}%</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ height: `${area.percentage}%`, background: area.gradient }"
                ></div>
              </div>
              <div class="bar-footer">
                <div class="bar-icon-wrap">
                  <img :src="area.icon" :alt="area.name" class="bar-icon-img" />
                </div>
                <span class="bar-name">{{ area.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Progreso por ruta (Donut Progress Card) -->
      <div class="dashboard-card progress-route-card">
        <h2 class="card-title">Progreso por ruta</h2>
        
        <div class="donut-center-wrap">
          <div class="donut-graphic">
            <svg viewBox="0 0 100 100" class="donut-svg">
              <!-- Background Circle -->
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" stroke-width="12" />
              <!-- Cyan Layer -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#38bdf8"
                stroke-width="12"
                stroke-dasharray="251.2"
                stroke-dashoffset="60"
                stroke-linecap="round"
              />
              <!-- Main Royal Blue Layer -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#4f46e5"
                stroke-width="12"
                stroke-dasharray="251.2"
                stroke-dashoffset="70"
                stroke-linecap="round"
              />
            </svg>
            <div class="donut-text">
              <span class="donut-percentage">72%</span>
              <span class="donut-label">Completado</span>
            </div>
          </div>

          <!-- Donut Legend -->
          <div class="donut-legend">
            <div class="legend-item">
              <span class="legend-dot dot-completed"></span>
              <span class="legend-text">Completadas</span>
              <strong class="legend-count">24</strong>
            </div>
            <div class="legend-item">
              <span class="legend-dot dot-in-progress"></span>
              <span class="legend-text">En progreso</span>
              <strong class="legend-count">8</strong>
            </div>
            <div class="legend-item">
              <span class="legend-dot dot-pending"></span>
              <span class="legend-text">Pendientes</span>
              <strong class="legend-count">6</strong>
            </div>
          </div>
        </div>

        <button type="button" class="btn-route-action">
          <span>Ver ruta completa</span>
          <i class="pi pi-arrow-right"></i>
        </button>
      </div>

      <!-- 3. Tutor de (hijos con su formulario inicial) / Mi perfil (adulto y tester) -->
      <DashboardProfileSummaryCard />
    </section>

    <!-- Bottom Section Grid: Calendar + Today Activities, Recent Activities, Quick Actions -->
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

      <!-- 2. Actividad Reciente Feed -->
      <div class="dashboard-card recent-activity-card">
        <div class="card-header-row">
          <h2 class="card-title">Actividad reciente</h2>
          <a href="#" class="view-all-link">Ver historial</a>
        </div>

        <div class="activity-feed">
          <div v-for="item in recentActivities" :key="item.id" class="feed-item">
            <div class="feed-icon-badge" :style="{ backgroundColor: item.bgColor, color: item.color }">
              <i :class="item.icon"></i>
            </div>
            <div class="feed-content">
              <p class="feed-text">
                {{ item.text }} <strong>{{ item.highlight }}</strong>
              </p>
              <span class="feed-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Acciones Rápidas (2x2 Grid) -->
      <div class="dashboard-card quick-actions-card">
        <h2 class="card-title mb-3">Acciones rápidas</h2>
        
        <div class="quick-grid">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.id"
            :to="action.route"
            class="quick-action-tile"
            :style="{ backgroundColor: action.bgColor }"
          >
            <div class="quick-icon-wrap" :style="{ color: action.color }">
              <i :class="action.icon"></i>
            </div>
            <span class="quick-label">{{ action.label }}</span>
          </NuxtLink>
        </div>
      </div>
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

.page-title-row {
  .page-title {
    font-size: 1.65rem;
    font-weight: 800;
    color: $color-text-dark;
    margin: 0 0 0.25rem 0;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: 0.92rem;
    color: $color-text-muted;
    margin: 0;
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

  .kpi-bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    .kpi-value {
      font-size: 1.85rem;
      font-weight: 900;
      color: $color-text-dark;
      letter-spacing: -0.03em;
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

.view-all-link {
  font-size: 0.82rem;
  font-weight: 700;
  color: $color-brand-indigo;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

// ----------------------------------------------------
// Middle Section Grid
// ----------------------------------------------------
.middle-grid {
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

// Performance Chart
.performance-card {
  .chart-container {
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

// Progress Route Donut
.progress-route-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .donut-center-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    margin: 1rem 0;
  }

  .donut-graphic {
    position: relative;
    width: 140px;
    height: 140px;

    .donut-svg {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }

    .donut-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: flex;
      flex-direction: column;

      .donut-percentage {
        font-size: 1.75rem;
        font-weight: 900;
        color: $color-text-dark;
        line-height: 1;
      }

      .donut-label {
        font-size: 0.72rem;
        color: #94a3b8;
        font-weight: 600;
      }
    }
  }

  .donut-legend {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;

    .legend-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.82rem;

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 0.4rem;

        &.dot-completed { background-color: #4f46e5; }
        &.dot-in-progress { background-color: #38bdf8; }
        &.dot-pending { background-color: #cbd5e1; }
      }

      .legend-text {
        flex: 1;
        color: #64748b;
      }

      .legend-count {
        color: $color-text-dark;
      }
    }
  }

  .btn-route-action {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 0 6px 16px -3px rgba(79, 70, 229, 0.4);
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      transform: translateY(-1px);
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

// Recent Activity Feed
.recent-activity-card {
  .activity-feed {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;

    .feed-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;

      .feed-icon-badge {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
        flex-shrink: 0;
      }

      .feed-content {
        .feed-text {
          font-size: 0.82rem;
          margin: 0 0 0.15rem 0;
          color: $color-text-dark;
          line-height: 1.3;

          strong {
            color: #1e1b4b;
          }
        }

        .feed-time {
          font-size: 0.72rem;
          color: #94a3b8;
        }
      }
    }
  }
}

// Quick Actions 2x2
.quick-actions-card {
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;

    .quick-action-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 1.15rem 0.75rem;
      border-radius: 16px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
      }

      // Con un número impar de acciones, la última ocupa toda la fila
      &:last-child:nth-child(odd) {
        grid-column: 1 / -1;
      }

      .quick-icon-wrap {
        font-size: 1.45rem;
        margin-bottom: 0.4rem;
      }

      .quick-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: $color-text-dark;
        line-height: 1.25;
      }
    }
  }
}
</style>
