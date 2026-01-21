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

export type XpValue = 5 | 15 | 30 | 60 | 100

export interface AiScores {
  futurePainScore: number
  urgencyScore: number
  frictionScore: number
}

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
  xp?: XpValue
  aiScores?: AiScores
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

export type SuggestionSourceType =
  | 'S1_RECURRENCE'
  | 'S2_FOLLOW_UP'
  | 'S3_LATE_ADDITION'
  | 'S4_DEPENDENCY'
  | 'S5_MAINTENANCE'

export type SuggestionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'SNOOZED'
  | 'DISMISSED'
  | 'NEVER'

export interface SuggestedTask {
  id: number
  suggestedText: string
  sourceType: SuggestionSourceType
  confidence: number
  why: string
  status: SuggestionStatus
  fingerprint: string
  relatedTaskIds: number[]
  snoozeUntil: string | null
  lastShownAt: string | null
  createdAt: string
  updatedAt: string
}
