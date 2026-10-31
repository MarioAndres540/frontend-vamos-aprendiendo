// Contenido de la Biblioteca (pestaña /library).
// PROVISIONAL: textos de apoyo general para el tutor, pendientes de revisión por el equipo pedagógico.
// No hay tabla en el backend; si el contenido crece o lo edita el administrador, conviene moverlo a la base.

export type GuideType = 'Guía' | 'Actividad para casa'

export interface Guide {
  id: string
  title: string
  summary: string
  type: GuideType
  // Categoría cognitiva (categorias_cognitivas) o 'diagnostico' para las guías sobre el formulario
  category: string
  intro: string
  tips: string[]
}

export const CATEGORY_NAMES: Record<string, string> = {
  atencion: 'Atención Sostenida',
  logica_matematica: 'Sentido Numérico y Operaciones',
  lectoescritura: 'Lectoescritura y Fluidez Verbal',
  memoria: 'Memoria de Trabajo y Evocación',
  motricidad_fina: 'Coordinación Visomotriz y Trazado',
  control_impulsos: 'Control de Impulsividad',
  concentracion: 'Concentración y Enfoque',
  diagnostico: 'Diagnóstico',
}

// Nombre corto para filtros y portadas
export const CATEGORY_SHORT_NAMES: Record<string, string> = {
  atencion: 'Atención',
  logica_matematica: 'Matemáticas',
  lectoescritura: 'Lectura y escritura',
  memoria: 'Memoria',
  motricidad_fina: 'Motricidad',
  control_impulsos: 'Autocontrol',
  concentracion: 'Concentración',
  diagnostico: 'Diagnóstico',
}

export const GUIDES: Guide[] = [
  {
    id: 'atencion-en-casa',
    title: 'Cómo ayudar a mantener la atención en casa',
    summary: 'Rutinas cortas, un lugar sin distracciones y pausas planeadas para tareas y juegos.',
    type: 'Guía',
    category: 'atencion',
    intro:
      'Mantener la atención es una habilidad que se entrena. Pequeños cambios en el entorno y en la forma de dar las tareas ayudan a que el niño se concentre por más tiempo.',
    tips: [
      'Prepara un lugar fijo para las tareas, sin televisión ni celulares a la vista.',
      'Divide la tarea en partes cortas (10 a 15 minutos) con una pausa breve entre cada una.',
      'Da una instrucción a la vez y pide que te la repita con sus palabras.',
      'Usa un reloj o temporizador visible para que sepa cuánto falta.',
      'Celebra cuando termina una parte, no solo cuando termina todo.',
    ],
  },
  {
    id: 'numeros-vida-diaria',
    title: 'Juegos con números en la vida diaria',
    summary: 'Contar objetos, repartir y seguir secuencias usando cosas de la casa.',
    type: 'Actividad para casa',
    category: 'logica_matematica',
    intro:
      'Los números se entienden mejor cuando se tocan y se usan. Las situaciones de cada día son una buena oportunidad para practicar sin que parezca una tarea.',
    tips: [
      'Cuenten juntos objetos reales: cucharas al poner la mesa, escalones, frutas en la compra.',
      'Repartan cosas en partes iguales (galletas, fichas) y pregunten cuántas le tocan a cada uno.',
      'Jueguen a continuar secuencias: 2, 4, 6… o rojo, azul, rojo…',
      'Relacionen cantidades con el número escrito: pongan 5 tapas junto a una tarjeta con el 5.',
      'En la tienda, pregunten cuánto falta para completar una cantidad.',
    ],
  },
  {
    id: 'lectura-en-voz-alta',
    title: 'Leer en voz alta sin presión',
    summary: 'Ideas para practicar letras, palabras y lectura con textos cortos y del interés del niño.',
    type: 'Guía',
    category: 'lectoescritura',
    intro:
      'Leer con alguien que acompaña y no corrige todo el tiempo ayuda a ganar confianza. La meta es disfrutar el texto, no leer rápido.',
    tips: [
      'Elijan textos cortos sobre temas que le gusten.',
      'Lean por turnos: una frase tú y una frase él o ella.',
      'Si confunde letras parecidas (b y d, p y q), repasen esas letras con juegos de dibujo o plastilina.',
      'Señalen con el dedo la palabra que se está leyendo.',
      'Conversen sobre lo leído: qué pasó, qué le gustó, qué cree que pasará después.',
    ],
  },
  {
    id: 'memoria-instrucciones',
    title: 'Instrucciones por pasos y juegos de memoria',
    summary: 'Cómo dar indicaciones que se puedan recordar y juegos para ejercitar la memoria.',
    type: 'Actividad para casa',
    category: 'memoria',
    intro:
      'Recordar varias indicaciones a la vez es difícil para muchos niños. Se puede practicar empezando con pocas instrucciones y aumentando poco a poco.',
    tips: [
      'Da una o dos indicaciones a la vez y aumenta a tres cuando las cumpla sin ayuda.',
      'Apoya las instrucciones con imágenes o una lista corta.',
      'Jueguen a "voy al mercado y compro…", agregando un objeto en cada turno.',
      'Usen juegos de parejas (memoria con cartas) con pocas cartas al inicio.',
      'Pide que te cuente lo que hizo en el día en orden: primero, después, al final.',
    ],
  },
  {
    id: 'trazo-y-agarre',
    title: 'Agarre del lápiz y trazo de letras y números',
    summary: 'Actividades para fortalecer la mano y practicar la dirección de los trazos.',
    type: 'Actividad para casa',
    category: 'motricidad_fina',
    intro:
      'Escribir requiere fuerza y control en los dedos. Antes del lápiz, muchas actividades de la casa ayudan a preparar la mano.',
    tips: [
      'Jueguen con plastilina, pinzas de ropa o rasgando papel para fortalecer los dedos.',
      'Practiquen trazos grandes en el aire o en arena antes de hacerlos en el cuaderno.',
      'Usen lápices gruesos o con adaptador si el agarre le cansa.',
      'Muestren la dirección del trazo con flechas: de arriba hacia abajo y de izquierda a derecha.',
      'Hagan pausas cuando note cansancio o frustración.',
    ],
  },
  {
    id: 'esperar-turnos',
    title: 'Esperar turnos y pensar antes de responder',
    summary: 'Juegos y rutinas para practicar el autocontrol de forma positiva.',
    type: 'Guía',
    category: 'control_impulsos',
    intro:
      'Esperar y pensar antes de actuar se aprende con práctica y con reglas claras. Los juegos de mesa son un buen lugar para empezar.',
    tips: [
      'Jueguen juegos por turnos y nombren en voz alta de quién es el turno.',
      'Usen la regla "parar, pensar y responder" antes de contestar una pregunta.',
      'Anticipa los cambios: "en cinco minutos guardamos los juguetes".',
      'Reconoce cuando logra esperar: "esperaste tu turno, muy bien".',
    ],
  },
  {
    id: 'terminar-una-tarea',
    title: 'Terminar una tarea antes de pasar a otra',
    summary: 'Cómo organizar el tiempo y el espacio para que las actividades se completen.',
    type: 'Guía',
    category: 'concentracion',
    intro:
      'Cambiar de actividad sin terminar es común cuando algo cuesta. Una rutina clara y metas pequeñas ayudan a llegar al final.',
    tips: [
      'Acuerden qué tarea se hace primero y qué viene después.',
      'Tengan a mano todo lo necesario antes de empezar.',
      'Marquen en una lista lo que se va terminando.',
      'Si se bloquea, propón una pausa corta y volver a la misma tarea.',
    ],
  },
  {
    id: 'leer-el-resultado',
    title: 'Cómo leer el resultado del formulario inicial',
    summary: 'Qué significan los niveles de alerta bajo, moderado y alto, y qué hacer después.',
    type: 'Guía',
    category: 'diagnostico',
    intro:
      'El formulario inicial resume lo que el tutor observa en el día a día. Es una orientación para elegir actividades, no un diagnóstico clínico.',
    tips: [
      'Alerta baja: se observan pocas dificultades. Las actividades de la app mantienen el buen desempeño.',
      'Alerta moderada: algunas áreas aparecen "a veces" o "frecuentemente". Conviene practicar esas áreas con más frecuencia.',
      'Alerta alta: varias dificultades se observan con frecuencia. Además de practicar, es buena idea consultar con un profesional.',
      'Revisa en Diagnósticos las áreas a reforzar y en Actividades las recomendadas.',
      'Repite el formulario más adelante para comparar la evolución.',
    ],
  },
]

// Funciones de la plataforma que ya existen (enlaces reales)
export const HOW_TO = [
  { title: 'Ver si la app de Unity está en uso', where: 'Inicio · Conexión a la app', to: '/dashboard' },
  { title: 'Entender el resultado del formulario', where: 'Diagnósticos', to: '/diagnostics' },
  { title: 'Agregar un hijo o menor y hacer su formulario', where: 'Configuración · Hijos o menores a cargo', to: '/settings' },
  { title: 'Ver cuánto se usa la app', where: 'Analíticas', to: '/analytics' },
  { title: 'Cambiar tu correo o teléfono', where: 'Configuración · Mis datos', to: '/settings' },
]

export const findGuide = (id: string) => GUIDES.find((guide) => guide.id === id) ?? null
