import type {AccessElectionType, Role} from '../types'

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

export function formatAccessElectionType(status?: AccessElectionType | string | null): string {
    switch (status) {
        case 'ALL_AUTHORIZED_USERS':
            return 'Все авторизованные пользователи'
        case 'SELECTED_USERS_ONLY':
            return 'Только выбранные пользователи'
    }
}