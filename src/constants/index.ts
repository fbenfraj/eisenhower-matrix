import type { Complexity, Quadrant, RecurrenceFormState } from '../types'

export const STORAGE_KEY = 'eisenhower-matrix-tasks'

export const COMPLEXITY_ORDER: Record<Complexity, number> = {
  easy: 1,
  medium: 2,
  hard: 3
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export const QUADRANT_CONFIG: Record<Quadrant, { title: string; label: string }> = {
  'urgent-important': { title: 'Do First', label: 'Urgent & Important' },
  'not-urgent-important': { title: 'Schedule', label: 'Not Urgent & Important' },
  'urgent-not-important': { title: 'Delegate', label: 'Urgent & Not Important' },
  'not-urgent-not-important': { title: "Don't Do", label: 'Not Urgent & Not Important' }
}

export const QUADRANT_SHORT_LABELS: Record<Quadrant, string> = {
  'urgent-important': 'Do First',
  'not-urgent-important': 'Schedule',
  'urgent-not-important': 'Delegate',
  'not-urgent-not-important': "Don't Do"
}

export const DEFAULT_RECURRENCE_FORM: RecurrenceFormState = {
  enabled: false,
  preset: null,
  interval: 1,
  unit: 'week',
  weekDays: [],
  monthDay: null,
  useSpecificMonthDay: false
}

export const VALID_QUADRANTS: Quadrant[] = [
  'urgent-important',
  'not-urgent-important',
  'urgent-not-important',
  'not-urgent-not-important'
]

export const VALID_COMPLEXITIES: Complexity[] = ['easy', 'medium', 'hard']
