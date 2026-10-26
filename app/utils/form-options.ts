// Opciones compartidas por el registro y la vista de Configuración

export const DOCUMENT_TYPES_ADULT = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'PASAPORTE', label: 'Pasaporte (PAS)' },
]

export const DOCUMENT_TYPES_KIDS = [
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'RC', label: 'Registro Civil (RC)' },
  { value: 'PASAPORTE', label: 'Pasaporte (PAS)' },
]

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  TI: 'Tarjeta de Identidad',
  RC: 'Registro Civil',
  PASAPORTE: 'Pasaporte',
}

export const documentTypeLabel = (value?: string | null) =>
  (value && DOCUMENT_TYPE_LABELS[value]) || value || '—'

export const SCHOOL_GRADES = [
  'Transición',
  '1° Primaria',
  '2° Primaria',
  '3° Primaria',
  '4° Primaria',
  '5° Primaria',
  '6° Bachillerato',
  '7° Bachillerato',
  '8° Bachillerato',
  '9° Bachillerato',
  '10° Bachillerato',
  '11° Bachillerato',
]

// Rango de edad que acepta el backend para un hijo o menor (CreateChildItemDto)
export const CHILD_MIN_AGE = 3
export const CHILD_MAX_AGE = 17

/** Edad cumplida a hoy a partir de una fecha YYYY-MM-DD */
export const ageFromBirthDate = (birthDate: string): number | null => {
  if (!birthDate) return null
  const [year, month, day] = birthDate.split('-').map(Number)
  if (!year || !month || !day) return null
  const today = new Date()
  let age = today.getFullYear() - year
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--
  return age
}
