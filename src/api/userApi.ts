import type {Id, Role, User} from '../types'
import {apiFetch} from './http'
import {normalizeArrayPayload, normalizeUser} from './normalizers'

/**
 * Получение всех пользователей системы
 */
export async function getUsers(): Promise<User[]> {
    const payload = await apiFetch<unknown>('/users')
    return normalizeArrayPayload<unknown>(payload).map(normalizeUser)
}

/**
 * Обновление роли пользователя
 *
 * @param userId уникальный идентификатор пользователя
 * @param role роль на которую необходимо обновить
 */
export async function updateUserRole(userId: Id, role: Role): Promise<User> {
    const payload = await apiFetch<unknown>(`/users/${userId}/role`, {
        method: 'PATCH',
        body: {role}
    })
    return normalizeUser(payload)
}

/**
 * Переключение статуса пользователя
 *
 * @param userId уникальный идентификатор пользователя
 * @param currentStatus текущий статус пользователя
 */
export async function toggleUserStatus(userId: Id, currentStatus: User['status']): Promise<User> {
    const status = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'

    const params = new URLSearchParams({
        status
    })
    const payload = await apiFetch<unknown>(`/users/${userId}/status?${params.toString()}`, {
        method: 'PATCH'
    })
    return normalizeUser(payload)
}
