import type {AuditEvent, BlockchainRecord, Election, ElectionOption, ElectionStatus, Id, Role, User} from '../types'

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function asString(value: unknown, fallback = ''): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return fallback
}

function asNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : fallback
    }
    return fallback
}

function asId(value: unknown, fallback: Id = ''): Id {
    if (typeof value === 'string' || typeof value === 'number') return value
    return fallback
}

function normalizeRole(value: unknown): Role {
    const role = asString(value, 'VOTER').replace('ROLE_', '').toUpperCase()
    if (role === 'ADMIN' || role === 'AUDITOR' || role === 'SUPER_ADMIN' || role === 'ELECTION_ADMIN' || role === 'VOTER') {
        return role
    }
    return 'VOTER'
}

function normalizeElectionStatus(value: unknown): ElectionStatus {
    const status = asString(value, 'DRAFT').toUpperCase()
    if (status === 'DRAFT' || status === 'SCHEDULED' || status === 'ACTIVE' || status === 'FINISHED') return status
    return 'DRAFT'
}

function normalizeDate(value: unknown): string {
    if (!value) {
        return ''
    }

    if (typeof value !== 'string') {
        return ''
    }

    const withoutTimezone = value.replace('T', ' ')
    const withoutMillis = withoutTimezone.split('.')[0]

    return withoutMillis
}

export function normalizeArrayPayload<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) return payload as T[]

    const record = asRecord(payload)
    if (Array.isArray(record.content)) return record.content as T[]
    if (Array.isArray(record.items)) return record.items as T[]
    if (Array.isArray(record.data)) return record.data as T[]

    return []
}

export function normalizeUser(payload: unknown): User {
    const record = asRecord(payload)
    const roleSource = record.role ?? record.userRole ?? (Array.isArray(record.roles) ? record.roles[0] : undefined) ?? (Array.isArray(record.authorities) ? record.authorities[0] : undefined)

    return {
        id: asId(record.id ?? record.uuid ?? record.userId, ''),
        firstname: asString(record.firstname ?? 'Пользователь'),
        name: asString(record.name),
        username: asString(record.username ?? record.login ?? record.sub, 'user'),
        email: asString(record.email, ''),
        role: normalizeRole(roleSource),
        status: asString(record.status, 'ACTIVE').toUpperCase() === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
        createdAt: normalizeDate(record.createdAt)
    }
}

export function normalizeElectionOption(payload: unknown, index = 0): ElectionOption {
    const record = asRecord(payload)
    return {
        id: asId(record.id ?? record.uuid ?? record.optionId, index + 1),
        text: asString(record.text ?? record.title ?? record.name ?? record.optionText, `Вариант ${index + 1}`),
        votes: asNumber(record.votes ?? record.voteCount ?? record.count, 0)
    }
}

export function normalizeElection(payload: unknown): Election {
    const record = asRecord(payload)
    const rawOptions = normalizeArrayPayload<unknown>(record.options ?? record.electionOptions ?? record.variants)

    return {
        id: asId(record.id ?? record.uuid ?? record.electionId, ''),
        title: asString(record.title ?? record.name, 'Без названия'),
        description: asString(record.description, ''),
        status: normalizeElectionStatus(record.status),
        startsAt: normalizeDate(record.startsAt ?? record.startDateTime ?? record.startAt ?? record.startDate),
        endsAt: normalizeDate(record.endsAt ?? record.endDateTime ?? record.endAt ?? record.endDate),
        participants: asNumber(record.participants ?? record.participantsCount ?? record.votersCount ?? record.voteCount, 0),
        voted: Boolean(record.voted ?? record.alreadyVoted ?? record.hasVoted),
        options: rawOptions.map(normalizeElectionOption),
        resultHash: asString(record.resultHash ?? record.resultsHash, 'res_pending'),
        voteHash: asString(record.voteHash ?? record.votesHash, 'vote_pending')
    }
}

export function normalizeAuditEvent(payload: unknown): AuditEvent {
    const record = asRecord(payload)
    return {
        id: asId(record.id ?? record.uuid, ''),
        createdAt: normalizeDate(record.createdAt ?? record.timestamp),
        actor: asString(record.actor ?? record.actorUsername ?? record.username ?? record.user, 'system'),
        action: asString(record.action ?? record.actionType ?? record.type, '-'),
        description: asString(record.description ?? record.message, '')
    }
}

export function normalizeBlockchainRecord(payload: unknown): BlockchainRecord {
    const record = asRecord(payload)
    const status = asString(record.status ?? record.checkStatus, 'PENDING').toUpperCase()

    return {
        id: asId(record.id ?? record.uuid, ''),
        electionTitle: asString(record.electionTitle ?? record.electionName ?? record.title, 'Голосование'),
        eventType: asString(record.eventType ?? record.type, '-'),
        hash: asString(record.hash ?? record.controlHash ?? record.resultHash, '-'),
        transactionId: asString(record.transactionId ?? record.blockId ?? record.blockHash, '-'),
        status: status === 'VALID' || status === 'INVALID' ? status : 'PENDING',
        fixedAt: normalizeDate(record.fixedAt ?? record.createdAt ?? record.confirmedAt)
    }
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const [, payload] = token.split('.')
        if (!payload) return null
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
        const json = decodeURIComponent(
            atob(normalized)
                .split('')
                .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join('')
        )
        return JSON.parse(json) as Record<string, unknown>
    } catch {
        return null
    }
}

export function userFromToken(token: string): User | null {
    const payload = parseJwtPayload(token)
    if (!payload) return null

    const authorities = Array.isArray(payload.authorities) ? payload.authorities : Array.isArray(payload.roles) ? payload.roles : []
    return normalizeUser({
        id: payload.userId ?? payload.id ?? payload.sub,
        firstname: payload.firstname ,
        name: payload.name,
        username: payload.username ?? "Unknown",
        email: payload.email,
        role: payload.role ?? authorities[0],
        status: 'ACTIVE',
        createdAt: payload.createdAt ?? '-'
    })
}
