// Derechos del titular y trámite de solicitudes (Ley 1581 de 2012, spec 0004). Tipos alineados con PrivacyService del backend
import type { DataRequestStatus, DataRequestType } from '~/utils/privacy'

export interface ConsentState {
  granted: boolean
  policyVersion: string
  grantedAt: string | null
}

export interface CurrentConsents {
  policyVersion: string
  dataProcessing: ConsentState | null
  sensitiveData: ConsentState | null
  minorsData: (ConsentState & { studentId: string })[]
}

export interface DataRequest {
  id: string
  request_type: DataRequestType
  student_id: string | null
  description: string
  status: DataRequestStatus
  due_at: string
  response: string | null
  created_at: string
  resolved_at: string | null
}

export interface AdminDataRequest extends DataRequest {
  profile_id: string
  overdue: boolean
  titular: { first_name: string; last_name: string; email: string; role: string } | null
}

export interface SuppressionResult {
  deletedStudents?: string[]
  unlinkedStudents?: string[]
  anonymized?: boolean
  authClosed: boolean
  response: string
}

const apiMessage = (err: any, fallback: string): string => {
  const message = err?.data?.message
  if (Array.isArray(message)) return message.join('. ')
  return message || fallback
}

export const usePrivacy = () => {
  const { $api } = useNuxtApp()

  const consents = ref<CurrentConsents | null>(null)
  const requests = ref<DataRequest[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchConsents = async () => {
    try {
      consents.value = await $api<CurrentConsents>('/privacy/me/consents')
    } catch (err) {
      error.value = apiMessage(err, 'No pudimos consultar tus autorizaciones.')
    }
  }

  /** Otorga o revoca la autorización de datos sensibles. Revocarla borra tus evaluaciones iniciales */
  const setSensitiveConsent = async (granted: boolean) => {
    try {
      const result = await $api<CurrentConsents & { deletedAssessments: number }>('/privacy/me/consents', {
        method: 'POST',
        body: { type: 'datos_sensibles', granted },
      })
      consents.value = result
      return result
    } catch (err) {
      throw new Error(apiMessage(err, 'No pudimos guardar tu autorización. Intenta de nuevo.'))
    }
  }

  const fetchRequests = async () => {
    try {
      requests.value = await $api<DataRequest[]>('/privacy/me/requests')
    } catch (err) {
      error.value = apiMessage(err, 'No pudimos consultar tus solicitudes.')
    }
  }

  const createRequest = async (body: { type: DataRequestType; studentId?: string; description: string }) => {
    try {
      const created = await $api<DataRequest>('/privacy/me/requests', { method: 'POST', body })
      requests.value = [created, ...requests.value]
      return created
    } catch (err) {
      throw new Error(apiMessage(err, 'No pudimos radicar tu solicitud. Intenta de nuevo.'))
    }
  }

  /** Derecho de acceso: descarga un archivo JSON con tus datos y los de tu espacio */
  const downloadMyData = async () => {
    try {
      const data = await $api<Record<string, unknown>>('/privacy/me/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mis-datos-vamos-aprendiendo-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      throw new Error(apiMessage(err, 'No pudimos preparar tus datos. Intenta de nuevo.'))
    }
  }

  const load = async () => {
    loading.value = true
    error.value = null
    await Promise.all([fetchConsents(), fetchRequests()])
    loading.value = false
  }

  return {
    consents,
    requests,
    loading,
    error,
    load,
    setSensitiveConsent,
    createRequest,
    downloadMyData,
  }
}

/** Trámite de las solicitudes por el super administrador */
export const useAdminDataRequests = () => {
  const { $api } = useNuxtApp()

  const items = ref<AdminDataRequest[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRequests = async (status?: DataRequestStatus | '') => {
    loading.value = true
    error.value = null
    try {
      items.value = await $api<AdminDataRequest[]>('/admin/data-requests', {
        query: status ? { status } : undefined,
      })
    } catch (err) {
      error.value = apiMessage(err, 'No pudimos consultar las solicitudes.')
    } finally {
      loading.value = false
    }
  }

  const updateRequest = async (id: string, body: { status: DataRequestStatus; response?: string }) => {
    try {
      return await $api<DataRequest>(`/admin/data-requests/${id}`, { method: 'PATCH', body })
    } catch (err) {
      throw new Error(apiMessage(err, 'No pudimos actualizar la solicitud.'))
    }
  }

  const executeSuppression = async (id: string) => {
    try {
      return await $api<SuppressionResult>(`/admin/data-requests/${id}/execute-suppression`, { method: 'POST' })
    } catch (err) {
      throw new Error(apiMessage(err, 'No pudimos ejecutar la supresión. No se borró ningún dato.'))
    }
  }

  return { items, loading, error, fetchRequests, updateRequest, executeSuppression }
}
