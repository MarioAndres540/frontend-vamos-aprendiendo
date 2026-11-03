<script setup lang="ts">
import type { RouteProgress, RouteProgressResponse } from '~/composables/useLearningStats'

// Tarjeta "Progreso por ruta": un indicador circular por ruta de aprendizaje (Matemáticas, Escritura...).
// Los datos son reales (GET /telemetry/route-progress); si la app aún no envió nada se dice, sin inventar cifras.
const props = defineProps<{
  progress: RouteProgressResponse | null
  loading: boolean
  error: string | null
}>()

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const hasData = computed(() => props.progress?.hasData === true)

// A qué corresponde cada porcentaje; coincide con las tarjetas de "Tu ruta" en Unity. Una ruta nueva sin texto aquí
// muestra solo su nombre.
const routeDescriptions: Record<string, string> = {
  matematicas: 'Números del 0 al 9',
  escritura: 'Vocales, minúsculas y mayúsculas',
  consonantes: 'Consonantes, minúsculas y mayúsculas',
}

// Dos arcos sobre el aro: completadas (desde arriba) y, a continuación, en progreso; el resto es el fondo (pendientes)
const arcs = (route: RouteProgress) => {
  if (!route.total) return { completed: 0, inProgress: 0 }
  return {
    completed: (route.completed / route.total) * CIRCUMFERENCE,
    inProgress: (route.inProgress / route.total) * CIRCUMFERENCE,
  }
}

const ariaLabel = (route: RouteProgress) =>
  hasData.value
    ? `${route.name}: ${route.completed} completadas, ${route.inProgress} en progreso y ${route.pending} pendientes`
    : `${route.name}: sin ejercicios registrados`
</script>

<template>
  <div class="dashboard-card progress-route-card">
    <h2 class="route-card-title">Progreso por ruta</h2>

    <UiSkeletonRegion v-if="loading && !progress" label="Cargando el progreso por ruta…" gap="0.5rem">
      <div class="rings">
        <div v-for="n in 3" :key="n" class="ring-item">
          <UiSkeleton circle height="112px" />
          <UiSkeleton width="60%" height="1rem" />
          <UiSkeleton width="80%" height="0.8rem" />
        </div>
      </div>
    </UiSkeletonRegion>
    <p v-else-if="error && !progress" class="route-note is-error">{{ error }}</p>

    <template v-else-if="progress">
      <div class="rings">
        <article v-for="route in progress.routes" :key="route.id" class="ring-item">
          <div class="ring-graphic">
            <svg viewBox="0 0 100 100" class="ring-svg" role="img" :aria-label="ariaLabel(route)">
              <circle cx="50" cy="50" :r="RADIUS" fill="transparent" stroke="#e8edf5" stroke-width="12" />
              <template v-if="hasData && route.total">
                <circle
                  v-if="route.inProgress"
                  class="arc-in-progress"
                  cx="50"
                  cy="50"
                  :r="RADIUS"
                  fill="transparent"
                  stroke-width="12"
                  :stroke-dasharray="`${arcs(route).inProgress} ${CIRCUMFERENCE}`"
                  :stroke-dashoffset="-arcs(route).completed"
                />
                <circle
                  v-if="route.completed"
                  class="arc-completed"
                  cx="50"
                  cy="50"
                  :r="RADIUS"
                  fill="transparent"
                  stroke-width="12"
                  :stroke-dasharray="`${arcs(route).completed} ${CIRCUMFERENCE}`"
                />
              </template>
            </svg>
            <div class="ring-text">
              <span class="ring-percentage">{{ hasData && route.total ? `${route.percentCompleted}%` : '—' }}</span>
              <span class="ring-label">Completado</span>
            </div>
          </div>

          <h3 class="ring-name">{{ route.name }}</h3>
          <p v-if="routeDescriptions[route.id]" class="ring-description">{{ routeDescriptions[route.id] }}</p>

          <p v-if="!route.total" class="ring-empty">Sin ejercicios disponibles</p>
          <p v-else-if="!hasData" class="ring-empty">{{ route.total }} ejercicios disponibles</p>
          <ul v-else class="legend">
            <li><span class="dot dot-completed"></span>Completadas<strong>{{ route.completed }}</strong></li>
            <li><span class="dot dot-in-progress"></span>En progreso<strong>{{ route.inProgress }}</strong></li>
            <li><span class="dot dot-pending"></span>Pendientes<strong>{{ route.pending }}</strong></li>
          </ul>
        </article>
      </div>

      <p v-if="!progress.routes.length" class="route-note">Todavía no hay rutas de aprendizaje disponibles.</p>
      <p v-else-if="!hasData" class="route-note">
        Aún no recibimos ejercicios de la app. Cuando complete letras o números, el avance aparecerá aquí.
      </p>
    </template>

    <button type="button" class="btn-route-action" @click="navigateTo('/activities')">
      <span>Ver ruta completa</span>
      <i class="pi pi-arrow-right"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
$color-text-dark: #1e293b;
$color-text-body: #334155;

.progress-route-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.route-card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: $color-text-dark;
  margin: 0;
  letter-spacing: -0.01em;
}

.route-note {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.4;
  color: #64748b;
  text-align: center;

  &.is-error {
    color: #b91c1c;
  }
}

.rings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.ring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.ring-graphic {
  position: relative;
  width: 112px;
  height: 112px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);

  .arc-completed {
    stroke: #4f46e5;
  }

  .arc-in-progress {
    stroke: #38bdf8;
  }
}

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .ring-percentage {
    font-size: 1.45rem;
    font-weight: 900;
    color: $color-text-dark;
    line-height: 1;
  }

  .ring-label {
    margin-top: 0.15rem;
    font-size: 0.66rem;
    font-weight: 600;
    color: #94a3b8;
  }
}

.ring-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: $color-text-body;
}

.ring-description {
  margin: -0.3rem 0 0;
  font-size: 0.7rem;
  line-height: 1.25;
  color: #94a3b8;
  text-align: center;
}

.ring-empty {
  margin: 0;
  font-size: 0.76rem;
  color: #94a3b8;
  text-align: center;
}

.legend {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  li {
    display: flex;
    align-items: center;
    font-size: 0.78rem;
    color: #64748b;
  }

  strong {
    margin-left: auto;
    color: $color-text-dark;
    font-weight: 800;
  }

  .dot {
    flex: none;
    width: 8px;
    height: 8px;
    margin-right: 0.4rem;
    border-radius: 50%;
  }

  .dot-completed {
    background: #4f46e5;
  }

  .dot-in-progress {
    background: #38bdf8;
  }

  .dot-pending {
    background: #cbd5e1;
  }
}

.btn-route-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 16px -3px rgba(79, 70, 229, 0.4);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
    transform: translateY(-1px);
  }
}
</style>
