<script setup lang="ts">
// Privacidad y mis datos: autorizaciones, descarga de datos y solicitudes del titular (Ley 1581 de 2012, spec 0004)
import type { DataRequestType } from '~/utils/privacy'

definePageMeta({
  layout: 'user-panel',
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const { profileType } = useAuth()
const { consents, requests, loading, error, load, setSensitiveConsent, createRequest, downloadMyData } = usePrivacy()
const { students, fetchStudents } = useMyStudents()

const isTutor = computed(() => profileType.value === 'tutor')

onMounted(() => {
  load()
  if (isTutor.value) fetchStudents(true)
})

const notice = ref<string | null>(null)
const showNotice = (message: string) => {
  notice.value = message
  setTimeout(() => (notice.value = null), 6000)
}

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// ----------------------------------------------------
// Autorización de datos sensibles (la única facultativa)
// ----------------------------------------------------
const sensitiveGranted = computed(() => consents.value?.sensitiveData?.granted === true)
const consentSaving = ref(false)
const consentError = ref<string | null>(null)
const confirmingRevoke = ref(false)

const toggleSensitive = async (granted: boolean) => {
  consentSaving.value = true
  consentError.value = null
  try {
    const result = await setSensitiveConsent(granted)
    confirmingRevoke.value = false
    showNotice(
      granted
        ? 'Autorizaste el tratamiento de datos sensibles.'
        : `Revocaste la autorización. Borramos ${result.deletedAssessments} evaluación(es) inicial(es).`,
    )
  } catch (err: any) {
    consentError.value = err?.message
  } finally {
    consentSaving.value = false
  }
}

// ----------------------------------------------------
// Descargar mis datos (derecho de acceso)
// ----------------------------------------------------
const downloading = ref(false)
const downloadError = ref<string | null>(null)
const download = async () => {
  downloading.value = true
  downloadError.value = null
  try {
    await downloadMyData()
  } catch (err: any) {
    downloadError.value = err?.message
  } finally {
    downloading.value = false
  }
}

// ----------------------------------------------------
// Radicar una solicitud
// ----------------------------------------------------
const requestForm = reactive({ type: 'consulta' as DataRequestType, studentId: '', description: '' })
const requestSaving = ref(false)
const requestError = ref<string | null>(null)
const selectedTypeHelp = computed(() => DATA_REQUEST_TYPES.find((t) => t.value === requestForm.type)?.help ?? '')
const requestTypes = DATA_REQUEST_TYPES
const typeLabels = DATA_REQUEST_TYPE_LABELS
const statusLabels = DATA_REQUEST_STATUS_LABELS

const studentName = (id: string | null) => {
  if (!id) return null
  const s = students.value.find((st) => st.id === id)
  return s ? `${s.firstName} ${s.lastName}` : 'Menor'
}

const submitRequest = async () => {
  requestError.value = null
  if (requestForm.description.trim().length < 10) {
    requestError.value = 'Describe tu solicitud en al menos 10 caracteres.'
    return
  }
  requestSaving.value = true
  try {
    const created = await createRequest({
      type: requestForm.type,
      studentId: requestForm.studentId || undefined,
      description: requestForm.description.trim(),
    })
    requestForm.description = ''
    requestForm.studentId = ''
    showNotice(`Radicamos tu solicitud. Te responderemos a más tardar el ${formatDate(created.due_at)}.`)
  } catch (err: any) {
    requestError.value = err?.message
  } finally {
    requestSaving.value = false
  }
}
</script>

<template>
  <main class="privacy-body">
    <div class="page-title-row">
      <h1 class="page-title">Privacidad y mis datos</h1>
      <p class="page-subtitle">
        Tus autorizaciones y tus derechos sobre tus datos{{ isTutor ? ' y los de los menores a tu cargo' : '' }}.
        <NuxtLink to="/data-policy" target="_blank">Ver la política de tratamiento de datos</NuxtLink>
      </p>
    </div>

    <p v-if="notice" class="notice" role="status"><i class="pi pi-check-circle"></i> {{ notice }}</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <div class="privacy-grid">
      <!-- Autorizaciones -->
      <section class="card" aria-labelledby="consents-title">
        <h2 id="consents-title" class="card-title">Mis autorizaciones</h2>
        <p v-if="loading" class="muted"><i class="pi pi-spin pi-spinner"></i> Cargando…</p>
        <ul v-else class="consent-list">
          <li>
            <div>
              <strong>Tratamiento de datos personales</strong>
              <span class="muted">Obligatoria para prestar el servicio</span>
            </div>
            <span class="pill" :class="consents?.dataProcessing?.granted ? 'pill-ok' : 'pill-off'">
              {{ consents?.dataProcessing?.granted ? `Otorgada · ${formatDate(consents?.dataProcessing?.grantedAt)}` : 'Sin registro' }}
            </span>
          </li>
          <li v-if="isTutor">
            <div>
              <strong>Datos de menores</strong>
              <span class="muted">Como representante legal</span>
            </div>
            <span class="pill pill-ok">{{ consents?.minorsData.filter((m) => m.granted).length ?? 0 }} menor(es)</span>
          </li>
          <li>
            <div>
              <strong>Datos sensibles</strong>
              <span class="muted">Evaluación inicial. Opcional</span>
            </div>
            <span class="pill" :class="sensitiveGranted ? 'pill-ok' : 'pill-off'">
              {{ sensitiveGranted ? 'Otorgada' : 'No otorgada' }}
            </span>
          </li>
        </ul>

        <div v-if="!loading" class="consent-actions">
          <button
            v-if="!sensitiveGranted"
            type="button"
            class="btn-primary"
            :disabled="consentSaving"
            @click="toggleSensitive(true)"
          >
            Autorizar datos sensibles
          </button>
          <template v-else>
            <button
              v-if="!confirmingRevoke"
              type="button"
              class="btn-secondary"
              :disabled="consentSaving"
              @click="confirmingRevoke = true"
            >
              Revocar datos sensibles
            </button>
            <div v-else class="confirm-box" role="alertdialog" aria-labelledby="revoke-title">
              <p id="revoke-title">
                Se borrarán las evaluaciones iniciales que hiciste{{ isTutor ? ', incluidas las de tus menores' : '' }}.
                Esta acción no se puede deshacer.
              </p>
              <div class="confirm-actions">
                <button type="button" class="btn-danger" :disabled="consentSaving" @click="toggleSensitive(false)">
                  <i v-if="consentSaving" class="pi pi-spin pi-spinner"></i> Sí, revocar y borrar
                </button>
                <button type="button" class="btn-secondary" :disabled="consentSaving" @click="confirmingRevoke = false">
                  Cancelar
                </button>
              </div>
            </div>
          </template>
        </div>
        <p v-if="consentError" class="error" role="alert">{{ consentError }}</p>
        <p class="hint">
          Las autorizaciones obligatorias se revocan radicando una solicitud de revocatoria o supresión.
        </p>
      </section>

      <!-- Descargar mis datos -->
      <section class="card" aria-labelledby="download-title">
        <h2 id="download-title" class="card-title">Descargar mis datos</h2>
        <p>
          Descarga un archivo con tus datos{{ isTutor ? ', los de los menores a tu cargo' : '' }}, tus autorizaciones y el
          progreso registrado en tu espacio.
        </p>
        <button type="button" class="btn-primary" :disabled="downloading" @click="download">
          <i class="pi" :class="downloading ? 'pi-spin pi-spinner' : 'pi-download'"></i> Descargar (JSON)
        </button>
        <p v-if="downloadError" class="error" role="alert">{{ downloadError }}</p>
      </section>

      <!-- Radicar solicitud -->
      <section class="card wide" aria-labelledby="request-title">
        <h2 id="request-title" class="card-title">Radicar una solicitud</h2>
        <form class="request-form" novalidate @submit.prevent="submitRequest">
          <div class="field">
            <label for="request-type">Tipo de solicitud</label>
            <select id="request-type" v-model="requestForm.type" class="field-input">
              <option v-for="t in requestTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <small class="hint">{{ selectedTypeHelp }}</small>
          </div>
          <div v-if="isTutor && students.length" class="field">
            <label for="request-student">¿Sobre quién?</label>
            <select id="request-student" v-model="requestForm.studentId" class="field-input">
              <option value="">Sobre mí (toda mi cuenta)</option>
              <option v-for="s in students" :key="s.id" :value="s.id">{{ s.firstName }} {{ s.lastName }}</option>
            </select>
          </div>
          <div class="field full">
            <label for="request-description">Descripción</label>
            <textarea
              id="request-description"
              v-model="requestForm.description"
              class="field-input"
              rows="4"
              maxlength="2000"
              placeholder="Cuéntanos qué necesitas"
            ></textarea>
          </div>
          <p v-if="requestForm.type === 'supresion' || requestForm.type === 'revocatoria'" class="warning full">
            La supresión borra los datos de tu espacio{{ requestForm.studentId ? ' con este menor' : ' y anonimiza tu cuenta, que quedará inactiva' }}.
            Si el menor también está registrado con otro tutor o con su colegio, esos espacios no se modifican.
          </p>
          <p v-if="requestError" class="error full" role="alert">{{ requestError }}</p>
          <div class="full">
            <button type="submit" class="btn-primary" :disabled="requestSaving">
              <i v-if="requestSaving" class="pi pi-spin pi-spinner"></i> Radicar solicitud
            </button>
          </div>
        </form>
      </section>

      <!-- Mis solicitudes -->
      <section class="card wide" aria-labelledby="requests-title">
        <h2 id="requests-title" class="card-title">Mis solicitudes</h2>
        <p v-if="!loading && requests.length === 0" class="muted">Aún no has radicado solicitudes.</p>
        <ul v-else class="request-list">
          <li v-for="r in requests" :key="r.id" class="request-item">
            <div class="request-head">
              <strong>{{ typeLabels[r.request_type] }}</strong>
              <span v-if="studentName(r.student_id)" class="muted">· {{ studentName(r.student_id) }}</span>
              <span class="pill" :class="`status-${r.status}`">{{ statusLabels[r.status] }}</span>
            </div>
            <p class="muted small">
              Radicada el {{ formatDate(r.created_at) }} · Respuesta a más tardar el {{ formatDate(r.due_at) }}
            </p>
            <p class="request-description">{{ r.description }}</p>
            <p v-if="r.response" class="request-response"><strong>Respuesta:</strong> {{ r.response }}</p>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<style lang="scss" scoped>
$indigo: #4f46e5;
$text-dark: #1e293b;
$muted: #64748b;
$border: #e2e8f0;

.privacy-body {
  padding: 1.75rem 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem;
  }
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: $text-dark;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: $muted;

  a {
    color: $indigo;
    font-weight: 600;
    margin-left: 4px;
  }
}

.privacy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.card {
  background: #fff;
  border: 1px solid $border;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  color: #334155;
  font-size: 0.92rem;
  line-height: 1.55;
  min-width: 0;

  &.wide {
    grid-column: 1 / -1;
  }

  p {
    margin: 0 0 0.75rem;
  }
}

.card-title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: $text-dark;
}

.consent-list {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;

    div {
      display: flex;
      flex-direction: column;
    }
  }
}

.muted {
  color: $muted;
  font-size: 0.85rem;
}

.small {
  font-size: 0.8rem;
}

.hint {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: $muted;
}

.pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.pill-ok,
.status-resuelta {
  background: #dcfce7;
  color: #166534;
}

.pill-off,
.status-rechazada {
  background: #f1f5f9;
  color: #475569;
}

.status-radicada {
  background: #e0e7ff;
  color: #3730a3;
}

.status-en_tramite {
  background: #fef3c7;
  color: #92400e;
}

.consent-actions,
.confirm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.confirm-box {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1.1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid transparent;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: $indigo;
  color: #fff;
}

.btn-secondary {
  background: #fff;
  color: $text-dark;
  border-color: $border;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
}

.request-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }

  .full {
    grid-column: 1 / -1;
    margin: 0;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-weight: 600;
    font-size: 0.85rem;
    color: $text-dark;
  }

  .hint {
    margin-top: 0;
  }
}

.field-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid $border;
  border-radius: 10px;
  font: inherit;
  color: $text-dark;
  background: #fff;

  &:focus {
    outline: 2px solid rgba($indigo, 0.35);
    border-color: $indigo;
  }
}

textarea.field-input {
  resize: vertical;
}

.warning {
  padding: 10px 14px;
  border-radius: 10px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  font-size: 0.85rem;
}

.request-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-item {
  padding: 0.9rem 1rem;
  border: 1px solid $border;
  border-radius: 14px;

  p {
    margin: 0.25rem 0 0;
  }
}

.request-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;

  .pill {
    margin-left: auto;
  }
}

.request-description {
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.request-response {
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  background: #f8fafc;
}

.notice {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
}

.error {
  margin: 0.75rem 0 0;
  color: #b91c1c;
  font-size: 0.85rem;
}
</style>
