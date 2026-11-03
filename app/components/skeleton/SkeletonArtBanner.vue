<script setup lang="ts">
import type { ArtVariant } from '~/utils/loading-art'

// Franja con el arte generativo de la pestaña, para pantallas que no tienen un encabezado propio mientras cargan
withDefaults(defineProps<{ variant: ArtVariant; height?: string }>(), { height: '110px' })
</script>

<template>
  <div class="art-banner" :style="{ height }">
    <UiLoadingArt :variant="variant" />
  </div>
</template>

<style scoped lang="scss">
.art-banner {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(135deg, #f4f6ff 0%, #eaf0ff 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
</style>
