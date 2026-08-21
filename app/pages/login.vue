<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'guest'
})

let { login, loading, error: authError } = useAuth()

const form = reactive({
  email: '',
  password: '',
  showPassword: false
})

const handleLogin = async () => {
  if (!form.email || !form.password) return
  await login(form.email, form.password)
}
</script>

<template>
  <div class="login-wrapper">
    <!-- Glowing background decorative spheres -->
    <div class="glow-sphere glow-1"></div>
    <div class="glow-sphere glow-2"></div>

    <UiCard variant="glass" maxWidth="420px">
      <div class="card-header">
        <div class="logo-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1>¡Hola de nuevo!</h1>
        <p>Ingresa tus credenciales para acceder a la plataforma</p>
      </div>

      <!-- Alert Message on Error -->
      <div v-if="authError" class="error-alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ authError }}</span>
      </div>


      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Field: Email -->
        <UiInput
          id="email"
          v-model="form.email"
          label="Correo Electrónico"
          type="email"
          placeholder="tu@correo.com"
          required
          :disabled="loading"
        >
          <template #iconLeft>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </template>
        </UiInput>

        <!-- Field: Password -->
        <UiInput
          id="password"
          v-model="form.password"
          label="Contraseña"
          :type="form.showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          required
          :disabled="loading"
        >
          <template #labelRight>
            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
          </template>

          <template #iconLeft>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </template>

          <template #iconRight>
            <button
              type="button"
              class="toggle-password"
              @click="form.showPassword = !form.showPassword"
              tabindex="-1"
            >
              <svg v-if="!form.showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </template>
        </UiInput>

        <!-- Submit Button -->
        <UiButton
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="loading"
        >
          Iniciar Sesión
          <template #loading-text>Ingresando...</template>
        </UiButton>
      </form>
    </UiCard>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-app);
}

.glow-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.45;
  pointer-events: none;
}

.glow-1 {
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, var(--color-primary-500), var(--color-accent-blue));
  top: -80px;
  left: -80px;
}

.glow-2 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, var(--color-accent-purple), var(--color-accent-pink));
  bottom: -100px;
  right: -100px;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-accent-purple));
  color: var(--text-primary);
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow-glow-primary);
}

.card-header h1 {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.card-header p {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--color-danger-bg);
  border: 1px solid var(--color-danger-border);
  color: var(--color-danger-text);
  padding: 0.8rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.forgot-link {
  font-size: 0.8rem;
  color: var(--color-primary-400);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--color-primary-100);
}

.toggle-password {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: var(--text-secondary);
}
</style>
