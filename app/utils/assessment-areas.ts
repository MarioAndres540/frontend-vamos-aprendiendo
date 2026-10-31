import letrasImg from '~/assets/img/letras.png'
import numeroImg from '~/assets/img/numero.png'
import logicaImg from '~/assets/img/logica.png'
import atencionImg from '~/assets/img/atencion.png'
import memoriaImg from '~/assets/img/memoria.png'
import creatividadImg from '~/assets/img/creatividad.png'

export type RiskLevel = 'bajo' | 'moderado' | 'alto'

export interface AssessmentAnswer {
  questionId: number
  dimension: string
  // 1 (nunca) a 5 (siempre): un puntaje alto indica más dificultad en la dimensión
  score: number
}

export interface AssessmentArea {
  dimension: string
  label: string
  icon: string
  score: number
}

// Nombre para el usuario de cada dimensión del formulario inicial (banco de preguntas de useAssessment)
const AREAS: Record<string, { label: string; icon: string }> = {
  // Niños
  dislexia: { label: 'Reconocer letras', icon: letrasImg },
  lectoescritura: { label: 'Lectura', icon: letrasImg },
  discalculia: { label: 'Matemáticas', icon: numeroImg },
  tdah_atencion: { label: 'Atención', icon: atencionImg },
  tdah_impulsividad: { label: 'Autocontrol', icon: logicaImg },
  memoria_operativa: { label: 'Memoria', icon: memoriaImg },
  grafomotricidad: { label: 'Trazo y escritura', icon: creatividadImg },
  // Adultos
  memoria_reciente: { label: 'Memoria reciente', icon: memoriaImg },
  autonomia_cotidiana: { label: 'Rutinas diarias', icon: logicaImg },
  fluidez_verbal: { label: 'Fluidez verbal', icon: letrasImg },
  orientacion_espacial: { label: 'Orientación', icon: logicaImg },
  planificacion_ejecutiva: { label: 'Planificación', icon: logicaImg },
  atencion_sostenida: { label: 'Concentración', icon: atencionImg },
  gimnasia_mental: { label: 'Estimulación mental', icon: creatividadImg },
}

export const areaLabel = (dimension?: string | null) =>
  (dimension && AREAS[dimension]?.label) || 'General'

export const RISK_LABELS: Record<RiskLevel, string> = {
  bajo: 'Sin alertas',
  moderado: 'Alerta moderada',
  alto: 'Alerta alta',
}

// Escala Likert del formulario (initial-assessment.vue)
const ANSWER_LABELS = ['', 'Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre']

/** Respuesta en palabras; un promedio de área se redondea (2.5 → "A veces") */
export const answerLabel = (score: number) => ANSWER_LABELS[Math.min(5, Math.max(1, Math.round(score)))]

/**
 * Lectura del puntaje de un área: fortaleza (nunca o rara vez), a observar (a veces)
 * o a reforzar (frecuentemente o siempre)
 */
export type AreaTone = 'strength' | 'watch' | 'reinforce'
export const areaTone = (score: number): AreaTone => (score <= 2 ? 'strength' : score < 4 ? 'watch' : 'reinforce')

/**
 * Límites del nivel de alerta, iguales a los de AssessmentsService.submitAssessment en el backend:
 * hasta `low` es bajo, hasta `moderate` es moderado y más arriba es alto
 */
export const riskThresholds = (targetType: 'nino' | 'adulto') =>
  targetType === 'nino' ? { low: 15, moderate: 25 } : { low: 12, moderate: 22 }

export interface ScoredArea extends AssessmentArea {
  questionIds: number[]
  tone: AreaTone
}

/**
 * Todas las áreas del formulario con su puntaje promedio (una dimensión con varias preguntas, como
 * discalculia, se promedia), de mayor a menor. En empates va primero la condición principal calculada
 * por el backend y luego el orden de las preguntas.
 */
export const scoreAreas = (answers: AssessmentAnswer[], primaryCondition?: string | null): ScoredArea[] => {
  const byDimension = new Map<string, { scores: number[]; questionIds: number[] }>()
  for (const answer of answers) {
    if (!byDimension.has(answer.dimension)) byDimension.set(answer.dimension, { scores: [], questionIds: [] })
    const entry = byDimension.get(answer.dimension)!
    entry.scores.push(answer.score)
    entry.questionIds.push(answer.questionId)
  }

  const areas = [...byDimension].map(([dimension, { scores, questionIds }]) => {
    const score = scores.reduce((sum, s) => sum + s, 0) / scores.length
    return {
      dimension,
      label: areaLabel(dimension),
      icon: AREAS[dimension]?.icon ?? logicaImg,
      score,
      questionIds: [...questionIds].sort((a, b) => a - b),
      tone: areaTone(score),
    }
  })

  const primaryFirst = (a: ScoredArea, b: ScoredArea) =>
    Number(b.dimension === primaryCondition) - Number(a.dimension === primaryCondition)

  return areas.sort(
    (a, b) => b.score - a.score || primaryFirst(a, b) || a.questionIds[0]! - b.questionIds[0]!,
  )
}

const MAX_CHIPS = 2

/**
 * Fortalezas (puntaje promedio ≤ 2) y áreas a mejorar (≥ 3) según las respuestas del formulario.
 */
export const summarizeAreas = (answers: AssessmentAnswer[], primaryCondition?: string | null) => {
  const areas = scoreAreas(answers, primaryCondition)

  const strengths = areas
    .filter((a) => a.score <= 2)
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_CHIPS)

  const toImprove = areas.filter((a) => a.score >= 3).slice(0, MAX_CHIPS)

  return { strengths, toImprove }
}

/**
 * Categoría cognitiva del juego (tabla categorias_cognitivas) que trabaja cada dimensión del formulario.
 * Sirve para recomendar actividades y guías a partir del diagnóstico.
 */
const CATEGORY_FOR_DIMENSION: Record<string, string> = {
  // Niños
  dislexia: 'lectoescritura',
  lectoescritura: 'lectoescritura',
  discalculia: 'logica_matematica',
  tdah_atencion: 'atencion',
  tdah_impulsividad: 'control_impulsos',
  memoria_operativa: 'memoria',
  grafomotricidad: 'motricidad_fina',
  // Adultos
  memoria_reciente: 'memoria',
  autonomia_cotidiana: 'concentracion',
  fluidez_verbal: 'lectoescritura',
  orientacion_espacial: 'atencion',
  planificacion_ejecutiva: 'concentracion',
  atencion_sostenida: 'atencion',
  gimnasia_mental: 'memoria',
}

export const categoryForDimension = (dimension: string) => CATEGORY_FOR_DIMENSION[dimension] ?? null

export interface CategoryRecommendation {
  categoryId: string
  // Área del formulario que la origina y lo que se respondió
  area: AssessmentArea & { tone: AreaTone }
}

/** Categorías del juego recomendadas a partir de las áreas a reforzar del formulario (sin repetir) */
export const recommendedCategories = (
  answers: AssessmentAnswer[],
  primaryCondition?: string | null,
): CategoryRecommendation[] => {
  const seen = new Set<string>()
  const result: CategoryRecommendation[] = []
  for (const area of scoreAreas(answers, primaryCondition).filter((a) => a.score >= 3)) {
    const categoryId = categoryForDimension(area.dimension)
    if (!categoryId || seen.has(categoryId)) continue
    seen.add(categoryId)
    result.push({ categoryId, area })
  }
  return result.slice(0, MAX_CHIPS)
}

/** "… Ruta recomendada: Refuerzo guiado y ejercicios adaptativos." → título de la ruta */
export const recommendedRouteOf = (recommendations?: string | null) =>
  recommendations?.match(/Ruta recomendada:\s*(.+?)\.?$/i)?.[1] ?? null

// Qué registra la app de Unity en cada categoría (tablas de telemetría)
export const CATEGORY_TRACKING: Record<string, string> = {
  atencion: 'aciertos, errores y pausas largas durante el juego.',
  concentracion: 'pausas e inactividad dentro de cada nivel.',
  control_impulsos: 'toques rápidos y respuestas antes de tiempo.',
  motricidad_fina: 'dirección, rotación y precisión de cada trazo.',
  logica_matematica: 'cada operación resuelta, el resultado dado y el tiempo.',
  lectoescritura: 'letras, palabras y frases: precisión y tiempo.',
  memoria: 'secuencias recordadas, aciertos y errores.',
}

/** "A", "A y B", "A, B y C" */
export const joinList = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`

/**
 * Hallazgos en lenguaje sencillo para la pestaña Diagnósticos (a partir de scoreAreas)
 */
export const describeFindings = (areas: ScoredArea[], primaryCondition?: string | null): string[] => {
  const findings: string[] = []
  const top = areas[0]

  if (!top || top.score < 3) {
    findings.push('No se observan dificultades frecuentes en ninguna área: las respuestas fueron "nunca" o "rara vez".')
    return findings
  }

  findings.push(`${top.label} es lo que más se observa: la respuesta fue "${answerLabel(top.score).toLowerCase()}".`)

  // El backend elige la condición principal por puntaje SUMADO: un área con más preguntas puede quedar
  // como enfoque aunque otra tenga una respuesta más alta. Se explica para que no parezca una contradicción.
  const primary = areas.find((a) => a.dimension === primaryCondition)
  if (primary && primary !== top && primary.questionIds.length > 1) {
    findings.push(
      `${primary.label} es el área de enfoque porque reúne ${primary.questionIds.length} preguntas y suma más puntos en total.`,
    )
  }

  const watch = areas.filter((a) => a.tone === 'watch' && a !== top && a !== primary).map((a) => a.label)
  if (watch.length) {
    findings.push(
      watch.length === 1
        ? `${watch[0]} aparece "a veces": conviene observarla.`
        : `${joinList(watch)} aparecen "a veces": conviene observarlas.`,
    )
  }

  return findings
}
