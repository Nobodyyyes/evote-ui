import type { AuditEvent } from '../types'
import { auditEvents as mockAuditEvents } from '../data/mock'
import { apiFetch } from './http'
import { normalizeArrayPayload, normalizeAuditEvent } from './normalizers'
import { USE_MOCKS } from './config'

export async function getAuditEvents(): Promise<AuditEvent[]> {
  if (USE_MOCKS) return mockAuditEvents
  const payload = await apiFetch<unknown>('/audit')
  return normalizeArrayPayload<unknown>(payload).map(normalizeAuditEvent)
}
