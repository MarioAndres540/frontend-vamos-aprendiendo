<script setup lang="ts">
// Configuración de la cuenta: datos del tutor (o adulto / tester) y, para el tutor, sus hijos o menores a cargo
definePageMeta({
  layout: 'user-panel',
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const { profileType } = useAuth()
const { profile, loading: profileLoading, error: profileError, fetchProfile, updateProfile, updateEmail } = useProfile()
const {
  students,
  loaded: studentsLoaded,
  loading: studentsLoading,
  error: studentsError,
  fetchStudents,
  createStudent,
} = useMyStudents()
const { institutions, fetchInstitutions } = useInstitutions()

const isTutor = computed(() => profileType.value === 'tutor')

onMounted(() => {
  fetchProfile()
  if (isTutor.value) fetchStudents(true)
})

// Aviso de éxito que se lee con lector de pantalla (aria-live)
const notice = ref<string | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | undefined
const showNotice = (message: string) => {
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => (notice.value = null), 5000)
}
onBeforeUnmount(() => clearTimeout(noticeTimer))

// ----------------------------------------------------
// Mis datos: teléfono, tipo de documento y correo
// ----------------------------------------------------
type EditableField = 'documentType' | 'phone' | 'email'
const editing = ref<EditableField | null>(null)
const saving = ref(false)
const fieldError = ref<string | null>(null)
const edit = reactive({ documentType: '', phone: '', email: '', currentPassword: '' })

// Tipos de documento de un adulto; si el perfil tiene otro (ej. TI de un tester) también se ofrece
const adultDocumentTypes = computed(() => {
  const current = profile.value?.documentType
  return current && !DOCUMENT_TYPES_ADULT.some((t) => t.value === current)
    ? [...DOCUMENT_TYPES_ADULT, { value: current, label: documentTypeLabel(current) }]
    : DOCUMENT_TYPES_ADULT
})

const startEdit = (field: EditableField) => {
  if (!profile.value) return
  fieldError.value = null
  edit.documentType = profile.value.documentType ?? 'CC'
  edit.phone = profile.value.phone ?? ''
  edit.email = ''
  edit.currentPassword = ''
  editing.value = field
}

const cancelEdit = () => {
  editing.value = null
  fieldError.value = null
}

const saveField = async () => {
  fieldError.value = null

  if (editing.value === 'phone' && !/^\+?[0-9]{7,15}$/.test(edit.phone.trim())) {
    fieldError.value = 'Escribe un teléfono de 7 a 15 dígitos (puede empezar con +).'
    return
  }
  if (editing.value === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edit.email.trim())) {
      fieldError.value = 'Escribe un correo válido.'
      return
    }
    if (!edit.currentPassword) {
      fieldError.value = 'Escribe tu contraseña actual para confirmar el cambio.'
      return
    }
  }

  saving.value = true
  try {
    if (editing.value === 'email') {
      showNotice(await updateEmail(edit.email.trim(), edit.currentPassword))
    } else if (editing.value === 'phone') {
      await updateProfile({ phone: edit.phone.trim() })
      showNotice('Tu teléfono se actualizó.')
    } else if (editing.value === 'documentType') {
      await updateProfile({ documentType: edit.documentType })
      showNotice('Tu tipo de documento se actualizó.')
    }
    editing.value = null
  } catch (err: any) {
    fieldError.value = err?.message || 'No pudimos guardar el cambio. Intenta de nuevo.'
  } finally {
    saving.value = false
    edit.currentPassword = ''
  }
}

// ----------------------------------------------------
// Agregar un hijo o menor
// ----------------------------------------------------
const showAddForm = ref(false)
const addSaving = ref(false)
const addError = ref<string | null>(null)
const todayIso = new Date().toISOString().slice(0, 10)

const emptyChild = () => ({
  firstName: '',
  // Igual que en el registro: el hijo hereda el apellido del tutor (se puede cambiar)
  lastName: profile.value?.lastName ?? '',
  documentType: 'TI',
  documentNumber: '',
  birthDate: '',
  grade: '',
  // '' = "Sin colegio asignado"
  institutionId: '',
})
const child = reactive(emptyChild())
const childAge = computed(() => ageFromBirthDate(child.birthDate))

const openAddForm = async () => {
  Object.assign(child, emptyChild())
  addError.value = null
  showAddForm.value = true
  if (institutions.value.length === 0) await fetchInstitutions()
  await nextTick()
  document.getElementById('child-first-name')?.focus()
}

const closeAddForm = () => {
  showAddForm.value = false
  addError.value = null
}

const submitChild = async () => {
  addError.value = null

  if (child.firstName.trim().length < 2 || child.lastName.trim().length < 2) {
    addError.value = 'Escribe los nombres y apellidos del menor (mínimo 2 letras cada uno).'
    return
  }
  if (child.documentNumber.trim().length < 4) {
    addError.value = 'Escribe el número de documento del menor (mínimo 4 caracteres).'
    return
  }
  const age = childAge.value
  if (age === null) {
    addError.value = 'Escribe la fecha de nacimiento del menor.'
    return
  }
  if (age < CHILD_MIN_AGE || age > CHILD_MAX_AGE) {
    addError.value = `El menor debe tener entre ${CHILD_MIN_AGE} y ${CHILD_MAX_AGE} años (según la fecha de nacimiento tiene ${age}).`
    return
  }

  addSaving.value = true
  try {
    const student = await createStudent({
      firstName: child.firstName.trim(),
      lastName: child.lastName.trim(),
      documentType: child.documentType,
      documentNumber: child.documentNumber.trim(),
      birthDate: child.birthDate,
      age,
      grade: child.grade || undefined,
      institutionId: child.institutionId || undefined,
    })
    // Después de registrarlo se hace su formulario inicial (diagnóstico)
    await navigateTo({ path: ROUTES.initialAssessment, query: { studentId: student.id } })
  } catch (err: any) {
    const message = err?.data?.message
    addError.value = Array.isArray(message)
      ? message.join('. ')
      : message || 'No pudimos registrar al menor. Intenta de nuevo.'
  } finally {
    addSaving.value = false
  }
}

// ----------------------------------------------------
// Carrusel de hijos (solo lo mueve el usuario, sin avance automático)
// ----------------------------------------------------
const currentIndex = ref(0)
const slideDirection = ref<'next' | 'prev'>('next')
const current = computed(() => students.value[currentIndex.value] ?? null)
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < students.value.length - 1)

const showPrev = () => {
  if (!hasPrev.value) return
  slideDirection.value = 'prev'
  currentIndex.value--
}
const showNext = () => {
  if (!hasNext.value) return
  slideDirection.value = 'next'
  currentIndex.value++
}

// Si la lista se acorta (ej. al recargarla) el índice no puede quedar fuera de rango
watch(
  () => students.value.length,
  (length) => {
    if (currentIndex.value > length - 1) currentIndex.value = Math.max(0, length - 1)
  },
)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <main class="settings-body">
    <div class="page-title-row">
      <h1 class="page-title">Configuración</h1>
      <p class="page-subtitle">
        {{ isTutor ? 'Tus datos y los de los menores a tu cargo' : 'Tus datos personales' }}
      </p>
    </div>

    <p v-if="notice" class="notice" role="status">
      <i class="pi pi-check-circle"></i> {{ notice }}
    </p>

    <!-- Mis datos y, al frente, los hijos o menores a cargo (en pantallas angostas, una debajo de la otra) -->
    <div class="settings-grid" :class="{ single: !isTutor }">
      <section class="settings-card" aria-labelledby="my-data-title">
        <h2 id="my-data-title" class="card-title">Mis datos</h2>

        <p v-if="profileLoading && !profile" class="muted">Cargando tus datos…</p>
        <p v-else-if="profileError && !profile" class="error">{{ profileError }}</p>

        <dl v-else-if="profile" class="data-grid">
          <div class="data-item">
            <dt>Nombres</dt>
            <dd>{{ titleCase(profile.firstName) || '—' }}</dd>
          </div>
          <div class="data-item">
            <dt>Apellidos</dt>
            <dd>{{ titleCase(profile.lastName) || '—' }}</dd>
          </div>

          <!-- Tipo de documento (editable) -->
          <div class="data-item">
            <dt>Tipo de documento</dt>
            <dd v-if="editing !== 'documentType'" class="with-action">
              <span>{{ documentTypeLabel(profile.documentType) }}</span>
              <button type="button" class="link-button" :disabled="editing !== null" @click="startEdit('documentType')">
                Cambiar
              </button>
            </dd>
            <dd v-else>
              <form class="inline-form" @submit.prevent="saveField">
                <label class="sr-only" for="edit-document-type">Tipo de documento</label>
                <select id="edit-document-type" v-model="edit.documentType" class="field-input">
                  <option v-for="t in adultDocumentTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
                <div class="form-actions">
                  <button type="submit" class="btn-primary" :disabled="saving">
                    <i v-if="saving" class="pi pi-spin pi-spinner"></i> Guardar
                  </button>
                  <button type="button" class="btn-secondary" :disabled="saving" @click="cancelEdit">Cancelar</button>
                </div>
                <p v-if="fieldError" class="error" role="alert">{{ fieldError }}</p>
              </form>
            </dd>
          </div>

          <div class="data-item">
            <dt>Número de documento</dt>
            <dd>{{ profile.documentNumber || '—' }}</dd>
          </div>

          <!-- Teléfono (editable) -->
          <div class="data-item">
            <dt>Teléfono</dt>
            <dd v-if="editing !== 'phone'" class="with-action">
              <span>{{ profile.phone || '—' }}</span>
              <button type="button" class="link-button" :disabled="editing !== null" @click="startEdit('phone')">
                Cambiar
              </button>
            </dd>
            <dd v-else>
              <form class="inline-form" @submit.prevent="saveField">
                <label class="sr-only" for="edit-phone">Teléfono</label>
                <input
                  id="edit-phone"
                  v-model="edit.phone"
                  class="field-input"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="3001234567"
                />
                <div class="form-actions">
                  <button type="submit" class="btn-primary" :disabled="saving">
                    <i v-if="saving" class="pi pi-spin pi-spinner"></i> Guardar
                  </button>
                  <button type="button" class="btn-secondary" :disabled="saving" @click="cancelEdit">Cancelar</button>
                </div>
                <p v-if="fieldError" class="error" role="alert">{{ fieldError }}</p>
              </form>
            </dd>
          </div>

          <!-- Correo (editable, con contraseña) -->
          <div class="data-item wide">
            <dt>Correo</dt>
            <dd v-if="editing !== 'email'" class="with-action">
              <span class="break">{{ profile.email }}</span>
              <button type="button" class="link-button" :disabled="editing !== null" @click="startEdit('email')">
                Cambiar
              </button>
            </dd>
            <dd v-else>
              <form class="inline-form" @submit.prevent="saveField">
                <div class="field">
                  <label for="edit-email">Correo nuevo</label>
                  <input id="edit-email" v-model="edit.email" class="field-input" type="email" autocomplete="email" />
                </div>
                <div class="field">
                  <label for="edit-password">Contraseña actual</label>
                  <input
                    id="edit-password"
                    v-model="edit.currentPassword"
                    class="field-input"
                    type="password"
                    autocomplete="current-password"
                  />
                  <small class="hint">La pedimos para confirmar que eres tú.</small>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary" :disabled="saving">
                    <i v-if="saving" class="pi pi-spin pi-spinner"></i> Cambiar correo
                  </button>
                  <button type="button" class="btn-secondary" :disabled="saving" @click="cancelEdit">Cancelar</button>
                </div>
                <p v-if="fieldError" class="error" role="alert">{{ fieldError }}</p>
              </form>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Hijos o menores a cargo (solo tutor) -->
      <section v-if="isTutor" class="settings-card" aria-labelledby="children-title">
        <div class="card-header-row">
          <h2 id="children-title" class="card-title">Hijos o menores a cargo</h2>
          <button v-if="!showAddForm" type="button" class="btn-primary" @click="openAddForm">
            <i class="pi pi-plus"></i> Agregar hijo o menor
          </button>
        </div>

        <p v-if="(studentsLoading || (!studentsLoaded && !studentsError)) && students.length === 0" class="muted">Cargando…</p>
        <p v-else-if="studentsError && students.length === 0" class="error">{{ studentsError }}</p>
        <p v-else-if="students.length === 0" class="muted">Aún no tienes hijos o menores registrados.</p>

        <!-- Carrusel manual: un hijo a la vez; las flechas solo aparecen si hay otro antes o después -->
        <div
          v-else-if="current"
          class="carousel"
          :class="{ 'has-controls': students.length > 1 }"
          role="group"
          aria-roledescription="carrusel"
          aria-label="Hijos o menores a cargo"
        >
          <button
            v-if="hasPrev"
            type="button"
            class="carousel-arrow prev"
            aria-label="Ver el hijo o menor anterior"
            @click="showPrev"
          >
            <i class="pi pi-chevron-left"></i>
          </button>

          <Transition :name="`slide-${slideDirection}`" mode="out-in">
            <article
              :key="current.id"
              class="child-card"
              :aria-label="`${currentIndex + 1} de ${students.length}: ${titleCase(`${current.firstName} ${current.lastName}`)}`"
            >
              <div class="child-head">
                <span class="child-avatar" aria-hidden="true">
                  {{ initials(titleCase(`${current.firstName} ${current.lastName}`)) }}
                </span>
                <div class="child-title">
                  <h3>{{ titleCase(`${current.firstName} ${current.lastName}`) }}</h3>
                  <span>{{ [current.grade, current.age != null ? `${current.age} años` : null].filter(Boolean).join(' · ') }}</span>
                </div>
              </div>

              <dl class="data-grid compact">
                <div class="data-item">
                  <dt>Nombres</dt>
                  <dd>{{ titleCase(current.firstName) }}</dd>
                </div>
                <div class="data-item">
                  <dt>Apellidos</dt>
                  <dd>{{ titleCase(current.lastName) }}</dd>
                </div>
                <div class="data-item">
                  <dt>Tipo de documento</dt>
                  <dd>{{ documentTypeLabel(current.documentType) }}</dd>
                </div>
                <div class="data-item">
                  <dt>Número de documento</dt>
                  <dd>{{ current.documentNumber || '—' }}</dd>
                </div>
                <div class="data-item wide">
                  <dt>Colegio</dt>
                  <dd>{{ current.institution?.name ?? 'Sin colegio asignado' }}</dd>
                </div>
              </dl>

              <div class="child-footer">
                <span v-if="current.latestAssessment" class="status-pill done">
                  <i class="pi pi-check-circle"></i> Formulario inicial: {{ formatDate(current.latestAssessment.createdAt) }}
                </span>
                <template v-else>
                  <span class="status-pill pending"><i class="pi pi-clock"></i> Formulario inicial pendiente</span>
                  <NuxtLink
                    :to="{ path: ROUTES.initialAssessment, query: { studentId: current.id } }"
                    class="btn-secondary small"
                  >
                    Hacer formulario
                  </NuxtLink>
                </template>
              </div>
            </article>
          </Transition>

          <button
            v-if="hasNext"
            type="button"
            class="carousel-arrow next"
            aria-label="Ver el siguiente hijo o menor"
            @click="showNext"
          >
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>

        <p v-if="students.length > 1" class="carousel-counter" aria-live="polite">
          {{ currentIndex + 1 }} de {{ students.length }}
        </p>

        <!-- Formulario para agregar un hijo o menor -->
        <form v-if="showAddForm" class="add-child-form" novalidate @submit.prevent="submitChild">
          <h3 class="form-title">Datos del nuevo hijo o menor</h3>
          <p class="hint">Al guardar pasarás a su formulario inicial para el diagnóstico.</p>

          <div class="form-grid">
            <div class="field">
              <label for="child-first-name">Nombres</label>
              <input id="child-first-name" v-model="child.firstName" class="field-input" autocomplete="off" />
            </div>
            <div class="field">
              <label for="child-last-name">Apellidos</label>
              <input id="child-last-name" v-model="child.lastName" class="field-input" autocomplete="off" />
            </div>
            <div class="field">
              <label for="child-document-type">Tipo de documento</label>
              <select id="child-document-type" v-model="child.documentType" class="field-input">
                <option v-for="t in DOCUMENT_TYPES_KIDS" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="field">
              <label for="child-document-number">Número de documento</label>
              <input
                id="child-document-number"
                v-model="child.documentNumber"
                class="field-input"
                inputmode="numeric"
                autocomplete="off"
              />
            </div>
            <div class="field">
              <label for="child-birth-date">Fecha de nacimiento</label>
              <input id="child-birth-date" v-model="child.birthDate" class="field-input" type="date" :max="todayIso" />
              <small class="hint">{{ childAge !== null ? `Edad: ${childAge} años` : 'La edad se calcula automáticamente' }}</small>
            </div>
            <div class="field">
              <label for="child-grade">Grado escolar</label>
              <select id="child-grade" v-model="child.grade" class="field-input">
                <option value="">Sin grado</option>
                <option v-for="g in SCHOOL_GRADES" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="field wide">
              <label for="child-institution">Colegio</label>
              <select id="child-institution" v-model="child.institutionId" class="field-input">
                <option value="">Sin colegio asignado</option>
                <option v-for="inst in institutions" :key="inst.id" :value="inst.id">{{ inst.name }}</option>
              </select>
            </div>
          </div>

          <p v-if="addError" class="error" role="alert">{{ addError }}</p>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="addSaving">
              <i v-if="addSaving" class="pi pi-spin pi-spinner"></i> Guardar y continuar al formulario
            </button>
            <button type="button" class="btn-secondary" :disabled="addSaving" @click="closeAddForm">Cancelar</button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<style lang="scss" scoped>
$color-brand-indigo: #4f46e5;
$color-text-dark: #1e293b;
$color-text-muted: #64748b;
$color-border-subtle: #e2e8f0;

.settings-body {
  padding: 1.75rem 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem;
  }
}

// Dos tarjetas una al frente de la otra; se apilan cuando no caben
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: start;

  &.single {
    grid-template-columns: minmax(0, 720px);
  }

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.page-title-row {
  .page-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: $color-text-dark;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    margin: 0;
    font-size: 0.9rem;
    color: $color-text-muted;
  }
}

.notice {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  background: #ecfdf3;
  color: #15803d;
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ffffff;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);

  @media (max-width: 640px) {
    padding: 1.15rem;
    border-radius: 18px;
  }
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;

  .card-title {
    margin: 0;
  }
}

.card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: $color-text-dark;
  margin: 0 0 1.25rem;
  letter-spacing: -0.01em;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
  margin: 0;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  &.compact {
    gap: 0.75rem 1.25rem;
  }
}

.data-item {
  min-width: 0;

  &.wide {
    grid-column: 1 / -1;
  }

  dt {
    font-size: 0.74rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.25rem;
  }

  dd {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: $color-text-dark;
  }

  .with-action {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .break {
    overflow-wrap: anywhere;
  }
}

.link-button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  color: $color-brand-indigo;
  cursor: pointer;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    color: #cbd5e1;
    cursor: not-allowed;
  }
}

.inline-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 420px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;

  &.wide {
    grid-column: 1 / -1;
  }

  label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #475569;
  }
}

.field-input {
  width: 100%;
  height: 42px;
  padding: 0 0.85rem;
  border: 1px solid $color-border-subtle;
  border-radius: 12px;
  background: #f8fafc;
  color: $color-text-dark;
  font: inherit;
  font-size: 0.92rem;
  color-scheme: light;

  &:focus {
    outline: none;
    background: #ffffff;
    border-color: $color-brand-indigo;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  // Campos de 16 px en celular para evitar el zoom de iOS
  @media (max-width: 640px) {
    font-size: 16px;
  }
}

.hint {
  margin: 0;
  font-size: 0.76rem;
  color: $color-text-muted;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0 1rem;
  border-radius: 9999px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid $color-brand-indigo;
    outline-offset: 2px;
  }

  &.small {
    min-height: 32px;
    padding: 0 0.85rem;
    font-size: 0.78rem;
  }
}

.btn-primary {
  background: $color-brand-indigo;
  border: 1px solid $color-brand-indigo;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #4338ca;
  }
}

.btn-secondary {
  background: #ffffff;
  border: 1px solid $color-border-subtle;
  color: #475569;

  &:hover:not(:disabled) {
    background: #f8fafc;
  }
}

// Carrusel: las flechas van en los extremos, sobre el borde de la tarjeta del hijo
.carousel {
  position: relative;

  &.has-controls {
    padding: 0 1.4rem;
  }
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid $color-border-subtle;
  background: #ffffff;
  color: $color-brand-indigo;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  &.prev {
    left: 0;
  }

  &.next {
    right: 0;
  }

  &:hover {
    background: #eef2ff;
  }

  &:focus-visible {
    outline: 2px solid $color-brand-indigo;
    outline-offset: 2px;
  }
}

.carousel-counter {
  margin: 0.75rem 0 0;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #94a3b8;
}

// Deslizamiento según la dirección (siguiente → entra por la derecha; anterior → por la izquierda)
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-next-enter-from,
.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.slide-next-leave-to,
.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

@media (prefers-reduced-motion: reduce) {
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: none;
  }
}

.child-card {
  border: 1px solid $color-border-subtle;
  border-radius: 18px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.child-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .child-title {
    min-width: 0;

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: $color-text-dark;
      overflow-wrap: anywhere;
    }

    span {
      font-size: 0.8rem;
      font-weight: 700;
      color: #10b981;
    }
  }
}

.child-avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff, #f5f3ff);
  color: $color-brand-indigo;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 800;
}

.child-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;

  &.done {
    background: #f0fdf4;
    color: #15803d;
  }

  &.pending {
    background: #fffbeb;
    color: #b45309;
  }
}

.add-child-form {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .form-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: $color-text-dark;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.muted {
  margin: 0;
  color: $color-text-muted;
  font-size: 0.88rem;
}

.error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.82rem;
  font-weight: 600;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
