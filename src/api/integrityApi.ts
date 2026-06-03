import type {BlockchainObjectReference, BlockchainRecord, Id} from '../types'
import {blockchainRecords as mockBlockchainRecords} from '../data/mock'
import {apiFetch} from './http'
import {normalizeArrayPayload, normalizeBlockchainRecord} from './normalizers'
import {USE_MOCKS} from './config'

export async function getBlockchainRecords(relatedObjectId?: Id): Promise<BlockchainRecord[]> {
    if (USE_MOCKS) return mockBlockchainRecords

    // Текущий backend не имеет общего GET /blockchain/records.
    // Он принимает id связанного объекта: /blockchain/records/{relatedObjectId}.
    if (!relatedObjectId) return []

    const payload = await apiFetch<unknown>(`/blockchain/records/${relatedObjectId}`)
    return normalizeArrayPayload<unknown>(payload).map(normalizeBlockchainRecord)
}

export async function getIntegrityRecords(relatedObjectId?: Id): Promise<BlockchainRecord[]> {
    return getBlockchainRecords(relatedObjectId)
}

export async function checkIntegrity(relatedObjectId?: Id): Promise<string> {
    if (USE_MOCKS) return 'Проверка завершена: контрольные значения совпадают.'

    if (!relatedObjectId) {
        return 'Укажите ID объекта, чтобы загрузить контрольные blockchain-записи.'
    }

    await getBlockchainRecords(relatedObjectId)
    return 'Контрольные blockchain-записи загружены.'
}

export async function getBlockchainObjects(electionId: string): Promise<BlockchainObjectReference[]> {
    return apiFetch<BlockchainObjectReference[]>(
        `/blockchain/objects?electionId=${encodeURIComponent(electionId)}`
    )
}
