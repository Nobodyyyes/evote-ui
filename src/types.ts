export type Id = string

export type Role = 'USER' | 'ADMIN' | 'AUDITOR'
export type UserStatus = 'ACTIVE' | 'BLOCKED'
export type ElectionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED'
export type ElectionResultVisibilityType = 'AFTER_FINISH' | 'AFTER_PUBLISH'
export type AccessElectionType = 'ALL_AUTHORIZED_USERS' | 'SELECTED_USERS_ONLY'
export type BlockchainStatus = 'CONFIRMED' | 'FAILED' | 'PENDING' | 'VALID' | 'INVALID'
export type BlockchainObjectType = 'VOTE' | 'RESULT'

export interface User {
  id: Id
  firstname: string
  name: string
  username: string
  email: string
  roles: Role[]
  role: Role
  status: UserStatus
  createdAt: string
}

export interface ElectionOption {
  id: Id
  electionId?: Id
  text: string
  orderNumber: number
  votes: number
  percentage: number
}

export interface Election {
  id: Id
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
  options: ElectionOption[]
  participants: number
  voted: boolean
  resultHash: string
  voteHash: string
}

export interface ElectionResultOption {
  optionId: Id
  optionText: string
  orderNumber: number
  votesCount: number
  percentage: number
}

export interface ElectionResult {
  id: Id
  electionId: Id
  electionTitle: string
  totalVotes: number
  totalOptions: number
  resultHash: string
  calculatedAt: string
  optionResults: ElectionResultOption[]
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
  relatedObjectId: Id
  electionTitle: string
  eventType: string
  hash: string
  transactionId: string
  status: BlockchainStatus
  fixedAt: string
  verifiedAt: string
}

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

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
  user?: User
}

export type BlockchainObjectReference = {
    id: string
    objectType: BlockchainObjectType
    label: string
    eventType: string
    createdAt?: string | null
}
