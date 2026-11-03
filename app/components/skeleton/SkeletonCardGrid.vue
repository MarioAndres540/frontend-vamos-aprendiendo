<script setup lang="ts">
// Rejilla de tarjetas de esqueleto: cada una con un título, líneas de texto y, si se pide, una barra de progreso
withDefaults(
  defineProps<{
    count?: number
    // Ancho mínimo de cada tarjeta (px); define cuántas caben por fila
    minWidth?: number
    lines?: number
    bar?: boolean
  }>(),
  { count: 4, minWidth: 260, lines: 2, bar: false },
)
</script>

<template>
  <div class="grid" :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${minWidth}px, 100%), 1fr))` }">
    <article v-for="n in count" :key="n" class="card">
      <UiSkeleton width="55%" height="1.1rem" />
      <UiSkeleton v-for="l in lines" :key="l" :width="l === lines ? '70%' : '100%'" height="0.8rem" />
      <UiSkeleton v-if="bar" height="10px" radius="999px" />
    </article>
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  gap: 1rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
</style>
