/**
 * De quién son los datos que muestran Actividades, Analíticas y Biblioteca:
 * - tutor: el hijo elegido en el menú de la cuenta (y su último formulario inicial)
 * - adulto / tester: el propio usuario (y su último formulario)
 */
export const usePanelSubject = () => {
  const { profileType, firstName, user } = useAuth()
  const isTutor = computed(() => profileType.value === 'tutor')

  const {
    students,
    selected,
    selectingId,
    loaded: studentsLoaded,
    error: studentsError,
    fetchStudents,
  } = useMyStudents()
  const { assessment: ownAssessment, loaded: ownLoaded, error: ownError, fetchLatest } = useMyLatestAssessment()

  // force: trae la información actualizada al entrar (ej. después de llenar un formulario)
  const load = () => (isTutor.value ? fetchStudents(true) : fetchLatest())

  // Hasta la primera respuesta no se sabe si el tutor tiene hijos o si hay formulario
  const ready = computed(() =>
    isTutor.value ? (studentsLoaded.value || !!studentsError.value) && selectingId.value === null : ownLoaded.value,
  )
  const error = computed(() => (isTutor.value ? studentsError.value : ownError.value))
  const hasNoStudents = computed(() => isTutor.value && studentsLoaded.value && students.value.length === 0)

  // studentId para las consultas: undefined = datos propios del usuario
  const studentId = computed(() => (isTutor.value ? selected.value?.id : undefined))

  const assessment = computed(() =>
    isTutor.value ? (selected.value?.latestAssessment ?? null) : ownAssessment.value,
  )

  const ownName = computed(() => titleCase(firstName.value || user.value?.firstName || ''))

  const subject = computed(() => {
    if (isTutor.value) {
      const s = selected.value
      if (!s) return null
      return {
        name: titleCase(`${s.firstName} ${s.lastName}`),
        firstName: titleCase(s.firstName),
        details: [s.grade, s.age != null ? `${s.age} años` : null].filter(Boolean).join(' · '),
      }
    }
    return { name: ownName.value || 'Tu cuenta', firstName: ownName.value || 'ti', details: '' }
  })

  return { isTutor, ready, error, hasNoStudents, studentId, assessment, subject, load }
}
