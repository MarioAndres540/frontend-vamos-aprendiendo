# 🏛️ Documentación de Arquitectura y Guía de Desarrollo - Frontend

> **Proyecto:** Vamos Aprendiendo Web  
> **Framework:** Nuxt 4 (Nuxt 4.4.x + Vue 3.5.x + TypeScript)  
> **Librería UI:** PrimeVue v4 (Tema Aura) + Sass Embedded  
> **Reglas para agentes:** [AGENTS.md](./AGENTS.md) · **Especificación:** [../SPEC.md](../SPEC.md)  
> **Backend conectado:** NestJS API REST (`http://localhost:3000/api/v1`)

---

## 📑 Tabla de Contenidos
1. [Visión General del Stack y Arquitectura](#1-visión-general-del-stack-y-arquitectura)
2. [Estructura de Carpetas y Responsabilidades](#2-estructura-de-carpetas-y-responsabilidades)
3. [Flujo de Ejecución y Ciclo de Vida de la Aplicación](#3-flujo-de-ejecución-y-ciclo-de-vida-de-la-aplicación)
4. [Manejo de Cookies y Estado de Autenticación](#4-manejo-de-cookies-y-estado-de-autenticación)
5. [Consumo de Servicios del Backend](#5-consumo-de-servicios-del-backend)
6. [Guía de Creación: Componentes](#6-guía-de-creación-componentes)
7. [Guía de Creación: Pages (Rutas y Páginas)](#7-guía-de-creación-pages-rutas-y-páginas)
8. [Guía de Creación: Módulos](#8-guía-de-creación-módulos)
9. [Guía de Creación: Guards (Route Middleware)](#9-guía-de-creación-guards-route-middleware)
10. [Buenas Prácticas y Convenciones del Proyecto](#10-buenas-prácticas-y-convenciones-del-proyecto)

---

## 1. Visión General del Stack y Arquitectura

El frontend está desarrollado bajo el paradigma **SSR / SPA Híbrido** provisto por **Nuxt 4**. Utiliza la nueva estructura canónica de Nuxt donde el código fuente de la aplicación reside en el directorio `app/`.

### Características Principales:
- **Auto-import inteligente:** Nuxt importa automáticamente componentes, composables (`useAuth`, `useCookie`, `useRoute`, `navigateTo`), funciones de Vue (`ref`, `computed`, `reactive`) y utilidades sin necesidad de declaraciones `import` manuales redundantes.
- **Enrutamiento basado en archivos:** La jerarquía de archivos en `app/pages/` genera automáticamente el mapa de rutas de Vue Router.
- **PrimeVue 4 con tema Aura:** Componentes estilizados configurados mediante `@primevue/nuxt-module`.
- **Comunicación HTTP centralizada:** Cliente `$fetch` personalizado provisto como plugin `$api` con interceptores de autenticación y manejo global de errores (401).

---

## 2. Estructura de Carpetas y Responsabilidades

```text
frontend-vamos-aprendiendo/
├── .env / .env.example   # NUXT_PUBLIC_API_BASE (no definir PORT)
├── nuxt.config.ts        # Módulos, PrimeVue (Aura), CSS, devServer.port = 4242, runtimeConfig
├── nodemon.json          # `npm run dev` reinicia Nuxt al cambiar .env / nuxt.config.ts
├── public/               # Estáticos servidos en la raíz
└── app/                  # Código fuente (convención Nuxt 4)
    ├── app.vue
    ├── assets/           # css/tokens.css, scss/ (main, _variables, _mixins, _panel, _user-panel), img/
    ├── components/       # ui/ (UiButton, UiCard, UiInput, UiModal), dashboard/, layout/, library/, panel/
    ├── composables/      # useAuth, useProfile, useMyStudents, useStudentSetup, useAssessment,
    │                     # useTelemetry, usePanelSubject, useAppPresence, useAppUsage,
    │                     # useInstitutions, useLicenses, useAdminUsers, useTeacherDashboard
    ├── layouts/          # user-panel.vue
    ├── middleware/       # auth, guest, profile-access, assessment-gate
    ├── pages/            # index, login, register, initial-assessment, child-registration,
    │                     # profile-selection, home, dashboard, activities, analytics, diagnostics,
    │                     # settings, library/ (index, [id]), admin/index, teacher/dashboard
    ├── plugins/api.ts    # Cliente $api (Bearer + renovación de token)
    └── utils/            # profile-routes (perfiles, ROUTES, cookies), assessment-areas,
                          # form-options, library, text
```

### Detalle por Directorio:

| Carpeta | Rol Arquitectónico | ¿Se auto-importa? |
| :--- | :--- | :---: |
| **`app/pages/`** | Vistas y controladores de rutas de la aplicación. | Sí (enrutador) |
| **`app/components/`** | Elementos visuales reutilizables. Si se guardan en `ui/UiButton.vue`, se usan como `<UiButton />`. | Sí |
| **`app/composables/`** | Funciones que encapsulan estado reactivo (`useState`) y lógica de negocio. | Sí |
| **`app/middleware/`** | Guardianes de navegación que interceptan cambios de ruta antes de renderizar la página. | Sí (por nombre) |
| **`app/plugins/`** | Inicializadores de librerías, clientes HTTP y servicios globales inyectados vía `provide`. | Sí |
| **`app/assets/`** | Estilos Sass/CSS e imágenes que requieren optimización por Vite (`~/assets/...`). | No |
| **`public/`** | Archivos servidos tal cual en la raíz del servidor web (`/favicon.ico`, `/avatar.png`). | Servidor web |

---

## 3. Flujo de Ejecución y Ciclo de Vida de la Aplicación

El siguiente diagrama ilustra cómo fluye una petición desde que el usuario ingresa una URL hasta que se muestra la interfaz:

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Navegador / Usuario
    participant Nuxt as Motor Nuxt (SSR/CSR)
    participant Plugin as Plugin (api.ts)
    participant Guard as Middleware / Guard (auth.ts / guest.ts)
    participant Page as Página (app/pages/*.vue)
    participant Composable as Composable (useAuth.ts)
    participant Backend as Backend NestJS (/api/v1)

    Usuario->>Nuxt: Navega a una URL (ej: /dashboard)
    Nuxt->>Plugin: Inicializa plugins (crea instancia $api con interceptores)
    Nuxt->>Guard: Ejecuta el Route Middleware asignado a la página
    alt Sin Cookie auth_token
        Guard-->>Usuario: Redirección inmediata a /login
    else Con Cookie auth_token válida
        Guard->>Page: Permite la navegación y carga la página
        Page->>Composable: Invoca métodos de negocio (ej: obtener datos)
        Composable->>Backend: Petición HTTP vía $api (inyecta Bearer Token automáticamente)
        Backend-->>Composable: Respuesta JSON
        Composable-->>Page: Actualiza variables reactivas (ref / useState)
        Page-->>Usuario: Renderiza componentes UI actualizados
    end
```

---

## 4. Manejo de Cookies y Estado de Autenticación

### ¿Ya usamos cookies en el proyecto?
**SÍ, el proyecto ya utiliza cookies activamente** mediante la utilidad nativa reactiva de Nuxt: `useCookie<T>()`.

### Cookies actuales en uso (7 días, `sameSite: 'lax'`, ver `SESSION_COOKIE_OPTIONS` en `utils/profile-routes.ts`):
1. **`auth_token`**: access token JWT.
2. **`refresh_token`**: token de refresco (el backend lo rota en cada renovación).
3. **`user_role`**: rol (`admin`, `usuario`, `profesor`, `test`).
4. **`profile_type`**: `admin`, `profesor`, `tester`, `tutor` o `adulto`; decide la ruta inicial y las páginas permitidas.
5. **`has_child_profile`**: si ya completó el formulario inicial.
6. **`user_first_name`** y **`selected_student_id`** (hijo elegido en el menú de la cuenta).

### Dónde se usan:
- **`composables/useAuth.ts`**: define y limpia las cookies al iniciar/cerrar sesión.
- **`plugins/api.ts`**: lee `auth_token` para el header `Authorization: Bearer` y, al renovar, actualiza `auth_token`, `refresh_token`, `user_role` y `profile_type`.
- **`middleware/*`**: `auth`, `guest`, `profile-access` y `assessment-gate` consultan `auth_token`, `profile_type` y `has_child_profile`.

> Son cookies de Nuxt legibles desde JS (no `HttpOnly`); el backend no emite cookies.

### Cómo crear o usar una nueva Cookie:
```ts
// En cualquier composable o página:
const userPreferences = useCookie<{ theme: string; language: string }>('user_prefs', {
  default: () => ({ theme: 'dark', language: 'es' }),
  maxAge: 60 * 60 * 24 * 365, // 1 año
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production', // true en producción
  httpOnly: false // accesible desde JS cliente si se requiere leer
})

// Leer:
console.log(userPreferences.value.theme)

// Modificar (se sincroniza automáticamente en el navegador y en el servidor SSR):
userPreferences.value.theme = 'light'

// Borrar / invalidar cookie:
userPreferences.value = null
```

---

## 5. Consumo de Servicios del Backend

### 1. Configuración de la URL Base
En [nuxt.config.ts](./nuxt.config.ts) se define la variable de configuración pública:
```ts
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api/v1'
  }
}
```
En `.env` se puede sobreescribir: `NUXT_PUBLIC_API_BASE=http://localhost:3000/api/v1`.

### 2. El Cliente Centralizado `$api`
En [app/plugins/api.ts](./app/plugins/api.ts) se crea una instancia especializada de `$fetch`:
- **Inyección automática del Token:** En cada request toma la cookie `auth_token` e incluye `Authorization: Bearer <token>`.
- **Renovación ante 401:** una sola llamada compartida a `POST /auth/refresh` con `refresh_token`; guarda los nuevos tokens y reintenta la petición una vez. `/auth/login|register|oauth|refresh` nunca disparan la renovación. Si no se puede renovar, limpia la sesión y redirige a `/login`.

### 3. Patrón Recomendado para Consumir Endpoints
Nunca se debe llamar a `$fetch` o `axios` directamente dentro de las vistas (`pages/*.vue`). Toda llamada al backend debe encapsularse en un **Composable**.

#### Ejemplo: Creando un composable de servicio `useCourses.ts`:
Crear el archivo `app/composables/useCourses.ts`:
```ts
export interface Course {
  id: string
  title: string
  description: string
  difficulty: 'facil' | 'intermedio' | 'avanzado'
}

export const useCourses = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const courses = useState<Course[]>('course_list', () => [])

  // 1. Obtener listado de cursos (GET)
  const fetchCourses = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $api<Course[]>('/courses', {
        method: 'GET'
      })
      courses.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Error al cargar cursos'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 2. Crear nuevo curso (POST)
  const createCourse = async (courseData: Partial<Course>) => {
    loading.value = true
    try {
      const newCourse = await $api<Course>('/courses', {
        method: 'POST',
        body: courseData
      })
      courses.value.push(newCourse)
      return newCourse
    } catch (err: any) {
      error.value = err.data?.message || 'Error al crear curso'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse
  }
}
```

---

> Los ejemplos con `courses` / `useCourses` de esta guía son ilustrativos; esos archivos no existen.

## 6. Guía de Creación: Componentes

Nuxt 4 auto-importa cualquier componente ubicado en `app/components/`.

### Convención de carpetas y nombres:
- Si creas `app/components/ui/UiBadge.vue`, el componente se llamará automáticamente `<UiBadge />`.
- Si creas `app/components/courses/CourseCard.vue`, se llamará `<CoursesCourseCard />` o `<CourseCard />`.

### Plantilla estándar con `<script setup lang="ts">`:

```vue
<!-- app/components/ui/UiBadge.vue -->
<script setup lang="ts">
// 1. Definición tipada de Props
interface Props {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  label: string
  icon?: string
}

// 2. Valores por defecto
const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  icon: undefined
})

// 3. Emits tipados (eventos hacia el padre)
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <span 
    class="ui-badge" 
    :class="`variant-${variant}`" 
    @click="emit('click')"
  >
    <i v-if="icon" :class="icon" class="badge-icon"></i>
    <span class="badge-text">{{ label }}</span>
  </span>
</template>

<style scoped lang="scss">
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;

  &.variant-success {
    background-color: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  &.variant-danger {
    background-color: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
}
</style>
```

---

## 7. Guía de Creación: Pages (Rutas y Páginas)

Toda vista se coloca en `app/pages/`. Cada archivo genera una ruta web.

### Reglas de Enrutamiento:
- `app/pages/index.vue` -> `/`
- `app/pages/login.vue` -> `/login`
- `app/pages/courses/index.vue` -> `/courses`
- `app/pages/courses/[id].vue` -> `/courses/:id` (Ruta dinámica)

### Plantilla de una Página Completa con Meta y Protección:

```vue
<!-- app/pages/courses/[id].vue -->
<script setup lang="ts">
// 1. Metadatos de la página (Layouts, Guards / Middleware)
definePageMeta({
  middleware: ['auth'], // Asigna el Guard de autenticación
  layout: 'default'     // Asigna el Layout (si se usan layouts)
})

// 2. Parámetros de la ruta
const route = useRoute()
const courseId = route.params.id as string

// 3. SEO y Head dinámico
useHead({
  title: `Curso #${courseId} - Vamos Aprendiendo`
})

// 4. Invocación de composables
const { courses, fetchCourses, loading } = useCourses()

onMounted(async () => {
  await fetchCourses()
})
</script>

<template>
  <div class="course-detail-container">
    <h1>Detalle del Curso: {{ courseId }}</h1>
    <div v-if="loading" class="loading-state">
      <p>Cargando información...</p>
    </div>
    <div v-else>
      <!-- Usando el componente UiCard existente -->
      <UiCard title="Información del Módulo">
        <p>Contenido del curso...</p>
      </UiCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.course-detail-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

---

## 8. Guía de Creación: Módulos

En el ecosistema Nuxt existen **dos tipos de conceptos** para la palabra "Módulo":

### Opción A: Módulo de Dominio / Feature (Arquitectura de Negocio)
Si vienes de Angular o NestJS y deseas organizar tu código por dominios (ej: Módulo Auth, Módulo Cursos, Módulo Estudiantes), en Nuxt se agrupan mediante subcarpetas limpias:
- `app/components/courses/` -> Componentes de la funcionalidad.
- `app/composables/useCourses.ts` -> Servicios y lógica del módulo.
- `app/pages/courses/` -> Vistas del módulo.

### Opción B: Módulo de Nuxt (Integraciones del Framework)
Un módulo de Nuxt extiende el ciclo de compilación o inyecta librerías externas (como `@primevue/nuxt-module`).

Para instalar y registrar un nuevo módulo de Nuxt:
1. Instalar la librería:
   ```bash
   npm install @nuxtjs/color-mode
   ```
2. Registrarlo en `nuxt.config.ts`:
   ```ts
   export default defineNuxtConfig({
     modules: [
       '@primevue/nuxt-module',
       '@nuxtjs/color-mode' // <-- Nuevo módulo añadido
     ]
   })
   ```

---

## 9. Guía de Creación: Guards (Route Middleware)

En Nuxt y Vue, el concepto de **Guard** (como el `CanActivate` de Angular) se denomina **Route Middleware**.

Los Guards se ubican en `app/middleware/`. Nuxt los detecta automáticamente por su nombre de archivo.

### 1. Guards Existentes en el Proyecto
| Middleware | Función |
|---|---|
| [`auth`](./app/middleware/auth.ts) | Exige `auth_token`; el staff (admin/profesor) no entra a `/profile-selection` ni `/child-registration`, y quien ya completó el setup tampoco. |
| [`guest`](./app/middleware/guest.ts) | Con sesión completa (token + `profile_type`) redirige a `/home`. Para `login`/`register`. |
| [`profile-access`](./app/middleware/profile-access.ts) | Control principal: exige sesión, resuelve la ruta de inicio (`resolveHomeRoute`) y bloquea páginas fuera de `allowedProfiles`. |
| [`assessment-gate`](./app/middleware/assessment-gate.ts) | Lleva a `/initial-assessment` si falta el diagnóstico (admin/profesor exentos). |

Uso recomendado en una página:
```ts
definePageMeta({ middleware: 'profile-access', allowedProfiles: ['tutor', 'adulto'] })
```

### 2. Cómo Crear un Nuevo Guard (Ejemplo: Guard de Roles `role.ts`)
Crear el archivo `app/middleware/role.ts`:
```ts
// app/middleware/role.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token')
  const { user } = useAuth()

  // 1. Si ni siquiera está autenticado, al login
  if (!token.value) {
    return navigateTo('/login')
  }

  // 2. Comprobar roles requeridos especificados en la meta de la página
  const requiredRoles = to.meta.requiredRoles as string[] | undefined

  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user.value?.role || 'usuario'
    
    if (!requiredRoles.includes(userRole)) {
      // Si no tiene permisos, redirigir a vista no autorizada o al inicio
      return navigateTo('/home')
    }
  }
})
```

### 3. Cómo Aplicar el Guard en una Página
En cualquier página (`app/pages/admin.vue`):
```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  requiredRoles: ['admin', 'profesor'] // Parámetro leído por el Guard
})
</script>
```

### 4. Guard Global (Aplica a todas las rutas sin excepción)
Si nombras el archivo con el sufijo `.global.ts` (ej: `app/middleware/analytics.global.ts`), se ejecutará automáticamente en cada navegación sin necesidad de declararlo en `definePageMeta`.

---

## 10. Buenas Prácticas y Convenciones del Proyecto

1. **Variables Reactivas Compartidas:**
   - Usa `useState('key', () => initValue)` en los composables en lugar de `ref()` para estados que deben persistir entre páginas o renderizarse de manera consistente en SSR.
2. **Navegación Programática:**
   - Usa `await navigateTo('/ruta')` provisto por Nuxt en lugar de `window.location.href` o `$router.push`.
3. **Consumo de la API:**
   - Consume siempre a través de `const { $api } = useNuxtApp()` para garantizar que el Bearer token viaje automáticamente y que los errores 401 sean tratados sin duplicar lógica.
4. **Manejo de Errores en Formularios:**
   - Lee `error.value` del composable y muéstralo al usuario mediante componentes UI reutilizables (como los existentes en `app/components/ui/`).
5. **Estilos:**
   - Utiliza las variables CSS maestras definidas en `app/assets/scss/main.scss` (ej: `var(--color-primary-500)`, `var(--radius-md)`) para mantener coherencia cromática y estética premium.
