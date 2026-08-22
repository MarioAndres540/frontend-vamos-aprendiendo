<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

// Asset imports
import avatarImg from '~/assets/img/avatar.png'
import fondoImg from '~/assets/img/fondo.png'
import diagnosticoImg from '~/assets/img/diagnostico.png'
import letrasImg from '~/assets/img/letras.png'
import numeroImg from '~/assets/img/numero.png'
import logicaImg from '~/assets/img/logica.png'
import atencionImg from '~/assets/img/atencion.png'
import memoriaImg from '~/assets/img/memoria.png'
import creatividadImg from '~/assets/img/creatividad.png'
import womanImg from '~/assets/img/woman.png'
import boyImg from '~/assets/img/boy.png'
import grilImg from '~/assets/img/gril.png'
import menImg from '~/assets/img/men.png'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { user, setChildRegistered } = useAuth()

// Active Mode: 'kids' (Infantil: 4-12 años) | 'adults' (Adulto: 18+ años)
const activeMode = ref<'kids' | 'adults'>(route.query.mode === 'adults' ? 'adults' : 'kids')

// Sync with route query
watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode === 'adults' || newMode === 'kids') {
      activeMode.value = newMode
      currentStep.value = 1
    }
  }
)

const setMode = (mode: 'kids' | 'adults') => {
  activeMode.value = mode
  currentStep.value = 1
  router.replace({ query: { mode } })
}

// Wizard Steps: 1 = Pregunta A, 2 = Pregunta B, 3 = Pregunta C, 4 = Transición / Finalización
const currentStep = ref(1)
const totalSteps = 3
const isTransitioning = ref(false)

// User display name
const userName = computed(() => {
  if (user.value?.firstName) {
    return `${user.value.firstName} ${user.value.lastName || ''}`.trim()
  }
  if (user.value?.name) return user.value.name
  if (user.value?.email) return user.value.email.split('@')[0]
  return activeMode.value === 'kids' ? 'Juan Pérez' : 'María Torres'
})

// ----------------------------------------------------
// STATE: BLOQUE 1 - SECCIÓN INFANTIL (4 a 12 años)
// ----------------------------------------------------
const kidsForm = reactive({
  // Pregunta A: Diagnóstico previo / Estilo de reto (Selección única)
  superPower: 'letras', // 'letras' | 'numeros' | 'energia' | 'listo'

  // Pregunta B: Interés lúdico (área) + Autopercepción (escala 3 estrellas)
  chosenRealm: 'palabras', // 'palabras' | 'numeros'
  selfEfficacy: 2, // 1: Principiante, 2: Explorador, 3: Maestro

  // Pregunta C: Estilo de juego (Selección múltiple, máx 2)
  playStyles: ['colores'] as string[] // 'colores' | 'sonidos' | 'tocando'
})

// Opciones Pregunta A (Niños)
const kidsSuperPowers = [
  {
    id: 'letras',
    title: 'Aventuras con las letras',
    desc: '«A veces las letras cambian de lugar o me cuesta leerlas»',
    badge: 'Dislexia / Dificultad lectora',
    icon: letrasImg,
    color: '#6366f1',
    bgColor: '#eef2ff'
  },
  {
    id: 'numeros',
    title: 'Mundo de los números',
    desc: '«Las matemáticas y las cuentas van un poco rápido para mí»',
    badge: 'Discalculia / Dificultad numérica',
    icon: numeroImg,
    color: '#10b981',
    bgColor: '#ecfdf5'
  },
  {
    id: 'energia',
    title: 'Energía imparable',
    desc: '«Me muevo mucho o me distraigo fácil con los ruidos»',
    badge: 'TDAH / Atención dispersa',
    icon: atencionImg,
    color: '#f59e0b',
    bgColor: '#fffbeb'
  },
  {
    id: 'listo',
    title: '¡Listo para todo!',
    desc: '«No tengo dificultades especiales, ¡solo quiero jugar y aprender!»',
    badge: 'Sin diagnóstico previo',
    icon: creatividadImg,
    color: '#3b82f6',
    bgColor: '#eff6ff'
  }
]

// Opciones Pregunta B (Niños) - Reinos
const kidsRealms = [
  {
    id: 'palabras',
    title: 'Reino de las Palabras',
    desc: 'Cuentos, letras y vocabulario.',
    icon: letrasImg,
    color: '#6366f1',
    badgeText: '🏰 Cuentos y Letras'
  },
  {
    id: 'numeros',
    title: 'Galaxia de los Números',
    desc: 'Sumas, acertijos y patrones.',
    icon: numeroImg,
    color: '#10b981',
    badgeText: '🌌 Acertijos y Sumas'
  }
]

// Opciones Pregunta B (Niños) - Escala de autoeficacia
const kidsEfficacyLevels = [
  {
    level: 1,
    badge: '🥉',
    title: 'Principiante',
    desc: '«Apenas estoy empezando»',
    color: '#ca8a04'
  },
  {
    level: 2,
    badge: '🥈',
    title: 'Explorador',
    desc: '«¡Se me da bastante bien!»',
    color: '#0284c7'
  },
  {
    level: 3,
    badge: '🥇',
    title: 'Maestro',
    desc: '«¡Soy un campeón total!»',
    color: '#16a34a'
  }
]

// Opciones Pregunta C (Niños) - Estilos de juego (máx 2)
const kidsPlayStyleOptions = [
  {
    id: 'colores',
    title: 'Con colores y dibujos',
    desc: '«Me gusta ver imágenes grandes y animaciones.»',
    icon: creatividadImg,
    color: '#ec4899',
    bgColor: '#fdf2f8'
  },
  {
    id: 'sonidos',
    title: 'Con sonidos y canciones',
    desc: '«Aprendo mejor cuando hay ritmo y voz.»',
    icon: memoriaImg,
    color: '#8b5cf6',
    bgColor: '#f5f3ff'
  },
  {
    id: 'tocando',
    title: 'Tocando y moviendo',
    desc: '«Prefiero arrastrar piezas, armar y resolver rompecabezas.»',
    icon: logicaImg,
    color: '#0ea5e9',
    bgColor: '#f0f9ff'
  }
]

const toggleKidsPlayStyle = (id: string) => {
  const index = kidsForm.playStyles.indexOf(id)
  if (index > -1) {
    kidsForm.playStyles.splice(index, 1)
  } else {
    if (kidsForm.playStyles.length >= 2) {
      kidsForm.playStyles.shift() // remove first to allow max 2
    }
    kidsForm.playStyles.push(id)
  }
}

// ----------------------------------------------------
// STATE: BLOQUE 2 - SECCIÓN ADULTO (Mayores de 18 años)
// ----------------------------------------------------
const adultsForm = reactive({
  // Pregunta A: Autopercepción cognitiva (Escala deslizador 1-5)
  cognitiveAgility: 3,

  // Pregunta B: Hábitos y rutina de estimulación (Selección única)
  habitRoutine: 'ocasional', // 'poco' | 'ocasional' | 'diario'

  // Pregunta C: Objetivo principal de entrenamiento (Selección única)
  trainingPriority: 'memoria' // 'memoria' | 'atencion' | 'logica' | 'calculo'
})

// Opciones Pregunta A (Adultos) - Escala 1 al 5
const adultsAgilityScale = [
  {
    value: 1,
    emoji: '1️⃣',
    label: 'Frecuente olvido',
    desc: '«Olvido detalles o recados con frecuencia últimamente.»',
    color: '#ef4444'
  },
  {
    value: 2,
    emoji: '2️⃣',
    label: 'Despistes ocasionales',
    desc: '«Siento pequeños despistes ocasionales (llaves, nombres nuevos).»',
    color: '#f97316'
  },
  {
    value: 3,
    emoji: '3️⃣',
    label: 'Rendimiento normal',
    desc: '«Normal; funciono bien con la ayuda de notas o recordatorios.»',
    color: '#eab308'
  },
  {
    value: 4,
    emoji: '4️⃣',
    label: 'Buena agilidad',
    desc: '«Buena agilidad y rapidez para resolver tareas cotidianas.»',
    color: '#3b82f6'
  },
  {
    value: 5,
    emoji: '5️⃣',
    label: 'Retención excelente',
    desc: '«Excelente retención y enfoque; busco retos de alto nivel.»',
    color: '#10b981'
  }
]

// Opciones Pregunta B (Adultos) - Hábitos
const adultsHabitOptions = [
  {
    id: 'poco',
    badge: '🌱',
    title: 'Poco frecuente',
    desc: '«Casi nunca; busco crear este nuevo hábito hoy.»',
    color: '#10b981',
    bgColor: '#ecfdf5'
  },
  {
    id: 'ocasional',
    badge: '⏳',
    title: 'Ocasional',
    desc: '«1 o 2 veces por semana cuando tengo tiempo libre.»',
    color: '#6366f1',
    bgColor: '#eef2ff'
  },
  {
    id: 'diario',
    badge: '🧠',
    title: 'Hábito diario',
    desc: '«Todos los días dedico tiempo a leer o resolver pasatiempos.»',
    color: '#8b5cf6',
    bgColor: '#f5f3ff'
  }
]

// Opciones Pregunta C (Adultos) - Objetivos de entrenamiento
const adultsPriorities = [
  {
    id: 'memoria',
    title: 'Memoria activa',
    desc: 'Retención de nombres, caras, listas y recuerdos recientes.',
    icon: memoriaImg,
    color: '#ec4899',
    bgColor: '#fdf2f8'
  },
  {
    id: 'atencion',
    title: 'Atención y concentración',
    desc: 'Evitar distracciones y procesar información al detalle.',
    icon: atencionImg,
    color: '#f59e0b',
    bgColor: '#fffbeb'
  },
  {
    id: 'logica',
    title: 'Razonamiento lógico',
    desc: 'Resolución de acertijos, estrategia y deducción.',
    icon: logicaImg,
    color: '#3b82f6',
    bgColor: '#eff6ff'
  },
  {
    id: 'calculo',
    title: 'Cálculo y velocidad mental',
    desc: 'Respuestas rápidas ante cifras y operaciones.',
    icon: numeroImg,
    color: '#10b981',
    bgColor: '#ecfdf5'
  }
]

// ----------------------------------------------------
// Navigation Handlers
// ----------------------------------------------------
const handlePrev = async () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    await navigateTo('/profile-selection')
  }
}

const handleNext = async () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  } else {
    // Show Transition Screen
    isTransitioning.value = true

    if (setChildRegistered) {
      setChildRegistered(true, {
        childName: userName.value,
        documentNumber: '100200300',
        birthDate: new Date()
      })
    }

    setTimeout(async () => {
      await navigateTo('/dashboard')
    }, 2800)
  }
}
</script>

<template>
  <div class="diagnostic-page" :style="{ backgroundImage: `url(${fondoImg})` }">
    <!-- Top Navigation Bar -->
    <header class="top-navbar">
      <!-- Left: Back Button & Brand Logo -->
      <div class="navbar-left">
        <button
          type="button"
          class="nav-back-btn"
          aria-label="Volver atrás"
          @click="handlePrev"
        >
          <i class="pi pi-arrow-left"></i>
        </button>

        <div class="brand-logo" @click="navigateTo('/profile-selection')">
          <img :src="avatarImg" alt="Avatar Logo" class="brand-avatar-img" />
          <div class="brand-title">
            <span class="title-dark">Vamos</span>
            <span class="title-blue">Aprendiendo</span>
          </div>
        </div>
      </div>

      <!-- Mode Switcher Pill (Infantil vs Adulto) -->
      <div class="mode-pill-selector">
        <button
          type="button"
          class="mode-pill-btn"
          :class="{ active: activeMode === 'kids' }"
          @click="setMode('kids')"
        >
          <span>🧒 Infantil (4 a 12 años)</span>
        </button>
        <button
          type="button"
          class="mode-pill-btn"
          :class="{ active: activeMode === 'adults' }"
          @click="setMode('adults')"
        >
          <span>🧑 Adulto (18+ años)</span>
        </button>
      </div>

      <!-- Right: User Profile Chip -->
      <div class="navbar-right">
        <div class="user-chip">
          <div class="user-chip-avatar">
            <img :src="activeMode === 'kids' ? boyImg : womanImg" alt="Usuario" class="user-thumb" />
          </div>
          <span class="user-chip-name">{{ userName }}</span>
        </div>
      </div>
    </header>

    <!-- Main Content Shell -->
    <main class="main-content">
      <!-- Top Diagnostic Progress Card -->
      <section class="diagnostic-header-section">
        <div class="diagnostic-title-block">
          <div class="diagnostic-icon-badge" :class="activeMode">
            <img :src="diagnosticoImg" alt="Diagnóstico" class="diagnostic-img" />
          </div>
          <div class="diagnostic-text-group">
            <h1 class="diagnostic-heading">
              {{ activeMode === 'kids' ? 'Diagnóstico Infantil' : 'Diagnóstico Cognitivo Adulto' }}
            </h1>
            <p class="diagnostic-subheading">
              {{ activeMode === 'kids' ? 'Calibremos tus súper poderes y mapa de aventuras' : 'Personalicemos tu plan y áreas de entrenamiento cognitivo' }}
            </p>
          </div>
        </div>

        <!-- Progress Tracker -->
        <div class="progress-block">
          <span class="progress-label">
            Pregunta <strong class="text-highlight">{{ currentStep }} de {{ totalSteps }}</strong>
          </span>
          <div class="progress-track">
            <div
              class="progress-fill"
              :class="activeMode"
              :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
            ></div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- BLOQUE 1: SECCIÓN INFANTIL (Niños de 4 a 12 años)        -->
      <!-- ======================================================== -->
      <div v-if="activeMode === 'kids'" class="question-container">
        <!-- PREGUNTA A: Súper poder / Diagnóstico previo -->
        <div v-if="currentStep === 1" class="step-view">
          <div class="question-header">
            <h2 class="question-title">«¡Cuéntanos sobre tu súper poder de aprendizaje! ¿Tienes alguna misión especial en la que necesites apoyo?»</h2>
            <p class="question-instruction">Selecciona la opción que mejor describa tu forma de aprender:</p>
          </div>

          <div class="cards-grid grid-2x2">
            <div
              v-for="item in kidsSuperPowers"
              :key="item.id"
              class="quiz-card"
              :class="{ selected: kidsForm.superPower === item.id }"
              @click="kidsForm.superPower = item.id"
            >
              <div v-if="kidsForm.superPower === item.id" class="selected-badge">
                <i class="pi pi-check"></i>
              </div>

              <div class="card-icon-wrap" :style="{ backgroundColor: item.bgColor }">
                <img :src="item.icon" :alt="item.title" class="quiz-icon-img" />
              </div>

              <div class="card-info">
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-desc">{{ item.desc }}</p>
                <span class="card-tag">{{ item.badge }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PREGUNTA B: Interés lúdico y autopercepción -->
        <div v-if="currentStep === 2" class="step-view">
          <div class="question-header">
            <h2 class="question-title">«¿Qué reino te gustaría explorar primero y cómo sientes tus habilidades?»</h2>
            <p class="question-instruction">Elige tu primer destino y selecciona tu nivel de autoeficacia:</p>
          </div>

          <!-- Parte 1: Selector de Reino -->
          <div class="sub-section mb-4">
            <span class="sub-section-label">1. Selecciona tu primer reino a explorar:</span>
            <div class="cards-grid grid-2">
              <div
                v-for="realm in kidsRealms"
                :key="realm.id"
                class="quiz-card realm-card"
                :class="{ selected: kidsForm.chosenRealm === realm.id }"
                @click="kidsForm.chosenRealm = realm.id"
              >
                <div v-if="kidsForm.chosenRealm === realm.id" class="selected-badge">
                  <i class="pi pi-check"></i>
                </div>

                <div class="card-icon-wrap" style="background-color: #f1f5f9;">
                  <img :src="realm.icon" :alt="realm.title" class="quiz-icon-img" />
                </div>

                <div class="card-info">
                  <span class="card-tag">{{ realm.badgeText }}</span>
                  <h3 class="card-title">{{ realm.title }}</h3>
                  <p class="card-desc">{{ realm.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Parte 2: Escala de 3 Estrellas -->
          <div class="sub-section">
            <span class="sub-section-label">2. ¿Cómo sientes tus habilidades?:</span>
            <div class="stars-scale-grid">
              <div
                v-for="eff in kidsEfficacyLevels"
                :key="eff.level"
                class="star-scale-card"
                :class="{ selected: kidsForm.selfEfficacy === eff.level }"
                @click="kidsForm.selfEfficacy = eff.level"
              >
                <span class="medal-emoji">{{ eff.badge }}</span>
                <h4 class="scale-title">{{ eff.title }}</h4>
                <p class="scale-desc">{{ eff.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- PREGUNTA C: Estilo de juego (Multiselección máx 2) -->
        <div v-if="currentStep === 3" class="step-view">
          <div class="question-header">
            <h2 class="question-title">«¿Cómo se divierte más tu cerebro mientras aprende?»</h2>
            <p class="question-instruction">Selecciona hasta 2 opciones favoritas:</p>
          </div>

          <div class="cards-grid grid-3">
            <div
              v-for="style in kidsPlayStyleOptions"
              :key="style.id"
              class="quiz-card"
              :class="{ selected: kidsForm.playStyles.includes(style.id) }"
              @click="toggleKidsPlayStyle(style.id)"
            >
              <div v-if="kidsForm.playStyles.includes(style.id)" class="selected-badge">
                <i class="pi pi-check"></i>
              </div>

              <div class="card-icon-wrap" :style="{ backgroundColor: style.bgColor }">
                <img :src="style.icon" :alt="style.title" class="quiz-icon-img" />
              </div>

              <div class="card-info">
                <h3 class="card-title">{{ style.title }}</h3>
                <p class="card-desc">{{ style.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- BLOQUE 2: SECCIÓN ADULTO (Mayores de 18 años)            -->
      <!-- ======================================================== -->
      <div v-if="activeMode === 'adults'" class="question-container">
        <!-- PREGUNTA A: Autopercepción cognitiva (Escala 1 al 5) -->
        <div v-if="currentStep === 1" class="step-view">
          <div class="question-header">
            <h2 class="question-title">«¿Cómo describirías tu agilidad mental y memoria en el día a día?»</h2>
            <p class="question-instruction">Desliza o selecciona el nivel que mejor represente tu estado actual:</p>
          </div>

          <!-- Slider Escala Horizontal -->
          <div class="slider-interactive-card">
            <div class="slider-track-container">
              <input
                v-model.number="adultsForm.cognitiveAgility"
                type="range"
                min="1"
                max="5"
                step="1"
                class="custom-range-slider"
              />
              <div class="slider-ticks">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="tick-dot"
                  :class="{ active: adultsForm.cognitiveAgility === n }"
                  @click="adultsForm.cognitiveAgility = n"
                >
                  {{ n }}
                </span>
              </div>
            </div>

            <!-- Detail Cards of the 5 points -->
            <div class="slider-cards-row">
              <div
                v-for="item in adultsAgilityScale"
                :key="item.value"
                class="scale-point-card"
                :class="{ active: adultsForm.cognitiveAgility === item.value }"
                @click="adultsForm.cognitiveAgility = item.value"
              >
                <span class="point-emoji">{{ item.emoji }}</span>
                <h4 class="point-label">{{ item.label }}</h4>
                <p class="point-desc">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- PREGUNTA B: Hábitos y rutina de estimulación -->
        <div v-if="currentStep === 2" class="step-view">
          <div class="question-header">
            <h2 class="question-title">«¿Con qué frecuencia realizas actividades que desafíen a tu mente (lectura, crucigramas, ajedrez, cálculo)?»</h2>
            <p class="question-instruction">Selecciona la frecuencia con la que estimulas tu cerebro:</p>
          </div>

          <div class="cards-grid grid-3">
            <div
              v-for="habit in adultsHabitOptions"
              :key="habit.id"
              class="quiz-card habit-card"
              :class="{ selected: adultsForm.habitRoutine === habit.id }"
              @click="adultsForm.habitRoutine = habit.id"
            >
              <div v-if="adultsForm.habitRoutine === habit.id" class="selected-badge">
                <i class="pi pi-check"></i>
              </div>

              <div class="card-icon-wrap" :style="{ backgroundColor: habit.bgColor }">
                <span class="habit-emoji">{{ habit.badge }}</span>
              </div>

              <div class="card-info">
                <h3 class="card-title">{{ habit.title }}</h3>
                <p class="card-desc">{{ habit.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- PREGUNTA C: Objetivo principal de entrenamiento -->
        <div v-if="currentStep === 3" class="step-view">
          <div class="question-header">
            <h2 class="question-title">«¿Cuál es tu prioridad para entrenar en esta etapa?»</h2>
            <p class="question-instruction">Elige el área principal que deseas fortalecer:</p>
          </div>

          <div class="cards-grid grid-2x2">
            <div
              v-for="prio in adultsPriorities"
              :key="prio.id"
              class="quiz-card"
              :class="{ selected: adultsForm.trainingPriority === prio.id }"
              @click="adultsForm.trainingPriority = prio.id"
            >
              <div v-if="adultsForm.trainingPriority === prio.id" class="selected-badge">
                <i class="pi pi-check"></i>
              </div>

              <div class="card-icon-wrap" :style="{ backgroundColor: prio.bgColor }">
                <img :src="prio.icon" :alt="prio.title" class="quiz-icon-img" />
              </div>

              <div class="card-info">
                <h3 class="card-title">{{ prio.title }}</h3>
                <p class="card-desc">{{ prio.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Navigation Buttons -->
      <footer class="action-footer">
        <button
          type="button"
          class="btn-back"
          @click="handlePrev"
        >
          <i class="pi pi-arrow-left"></i>
          <span>Atrás</span>
        </button>

        <button
          type="button"
          class="btn-continue"
          :class="activeMode"
          @click="handleNext"
        >
          <span>{{ currentStep === totalSteps ? 'Finalizar Diagnóstico' : 'Continuar' }}</span>
          <i class="pi pi-arrow-right"></i>
        </button>
      </footer>
    </main>

    <!-- Transition Modal / Finalizing Screen -->
    <div v-if="isTransitioning" class="transition-overlay">
      <div class="transition-modal">
        <div class="transition-icon-wrap">
          <img :src="avatarImg" alt="Avatar" class="bounce-avatar" />
        </div>
        
        <h2 class="transition-title">
          {{ activeMode === 'kids' ? '¡Súper! Tus poderes están listos 🎮✨' : '¡Excelente! Perfil cognitivo calibrado 🚀🧠' }}
        </h2>
        
        <p class="transition-phrase">
          {{
            activeMode === 'kids'
              ? '«¡Súper! Tus poderes están listos. Estamos construyendo tu mapa de aventuras a tu medida... ¡A jugar! 🎮✨»'
              : '«¡Excelente! Hemos calibrado tu perfil cognitivo. Preparando tu plan de entrenamiento personalizado... 🚀🧠»'
          }}
        </p>

        <div class="loading-progress-bar">
          <div class="bar-fill-anim"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$color-brand-blue: #3b50df;
$color-brand-indigo: #6366f1;
$color-kids-purple: #4f46e5;
$color-adults-green: #10b981;
$color-text-dark: #1e293b;
$color-text-muted: #64748b;

.diagnostic-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #f1f5fb;
  background-position: center bottom;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  overflow-x: hidden;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// Top Navbar
.top-navbar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-back-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(59, 80, 223, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4338ca;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
    transform: scale(1.05);
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;

  .brand-avatar-img {
    width: 38px;
    height: 38px;
    object-fit: contain;
  }

  .brand-title {
    display: flex;
    flex-direction: column;
    line-height: 1.1;

    .title-dark {
      font-size: 1rem;
      font-weight: 800;
      color: #1e1b4b;
    }

    .title-blue {
      font-size: 1rem;
      font-weight: 800;
      color: $color-brand-blue;
    }
  }
}

// Mode Switcher Pill
.mode-pill-selector {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.3rem;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

  .mode-pill-btn {
    border: none;
    background: none;
    padding: 0.4rem 1rem;
    border-radius: 9999px;
    font-size: 0.84rem;
    font-weight: 700;
    color: $color-text-muted;
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
      background: linear-gradient(135deg, #3b50df 0%, #4f46e5 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(59, 80, 223, 0.3);
    }
  }
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.35rem 0.85rem 0.35rem 0.4rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

  .user-chip-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    background: #e0e7ff;

    .user-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-chip-name {
    font-size: 0.88rem;
    font-weight: 700;
    color: $color-text-dark;
  }
}

// Main Content
.main-content {
  position: relative;
  z-index: 5;
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 0.5rem 1.5rem 2.5rem;
}

// Diagnostic Header Card
.diagnostic-header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 1.25rem 1.75rem;
  box-shadow: 0 10px 30px -10px rgba(59, 80, 223, 0.08);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.diagnostic-title-block {
  display: flex;
  align-items: center;
  gap: 1.15rem;

  .diagnostic-icon-badge {
    width: 54px;
    height: 54px;
    border-radius: 18px;
    background: #e0e7ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.adults {
      background: #dcfce7;
    }

    .diagnostic-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
  }

  .diagnostic-text-group {
    .diagnostic-heading {
      font-size: 1.35rem;
      font-weight: 800;
      color: $color-text-dark;
      margin: 0 0 0.15rem 0;
    }

    .diagnostic-subheading {
      font-size: 0.88rem;
      color: $color-text-muted;
      margin: 0;
    }
  }
}

.progress-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  min-width: 180px;

  @media (max-width: 768px) {
    align-items: flex-start;
    width: 100%;
  }

  .progress-label {
    font-size: 0.84rem;
    color: #64748b;
    font-weight: 600;

    .text-highlight {
      color: $color-brand-blue;
      font-weight: 800;
    }
  }

  .progress-track {
    width: 100%;
    height: 10px;
    background-color: #e2e8f0;
    border-radius: 9999px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 9999px;
      transition: width 0.4s ease;

      &.adults {
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      }
    }
  }
}

// Question Title Header
.question-header {
  text-align: center;
  margin-bottom: 1.75rem;

  .question-title {
    font-size: 1.5rem;
    font-weight: 900;
    color: $color-text-dark;
    margin: 0 0 0.4rem 0;
    line-height: 1.3;
    letter-spacing: -0.02em;

    @media (max-width: 640px) {
      font-size: 1.25rem;
    }
  }

  .question-instruction {
    font-size: 0.95rem;
    color: $color-text-muted;
    font-weight: 500;
    margin: 0;
  }
}

// Cards Grid Layouts
.cards-grid {
  display: grid;
  gap: 1.25rem;
  margin-bottom: 2rem;

  &.grid-2x2 {
    grid-template-columns: repeat(2, 1fr);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &.grid-2 {
    grid-template-columns: repeat(2, 1fr);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &.grid-3 {
    grid-template-columns: repeat(3, 1fr);

    @media (max-width: 860px) {
      grid-template-columns: 1fr;
    }
  }
}

// Interactive Quiz Card
.quiz-card {
  position: relative;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 1.4rem;
  display: flex;
  align-items: center;
  gap: 1.15rem;
  box-shadow: 0 8px 24px -6px rgba(59, 80, 223, 0.08);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px -8px rgba(59, 80, 223, 0.16);
  }

  &.selected {
    background: #ffffff;
    border-color: #6366f1;
    box-shadow: 0 16px 36px -8px rgba(99, 102, 241, 0.25);
    transform: translateY(-2px);
  }

  .selected-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #6366f1;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  }

  .card-icon-wrap {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .quiz-icon-img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }

    .habit-emoji {
      font-size: 1.85rem;
    }
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .card-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: $color-text-dark;
      margin: 0;
    }

    .card-desc {
      font-size: 0.85rem;
      color: $color-text-muted;
      margin: 0;
      line-height: 1.35;
    }

    .card-tag {
      display: inline-block;
      align-self: flex-start;
      margin-top: 0.35rem;
      padding: 0.2rem 0.6rem;
      background: #f1f5f9;
      color: #475569;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
    }
  }
}

// Sub Sections & Star Scales
.sub-section {
  .sub-section-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 800;
    color: $color-text-dark;
    margin-bottom: 0.75rem;
  }
}

.stars-scale-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .star-scale-card {
    background: rgba(255, 255, 255, 0.94);
    border: 2px solid rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 1.25rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      transform: translateY(-3px);
    }

    &.selected {
      border-color: #6366f1;
      background: #ffffff;
      box-shadow: 0 12px 28px -6px rgba(99, 102, 241, 0.2);
    }

    .medal-emoji {
      font-size: 2.2rem;
      margin-bottom: 0.4rem;
      display: block;
    }

    .scale-title {
      font-size: 1rem;
      font-weight: 800;
      color: $color-text-dark;
      margin: 0 0 0.25rem 0;
    }

    .scale-desc {
      font-size: 0.82rem;
      color: $color-text-muted;
      margin: 0;
    }
  }
}

// Slider Interactive Section (Adults Pregunta A)
.slider-interactive-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 2rem 1.75rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;

  .slider-track-container {
    padding: 0 1rem 1.5rem;
    position: relative;

    .custom-range-slider {
      width: 100%;
      height: 8px;
      border-radius: 9999px;
      background: #e2e8f0;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
        cursor: pointer;
        transition: transform 0.15s ease;

        &:hover {
          transform: scale(1.15);
        }
      }
    }

    .slider-ticks {
      display: flex;
      justify-content: space-between;
      margin-top: 0.75rem;

      .tick-dot {
        font-size: 0.85rem;
        font-weight: 800;
        color: #94a3b8;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 8px;

        &.active {
          color: #10b981;
          background: #ecfdf5;
          font-size: 1rem;
        }
      }
    }
  }

  .slider-cards-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.75rem;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }

    .scale-point-card {
      background: #f8fafc;
      border: 2px solid transparent;
      border-radius: 16px;
      padding: 1rem 0.75rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #ffffff;
        border-color: #cbd5e1;
      }

      &.active {
        background: #ffffff;
        border-color: #10b981;
        box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.2);
        transform: translateY(-2px);
      }

      .point-emoji {
        font-size: 1.5rem;
        display: block;
        margin-bottom: 0.25rem;
      }

      .point-label {
        font-size: 0.82rem;
        font-weight: 800;
        color: $color-text-dark;
        margin: 0 0 0.2rem 0;
      }

      .point-desc {
        font-size: 0.74rem;
        color: $color-text-muted;
        margin: 0;
        line-height: 1.3;
      }
    }
  }
}

// Action Navigation Footer
.action-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  color: #475569;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
    border-color: #cbd5e1;
    color: $color-brand-blue;
    transform: translateY(-1px);
  }
}

.btn-continue {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 2.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  border-radius: 9999px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px -4px rgba(79, 70, 229, 0.45);
  transition: all 0.2s ease;

  &.adults {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 8px 24px -4px rgba(16, 185, 129, 0.45);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px -4px rgba(79, 70, 229, 0.6);
  }
}

// Transition / Finalizing Overlay
.transition-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.transition-modal {
  background: #ffffff;
  border-radius: 32px;
  padding: 3rem 2.5rem;
  max-width: 560px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  .transition-icon-wrap {
    margin-bottom: 1.25rem;

    .bounce-avatar {
      width: 110px;
      height: 110px;
      object-fit: contain;
      animation: gentleBreathe 2s ease-in-out infinite alternate;
    }
  }

  .transition-title {
    font-size: 1.6rem;
    font-weight: 900;
    color: $color-text-dark;
    margin: 0 0 0.75rem 0;
  }

  .transition-phrase {
    font-size: 1.05rem;
    color: $color-text-muted;
    line-height: 1.5;
    margin: 0 0 2rem 0;
    font-style: italic;
  }

  .loading-progress-bar {
    width: 100%;
    height: 8px;
    background-color: #f1f5f9;
    border-radius: 9999px;
    overflow: hidden;

    .bar-fill-anim {
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, #6366f1, #10b981, #3b82f6);
      border-radius: 9999px;
      animation: fillBar 2.5s ease-out forwards;
    }
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes gentleBreathe {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-8px);
  }
}

@keyframes fillBar {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
</style>
