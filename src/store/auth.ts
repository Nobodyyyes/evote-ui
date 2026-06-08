import {reactive} from 'vue'
import type {AuthResponse, Role, User} from '../types'
import {getCurrentUserRequest, loginRequest, logoutRequest, registerRequest} from '../api/auth.ts'
import {clearTokens, getAccessToken, getRefreshToken, saveTokens} from '../api/tokenStorage'
import {normalizeUser, userFromToken} from '../api/normalizers'

const USER_STORAGE_KEY = 'evote-user'

interface AuthState {
    user: User | null
    accessToken: string | null
    loading: boolean
}

function readSavedUser(): User | null {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (!savedUser) return null

    try {
        return normalizeUser(JSON.parse(savedUser) as unknown)
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY)
        return null
    }
}

const savedAccessToken = getAccessToken()

export const authState = reactive<AuthState>({
    user: readSavedUser() ?? (savedAccessToken ? userFromToken(savedAccessToken) : null),
    accessToken: savedAccessToken,
    loading: false
})

function saveUser(user: User): void {
    authState.user = user
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

function clearUser(): void {
    authState.user = null
    authState.accessToken = null
    localStorage.removeItem(USER_STORAGE_KEY)
}

async function handleAuthResponse(response: AuthResponse): Promise<boolean> {
    if (!response.accessToken) {
        return false
    }

    saveTokens(response.accessToken, response.refreshToken)
    authState.accessToken = response.accessToken

    if (response.user) {
        saveUser(normalizeUser(response.user))
        return true
    }

    const userFromJwt = userFromToken(response.accessToken)
    if (userFromJwt) {
        saveUser(userFromJwt)
        return true
    }

    try {
        const currentUser = await getCurrentUserRequest()
        saveUser(currentUser)
    } catch {
        // Токен сохранен, но JWT не содержит пользовательские поля.
    }

    return true
}

export async function login(username: string, password: string): Promise<boolean> {
    if (!username.trim() || !password.trim()) return false

    authState.loading = true

    try {
        const response = await loginRequest({username, password})
        return await handleAuthResponse(response)
    } catch {
        clearTokens()
        clearUser()
        return false
    } finally {
        authState.loading = false
    }
}

export async function register(
    firstname: string,
    name: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string
): Promise<boolean> {
    authState.loading = true

    try {
        const response = await registerRequest({
            firstname,
            name,
            username,
            email,
            password,
            confirmPassword
        })

        return await handleAuthResponse(response)
    } catch {
        return false
    } finally {
        authState.loading = false
    }
}

export async function logout(): Promise<void> {
    const refreshToken = getRefreshToken()

    try {
        if (refreshToken) await logoutRequest(refreshToken)
    } catch {
        // Даже если backend logout вернул ошибку, локальную сессию нужно очистить.
    } finally {
        clearTokens()
        clearUser()
    }
}

export function hasRole(roles?: Role[]): boolean {
    if (!roles || roles.length === 0) return true
    if (!authState.user) return false
    return roles.includes(authState.user.role)
}
