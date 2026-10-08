export interface QuestionItem {
  id: number
  dimension: string
  title: string
  description: string
  icon?: string
}

export interface AssessmentAnswerItem {
  questionId: number
  dimension: string
  score: number // 1 to 5
}

export interface AssessmentResult {
  id: string
  totalScore: number
  maxScore: number
  riskLevel: 'bajo' | 'moderado' | 'alto'
  primaryCondition: string
  recommendations: string
  targetType: 'nino' | 'adulto'
  createdAt: string
}

export const useAssessment = () => {
  const { $api } = useNuxtApp()
  const { user } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastResult = useState<AssessmentResult | null>('last_assessment_result', () => null)

  // Banco de preguntas para Niños (≤ 10 preguntas)
  const kidsQuestions: QuestionItem[] = [
    {
      id: 1,
      dimension: 'dislexia',
      title: 'Identificación y orden de letras',
      description: '¿Confunde letras de grafía similar (como b/d, p/q) o invierte el orden al intentar leerlas?',
      icon: 'pi pi-book',
    },
    {
      id: 2,
      dimension: 'lectoescritura',
      title: 'Fluidez y ritmo de lectura',
      description: '¿Le requiere un esfuerzo inusualmente alto leer un párrafo sencillo en voz alta?',
      icon: 'pi pi-volume-up',
    },
    {
      id: 3,
      dimension: 'discalculia',
      title: 'Secuencias numéricas',
      description: '¿Presenta dificultad notable para recordar secuencias de números o tablas básicas?',
      icon: 'pi pi-calculator',
    },
    {
      id: 4,
      dimension: 'discalculia',
      title: 'Relación cantidad-símbolo',
      description: '¿Le cuesta asociar grupos de objetos con el número cardinal que los representa?',
      icon: 'pi pi-th-large',
    },
    {
      id: 5,
      dimension: 'tdah_atencion',
      title: 'Atención y concentración',
      description: '¿Se distrae con mucha facilidad ante ruidos o estímulos ambientales irrelevantes?',
      icon: 'pi pi-eye',
    },
    {
      id: 6,
      dimension: 'tdah_impulsividad',
      title: 'Control de impulsos y turnos',
      description: '¿Tiene dificultad para esperar su turno o actúa antes de escuchar la instrucción?',
      icon: 'pi pi-bolt',
    },
    {
      id: 7,
      dimension: 'memoria_operativa',
      title: 'Retención de instrucciones',
      description: '¿Olvida indicaciones consecutivas de 2 o 3 pasos casi inmediatamente después de recibirlas?',
      icon: 'pi pi-sync',
    },
    {
      id: 8,
      dimension: 'grafomotricidad',
      title: 'Coordinación y trazo',
      description: '¿Le genera molestia, cansancio o frustración el agarre del lápiz y el dibujo de trazos?',
      icon: 'pi pi-pencil',
    },
  ]

  // Banco de preguntas para Adultos (≤ 10 preguntas)
  const adultsQuestions: QuestionItem[] = [
    {
      id: 1,
      dimension: 'memoria_reciente',
      title: 'Memoria de eventos recientes',
      description: '¿Olvida conversaciones, citas o compromisos que ocurrieron hace pocos días?',
      icon: 'pi pi-calendar',
    },
    {
      id: 2,
      dimension: 'autonomia_cotidiana',
      title: 'Rutinas y tareas planificadas',
      description: '¿Olvida con frecuencia tomar medicamentos en su horario o pagar facturas a tiempo?',
      icon: 'pi pi-clock',
    },
    {
      id: 3,
      dimension: 'fluidez_verbal',
      title: 'Búsqueda de palabras al hablar',
      description: '¿Le ocurre seguido tener la sensación de "tener la palabra en la punta de la lengua"?',
      icon: 'pi pi-comments',
    },
    {
      id: 4,
      dimension: 'orientacion_espacial',
      title: 'Ubicación y orientación',
      description: '¿Ha sentido desorientación momentánea en trayectos conocidos o confusión de fechas?',
      icon: 'pi pi-compass',
    },
    {
      id: 5,
      dimension: 'planificacion_ejecutiva',
      title: 'Planificación de actividades complejas',
      description: '¿Le toma mayor esfuerzo que antes organizar una receta nueva o gestionar finanzas?',
      icon: 'pi pi-sitemap',
    },
    {
      id: 6,
      dimension: 'atencion_sostenida',
      title: 'Concentración y foco continuo',
      description: '¿Pierde el hilo de lo que lee o mira en programas de televisión con facilidad?',
      icon: 'pi pi-sliders-h',
    },
    {
      id: 7,
      dimension: 'gimnasia_mental',
      title: 'Motivación de estimulación',
      description: '¿Su interés principal es mantener su agilidad mental activa y prevenir el deterioro?',
      icon: 'pi pi-heart',
    },
  ]

  /**
   * Envía las respuestas del formulario al backend
   */
  const submitAssessment = async (
    targetType: 'nino' | 'adulto',
    answers: AssessmentAnswerItem[],
    studentId?: string,
    observations?: string
  ): Promise<AssessmentResult | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<AssessmentResult>('/assessments', {
        method: 'POST',
        body: {
          targetType,
          answers,
          studentId,
          observations,
        },
      })

      lastResult.value = response

      // Actualizar estado del usuario en auth
      if (user.value) {
        user.value = {
          ...user.value,
          hasCompletedSetup: true,
        }
      }

      // Marca el formulario como completado (mismas opciones que el resto de cookies de sesión)
      const hasChildProfile = useCookie<boolean>('has_child_profile', SESSION_COOKIE_OPTIONS)
      hasChildProfile.value = true

      return response
    } catch (err: any) {
      error.value = err.data?.message || 'Error al guardar la evaluación inicial'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    kidsQuestions,
    adultsQuestions,
    lastResult,
    loading,
    error,
    submitAssessment,
  }
}
