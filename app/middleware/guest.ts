export default defineNuxtRouteMiddleware(() => {
  const token = useCookie<string | null>('auth_token', SESSION_COOKIE_OPTIONS)
  const profileType = useCookie<string | null>('profile_type', SESSION_COOKIE_OPTIONS)

  // Solo una sesión completa (token + tipo de perfil) se envía a su inicio; una sesión antigua
  // sin tipo de perfil debe poder ver el login para iniciar sesión de nuevo
  if (token.value && isProfileType(profileType.value)) {
    return navigateTo('/home')
  }
})
