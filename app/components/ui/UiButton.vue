<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  loading: false,
  disabled: false,
  block: true
})
</script>

<template>
  <button
    :type="type"
    class="ui-button"
    :class="[`variant-${variant}`, { 'is-block': block, 'is-loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="!loading" class="button-content">
      <slot />
    </span>
    <span v-else class="loader-container">
      <span class="spinner"></span>
      <slot name="loading-text">Cargando...</slot>
    </span>
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  text-decoration: none;
}

.is-block {
  width: 100%;
}

.variant-primary {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  color: var(--text-primary);
  box-shadow: var(--shadow-glow-primary);
}

.variant-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.variant-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  border: var(--border-subtle);
}

.variant-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
}

.variant-danger {
  background: var(--color-danger-bg);
  border: 1px solid var(--color-danger-border);
  color: var(--color-danger-text);
}

.variant-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
  color: var(--text-primary);
}

.variant-ghost {
  background: transparent;
  color: var(--text-muted);
}

.variant-ghost:hover:not(:disabled) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.ui-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none !important;
}

.button-content {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.loader-container {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
