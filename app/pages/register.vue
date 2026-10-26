<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useAuth, type RegisterPayload, type ChildItemPayload } from '~/composables/useAuth'
import { useInstitutions } from '~/composables/useInstitutions'

// Asset imports
import avatarImg from '~/assets/img/avatar.png'
import fondoImg from '~/assets/img/fondo.png'
import boyImg from '~/assets/img/boy.png'
import grilImg from '~/assets/img/gril.png'
import menImg from '~/assets/img/men.png'
import womanImg from '~/assets/img/woman.png'
import oldMenImg from '~/assets/img/old-men.png'
import oldWomanImg from '~/assets/img/old-woman.png'

definePageMeta({
  middleware: 'guest',
})

type ProfileType = 'tutor' | 'profesor' | 'adulto'

const { register, loading: authLoading, error: authError, errorStatus: authErrorStatus } = useAuth()
const { institutions, fetchInstitutions, checkTeacherPreauth } = useInstitutions()

// Tipo de perfil a registrar
const profileType = ref<ProfileType>('tutor')

// Paso actual del asistente: 1 = perfil, 2 = datos personales, 3 = estudiantes / institución / confirmación
const TOTAL_STEPS = 3
const currentStep = ref(1)

const form = reactive({
  firstName: '',
  lastName: '',
  documentType: 'CC',
  documentNumber: '',
  age: null as number | null,
  email: '',
  phone: '',
  acceptedTerms: false,
  password: '',
  // Campos Docente
  institutionId: '',
  professionalLicense: '',
})

const showPassword = ref(false)
const cardRef = ref<HTMLElement | null>(null)

// Estado de pre-autorización docente
const isTeacherPreauthorized = ref(false)
const preauthCheckMessage = ref<string | null>(null)
const preauthCheckError = ref<string | null>(null)
const checkingPreauth = ref(false)

const validationError = ref<string | null>(null)

const profileOptions: { value: ProfileType; title: string; description: string; icon: string; tone: string }[] = [
  {
    value: 'tutor',
    title: 'Soy tutor (padre o madre)',
    description: 'Registro a mis hijos y sigo su progreso.',
    icon: 'pi-users',
    tone: 'purple',
  },
  {
    value: 'profesor',
    title: 'Soy docente',
    description: 'Mi institución me autorizó para acompañar estudiantes.',
    icon: 'pi-briefcase',
    tone: 'blue',
  },
  {
    value: 'adulto',
    title: 'Adulto independiente',
    description: 'Quiero ejercitar mi memoria y atención.',
    icon: 'pi-user',
    tone: 'green',
  },
]

// Mensaje y personajes del panel izquierdo según el perfil elegido
const heroByProfile: Record<ProfileType, { title: string; text: string; left: string; right: string; altLeft: string; altRight: string }> = {
  tutor: {
    title: 'Acompaña el aprendizaje de tus hijos',
    text: 'Registra a cada estudiante a tu cargo y sigue su progreso desde un solo lugar.',
    left: boyImg,
    right: grilImg,
    altLeft: 'Niño estudiante',
    altRight: 'Niña estudiante',
  },
  profesor: {
    title: 'Lleva el aprendizaje a tu aula',
    text: 'Conéctate con tu institución y acompaña a tus estudiantes con actividades medibles.',
    left: menImg,
    right: womanImg,
    altLeft: 'Docente',
    altRight: 'Docente',
  },
  adulto: {
    title: 'Ejercita tu mente cada día',
    text: 'Actividades de memoria, atención y lenguaje pensadas para ti.',
    left: oldMenImg,
    right: oldWomanImg,
    altLeft: 'Adulto mayor',
    altRight: 'Adulta mayor',
  },
}

const currentHero = computed(() => heroByProfile[profileType.value])

const stepLabels = computed(() => {
  const third = profileType.value === 'tutor'
    ? 'Estudiantes'
    : profileType.value === 'profesor' ? 'Institución' : 'Confirmar'
  return ['Perfil', 'Tus datos', third]
})

const termsSubject = computed(() =>
  profileType.value === 'tutor' ? 'datos personales de menores de edad' : 'datos personales',
)

// Listas compartidas con la vista de Configuración (app/utils/form-options.ts)
const documentTypes = DOCUMENT_TYPES_ADULT
const documentTypesKids = DOCUMENT_TYPES_KIDS
const schoolGrades = SCHOOL_GRADES

const todayIso = new Date().toISOString().slice(0, 10)

const createChild = (): ChildItemPayload => ({
  firstName: '',
  lastName: form.lastName.trim(),
  documentType: 'TI',
  documentNumber: '',
  birthDate: '',
  age: 8,
  grade: '',
  // '' = "Sin colegio asignado" (con :value="undefined" Vue envía el texto de la opción)
  institutionId: '',
})

// Arreglo dinámico de hijos para tutores (inicia con un estudiante)
const childrenList = ref<ChildItemPayload[]>([createChild()])

// El error de autenticación es global: se limpia para no mostrar errores de otra pantalla (ej. login)
const clearErrors = () => {
  validationError.value = null
  authError.value = null
  authErrorStatus.value = null
}

onMounted(async () => {
  clearErrors()
  await fetchInstitutions()
})

const selectProfile = (value: ProfileType) => {
  profileType.value = value
  validationError.value = null
  if (value === 'tutor' && childrenList.value.length === 0) addChild()
}

// Agregar un hijo a la lista
const addChild = () => {
  childrenList.value.push(createChild())
}

// Remover hijo
const removeChild = (index: number) => {
  childrenList.value.splice(index, 1)
}

// Calcular edad automáticamente cuando cambia la fecha de nacimiento de un hijo
const onChildBirthDateChange = (child: ChildItemPayload) => {
  if (child.birthDate) {
    const diff = Date.now() - new Date(child.birthDate).getTime()
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
    child.age = Math.max(3, Math.min(17, age || 8))
  }
}

// Validar pre-autorización del profesor
const verifyTeacherAuthorization = async () => {
  preauthCheckError.value = null
  preauthCheckMessage.value = null

  if (!form.institutionId) {
    preauthCheckError.value = 'Por favor selecciona la institución educativa donde laboras.'
    return
  }
  if (!form.documentNumber.trim() || !form.email.trim()) {
    preauthCheckError.value = 'Ingresa tu número de documento y correo para validar tu autorización.'
    return
  }

  checkingPreauth.value = true
  try {
    const res = await checkTeacherPreauth(form.institutionId, form.documentNumber.trim(), form.email.trim())
    if (res.isAuthorized) {
      isTeacherPreauthorized.value = true
      preauthCheckMessage.value = `¡Docente autorizado con éxito! ${res.fullName ? `(${res.fullName})` : ''}`
    }
  } catch (err: any) {
    isTeacherPreauthorized.value = false
    preauthCheckError.value = err.message || 'No figuras como docente autorizado por esta institución.'
  } finally {
    checkingPreauth.value = false
  }
}

// Reset de validación si cambia institución o documento
watch([() => form.institutionId, () => form.documentNumber, () => form.email], () => {
  if (profileType.value === 'profesor') {
    isTeacherPreauthorized.value = false
    preauthCheckMessage.value = null
  }
})

// Validación de los datos personales (paso 2)
const validatePersonalData = (): string | null => {
  if (!form.firstName.trim() || !form.lastName.trim()) {
    return 'Ingresa tu nombre y apellido.'
  }
  if (!form.documentNumber.trim()) {
    return 'Ingresa tu número de documento.'
  }
  if (!form.age || form.age < 6 || form.age > 120) {
    return 'Por favor ingresa una edad válida.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Ingresa un correo electrónico válido.'
  }
  if (form.phone.trim().length < 7) {
    return 'Ingresa un número de teléfono válido.'
  }
  if (form.password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  return null
}

// En pantallas pequeñas la tarjeta queda debajo del panel: se lleva al usuario al inicio del paso
const scrollToCard = async () => {
  await nextTick()
  if (import.meta.client && window.innerWidth <= 1024) {
    cardRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const goNext = () => {
  clearErrors()

  if (currentStep.value === 2) {
    const error = validatePersonalData()
    if (error) {
      validationError.value = error
      return
    }
    // Sugerir el apellido del tutor a los estudiantes que aún no lo tienen
    childrenList.value.forEach((child) => {
      if (!child.lastName.trim()) child.lastName = form.lastName.trim()
    })
  }

  currentStep.value = Math.min(TOTAL_STEPS, currentStep.value + 1)
  scrollToCard()
}

const goBack = () => {
  clearErrors()
  currentStep.value = Math.max(1, currentStep.value - 1)
  scrollToCard()
}

const handleRegister = async () => {
  clearErrors()

  const personalError = validatePersonalData()
  if (personalError) {
    validationError.value = personalError
    currentStep.value = 2
    return
  }

  if (profileType.value === 'profesor') {
    if (!form.institutionId) {
      validationError.value = 'Debes seleccionar una institución educativa.'
      return
    }
    if (!isTeacherPreauthorized.value) {
      validationError.value = 'Debes verificar y confirmar tu pre-autorización institucional antes de registrarte.'
      return
    }
  }

  if (profileType.value === 'tutor' && childrenList.value.length === 0) {
    validationError.value = 'Por favor agrega al menos los datos de un estudiante/hijo.'
    return
  }

  // Validar datos de hijos
  if (profileType.value === 'tutor') {
    for (const [i, child] of childrenList.value.entries()) {
      if (!child.firstName.trim() || !child.documentNumber.trim() || !child.birthDate) {
        validationError.value = `Por favor completa todos los campos del estudiante #${i + 1}.`
        return
      }
    }
  }

  if (!form.acceptedTerms) {
    validationError.value = 'Debes aceptar los términos y condiciones para continuar.'
    return
  }

  const payload: RegisterPayload = {
    role: profileType.value === 'profesor' ? 'profesor' : 'usuario',
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    documentType: form.documentType,
    documentNumber: form.documentNumber.trim(),
    age: form.age as number,
    email: form.email.trim(),
    phone: form.phone.trim(),
    acceptedTerms: form.acceptedTerms,
    password: form.password,
    institutionId: profileType.value === 'profesor' ? form.institutionId || undefined : undefined,
    professionalLicense: form.professionalLicense ? form.professionalLicense.trim() : undefined,
    children: profileType.value === 'tutor'
      ? childrenList.value.map((child) => ({
          ...child,
          firstName: child.firstName.trim(),
          lastName: child.lastName.trim(),
          documentNumber: child.documentNumber.trim(),
          grade: child.grade || undefined,
          institutionId: child.institutionId || undefined,
        }))
      : undefined,
  }

  const ok = await register(payload)

  // 409: el correo o el documento ya existen; se vuelve a "Tus datos" para corregirlos sin perder el error
  if (!ok && authErrorStatus.value === 409) {
    currentStep.value = 2
    scrollToCard()
  }
}

// El botón principal avanza de paso o envía el registro en el último paso
const handleSubmit = () => {
  if (currentStep.value < TOTAL_STEPS) {
    goNext()
  } else {
    handleRegister()
  }
}
</script>

<template>
  <div class="page-container" :style="{ backgroundImage: `url(${fondoImg})` }">
    <!-- Encabezado -->
    <header class="top-header">
      <div class="brand-logo">
        <img :src="avatarImg" alt="Logo Vamos Aprendiendo" class="avatar-logo-img" />
        <div class="brand-text">
          <span class="brand-name-top">Vamos</span>
          <span class="brand-name-sub">Aprendiendo</span>
        </div>
      </div>

      <NuxtLink to="/login" class="login-pill">
        <span class="login-pill-question">¿Ya tienes cuenta?</span>
        <strong>Iniciar sesión</strong>
      </NuxtLink>
    </header>

    <main class="main-content">
      <!-- Panel izquierdo: mensaje y personajes según el perfil -->
      <section class="hero-section">
        <div class="floating-badge badge-letter-a" aria-hidden="true">
          <span>A</span>
        </div>
        <div class="floating-badge badge-star" aria-hidden="true">
          <i class="pi pi-star-fill"></i>
        </div>

        <div class="hero-copy">
          <h1 class="hero-title">
            <span class="title-dark">Únete a</span>
            <span class="title-blue">Vamos Aprendiendo</span>
          </h1>
          <Transition name="hero-fade" mode="out-in">
            <div :key="profileType" class="hero-message">
              <p class="hero-subtitle">{{ currentHero.title }}</p>
              <p class="hero-text">{{ currentHero.text }}</p>
            </div>
          </Transition>
        </div>

        <div class="characters-stage">
          <Transition name="hero-fade" mode="out-in">
            <div :key="profileType" class="characters-pair">
              <img :src="currentHero.left" :alt="currentHero.altLeft" class="character-img" />
              <img :src="currentHero.right" :alt="currentHero.altRight" class="character-img" />
            </div>
          </Transition>
        </div>

        <ul class="benefits-list">
          <li><i class="pi pi-check"></i> 14 días de prueba gratis</li>
          <li><i class="pi pi-check"></i> Evaluación inicial personalizada</li>
          <li><i class="pi pi-check"></i> Entorno seguro para aprender</li>
        </ul>
      </section>

      <!-- Tarjeta de registro -->
      <section ref="cardRef" class="register-card" aria-labelledby="register-title">
        <div class="card-header">
          <h2 id="register-title" class="card-title">Crea tu cuenta</h2>
          <p class="card-subtitle">Paso {{ currentStep }} de {{ TOTAL_STEPS }} · {{ stepLabels[currentStep - 1] }}</p>
        </div>

        <!-- Indicador de pasos -->
        <ol class="stepper" aria-label="Progreso del registro">
          <li
            v-for="(label, index) in stepLabels"
            :key="label"
            class="stepper-item"
            :class="{ reached: index + 1 <= currentStep, current: index + 1 === currentStep }"
            :aria-current="index + 1 === currentStep ? 'step' : undefined"
          >
            <span class="stepper-bar"></span>
            <span class="stepper-label">{{ label }}</span>
          </li>
        </ol>

        <form class="register-form" novalidate @submit.prevent="handleSubmit">
          <!-- PASO 1: Perfil -->
          <div v-if="currentStep === 1" class="step-panel">
            <p class="step-question" id="profile-question">¿Quién va a usar la plataforma?</p>
            <div class="profile-options" role="radiogroup" aria-labelledby="profile-question">
              <button
                v-for="option in profileOptions"
                :key="option.value"
                type="button"
                role="radio"
                class="profile-option"
                :class="{ selected: profileType === option.value }"
                :aria-checked="profileType === option.value"
                @click="selectProfile(option.value)"
              >
                <span class="profile-icon" :class="`tone-${option.tone}`">
                  <i class="pi" :class="option.icon"></i>
                </span>
                <span class="profile-text">
                  <span class="profile-title">{{ option.title }}</span>
                  <span class="profile-description">{{ option.description }}</span>
                </span>
                <span class="profile-check" aria-hidden="true">
                  <i class="pi pi-check"></i>
                </span>
              </button>
            </div>
          </div>

          <!-- PASO 2: Datos personales -->
          <div v-else-if="currentStep === 2" class="step-panel">
            <div class="fields-grid">
              <div class="form-group">
                <label for="firstName">Nombre</label>
                <div class="input-wrapper">
                  <i class="pi pi-user input-icon"></i>
                  <input id="firstName" v-model="form.firstName" type="text" autocomplete="given-name" placeholder="Tu primer nombre" class="custom-input" />
                </div>
              </div>
              <div class="form-group">
                <label for="lastName">Apellido</label>
                <div class="input-wrapper">
                  <i class="pi pi-user input-icon"></i>
                  <input id="lastName" v-model="form.lastName" type="text" autocomplete="family-name" placeholder="Tu primer apellido" class="custom-input" />
                </div>
              </div>
              <div class="form-group">
                <label for="documentType">Tipo de documento</label>
                <div class="input-wrapper">
                  <i class="pi pi-id-card input-icon"></i>
                  <select id="documentType" v-model="form.documentType" class="custom-input custom-select">
                    <option v-for="t in documentTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                  </select>
                  <i class="pi pi-chevron-down select-chevron"></i>
                </div>
              </div>
              <div class="form-group">
                <label for="documentNumber">Número de documento</label>
                <div class="input-wrapper">
                  <i class="pi pi-hashtag input-icon"></i>
                  <input id="documentNumber" v-model="form.documentNumber" type="text" inputmode="numeric" placeholder="Ej: 1234567890" class="custom-input" />
                </div>
              </div>
              <div class="form-group">
                <label for="age">Edad (años)</label>
                <div class="input-wrapper">
                  <i class="pi pi-calendar input-icon"></i>
                  <input id="age" v-model.number="form.age" type="number" min="6" max="120" inputmode="numeric" placeholder="Ej: 32" class="custom-input" />
                </div>
              </div>
              <div class="form-group">
                <label for="phone">Teléfono móvil</label>
                <div class="input-wrapper">
                  <i class="pi pi-phone input-icon"></i>
                  <input id="phone" v-model="form.phone" type="tel" autocomplete="tel" placeholder="Ej: +573001234567" class="custom-input" />
                </div>
              </div>
              <div class="form-group span-full">
                <label for="email">Correo electrónico</label>
                <div class="input-wrapper">
                  <i class="pi pi-envelope input-icon"></i>
                  <input id="email" v-model="form.email" type="email" autocomplete="email" placeholder="tu.correo@ejemplo.com" class="custom-input" />
                </div>
              </div>
              <div class="form-group span-full">
                <label for="password">Contraseña</label>
                <div class="input-wrapper">
                  <i class="pi pi-lock input-icon"></i>
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    class="custom-input has-toggle"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    @click="showPassword = !showPassword"
                  >
                    <i class="pi" :class="showPassword ? 'pi-eye-slash' : 'pi-eye'"></i>
                  </button>
                </div>
                <p class="field-hint">Usa al menos 6 caracteres, combinando letras y números.</p>
              </div>
            </div>
          </div>

          <!-- PASO 3: depende del perfil -->
          <div v-else class="step-panel">
            <!-- Tutor: estudiantes a cargo -->
            <template v-if="profileType === 'tutor'">
              <div class="step-heading">
                <p class="step-question">Estudiantes a tu cargo</p>
                <p class="step-help">Registra a cada niño o niña que usará la plataforma.</p>
              </div>

              <div v-for="(child, index) in childrenList" :key="index" class="child-card">
                <div class="child-card-header">
                  <div class="child-badge">
                    <span class="child-number">{{ index + 1 }}</span>
                    <span class="child-title">Estudiante {{ index + 1 }}</span>
                  </div>
                  <button
                    v-if="childrenList.length > 1"
                    type="button"
                    class="child-remove"
                    :aria-label="`Quitar estudiante ${index + 1}`"
                    @click="removeChild(index)"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>

                <div class="fields-grid">
                  <div class="form-group">
                    <label :for="`child-name-${index}`">Nombre</label>
                    <div class="input-wrapper">
                      <i class="pi pi-user input-icon"></i>
                      <input :id="`child-name-${index}`" v-model="child.firstName" type="text" placeholder="Nombre" class="custom-input" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label :for="`child-last-${index}`">Apellido</label>
                    <div class="input-wrapper">
                      <i class="pi pi-user input-icon"></i>
                      <input :id="`child-last-${index}`" v-model="child.lastName" type="text" placeholder="Apellido" class="custom-input" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label :for="`child-doctype-${index}`">Tipo de documento</label>
                    <div class="input-wrapper">
                      <i class="pi pi-id-card input-icon"></i>
                      <select :id="`child-doctype-${index}`" v-model="child.documentType" class="custom-input custom-select">
                        <option v-for="t in documentTypesKids" :key="t.value" :value="t.value">{{ t.label }}</option>
                      </select>
                      <i class="pi pi-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="form-group">
                    <label :for="`child-doc-${index}`">Número de documento</label>
                    <div class="input-wrapper">
                      <i class="pi pi-hashtag input-icon"></i>
                      <input :id="`child-doc-${index}`" v-model="child.documentNumber" type="text" inputmode="numeric" placeholder="Número" class="custom-input" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label :for="`child-birth-${index}`">Fecha de nacimiento</label>
                    <div class="input-wrapper">
                      <i class="pi pi-calendar input-icon"></i>
                      <input
                        :id="`child-birth-${index}`"
                        v-model="child.birthDate"
                        type="date"
                        :max="todayIso"
                        class="custom-input"
                        @change="onChildBirthDateChange(child)"
                      />
                    </div>
                    <p class="field-hint child-age">
                      {{ child.birthDate ? `Edad: ${child.age} años` : 'La edad se calcula automáticamente' }}
                    </p>
                  </div>
                  <div class="form-group">
                    <label :for="`child-grade-${index}`">Grado escolar</label>
                    <div class="input-wrapper">
                      <i class="pi pi-book input-icon"></i>
                      <select :id="`child-grade-${index}`" v-model="child.grade" class="custom-input custom-select">
                        <option value="">Selecciona el grado</option>
                        <option v-for="grade in schoolGrades" :key="grade" :value="grade">{{ grade }}</option>
                      </select>
                      <i class="pi pi-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="form-group span-full">
                    <label :for="`child-school-${index}`">Colegio (opcional si tiene convenio)</label>
                    <div class="input-wrapper">
                      <i class="pi pi-building input-icon"></i>
                      <select :id="`child-school-${index}`" v-model="child.institutionId" class="custom-input custom-select">
                        <option value="">Sin colegio asignado</option>
                        <option v-for="inst in institutions" :key="inst.id" :value="inst.id">{{ inst.name }}</option>
                      </select>
                      <i class="pi pi-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" class="add-child-button" @click="addChild">
                <i class="pi pi-plus"></i>
                Agregar otro estudiante
              </button>
            </template>

            <!-- Docente: institución y verificación -->
            <template v-else-if="profileType === 'profesor'">
              <div class="step-heading">
                <p class="step-question">Tu institución educativa</p>
                <p class="step-help">Solo pueden registrarse los docentes que su colegio autorizó previamente.</p>
              </div>

              <div class="form-group">
                <label for="institution">Colegio o instituto</label>
                <div class="input-wrapper">
                  <i class="pi pi-building input-icon"></i>
                  <select id="institution" v-model="form.institutionId" class="custom-input custom-select">
                    <option value="" disabled>Selecciona tu institución</option>
                    <option v-for="inst in institutions" :key="inst.id" :value="inst.id">
                      {{ inst.name }} ({{ inst.type.toUpperCase() }} - {{ inst.city }})
                    </option>
                  </select>
                  <i class="pi pi-chevron-down select-chevron"></i>
                </div>
              </div>

              <div class="form-group">
                <label for="professionalLicense">Tarjeta profesional / matrícula (opcional)</label>
                <div class="input-wrapper">
                  <i class="pi pi-id-card input-icon"></i>
                  <input id="professionalLicense" v-model="form.professionalLicense" type="text" placeholder="Ej: LIC-DOC-9842" class="custom-input" />
                </div>
              </div>

              <button
                type="button"
                class="verify-button"
                :class="{ verified: isTeacherPreauthorized }"
                :disabled="checkingPreauth"
                @click="verifyTeacherAuthorization"
              >
                <i class="pi" :class="checkingPreauth ? 'pi-spin pi-spinner' : (isTeacherPreauthorized ? 'pi-verified' : 'pi-shield')"></i>
                {{ isTeacherPreauthorized ? 'Autorización verificada' : 'Verificar autorización con la institución' }}
              </button>

              <div v-if="preauthCheckMessage" class="alert-box success" role="status">
                <i class="pi pi-check-circle"></i>
                <span>{{ preauthCheckMessage }}</span>
              </div>
              <div v-if="preauthCheckError" class="alert-box error" role="alert">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ preauthCheckError }}</span>
              </div>
            </template>

            <!-- Adulto: lo que sigue después del registro -->
            <template v-else>
              <div class="step-heading">
                <p class="step-question">Así empieza tu experiencia</p>
              </div>
              <div class="info-card tone-blue">
                <span class="info-icon"><i class="pi pi-file-edit"></i></span>
                <span class="info-text">
                  <strong>Evaluación inicial de 7 preguntas</strong>
                  <span>Memoria, orientación, fluidez verbal y funciones ejecutivas. Con tus respuestas ajustamos las actividades a tu nivel.</span>
                </span>
              </div>
              <div class="info-card tone-green">
                <span class="info-icon"><i class="pi pi-star"></i></span>
                <span class="info-text">
                  <strong>14 días de prueba gratis</strong>
                  <span>Accede a todas las actividades durante tu periodo de prueba, sin compromiso.</span>
                </span>
              </div>
            </template>

            <!-- Términos y condiciones (común a todos los perfiles) -->
            <label for="acceptedTerms" class="terms-field">
              <input id="acceptedTerms" v-model="form.acceptedTerms" type="checkbox" class="terms-checkbox" />
              <span class="terms-label">
                Acepto los términos del servicio, la política de tratamiento de {{ termsSubject }} y el periodo de prueba gratuito de 14 días.
              </span>
            </label>
          </div>

          <!-- Mensajes de error -->
          <div v-if="validationError || authError" class="alert-box error" role="alert">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ validationError || authError }}</span>
          </div>

          <!-- Navegación entre pasos -->
          <div class="form-actions" :class="{ single: currentStep === 1 }">
            <button v-if="currentStep > 1" type="button" class="secondary-button" :disabled="authLoading" @click="goBack">
              <i class="pi pi-arrow-left"></i>
              Atrás
            </button>
            <button
              type="submit"
              class="submit-button"
              :disabled="authLoading || (currentStep === TOTAL_STEPS && profileType === 'profesor' && !isTeacherPreauthorized)"
            >
              <span v-if="authLoading" class="spinner"></span>
              <template v-else-if="currentStep < TOTAL_STEPS">
                Continuar
                <i class="pi pi-arrow-right"></i>
              </template>
              <span v-else>Crear cuenta</span>
            </button>
          </div>
        </form>

        <p class="card-footer">
          ¿Ya tienes una cuenta?
          <NuxtLink to="/login" class="login-link">Inicia sesión</NuxtLink>
        </p>
      </section>
    </main>

    <!-- Sello de seguridad -->
    <footer class="bottom-footer">
      <div class="security-badge">
        <i class="pi pi-shield"></i>
        <span>Entorno seguro y protegido para aprender</span>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
// Design Tokens (mismos valores que login.vue)
$color-brand-blue: #3b50df;
$color-brand-blue-hover: #2e41c4;
$color-brand-purple: #8b5cf6;
$color-brand-green: #10b981;

$text-dark-title: #1e293b;
$text-dark-body: #334155;
$text-muted: #64748b;
$text-placeholder: #7c8aa0;

$border-light: #e2e8f0;

// Puntos de quiebre: monitor grande, portátil, tablet, celular
$bp-wide: 1600px;
$bp-tablet: 1024px;
$bp-mobile: 640px;
$bp-small: 380px;

.page-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f1f5fb;
  background-position: center bottom;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: $text-dark-title;
  overflow-x: hidden;
  // La página siempre es clara: evita que casillas, calendarios y listas nativas salgan en modo oscuro
  color-scheme: light;

  // background-attachment: fixed no funciona bien en navegadores móviles
  @media (max-width: $bp-tablet) {
    background-attachment: scroll;
  }
}

/* ===== Encabezado ===== */
.top-header {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (min-width: $bp-wide) {
    max-width: 1480px;
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar-logo-img {
  width: clamp(48px, 6vw, 72px);
  height: clamp(48px, 6vw, 72px);
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  font-size: clamp(16px, 1.6vw, 20px);
  font-weight: 700;
}

.brand-name-top {
  color: #1e1b4b;
}

.brand-name-sub {
  color: $color-brand-blue;
}

.login-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid $border-light;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease;

  strong {
    color: $color-brand-blue;
  }

  &:hover {
    background: #ffffff;
    border-color: #cbd5e1;
  }

  @media (max-width: 480px) {
    padding: 0 14px;

    .login-pill-question {
      display: none;
    }
  }
}

/* ===== Contenido principal ===== */
.main-content {
  flex: 1;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 8px clamp(16px, 4vw, 48px) 32px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 600px);
  gap: clamp(32px, 4vw, 72px);
  align-items: start;
  align-content: start;

  @media (min-width: $bp-wide) {
    max-width: 1480px;
    grid-template-columns: minmax(0, 1fr) minmax(0, 640px);
  }

  @media (max-width: $bp-tablet) {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
    gap: 24px;
  }
}

/* ===== Panel izquierdo ===== */
.hero-section {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 24px;
  min-width: 0;

  // Tablet: el panel se vuelve una franja horizontal sobre la tarjeta
  @media (max-width: $bp-tablet) {
    position: relative;
    top: auto;
    width: 100%;
    max-width: 760px;
    padding-top: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 300px);
    align-items: center;
    gap: 12px 24px;
  }

  // Celular: todo centrado en una sola columna
  @media (max-width: $bp-mobile) {
    grid-template-columns: minmax(0, 1fr);
    text-align: center;
    justify-items: center;
  }
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-title {
  margin: 0;
  font-size: clamp(32px, 4.2vw, 58px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;

  span {
    display: block;
  }
}

.title-dark {
  color: #181c32;
}

.title-blue {
  color: $color-brand-blue;
}

.hero-message {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 460px;

  @media (max-width: $bp-mobile) {
    margin: 0 auto;
  }
}

.hero-subtitle {
  margin: 0;
  font-size: clamp(16px, 1.6vw, 21px);
  font-weight: 600;
  color: $text-dark-body;
}

.hero-text {
  margin: 0;
  font-size: clamp(14px, 1.1vw, 15px);
  line-height: 1.55;
  color: $text-muted;

  // Celular: se acorta el panel para que el formulario quede a la vista
  @media (max-width: $bp-mobile) {
    display: none;
  }
}

.characters-stage {
  height: clamp(240px, 26vw, 360px);

  @media (max-width: $bp-tablet) {
    height: 220px;
    width: 100%;
  }

  @media (max-width: $bp-mobile) {
    height: 130px;
    max-width: 240px;
  }
}

.characters-pair {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: clamp(8px, 2vw, 24px);
}

.character-img {
  height: 100%;
  max-width: 46%;
  object-fit: contain;
  filter: drop-shadow(0 12px 18px rgba(30, 41, 59, 0.12));
}

.benefits-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: $bp-tablet) {
    grid-column: 1 / -1;
  }

  @media (max-width: $bp-mobile) {
    display: none;
  }

  li {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid $border-light;
    font-size: 13px;
    font-weight: 600;
    color: $text-dark-body;

    i {
      color: #059669;
      font-size: 12px;
      font-weight: 700;
    }

    @media (max-width: $bp-small) {
      font-size: 12px;
      padding: 6px 12px;
    }
  }
}

.floating-badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  animation: float-badge 4s ease-in-out infinite;
  z-index: 1;

  @media (max-width: $bp-tablet) {
    display: none;
  }
}

.badge-letter-a {
  top: 16px;
  right: 14%;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, $color-brand-purple);
  box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
}

.badge-star {
  top: 52%;
  left: 0;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6ee7b7, #34d399);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
  animation-delay: 1.2s;
}

@keyframes float-badge {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ===== Tarjeta de registro ===== */
.register-card {
  width: 100%;
  max-width: 640px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 28px;
  padding: clamp(24px, 3vw, 40px);
  box-shadow: 0 24px 60px rgba(30, 41, 59, 0.12);
  display: flex;
  flex-direction: column;
  gap: 24px;
  scroll-margin-top: 16px;

  @media (max-width: $bp-mobile) {
    padding: 22px 18px;
    border-radius: 22px;
    gap: 20px;
  }
}

.card-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  margin: 0;
  font-size: clamp(22px, 2vw, 26px);
  font-weight: 800;
  color: $text-dark-title;
}

.card-subtitle {
  margin: 0;
  font-size: 14px;
  color: $text-muted;
}

/* Indicador de pasos */
.stepper {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stepper-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stepper-bar {
  display: block;
  height: 6px;
  border-radius: 9999px;
  background: $border-light;
  transition: background 0.3s ease;
}

.stepper-label {
  font-size: 12px;
  font-weight: 500;
  color: $text-muted;

  @media (max-width: $bp-small) {
    font-size: 11px;
  }
}

.stepper-item.reached {
  .stepper-bar {
    background: $color-brand-blue;
  }

  .stepper-label {
    color: $text-dark-body;
    font-weight: 600;
  }
}

.stepper-item.current .stepper-label {
  color: $color-brand-blue;
  font-weight: 700;
}

/* Formulario */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.step-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-question {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: $text-dark-title;
}

.step-help {
  margin: 0;
  font-size: 13px;
  color: $text-muted;
}

/* Opciones de perfil */
.profile-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 2px solid $border-light;
  background: #ffffff;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: #a5b0f0;
  }

  &:focus-visible {
    outline: 3px solid rgba(59, 80, 223, 0.35);
    outline-offset: 2px;
  }

  &.selected {
    border-color: $color-brand-blue;
    background: #f5f7ff;
    box-shadow: 0 0 0 4px rgba(59, 80, 223, 0.12);

    .profile-check {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: $bp-small) {
    gap: 12px;
    padding: 14px;
  }
}

.profile-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &.tone-purple {
    background: #f3efff;
    color: #7c3aed;
  }

  &.tone-blue {
    background: #eef0fd;
    color: $color-brand-blue;
  }

  &.tone-green {
    background: #e7f8f1;
    color: #047857;
  }

  @media (max-width: $bp-small) {
    width: 40px;
    height: 40px;
    font-size: 17px;
  }
}

.profile-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-title {
  font-size: 15px;
  font-weight: 700;
  color: $text-dark-title;
}

.profile-description {
  font-size: 13px;
  color: $text-muted;
  line-height: 1.4;
}

.profile-check {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  background: $color-brand-blue;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

/* Campos */
.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }
}

.span-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  label {
    font-size: 13px;
    font-weight: 600;
    color: $text-dark-body;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  color: $text-placeholder;
  font-size: 15px;
  pointer-events: none;
  z-index: 1;
}

.custom-input {
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  padding: 0 14px 0 44px;
  border: 1.5px solid $border-light;
  border-radius: 12px;
  background-color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  color: $text-dark-title;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: $text-placeholder;
  }

  &:focus {
    border-color: $color-brand-blue;
    box-shadow: 0 0 0 4px rgba(59, 80, 223, 0.12);
  }

  &.has-toggle {
    padding-right: 52px;
  }

  // Evita el zoom automático de iOS al enfocar campos con letra menor a 16px
  @media (max-width: $bp-mobile) {
    font-size: 16px;
  }
}

.custom-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 40px;
  cursor: pointer;
  text-overflow: ellipsis;
}

.select-chevron {
  position: absolute;
  right: 15px;
  color: $text-muted;
  font-size: 12px;
  pointer-events: none;
}

.password-toggle {
  position: absolute;
  right: 2px;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  &:hover {
    color: $color-brand-blue;
  }
}

.field-hint {
  margin: 0;
  font-size: 12px;
  color: $text-muted;
}

/* Estudiantes (tutor) */
.child-card {
  border: 1.5px solid #e9e3fb;
  background: #fbf9ff;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: $bp-mobile) {
    padding: 14px;
  }
}

.child-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.child-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.child-number {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: $color-brand-purple;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
}

.child-title {
  font-size: 14px;
  font-weight: 700;
  color: #4c1d95;
}

.child-remove {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  background: #ffffff;
  color: #dc2626;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: #fef2f2;
  }
}

.child-age {
  color: #6d28d9;
  font-weight: 600;
}

.add-child-button {
  min-height: 52px;
  border-radius: 14px;
  border: 1.5px dashed #c4b5fd;
  background: #ffffff;
  color: #6d28d9;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: #f3efff;
    border-color: $color-brand-purple;
  }
}

/* Docente */
.verify-button {
  min-height: 50px;
  border-radius: 12px;
  border: 1.5px solid #c7cdf6;
  background: #ffffff;
  color: $color-brand-blue;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover:not(:disabled) {
    background: #f5f7ff;
    border-color: $color-brand-blue;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &.verified {
    border-color: #a7f3d0;
    background: #ecfdf5;
    color: #047857;
  }
}

/* Adulto */
.info-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 16px;

  &.tone-blue {
    background: #eef0fd;
    border: 1px solid #d6dbfa;

    .info-icon {
      background: $color-brand-blue;
    }
  }

  &.tone-green {
    background: #ecfdf5;
    border: 1px solid #c8f0dd;

    .info-icon {
      background: #059669;
    }
  }
}

.info-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;

  strong {
    font-size: 14px;
    color: $text-dark-title;
  }
}

/* Términos */
.terms-field {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid $border-light;
  cursor: pointer;
}

.terms-checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin: 1px 0 0;
  accent-color: $color-brand-blue;
  cursor: pointer;
}

.terms-label {
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}

/* Alertas */
.alert-box {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;

  i {
    margin-top: 2px;
  }

  &.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }

  &.success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }
}

/* Botones de navegación */
.form-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 12px;

  &.single {
    grid-template-columns: minmax(0, 1fr);
  }

  // Celular: botón principal arriba y "Atrás" debajo, ambos a lo ancho
  @media (max-width: $bp-small) {
    grid-template-columns: minmax(0, 1fr);

    .secondary-button {
      order: 2;
    }
  }
}

.submit-button,
.secondary-button {
  min-height: 50px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
    transform: none;
    box-shadow: none;
  }
}

.submit-button {
  border: none;
  color: #ffffff;
  background: linear-gradient(135deg, $color-brand-blue 0%, #4338ca 100%);
  box-shadow: 0 10px 22px rgba(59, 80, 223, 0.28);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #3244cc 0%, #3730a3 100%);
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(59, 80, 223, 0.34);
  }
}

.secondary-button {
  border: 1.5px solid $border-light;
  background: #ffffff;
  color: $text-dark-body;

  &:hover:not(:disabled) {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.card-footer {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: $text-muted;
}

.login-link {
  color: $color-brand-blue;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: $color-brand-blue-hover;
    text-decoration: underline;
  }
}

/* ===== Pie ===== */
.bottom-footer {
  display: flex;
  justify-content: center;
  padding: 0 16px 24px;
}

.security-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid $border-light;
  font-size: 13px;
  font-weight: 600;
  color: $text-dark-body;
  text-align: center;

  i {
    color: #059669;
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-badge,
  .spinner {
    animation: none;
  }

  .hero-fade-enter-active,
  .hero-fade-leave-active {
    transition: none;
  }
}
</style>
