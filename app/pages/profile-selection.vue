<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  middleware: 'auth'
})

const { user, logout } = useAuth()

// Display name from authenticated user or fallback
const userName = computed(() => {
  if (user.value?.firstName) {
    return `${user.value.firstName} ${user.value.lastName || ''}`.trim()
  }
  if (user.value?.name) return user.value.name
  if (user.value?.email) return user.value.email.split('@')[0]
  return 'Juan Pérez'
})

// Niños character rotation (boy <-> gril)
const kidsCharacters = [
  { img: boyImg, alt: 'Niño' },
  { img: grilImg, alt: 'Niña' }
]
const currentKidIndex = ref(0)

// Adultos character rotation (men -> woman -> old-men -> old-woman)
const adultsCharacters = [
  { img: womanImg, alt: 'Mujer' },
  { img: menImg, alt: 'Hombre' },
  { img: oldWomanImg, alt: 'Adulta mayor' },
  { img: oldMenImg, alt: 'Adulto mayor' }
]
const currentAdultIndex = ref(0)

let kidsTimer: ReturnType<typeof setInterval> | null = null
let adultsTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Rotate kids characters every 3.5s
  kidsTimer = setInterval(() => {
    currentKidIndex.value = (currentKidIndex.value + 1) % kidsCharacters.length
  }, 3500)

  // Rotate adults characters every 4s
  adultsTimer = setInterval(() => {
    currentAdultIndex.value = (currentAdultIndex.value + 1) % adultsCharacters.length
  }, 4000)
})

onUnmounted(() => {
  if (kidsTimer) clearInterval(kidsTimer)
  if (adultsTimer) clearInterval(adultsTimer)
})

// Navigation actions
const selectKids = async () => {
  await navigateTo('/child-registration?mode=kids')
}

const selectAdults = async () => {
  await navigateTo('/child-registration?mode=adults')
}
</script>

<template>
  <div class="selection-container" :style="{ backgroundImage: `url(${fondoImg})` }">
    <!-- Top Header Navigation Bar -->
    <header class="top-navbar">
      <!-- User Profile Badge (Top Left) -->
      <div class="user-profile-badge">
        <div class="user-avatar-circle">
          <img :src="boyImg" alt="Avatar usuario" class="profile-thumb" />
        </div>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">Perfil</span>
        </div>
      </div>

      <!-- Settings / Configuration Button (Top Right) -->
      <div class="header-actions">
        <button
          type="button"
          class="settings-btn"
          aria-label="Configuración"
          @click="navigateTo('/home')"
        >
          <i class="pi pi-cog"></i>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Floating Decorative Badges -->
      <div class="floating-badge badge-letter-a">
        <span>A</span>
      </div>
      <div class="floating-badge badge-math">
        <span>1+2</span>
      </div>
      <div class="floating-badge badge-star">
        <i class="pi pi-star-fill"></i>
      </div>

      <!-- Center Logo & Heading Section -->
      <div class="brand-hero">
        <div class="avatar-logo-wrap">
          <img :src="avatarImg" alt="Avatar Logo" class="avatar-logo-img" />
        </div>
        <h1 class="brand-title">
          <span class="title-dark">Vamos</span>
          <span class="title-blue">Aprendiendo</span>
        </h1>
        <p class="brand-subtitle">¿Quién está aprendiendo hoy?</p>
      </div>

      <!-- Audience Selection Cards -->
      <div class="cards-grid">
        <!-- Card 1: Niños -->
        <div class="profile-card kids-card" @click="selectKids">
          <div class="card-avatar-wrapper kids-avatar-bg">
            <Transition name="avatar-pop" mode="out-in">
              <img
                :key="currentKidIndex"
                :src="kidsCharacters[currentKidIndex].img"
                :alt="kidsCharacters[currentKidIndex].alt"
                class="card-character-img"
              />
            </Transition>
          </div>

          <div class="card-content">
            <h2 class="card-heading text-kids">Niños</h2>
            <p class="card-desc">Contenido diseñado para niños</p>
          </div>

          <button
            type="button"
            class="action-circle-btn kids-btn"
            aria-label="Seleccionar perfil Niños"
          >
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>

        <!-- Card 2: Adultos -->
        <div class="profile-card adults-card" @click="selectAdults">
          <div class="card-avatar-wrapper adults-avatar-bg">
            <Transition name="avatar-pop" mode="out-in">
              <img
                :key="currentAdultIndex"
                :src="adultsCharacters[currentAdultIndex].img"
                :alt="adultsCharacters[currentAdultIndex].alt"
                class="card-character-img"
              />
            </Transition>
          </div>

          <div class="card-content">
            <h2 class="card-heading text-adults">Adultos</h2>
            <p class="card-desc">Contenido para jóvenes y adultos</p>
          </div>

          <button
            type="button"
            class="action-circle-btn adults-btn"
            aria-label="Seleccionar perfil Adultos"
          >
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      </div>
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
$color-brand-blue: #3b50df;
$color-kids-purple: #4f46e5;
$color-adults-green: #10b981;
$color-text-dark: #1e293b;
$color-text-muted: #64748b;

.selection-container {
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
  padding: 1.25rem 2.5rem;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
  }
}

// User Profile Badge
.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 0.45rem 1rem 0.45rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(59, 80, 223, 0.08);

  .user-avatar-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #c7d2fe, #e0e7ff);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);

    .profile-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
  }

  .user-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    .user-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: $color-text-dark;
    }

    .user-role {
      font-size: 0.78rem;
      font-weight: 500;
      color: $color-text-muted;
    }
  }
}

// Settings Button
.settings-btn {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $color-brand-blue;
  font-size: 1.25rem;
  transition: all 0.25s ease;

  &:hover {
    background: #ffffff;
    transform: rotate(45deg) scale(1.05);
    box-shadow: 0 6px 20px rgba(59, 80, 223, 0.18);
  }
}

// Main Content
.main-content {
  position: relative;
  z-index: 5;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 0.5rem 1.5rem 2rem;
}

// Floating Badges
.floating-badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
  font-weight: 800;
  color: #ffffff;
  z-index: 2;
  animation: floatSlow 4s ease-in-out infinite alternate;
  user-select: none;

  &.badge-letter-a {
    width: 58px;
    height: 58px;
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    top: 6%;
    left: 8%;
    font-size: 1.7rem;
    transform: rotate(-10deg);
    animation-delay: 0s;
  }

  &.badge-math {
    width: 68px;
    height: 52px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    top: 8%;
    right: 8%;
    font-size: 1.2rem;
    transform: rotate(8deg);
    animation-delay: 1.5s;
  }

  &.badge-star {
    width: 54px;
    height: 54px;
    background: linear-gradient(135deg, #6ee7b7, #34d399);
    top: 48%;
    right: 3%;
    font-size: 1.45rem;
    transform: rotate(12deg);
    animation-delay: 2.2s;
  }

  @media (max-width: 860px) {
    display: none;
  }
}

// Brand Hero Section
.brand-hero {
  text-align: center;
  margin-bottom: 2.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .avatar-logo-wrap {
    margin-bottom: 0.65rem;

    .avatar-logo-img {
      width: 120px;
      height: 120px;
      object-fit: contain;
      filter: drop-shadow(0 8px 20px rgba(59, 80, 223, 0.25));
      animation: gentleBreathe 4s ease-in-out infinite alternate;
    }
  }

  .brand-title {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 2.75rem;
    font-weight: 900;
    line-height: 1.1;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.03em;

    @media (max-width: 640px) {
      font-size: 2.15rem;
    }

    .title-dark {
      color: #181c32;
    }

    .title-blue {
      color: $color-brand-blue;
    }
  }

  .brand-subtitle {
    font-size: 1.2rem;
    font-weight: 500;
    color: $color-text-muted;
    margin: 0;
  }
}

// Cards Grid (Niños vs Adultos)
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 340px);
  gap: 2.25rem;
  justify-content: center;
  width: 100%;
  max-width: 760px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 360px;
    gap: 1.5rem;
  }
}

.profile-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 32px;
  padding: 2.25rem 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow:
    0 20px 45px -12px rgba(59, 80, 223, 0.1),
    0 8px 16px -4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);
    box-shadow:
      0 28px 55px -15px rgba(59, 80, 223, 0.2),
      0 12px 24px -6px rgba(0, 0, 0, 0.06);

    .action-circle-btn {
      transform: scale(1.1);
    }
  }

  // Circular Avatar Frame
  .card-avatar-wrapper {
    width: 170px;
    height: 170px;
    border-radius: 50%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 1.5rem;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.04);

    &.kids-avatar-bg {
      background: radial-gradient(circle, #e0e7ff 0%, #ede9fe 100%);
    }

    &.adults-avatar-bg {
      background: radial-gradient(circle, #dcfce7 0%, #ecfdf5 100%);
    }

    .card-character-img {
      max-height: 160px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 6px 12px rgba(30, 41, 59, 0.15));
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1.5rem;

    .card-heading {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.02em;

      &.text-kids {
        color: $color-kids-purple;
      }

      &.text-adults {
        color: $color-adults-green;
      }
    }

    .card-desc {
      font-size: 0.95rem;
      color: $color-text-muted;
      margin: 0;
      line-height: 1.35;
    }
  }

  // Circle Arrow Button
  .action-circle-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.2);
    transition: all 0.25s ease;

    &.kids-btn {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      box-shadow: 0 8px 22px -4px rgba(79, 70, 229, 0.45);
    }

    &.adults-btn {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 8px 22px -4px rgba(16, 185, 129, 0.45);
    }
  }
}

// Avatar Pop Transition
.avatar-pop-enter-active,
.avatar-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.avatar-pop-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(12px);
}

.avatar-pop-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(-8px);
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.95);
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
    transform: translateY(-8px) rotate(var(--rot, 0deg));
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
</style>
