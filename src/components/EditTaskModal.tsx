import { DAY_LETTERS } from '../constants'
import type { Complexity, DayOfWeek, RecurrenceUnit, Task, Quadrant, RecurrenceFormState } from '../types'
import {
  buildRecurrenceConfig,
  getRecurrenceDescription,
  parseRecurrenceToFormState
} from '../utils/recurrence'

const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

interface EditFormState {
  text: string
  description: string
  deadline: string
  isUrgent: boolean
  isImportant: boolean
  recurrence: RecurrenceFormState
  complexity: Complexity
}

interface EditTaskModalProps {
  task: Task
  quadrant: Quadrant
  form: EditFormState
  onFormChange: (form: EditFormState) => void
  onSave: () => void
  onClose: () => void
}

export const EditTaskModal = ({
  form,
  onFormChange,
  onSave,
  onClose
}: EditTaskModalProps) => {
  const defaultRecurrenceForm: RecurrenceFormState = {
    enabled: false,
    preset: null,
    interval: 1,
    unit: 'week',
    weekDays: [],
    monthDay: null,
    useSpecificMonthDay: false
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Task</h2>
        <div className="modal-form">
          <div className="form-group">
            <label>Task Name</label>
            <input
              type="text"
              value={form.text}
              onChange={(e) => onFormChange({ ...form, text: e.target.value })}
              maxLength={200}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <div className="deadline-field">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => onFormChange({ ...form, deadline: e.target.value })}
              />
              {form.deadline && (
                <button
                  type="button"
                  className="clear-deadline-btn"
                  onClick={() => onFormChange({ ...form, deadline: '' })}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Recurrence</label>
            <select
              value={form.recurrence.enabled
                ? (form.recurrence.preset || 'custom')
                : 'none'}
              onChange={(e) => {
                const value = e.target.value
                if (value === 'none') {
                  onFormChange({
                    ...form,
                    recurrence: { ...defaultRecurrenceForm }
                  })
                } else if (value === 'custom') {
                  onFormChange({
                    ...form,
                    recurrence: {
                      ...form.recurrence,
                      enabled: true,
                      preset: 'custom'
                    }
                  })
                } else {
                  const unitMap: Record<string, RecurrenceUnit> = {
                    daily: 'day',
                    weekly: 'week',
                    monthly: 'month',
                    yearly: 'year'
                  }
                  onFormChange({
                    ...form,
                    recurrence: {
                      enabled: true,
                      preset: value as 'daily' | 'weekly' | 'monthly' | 'yearly',
                      interval: 1,
                      unit: unitMap[value],
                      weekDays: [],
                      monthDay: null,
                      useSpecificMonthDay: false
                    }
                  })
                }
              }}
              className="recurrence-select"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom...</option>
            </select>

            {form.recurrence.enabled && form.recurrence.preset === 'custom' && (
              <div className="recurrence-custom">
                <div className="recurrence-interval">
                  <span>Every</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={form.recurrence.interval}
                    onChange={(e) => onFormChange({
                      ...form,
                      recurrence: {
                        ...form.recurrence,
                        interval: Math.max(1, parseInt(e.target.value) || 1)
                      }
                    })}
                    className="interval-input"
                  />
                  <select
                    value={form.recurrence.unit}
                    onChange={(e) => onFormChange({
                      ...form,
                      recurrence: {
                        ...form.recurrence,
                        unit: e.target.value as RecurrenceUnit,
                        weekDays: [],
                        monthDay: null,
                        useSpecificMonthDay: false
                      }
                    })}
                    className="unit-select"
                  >
                    <option value="day">day(s)</option>
                    <option value="week">week(s)</option>
                    <option value="month">month(s)</option>
                    <option value="year">year(s)</option>
                  </select>
                </div>

                {form.recurrence.unit === 'week' && (
                  <div className="weekday-selector">
                    <label>On these days:</label>
                    <div className="weekday-buttons">
                      {DAY_LETTERS.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`weekday-btn ${
                            form.recurrence.weekDays.includes(index as DayOfWeek)
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() => {
                            const currentDays = form.recurrence.weekDays
                            const newDays = currentDays.includes(index as DayOfWeek)
                              ? currentDays.filter(d => d !== index)
                              : [...currentDays, index as DayOfWeek].sort((a, b) => a - b)
                            onFormChange({
                              ...form,
                              recurrence: {
                                ...form.recurrence,
                                weekDays: newDays
                              }
                            })
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.recurrence.unit === 'month' && (
                  <div className="monthday-selector">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.recurrence.useSpecificMonthDay}
                        onChange={(e) => onFormChange({
                          ...form,
                          recurrence: {
                            ...form.recurrence,
                            useSpecificMonthDay: e.target.checked,
                            monthDay: e.target.checked
                              ? (form.recurrence.monthDay || 1)
                              : null
                          }
                        })}
                      />
                      On specific day of month
                    </label>
                    {form.recurrence.useSpecificMonthDay && (
                      <select
                        value={form.recurrence.monthDay || 1}
                        onChange={(e) => onFormChange({
                          ...form,
                          recurrence: {
                            ...form.recurrence,
                            monthDay: parseInt(e.target.value)
                          }
                        })}
                        className="monthday-select"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>
                            {day}{getOrdinalSuffix(day)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            )}

            {form.recurrence.enabled && (
              <div className="recurrence-preview">
                {getRecurrenceDescription(buildRecurrenceConfig(form.recurrence))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Complexity</label>
            <select
              value={form.complexity}
              onChange={(e) => onFormChange({ ...form, complexity: e.target.value as Complexity })}
              className="complexity-select"
            >
              <option value="easy">Easy (quick task)</option>
              <option value="medium">Medium (moderate effort)</option>
              <option value="hard">Hard (significant effort)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onFormChange({ ...form, description: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isUrgent}
                  onChange={(e) => onFormChange({ ...form, isUrgent: e.target.checked })}
                />
                Urgent
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isImportant}
                  onChange={(e) => onFormChange({ ...form, isImportant: e.target.checked })}
                />
                Important
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button onClick={onClose} className="cancel-btn">Cancel</button>
            <button onClick={onSave} className="save-btn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { parseRecurrenceToFormState }
