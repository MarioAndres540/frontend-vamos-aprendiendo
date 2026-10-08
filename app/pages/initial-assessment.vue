<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAssessment, type AssessmentAnswerItem } from '~/composables/useAssessment'
import { useAuth } from '~/composables/useAuth'

// Asset imports
import avatarImg from '~/assets/img/avatar.png'
import fondoImg from '~/assets/img/fondo.png'
import boyImg from '~/assets/img/boy.png'
import womanImg from '~/assets/img/woman.png'

// Formulario inicial: tutores y adultos solo hasta completarlo; testers siempre (el middleware lo controla)
definePageMeta({
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const { profileType } = useAuth()
const { kidsQuestions, adultsQuestions, submitAssessment, loading, error, lastResult } = useAssessment()

// Versión según el perfil: tutor → niños, adulto → memoria y prevención. Solo el tester puede elegir.
const fixedTarget = computed(() => assessmentTargetFor(profileType.value))
const canChooseTarget = computed(() => fixedTarget.value === null)

// Modo de evaluación seleccionado: 'nino' o 'adulto'
const selectedTarget = ref<'nino' | 'adulto'>(fixedTarget.value ?? 'nino')
const currentQuestionIndex = ref(0)
const showResultsModal = ref(false)

// Respuestas actuales: Map<questionId, score>
const answersMap = ref<Record<number, number>>({})

const activeQuestions = computed(() => {
  return selectedTarget.value === 'nino' ? kidsQuestions : adultsQuestions
})

const currentQuestion = computed(() => {
  return activeQuestions.value[currentQuestionIndex.value]
})

const progressPercentage = computed(() => {
  return Math.round(((currentQuestionIndex.value + 1) / activeQuestions.value.length) * 100)
})

const isCurrentAnswered = computed(() => {
  return currentQuestion.value ? !!answersMap.value[currentQuestion.value.id] : false
})

const isAllAnswered = computed(() => {
  return activeQuestions.value.every((q) => !!answersMap.value[q.id])
})

const selectScore = (score: number) => {
  if (currentQuestion.value) {
    answersMap.value[currentQuestion.value.id] = score
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < activeQuestions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const changeTarget = (target: 'nino' | 'adulto') => {
  if (!canChooseTarget.value) return
  selectedTarget.value = target
  currentQuestionIndex.value = 0
  answersMap.value = {}
}

const handleFinalSubmit = async () => {
  const payloadAnswers: AssessmentAnswerItem[] = activeQuestions.value.map((q) => ({
    questionId: q.id,
    dimension: q.dimension,
    score: answersMap.value[q.id] || 1,
  }))

  const result = await submitAssessment(selectedTarget.value, payloadAnswers)
  if (result) {
    showResultsModal.value = true
  }
}

const goToDashboard = async () => {
  await navigateTo('/dashboard')
}

// Opciones de la escala Likert (1 a 5)
const likertOptions = [
  { value: 1, label: 'Nunca / Nada', icon: 'pi pi-thumbs-up', color: '#10b981' },
  { value: 2, label: 'Rara vez', icon: 'pi pi-check', color: '#3b82f6' },
  { value: 3, label: 'A veces', icon: 'pi pi-minus', color: '#f59e0b' },
  { value: 4, label: 'Frecuentemente', icon: 'pi pi-exclamation-triangle', color: '#f97316' },
  { value: 5, label: 'Siempre / Notable', icon: 'pi pi-exclamation-circle', color: '#ef4444' },
]
</script>

<template>
  <div class="assessment-page" :style="{ backgroundImage: `url(${fondoImg})` }">
    <div class="assessment-overlay"></div>

    <main class="assessment-container">
      <!-- Encabezado con Logo y Selector de Perfil -->
      <header class="assessment-header">
        <div class="brand-row">
          <img :src="avatarImg" alt="Vamos Aprendiendo" class="brand-logo" />
          <div>
            <h1 class="brand-title">Diagnóstico y Evaluación Inicial</h1>
            <p class="brand-subtitle">Adaptación del plan de aprendizaje personalizado</p>
          </div>
        </div>

        <!-- Selector de Tipo de Evaluación (solo testers; tutor y adulto tienen su versión fija) -->
        <div v-if="canChooseTarget" class="target-switcher">
          <button
            type="button"
            class="target-btn"
            :class="{ active: selectedTarget === 'nino' }"
            @click="changeTarget('nino')"
          >
            <img :src="boyImg" alt="Niño" class="btn-avatar" />
            <span>Niño / Estudiante</span>
          </button>
          <button
            type="button"
            class="target-btn"
            :class="{ active: selectedTarget === 'adulto' }"
            @click="changeTarget('adulto')"
          >
            <img :src="womanImg" alt="Adulto" class="btn-avatar" />
            <span>Adulto / Mayor</span>
          </button>
        </div>
      </header>

      <!-- Barra de Progreso -->
      <div class="progress-section">
        <div class="progress-labels">
          <span class="step-counter">Pregunta {{ currentQuestionIndex + 1 }} de {{ activeQuestions.length }}</span>
          <span class="progress-val">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>

      <!-- Tarjeta de Pregunta Activa -->
      <section v-if="currentQuestion" class="question-card">
        <div class="question-header">
          <span class="dimension-badge">
            <i class="pi pi-bookmark mr-1"></i> Área: {{ currentQuestion.dimension }}
          </span>
          <h2 class="question-title">{{ currentQuestion.title }}</h2>
          <p class="question-desc">{{ currentQuestion.description }}</p>
        </div>

        <!-- Escala Likert de Selección -->
        <div class="likert-grid">
          <button
            v-for="opt in likertOptions"
            :key="opt.value"
            type="button"
            class="likert-btn"
            :class="{ selected: answersMap[currentQuestion.id] === opt.value }"
            @click="selectScore(opt.value)"
          >
            <div class="likert-circle" :style="{ borderColor: opt.color }">
              <i :class="opt.icon" :style="{ color: opt.color }"></i>
            </div>
            <span class="likert-score">{{ opt.value }}</span>
            <span class="likert-label">{{ opt.label }}</span>
          </button>
        </div>

        <!-- Mensaje de Error si ocurre -->
        <p v-if="error" class="error-msg">
          <i class="pi pi-exclamation-circle mr-1"></i> {{ error }}
        </p>

        <!-- Navegación Entre Preguntas -->
        <div class="nav-actions">
          <button
            type="button"
            class="btn-nav btn-prev"
            :disabled="currentQuestionIndex === 0"
            @click="prevQuestion"
          >
            <i class="pi pi-arrow-left mr-2"></i> Anterior
          </button>

          <button
            v-if="currentQuestionIndex < activeQuestions.length - 1"
            type="button"
            class="btn-nav btn-next"
            :disabled="!isCurrentAnswered"
            @click="nextQuestion"
          >
            Siguiente <i class="pi pi-arrow-right ml-2"></i>
          </button>

          <button
            v-else
            type="button"
            class="btn-nav btn-submit"
            :disabled="!isAllAnswered || loading"
            @click="handleFinalSubmit"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
            <span v-else>Finalizar Evaluación <i class="pi pi-check ml-2"></i></span>
          </button>
        </div>
      </section>
    </main>

    <!-- Modal de Resultados Diagnósticos -->
    <div v-if="showResultsModal && lastResult" class="results-modal-overlay">
      <div class="results-modal-card">
        <div class="results-icon-wrap" :class="`risk-${lastResult.riskLevel}`">
          <i class="pi pi-verified"></i>
        </div>
        <h3 class="results-title">¡Evaluación Inicial Completada!</h3>
        <p class="results-subtitle">Tu perfil pedagógico ha sido configurado con éxito.</p>

        <div class="results-summary-box">
          <div class="summary-item">
            <span class="lbl">Puntaje Total</span>
            <strong class="val">{{ lastResult.totalScore }} / {{ lastResult.maxScore }} pts</strong>
          </div>
          <div class="summary-item">
            <span class="lbl">Nivel de Alerta</span>
            <span class="badge-risk" :class="`badge-${lastResult.riskLevel}`">
              {{ lastResult.riskLevel.toUpperCase() }}
            </span>
          </div>
          <div class="summary-item">
            <span class="lbl">Área Principal</span>
            <strong class="val capitalize">{{ lastResult.primaryCondition }}</strong>
          </div>
        </div>

        <p class="results-recommendations">
          <i class="pi pi-compass mr-1"></i> {{ lastResult.recommendations }}
        </p>

        <button type="button" class="btn-confirm-finish" @click="goToDashboard">
          Ir al Panel Principal <i class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.assessment-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

.assessment-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
}

.assessment-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 820px;
}

.assessment-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);

  .brand-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;

    .brand-logo {
      width: 48px;
      height: 48px;
    }

    .brand-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #1e1b4b;
      margin: 0;
    }

    .brand-subtitle {
      font-size: 0.88rem;
      color: #64748b;
      margin: 0;
    }
  }
}

.target-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  .target-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #f1f5f9;
    border: 2px solid transparent;
    border-radius: 14px;
    font-weight: 700;
    font-size: 0.95rem;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s ease;

    .btn-avatar {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    &.active {
      background: #eef2ff;
      border-color: #6366f1;
      color: #4f46e5;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }
  }
}

.progress-section {
  margin-bottom: 1.25rem;

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.4rem;
  }

  .progress-track {
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8 0%, #6366f1 100%);
      transition: width 0.3s ease;
    }
  }
}

.question-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 2.25rem;
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.2);

  .dimension-badge {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 0.78rem;
    font-weight: 700;
    border-radius: 9999px;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  .question-title {
    font-size: 1.35rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.5rem;
  }

  .question-desc {
    font-size: 1.05rem;
    color: #475569;
    line-height: 1.5;
    margin-bottom: 2rem;
  }
}

.likert-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  .likert-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.25rem 0.5rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    .likert-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .likert-score {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e293b;
    }

    .likert-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      text-align: center;
      margin-top: 0.25rem;
    }

    &:hover {
      border-color: #94a3b8;
      background: #f1f5f9;
    }

    &.selected {
      border-color: #6366f1;
      background: #eef2ff;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);

      .likert-score {
        color: #4f46e5;
      }
    }
  }
}

.nav-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .btn-nav {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;

    &.btn-prev {
      background: #f1f5f9;
      color: #475569;

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    &.btn-next,
    &.btn-submit {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }
    }
  }
}

.error-msg {
  color: #ef4444;
  font-weight: 600;
  font-size: 0.88rem;
  margin-bottom: 1rem;
}

// Modal de Resultados
.results-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.results-modal-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 520px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  .results-icon-wrap {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    background: #dcfce7;
    color: #16a34a;
  }

  .results-title {
    font-size: 1.45rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.35rem;
  }

  .results-subtitle {
    font-size: 0.92rem;
    color: #64748b;
    margin-bottom: 1.5rem;
  }

  .results-summary-box {
    background: #f8fafc;
    border-radius: 16px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.25rem;
    display: flex;
    justify-content: space-around;

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .lbl {
        font-size: 0.75rem;
        color: #94a3b8;
        font-weight: 600;
      }

      .val {
        font-size: 0.95rem;
        color: #1e293b;
      }
    }
  }

  .badge-risk {
    padding: 0.25rem 0.65rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 800;

    &.badge-bajo {
      background: #dcfce7;
      color: #15803d;
    }
    &.badge-moderado {
      background: #fef3c7;
      color: #b45309;
    }
    &.badge-alto {
      background: #fee2e2;
      color: #b91c1c;
    }
  }

  .results-recommendations {
    font-size: 0.88rem;
    color: #334155;
    background: #eef2ff;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    text-align: left;
    line-height: 1.4;
  }

  .btn-confirm-finish {
    width: 100%;
    padding: 0.85rem;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: #ffffff;
    font-weight: 700;
    font-size: 1rem;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  }
}
</style>
