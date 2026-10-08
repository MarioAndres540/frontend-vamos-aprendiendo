# Registro de Cambios (CHANGELOG) — Frontend

Todos los cambios notables realizados en este proyecto se documentarán en este archivo.

---

## [Unreleased]

#### 📡 Dashboard del tutor / adulto: conexión a la app de Unity
- **Encabezado**: "Hola, {nombre}" con la fecha del día, en lugar del buscador sin función. La etiqueta del usuario muestra su perfil real (Tutor / Adulto / Tester) y no "Docente". El nombre se guarda al iniciar sesión en la cookie `user_first_name` (se borra al cerrar sesión).
- **Tarjeta "Conexión a la app"** (`components/dashboard/AppConnectionCard.vue`), en lugar de "Estudiantes activos":
  - **Activo**: punto verde fluorescente con brillo, contador en vivo de cuánto lleva conectado, hora de ingreso, hijo que juega (si la app lo envía) y total del día.
  - **Inactivo**: punto rojo, cuándo se desconectó (hoy / ayer / fecha) y por qué (cerró la app, cerró sesión, sin señal), y cuánto duró la sesión.
  - **Sin conexiones**: aviso de que aún no se ha ingresado a la app con la cuenta.
- **Composable `useAppPresence`**: consulta `GET /presence/me` cada 10 s (solo con la pestaña visible) y avanza el contador cada segundo, sincronizado con la hora del servidor.
- Verificado con respuestas simuladas en escritorio y celular. Requiere la migración `app_sessions` del backend y reiniciar el backend.

#### 🔀 Flujo después del registro y destino por tipo de perfil
- **El registro ya no inicia sesión**: al crear la cuenta se envía a `/login?registered=1&email=…`, que muestra "¡Tu cuenta fue creada! Inicia sesión para continuar." y precarga el correo.
- **Destino al iniciar sesión** según `profileType` (resuelto por el backend y guardado en la cookie `profile_type`). Reglas centralizadas en `app/utils/profile-routes.ts` (`resolveHomeRoute`):

  | Perfil | Destino | Formulario inicial |
  |---|---|---|
  | Admin | `/admin` | Nunca |
  | Profesor | `/teacher/dashboard` | Nunca |
  | Tester | `/initial-assessment` | Siempre, eligiendo versión niño o adulto |
  | Tutor | `/initial-assessment` o `/dashboard` | Versión niños, solo hasta completarlo |
  | Adulto | `/initial-assessment` o `/dashboard` | Versión adultos (memoria, retentiva, prevención), solo hasta completarlo |

- **Nuevo middleware `profile-access`**: cada página declara `allowedProfiles` en `definePageMeta`; quien no tenga permiso va a su ruta de inicio. Evita que tutor/adulto vuelvan al formulario ya completado y que entren al dashboard sin completarlo. Una sesión antigua sin `profile_type` se cierra y se envía al login.
- `guest` solo considera iniciada una sesión con token **y** tipo de perfil; `/home` redirige con `resolveHomeRoute`.
- `initial-assessment.vue`: la versión del formulario es fija según el perfil (tutor → niños, adulto → adultos); el selector niño/adulto solo aparece para testers.
- Verificado con 24 combinaciones de perfil × página contra el servidor de Nuxt.

#### 🆕 Paneles por rol
- **`/teacher/dashboard`** (perfil profesor): institución, número de estudiantes y grados, y tabla de estudiantes con búsqueda (`GET /teacher/dashboard`, composable `useTeacherDashboard`).
- **`/admin`** (perfil admin): resumen, búsqueda por nombre/correo, filtro por rol, tabla de usuarios con rol, estado, formulario inicial, días de prueba y fecha de registro, y paginación (`GET /admin/users`, composable `useAdminUsers`).
- Componente `LayoutPanelHeader` (logo, rol y cerrar sesión) y estilos compartidos `assets/scss/_panel.scss`, con el diseño del login y adaptados a celular, tablet y escritorio.

#### ✅ Implementado
- **Renovación Automática de Tokens** en `app/plugins/api.ts`:
  - Ante un `401 Unauthorized`, `$api` llama a `POST /auth/refresh` con el `refresh_token` guardado, actualiza las cookies (`auth_token`, `refresh_token` rotado, `user_role`) y reintenta la petición original una sola vez.
  - Si varias peticiones fallan al mismo tiempo, comparten una única renovación.
  - Los endpoints `/auth/login`, `/auth/register`, `/auth/oauth` y `/auth/refresh` no disparan la renovación.
  - Si la renovación falla o no hay refresh token, se limpia la sesión y se redirige a `/login`.
- **Rediseño de `app/pages/register.vue`** con el estilo visual del login (fondo, logo, Plus Jakarta Sans, paleta y tarjeta blanca):
  - Asistente de 3 pasos con barra de progreso: **Perfil** → **Tus datos** → **Estudiantes / Institución / Confirmar** (según el perfil).
  - Panel izquierdo con mensaje y personajes que cambian según el perfil (niños, docentes o adultos mayores).
  - Validación por paso: los datos personales se revisan antes de avanzar al paso 3; se conservan la verificación de pre-autorización docente y las validaciones de estudiantes.
  - El tutor inicia con un estudiante ya agregado; el grado escolar ahora es una lista (Transición a 11°) y los estudiantes heredan el apellido del tutor.
  - Diseño adaptable: monitores grandes (≥1600 px), portátiles, tablets (≤1024 px, panel horizontal sobre la tarjeta) y celulares (≤640 px, una columna, campos de 16 px para evitar el zoom de iOS).
  - `color-scheme: light` en la página para que los controles nativos no salgan oscuros cuando el sistema está en modo oscuro.
- **Corrección de "426 Upgrade Required" en Firefox (servidor de desarrollo)**:
  - Se eliminó `PORT=4242` de `.env`: Nuxt/Vite lo usaban como primer candidato para el WebSocket de HMR, que quedaba escuchando en `127.0.0.1:4242`; Firefox (que usa IPv4 para `localhost`) recibía el WebSocket en lugar de la app.
  - El puerto de desarrollo queda definido solo en `nuxt.config.ts` (`devServer.port: 4242`); el HMR usa su propio puerto (24678). `.env.example` documenta por qué no debe agregarse `PORT`.
- **Registro — colegio del estudiante**: la opción "Sin colegio asignado" usaba `:value="undefined"`, con lo que Vue enviaba el texto de la opción como `institutionId`. Ahora usa `""` y el payload envía `undefined` cuando no hay colegio.
- **Manejo de errores de autenticación (`useAuth`)**:
  - Soporta mensajes del backend como texto o lista (errores de `class-validator`) y muestra un mensaje de conexión cuando el servidor no responde.
  - Expone `errorStatus` (código HTTP del último error). En el registro, un `409` (correo o documento ya registrado) devuelve al paso "Tus datos" para corregirlo.
  - El error global de autenticación se limpia al entrar al registro y al cambiar de paso, para no mostrar errores de otras pantallas.

---

## [1.1.0] - 2026-10-01

### 🚀 Flujos de Registro Multi-perfil, Licencias y Evaluación Inicial

#### ✅ Implementado

- **Composables Reactivos**:
  - [`app/composables/useInstitutions.ts`](file:///e:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/composables/useInstitutions.ts): Consumo de lista de colegios públicos/privados y validación en tiempo real de pre-autorización docente (`checkTeacherPreauth`).
  - [`app/composables/useLicenses.ts`](file:///e:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/composables/useLicenses.ts): Consulta y tipado de beneficios del plan activo (`isPro`, `isTrial`, `isFree`), origen y cálculo de días restantes.
  - [`app/composables/useAssessment.ts`](file:///e:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/composables/useAssessment.ts):
    - Banco de preguntas psicopedagógicas para **Niños (8 preguntas medibles)**: Dislexia, discalculia, TDAH (atención e impulsividad), memoria operativa y grafomotricidad.
    - Banco de preguntas para **Adultos / Mayores (7 preguntas medibles)**: Memoria reciente, prospectiva, fluidez verbal, orientación espacial, funciones ejecutivas y estimulación cognitiva.
    - Método `submitAssessment()` que persiste las respuestas y actualiza `has_completed_setup` en el estado global.
  - [`app/composables/useAuth.ts`](file:///e:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/composables/useAuth.ts): Extendido para soportar registro con múltiples hijos (`children: ChildItemPayload[]`), asignación de colegio, pre-autorización docente y redirección inteligente post-login.

- **Protección y Reglas de Navegación**:
  - [`app/middleware/assessment-gate.ts`](file:///e:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/middleware/assessment-gate.ts): Intercepta el inicio de sesión para tutores y adultos que no hayan completado el diagnóstico inicial (`hasCompletedSetup === false`), redirigiéndolos obligatoriamente a `/initial-assessment` y permitiendo el acceso directo al dashboard en visitas posteriores.

- **Vistas y Páginas**:
  - [`app/pages/register.vue`](file:///e:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/pages/register.vue):
    - Selector de perfil: **Tutor (Padre/Madre)**, **Docente (Profesor)** o **Adulto Independiente**.
    - **Sección Docente**: Selector de colegios y botón de verificación de autorización con la institución.
    - **Sección Tutor**: Sub-formulario reactivo para agregar/eliminar $N$ hijos en tiempo real con cálculo automático de edad y vinculación de grado escolar.
  - [`app/pages/initial-assessment.vue`](file:///e:/SENA/Proyecto%20productivo/vamos-aprendiendo-web/frontend/app/pages/initial-assessment.vue):
    - Wizard interactivo de evaluación diagnóstica (≤ 10 preguntas).
    - Escala Likert de 5 puntos con iconos, colores y descripciones claras.
    - Barra de progreso interactiva por pregunta.
    - Modal de resultados con cálculo de puntuación total, nivel de alerta (*Bajo*, *Moderado*, *Alto*) y recomendaciones pedagógicas personalizadas.

---

## ⏳ Pendiente por Implementar (Próximos Pasos)

1. **Conexión de Métricas Reales en `dashboard.vue`**:
   - Conectar los gráficos de rendimiento por área y el historial de actividades con los resultados reales provenientes de `initial_assessments` y las sesiones de juego.
2. **Panel de Gestión de Licencias en Frontend**:
   - Componente visual `LicenseBadge.vue` y modal de actualización de plan (Upgrade a Pro) en la cabecera del usuario cuando el Trial esté próximo a expirar.
3. **Módulo de Administración de Instituciones en Frontend**:
   - Vistas administrativas para crear colegios y cargar archivos de profesores autorizados.
4. **Inicio de sesión con Google (OAuth 2.0 / OIDC)** — hoy el botón "Continuar con Google" de `app/pages/login.vue` (`handleGoogleLogin`) solo hace un `console.log`:
   - Agregar la variable `NUXT_PUBLIC_GOOGLE_CLIENT_ID` en `.env` y `.env.example` (el mismo Client ID web configurado en Google Cloud y en Supabase).
   - Cargar **Google Identity Services** (`https://accounts.google.com/gsi/client`) y mostrar el botón o el One Tap con ese Client ID, generando un `nonce` por intento.
   - Agregar `loginWithGoogle()` en `useAuth`: enviar `response.credential` a `POST /auth/oauth` con `{ provider: 'google', idToken, nonce }`, guardar los tokens y redirigir igual que `login()`.
   - Crear una pantalla para completar el perfil después del primer inicio con Google (tipo de perfil tutor/docente/adulto, documento, teléfono, colegio e hijos), porque el backend crea el perfil con datos inventados.
   - Depende de las correcciones del backend descritas en `backend/CHANGELOG.md` (pendiente #4).
   - Al iniciar con Google, guardar `profile_type` y redirigir con `resolveHomeRoute()`, igual que `login()`.
5. **Acciones del panel de administración** (`/admin`): hoy es de solo lectura. Agregar interfaz para las acciones que el backend ya ofrece: editar datos, rol o estado (`PATCH /admin/users/:id`), cambiar correo, extender la prueba de testers y eliminar usuarios.
6. ✅ **Inicio de sesión del estudiante** (decisiones del 2026-10-07 y 2026-10-08): el niño no tiene cuenta propia; usa la cuenta de su tutor (o el adulto la suya) en la app de Unity y en la web, y puede estar abierta en ambas a la vez sin restricción. Esos son los perfiles que ya maneja `profile-routes.ts`. No hay trabajo pendiente en el frontend; los detalles de Unity están en `backend/CHANGELOG.md` (pendiente #5).
7. **Páginas del flujo anterior**: `profile-selection.vue` y `child-registration.vue` siguen usando el middleware `auth` y no forman parte del flujo nuevo (el registro de hijos ya está en `register.vue`). Revisar si se eliminan o se integran, y quitar sus enlaces del menú de `dashboard.vue`.
8. **Dashboard de usuarios (`dashboard.vue`)** — ✅ el saludo, la etiqueta de perfil y la tarjeta de conexión a la app ya están (ver `[Unreleased]`). **Pendiente**: construir las demás tarjetas (actividades, tiempo de juego, precisión, rendimiento por área, perfil destacado, etc.) con la información del formulario inicial (`initial_assessments`) y luego con la telemetría de Unity. Antecedentes del reporte original: **muestra "Docente" a tutores y adultos** (reportado el 2026-10-07 al probar con la tutora `marisolvice@gmail.com`):
   - **Verificado en la base**: la cuenta es correcta. Rol `usuario`, tutora de Matías Villegas Ceballos (`tutor_students`), sin registro en `teachers`, formulario de niños completado. El login la envió a `/dashboard` como corresponde.
   - **Causa**: la etiqueta de rol del encabezado está fija en el código (`dashboard.vue:326`, `<span class="user-role">Docente</span>`), y el correo de respaldo es `docente@vamosaprendiendo.edu` (línea 335).
   - **Además**: el contenido de la página está pensado para un docente (128 estudiantes activos, menú "Estudiantes" y "Diagnósticos", acción "Nuevo Diagnóstico", "Gestionar Estudiantes") y todo son datos de ejemplo.
   - **Por hacer**:
     - Mostrar el perfil real (`profile_type`: Tutor / Adulto / Tester) y el nombre del usuario.
     - Adaptar el contenido: el tutor ve a sus hijos y el progreso de cada uno; el adulto ve sus propias actividades de memoria y atención.
     - Conectarlo a datos reales (se relaciona con el pendiente #1).
9. **Dashboard de profesores**: ampliar con métricas de los estudiantes (evaluaciones iniciales y telemetría de juego) cuando el módulo de telemetría esté listo.
