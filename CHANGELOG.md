# Registro de Cambios (CHANGELOG)

Todos los cambios notables realizados en este proyecto se documentarán en este archivo.

---

## [1.0.0] - 2026-08-09

### ⚙️ Configuración y Conexión Frontend - Backend
- **Puerto de desarrollo:** Configurado el servidor de desarrollo de Nuxt 4 para ejecutarse en el puerto **4242** (`devServer.port = 4242`).
- **Conexión a NestJS:** Configurada la variable `runtimeConfig.public.apiBase` para conectar el frontend con el backend en `http://localhost:3000`.
- **Variables de entorno:**
  - Creado archivo [.env](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/.env) para variables locales.
  - Creado plantilla [.env.example](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/.env.example) para control de versiones seguro.
  - Verificado que `.env` esté ignorado en [.gitignore](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/.gitignore).

### 🐛 Correcciones Técnicas
- **Error `#app-manifest`:** Corregido fallo de resolución de importaciones en Vite deshabilitando la opción experimental `experimental.appManifest = false` en [nuxt.config.ts](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/nuxt.config.ts).
- **Vite DevTools:** Agregada optimización en `vite.optimizeDeps.include` para `@vue/devtools-core` y `@vue/devtools-kit`, evitando recargas continuas de página.

### 🔐 Módulo de Autenticación (Login)
- **Enrutamiento:** Actualizado [app/app.vue](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/app.vue) para renderizar `<NuxtPage />` y permitir navegación entre páginas.
- **Composable de Auth:** Creado [app/composables/useAuth.ts](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/composables/useAuth.ts) con almacenamiento seguro de tokens vía `useCookie`, gestión reactiva del usuario y métodos `login()` y `logout()`.
- **Protección de Rutas:**
  - [app/middleware/auth.ts](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/middleware/auth.ts): Protege páginas privadas redirigiendo a `/login` si no hay sesión.
  - [app/middleware/guest.ts](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/middleware/guest.ts): Redirige usuarios ya autenticados hacia `/dashboard`.
- **Vistas:**
  - [app/pages/login.vue](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/pages/login.vue): Página de inicio de sesión con validación de credenciales, indicador de carga y alertas de error.
  - [app/pages/dashboard.vue](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/pages/dashboard.vue): Panel principal privado para usuarios autenticados.
  - [app/pages/index.vue](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/pages/index.vue): Redirección automática según el estado de autenticación.

### 🎨 Sistema de Diseño y Componentes UI Reutilizables
- **Tokens de CSS Globale:** Creado [app/assets/css/tokens.css](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/assets/css/tokens.css) e importado en `nuxt.config.ts`. Contiene variables para colores de marca, superficies *glassmorphic*, bordes, sombras, fuentes y radios de borde.
- **Biblioteca de Componentes UI (`app/components/ui/`):**
  - [UiCard.vue](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/components/ui/UiCard.vue): Tarjeta contenedor reutilizable con estilos `glass`, `solid` y `bordered`.
  - [UiButton.vue](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/components/ui/UiButton.vue): Botón centralizado con soporte para variantes (`primary`, `secondary`, `danger`, `ghost`) y estados de carga.
  - [UiInput.vue](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/components/ui/UiInput.vue): Campo de texto con etiquetas, slots para íconos y mensajes de validación.
  - [UiModal.vue](file:///E:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/components/ui/UiModal.vue): Componente Popup/Modal con difuminado de fondo (*backdrop blur*), animaciones de entrada y secciones personalizables (header, body, footer).
