export type Role = 'VOTER' | 'ADMIN' | 'AUDITOR'
export type ElectionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'FINISHED'

export interface User {
  id: number
  fullName: string
  username: string
  email: string
  role: Role
  status: 'ACTIVE' | 'BLOCKED'
  registeredAt: string
}

export interface ElectionOption {
  id: number
  text: string
  votes: number
}

export interface Election {
  id: number
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
  id: number
  createdAt: string
  actor: string
  action: string
  description: string
}

export interface BlockchainRecord {
  id: number
  electionTitle: string
  eventType: string
  hash: string
  transactionId: string
  status: 'VALID' | 'INVALID' | 'PENDING'
  fixedAt: string
}
