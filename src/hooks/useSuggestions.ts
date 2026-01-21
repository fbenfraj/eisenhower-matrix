import { useState, useCallback } from 'react'
import type { SuggestedTask, Quadrant } from '../types'
import * as suggestionsApi from '../services/suggestions'

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([])
  const [hasShownThisSession, setHasShownThisSession] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadSuggestions = useCallback(async () => {
    if (hasShownThisSession) return

    setIsLoading(true)
    try {
      const data = await suggestionsApi.fetchSuggestions()
      setSuggestions(data)
      if (data.length > 0) {
        setHasShownThisSession(true)
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [hasShownThisSession])

  const acceptSuggestion = useCallback(async (id: number, quadrant: Quadrant) => {
    try {
      const response = await suggestionsApi.acceptSuggestion(id, quadrant)
      setSuggestions(prev => prev.filter(s => s.id !== id))
      return response.task
    } catch (error) {
      console.error('Failed to accept suggestion:', error)
      throw error
    }
  }, [])

  const snoozeSuggestion = useCallback(async (id: number) => {
    try {
      await suggestionsApi.snoozeSuggestion(id)
      setSuggestions(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Failed to snooze suggestion:', error)
      throw error
    }
  }, [])

  const dismissSuggestion = useCallback(async (id: number) => {
    try {
      await suggestionsApi.dismissSuggestion(id)
      setSuggestions(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error)
      throw error
    }
  }, [])

  const neverSuggestion = useCallback(async (id: number) => {
    try {
      await suggestionsApi.neverSuggestion(id)
      setSuggestions(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Failed to block suggestion:', error)
      throw error
    }
  }, [])

  return {
    suggestions,
    isLoading,
    loadSuggestions,
    acceptSuggestion,
    snoozeSuggestion,
    dismissSuggestion,
    neverSuggestion
  }
}
