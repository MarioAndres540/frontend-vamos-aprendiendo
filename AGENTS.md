# Frontend Development Guidelines - Vamos Aprendiendo Web

Antes de cambiar código lee [`ARQUITECTURA.md`](./ARQUITECTURA.md) y [`../SPEC.md`](../SPEC.md). Registra los cambios relevantes en [`CHANGELOG.md`](./CHANGELOG.md).

## Technology Stack
- **Nuxt 4** (código en `app/`), Vue 3 Composition API con `<script setup lang="ts">`
- **PrimeVue 4** (tema Aura, `@primevue/nuxt-module`) + `primeicons` + Sass
- API: backend NestJS en `NUXT_PUBLIC_API_BASE` (por defecto `http://localhost:3000/api/v1`)
- Dev server en el puerto **4242** (`nuxt.config.ts`); no definir `PORT` en `.env`

## Reglas
1. **Llamadas al backend solo desde composables** (`app/composables/use*.ts`), usando `const { $api } = useNuxtApp()`. Nunca `$fetch`/`axios` directo en páginas. `$api` agrega el Bearer y renueva el token ante un 401 (una sola vez); si falla, limpia la sesión y redirige a `/login`.
2. **Estado compartido** con `useState('clave', () => valor)`; cookies con `useCookie` usando `SESSION_COOKIE_OPTIONS` (`utils/profile-routes.ts`).
3. **Rutas protegidas** con `definePageMeta`: `middleware: 'profile-access'` y `allowedProfiles: ['tutor', 'adulto']`; otros middleware: `auth`, `guest`, `assessment-gate`. Perfiles: `admin`, `profesor`, `tester`, `tutor`, `adulto`. Rutas iniciales en `ROUTES` / `resolveHomeRoute`.
4. **Navegación** con `navigateTo()`, nunca `window.location`.
5. **Componentes**: props y emits tipados; reutilizar `components/ui/` (`UiButton`, `UiCard`, `UiInput`, `UiModal`) y PrimeVue antes de crear nuevos.
6. **Estilos**: variables de `assets/scss/_variables.scss`, `assets/css/tokens.css` y `main.scss`; `<style scoped lang="scss">`.
7. **Textos** de interfaz en español.
8. Verificar con `npm run build` (y `npx nuxi typecheck` si se tocan tipos) antes de terminar.

## Skills
Ver `../backend_vamos-aprendiendo/.agents/skills/` (`nuxt4-feature-builder`, `fullstack-test-runner`).

## Validación con Context7 (obligatoria)
Antes de terminar cualquier implementación, consulta la documentación vigente de las librerías usadas con el MCP Context7 (`resolve-library-id` → `query-docs`) y ajusta el código a ella; después ejecuta las verificaciones del proyecto. Detalle en `../AGENTS.md`.
