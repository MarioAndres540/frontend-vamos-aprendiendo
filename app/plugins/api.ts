import type { FetchError } from 'ofetch'
import type { LoginResponse } from '~/composables/useAuth'

// Endpoints de autenticación que nunca deben disparar la renovación del token
const AUTH_ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/oauth', '/auth/refresh']

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 7, // 7 días (igual que en useAuth)
  sameSite: 'lax' as const,
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Se leen las cookies dentro del contexto de Nuxt para que funcione también después de un await (SSR)
  const readCookies = () => ({
    token: useCookie<string | null>('auth_token', COOKIE_OPTIONS),
    refreshToken: useCookie<string | null>('refresh_token', COOKIE_OPTIONS),
    userRole: useCookie<string | null>('user_role', COOKIE_OPTIONS),
  })
  const getCookies = () => nuxtApp.runWithContext(readCookies) as ReturnType<typeof readCookies>

  const baseFetch = $fetch.create({
    baseURL: config.public.apiBase as string,
    onRequest({ options }) {
      const { token } = getCookies()
      if (token.value) {
        options.headers = options.headers || {}
        // Use Headers object or plain object
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${token.value}`)
        } else if (Array.isArray(options.headers)) {
          options.headers.push(['Authorization', `Bearer ${token.value}`])
        } else {
          (options.headers as any).Authorization = `Bearer ${token.value}`
        }
      }
    },
    onResponseError({ response }) {
      if (response.status !== 401) {
        console.error('API Error:', response._data?.message || response.statusText)
      }
    }
  })

  // Promesa compartida: si varias peticiones reciben 401 a la vez, solo se hace una renovación
  let refreshPromise: Promise<boolean> | null = null

  const refreshSession = (): Promise<boolean> => {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      const cookies = getCookies()
      if (!cookies.refreshToken.value) return false

      try {
        const response = await baseFetch<LoginResponse>('/auth/refresh', {
          method: 'POST',
          body: { refreshToken: cookies.refreshToken.value },
        })
        const newToken = response?.accessToken || response?.access_token
        if (!newToken || !response.refreshToken) return false

        // El backend rota el refresh token: el anterior queda revocado
        cookies.token.value = newToken
        cookies.refreshToken.value = response.refreshToken
        if (response.user?.role) {
          cookies.userRole.value = response.user.role.toLowerCase()
        }
        return true
      } catch {
        return false
      }
    })().finally(() => {
      refreshPromise = null
    })

    return refreshPromise
  }

  const clearSessionAndRedirect = async () => {
    await nuxtApp.runWithContext(async () => {
      const cookies = getCookies()
      cookies.token.value = null
      cookies.refreshToken.value = null
      cookies.userRole.value = null
      useCookie<string | null>('profile_type', COOKIE_OPTIONS).value = null
      useCookie<string | null>('user_first_name', COOKIE_OPTIONS).value = null
      useState('auth_user').value = null
      await navigateTo('/login')
    })
  }

  const api = (async (request: any, options?: any) => {
    try {
      return await baseFetch(request, options)
    } catch (err) {
      const status = (err as FetchError)?.response?.status
      const url = typeof request === 'string' ? request : request?.url || ''
      const isAuthEndpoint = AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) => url.includes(path))

      if (status !== 401 || isAuthEndpoint) throw err

      // Access Token vencido: se intenta renovar y se reintenta la petición original una sola vez
      if (await refreshSession()) {
        try {
          return await baseFetch(request, options)
        } catch (retryErr) {
          if ((retryErr as FetchError)?.response?.status !== 401) throw retryErr
        }
      }

      await clearSessionAndRedirect()
      throw err
    }
  }) as typeof baseFetch

  api.raw = baseFetch.raw
  api.create = baseFetch.create

  return {
    provide: {
      api
    }
  }
})

export function useUserPresence(userId: string) {
  const { data, refresh } = useFetch(`/presence/status/${userId}`, {
    $fetch: useNuxtApp().$api, // tu wrapper existente con el Bearer token
  });

  const interval = setInterval(() => refresh(), 7000); // cada 7s, dentro del margen que pediste
  onUnmounted(() => clearInterval(interval));

  return { data };
}
