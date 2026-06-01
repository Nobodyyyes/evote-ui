import type {
    CastVoteRequest,
    CreateElectionOptionRequest,
    CreateElectionRequest,
    CreateElectionWithOptionsRequest,
    Election,
    ElectionOption,
    ElectionStatus,
    Id
} from '../types'
import {elections as mockElections} from '../data/mock'
import {apiFetch} from './http'
import {normalizeArrayPayload, normalizeElection, normalizeElectionOption} from './normalizers'
import {USE_MOCKS} from './config'

function findMockElection(id: Id): Election | undefined {
    return mockElections.find(election => String(election.id) === String(id))
}


export async function getElectionById(id: Id): Promise<Election | null> {
    if (USE_MOCKS) return findMockElection(id) ?? null
    const payload = await apiFetch<unknown>(`/elections/${id}`)
    return normalizeElection(payload)
}

export async function getElectionOptions(electionId: Id): Promise<ElectionOption[]> {
    if (USE_MOCKS) return findMockElection(electionId)?.options ?? []
    const payload = await apiFetch<unknown>(`/elections/${electionId}/options`)
    return normalizeArrayPayload<unknown>(payload).map(normalizeElectionOption)
}



export async function castVote(request: CastVoteRequest): Promise<void> {
    if (USE_MOCKS) {
        const election = findMockElection(request.electionId)
        if (!election) return
        const option = election.options.find(item => String(item.id) === String(request.optionId))
        if (option) option.votes += 1
        election.voted = true
        election.participants += 1
        return
    }

    // userId намеренно НЕ отправляем. Backend должен брать пользователя из JWT.
    await apiFetch<void>(`/elections/${request.electionId}/votes`, {
        method: 'POST',
        body: {optionId: request.optionId}
    })
}

export async function getElectionResults(id: Id): Promise<Election> {
    if (USE_MOCKS) return findMockElection(id) ?? normalizeElection({id})
    const payload = await apiFetch<unknown>(`/elections/${id}/results`)
    return normalizeElection(payload)
}

/**
 * Метод для форматирования из даты в LocalDateTime (нужно для backend)
 *
 * @param value дата
 */
function normalizeLocalDateTime(value: string): string {
    if (!value) return value
    if (value.length === 16) return `${value}:00`
    return value
}

/**
 * Создание голосования и привязка ответов
 *
 * @param request моделька с необходимыми полями для создания голосования
 */
export async function createElection(request: CreateElectionWithOptionsRequest): Promise<Election> {
    const createdElection = await createElectionOnly({
        name: request.name,
        description: request.description,
        startDateTime: request.startDateTime,
        endDateTime: request.endDateTime,
        creatorInfo: request.creatorInfo,
        accessElectionType: request.accessElectionType
    })

    const electionId = String(createdElection.id)

    for (let i = 0; i < request.options.length; i++) {
        await createElectionOption(electionId, {
            text: request.options[i],
            orderNumber: i + 1
        })
    }

    return createdElection
}

/**
 * Создание голосования (создание только самого голосования, без ответов)
 *
 * @param request моделька с необходимыми полями для создания голосования
 */
export async function createElectionOnly(request: CreateElectionRequest): Promise<Election> {
    return apiFetch<Election>('/elections', {
        method: 'POST',
        body: {
            name: request.name,
            description: request.description,
            startDateTime: normalizeLocalDateTime(request.startDateTime),
            endDateTime: normalizeLocalDateTime(request.endDateTime),
            creatorInfo: request.creatorInfo,
            accessElectionType: request.accessElectionType
        }
    })
}

/**
 * Создание ответа голосования
 *
 * @param electionId уникальный идентификатор голосования
 * @param request моделька с необходимыми полями для создания ответа голосования
 */
export async function createElectionOption(electionId: string, request: CreateElectionOptionRequest): Promise<string> {
    return apiFetch<string>(`/elections/${electionId}/options`, {
        method: 'POST',
        body: {
            text: request.text,
            orderNumber: request.orderNumber
        }
    })
}

/**
 * Получени всех голосований
 */
export async function getElections(): Promise<Election[]> {
    const payload = await apiFetch<unknown>('/elections')
    return normalizeArrayPayload<unknown>(payload).map(normalizeElection)
}

/**
 * Обновление статуса голосования
 *
 * @param electionId уникальный идентификатор голосования
 * @param status статус на который обновится голосование
 */
export async function updateElectionStatus(electionId: Id, status: Extract<ElectionStatus, 'ACTIVE' | 'FINISHED'>): Promise<void> {
    const action = status === 'ACTIVE' ? 'publish' : 'finish'
    await apiFetch<void>(`/elections/${electionId}/${action}`, {
        method: 'POST'
    })
}

export async function deleteElectionApi(electionId: Id): Promise<void> {
    await apiFetch<void>(`/elections/${electionId}`, {
        method: 'DELETE'
    })
}
