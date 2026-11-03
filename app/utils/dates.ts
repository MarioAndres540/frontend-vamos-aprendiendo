const DAY_MS = 24 * 60 * 60 * 1000
const BOGOTA = 'America/Bogota'

// Día calendario en hora de Colombia (YYYY-MM-DD), para comparar fechas sin el desfase de la zona horaria
const bogotaDay = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: BOGOTA })

/** "Hoy", "Ayer", "Hace 3 días" o la fecha corta, en hora de Colombia. null → "Sin actividad" */
export const relativeDay = (iso: string | null | undefined) => {
  if (!iso) return 'Sin actividad'
  const date = new Date(iso)
  const days = Math.round(
    (new Date(bogotaDay(new Date())).getTime() - new Date(bogotaDay(date)).getTime()) / DAY_MS,
  )
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: BOGOTA })
}

/** "14 de marzo de 2018" a partir de una fecha YYYY-MM-DD (sin desfase de zona horaria) */
export const longDate = (isoDate: string | null | undefined) => {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
