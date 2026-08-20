<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()


const showModal = ref(false)
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="dashboard-header">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span>Vamos Aprendiendo</span>
      </div>

      <div class="header-actions">
        <UiButton variant="ghost" :block="false" @click="showModal = true">
          Probar Popup / Modal
        </UiButton>

        <UiButton variant="danger" :block="false" @click="logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar Sesión
        </UiButton>
      </div>
    </header>

    <main class="dashboard-content">
      <UiCard variant="glass" maxWidth="800px" padding="3rem 2.5rem">
        <div class="welcome-card">
          <h1>¡Bienvenido al Panel Principal! 🎉</h1>
          <p>Has iniciado sesión exitosamente en el sistema.</p>
          <div class="user-badge" v-if="user">
            <strong>Usuario:</strong> {{ user.email }}
          </div>
        </div>
      </UiCard>
    </main>

    <!-- Modal / Popup Reutilizable -->
    <UiModal :show="showModal" title="Componente Popup Reutilizable" @close="showModal = false">
      <p>Este es un ejemplo de popup modal centralizado en <code>app/components/ui/UiModal.vue</code>.</p>
      <p>Puedes reutilizar este modal en cualquier módulo para mostrar confirmaciones, formularios o detalles.</p>

      <template #footer>
        <UiButton variant="secondary" :block="false" @click="showModal = false">
          Cancelar
        </UiButton>
        <UiButton variant="primary" :block="false" @click="showModal = false">
          Aceptar
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-primary);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid var(--border-subtle);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary-400);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-content {
  max-width: 800px;
  margin: 3rem auto;
  padding: 0 1.5rem;
}

.welcome-card {
  text-align: center;
}

.welcome-card h1 {
  font-size: 1.8rem;
  margin-top: 0;
  color: var(--text-primary);
}

.welcome-card p {
  color: var(--text-muted);
}

.user-badge {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.6rem 1.2rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-primary-100);
}
</style>
