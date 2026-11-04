/**
 * Protección de datos personales (Ley 1581 de 2012, spec 0004).
 * PRIVACY_POLICY_VERSION debe ser igual a la del backend (src/modules/privacy/privacy.constants.ts):
 * si cambia el texto de /data-policy, se sube la versión en los dos lados.
 */
export const PRIVACY_POLICY_VERSION = '2026-11-04'

export type DataRequestType =
  | 'consulta'
  | 'actualizacion'
  | 'rectificacion'
  | 'supresion'
  | 'revocatoria'
  | 'prueba_autorizacion'

export type DataRequestStatus = 'radicada' | 'en_tramite' | 'resuelta' | 'rechazada'

export const DATA_REQUEST_TYPES: { value: DataRequestType; label: string; help: string }[] = [
  { value: 'consulta', label: 'Consulta', help: 'Saber qué datos tenemos y cómo los usamos. Respuesta en máximo 10 días hábiles.' },
  { value: 'actualizacion', label: 'Actualización', help: 'Actualizar datos que cambiaron. Respuesta en máximo 15 días hábiles.' },
  { value: 'rectificacion', label: 'Rectificación', help: 'Corregir datos inexactos o incompletos. Respuesta en máximo 15 días hábiles.' },
  { value: 'prueba_autorizacion', label: 'Prueba de la autorización', help: 'Recibir copia de la autorización que nos diste. Respuesta en máximo 15 días hábiles.' },
  { value: 'revocatoria', label: 'Revocar la autorización', help: 'Retirar tu autorización. Implica suprimir los datos de tu espacio. Respuesta en máximo 15 días hábiles.' },
  { value: 'supresion', label: 'Supresión de datos', help: 'Borrar tus datos o los de un menor de tu espacio. Respuesta en máximo 15 días hábiles.' },
]

export const DATA_REQUEST_TYPE_LABELS = Object.fromEntries(
  DATA_REQUEST_TYPES.map((t) => [t.value, t.label]),
) as Record<DataRequestType, string>

export const DATA_REQUEST_STATUS_LABELS: Record<DataRequestStatus, string> = {
  radicada: 'Radicada',
  en_tramite: 'En trámite',
  resuelta: 'Resuelta',
  rechazada: 'Rechazada',
}

/** Código del backend cuando falta la autorización de datos sensibles (evaluación inicial) */
export const SENSITIVE_CONSENT_REQUIRED = 'SENSITIVE_CONSENT_REQUIRED'
