<script setup lang="ts">
interface Props {
  variant?: 'glass' | 'solid' | 'bordered'
  padding?: string
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'glass',
  padding: '2.5rem 2rem',
  maxWidth: '420px'
})
</script>

<template>
  <div
    class="ui-card"
    :class="`variant-${variant}`"
    :style="{ padding, maxWidth }"
  >
    <slot />
  </div>
</template>

<style scoped>
.ui-card {
  width: 100%;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  z-index: 10;
  animation: fadeIn 0.4s ease-out;
  box-sizing: border-box;
}

.variant-glass {
  background: var(--bg-surface-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: var(--border-subtle);
}

.variant-solid {
  background: var(--bg-surface-dark);
  border: var(--border-subtle);
}

.variant-bordered {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
