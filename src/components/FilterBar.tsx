import { QUADRANT_SHORT_LABELS } from '../constants'
import type { Quadrant, Task } from '../types'

interface FilterBarProps {
  nonEmptyQuadrants: Quadrant[]
  expandedQuadrants: Set<Quadrant>
  visibleTasks: Record<Quadrant, Task[]>
  onToggleQuadrant: (quadrant: Quadrant) => void
}

export const FilterBar = ({
  nonEmptyQuadrants,
  expandedQuadrants,
  visibleTasks,
  onToggleQuadrant
}: FilterBarProps) => {
  return (
    <div className="filter-bar">
      {nonEmptyQuadrants.map(quadrant => (
        <button
          key={quadrant}
          className={`filter-chip ${quadrant}${expandedQuadrants.has(quadrant) ? ' active' : ''}`}
          onClick={() => onToggleQuadrant(quadrant)}
        >
          {QUADRANT_SHORT_LABELS[quadrant]}
          <span className="filter-count">{visibleTasks[quadrant].length}</span>
        </button>
      ))}
    </div>
  )
}
