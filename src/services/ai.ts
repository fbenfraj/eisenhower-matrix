import type { Complexity, Quadrant, Task, TaskRecurrence } from '../types'
import { calculateInitialShowAfter } from '../utils/recurrence'
import { parseTaskWithAI as apiParseTask, sortTasksWithAI as apiSortTasks } from './api'

export interface AddTaskResult {
  task: Task
  quadrant: Quadrant
}

export const addTaskWithAI = async (input: string): Promise<AddTaskResult> => {
  const parsed = await apiParseTask(input)

  const recurrence = parsed.recurrence || undefined
  const showAfter = calculateInitialShowAfter(recurrence ?? null) ?? undefined

  const task: Task = {
    id: Date.now(),
    text: parsed.title.slice(0, 100),
    description: parsed.description || undefined,
    deadline: parsed.deadline || undefined,
    completed: false,
    recurrence,
    complexity: parsed.complexity,
    showAfter,
    xp: parsed.xp,
    aiScores: parsed.aiScores
  }

  return { task, quadrant: parsed.quadrant }
}

interface TaskForSort {
  text: string
  description?: string
  deadline?: string
  complexity?: Complexity
  recurrence?: TaskRecurrence
}

export interface SortedTask {
  text: string
  quadrant: Quadrant
  complexity: Complexity
  recurrence?: TaskRecurrence
}

export const sortTasksWithAI = async (tasks: TaskForSort[]): Promise<SortedTask[]> => {
  const results = await apiSortTasks(tasks)
  return results.map(r => ({
    text: r.text,
    quadrant: r.quadrant,
    complexity: r.complexity || 'medium',
    recurrence: r.recurrence
  }))
}
