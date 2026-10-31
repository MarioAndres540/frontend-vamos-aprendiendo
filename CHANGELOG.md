# Registro de Cambios (CHANGELOG) — Frontend

Todos los cambios notables realizados en este proyecto se documentarán en este archivo.

---

## [Unreleased]

#### 🔄 Tipo de perfil actualizado al renovar la sesión (2026-10-29)
- `plugins/api.ts`: al renovar el token (`POST /auth/refresh`) también se actualiza la cookie `profile_type` con el valor que recalcula el backend. Antes un cambio de rol, o un adulto que agrega un hijo y pasa a tutor, solo se reflejaba en el siguiente inicio de sesión.

#### 🎯 Nuevas pestañas Actividades, Analíticas y Biblioteca (2026-10-26)
- El menú lateral lleva a `/activities`, `/analytics` y `/library` (antes `#`). La pestaña queda activa también en subpáginas (`/library/:id`). Las acciones rápidas del dashboard ahora son "Ver Actividades" y "Ver Analíticas".
- Las tres muestran los datos del hijo elegido en el menú de la cuenta (tutor) o del propio usuario (adulto / tester), y se actualizan al cambiar de hijo. Lo resuelve el nuevo composable `usePanelSubject`.
- **Actividades** (`GET /telemetry/progress`):
  - Las 7 áreas cognitivas con descripción, qué registra la app, nivel y puntos.
  - Las **recomendadas** según las áreas a reforzar del formulario inicial (`recommendedCategories`).
  - Filtros Todas / Recomendadas / Sin jugar.
- **Analíticas**:
  - **Uso de la app** (`GET /presence/history`): tiempo total, sesiones, promedio, último ingreso, gráfico por día, semana o mes según el periodo (7, 30, 90 días o 1 año), y últimas sesiones con motivo de cierre. Avisa cuando las sesiones no indican qué hijo jugó.
  - **Desempeño en el juego** (`GET /telemetry/performance`): valores frente al rango esperado para la edad. Hoy muestra los rangos y "Sin datos de juego todavía".
  - **Evolución del formulario inicial** y **patrones a observar** (avisos de trazos).
- **Biblioteca** (`/library` y `/library/:id`):
  - Guías recomendadas según el formulario.
  - Búsqueda (sin tildes ni mayúsculas) y filtros por área.
  - "Cómo usar Vamos Aprendiendo", con enlaces a las funciones reales.
  - Guías por área y página de detalle con ideas para la casa.
  - **El contenido (8 guías en `utils/library.ts`) es provisional y debe revisarlo el equipo pedagógico.**
- Nuevos: `components/panel/SubjectHeader.vue`, `components/library/GuideCard.vue`, `assets/scss/_user-panel.scss` (estilos compartidos), composables `useTelemetry` y `useAppUsage`.
- `utils/assessment-areas.ts`: relación entre dimensiones del formulario y categorías del juego (`categoryForDimension`, `recommendedCategories`), `recommendedRouteOf` (también la usa Diagnósticos) y `CATEGORY_TRACKING`.
- `useAssessmentHistory` y `useMyLatestAssessment` exponen `loaded`.
- **Requiere reiniciar el backend** para tener `/presence/history` y `/telemetry/*`.

#### 🩺 Nueva pestaña Diagnósticos (`/diagnostics`) (2026-10-26)
- El menú "Diagnósticos" (y la acción rápida, ahora "Ver Diagnóstico") lleva a la nueva página en lugar de `/child-registration`. Implementa la propuesta visual aprobada.
- **Tutor**: muestra el formulario del hijo elegido en el menú de la cuenta; al cambiar de hijo la página se actualiza sin ir al dashboard (`definePageMeta({ showsSelectedStudent: true })`, también en el dashboard). **Adulto / tester**: su propio formulario.
- Contenido:
  - Persona evaluada, quién respondió, fecha y número de preguntas.
  - **Nivel de alerta**: puntaje sobre el máximo, con una barra que marca los rangos bajo, moderado y alto (los mismos límites del backend: niños 15/25, adultos 12/22).
  - **Área de enfoque principal** (la condición que calcula el backend), con sus preguntas y puntos.
  - **Ruta recomendada**, tomada del texto de recomendaciones del backend.
  - **Perfil por área**: promedio de 1 a 5 por área, en colores de fortaleza, a observar o a reforzar.
  - **Lo que encontramos**: fortalezas, áreas a reforzar y frases en lenguaje sencillo. Si el enfoque del backend (puntaje sumado) no coincide con el área de respuesta más alta, se explica.
  - **Respuestas del formulario**: las preguntas con su texto completo, área y respuesta.
  - **Próximos pasos**, con el aviso de que el resultado es orientativo y **no es un diagnóstico clínico**.
  - **Historial** de formularios del hijo (o propios).
- Acciones: **Imprimir o guardar PDF** (`window.print()`, sin botones en la impresión) y **Repetir formulario** (tutor: con el `studentId` del hijo; tester: su formulario; el adulto no, porque el formulario es una sola vez).
- Sin formulario todavía: aviso con "Hacer formulario inicial". Tutor sin hijos: enlace a Configuración.
- `utils/assessment-areas.ts`: `scoreAreas` (todas las áreas con promedio, preguntas y tono), `answerLabel`, `areaTone`, `riskThresholds`, `describeFindings` y `joinList`. `summarizeAreas` ahora se apoya en `scoreAreas`.
- `useMyStudents.ts`: nuevo `useAssessmentHistory` (`GET /assessments/history`, con `studentId` opcional); `useMyLatestAssessment` lo reutiliza.
- **Corregido**: Diagnósticos, Configuración y la tarjeta "Tutor de" mostraban por un instante "Aún no tienes hijos" antes de cargar la lista; ahora muestran "Cargando" hasta la primera respuesta.

#### 📐 Ajustes de diseño: título en el encabezado y Configuración en dos columnas (2026-10-25)
- **Dashboard**: "Panel de Progreso / Resumen general del aprendizaje" ya no ocupa una fila propia sobre las tarjetas; sube al **centro del encabezado**. Cada página lo declara con `definePageMeta({ headerTitle, headerSubtitle })` y `layouts/user-panel.vue` lo muestra centrado (encabezado en tres columnas: saludo | título | acciones). En pantallas de 1100 px o menos el título va debajo del menú, porque no cabe en la barra.
- **Configuración**: "Mis datos" y "Hijos o menores a cargo" quedan **una al frente de la otra** y se apilan en pantallas de 1100 px o menos. Se quitó el ancho máximo que dejaba vacío el lado derecho.
- **Carrusel de hijos** en Configuración: se ve un hijo a la vez. Las flechas `<` y `>` van en los extremos de la tarjeta y solo aparecen si hay un hijo anterior o siguiente; con un solo hijo no se muestran. No avanza solo, únicamente con las flechas. Muestra "1 de N" y una animación corta de deslizamiento, que se desactiva si el sistema pide reducir el movimiento.

#### ⚙️ Configuración, menú de la cuenta e hijos a cargo (2026-10-25)
- **Layout compartido `layouts/user-panel.vue`**: el menú lateral, el saludo y el menú de la cuenta salieron de `dashboard.vue` y ahora los usan `/dashboard` y `/settings`. El enlace activo del menú se calcula según la ruta.
  - En tablet y celular (≤ 1024 px), donde el menú lateral se oculta, aparece un **menú horizontal** bajo el encabezado (antes no había forma de navegar en esos tamaños).
- **Menú de la cuenta**: se quitaron "Cambiar Perfil" y "Diagnóstico". Quedan los **hijos a cargo** (solo tutor) y **Cerrar sesión**. Al elegir un hijo se consulta `GET /students/:id` y la tarjeta "Tutor de" del dashboard muestra su información; el hijo elegido se recuerda en la cookie `selected_student_id`. El menú se cierra al hacer clic fuera o con Escape.
- **Nueva vista `/settings`** (menú "Configuración"; perfiles tutor, adulto y tester):
  - **Mis datos**: nombres, apellidos, tipo y número de documento, teléfono y correo. Se pueden cambiar el **tipo de documento**, el **teléfono** y el **correo** (este último pide la contraseña actual).
  - **Hijos o menores a cargo** (tutor): nombres, apellidos, documento, grado, edad, colegio y estado del formulario inicial, con acceso a "Hacer formulario" si está pendiente.
  - **Agregar hijo o menor**: nombres, apellidos, tipo y número de documento, fecha de nacimiento (edad automática, entre 3 y 17 años), grado y colegio. Al guardar se pasa al **formulario inicial de ese menor**.
- **Formulario inicial por hijo**: `/initial-assessment?studentId=…` muestra "Formulario de {nombre}" y envía el `studentId` a `POST /assessments`. El middleware `profile-access` deja entrar al tutor aunque ya haya completado su primer formulario cuando la URL trae `studentId`.
- La tarjeta "Tutor de" ya no tiene pestañas propias: muestra el hijo elegido en el menú de la cuenta y ofrece "Hacer formulario inicial" si le falta.
- Composables: `useMyStudents` (estado compartido: lista, hijo seleccionado, `selectStudent`, `createStudent`) y `useProfile` (`GET/PATCH /profile/me`, `PATCH /profile/me/email`). Al cerrar sesión se limpian los hijos y el perfil cargados.
- Utilidades compartidas: `utils/form-options.ts` (tipos de documento, grados y cálculo de edad; `register.vue` ahora las usa) y `utils/text.ts` (nombres con mayúscula inicial e iniciales del avatar).

#### 👨‍👧 Dashboard del tutor / adulto: sin elementos de profesor (2026-10-25)
- Se quitó **"Estudiantes"** del menú lateral y la acción rápida **"Gestionar Estudiantes"**: la gestión de estudiantes es del profesor (`/teacher/dashboard`).
- **"Perfil destacado"** (Sofía Ramírez, XP y nivel de ejemplo) se reemplazó por `components/dashboard/ProfileSummaryCard.vue`:
  - **Tutor**: tarjeta "Tutor de" con cada hijo (nombre, grado, edad y colegio) y su formulario inicial: nivel de alerta, área de enfoque, **Fortalezas** y **A mejorar**. Si tiene varios hijos, aparece un selector.
  - **Adulto / tester**: tarjeta "Mi perfil" con su propio formulario inicial.
- Composables `useMyStudents` (`GET /students/mine`) y `useMyLatestAssessment` (`GET /assessments/history`).
- `app/utils/assessment-areas.ts`: nombres de cada dimensión del formulario y cálculo de fortalezas (promedio ≤ 2) y áreas a mejorar (≥ 3, máximo 2 de cada una). En empates va primero la condición principal calculada por el backend, para que coincida con el nivel de alerta.
- Acciones rápidas: con un número impar de acciones, la última ocupa toda la fila (al quitar "Gestionar Estudiantes" quedaban 3 y la última se veía a media anchura).
- Se eliminaron los estilos de la tarjeta "Perfil destacado" (`.profile-spotlight-card`, XP y chips) que ya no se usan.
- Datos esperados para la tutora de prueba (`marisolvice@gmail.com`): Matías, 2° Primaria · 7 años, sin colegio, alerta moderada con enfoque en Matemáticas; fortalezas Autocontrol y Trazo y escritura; a mejorar Atención y Matemáticas.

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
7. **Páginas del flujo anterior**: `profile-selection.vue` y `child-registration.vue` siguen usando el middleware `auth` y no forman parte del flujo nuevo (el registro de hijos ya está en `register.vue`). Revisar si se eliminan o se integran, y quitar sus enlaces del menú de `dashboard.vue`. (2026-10-25: ya se quitaron "Estudiantes", "Gestionar Estudiantes" y, del menú de la cuenta, "Cambiar Perfil" y "Diagnóstico"; siguen "Diagnósticos" en el menú lateral y "Nuevo Diagnóstico" en acciones rápidas → `/child-registration`.)
7b. **Formulario inicial por hijo**: ✅ los hijos agregados desde Configuración y los que tienen el formulario pendiente ya se diagnostican con `?studentId=`. Pendiente: el formulario del primer inicio de sesión (después del registro) aún no pregunta de qué hijo es; con varios hijos registrados a la vez queda sin asignar.
7c. ✅ **Menú "Diagnósticos"**: ahora lleva a `/diagnostics` (2026-10-26). `/child-registration` y `/profile-selection` ya no tienen enlaces desde el panel; falta decidir si se eliminan.
7e. **Biblioteca**: revisar y completar el contenido de las guías con el equipo pedagógico; si debe editarlo el administrador, moverlo a una tabla en la base.
7f. **Actividades y Analíticas**: se llenarán cuando la app de Unity guarde sesiones de juego, trazos y progreso (falta el backend de escritura de telemetría) y envíe el `studentId` al abrir la sesión.
7d. **Diagnósticos — pendientes**: definir las actividades sugeridas por área (cuando existan en la app de Unity) y un periodo recomendado para repetir el formulario; permitir que el adulto repita su formulario (hoy el middleware solo lo deja una vez).
8. **Dashboard de usuarios (`dashboard.vue`)** — ✅ el saludo, la etiqueta de perfil, la tarjeta de conexión a la app y la tarjeta "Tutor de" / "Mi perfil" ya están (ver `[Unreleased]`). **Pendiente**: construir las demás tarjetas (actividades, tiempo de juego, precisión, rendimiento por área, progreso por ruta, actividad reciente, etc.) con la información del formulario inicial (`initial_assessments`) y luego con la telemetría de Unity. Antecedentes del reporte original: **muestra "Docente" a tutores y adultos** (reportado el 2026-10-07 al probar con la tutora `marisolvice@gmail.com`):
   - **Verificado en la base**: la cuenta es correcta. Rol `usuario`, tutora de Matías Villegas Ceballos (`tutor_students`), sin registro en `teachers`, formulario de niños completado. El login la envió a `/dashboard` como corresponde.
   - **Causa**: la etiqueta de rol del encabezado está fija en el código (`dashboard.vue:326`, `<span class="user-role">Docente</span>`), y el correo de respaldo es `docente@vamosaprendiendo.edu` (línea 335).
   - **Además**: el contenido de la página está pensado para un docente (128 estudiantes activos, menú "Estudiantes" y "Diagnósticos", acción "Nuevo Diagnóstico", "Gestionar Estudiantes") y todo son datos de ejemplo. (2026-10-25: resuelto "Estudiantes", "Gestionar Estudiantes" y "Perfil destacado"; la actividad reciente sigue con nombres de ejemplo: Sofía, Mateo, Lucía, Daniel.)
   - **Por hacer**:
     - Mostrar el perfil real (`profile_type`: Tutor / Adulto / Tester) y el nombre del usuario.
     - Adaptar el contenido: el tutor ve a sus hijos y el progreso de cada uno; el adulto ve sus propias actividades de memoria y atención.
     - Conectarlo a datos reales (se relaciona con el pendiente #1).
9. **Dashboard de profesores**: ampliar con métricas de los estudiantes (evaluaciones iniciales y telemetría de juego) cuando el módulo de telemetría esté listo.
