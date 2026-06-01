export type Id = string
export type Role = 'USER' | 'ADMIN' | 'AUDITOR'
export type ElectionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'FINISHED'
export type ElectionResultVisibilityType = 'AFTER_FINISH' | 'AFTER_PUBLISH'
export type AccessElectionType = 'ALL_AUTHORIZED_USERS' | 'SELECTED_USERS_ONLY'

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
    text: string
    orderNumber: number
}

export interface Election {
    id: string
    name: string
    description: string
    startDateTime: string
    endDateTime: string
    createdAt: string
    status: ElectionStatus
    resultVisibilityType: ElectionResultVisibilityType
    resultPublished: boolean
    creatorInfo: string
    accessElectionType: AccessElectionType
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

// Request block
export interface RegisterRequest {
    firstname: string
    name: string
    username: string
    email: string
    password: string
    confirmPassword: string
}

export interface LoginRequest {
    username: string
    password: string
}

export interface CreateElectionRequest {
    name: string
    description: string
    startDateTime: string
    endDateTime: string
    creatorInfo: string
    accessElectionType: AccessElectionType
}

export interface CreateElectionOptionRequest {
    text: string
    orderNumber: number
}

export interface CreateElectionWithOptionsRequest extends CreateElectionRequest {
    options: string[]
}

export interface CastVoteRequest {
    electionId: Id
    optionId: Id
}

// Response block
export interface AuthResponse {
    accessToken: string
    refreshToken?: string
    tokenType?: string
    expiresIn?: number
    user?: User
}
