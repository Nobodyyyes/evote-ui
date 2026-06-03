import type { AuditEvent, Id } from '../types'
import { auditEvents as mockAuditEvents } from '../data/mock'
import { apiFetch } from './http'
import { normalizeArrayPayload, normalizeAuditEvent } from './normalizers'
import { USE_MOCKS } from './config'

export interface AuditQuery {
  objectType: string
  objectId: Id
}

export async function getAuditEvents(query?: AuditQuery): Promise<AuditEvent[]> {
  if (USE_MOCKS) return mockAuditEvents

  // Текущий backend отдает аудит только по objectType + objectId.
  // Если фильтр не задан, возвращаем пустой список, чтобы админ-панель не падала с 400.
  if (!query?.objectType || !query.objectId) return []

  const params = new URLSearchParams({
    objectType: query.objectType,
    objectId: query.objectId
  })

  const payload = await apiFetch<unknown>(`/audit?${params.toString()}`)
  return normalizeArrayPayload<unknown>(payload).map(normalizeAuditEvent)
}
