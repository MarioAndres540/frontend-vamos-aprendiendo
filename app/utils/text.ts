// Los nombres se guardan tal como se escribieron en el registro (ej. "matias villegas ceballos")
export const titleCase = (text?: string | null) =>
  (text ?? '')
    .trim()
    .toLocaleLowerCase('es-CO')
    .replace(/(^|\s)\p{L}/gu, (c) => c.toLocaleUpperCase('es-CO'))

/** Texto para búsquedas sin tildes ni mayúsculas: "Matías" → "matias" */
export const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('es-CO')

/** Iniciales para el avatar: "Matías Villegas" → "MV" */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
