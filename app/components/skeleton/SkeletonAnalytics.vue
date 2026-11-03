<script setup lang="ts">
// Esqueleto de la pestaña Analíticas
</script>

<template>
  <UiSkeletonRegion label="Cargando analíticas…">
    <SkeletonSubjectHeader art="analiticas" />
    <SkeletonCardGrid :count="4" :min-width="220" :lines="1" />
    <SkeletonBlock height="240px" />
    <SkeletonCardGrid :count="5" :min-width="220" :lines="2" />
  </UiSkeletonRegion>
</template>
