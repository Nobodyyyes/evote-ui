import {reactive} from 'vue'
import type {AuthResponse, Role, User} from '../types'
import {getCurrentUserRequest, loginRequest, logoutRequest, registerRequest} from '../api/authApi'
import {clearTokens, getAccessToken, getRefreshToken, saveTokens} from '../api/tokenStorage'
import {normalizeUser, userFromToken} from '../api/normalizers'

const USER_STORAGE_KEY = 'evote-user'

interface AuthState {
    user: User | null
    accessToken: string | null
    loading: boolean
}

const savedUser = localStorage.getItem(USER_STORAGE_KEY)
const savedAccessToken = getAccessToken()

export const authState = reactive<AuthState>({
    user: savedUser ? JSON.parse(savedUser) as User : savedAccessToken ? userFromToken(savedAccessToken) : null,
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
    console.log('[AUTH RESPONSE]', response)

    if (!response.accessToken) {
        console.error('Backend не вернул accessToken')
        return false
    }

    saveTokens(response.accessToken, response.refreshToken)
    authState.accessToken = response.accessToken

    console.log('[SAVED ACCESS TOKEN]', getAccessToken())

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
    } catch (error) {
        console.warn('Токен сохранён, но данные пользователя получить не удалось', error)
    }

    return true
}

export async function login(username: string, password: string): Promise<boolean> {
    if (!username.trim() || !password.trim()) {
        return false
    }

    authState.loading = true

    try {
        const response = await loginRequest({
            username,
            password
        })

        return await handleAuthResponse(response)
    } catch (error) {
        console.error('Login failed', error)
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
    } catch (error) {
        console.error('Registration failed', error)
        return false
    } finally {
        authState.loading = false
    }
}

export async function logout(): Promise<void> {
    const refreshToken = getRefreshToken()

    try {
        if (refreshToken) {
            await logoutRequest(refreshToken)
        }
    } catch (error) {
        console.warn('Logout request failed. Local session will be cleared anyway.', error)
    } finally {
        clearTokens()
        clearUser()
    }
}

export function hasRole(roles?: Role[]): boolean {
    if (!roles || roles.length === 0) {
        return true
    }

    if (!authState.user) {
        return false
    }

    return roles.includes(authState.user.role)
}