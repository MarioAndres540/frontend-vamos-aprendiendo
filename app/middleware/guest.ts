export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token')

  // Si ya está autenticado, redirigir a dashboard
  if (token.value) {
    return navigateTo('/dashboard')
  }
})
