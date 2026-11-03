<script setup lang="ts">
// Esqueleto de la pestaña Diagnósticos
</script>

<template>
  <UiSkeletonRegion label="Cargando diagnóstico…">
    <SkeletonSubjectHeader art="diagnosticos" />
    <SkeletonBlock height="150px" />
    <SkeletonCardGrid :count="4" :min-width="300" :lines="3" />
  </UiSkeletonRegion>
</template>
