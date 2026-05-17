import type { CastVoteRequest, CreateElectionRequest, Election, ElectionOption, ElectionStatus, Id } from '../types'
import { elections as mockElections } from '../data/mock'
import { apiFetch } from './http'
import { normalizeArrayPayload, normalizeElection, normalizeElectionOption } from './normalizers'
import { USE_MOCKS } from './config'

function findMockElection(id: Id): Election | undefined {
  return mockElections.find(election => String(election.id) === String(id))
}

export async function getElections(): Promise<Election[]> {
  if (USE_MOCKS) return mockElections
  const payload = await apiFetch<unknown>('/elections')
  return normalizeArrayPayload<unknown>(payload).map(normalizeElection)
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

export async function createElection(request: CreateElectionRequest): Promise<Election> {
  if (USE_MOCKS) {
    const created: Election = {
      id: Date.now(),
      title: request.title,
      description: request.description,
      status: 'DRAFT',
      startsAt: request.startsAt,
      endsAt: request.endsAt,
      participants: 0,
      voted: false,
      resultHash: 'res_pending',
      voteHash: 'vote_pending',
      options: request.options.map((option, index) => ({ id: index + 1, text: option, votes: 0 }))
    }
    mockElections.push(created)
    return created
  }

  const payload = await apiFetch<unknown>('/elections', {
    method: 'POST',
    body: {
      title: request.title,
      description: request.description,
      startsAt: request.startsAt,
      endsAt: request.endsAt,
      startDateTime: request.startsAt,
      endDateTime: request.endsAt,
      options: request.options
    }
  })
  return normalizeElection(payload)
}

export async function updateElectionStatus(id: Id, status: Extract<ElectionStatus, 'ACTIVE' | 'FINISHED'>): Promise<void> {
  if (USE_MOCKS) {
    const election = findMockElection(id)
    if (election) election.status = status
    return
  }

  const action = status === 'ACTIVE' ? 'start' : 'finish'
  await apiFetch<void>(`/elections/${id}/${action}`, { method: 'POST' })
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
    body: { optionId: request.optionId }
  })
}

export async function getElectionResults(id: Id): Promise<Election> {
  if (USE_MOCKS) return findMockElection(id) ?? normalizeElection({ id })
  const payload = await apiFetch<unknown>(`/elections/${id}/results`)
  return normalizeElection(payload)
}
