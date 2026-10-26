<script setup lang="ts">
import avatarImg from '~/assets/img/avatar.png'
import womanImg from '~/assets/img/woman.png'

// Marco de las páginas de tutores, adultos y testers: menú lateral, saludo y menú de la cuenta
const route = useRoute()
const { user, logout, profileType, firstName } = useAuth()
const { students, selected, selectingId, selectError, fetchStudents, selectStudent } = useMyStudents()

const isTutor = computed(() => profileType.value === 'tutor')

// Sin "Estudiantes": la gestión de estudiantes es del profesor (/teacher/dashboard)
const navItems = [
  { id: 'inicio', label: 'Inicio', icon: 'pi pi-home', route: '/dashboard' },
  { id: 'diagnosticos', label: 'Diagnósticos', icon: 'pi pi-clipboard', route: '/child-registration' },
  { id: 'actividades', label: 'Actividades', icon: 'pi pi-play', route: '#' },
  { id: 'analiticas', label: 'Analíticas', icon: 'pi pi-chart-bar', route: '#' },
  { id: 'biblioteca', label: 'Biblioteca', icon: 'pi pi-book', route: '#' },
  { id: 'configuracion', label: 'Configuración', icon: 'pi pi-cog', route: '/settings' },
]

const isActive = (item: (typeof navItems)[number]) => item.route !== '#' && route.path === item.route

const greetingName = computed(() => titleCase(firstName.value || user.value?.firstName || ''))

const profileLabels: Record<string, string> = {
  tutor: 'Tutor',
  adulto: 'Adulto',
  tester: 'Tester',
}
const profileLabel = computed(() => profileLabels[profileType.value ?? ''] ?? 'Usuario')

const userName = computed(() => {
  if (greetingName.value) return greetingName.value
  if (user.value?.email) return user.value.email.split('@')[0]
  return profileLabel.value
})

const todayLabel = computed(() => {
  const text = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  return text.charAt(0).toUpperCase() + text.slice(1)
})

// Menú de la cuenta: hijos a cargo (tutor) y cerrar sesión
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const closeOnOutsideClick = (event: MouseEvent) => {
  if (showUserMenu.value && userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}
const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') showUserMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
  document.addEventListener('keydown', closeOnEscape)
  if (isTutor.value) fetchStudents()
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  document.removeEventListener('keydown', closeOnEscape)
})

const childLabel = (s: { firstName: string; lastName: string }) => titleCase(`${s.firstName} ${s.lastName}`)

// Al elegir un hijo se trae su información del backend y se muestra en el dashboard
const onSelectStudent = async (id: string) => {
  const student = await selectStudent(id)
  if (!student) return
  showUserMenu.value = false
  if (route.path !== ROUTES.userDashboard) await navigateTo(ROUTES.userDashboard)
}
</script>

<template>
  <div class="panel-layout">
    <!-- Menú lateral (escritorio) -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <img :src="avatarImg" alt="Vamos Aprendiendo" class="brand-avatar" />
        <div class="brand-text">
          <span class="brand-name-top">Vamos</span>
          <span class="brand-name-sub">Aprendiendo</span>
        </div>
      </div>

      <nav class="sidebar-nav" aria-label="Menú principal">
        <NuxtLink
          v-for="item in navItems"
          :key="item.id"
          :to="item.route"
          class="nav-link"
          :class="{ active: isActive(item) }"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="brand-mini">
          <img :src="avatarImg" alt="" class="mini-avatar" />
          <span class="mini-brand-text">Vamos Aprendiendo</span>
        </div>
        <span class="version-tag">v1.0</span>
      </div>
    </aside>

    <div class="main-wrapper">
      <header class="top-header">
        <div class="greeting">
          <span class="greeting-title">Hola{{ greetingName ? `, ${greetingName}` : '' }}</span>
          <span class="greeting-date">{{ todayLabel }}</span>
        </div>

        <div class="header-right">
          <button type="button" class="icon-button hide-mobile" aria-label="Notificaciones">
            <i class="pi pi-bell"></i>
            <span class="badge-count">2</span>
          </button>

          <button type="button" class="icon-button hide-mobile" aria-label="Ayuda">
            <i class="pi pi-question-circle"></i>
          </button>

          <div ref="userMenuRef" class="user-chip-container">
            <button
              type="button"
              class="user-chip"
              :aria-expanded="showUserMenu"
              aria-haspopup="menu"
              @click="showUserMenu = !showUserMenu"
            >
              <span class="user-avatar-wrap">
                <img :src="womanImg" alt="" class="user-avatar-img" />
              </span>
              <span class="user-details">
                <span class="user-name">{{ userName }}</span>
                <span class="user-role">{{ profileLabel }}</span>
              </span>
              <i class="pi pi-chevron-down dropdown-arrow"></i>
            </button>

            <div v-if="showUserMenu" class="user-menu-dropdown" role="menu">
              <div class="dropdown-header">
                <strong>{{ userName }}</strong>
                <small>{{ user?.email || profileLabel }}</small>
              </div>

              <!-- Hijos o menores a cargo: al elegir uno se carga su información en el dashboard -->
              <template v-if="isTutor && students.length">
                <hr class="dropdown-divider" />
                <span class="dropdown-section">Hijos a cargo</span>
                <button
                  v-for="s in students"
                  :key="s.id"
                  type="button"
                  role="menuitemradio"
                  class="dropdown-item child-item"
                  :class="{ selected: s.id === selected?.id }"
                  :aria-checked="s.id === selected?.id"
                  :disabled="selectingId !== null"
                  @click="onSelectStudent(s.id)"
                >
                  <span class="child-avatar" aria-hidden="true">{{ initials(childLabel(s)) }}</span>
                  <span class="child-text">
                    <span class="child-name">{{ childLabel(s) }}</span>
                    <small v-if="s.grade">{{ s.grade }}</small>
                  </span>
                  <i v-if="selectingId === s.id" class="pi pi-spin pi-spinner child-status"></i>
                  <i v-else-if="s.id === selected?.id" class="pi pi-check child-status"></i>
                </button>
                <p v-if="selectError" class="dropdown-error">{{ selectError }}</p>
              </template>

              <hr class="dropdown-divider" />
              <button type="button" role="menuitem" class="dropdown-item text-danger" @click="logout">
                <i class="pi pi-sign-out"></i> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Menú en tablet y celular, donde el menú lateral no se muestra -->
      <nav class="mobile-nav" aria-label="Menú principal">
        <NuxtLink
          v-for="item in navItems"
          :key="item.id"
          :to="item.route"
          class="mobile-nav-link"
          :class="{ active: isActive(item) }"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$color-brand-blue: #3b50df;
$color-brand-indigo: #4f46e5;
$color-bg-app: #f4f7fc;
$color-text-dark: #1e293b;
$color-text-muted: #64748b;
$color-border-subtle: #e2e8f0;

.panel-layout {
  display: flex;
  min-height: 100vh;
  background-color: $color-bg-app;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: $color-text-dark;
}

// ----------------------------------------------------
// Menú lateral
// ----------------------------------------------------
.sidebar {
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid $color-border-subtle;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  z-index: 20;

  @media (max-width: 1024px) {
    display: none;
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem 1.75rem;

  .brand-avatar {
    width: 42px;
    height: 42px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(59, 80, 223, 0.2));
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;

    .brand-name-top {
      font-size: 1.05rem;
      font-weight: 800;
      color: #1e1b4b;
    }

    .brand-name-sub {
      font-size: 1.05rem;
      font-weight: 800;
      color: $color-brand-blue;
    }
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.75rem 1rem;
    border-radius: 14px;
    color: $color-text-muted;
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 600;
    transition: all 0.2s ease;

    i {
      font-size: 1.15rem;
    }

    &:hover {
      background-color: #f1f5f9;
      color: $color-brand-indigo;
    }

    &.active {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      box-shadow: 0 8px 18px -4px rgba(79, 70, 229, 0.45);
    }
  }
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;

  .brand-mini {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .mini-avatar {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }

    .mini-brand-text {
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
    }
  }

  .version-tag {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 600;
  }
}

// ----------------------------------------------------
// Contenido y encabezado
// ----------------------------------------------------
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.top-header {
  height: 72px;
  background-color: #ffffff;
  border-bottom: 1px solid $color-border-subtle;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 15;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
}

.greeting {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;

  .greeting-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: $color-text-dark;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .greeting-date {
    font-size: 0.8rem;
    color: $color-text-muted;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-shrink: 0;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8fafc;
  border: 1px solid $color-border-subtle;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text-muted;
  font-size: 1.05rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    color: $color-brand-indigo;
  }

  .badge-count {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #ef4444;
    color: #ffffff;
    font-size: 0.68rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.hide-mobile {
  @media (max-width: 640px) {
    display: none;
  }
}

.user-chip-container {
  position: relative;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.35rem 0.75rem 0.35rem 0.4rem;
  background-color: #f8fafc;
  border: 1px solid $color-border-subtle;
  border-radius: 9999px;
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
  }

  &:focus-visible {
    outline: 2px solid $color-brand-indigo;
    outline-offset: 2px;
  }

  .user-avatar-wrap {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #e2e8f0;
    flex-shrink: 0;

    .user-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-details {
    display: flex;
    flex-direction: column;
    line-height: 1.15;

    .user-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: $color-text-dark;
    }

    .user-role {
      font-size: 0.72rem;
      color: $color-text-muted;
    }
  }

  .dropdown-arrow {
    font-size: 0.75rem;
    color: #94a3b8;
  }
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  max-width: calc(100vw - 2rem);
  background: #ffffff;
  border: 1px solid $color-border-subtle;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  z-index: 30;

  .dropdown-header {
    display: flex;
    flex-direction: column;
    padding: 0.25rem 0.5rem 0.5rem;
    min-width: 0;

    strong {
      font-size: 0.9rem;
      color: $color-text-dark;
    }

    small {
      color: #94a3b8;
      font-size: 0.75rem;
      overflow-wrap: anywhere;
    }
  }

  .dropdown-divider {
    border: none;
    border-top: 1px solid #f1f5f9;
    margin: 0.35rem 0;
  }

  .dropdown-section {
    display: block;
    padding: 0.35rem 0.75rem 0.25rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    background: none;
    border: none;
    border-radius: 8px;
    color: $color-text-dark;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background-color: #f8fafc;
      color: $color-brand-indigo;
    }

    &:disabled {
      cursor: wait;
    }

    &.text-danger {
      color: #ef4444;

      &:hover {
        background-color: #fef2f2;
        color: #ef4444;
      }
    }
  }

  .child-item {
    padding: 0.45rem 0.6rem;

    &.selected {
      background-color: #eef2ff;
    }
  }

  .child-avatar {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e0e7ff, #f5f3ff);
    color: $color-brand-indigo;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 800;
  }

  .child-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.2;

    .child-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    small {
      font-size: 0.72rem;
      font-weight: 500;
      color: $color-text-muted;
    }
  }

  .child-status {
    margin-left: auto;
    color: $color-brand-indigo;
    font-size: 0.85rem;
  }

  .dropdown-error {
    margin: 0.25rem 0.75rem;
    font-size: 0.75rem;
    color: #b91c1c;
  }
}

// ----------------------------------------------------
// Menú horizontal en tablet y celular
// ----------------------------------------------------
.mobile-nav {
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    background: #ffffff;
    border-bottom: 1px solid $color-border-subtle;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    border-radius: 9999px;
    color: $color-text-muted;
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;

    &.active {
      background: $color-brand-indigo;
      color: #ffffff;
    }
  }
}
</style>
