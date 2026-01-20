import { useState, useEffect } from 'react'
import type { Quadrant } from '../types'

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 600)
  const [expandedQuadrants, setExpandedQuadrants] = useState<Set<Quadrant>>(
    () => new Set<Quadrant>([
      'urgent-important',
      'not-urgent-important',
      'urgent-not-important',
      'not-urgent-not-important'
    ])
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleQuadrantExpand = (quadrant: Quadrant) => {
    if (!isMobile) return
    setExpandedQuadrants(prev => {
      const next = new Set(prev)
      if (next.has(quadrant)) {
        next.delete(quadrant)
      } else {
        next.add(quadrant)
      }
      return next
    })
  }

  const expandQuadrant = (quadrant: Quadrant) => {
    setExpandedQuadrants(prev => {
      if (prev.has(quadrant)) return prev
      const next = new Set(prev)
      next.add(quadrant)
      return next
    })
  }

  return {
    isMobile,
    expandedQuadrants,
    toggleQuadrantExpand,
    expandQuadrant
  }
}
