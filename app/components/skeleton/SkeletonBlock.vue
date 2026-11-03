<script setup lang="ts">
// Tarjeta de esqueleto con un título y un área grande (gráfico, tabla o lista)
withDefaults(defineProps<{ height?: string; title?: boolean }>(), { height: '220px', title: true })
</script>

<template>
  <section class="block">
    <UiSkeleton v-if="title" width="180px" height="1.2rem" />
    <UiSkeleton :height="height" radius="16px" />
  </section>
</template>

<style scoped lang="scss">
.block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ffffff;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
</style>
