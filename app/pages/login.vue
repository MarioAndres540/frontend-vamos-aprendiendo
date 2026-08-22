<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

// Asset imports
import avatarImg from '~/assets/img/avatar.png'
import boyImg from '~/assets/img/boy.png'
import grilImg from '~/assets/img/gril.png'
import menImg from '~/assets/img/men.png'
import womanImg from '~/assets/img/woman.png'
import oldMenImg from '~/assets/img/old-men.png'
import oldWomanImg from '~/assets/img/old-woman.png'
import fondoImg from '~/assets/img/fondo.png'

definePageMeta({
  middleware: 'guest'
})

const { login, loading, error: authError } = useAuth()

const form = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.email || !form.password) return
  await login(form.email, form.password)
}

// Character pairs for the animated cycle:
// 1) boy + gril
// 2) men + woman
// 3) old-men + old-woman
const characterPairs = [
  {
    id: 'kids',
    title: 'Niños',
    left: boyImg,
    right: grilImg,
    altLeft: 'Niño estudiante',
    altRight: 'Niña estudiante'
  },
  {
    id: 'adults',
    title: 'Adultos',
    left: menImg,
    right: womanImg,
    altLeft: 'Hombre aprendiendo',
    altRight: 'Mujer aprendiendo'
  },
  {
    id: 'elders',
    title: 'Adultos Mayores',
    left: oldMenImg,
    right: oldWomanImg,
    altLeft: 'Adulto mayor',
    altRight: 'Adulta mayor'
  }
]

const currentPairIndex = ref(0)
let cycleTimer: ReturnType<typeof setInterval> | null = null

const startCycle = () => {
  if (cycleTimer) clearInterval(cycleTimer)
  cycleTimer = setInterval(() => {
    currentPairIndex.value = (currentPairIndex.value + 1) % characterPairs.length
  }, 4500)
}

const setPair = (index: number) => {
  currentPairIndex.value = index
  startCycle() // Reset timer on manual change
}

onMounted(() => {
  startCycle()
})

onUnmounted(() => {
  if (cycleTimer) clearInterval(cycleTimer)
})

const handleGoogleLogin = () => {
  // Google authentication placeholder
  console.log('Google login clicked')
}
</script>

<template>
  <div class="page-container" :style="{ backgroundImage: `url(${fondoImg})` }">
    <!-- Top Navigation Header -->
    <header class="top-header">
      <div class="brand-logo">
        <img :src="avatarImg" alt="Avatar Logo" class="avatar-logo-img" />
        <div class="brand-text">
          <span class="brand-name-top">Vamos</span>
          <span class="brand-name-sub">Aprendiendo</span>
        </div>
      </div>

      <button type="button" class="help-button" aria-label="Necesitas ayuda">
        <span>¿Necesitas ayuda?</span>
        <i class="pi pi-question-circle"></i>
      </button>
    </header>

    <!-- Main Content Grid -->
    <main class="main-content">
      <!-- Left Hero Showcase Area -->
      <section class="hero-section">
        <!-- Floating 3D Cards / Badges (positioned precisely within the hero area) -->
        <div class="floating-badge badge-letter-a">
          <span>A</span>
        </div>
        <div class="floating-badge badge-star">
          <i class="pi pi-star-fill"></i>
        </div>
        <div class="floating-badge badge-math">
          <span>1+2</span>
        </div>

        <div class="hero-titles">
          <h1 class="hero-title">
            <span class="title-dark">Vamos</span>
            <span class="title-blue">Aprendiendo</span>
          </h1>
          <p class="hero-tagline">Aprender es crecer cada día</p>
        </div>

        <!-- Character Cycling Showcase -->
        <div class="characters-stage">
          <Transition name="characters-fade" mode="out-in">
            <div :key="currentPairIndex" class="characters-pair">
              <div class="character-wrapper left-char">
                <img
                  :src="characterPairs[currentPairIndex].left"
                  :alt="characterPairs[currentPairIndex].altLeft"
                  class="character-img"
                />
              </div>
              <div class="character-wrapper right-char">
                <img
                  :src="characterPairs[currentPairIndex].right"
                  :alt="characterPairs[currentPairIndex].altRight"
                  class="character-img"
                />
              </div>
            </div>
          </Transition>

          <!-- Pair Indicator Dots -->
          <div class="stage-indicators">
            <button
              v-for="(_, index) in characterPairs"
              :key="index"
              type="button"
              class="indicator-dot"
              :class="{ active: currentPairIndex === index }"
              :aria-label="`Ver personajes etapa ${index + 1}`"
              @click="setPair(index)"
            ></button>
          </div>
        </div>
      </section>

      <!-- Right Login Card Section -->
      <section class="form-section">
        <div class="login-card">
          <div class="card-header">
            <h2 class="card-title">¡Bienvenido de nuevo!</h2>
            <p class="card-subtitle">Inicia sesión para continuar aprendiendo</p>
          </div>

          <!-- PrimeVue Error Message -->
          <div v-if="authError" class="error-banner">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ authError }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Field: Usuario / Email -->
            <div class="form-group">
              <label for="username-email">Usuario</label>
              <div class="input-wrapper">
                <i class="pi pi-user input-icon"></i>
                <input
                  id="username-email"
                  v-model="form.email"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  required
                  :disabled="loading"
                  class="custom-input"
                />
              </div>
            </div>

            <!-- Field: Contraseña -->
            <div class="form-group">
              <label for="password">Contraseña</label>
              <div class="input-wrapper">
                <i class="pi pi-lock input-icon"></i>
                <Password
                  id="password"
                  v-model="form.password"
                  :feedback="false"
                  toggleMask
                  placeholder="Ingresa tu contraseña"
                  required
                  :disabled="loading"
                  class="w-full prime-password"
                  inputClass="custom-input custom-input-password"
                />
              </div>
            </div>

            <!-- Forgot Password Link -->
            <div class="forgot-container">
              <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="submit-button"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>Iniciar sesión</span>
            </button>

            <!-- Divider -->
            <div class="divider">
              <span class="divider-line"></span>
              <span class="divider-text">o continúa con</span>
              <span class="divider-line"></span>
            </div>

            <!-- Google Sign-In Button (Apple removed) -->
            <button
              type="button"
              class="social-button google-btn"
              @click="handleGoogleLogin"
            >
              <svg class="google-svg" viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <!-- Register Footer Link -->
            <div class="register-footer">
              <span>¿No tienes cuenta?</span>
              <NuxtLink to="/register" class="register-link">Regístrate</NuxtLink>
            </div>
          </form>
        </div>
      </section>
    </main>

    <!-- Bottom Shield Badge -->
    <footer class="bottom-footer">
      <div class="security-badge">
        <i class="pi pi-shield"></i>
        <span>Entorno seguro y protegido para aprender</span>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
// Design Tokens & Palettes
$color-brand-blue: #3b50df;
$color-brand-blue-hover: #2e41c4;
$color-brand-dark: #111827;
$color-brand-purple: #8b5cf6;
$color-brand-green: #10b981;
$color-brand-orange: #f59e0b;

$text-dark-title: #1e293b;
$text-dark-body: #334155;
$text-muted: #64748b;
$text-placeholder: #94a3b8;

$border-light: #e2e8f0;
$border-focus: #3b50df;

.page-container {
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

// Top Header
.top-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2.5rem 0.25rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  text-decoration: none;
  cursor: pointer;

  .avatar-logo-img {
    width: 140px;
    height: 140px;
    object-fit: contain;
    filter: drop-shadow(0 6px 16px rgba(59, 80, 223, 0.22));
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.04) rotate(-2deg);
    }

    @media (max-width: 768px) {
      width: 90px;
      height: 90px;
    }
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;

    .brand-name-top {
      font-size: 1.45rem;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.01em;

      @media (max-width: 768px) {
        font-size: 1.15rem;
      }
    }

    .brand-name-sub {
      font-size: 1.45rem;
      font-weight: 800;
      color: $color-brand-blue;
      letter-spacing: -0.01em;

      @media (max-width: 768px) {
        font-size: 1.15rem;
      }
    }
  }
}

.help-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.15rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(203, 213, 225, 0.85);
  border-radius: 9999px;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  i {
    font-size: 1rem;
    color: #64748b;
  }

  &:hover {
    background: #ffffff;
    border-color: #cbd5e1;
    color: $color-brand-blue;
    box-shadow: 0 4px 12px rgba(59, 80, 223, 0.12);

    i {
      color: $color-brand-blue;
    }
  }
}

// Main Content Layout
.main-content {
  position: relative;
  z-index: 5;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 2rem;
  align-items: center;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2.5rem 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding: 0.75rem 1.5rem 2rem;
  }
}

// Left Hero Section
.hero-section {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 500px;
  padding-right: 1.5rem;

  @media (max-width: 1024px) {
    min-height: auto;
    padding-right: 0;
    align-items: center;
    text-align: center;
  }
}

.hero-titles {
  position: relative;
  z-index: 4;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;

  .hero-title {
    display: flex;
    flex-direction: column;
    font-size: 3.35rem;
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -0.03em;
    margin: 0 0 0.65rem 0;

    @media (max-width: 768px) {
      font-size: 2.4rem;
    }

    .title-dark {
      color: #181c32;
    }

    .title-blue {
      color: #3b50df;
    }
  }

  .hero-tagline {
    font-size: 1.3rem;
    font-weight: 500;
    color: #64748b;
    margin: 0;
  }
}

// Floating Badges (contained strictly inside the left hero area)
.floating-badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
  font-weight: 800;
  color: #ffffff;
  z-index: 3;
  animation: floatSlow 4s ease-in-out infinite alternate;
  user-select: none;

  &.badge-letter-a {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    top: 2%;
    left: 280px;
    font-size: 1.75rem;
    transform: rotate(12deg);
    animation-delay: 0s;
  }

  &.badge-star {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #6ee7b7, #34d399);
    top: 45%;
    left: -10px;
    font-size: 1.5rem;
    transform: rotate(-10deg);
    animation-delay: 1.2s;
  }

  &.badge-math {
    width: 66px;
    height: 50px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    top: 48%;
    left: 310px;
    font-size: 1.2rem;
    transform: rotate(6deg);
    animation-delay: 2s;
  }

  @media (max-width: 1024px) {
    display: none;
  }
}

// Characters Stage
.characters-stage {
  position: relative;
  z-index: 4;
  margin-top: auto;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.characters-pair {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.25rem;
  width: 100%;
  min-height: 280px;
}

.character-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;

  .character-img {
    max-height: 270px;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    filter: drop-shadow(0 15px 25px rgba(30, 41, 59, 0.18));
    animation: gentleBreathe 4s ease-in-out infinite alternate;
  }

  &.right-char .character-img {
    animation-delay: 1.5s;
  }
}

.stage-indicators {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;

  .indicator-dot {
    width: 28px;
    height: 6px;
    border-radius: 9999px;
    background-color: rgba(148, 163, 184, 0.4);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      width: 42px;
      background-color: $color-brand-blue;
      box-shadow: 0 2px 8px rgba(59, 80, 223, 0.35);
    }

    &:hover:not(.active) {
      background-color: rgba(148, 163, 184, 0.7);
    }
  }
}

// Characters Transition Animations
.characters-fade-enter-active,
.characters-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.characters-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.characters-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.95);
}

// Right Form Section & Card
.form-section {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 28px;
  padding: 2.35rem 2.25rem;
  box-shadow:
    0 20px 40px -15px rgba(59, 80, 223, 0.12),
    0 10px 20px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(226, 232, 240, 0.8);

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
  }
}

.card-header {
  text-align: center;
  margin-bottom: 1.6rem;

  .card-title {
    font-size: 1.65rem;
    font-weight: 800;
    color: $text-dark-title;
    margin: 0 0 0.35rem 0;
    letter-spacing: -0.02em;
  }

  .card-subtitle {
    font-size: 0.92rem;
    color: $text-muted;
    margin: 0;
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.88rem;
    font-weight: 600;
    color: $text-dark-body;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  .input-icon {
    position: absolute;
    left: 14px;
    font-size: 1.05rem;
    color: #94a3b8;
    z-index: 2;
    pointer-events: none;
  }

  .custom-input {
    width: 100%;
    height: 48px;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    background-color: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    color: #1e293b;
    outline: none;
    transition: all 0.2s ease;

    &::placeholder {
      color: #94a3b8;
    }

    &:focus {
      border-color: $color-brand-blue;
      box-shadow: 0 0 0 3px rgba(59, 80, 223, 0.15);
    }

    &:disabled {
      background-color: #f8fafc;
      cursor: not-allowed;
    }
  }

  :deep(.prime-password) {
    width: 100%;

    .p-password-input {
      width: 100%;
      height: 48px;
      padding-left: 2.75rem !important;
      padding-right: 2.75rem !important;
      background-color: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      color: #1e293b;
      outline: none;
      transition: all 0.2s ease;

      &::placeholder {
        color: #94a3b8;
      }

      &:focus {
        border-color: $color-brand-blue;
        box-shadow: 0 0 0 3px rgba(59, 80, 223, 0.15);
      }
    }

    .p-password-toggle-mask-icon {
      right: 14px;
      color: #94a3b8;
    }
  }
}

.forgot-container {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.25rem;

  .forgot-link {
    font-size: 0.84rem;
    font-weight: 600;
    color: $color-brand-blue;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: underline;
      color: $color-brand-blue-hover;
    }
  }
}

.submit-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #3b50df 0%, #4338ca 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.25rem;
  box-shadow: 0 8px 20px -4px rgba(59, 80, 223, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #3244cc 0%, #3730a3 100%);
    box-shadow: 0 10px 24px -4px rgba(59, 80, 223, 0.6);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.25rem 0;

  .divider-line {
    flex: 1;
    height: 1px;
    background-color: #e2e8f0;
  }

  .divider-text {
    font-size: 0.82rem;
    color: #94a3b8;
    font-weight: 500;
  }
}

.social-button {
  width: 100%;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  .google-svg {
    flex-shrink: 0;
  }
}

.register-footer {
  text-align: center;
  font-size: 0.88rem;
  color: #64748b;
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  align-items: center;

  .register-link {
    color: $color-brand-blue;
    font-weight: 700;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: underline;
      color: $color-brand-blue-hover;
    }
  }
}

// Bottom Footer Badge
.bottom-footer {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding: 1rem 1rem 1.75rem;
}

.security-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.4rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 9999px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;

  i {
    color: #10b981;
    font-size: 0.95rem;
  }
}

// Keyframe Animations
@keyframes floatSlow {
  0% {
    transform: translateY(0px) rotate(var(--rot, 0deg));
  }
  100% {
    transform: translateY(-10px) rotate(var(--rot, 0deg));
  }
}

@keyframes gentleBreathe {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-6px);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
