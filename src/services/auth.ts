const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export interface User {
  id: number
  email: string
}

export interface AuthResponse {
  user: User
  token: string
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  const userJson = localStorage.getItem(USER_KEY)
  if (!userJson) return null
  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

export function storeAuth(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.token)
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Registration failed')
  }
  const auth: AuthResponse = await response.json()
  storeAuth(auth)
  return auth
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Login failed')
  }
  const auth: AuthResponse = await response.json()
  storeAuth(auth)
  return auth
}

export function logout(): void {
  clearAuth()
}
