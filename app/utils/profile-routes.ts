/**
 * Reglas de navegación por tipo de perfil (se resuelve en el backend al iniciar sesión).
 *
 * - admin    → panel de administración. Nunca ve el formulario inicial.
 * - profesor → dashboard de profesores. Nunca ve el formulario inicial.
 * - tester   → formulario inicial en cada inicio de sesión (puede elegir versión niño o adulto).
 * - tutor    → formulario de niños solo si no lo ha completado; luego, dashboard de usuarios.
 * - adulto   → formulario de memoria / prevención solo si no lo ha completado; luego, dashboard de usuarios.
 */
export type ProfileType = 'admin' | 'profesor' | 'tester' | 'tutor' | 'adulto'

export const PROFILE_TYPES: ProfileType[] = ['admin', 'profesor', 'tester', 'tutor', 'adulto']

export const ROUTES = {
  login: '/login',
  admin: '/admin',
  teacherDashboard: '/teacher/dashboard',
  userDashboard: '/dashboard',
  initialAssessment: '/initial-assessment',
} as const

// Opciones comunes de las cookies de sesión (las mismas en useAuth y en el middleware)
export const SESSION_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 7, // 7 días
  sameSite: 'lax' as const,
}

export const isProfileType = (value: unknown): value is ProfileType =>
  typeof value === 'string' && (PROFILE_TYPES as string[]).includes(value)

/** Ruta a la que debe ir cada perfil al iniciar sesión (o al entrar a "/") */
export const resolveHomeRoute = (profile: ProfileType, hasCompletedSetup: boolean): string => {
  switch (profile) {
    case 'admin':
      return ROUTES.admin
    case 'profesor':
      return ROUTES.teacherDashboard
    case 'tester':
      return ROUTES.initialAssessment
    case 'tutor':
    case 'adulto':
      return hasCompletedSetup ? ROUTES.userDashboard : ROUTES.initialAssessment
  }
}

/** Versión del formulario inicial que corresponde a cada perfil (null = el tester elige) */
export const assessmentTargetFor = (profile: ProfileType | null | undefined): 'nino' | 'adulto' | null => {
  if (profile === 'tutor') return 'nino'
  if (profile === 'adulto') return 'adulto'
  return null
}

declare module '#app' {
  interface PageMeta {
    /** Perfiles que pueden ver la página; los demás se envían a su ruta de inicio */
    allowedProfiles?: ProfileType[]
  }
}
