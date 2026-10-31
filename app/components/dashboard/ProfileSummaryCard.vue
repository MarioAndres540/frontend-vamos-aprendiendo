<script setup lang="ts">
import { areaLabel, RISK_LABELS, summarizeAreas } from '~/utils/assessment-areas'
import type { StudentAssessmentSummary } from '~/composables/useMyStudents'

// Reemplaza "Perfil destacado" (pensado para profesores): el tutor ve al hijo elegido en el menú de su cuenta
// y el adulto o tester su propio formulario
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
const { assessment: ownAssessment, loading: ownLoading, error: ownError, fetchLatest } = useMyLatestAssessment()

// force: al volver al dashboard (ej. después de llenar el formulario de un hijo) se trae la información actualizada
onMounted(() => (isTutor.value ? fetchStudents(true) : fetchLatest()))

// Hasta la primera carga de la lista no se sabe si el tutor tiene hijos (evita "Aún no tienes…" por un instante)
const loading = computed(() =>
  isTutor.value
    ? (!studentsLoaded.value && !studentsError.value) ||
      (studentsLoading.value && !selected.value) ||
      selectingId.value !== null
    : ownLoading.value,
)
const error = computed(() => (isTutor.value ? studentsError.value : ownError.value))

const ownName = computed(() => titleCase(firstName.value || user.value?.firstName || '') || 'Tu perfil')

const person = computed(() => {
  if (isTutor.value) {
    const s = selected.value
    if (!s) return null
    const details = [s.grade, s.age != null ? `${s.age} años` : null].filter(Boolean).join(' · ')
    return {
      id: s.id,
      name: titleCase(`${s.firstName} ${s.lastName}`),
      firstName: titleCase(s.firstName),
      details,
      institution: s.institution?.name ?? 'Sin colegio asignado',
      assessment: s.latestAssessment,
    }
  }
  return {
    id: null,
    name: ownName.value,
    firstName: ownName.value,
    details: '',
    institution: null,
    assessment: ownAssessment.value,
  }
})

const areas = computed(() => {
  const assessment: StudentAssessmentSummary | null | undefined = person.value?.assessment
  return assessment ? summarizeAreas(assessment.answers, assessment.primaryCondition) : null
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <div class="dashboard-card profile-summary-card">
    <div class="card-header-row">
      <h2 class="card-title">{{ isTutor ? 'Tutor de' : 'Mi perfil' }}</h2>
      <span v-if="isTutor && students.length > 1" class="count-pill">{{ students.length }} hijos</span>
    </div>

    <p v-if="loading" class="muted">Cargando información…</p>

    <p v-else-if="error" class="error">{{ error }}</p>

    <p v-else-if="isTutor && students.length === 0" class="muted">
      Aún no tienes estudiantes vinculados a tu cuenta.
    </p>

    <template v-else-if="person">
      <div class="person-badge">
        <div class="person-avatar" aria-hidden="true">{{ initials(person.name) }}</div>
        <div class="person-info">
          <h3 class="person-name">{{ person.name }}</h3>
          <span v-if="person.details" class="person-details">{{ person.details }}</span>
          <span v-if="person.institution" class="person-institution">
            <i class="pi pi-building"></i> {{ person.institution }}
          </span>
        </div>
      </div>

      <div v-if="person.assessment && areas" class="assessment-block">
        <div class="assessment-header">
          <span class="skills-label">Formulario inicial</span>
          <span class="risk-pill" :class="`risk-${person.assessment.riskLevel}`">
            {{ RISK_LABELS[person.assessment.riskLevel] }}
          </span>
        </div>
        <p class="assessment-meta">
          {{ formatDate(person.assessment.createdAt) }}
          <template v-if="person.assessment.riskLevel !== 'bajo'">
            · Enfoque: <strong>{{ areaLabel(person.assessment.primaryCondition) }}</strong>
          </template>
        </p>

        <span class="skills-label">Fortalezas</span>
        <div v-if="areas.strengths.length" class="chips-row">
          <span v-for="area in areas.strengths" :key="area.dimension" class="skill-chip chip-green">
            <img :src="area.icon" alt="" class="chip-icon" /> {{ area.label }}
          </span>
        </div>
        <p v-else class="muted small">Aún no se destacan áreas fuertes.</p>

        <span class="skills-label">A mejorar</span>
        <div v-if="areas.toImprove.length" class="chips-row">
          <span v-for="area in areas.toImprove" :key="area.dimension" class="skill-chip chip-amber">
            <img :src="area.icon" alt="" class="chip-icon" /> {{ area.label }}
          </span>
        </div>
        <p v-else class="muted small">No hay áreas que requieran refuerzo.</p>
      </div>

      <div v-else class="no-assessment">
        <p class="muted">
          {{ isTutor ? `Aún no hay formulario inicial de ${person.firstName}.` : 'Aún no has completado el formulario inicial.' }}
        </p>
        <NuxtLink
          v-if="isTutor && person.id"
          :to="{ path: ROUTES.initialAssessment, query: { studentId: person.id } }"
          class="assessment-link"
        >
          Hacer formulario inicial <i class="pi pi-arrow-right"></i>
        </NuxtLink>
      </div>

      <p v-if="isTutor && students.length > 1" class="switch-hint">
        <i class="pi pi-info-circle"></i> Elige otro hijo desde el menú de tu cuenta.
      </p>
    </template>
  </div>
</template>

<style scoped lang="scss">
// Misma base visual que las tarjetas del dashboard
.dashboard-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ffffff;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1.1rem;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.01em;
}

.count-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.no-assessment {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
}

.assessment-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 9999px;
  background: #4f46e5;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: #4338ca;
  }

  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
}

.switch-hint {
  margin: auto 0 0;
  padding-top: 1rem;
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.person-badge {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
}

.person-avatar {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff, #f5f3ff);
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
}

.person-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.person-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  overflow-wrap: anywhere;
}

.person-details {
  font-size: 0.8rem;
  font-weight: 700;
  color: #10b981;
}

.person-institution {
  font-size: 0.78rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  i {
    font-size: 0.75rem;
  }
}

.assessment-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.assessment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.assessment-meta {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  color: #64748b;
}

.skills-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.risk-pill {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  white-space: nowrap;

  &.risk-bajo { background: #f0fdf4; color: #15803d; }
  &.risk-moderado { background: #fffbeb; color: #b45309; }
  &.risk-alto { background: #fef2f2; color: #b91c1c; }
}

.chips-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.skill-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;

  &.chip-green { background: #f0fdf4; color: #16a34a; }
  &.chip-amber { background: #fffbeb; color: #d97706; }
}

.chip-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.muted {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;

  &.small {
    font-size: 0.78rem;
  }
}

.error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.85rem;
}
</style>
