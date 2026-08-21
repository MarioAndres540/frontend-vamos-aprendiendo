export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase as string,
    onRequest({ options }) {
      const token = useCookie<string | null>('auth_token')
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
      if (response.status === 401) {
        const token = useCookie<string | null>('auth_token')
        token.value = null
        navigateTo('/login')
      } else {
        console.error('API Error:', response._data?.message || response.statusText)
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})
