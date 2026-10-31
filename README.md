# Frontend — Vamos Aprendiendo Web

Aplicación web del proyecto educativo **Vamos Aprendiendo** (SENA): registro y diagnóstico inicial, dashboards para tutores/adultos, profesores y administradores, actividades, analíticas y biblioteca.

**Stack:** Nuxt 4 · Vue 3 (`<script setup lang="ts">`) · PrimeVue 4 (tema Aura) · Sass · consume la API NestJS del backend.

---

## Requisitos

- Node.js >= 20
- Backend corriendo (`../backend_vamos-aprendiendo`, puerto `3000`)

## Instalación

```bash
npm install
cp .env.example .env
```

Variable de entorno:

| Variable | Descripción | Por defecto |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | URL del backend, incluye `/api/v1` | `http://localhost:3000/api/v1` |

> No definas `PORT` en `.env`: el puerto de desarrollo (**4242**) está en `nuxt.config.ts` (`devServer.port`). Si lo defines, el WebSocket de HMR falla con `426 Upgrade Required`. El backend solo acepta CORS desde `http://localhost:4242`.

## Scripts

```bash
npm run dev       # servidor en http://localhost:4242 (nodemon: reinicia al cambiar .env o nuxt.config.ts)
npm run dev:raw   # nuxt dev sin nodemon
npm run build     # build de producción (.output/)
npm run preview   # previsualiza el build
npm run generate  # sitio estático
```

## Estructura (`app/`)

| Carpeta | Contenido |
|---|---|
| `pages/` | Rutas: `login`, `register`, `initial-assessment`, `dashboard`, `activities`, `analytics`, `diagnostics`, `library/`, `settings`, `admin/`, `teacher/dashboard`, … |
| `components/` | `ui/` (UiButton, UiCard, UiInput, UiModal), `dashboard/`, `layout/`, `library/`, `panel/` |
| `composables/` | Lógica y llamadas al backend: `useAuth`, `useProfile`, `useMyStudents`, `useAssessment`, `useTelemetry`, `useAppPresence`, `useAdminUsers`, … |
| `middleware/` | `auth`, `guest`, `profile-access`, `assessment-gate` |
| `plugins/api.ts` | Cliente `$api`: Bearer automático y renovación del token ante 401 |
| `layouts/` | `user-panel` |
| `utils/` | Rutas por perfil (`profile-routes.ts`), opciones de formularios, textos, biblioteca |
| `assets/` | SCSS (`scss/main.scss`), tokens CSS, imágenes |

## Sesión y perfiles

La sesión vive en cookies de Nuxt (7 días): `auth_token`, `refresh_token`, `user_role`, `profile_type`, `has_child_profile`, `user_first_name`, `selected_student_id`. Según `profile_type` (`admin`, `profesor`, `tester`, `tutor`, `adulto`) se decide la ruta inicial y las páginas permitidas.

## Documentación

- Arquitectura y guía de desarrollo: [`ARQUITECTURA.md`](./ARQUITECTURA.md)
- Reglas para agentes de IA: [`AGENTS.md`](./AGENTS.md)
- Historial de cambios: [`CHANGELOG.md`](./CHANGELOG.md)
- Especificación funcional: [`../SPEC.md`](../SPEC.md)
- API del backend: [`../backend_vamos-aprendiendo/README.md`](../backend_vamos-aprendiendo/README.md)
