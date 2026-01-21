import type { SuggestedTask, Quadrant } from '../types'
import { getStoredToken, clearAuth } from './auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken()
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function handleUnauthorized(response: Response): void {
  if (response.status === 401) {
    clearAuth()
    window.location.href = '/login'
  }
}

export async function fetchSuggestions(): Promise<SuggestedTask[]> {
  const response = await fetch(`${API_BASE}/api/suggestions`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) {
    handleUnauthorized(response)
    throw new Error('Failed to fetch suggestions')
  }
  return response.json()
}

export interface AcceptSuggestionResponse {
  success: boolean
  task: {
    id: number
    text: string
    description: string | null
    deadline: string | null
    completed: boolean
    completedAt: string | null
    quadrant: Quadrant
    complexity: string | null
    showAfter: string | null
    recurrence: unknown
    createdAt: string
    updatedAt: string
  }
}

export async function acceptSuggestion(id: number, quadrant: Quadrant): Promise<AcceptSuggestionResponse> {
  const response = await fetch(`${API_BASE}/api/suggestions/${id}/accept`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quadrant })
  })
  if (!response.ok) {
    handleUnauthorized(response)
    throw new Error('Failed to accept suggestion')
  }
  return response.json()
}

export async function snoozeSuggestion(id: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/suggestions/${id}/snooze`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  if (!response.ok) {
    handleUnauthorized(response)
    throw new Error('Failed to snooze suggestion')
  }
  return response.json()
}

export async function dismissSuggestion(id: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/suggestions/${id}/dismiss`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  if (!response.ok) {
    handleUnauthorized(response)
    throw new Error('Failed to dismiss suggestion')
  }
  return response.json()
}

export async function neverSuggestion(id: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/suggestions/${id}/never`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  if (!response.ok) {
    handleUnauthorized(response)
    throw new Error('Failed to block suggestion')
  }
  return response.json()
}
