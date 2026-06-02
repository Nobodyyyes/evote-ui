import type {
  AuditEvent,
  BlockchainRecord,
  BlockchainStatus,
  Election,
  ElectionOption,
  ElectionResult,
  ElectionResultOption,
  ElectionStatus,
  Id,
  Role,
  User,
  UserStatus
} from '../types'

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
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return fallback
}

function normalizeRole(value: unknown): Role {
  const role = asString(value, 'USER').replace('ROLE_', '').toUpperCase()

  switch (role) {
    case 'ADMIN':
      return 'ADMIN'
    case 'AUDITOR':
      return 'AUDITOR'
    case 'USER':
      return 'USER'
    default:
      return 'USER'
  }
}

function normalizeUserStatus(value: unknown): UserStatus {
  return asString(value, 'ACTIVE').toUpperCase() === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE'
}

function normalizeElectionStatus(value: unknown): ElectionStatus {
  const status = asString(value, 'DRAFT').toUpperCase()

  if (status === 'DRAFT' || status === 'SCHEDULED' || status === 'ACTIVE' || status === 'COMPLETED' || status === 'CANCELED') {
    return status
  }

  // Старое название на фронте оставлено для совместимости с моками/кэшем браузера.
  if (status === 'FINISHED') return 'COMPLETED'

  return 'DRAFT'
}

function normalizeBlockchainStatus(value: unknown): BlockchainStatus {
  const status = asString(value, 'PENDING').toUpperCase()

  if (status === 'CONFIRMED' || status === 'FAILED' || status === 'PENDING' || status === 'VALID' || status === 'INVALID') {
    return status
  }

  return 'PENDING'
}

function normalizeDate(value: unknown): string {
  if (!value || typeof value !== 'string') return ''
  return value.replace('T', ' ').split('.')[0]
}

export function normalizeArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]

  const record = asRecord(payload)
  if (Array.isArray(record.content)) return record.content as T[]
  if (Array.isArray(record.items)) return record.items as T[]
  if (Array.isArray(record.data)) return record.data as T[]
  if (Array.isArray(record.optionResults)) return record.optionResults as T[]

  return []
}

export function normalizeUser(payload: unknown): User {
  const record = asRecord(payload)
  const rawRoles = Array.isArray(record.roles) ? record.roles : []
  const roles = rawRoles.length > 0 ? rawRoles.map(normalizeRole) : []
  const role = normalizeRole(record.role ?? record.userRole ?? roles[0] ?? (Array.isArray(record.authorities) ? record.authorities[0] : undefined))
  const normalizedRoles = roles.length > 0 ? roles : [role]

  return {
    id: asId(record.id ?? record.uuid ?? record.userId, ''),
    firstname: asString(record.firstname ?? record.firstName, ''),
    name: asString(record.name ?? record.lastname ?? record.lastName, ''),
    username: asString(record.username ?? record.login ?? record.sub, 'user'),
    email: asString(record.email, ''),
    roles: normalizedRoles,
    role,
    status: normalizeUserStatus(record.status),
    createdAt: normalizeDate(record.createdAt ?? record.createdDate)
  }
}

export function normalizeElectionOption(payload: unknown, index = 0): ElectionOption {
  const record = asRecord(payload)

  return {
    id: asId(record.id ?? record.uuid ?? record.optionId ?? record.electionOptionId, String(index + 1)),
    electionId: asId(record.electionId, ''),
    text: asString(record.text ?? record.title ?? record.name ?? record.optionText, `Вариант ${index + 1}`),
    orderNumber: asNumber(record.orderNumber, index + 1),
    votes: asNumber(record.votes ?? record.voteCount ?? record.votesCount ?? record.count, 0),
    percentage: asNumber(record.percentage, 0)
  }
}

export function normalizeElection(payload: unknown): Election {
  const record = asRecord(payload)
  const rawOptions = normalizeArrayPayload<unknown>(record.options ?? record.electionOptions ?? record.variants)

  return {
    id: asId(record.id ?? record.uuid ?? record.electionId, ''),
    name: asString(record.name ?? record.title, 'Без названия'),
    description: asString(record.description, ''),
    startDateTime: normalizeDate(record.startDateTime ?? record.startsAt ?? record.startAt ?? record.startDate),
    endDateTime: normalizeDate(record.endDateTime ?? record.endsAt ?? record.endAt ?? record.endDate),
    createdAt: normalizeDate(record.createdAt ?? record.createdDate),
    status: normalizeElectionStatus(record.status ?? record.electionStatus),
    resultVisibilityType: asString(record.resultVisibilityType, 'AFTER_FINISH') === 'AFTER_PUBLISH' ? 'AFTER_PUBLISH' : 'AFTER_FINISH',
    resultPublished: Boolean(record.resultPublished),
    creatorInfo: asString(record.creatorInfo, ''),
    accessElectionType: asString(record.accessElectionType, 'ALL_AUTHORIZED_USERS') === 'SELECTED_USERS_ONLY'
      ? 'SELECTED_USERS_ONLY'
      : 'ALL_AUTHORIZED_USERS',
    options: rawOptions.map(normalizeElectionOption),
    participants: asNumber(record.participants ?? record.participantsCount ?? record.votersCount ?? record.totalVotes ?? record.voteCount, 0),
    voted: Boolean(record.voted ?? record.alreadyVoted ?? record.hasVoted),
    resultHash: asString(record.resultHash ?? record.resultsHash, ''),
    voteHash: asString(record.voteHash ?? record.votesHash, '')
  }
}

export function normalizeElectionResultOption(payload: unknown, index = 0): ElectionResultOption {
  const record = asRecord(payload)

  return {
    optionId: asId(record.optionId ?? record.id ?? record.uuid, String(index + 1)),
    optionText: asString(record.optionText ?? record.text ?? record.name, `Вариант ${index + 1}`),
    orderNumber: asNumber(record.orderNumber, index + 1),
    votesCount: asNumber(record.votesCount ?? record.votes ?? record.count, 0),
    percentage: asNumber(record.percentage, 0)
  }
}

export function normalizeElectionResult(payload: unknown): ElectionResult {
  const record = asRecord(payload)
  const optionResults = normalizeArrayPayload<unknown>(record.optionResults).map(normalizeElectionResultOption)

  return {
    id: asId(record.id ?? record.uuid, ''),
    electionId: asId(record.electionId, ''),
    electionTitle: asString(record.electionTitle ?? record.name ?? record.title, 'Голосование'),
    totalVotes: asNumber(record.totalVotes, optionResults.reduce((sum, option) => sum + option.votesCount, 0)),
    totalOptions: asNumber(record.totalOptions, optionResults.length),
    resultHash: asString(record.resultHash, ''),
    calculatedAt: normalizeDate(record.calculatedAt),
    optionResults
  }
}

export function normalizeAuditEvent(payload: unknown): AuditEvent {
  const record = asRecord(payload)

  return {
    id: asId(record.id ?? record.uuid, ''),
    createdAt: normalizeDate(record.createdAt ?? record.timestamp),
    actor: asString(record.actor ?? record.actorUsername ?? record.username ?? record.user ?? record.actorId, 'system'),
    action: asString(record.action ?? record.actionType ?? record.type, '-'),
    description: asString(record.description ?? record.message ?? record.technicalDetails, '')
  }
}

export function normalizeBlockchainRecord(payload: unknown): BlockchainRecord {
  const record = asRecord(payload)

  return {
    id: asId(record.id ?? record.uuid, ''),
    relatedObjectId: asId(record.relatedObjectId, ''),
    electionTitle: asString(record.electionTitle ?? record.electionName ?? record.title ?? record.relatedObjectId, 'Объект голосования'),
    eventType: asString(record.eventType ?? record.type, '-'),
    hash: asString(record.hash ?? record.dataHash ?? record.controlHash ?? record.resultHash, '-'),
    transactionId: asString(record.transactionId ?? record.blockId ?? record.blockHash, '-'),
    status: normalizeBlockchainStatus(record.status ?? record.checkStatus),
    fixedAt: normalizeDate(record.fixedAt ?? record.createdAt ?? record.confirmedAt),
    verifiedAt: normalizeDate(record.verifiedAt)
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

  const authorities = Array.isArray(payload.authorities)
    ? payload.authorities
    : Array.isArray(payload.roles)
      ? payload.roles
      : []

  return normalizeUser({
    id: payload.userId ?? payload.id ?? payload.sub,
    firstname: payload.firstname,
    name: payload.name,
    username: payload.username ?? payload.sub ?? 'user',
    email: payload.email,
    role: payload.role ?? authorities[0],
    roles: authorities,
    status: payload.status ?? 'ACTIVE',
    createdAt: payload.createdAt ?? payload.createdDate
  })
}
