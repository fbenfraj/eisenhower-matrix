import type { Task } from '../types'

export const isTaskVisible = (task: Task): boolean => {
  if (task.completed) return false

  if (task.showAfter) {
    const today = new Date().toISOString().split('T')[0]
    if (task.showAfter > today) return false
  }

  return true
}
