/** "86 h 12 min", "42 min" o "30 s" a partir de segundos */
export const formatDuration = (totalSeconds: number) => {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`
  if (minutes > 0) return `${minutes} min`
  return `${seconds} s`
}
