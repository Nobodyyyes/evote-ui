import { reactive } from 'vue'
import type { Role, User } from '../types'

const STORAGE_KEY = 'evote-user'

interface AuthState {
  user: User | null
}

const savedUser = localStorage.getItem(STORAGE_KEY)

export const authState = reactive<AuthState>({
  user: savedUser ? JSON.parse(savedUser) as User : null
})

function resolveRole(login: string): Role {
  const normalizedLogin = login.toLowerCase()
  if (normalizedLogin.includes('admin')) return 'ADMIN'
  if (normalizedLogin.includes('audit')) return 'AUDITOR'
  return 'VOTER'
}

export function login(loginValue: string, password: string): boolean {
  if (!loginValue.trim() || !password.trim()) {
    return false
  }

  const role = resolveRole(loginValue)
  const user: User = {
    id: Date.now(),
    fullName: role === 'ADMIN' ? 'Администратор системы' : role === 'AUDITOR' ? 'Аудитор системы' : 'Обычный пользователь',
    username: loginValue,
    email: `${loginValue}@evote.local`,
    role,
    status: 'ACTIVE',
    registeredAt: '2026-05-12'
  }

  authState.user = user
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return true
}

export function register(fullName: string, username: string, email: string, password: string): boolean {
  if (!fullName.trim() || !username.trim() || !email.trim() || password.length < 4) {
    return false
  }

  const user: User = {
    id: Date.now(),
    fullName,
    username,
    email,
    role: 'VOTER',
    status: 'ACTIVE',
    registeredAt: '2026-05-12'
  }

  authState.user = user
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return true
}

export function logout(): void {
  authState.user = null
  localStorage.removeItem(STORAGE_KEY)
}

export function hasRole(roles?: Role[]): boolean {
  if (!roles || roles.length === 0) return true
  return !!authState.user && roles.includes(authState.user.role)
}
