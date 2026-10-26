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

const MAX_CHIPS = 2

/**
 * Fortalezas (puntaje promedio ≤ 2) y áreas a mejorar (≥ 3) según las respuestas del formulario.
 * Una dimensión con varias preguntas (ej. discalculia) se promedia. En empates, la condición principal
 * calculada por el backend va primero, para que el resumen coincida con el nivel de alerta.
 */
export const summarizeAreas = (answers: AssessmentAnswer[], primaryCondition?: string | null) => {
  const byDimension = new Map<string, number[]>()
  for (const answer of answers) {
    if (!byDimension.has(answer.dimension)) byDimension.set(answer.dimension, [])
    byDimension.get(answer.dimension)!.push(answer.score)
  }

  const areas: AssessmentArea[] = [...byDimension].map(([dimension, scores]) => ({
    dimension,
    label: areaLabel(dimension),
    icon: AREAS[dimension]?.icon ?? logicaImg,
    score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
  }))

  const primaryFirst = (a: AssessmentArea, b: AssessmentArea) =>
    Number(b.dimension === primaryCondition) - Number(a.dimension === primaryCondition)

  const strengths = areas
    .filter((a) => a.score <= 2)
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_CHIPS)

  const toImprove = areas
    .filter((a) => a.score >= 3)
    .sort((a, b) => b.score - a.score || primaryFirst(a, b))
    .slice(0, MAX_CHIPS)

  return { strengths, toImprove }
}
