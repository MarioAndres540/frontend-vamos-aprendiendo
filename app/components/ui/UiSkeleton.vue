<script setup lang="ts">
// Bloque gris con brillo que ocupa el lugar de un texto, un número o una imagen mientras llega la información del backend
withDefaults(
  defineProps<{
    width?: string
    height?: string
    radius?: string
    circle?: boolean
  }>(),
  { width: '100%', height: '1rem', radius: '8px', circle: false },
)
</script>

<template>
  <span
    class="skeleton"
    :style="{ width: circle ? height : width, height, borderRadius: circle ? '50%' : radius }"
    aria-hidden="true"
  ></span>
</template>

<style scoped lang="scss">
.skeleton {
  display: block;
  flex: none;
  max-width: 100%;
  background: linear-gradient(90deg, #e8edf5 25%, #f6f8fc 50%, #e8edf5 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Quien prefiere menos movimiento ve el bloque quieto
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
