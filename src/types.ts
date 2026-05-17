export type Id = string
export type Role = 'USER' | 'ADMIN' | 'AUDITOR'
export type UserStatus = 'ACTIVE' | 'BLOCKED'
export type ElectionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'FINISHED'

export interface User {
    id: string
    firstname: string
    name: string
    username: string
    email: string
    role: Role
    status: 'ACTIVE' | 'BLOCKED'
    createdAt: string
}

export interface ElectionOption {
    id: Id
    text: string
    votes: number
}

export interface Election {
    id: Id
    title: string
    description: string
    status: ElectionStatus
    startsAt: string
    endsAt: string
    participants: number
    voted: boolean
    options: ElectionOption[]
    resultHash: string
    voteHash: string
}

export interface AuditEvent {
    id: Id
    createdAt: string
    actor: string
    action: string
    description: string
}

export interface BlockchainRecord {
    id: Id
    electionTitle: string
    eventType: string
    hash: string
    transactionId: string
    status: 'VALID' | 'INVALID' | 'PENDING'
    fixedAt: string
}

export interface LoginRequest {
    username: string
    password: string
}

export interface RegisterRequest {
    firstname: string
    name: string
    username: string
    email: string
    password: string
    confirmPassword: string
}

export interface AuthResponse {
    accessToken: string
    refreshToken?: string
    tokenType?: string
    expiresIn?: number
    user?: User
}

export interface CreateElectionRequest {
    title: string
    description: string
    startsAt: string
    endsAt: string
    options: string[]
}

export interface CastVoteRequest {
    electionId: Id
    optionId: Id
}
