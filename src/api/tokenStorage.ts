const ACCESS_TOKEN_KEY = 'evote-access-token'
const REFRESH_TOKEN_KEY = 'evote-refresh-token'

export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveTokens(accessToken: string, refreshToken?: string | null): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
}

export function clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
}
