import { Role } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token')
  const hasChildProfile = useCookie<boolean>('has_child_profile')
  const { user, userRole } = useAuth()

  // Si no existe token de autenticación, redirigir al login
  if (!token.value) {
    return navigateTo('/login')
  }

  const currentRole = (user.value?.role || userRole.value)?.toLowerCase()
  const isStaff = currentRole === Role.ADMIN || currentRole === Role.TEACHER
  const isInitialFormRoute = to.path === '/profile-selection' || to.path === '/child-registration'

  // Staff nunca debe ir al formulario
  if (isStaff && isInitialFormRoute) {
    return navigateTo('/dashboard')
  }

  // Si el usuario ya completó el setup (verificado desde backend y guardado en cookie),
  // no debe poder volver al formulario manualmente
  if (hasChildProfile.value === true && isInitialFormRoute) {
    return navigateTo('/dashboard')
  }
})

