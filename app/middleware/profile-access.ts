/**
 * Controla el acceso a las páginas privadas según el tipo de perfil.
 * Uso en la página: definePageMeta({ middleware: 'profile-access', allowedProfiles: ['tutor', 'adulto'] })
 */
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('auth_token', SESSION_COOKIE_OPTIONS)
  if (!token.value) {
    return navigateTo(ROUTES.login)
  }

  const profileCookie = useCookie<string | null>('profile_type', SESSION_COOKIE_OPTIONS)
  const completedCookie = useCookie<boolean | null>('has_child_profile', SESSION_COOKIE_OPTIONS)
  const profile = profileCookie.value

  // Sesión iniciada antes de existir el tipo de perfil: se pide iniciar sesión de nuevo
  if (!isProfileType(profile)) {
    token.value = null
    useCookie<string | null>('refresh_token', SESSION_COOKIE_OPTIONS).value = null
    useCookie<string | null>('user_role', SESSION_COOKIE_OPTIONS).value = null
    profileCookie.value = null
    return navigateTo(ROUTES.login)
  }

  const hasCompletedSetup = completedCookie.value === true
  const home = resolveHomeRoute(profile, hasCompletedSetup)
  const allowed = to.meta.allowedProfiles

  // Perfil sin permiso para esta página → a su ruta de inicio
  if (allowed && !allowed.includes(profile)) {
    return to.path === home ? undefined : navigateTo(home)
  }

  const isPersonalProfile = profile === 'tutor' || profile === 'adulto'

  // Tutor / adulto que ya completó el formulario no vuelve a verlo (el tester sí, siempre)
  if (to.path === ROUTES.initialAssessment && isPersonalProfile && hasCompletedSetup) {
    return navigateTo(ROUTES.userDashboard)
  }

  // Tutor / adulto que aún no lo completa debe hacerlo antes de entrar al dashboard
  if (to.path === ROUTES.userDashboard && isPersonalProfile && !hasCompletedSetup) {
    return navigateTo(ROUTES.initialAssessment)
  }
})
