import type { BlockchainRecord, Id } from '../types'
import { blockchainRecords as mockBlockchainRecords } from '../data/mock'
import { apiFetch } from './http'
import { normalizeArrayPayload, normalizeBlockchainRecord } from './normalizers'
import { USE_MOCKS } from './config'

export async function getBlockchainRecords(): Promise<BlockchainRecord[]> {
  if (USE_MOCKS) return mockBlockchainRecords
  const payload = await apiFetch<unknown>('/blockchain/records')
  return normalizeArrayPayload<unknown>(payload).map(normalizeBlockchainRecord)
}

export async function getIntegrityRecords(): Promise<BlockchainRecord[]> {
  if (USE_MOCKS) return mockBlockchainRecords
  const payload = await apiFetch<unknown>('/integrity/records')
  return normalizeArrayPayload<unknown>(payload).map(normalizeBlockchainRecord)
}

export async function checkIntegrity(electionId?: Id): Promise<string> {
  if (USE_MOCKS) return 'Проверка завершена: контрольные значения совпадают.'

  const path = electionId ? `/integrity/elections/${electionId}/check` : '/integrity/check'
  const payload = await apiFetch<unknown>(path, { method: 'POST' })

  if (payload && typeof payload === 'object' && 'message' in payload) {
    return String((payload as Record<string, unknown>).message)
  }
  return 'Проверка целостности выполнена.'
}
