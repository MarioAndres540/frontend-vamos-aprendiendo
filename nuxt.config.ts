import Aura from '@primeuix/themes/aura'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@primevue/nuxt-module'
  ],

  app: {
    head: {
      title: 'Vamos Aprendiendo',
      link: [
        { rel: 'icon', type: 'image/png', href: '/avatar.png' },
        { rel: 'apple-touch-icon', href: '/avatar.png' }
      ]
    }
  },

  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'system',
          cssLayer: false
        }
      }
    }
  },

  css: [
    'primeicons/primeicons.css',
    '~/assets/scss/main.scss'
  ],

  // El puerto de desarrollo se define solo aquí. No usar PORT en .env: Nuxt/Vite lo toman como primer
  // candidato para el WebSocket de HMR, que termina ocupando 127.0.0.1:4242 y responde "426 Upgrade Required"
  devServer: {
    port: 4242
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api/v1'
    }
  },

  experimental: {
    appManifest: false
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit'
      ]
    }
  }
})



