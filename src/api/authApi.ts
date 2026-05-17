import type {AuthResponse, LoginRequest, RegisterRequest, User} from '../types'
import {apiFetch} from './http'
import {normalizeUser} from './normalizers'

export async function loginRequest(request: LoginRequest): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: {
            username: request.username,
            password: request.password,
        },
        skipAuth: true
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
            confirmPassword: request.confirmPassword,
        },
        skipAuth: true
    })
}

export async function logoutRequest(refreshToken: string | null): Promise<void> {
    await apiFetch<void>('/auth/logout', {
        method: 'POST',
        body: {refreshToken}
    })
}

export async function getCurrentUserRequest(): Promise<User> {
    const payload = await apiFetch<unknown>('/users/me')
    return normalizeUser(payload)
}
