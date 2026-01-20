import type { Task, Quadrant } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export type ApiTask = Task & { quadrant: Quadrant }

export async function fetchTasks(): Promise<ApiTask[]> {
  const response = await fetch(`${API_BASE}/api/tasks`)
  if (!response.ok) {
    throw new Error('Failed to fetch tasks')
  }
  return response.json()
}

export async function createTask(task: Omit<ApiTask, 'id' | 'completed' | 'completedAt'>): Promise<ApiTask> {
  const response = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  if (!response.ok) {
    throw new Error('Failed to create task')
  }
  return response.json()
}

export async function updateTask(id: number, updates: Partial<ApiTask>): Promise<ApiTask> {
  const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    throw new Error('Failed to update task')
  }
  return response.json()
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete task')
  }
}
