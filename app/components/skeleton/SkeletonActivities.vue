<script setup lang="ts">
// Esqueleto de la pestaña Actividades: encabezado, recomendadas y todas las áreas
</script>

<template>
  <UiSkeletonRegion label="Cargando actividades…">
    <SkeletonSubjectHeader art="actividades" />
    <SkeletonCardGrid :count="2" :min-width="420" :lines="3" />
    <SkeletonCardGrid :count="6" :min-width="280" :lines="2" bar />
  </UiSkeletonRegion>
</template>
