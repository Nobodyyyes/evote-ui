import type {BlockchainObjectReference, BlockchainRecord, Id, IntegrityVerificationResponse} from '../types'
import {apiFetch} from './http'
import {normalizeArrayPayload, normalizeBlockchainRecord} from './normalizers'

export async function getBlockchainRecords(relatedObjectId?: Id): Promise<BlockchainRecord[]> {
    if (!relatedObjectId) return []

    const payload = await apiFetch<unknown>(`/blockchain/records/${encodeURIComponent(relatedObjectId)}`)

    return normalizeArrayPayload<unknown>(payload).map(normalizeBlockchainRecord)
}

export async function getIntegrityRecords(relatedObjectId?: Id): Promise<BlockchainRecord[]> {
    return getBlockchainRecords(relatedObjectId)
}

/**
 * Реальная проверка целостности.
 *
 * objectType:
 * VOTE -> проверяет конкретный голос
 * RESULT -> проверяет рассчитанный результат
 */
export async function checkIntegrity(relatedObjectId: Id, objectType: 'VOTE' | 'RESULT'): Promise<IntegrityVerificationResponse> {
    if (!relatedObjectId) {
        throw new Error('Не указан ID объекта для проверки целостности.')
    }

    if (objectType === 'VOTE') {
        return apiFetch<IntegrityVerificationResponse>(`/integrity/votes/${encodeURIComponent(relatedObjectId)}/verify`)
    }

    if (objectType === 'RESULT') {
        return apiFetch<IntegrityVerificationResponse>(`/integrity/results/${encodeURIComponent(relatedObjectId)}/verify`)
    }

    throw new Error('Неподдерживаемый тип объекта для проверки целостности.')
}

export async function getBlockchainObjects(electionId: string): Promise<BlockchainObjectReference[]> {
    return apiFetch<BlockchainObjectReference[]>(
        `/blockchain/objects?electionId=${encodeURIComponent(electionId)}`
    )
}