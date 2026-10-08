export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token')
  const userRole = useCookie('user_role')
  const hasChildProfile = useCookie('has_child_profile')

  // Si no está autenticado, el middleware auth.ts lo gestiona
  if (!token.value) {
    return
  }

  // Los profesores y administradores van directo a sus dashboards
  if (userRole.value === 'profesor' || userRole.value === 'admin') {
    return
  }

  // Si no ha completado el formulario inicial y no está en la página de evaluación
  if (!hasChildProfile.value && to.path !== '/initial-assessment') {
    return navigateTo('/initial-assessment')
  }

  // Si ya lo completó e intenta volver a /initial-assessment, enviarlo a /dashboard
  if (hasChildProfile.value && to.path === '/initial-assessment') {
    return navigateTo('/dashboard')
  }
})
