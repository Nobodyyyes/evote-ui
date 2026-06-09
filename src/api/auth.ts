import type {AuthResponse, LoginRequest, RegisterRequest, Role, User} from '../types'
import {apiFetch} from './http'
import {getAccessToken} from './tokenStorage'
import {userFromToken} from './normalizers'
import {authState} from "../store/auth.ts";

export async function loginRequest(request: LoginRequest): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: {
            username: request.username,
            password: request.password
        }
    })
}

export async function registerRequest(request: RegisterRequest): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: {
            firstname: request.firstname,
            name: request.name,
            username: request.username,
            email: request.email,
            password: request.password,
            confirmPassword: request.confirmPassword
        }
    })
}

export async function logoutRequest(refreshToken: string | null): Promise<void> {
    await apiFetch<void>('/auth/logout', {
        method: 'POST',
        body: {
            refreshToken
        }
    })
}

export async function getCurrentUserRequest(): Promise<User> {
    const token = getAccessToken()
    const user = token ? userFromToken(token) : null

    if (!user) {
        throw new Error('Не удалось определить пользователя из JWT')
    }

    return user
}

export function redirectDefaultRouteByRole(role?: Role): string {
    switch (role) {
        case 'ADMIN':
            return '/admin'
        case 'AUDITOR':
            return '/admin/audit'
        case 'USER':
            return '/dashboard'
        default:
            return '/dashboard'
    }
}

export function getDefaultRoute(): string {
    return redirectDefaultRouteByRole(authState.user?.role)
}