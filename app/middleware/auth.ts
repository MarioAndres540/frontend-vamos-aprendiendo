export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token')

  // Si no existe token de autenticación, redirigir al login
  if (!token.value) {
    return navigateTo('/login')
  }
})
