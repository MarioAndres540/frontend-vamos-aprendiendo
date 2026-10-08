<script setup lang="ts">
// Envía a cada perfil a su página de inicio (admin, profesor, formulario inicial o dashboard de usuarios)
const profileType = useCookie<string | null>('profile_type', SESSION_COOKIE_OPTIONS)
const hasCompletedSetup = useCookie<boolean | null>('has_child_profile', SESSION_COOKIE_OPTIONS)

if (isProfileType(profileType.value)) {
  await navigateTo(resolveHomeRoute(profileType.value, hasCompletedSetup.value === true), { replace: true })
} else {
  // Sesión sin tipo de perfil (iniciada antes de este cambio): el middleware pide iniciar sesión de nuevo
  await navigateTo(ROUTES.userDashboard, { replace: true })
}
</script>

<template>
  <div class="p-4">Cargando panel...</div>
</template>
