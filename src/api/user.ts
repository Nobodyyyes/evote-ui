import type {Id, Role, User} from '../types'
import {apiFetch} from './http'
import {normalizeArrayPayload, normalizeUser} from './normalizers'

export async function getUsers(): Promise<User[]> {
    const payload = await apiFetch<unknown>('/users')
    return normalizeArrayPayload<unknown>(payload).map(normalizeUser)
}

export async function updateUserRole(userId: Id, role: Role): Promise<User> {
    const payload = await apiFetch<unknown>(`/users/${userId}/roles`, {
        method: 'PATCH',
        body: [role]
    })
    return normalizeUser(payload)
}

export async function toggleUserStatus(
    userId: Id,
    currentStatus: User['status']
): Promise<User> {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'

    const payload = await apiFetch<unknown>(
        `/users/${encodeURIComponent(userId)}/status?status=${encodeURIComponent(nextStatus)}`,
        {
            method: 'PATCH'
        }
    )

    return normalizeUser(payload)
}
