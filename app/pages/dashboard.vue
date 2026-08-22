<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

// Asset imports
import avatarImg from '~/assets/img/avatar.png'
import diagnosticoImg from '~/assets/img/diagnostico.png'
import letrasImg from '~/assets/img/letras.png'
import numeroImg from '~/assets/img/numero.png'
import logicaImg from '~/assets/img/logica.png'
import atencionImg from '~/assets/img/atencion.png'
import memoriaImg from '~/assets/img/memoria.png'
import creatividadImg from '~/assets/img/creatividad.png'
import womanImg from '~/assets/img/woman.png'
import grilImg from '~/assets/img/gril.png'
import boyImg from '~/assets/img/boy.png'

definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()

// Active navigation menu item
const activeNav = ref('inicio')
const searchQuery = ref('')
const selectedTimeRange = ref('30d')
const showUserMenu = ref(false)

const navItems = [
  { id: 'inicio', label: 'Inicio', icon: 'pi pi-home', route: '/dashboard' },
  { id: 'estudiantes', label: 'Estudiantes', icon: 'pi pi-users', route: '/profile-selection' },
  { id: 'diagnosticos', label: 'Diagnósticos', icon: 'pi pi-clipboard', route: '/child-registration' },
  { id: 'actividades', label: 'Actividades', icon: 'pi pi-play', route: '#' },
  { id: 'analiticas', label: 'Analíticas', icon: 'pi pi-chart-bar', route: '#' },
  { id: 'biblioteca', label: 'Biblioteca', icon: 'pi pi-book', route: '#' },
  { id: 'configuracion', label: 'Configuración', icon: 'pi pi-cog', route: '#' }
]

// Current user display name
const userName = computed(() => {
  if (user.value?.firstName) {
    return `${user.value.firstName} ${user.value.lastName || ''}`.trim()
  }
  if (user.value?.name) return user.value.name
  if (user.value?.email) return user.value.email.split('@')[0]
  return 'María Torres'
})

// KPI Metrics
const metrics = [
  {
    id: 'students',
    title: 'Estudiantes activos',
    value: '128',
    growth: '12%',
    icon: 'pi pi-users',
    bgColor: '#e0e7ff',
    iconColor: '#4f46e5'
  },
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
    id: 'students',
    label: 'Gestionar Estudiantes',
    icon: 'pi pi-users',
    bgColor: '#eff6ff',
    color: '#2563eb',
    route: '/profile-selection'
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
  <div class="dashboard-layout">
    <!-- Left Navigation Sidebar -->
    <aside class="sidebar">
      <!-- Top Brand Logo -->
      <div class="sidebar-brand">
        <img :src="avatarImg" alt="Avatar Logo" class="brand-avatar" />
        <div class="brand-text">
          <span class="brand-name-top">Vamos</span>
          <span class="brand-name-sub">Aprendiendo</span>
        </div>
      </div>

      <!-- Navigation Links Menu -->
      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.id"
          :to="item.route"
          class="nav-link"
          :class="{ active: activeNav === item.id }"
          @click="activeNav = item.id"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="brand-mini">
          <img :src="avatarImg" alt="Logo" class="mini-avatar" />
          <span class="mini-brand-text">Vamos Aprendiendo</span>
        </div>
        <span class="version-tag">v1.0</span>
      </div>
    </aside>

    <!-- Main Content Shell -->
    <div class="main-wrapper">
      <!-- Top Bar Header -->
      <header class="top-header">
        <!-- Global Search Input -->
        <div class="search-box">
          <i class="pi pi-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar estudiantes, actividades..."
            class="search-input"
          />
        </div>

        <!-- Right Header Actions -->
        <div class="header-right">
          <!-- Notification Bell with Badge -->
          <button type="button" class="icon-button" aria-label="Notificaciones">
            <i class="pi pi-bell"></i>
            <span class="badge-count">2</span>
          </button>

          <!-- Help Button -->
          <button type="button" class="icon-button" aria-label="Ayuda">
            <i class="pi pi-question-circle"></i>
          </button>

          <!-- User Profile Dropdown Chip -->
          <div class="user-chip-container">
            <div class="user-chip" @click="showUserMenu = !showUserMenu">
              <div class="user-avatar-wrap">
                <img :src="womanImg" alt="María Torres" class="user-avatar-img" />
              </div>
              <div class="user-details">
                <span class="user-name">{{ userName }}</span>
                <span class="user-role">Docente</span>
              </div>
              <i class="pi pi-chevron-down dropdown-arrow"></i>
            </div>

            <!-- User Menu Dropdown -->
            <div v-if="showUserMenu" class="user-menu-dropdown">
              <div class="dropdown-header">
                <strong>{{ userName }}</strong>
                <small>{{ user?.email || 'docente@vamosaprendiendo.edu' }}</small>
              </div>
              <hr class="dropdown-divider" />
              <button type="button" class="dropdown-item" @click="navigateTo('/profile-selection')">
                <i class="pi pi-user mr-2"></i> Cambiar Perfil
              </button>
              <button type="button" class="dropdown-item" @click="navigateTo('/child-registration')">
                <i class="pi pi-clipboard mr-2"></i> Diagnóstico
              </button>
              <hr class="dropdown-divider" />
              <button type="button" class="dropdown-item text-danger" @click="logout">
                <i class="pi pi-sign-out mr-2"></i> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Body Content -->
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

          <!-- 3. Perfil Destacado (Student Card) -->
          <div class="dashboard-card profile-spotlight-card">
            <div class="card-header-row">
              <h2 class="card-title">Perfil destacado</h2>
              <a href="#" class="view-all-link">Ver todos</a>
            </div>

            <div class="student-profile-badge">
              <div class="student-avatar-frame">
                <img :src="grilImg" alt="Sofía Ramírez" class="student-img" />
              </div>
              <div class="student-info">
                <h3 class="student-name">Sofía Ramírez</h3>
                <div class="student-level">
                  <i class="pi pi-star-fill text-warning"></i>
                  <span>Nivel Explorador</span>
                </div>
              </div>
            </div>

            <!-- XP Progress -->
            <div class="xp-container">
              <div class="xp-header">
                <span class="xp-badge">XP</span>
                <span class="xp-values">1,240 / 1,800 XP</span>
              </div>
              <div class="xp-track">
                <div class="xp-fill" style="width: 68%;"></div>
              </div>
            </div>

            <!-- Strengths and Weaknesses -->
            <div class="skills-block">
              <span class="skills-label">Áreas más fuertes</span>
              <div class="chips-row">
                <span class="skill-chip chip-blue">
                  <img :src="letrasImg" alt="Lectura" class="chip-icon" /> Lectura
                </span>
                <span class="skill-chip chip-purple">
                  <img :src="creatividadImg" alt="Creatividad" class="chip-icon" /> Creatividad
                </span>
              </div>

              <span class="skills-label mt-2">A mejorar</span>
              <div class="chips-row">
                <span class="skill-chip chip-green">
                  <img :src="numeroImg" alt="Matemáticas" class="chip-icon" /> Matemáticas
                </span>
                <span class="skill-chip chip-amber">
                  <img :src="atencionImg" alt="Atención" class="chip-icon" /> Atención
                </span>
              </div>
            </div>
          </div>
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
    </div>
  </div>
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

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: $color-bg-app;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: $color-text-dark;
}

// ----------------------------------------------------
// Left Navigation Sidebar
// ----------------------------------------------------
.sidebar {
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid $color-border-subtle;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  z-index: 20;

  @media (max-width: 1024px) {
    display: none;
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem 1.75rem;

  .brand-avatar {
    width: 42px;
    height: 42px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(59, 80, 223, 0.2));
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;

    .brand-name-top {
      font-size: 1.05rem;
      font-weight: 800;
      color: #1e1b4b;
    }

    .brand-name-sub {
      font-size: 1.05rem;
      font-weight: 800;
      color: $color-brand-blue;
    }
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.75rem 1rem;
    border-radius: 14px;
    color: $color-text-muted;
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 600;
    transition: all 0.2s ease;

    i {
      font-size: 1.15rem;
    }

    &:hover {
      background-color: #f1f5f9;
      color: $color-brand-indigo;
    }

    &.active {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      box-shadow: 0 8px 18px -4px rgba(79, 70, 229, 0.45);
    }
  }
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;

  .brand-mini {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .mini-avatar {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }

    .mini-brand-text {
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
    }
  }

  .version-tag {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 600;
  }
}

// ----------------------------------------------------
// Main Content Layout
// ----------------------------------------------------
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
}

// Top Bar Header
.top-header {
  height: 72px;
  background-color: #ffffff;
  border-bottom: 1px solid $color-border-subtle;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 15;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 420px;

  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 0.95rem;
  }

  .search-input {
    width: 100%;
    height: 40px;
    padding: 0.5rem 1rem 0.5rem 2.6rem;
    background-color: #f8fafc;
    border: 1px solid $color-border-subtle;
    border-radius: 9999px;
    font-size: 0.88rem;
    color: $color-text-dark;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      background-color: #ffffff;
      border-color: $color-brand-indigo;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8fafc;
  border: 1px solid $color-border-subtle;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1.05rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    color: $color-brand-indigo;
  }

  .badge-count {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #ef4444;
    color: #ffffff;
    font-size: 0.68rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.user-chip-container {
  position: relative;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.35rem 0.75rem 0.35rem 0.4rem;
  background-color: #f8fafc;
  border: 1px solid $color-border-subtle;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
  }

  .user-avatar-wrap {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #e2e8f0;

    .user-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-details {
    display: flex;
    flex-direction: column;
    line-height: 1.15;

    .user-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: $color-text-dark;
    }

    .user-role {
      font-size: 0.72rem;
      color: $color-text-muted;
    }
  }

  .dropdown-arrow {
    font-size: 0.75rem;
    color: #94a3b8;
  }
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #ffffff;
  border: 1px solid $color-border-subtle;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  z-index: 30;

  .dropdown-header {
    display: flex;
    flex-direction: column;
    padding: 0.25rem 0.5rem 0.5rem;

    strong {
      font-size: 0.9rem;
      color: $color-text-dark;
    }

    small {
      color: #94a3b8;
      font-size: 0.75rem;
    }
  }

  .dropdown-divider {
    border: none;
    border-top: 1px solid #f1f5f9;
    margin: 0.35rem 0;
  }

  .dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0.6rem 0.75rem;
    background: none;
    border: none;
    border-radius: 8px;
    color: $color-text-dark;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;

    &:hover {
      background-color: #f8fafc;
      color: $color-brand-indigo;
    }

    &.text-danger {
      color: #ef4444;

      &:hover {
        background-color: #fef2f2;
      }
    }
  }
}

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

// Spotlight Profile
.profile-spotlight-card {
  .student-profile-badge {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1.15rem;

    .student-avatar-frame {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #dcfce7;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .student-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .student-info {
      .student-name {
        font-size: 1.05rem;
        font-weight: 800;
        color: $color-text-dark;
        margin: 0 0 0.15rem 0;
      }

      .student-level {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: #10b981;
      }
    }
  }

  .xp-container {
    margin-bottom: 1.25rem;

    .xp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;

      .xp-badge {
        font-size: 0.72rem;
        font-weight: 800;
        color: $color-brand-indigo;
      }

      .xp-values {
        font-size: 0.75rem;
        color: #94a3b8;
        font-weight: 600;
      }
    }

    .xp-track {
      height: 8px;
      background-color: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;

      .xp-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #a855f7);
        border-radius: 9999px;
      }
    }
  }

  .skills-block {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    .skills-label {
      font-size: 0.76rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .chips-row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      .skill-chip {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.3rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.78rem;
        font-weight: 700;

        .chip-icon {
          width: 14px;
          height: 14px;
          object-fit: contain;
        }

        &.chip-blue { background: #eff6ff; color: #2563eb; }
        &.chip-purple { background: #f5f3ff; color: #7c3aed; }
        &.chip-green { background: #f0fdf4; color: #16a34a; }
        &.chip-amber { background: #fffbeb; color: #d97706; }
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
