import { useState } from 'react'
import type { SuggestedTask, Quadrant } from '../types'

interface SuggestionsCardProps {
  suggestions: SuggestedTask[]
  onAccept: (id: number, quadrant: Quadrant) => Promise<void>
  onSnooze: (id: number) => Promise<void>
  onDismiss: (id: number) => Promise<void>
  onNever: (id: number) => Promise<void>
}

const QUADRANT_OPTIONS: { value: Quadrant; label: string }[] = [
  { value: 'urgent-important', label: 'Do First' },
  { value: 'not-urgent-important', label: 'Schedule' },
  { value: 'urgent-not-important', label: 'Delegate' },
  { value: 'not-urgent-not-important', label: 'Eliminate' }
]

export function SuggestionsCard({
  suggestions,
  onAccept,
  onSnooze,
  onDismiss,
  onNever
}: SuggestionsCardProps) {
  const [selectedQuadrants, setSelectedQuadrants] = useState<Record<number, Quadrant>>({})
  const [loadingStates, setLoadingStates] = useState<Record<number, string>>({})

  if (suggestions.length === 0) return null

  const handleQuadrantChange = (suggestionId: number, quadrant: Quadrant) => {
    setSelectedQuadrants(prev => ({ ...prev, [suggestionId]: quadrant }))
  }

  const handleAccept = async (suggestionId: number) => {
    const quadrant = selectedQuadrants[suggestionId] || 'not-urgent-important'
    setLoadingStates(prev => ({ ...prev, [suggestionId]: 'accepting' }))
    try {
      await onAccept(suggestionId, quadrant)
    } finally {
      setLoadingStates(prev => {
        const next = { ...prev }
        delete next[suggestionId]
        return next
      })
    }
  }

  const handleSnooze = async (suggestionId: number) => {
    setLoadingStates(prev => ({ ...prev, [suggestionId]: 'snoozing' }))
    try {
      await onSnooze(suggestionId)
    } finally {
      setLoadingStates(prev => {
        const next = { ...prev }
        delete next[suggestionId]
        return next
      })
    }
  }

  const handleDismiss = async (suggestionId: number) => {
    setLoadingStates(prev => ({ ...prev, [suggestionId]: 'dismissing' }))
    try {
      await onDismiss(suggestionId)
    } finally {
      setLoadingStates(prev => {
        const next = { ...prev }
        delete next[suggestionId]
        return next
      })
    }
  }

  const handleNever = async (suggestionId: number) => {
    setLoadingStates(prev => ({ ...prev, [suggestionId]: 'blocking' }))
    try {
      await onNever(suggestionId)
    } finally {
      setLoadingStates(prev => {
        const next = { ...prev }
        delete next[suggestionId]
        return next
      })
    }
  }

  return (
    <div className="suggestions-card">
      <div className="suggestions-header">
        <span className="suggestions-icon">💡</span>
        <span className="suggestions-title">Based on your patterns</span>
      </div>
      <div className="suggestions-list">
        {suggestions.map(suggestion => {
          const isLoading = !!loadingStates[suggestion.id]
          const currentQuadrant = selectedQuadrants[suggestion.id] || 'not-urgent-important'

          return (
            <div key={suggestion.id} className="suggestion-item">
              <div className="suggestion-content">
                <span className="suggestion-text">{suggestion.suggestedText}</span>
                <span className="suggestion-why">{suggestion.why}</span>
              </div>
              <div className="suggestion-actions">
                <select
                  className="suggestion-quadrant-select"
                  value={currentQuadrant}
                  onChange={(e) => handleQuadrantChange(suggestion.id, e.target.value as Quadrant)}
                  disabled={isLoading}
                >
                  {QUADRANT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  className="suggestion-btn accept"
                  onClick={() => handleAccept(suggestion.id)}
                  disabled={isLoading}
                >
                  {loadingStates[suggestion.id] === 'accepting' ? '...' : 'Add'}
                </button>
                <button
                  className="suggestion-btn snooze"
                  onClick={() => handleSnooze(suggestion.id)}
                  disabled={isLoading}
                  title="Remind me later"
                >
                  {loadingStates[suggestion.id] === 'snoozing' ? '...' : 'Later'}
                </button>
                <button
                  className="suggestion-btn dismiss"
                  onClick={() => handleDismiss(suggestion.id)}
                  disabled={isLoading}
                  title="Not relevant"
                >
                  {loadingStates[suggestion.id] === 'dismissing' ? '...' : 'Skip'}
                </button>
                <button
                  className="suggestion-btn never"
                  onClick={() => handleNever(suggestion.id)}
                  disabled={isLoading}
                  title="Never suggest this again"
                >
                  {loadingStates[suggestion.id] === 'blocking' ? '...' : 'Never'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
