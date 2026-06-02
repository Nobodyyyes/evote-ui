import type { ElectionStatus, Role, UserStatus } from '../types'

export function formatRole(role?: Role | string | null): string {
    switch (role) {
        case 'ADMIN':
            return 'Администратор'
        case 'USER':
            return 'Пользователь'
        case 'AUDITOR':
            return 'Аудитор'
        default:
            return 'Неизвестная роль'
    }
}

export function formatUserStatus(status?: UserStatus | string | null): string {
    switch (status) {
        case 'ACTIVE':
            return 'Активен'
        case 'BLOCKED':
            return 'Заблокирован'
        default:
            return 'Неизвестный статус'
    }
}

export function formatElectionStatus(status?: ElectionStatus | string | null): string {
    switch (status) {
        case 'DRAFT':
            return 'Черновик'
        case 'SCHEDULED':
            return 'Запланировано'
        case 'ACTIVE':
            return 'Активно'
        case 'COMPLETED':
            return 'Завершено'
        case 'CANCELED':
            return 'Отменено'
        default:
            return 'Неизвестный статус'
    }
}