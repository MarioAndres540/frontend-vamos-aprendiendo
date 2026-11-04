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
          // La interfaz solo tiene diseño claro: con 'system' los campos de PrimeVue (contraseña, selectores...) se
          // pintaban oscuros en equipos con modo oscuro y desentonaban con el resto de la pantalla
          darkModeSelector: false,
          cssLayer: false
        }
      }
    }
  },

  css: [
    'primeicons/primeicons.css',
    '~/assets/scss/main.scss'
  ],

  // Cabeceras de seguridad en todas las páginas (spec 0002, SEC-HEAD-02). HSTS solo en producción:
  // en http://localhost obligaría al navegador a usar HTTPS para ese dominio
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        ...(process.env.NODE_ENV === 'production'
          ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' }
          : {})
      }
    }
  },

  // El puerto de desarrollo se define solo aquí. No usar PORT en .env: Nuxt/Vite lo toman como primer
  // candidato para el WebSocket de HMR, que termina ocupando 127.0.0.1:4242 y responde "426 Upgrade Required"
  devServer: {
    port: 4242
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api/v1',
      // Responsable del tratamiento de datos (Ley 1581, spec 0004 PD-POL-02). Se muestran en /data-policy;
      // en producción se definen con NUXT_PUBLIC_DATA_CONTROLLER_NAME, _ID, _ADDRESS, _CITY, _EMAIL y _PHONE
      dataController: {
        name: '',
        id: '',
        address: '',
        city: '',
        email: '',
        phone: ''
      }
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



