import type { Id, Role, User } from '../types'
import { users as mockUsers } from '../data/mock'
import { apiFetch } from './http'
import { normalizeArrayPayload, normalizeUser } from './normalizers'
import { USE_MOCKS } from './config'

export async function getUsers(): Promise<User[]> {
  if (USE_MOCKS) return mockUsers
  const payload = await apiFetch<unknown>('/users')
  return normalizeArrayPayload<unknown>(payload).map(normalizeUser)
}

export async function updateUserRole(id: Id, role: Role): Promise<User> {
  if (USE_MOCKS) {
    const user = mockUsers.find(item => String(item.id) === String(id))
    if (user) user.role = role
    return user ?? mockUsers[0]
  }
  const payload = await apiFetch<unknown>(`/users/${id}/role`, {
    method: 'PATCH',
    body: { role }
  })
  return normalizeUser(payload)
}

export async function toggleUserStatus(id: Id, currentStatus: User['status']): Promise<User> {
  if (USE_MOCKS) {
    const user = mockUsers.find(item => String(item.id) === String(id))
    if (user) user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
    return user ?? mockUsers[0]
  }

  const action = currentStatus === 'ACTIVE' ? 'block' : 'unblock'
  const payload = await apiFetch<unknown>(`/users/${id}/${action}`, { method: 'PATCH' })
  return normalizeUser(payload)
}
