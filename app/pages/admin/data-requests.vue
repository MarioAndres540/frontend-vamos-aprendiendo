<script setup lang="ts">
// Solicitudes de los titulares (consultas y reclamos, Ley 1581 de 2012): trámite por el super administrador (spec 0004, PD-ADM)
import fondoImg from '~/assets/img/fondo.png'
import type { DataRequestStatus } from '~/utils/privacy'
import type { AdminDataRequest } from '~/composables/usePrivacy'

definePageMeta({
  middleware: 'profile-access',
  allowedProfiles: ['admin'],
})

const { items, loading, error, fetchRequests, updateRequest, executeSuppression } = useAdminDataRequests()

const statusFilter = ref<DataRequestStatus | ''>('')
const load = () => fetchRequests(statusFilter.value)
onMounted(load)
watch(statusFilter, load)

const typeLabels = DATA_REQUEST_TYPE_LABELS
const statusLabels = DATA_REQUEST_STATUS_LABELS
const isOpen = (r: AdminDataRequest) => r.status === 'radicada' || r.status === 'en_tramite'
const isSuppression = (r: AdminDataRequest) => r.request_type === 'supresion' || r.request_type === 'revocatoria'

const openCount = computed(() => items.value.filter(isOpen).length)
const overdueCount = computed(() => items.value.filter((r) => r.overdue).length)

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ----------------------------------------------------
// Gestión de una solicitud
// ----------------------------------------------------
const selectedId = ref<string | null>(null)
const selected = computed(() => items.value.find((r) => r.id === selectedId.value) ?? null)
const form = reactive({ status: 'en_tramite' as DataRequestStatus, response: '' })
const saving = ref(false)
const actionError = ref<string | null>(null)
const notice = ref<string | null>(null)
const confirmText = ref('')
const CONFIRM_WORD = 'SUPRIMIR'

const select = (r: AdminDataRequest) => {
  selectedId.value = selectedId.value === r.id ? null : r.id
  form.status = r.status === 'radicada' ? 'en_tramite' : r.status
  form.response = r.response ?? ''
  confirmText.value = ''
  actionError.value = null
}

const save = async () => {
  if (!selected.value) return
  saving.value = true
  actionError.value = null
  try {
    await updateRequest(selected.value.id, { status: form.status, response: form.response.trim() || undefined })
    notice.value = 'Solicitud actualizada.'
    selectedId.value = null
    await load()
  } catch (err: any) {
    actionError.value = err?.message
  } finally {
    saving.value = false
  }
}

const suppress = async () => {
  if (!selected.value || confirmText.value !== CONFIRM_WORD) return
  saving.value = true
  actionError.value = null
  try {
    const result = await executeSuppression(selected.value.id)
    notice.value = result.authClosed
      ? 'Supresión ejecutada y respuesta enviada al titular.'
      : 'Supresión ejecutada, pero no se pudo cerrar el acceso de la cuenta en Auth. Revisa los logs del backend.'
    selectedId.value = null
    await load()
  } catch (err: any) {
    actionError.value = err?.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="panel-page" :style="{ backgroundImage: `url(${fondoImg})` }">
    <LayoutPanelHeader badge="Super administrador" />

    <main class="panel-content">
      <section class="welcome">
        <NuxtLink to="/admin" class="back-link"><i class="pi pi-arrow-left"></i> Volver al panel</NuxtLink>
        <h1 class="welcome-title">Solicitudes de datos personales</h1>
        <p class="welcome-text">
          Consultas y reclamos de los titulares (Ley 1581). Consultas: 10 días hábiles; reclamos: 15 días hábiles.
        </p>
      </section>

      <section class="stats-grid" aria-label="Resumen">
        <article class="stat-card">
          <span class="stat-icon tone-blue"><i class="pi pi-inbox"></i></span>
          <div class="stat-body">
            <span class="stat-label">Abiertas</span>
            <strong class="stat-value">{{ openCount }}</strong>
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-icon tone-orange"><i class="pi pi-exclamation-triangle"></i></span>
          <div class="stat-body">
            <span class="stat-label">Vencidas</span>
            <strong class="stat-value">{{ overdueCount }}</strong>
          </div>
        </article>
      </section>

      <p v-if="notice" class="notice" role="status"><i class="pi pi-check-circle"></i> {{ notice }}</p>

      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Solicitudes</h2>
            <p class="card-subtitle">Ordenadas por fecha de vencimiento.</p>
          </div>
          <div class="toolbar">
            <label class="select-field">
              <i class="pi pi-filter"></i>
              <select v-model="statusFilter" aria-label="Filtrar por estado">
                <option value="">Todos los estados</option>
                <option v-for="(label, value) in statusLabels" :key="value" :value="value">{{ label }}</option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="error" class="state-card error" role="alert">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ error }}</span>
          <button type="button" class="retry-button" @click="load">Reintentar</button>
        </div>
        <div v-else-if="loading && items.length === 0" class="state-card">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Cargando solicitudes…</span>
        </div>
        <p v-else-if="items.length === 0" class="empty-state">No hay solicitudes con este filtro.</p>

        <div v-else class="table-wrapper" :aria-busy="loading">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Titular</th>
                <th scope="col">Tipo</th>
                <th scope="col">Estado</th>
                <th scope="col">Radicada</th>
                <th scope="col">Vence</th>
                <th scope="col"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="r in items" :key="r.id">
                <tr>
                  <td>
                    <span class="person">
                      <span>
                        {{ r.titular ? `${r.titular.first_name} ${r.titular.last_name}` : 'Titular' }}
                        <span class="person-detail">{{ r.titular?.email }}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    {{ typeLabels[r.request_type] }}
                    <span v-if="r.student_id" class="person-detail">Sobre un menor</span>
                  </td>
                  <td><span class="pill" :class="`req-${r.status}`">{{ statusLabels[r.status] }}</span></td>
                  <td>{{ formatDate(r.created_at) }}</td>
                  <td :class="{ overdue: r.overdue }">
                    {{ formatDate(r.due_at) }}
                    <span v-if="r.overdue" class="person-detail overdue">Vencida</span>
                  </td>
                  <td>
                    <button type="button" class="page-button" :aria-expanded="selectedId === r.id" @click="select(r)">
                      {{ selectedId === r.id ? 'Cerrar' : 'Gestionar' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="selectedId === r.id" class="detail-row">
                  <td colspan="6">
                    <div class="detail">
                      <p class="detail-description"><strong>Solicitud:</strong> {{ r.description }}</p>

                      <div v-if="isOpen(r)" class="detail-form">
                        <label class="detail-field">
                          <span>Estado</span>
                          <select v-model="form.status">
                            <option value="en_tramite">En trámite</option>
                            <option value="resuelta">Resuelta</option>
                            <option value="rechazada">Rechazada</option>
                          </select>
                        </label>
                        <label class="detail-field wide">
                          <span>Respuesta al titular {{ form.status === 'en_tramite' ? '(opcional)' : '(obligatoria)' }}</span>
                          <textarea v-model="form.response" rows="3" maxlength="4000"></textarea>
                        </label>
                        <button type="button" class="page-button primary" :disabled="saving" @click="save">
                          <i v-if="saving" class="pi pi-spin pi-spinner"></i> Guardar
                        </button>
                      </div>
                      <p v-else-if="r.response" class="detail-description"><strong>Respuesta:</strong> {{ r.response }}</p>

                      <!-- Supresión: borra los datos del ecosistema del titular (spec 0004, PD-ADM-03) -->
                      <div v-if="isOpen(r) && isSuppression(r)" class="danger-zone">
                        <p>
                          <strong>Ejecutar supresión.</strong>
                          {{
                            r.student_id
                              ? 'Borra los datos del menor en el espacio de este titular y su vínculo. Si el menor no tiene otro tutor, colegio ni cuenta propia, se borra.'
                              : 'Borra los datos del espacio del titular y de sus menores, anonimiza la cuenta y la desactiva. Los espacios de otros tutores y del colegio no se modifican.'
                          }}
                          No se puede deshacer.
                        </p>
                        <label class="detail-field">
                          <span>Escribe {{ CONFIRM_WORD }} para confirmar</span>
                          <input v-model="confirmText" type="text" autocomplete="off" />
                        </label>
                        <button
                          type="button"
                          class="page-button danger"
                          :disabled="saving || confirmText !== CONFIRM_WORD"
                          @click="suppress"
                        >
                          Ejecutar supresión
                        </button>
                      </div>

                      <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/scss/panel' as *;

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4f46e5;
  text-decoration: none;
}

.notice {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
}

.req-radicada {
  background: #e0e7ff;
  color: #3730a3;
}

.req-en_tramite {
  background: #fef3c7;
  color: #92400e;
}

.req-resuelta {
  background: #dcfce7;
  color: #166534;
}

.req-rechazada {
  background: #f1f5f9;
  color: #475569;
}

.overdue {
  color: #b91c1c;
  font-weight: 700;
}

.detail-row td {
  background: #f8fafc;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.5rem 0;
  white-space: normal;
}

.detail-description {
  margin: 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.detail-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;

  &.wide {
    flex: 1 1 320px;
  }

  select,
  input,
  textarea {
    font: inherit;
    font-weight: 400;
    padding: 0.5rem 0.65rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
  }
}

.danger-zone {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #7f1d1d;

  p {
    flex: 1 1 100%;
    margin: 0;
  }
}

.page-button.primary {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
}

.page-button.danger {
  background: #dc2626;
  color: #fff;
  border-color: #dc2626;
}

.action-error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.85rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
