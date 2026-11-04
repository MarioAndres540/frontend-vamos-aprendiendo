<script setup lang="ts">
// Política de tratamiento de datos personales (Ley 1581 de 2012, Decreto 1377 de 2013 art. 13; spec 0004 PD-POL).
// Página pública: se enlaza desde el registro, el login y "Privacidad y mis datos".
// Si cambia el texto, subir PRIVACY_POLICY_VERSION aquí (app/utils/privacy.ts) y en el backend.
useHead({ title: 'Política de tratamiento de datos · Vamos Aprendiendo' })

const { dataController } = useRuntimeConfig().public
const controller = dataController as Record<'name' | 'id' | 'address' | 'city' | 'email' | 'phone', string>
const missingController = computed(() => !controller.name || !controller.email)

const policyVersion = PRIVACY_POLICY_VERSION
const versionDate = new Date(`${policyVersion}T12:00:00`).toLocaleDateString('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const sections = [
  { id: 'responsable', title: '1. Responsable del tratamiento' },
  { id: 'datos', title: '2. Datos que tratamos' },
  { id: 'finalidades', title: '3. Para qué los usamos' },
  { id: 'menores', title: '4. Datos de niños, niñas y adolescentes' },
  { id: 'sensibles', title: '5. Datos sensibles' },
  { id: 'espacios', title: '6. Espacios individuales por licencia' },
  { id: 'derechos', title: '7. Tus derechos' },
  { id: 'procedimiento', title: '8. Cómo ejercer tus derechos' },
  { id: 'encargados', title: '9. Proveedores y transferencia internacional' },
  { id: 'seguridad', title: '10. Seguridad' },
  { id: 'cookies', title: '11. Cookies' },
  { id: 'conservacion', title: '12. Conservación y supresión' },
  { id: 'vigencia', title: '13. Vigencia y cambios' },
]
</script>

<template>
  <main class="policy-page">
    <header class="policy-header">
      <NuxtLink to="/" class="back-link"><i class="pi pi-arrow-left"></i> Volver al inicio</NuxtLink>
      <h1>Política de tratamiento de datos personales</h1>
      <p class="meta">Versión {{ policyVersion }} · vigente desde el {{ versionDate }}</p>
      <p class="lead">
        En Vamos Aprendiendo tratamos tus datos y los de los menores a tu cargo conforme a la Ley 1581 de 2012,
        el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y demás normas de protección de datos
        personales en Colombia.
      </p>
    </header>

    <nav class="toc" aria-label="Contenido de la política">
      <a v-for="s in sections" :key="s.id" :href="`#${s.id}`">{{ s.title }}</a>
    </nav>

    <section id="responsable" class="policy-section">
      <h2>1. Responsable del tratamiento</h2>
      <p v-if="missingController" class="warning" role="note">
        Los datos del responsable aún no están configurados en esta instalación.
      </p>
      <dl class="controller">
        <div><dt>Responsable</dt><dd>{{ controller.name || 'Por definir' }}</dd></div>
        <div v-if="controller.id"><dt>Identificación</dt><dd>{{ controller.id }}</dd></div>
        <div v-if="controller.address"><dt>Dirección</dt><dd>{{ controller.address }}<template v-if="controller.city">, {{ controller.city }}</template></dd></div>
        <div><dt>Correo para solicitudes</dt><dd>{{ controller.email || 'Por definir' }}</dd></div>
        <div v-if="controller.phone"><dt>Teléfono</dt><dd>{{ controller.phone }}</dd></div>
      </dl>
      <p>
        El área encargada de atender consultas y reclamos es la administración de la plataforma, a través de
        la sección <strong>Privacidad y mis datos</strong> de tu cuenta o del correo indicado.
      </p>
    </section>

    <section id="datos" class="policy-section">
      <h2>2. Datos que tratamos</h2>
      <ul>
        <li><strong>De la persona adulta (tutor, adulto o docente):</strong> nombres, apellidos, tipo y número de documento, edad, teléfono, correo electrónico y credenciales de acceso.</li>
        <li><strong>De los menores a cargo:</strong> nombres, apellidos, tipo y número de documento, fecha de nacimiento, grado y colegio.</li>
        <li><strong>De uso de la plataforma:</strong> ejercicios realizados y aprobados, puntajes, puntos de experiencia, tiempos de juego, sesiones y tipo de dispositivo.</li>
        <li><strong>Datos sensibles (facultativos):</strong> respuestas de la evaluación inicial sobre atención, memoria, control de impulsos, orientación y desarrollo de la lectura, la escritura y el cálculo.</li>
        <li><strong>Prueba de tu autorización:</strong> fecha, versión de esta política, dirección IP y navegador desde los que la otorgaste.</li>
      </ul>
    </section>

    <section id="finalidades" class="policy-section">
      <h2>3. Para qué los usamos</h2>
      <ul>
        <li>Crear y administrar tu cuenta, tu licencia y el periodo de prueba.</li>
        <li>Prestar el servicio educativo: actividades, rutas de aprendizaje y seguimiento del progreso.</li>
        <li>Recomendar una ruta de aprendizaje a partir de la evaluación inicial, si decides responderla.</li>
        <li>Permitir que el colegio y los docentes asignados hagan seguimiento del progreso <strong>escolar</strong> de sus estudiantes.</li>
        <li>Atender tus consultas, reclamos y solicitudes de soporte.</li>
        <li>Proteger la seguridad de la plataforma y registrar los accesos a datos de estudiantes.</li>
        <li>Elaborar estadísticas anonimizadas para mejorar el contenido, sin identificar a nadie.</li>
      </ul>
      <p>No vendemos tus datos ni los usamos para publicidad de terceros.</p>
    </section>

    <section id="menores" class="policy-section">
      <h2>4. Datos de niños, niñas y adolescentes</h2>
      <p>
        Tratamos los datos de menores de edad respetando su interés superior y sus derechos fundamentales
        (artículo 7 de la Ley 1581 y artículo 12 del Decreto 1377). Solo los registra su representante legal o
        tutor, quien otorga la autorización de forma expresa. Cuando sea posible según su madurez, el menor
        debe ser escuchado sobre el uso de la plataforma.
      </p>
    </section>

    <section id="sensibles" class="policy-section">
      <h2>5. Datos sensibles</h2>
      <p>
        Las respuestas de la evaluación inicial se consideran datos sensibles relativos a la salud.
        <strong>Responderla es facultativo:</strong> puedes omitirla y usar la plataforma igual. Solo se guardan
        si das tu autorización expresa, que puedes revocar en cualquier momento desde
        <strong>Privacidad y mis datos</strong>; al revocarla borramos esas respuestas.
        La evaluación orienta la ruta de aprendizaje y <strong>no constituye un diagnóstico médico ni
        psicológico</strong>.
      </p>
    </section>

    <section id="espacios" class="policy-section">
      <h2>6. Espacios individuales por licencia</h2>
      <p>
        Cada licencia es un espacio independiente. Si un menor tiene varios tutores (por ejemplo, su padre y su
        madre, cada uno con su propia licencia), el progreso que el menor tiene con cada tutor es independiente:
        un tutor no ve ni recibe la información del espacio del otro. El progreso del menor en su colegio es otro
        espacio, al que acceden el colegio y los docentes asignados.
      </p>
    </section>

    <section id="derechos" class="policy-section">
      <h2>7. Tus derechos</h2>
      <p>Como titular, o como representante legal de un menor, tienes derecho a (artículo 8 de la Ley 1581):</p>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos.</li>
        <li>Solicitar prueba de la autorización que nos diste.</li>
        <li>Ser informado sobre el uso que hemos dado a tus datos.</li>
        <li>Revocar la autorización y solicitar la supresión de tus datos, cuando no exista un deber legal o contractual de conservarlos.</li>
        <li>Acceder gratuitamente a tus datos. Puedes descargarlos desde <strong>Privacidad y mis datos</strong>.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio, una vez agotado el trámite de consulta o reclamo con nosotros.</li>
      </ul>
    </section>

    <section id="procedimiento" class="policy-section">
      <h2>8. Cómo ejercer tus derechos</h2>
      <p>
        Radica tu solicitud en <strong>Privacidad y mis datos</strong> (dentro de tu cuenta) o escríbenos al correo
        del responsable indicando tu nombre, documento, la solicitud y los datos de contacto para la respuesta.
      </p>
      <ul>
        <li><strong>Consultas:</strong> respondemos en máximo 10 días hábiles. Si no es posible, te informamos el motivo y respondemos en máximo 5 días hábiles más (artículo 14).</li>
        <li><strong>Reclamos</strong> (actualización, rectificación, supresión o revocatoria): respondemos en máximo 15 días hábiles, prorrogables hasta 8 días hábiles más informándote el motivo (artículo 15). Si el reclamo está incompleto, te pediremos completarlo dentro de los 5 días siguientes; si pasan 2 meses sin que lo completes, se entenderá que desististe.</li>
      </ul>
    </section>

    <section id="encargados" class="policy-section">
      <h2>9. Proveedores y transferencia internacional</h2>
      <p>
        Para operar la plataforma usamos proveedores de infraestructura que actúan como encargados del tratamiento:
        base de datos y autenticación (Supabase), servidor de la aplicación (Render) y publicación del sitio web
        (Vercel). Sus servidores pueden estar fuera de Colombia, por ejemplo en Estados Unidos. Solo tratan los datos
        para prestarnos el servicio, bajo condiciones de seguridad y confidencialidad. Al autorizar el tratamiento
        aceptas esta transmisión internacional de datos.
      </p>
    </section>

    <section id="seguridad" class="policy-section">
      <h2>10. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y administrativas razonables: conexión cifrada (HTTPS), contraseñas gestionadas
        por el proveedor de autenticación, acceso por roles, sesiones con vencimiento, límites de intentos de
        inicio de sesión y registro de los accesos de los docentes a los datos de sus estudiantes.
      </p>
    </section>

    <section id="cookies" class="policy-section">
      <h2>11. Cookies</h2>
      <p>
        Usamos únicamente cookies necesarias para mantener tu sesión iniciada y recordar tu tipo de perfil.
        No usamos cookies de analítica ni de publicidad.
      </p>
    </section>

    <section id="conservacion" class="policy-section">
      <h2>12. Conservación y supresión</h2>
      <p>
        Conservamos los datos mientras tu cuenta esté activa y sean necesarios para las finalidades descritas.
        Cuando se suprimen, borramos los datos de tu espacio y anonimizamos tu cuenta. Los registros de licencias
        se conservan por las obligaciones contables y tributarias, sin datos que te identifiquen. Los datos de un
        menor que también esté registrado con otro tutor o con su colegio se conservan en esos espacios, que
        responden por ellos.
      </p>
    </section>

    <section id="vigencia" class="policy-section">
      <h2>13. Vigencia y cambios</h2>
      <p>
        Esta política rige desde el {{ versionDate }} (versión {{ policyVersion }}). Si hacemos cambios
        sustanciales, te avisaremos y te pediremos una nueva autorización antes de aplicarlos.
      </p>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.policy-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  color: #334155;
  line-height: 1.65;
  background: #ffffff;
  min-height: 100vh;

  @media (max-width: 640px) {
    padding: 1.5rem 1rem 3rem;
  }
}

.policy-header {
  h1 {
    margin: 1rem 0 0.25rem;
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.02em;
  }

  .meta {
    margin: 0 0 1rem;
    font-size: 0.85rem;
    color: #64748b;
  }

  .lead {
    margin: 0;
    font-size: 1rem;
  }
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4f46e5;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.toc {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 6px 16px;
  margin: 1.75rem 0 0.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;

  a {
    font-size: 0.85rem;
    color: #4f46e5;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.policy-section {
  margin-top: 2rem;
  scroll-margin-top: 1rem;

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1e293b;
  }

  p {
    margin: 0 0 0.75rem;
  }

  ul {
    margin: 0 0 0.75rem;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.4rem;
  }
}

.controller {
  display: grid;
  gap: 4px;
  margin: 0 0 0.75rem;

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
  }

  dt {
    font-weight: 600;
    color: #1e293b;

    &::after {
      content: ':';
    }
  }

  dd {
    margin: 0;
  }
}

.warning {
  padding: 10px 14px;
  border-radius: 10px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  font-size: 0.9rem;
}
</style>
