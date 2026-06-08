export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
export const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api/v1'
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export function apiPath(path: string): string {
    const normalizedPrefix = API_PREFIX.endsWith('/') ? API_PREFIX.slice(0, -1) : API_PREFIX
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${normalizedPrefix}${normalizedPath}`
}
