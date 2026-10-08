<script setup lang="ts">
// Tarjeta del dashboard del tutor / adulto: estado de conexión de la app de Unity
const { status, loading, error, liveDurationSeconds, liveTodaySeconds } = useAppPresence()

const isOnline = computed(() => status.value?.isOnline === true)

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, '0')} min`
  if (minutes > 0) return `${minutes} min ${String(seconds).padStart(2, '0')} s`
  return `${seconds} s`
}

const formatTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '—'

// "hoy a las 3:40 p. m." / "ayer a las…" / "6 oct a las…"
const formatWhen = (iso?: string | null) => {
  if (!iso) return '—'
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  const time = formatTime(iso)
  if (sameDay(date, today)) return `hoy a las ${time}`
  if (sameDay(date, yesterday)) return `ayer a las ${time}`
  return `${date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} a las ${time}`
}

const endReasonLabel: Record<string, string> = {
  app_closed: 'cerró la app',
  logout: 'cerró sesión',
  timeout: 'sin señal de la app',
}

const playingStudent = computed(() => {
  const student = status.value?.current?.student ?? status.value?.lastSession?.student
  return student ? `${student.firstName} ${student.lastName}`.trim() : null
})
</script>

<template>
  <article class="kpi-card connection-card" :class="isOnline ? 'is-online' : 'is-offline'" aria-live="polite">
    <div class="kpi-top">
      <div class="kpi-icon-wrap connection-icon">
        <i class="pi pi-mobile"></i>
      </div>
      <span class="kpi-title">Conexión a la app</span>
      <span v-if="status" class="status-pill">
        <span class="status-dot" aria-hidden="true"></span>
        {{ isOnline ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <div v-if="loading" class="connection-body muted">Consultando estado…</div>

    <div v-else-if="error && !status" class="connection-body error">{{ error }}</div>

    <!-- Conectado: desde qué hora y cuánto tiempo lleva -->
    <div v-else-if="status && status.current" class="connection-body">
      <span class="kpi-value live-duration">{{ formatDuration(liveDurationSeconds) }}</span>
      <p class="detail">
        En la app desde las <strong>{{ formatTime(status.current.startedAt) }}</strong>
        <template v-if="playingStudent"> · {{ playingStudent }}</template>
      </p>
      <p class="detail muted">Hoy: {{ formatDuration(liveTodaySeconds) }} en {{ status.today.sessionsCount }} {{ status.today.sessionsCount === 1 ? 'sesión' : 'sesiones' }}</p>
    </div>

    <!-- Desconectado: cuándo se desconectó y cuánto duró -->
    <div v-else-if="status && status.lastSession" class="connection-body">
      <span class="kpi-value">Fuera de la app</span>
      <p class="detail">
        Se desconectó <strong>{{ formatWhen(status.lastSession.endedAt) }}</strong>
        <template v-if="status.lastSession.endReason"> ({{ endReasonLabel[status.lastSession.endReason] }})</template>
      </p>
      <p class="detail muted">
        Estuvo conectado {{ formatDuration(status.lastSession.durationSeconds) }}, desde las {{ formatTime(status.lastSession.startedAt) }}
      </p>
    </div>

    <!-- Nunca ha ingresado a la app -->
    <div v-else-if="status" class="connection-body">
      <span class="kpi-value">Sin conexiones</span>
      <p class="detail muted">Aún no se ha ingresado a la app con esta cuenta.</p>
    </div>
  </article>
</template>

<style scoped lang="scss">
// Misma base visual que las tarjetas KPI del dashboard
.kpi-card {
  background: #ffffff;
  border: 1px solid #ffffff;
  border-radius: 20px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(59, 80, 223, 0.08);
  }
}

.kpi-top {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.kpi-icon-wrap {
  flex-shrink: 0;
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
  color: #475569;
  line-height: 1.25;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.live-duration {
  font-variant-numeric: tabular-nums;
}

.status-pill {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
}

.connection-body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-height: 72px;
}

.detail {
  margin: 0;
  font-size: 0.82rem;
  color: #334155;
  line-height: 1.4;
}

.muted {
  color: #64748b;
}

.error {
  color: #b91c1c;
  font-size: 0.82rem;
}

// Activo: verde fluorescente
.is-online {
  border-color: rgba(57, 255, 20, 0.45);

  .connection-icon {
    background: #ecfdf3;
    color: #15803d;
  }

  .status-pill {
    background: #ecfdf3;
    color: #15803d;
  }

  .status-dot {
    background: #39ff14;
    box-shadow: 0 0 6px #39ff14, 0 0 12px rgba(57, 255, 20, 0.7);
    animation: pulse-online 1.6s ease-in-out infinite;
  }
}

// Inactivo: rojo
.is-offline {
  .connection-icon {
    background: #fef2f2;
    color: #b91c1c;
  }

  .status-pill {
    background: #fef2f2;
    color: #b91c1c;
  }

  .status-dot {
    background: #ef4444;
    box-shadow: 0 0 5px rgba(239, 68, 68, 0.6);
  }
}

@keyframes pulse-online {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.25);
    opacity: 0.75;
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-online .status-dot {
    animation: none;
  }
}
</style>
