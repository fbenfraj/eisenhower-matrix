import { DAY_NAMES } from '../constants'
import type {
  DayOfWeek,
  LegacyRecurrencePattern,
  RecurrenceConfig,
  RecurrenceFormState,
  RecurrenceUnit,
  TaskRecurrence
} from '../types'

export const isLegacyRecurrence = (recurrence: TaskRecurrence): recurrence is LegacyRecurrencePattern => {
  return typeof recurrence === 'string'
}

const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const findNextWeekdayOccurrence = (
  baseDate: Date,
  weekInterval: number,
  weekDays: DayOfWeek[]
): string => {
  const sortedDays = [...weekDays].sort((a, b) => a - b)
  const currentDay = baseDate.getDay() as DayOfWeek
  const nextDate = new Date(baseDate)

  const nextDayThisWeek = sortedDays.find(d => d > currentDay)

  if (nextDayThisWeek !== undefined && weekInterval === 1) {
    const daysToAdd = nextDayThisWeek - currentDay
    nextDate.setDate(nextDate.getDate() + daysToAdd)
  } else {
    const daysUntilNextWeek = 7 - currentDay + sortedDays[0]
    const additionalWeeks = (weekInterval - 1) * 7
    nextDate.setDate(nextDate.getDate() + daysUntilNextWeek + additionalWeeks)
  }

  return nextDate.toISOString().split('T')[0]
}

const calculateLegacyNextDeadline = (
  baseDate: Date,
  recurrence: LegacyRecurrencePattern
): string => {
  const nextDate = new Date(baseDate)

  switch (recurrence) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1)
      break
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }

  return nextDate.toISOString().split('T')[0]
}

const calculateFlexibleNextDeadline = (
  baseDate: Date,
  config: RecurrenceConfig
): string => {
  const nextDate = new Date(baseDate)
  const { interval, unit, weekDays, monthDay } = config

  switch (unit) {
    case 'day':
      nextDate.setDate(nextDate.getDate() + interval)
      break

    case 'week':
      if (weekDays && weekDays.length > 0) {
        return findNextWeekdayOccurrence(baseDate, interval, weekDays)
      } else {
        nextDate.setDate(nextDate.getDate() + (interval * 7))
      }
      break

    case 'month':
      nextDate.setMonth(nextDate.getMonth() + interval)
      if (monthDay !== undefined && monthDay !== null) {
        const targetDay = Math.min(monthDay, getDaysInMonth(nextDate))
        nextDate.setDate(targetDay)
      }
      break

    case 'year':
      nextDate.setFullYear(nextDate.getFullYear() + interval)
      break
  }

  return nextDate.toISOString().split('T')[0]
}

export const calculateNextDeadline = (
  currentDeadline: string | undefined,
  recurrence: TaskRecurrence
): string => {
  if (!recurrence) {
    throw new Error('Recurrence pattern is required')
  }

  const baseDate = currentDeadline ? new Date(currentDeadline) : new Date()

  if (isLegacyRecurrence(recurrence)) {
    return calculateLegacyNextDeadline(baseDate, recurrence)
  }

  return calculateFlexibleNextDeadline(baseDate, recurrence)
}

const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

export const getRecurrenceDescription = (recurrence: TaskRecurrence): string => {
  if (!recurrence) return ''

  if (isLegacyRecurrence(recurrence)) {
    const descriptions: Record<LegacyRecurrencePattern, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    }
    return descriptions[recurrence]
  }

  const { interval, unit, weekDays, monthDay } = recurrence

  if (unit === 'week' && weekDays && weekDays.length > 0) {
    const dayList = weekDays.map(d => DAY_NAMES[d]).join(', ')

    if (weekDays.length === 5 && weekDays.every((d, i) => d === i + 1)) {
      return interval === 1 ? 'Weekdays' : `Every ${interval} weeks (weekdays)`
    }

    if (weekDays.length === 2 && weekDays.includes(0) && weekDays.includes(6)) {
      return interval === 1 ? 'Weekends' : `Every ${interval} weeks (weekends)`
    }

    return interval === 1 ? `Every ${dayList}` : `Every ${interval} weeks on ${dayList}`
  }

  if (unit === 'month' && monthDay) {
    const suffix = getOrdinalSuffix(monthDay)
    return interval === 1
      ? `${monthDay}${suffix} of each month`
      : `${monthDay}${suffix} every ${interval} months`
  }

  if (interval === 1) {
    const simpleLabels: Record<RecurrenceUnit, string> = {
      day: 'Daily',
      week: 'Weekly',
      month: 'Monthly',
      year: 'Yearly'
    }
    return simpleLabels[unit]
  }

  if (interval === 2) {
    const biLabels: Record<RecurrenceUnit, string> = {
      day: 'Every other day',
      week: 'Biweekly',
      month: 'Bimonthly',
      year: 'Biannual'
    }
    return biLabels[unit]
  }

  const unitLabels: Record<RecurrenceUnit, string> = {
    day: 'days',
    week: 'weeks',
    month: 'months',
    year: 'years'
  }

  return `Every ${interval} ${unitLabels[unit]}`
}

export const buildRecurrenceConfig = (formState: RecurrenceFormState): TaskRecurrence => {
  if (!formState.enabled) return null

  if (formState.preset && formState.preset !== 'custom') {
    return formState.preset
  }

  const config: RecurrenceConfig = {
    interval: formState.interval,
    unit: formState.unit
  }

  if (formState.unit === 'week' && formState.weekDays.length > 0) {
    config.weekDays = formState.weekDays
  }

  if (formState.unit === 'month' && formState.useSpecificMonthDay && formState.monthDay) {
    config.monthDay = formState.monthDay
  }

  return config
}

export const parseRecurrenceToFormState = (recurrence: TaskRecurrence): RecurrenceFormState => {
  if (!recurrence) {
    return {
      enabled: false,
      preset: null,
      interval: 1,
      unit: 'week',
      weekDays: [],
      monthDay: null,
      useSpecificMonthDay: false
    }
  }

  if (isLegacyRecurrence(recurrence)) {
    const unitMap: Record<LegacyRecurrencePattern, RecurrenceUnit> = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
      yearly: 'year'
    }
    return {
      enabled: true,
      preset: recurrence,
      interval: 1,
      unit: unitMap[recurrence],
      weekDays: [],
      monthDay: null,
      useSpecificMonthDay: false
    }
  }

  return {
    enabled: true,
    preset: 'custom',
    interval: recurrence.interval,
    unit: recurrence.unit,
    weekDays: recurrence.weekDays || [],
    monthDay: recurrence.monthDay ?? null,
    useSpecificMonthDay: recurrence.monthDay !== undefined
  }
}
