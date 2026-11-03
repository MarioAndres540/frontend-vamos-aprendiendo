<script setup lang="ts">
useHead({
  title: 'Vamos Aprendiendo',
  link: [
    { rel: 'icon', type: 'image/png', href: '/avatar.png' },
    { rel: 'shortcut icon', type: 'image/png', href: '/avatar.png' },
    { rel: 'apple-touch-icon', href: '/avatar.png' }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <!-- Barra fina arriba al cambiar de pestaña: respuesta inmediata mientras carga la página -->
    <NuxtLoadingIndicator color="#5b50d6" :height="3" :throttle="0" />
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

:root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color-scheme: light dark;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
}
</style>
