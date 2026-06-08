import type {
    CastVoteRequest,
    CreateElectionOptionRequest,
    CreateElectionRequest,
    CreateElectionWithOptionsRequest,
    Election,
    ElectionOption,
    ElectionResult,
    Id
} from '../types'
import {apiFetch} from './http'
import {normalizeArrayPayload, normalizeElection, normalizeElectionOption, normalizeElectionResult} from './normalizers'

export async function getElectionOptions(electionId: Id): Promise<ElectionOption[]> {
    const payload = await apiFetch<unknown>(`/elections/${electionId}/options`)
    return normalizeArrayPayload<unknown>(payload).map(normalizeElectionOption)
}

export async function getElectionById(id: Id): Promise<Election | null> {
    const payload = await apiFetch<unknown>(`/elections/${id}`)
    const election = normalizeElection(payload)

    try {
        election.options = await getElectionOptions(election.id)
    } catch {
        election.options = []
    }

    return election
}

export async function castVote(request: CastVoteRequest): Promise<void> {
    await apiFetch<void>(`/elections/${request.electionId}/votes`, {
        method: 'POST',
        body: {optionId: request.optionId}
    })
}

export async function getElectionResults(id: Id): Promise<ElectionResult> {
    const payload = await apiFetch<unknown>(`/elections/${id}/results`)
    return normalizeElectionResult(payload)
}

function normalizeLocalDateTime(value: string): string {
    if (!value) return value
    if (value.length === 16) return `${value}:00`
    return value
}

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

export async function createElectionOnly(request: CreateElectionRequest): Promise<Election> {
    const payload = await apiFetch<unknown>('/elections', {
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

    return normalizeElection(payload)
}

export async function createElectionOption(electionId: string, request: CreateElectionOptionRequest): Promise<string> {
    return apiFetch<string>(`/elections/${electionId}/options`, {
        method: 'POST',
        body: {
            text: request.text,
            orderNumber: request.orderNumber
        }
    })
}

export async function getElections(): Promise<Election[]> {
    const payload = await apiFetch<unknown>('/elections')
    return normalizeArrayPayload<unknown>(payload).map(normalizeElection)
}

export async function getCompletedElection(): Promise<Election[]> {
    const elections = await getElections()
    return elections.filter(election => election.status === 'COMPLETED')
}

export async function publishElection(electionId: Id): Promise<void> {
    await apiFetch<void>(`/elections/${electionId}/publish`, {
        method: 'POST'
    })
}

export async function calculateElectionResults(electionId: Id): Promise<ElectionResult> {
    const payload = await apiFetch<unknown>(`/elections/${electionId}/results/calculate`, {
        method: 'POST'
    })
    return normalizeElectionResult(payload)
}

export async function publishElectionResults(electionId: Id): Promise<ElectionResult> {
    const payload = await apiFetch<unknown>(`/elections/${electionId}/results/publish`, {
        method: 'POST'
    })
    return normalizeElectionResult(payload)
}

export async function deleteElectionApi(electionId: Id): Promise<void> {
    await apiFetch<void>(`/elections/${electionId}`, {
        method: 'DELETE'
    })
}
