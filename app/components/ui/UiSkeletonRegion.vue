<script setup lang="ts">
// Envuelve un grupo de esqueletos y lo anuncia a los lectores de pantalla ("Cargando actividades…")
withDefaults(defineProps<{ label?: string; gap?: string }>(), { label: 'Cargando…', gap: '1.5rem' })
</script>

<template>
  <div class="skeleton-region" role="status" aria-live="polite" aria-busy="true" :style="{ gap }">
    <span class="sr-only">{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.skeleton-region {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
