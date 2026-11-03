<script setup lang="ts">
import type { ArtVariant } from '~/utils/loading-art'

// Esqueleto del encabezado con la persona (avatar, nombre y detalle): imita a PanelSubjectHeader.
// Con `art`, detrás se dibuja el arte generativo de la pestaña (se ve a la derecha; a la izquierda se lee el esqueleto).
defineProps<{ art?: ArtVariant }>()
</script>

<template>
  <section class="subject-skeleton">
    <UiLoadingArt v-if="art" :variant="art" />
    <div v-if="art" class="veil" aria-hidden="true"></div>
    <UiSkeleton circle height="52px" class="above" />
    <div class="lines above">
      <UiSkeleton width="220px" height="1.25rem" />
      <UiSkeleton width="150px" height="0.85rem" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.subject-skeleton {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 104px;
  background: linear-gradient(135deg, #f7f8ff 0%, #eef2ff 100%);
  border-radius: 24px;
  padding: 1.15rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

// Velo blanco a la izquierda: mantiene legibles las líneas del esqueleto
.veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.72) 42%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.above {
  position: relative;
  z-index: 1;
}

.lines {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
</style>
