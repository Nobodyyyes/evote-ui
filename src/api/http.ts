import { API_BASE_URL, apiPath } from './config'
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './tokenStorage'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  skipAuth?: boolean
  retry?: boolean
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (response.status === 204) return null
  if (contentType.includes('application/json')) return response.json()
  return response.text()
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.message === 'string') return record.message
    if (typeof record.error === 'string') return record.error
  }
  if (typeof body === 'string' && body.trim()) return body
  return fallback
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const response = await fetch(`${API_BASE_URL}${apiPath('/auth/refresh')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })

  if (!response.ok) {
    clearTokens()
    return false
  }

  const data = await parseResponse(response) as Record<string, unknown>
  const accessToken = typeof data.accessToken === 'string' ? data.accessToken : null
  const newRefreshToken = typeof data.refreshToken === 'string' ? data.refreshToken : refreshToken

  if (!accessToken) return false
  saveTokens(accessToken, newRefreshToken)
  return true
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers)
    const token = getAccessToken()

    if (!options.skipAuth && token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    if (options.body !== undefined && !isFormData(options.body)) {
        headers.set('Content-Type', 'application/json')
    }

    const url = `${API_BASE_URL}${apiPath(path)}`


    const response = await fetch(url, {
        ...options,
        headers,
        body: isFormData(options.body)
            ? options.body
            : options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined
    })

    if (response.status === 401 && options.retry !== false && !options.skipAuth) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
            return apiFetch<T>(path, { ...options, retry: false })
        }
    }

    const body = await parseResponse(response)

    if (!response.ok) {
        throw new ApiError(response.status, extractErrorMessage(body, `Ошибка API: ${response.status}`), body)
    }

    return body as T
}
