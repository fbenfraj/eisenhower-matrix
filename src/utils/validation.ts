import type {
  DayOfWeek,
  LegacyRecurrencePattern,
  RecurrenceConfig,
  RecurrenceUnit,
  TaskRecurrence
} from '../types'

const VALID_LEGACY: LegacyRecurrencePattern[] = ['daily', 'weekly', 'monthly', 'yearly']
const VALID_UNITS: RecurrenceUnit[] = ['day', 'week', 'month', 'year']

export const validateRecurrence = (rec: unknown): TaskRecurrence => {
  if (rec === null || rec === undefined) return null

  if (typeof rec === 'string') {
    return VALID_LEGACY.includes(rec as LegacyRecurrencePattern)
      ? rec as LegacyRecurrencePattern
      : null
  }

  if (typeof rec === 'object') {
    const config = rec as Partial<RecurrenceConfig>

    if (typeof config.interval !== 'number' || config.interval < 1) return null
    if (!VALID_UNITS.includes(config.unit as RecurrenceUnit)) return null

    const validated: RecurrenceConfig = {
      interval: Math.max(1, Math.min(99, Math.floor(config.interval))),
      unit: config.unit as RecurrenceUnit
    }

    if (Array.isArray(config.weekDays) && config.weekDays.length > 0) {
      const validDays = config.weekDays.filter(
        d => typeof d === 'number' && d >= 0 && d <= 6
      ) as DayOfWeek[]
      if (validDays.length > 0) {
        validated.weekDays = [...new Set(validDays)].sort((a, b) => a - b)
      }
    }

    if (typeof config.monthDay === 'number' && config.monthDay >= 1 && config.monthDay <= 31) {
      validated.monthDay = config.monthDay
    }

    return validated
  }

  return null
}
