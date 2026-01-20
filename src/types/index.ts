export type LegacyRecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type RecurrenceUnit = 'day' | 'week' | 'month' | 'year'

export interface RecurrenceConfig {
  interval: number
  unit: RecurrenceUnit
  weekDays?: DayOfWeek[]
  monthDay?: number
}

export type TaskRecurrence = LegacyRecurrencePattern | RecurrenceConfig | null

export type Complexity = 'easy' | 'medium' | 'hard'

export type Task = {
  id: number
  text: string
  description?: string
  deadline?: string
  completed: boolean
  completedAt?: string
  recurrence?: TaskRecurrence
  complexity?: Complexity
  showAfter?: string
}

export type Quadrant = 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important'

export interface RecurrenceFormState {
  enabled: boolean
  preset: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | null
  interval: number
  unit: RecurrenceUnit
  weekDays: DayOfWeek[]
  monthDay: number | null
  useSpecificMonthDay: boolean
}

export interface EditFormState {
  text: string
  description: string
  deadline: string
  isUrgent: boolean
  isImportant: boolean
  recurrence: RecurrenceFormState
  complexity: Complexity
}

export interface TaskWithQuadrant extends Task {
  currentQuadrant: Quadrant
}
