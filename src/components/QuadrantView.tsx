import { COMPLEXITY_ORDER, QUADRANT_CONFIG } from '../constants'
import type { Quadrant, Task } from '../types'

interface QuadrantViewProps {
  quadrant: Quadrant
  tasks: Task[]
  isMobile: boolean
  isExpanded: boolean
  onToggleComplete: (taskId: number) => void
  onEditTask: (task: Task) => void
  onRemoveTask: (taskId: number) => void
}

export const QuadrantView = ({
  quadrant,
  tasks,
  isMobile,
  isExpanded,
  onToggleComplete,
  onEditTask,
  onRemoveTask
}: QuadrantViewProps) => {
  if (isMobile && !isExpanded) {
    return null
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const aComplexity = COMPLEXITY_ORDER[a.complexity || 'medium']
    const bComplexity = COMPLEXITY_ORDER[b.complexity || 'medium']
    return aComplexity - bComplexity
  })

  return (
    <div className={`quadrant ${quadrant}${isMobile ? ' expanded' : ''}`}>
      <div className="quadrant-header">
        <div className="quadrant-header-left">
          <h2>{QUADRANT_CONFIG[quadrant].title}</h2>
          <span className="quadrant-label">{QUADRANT_CONFIG[quadrant].label}</span>
        </div>
      </div>

      <ul>
        {sortedTasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
            />
            <div className="task-content" onClick={() => onEditTask(task)}>
              {task.recurrence && <span className="recurrence-icon">↻</span>}
              {task.complexity && (
                <span className={`complexity-badge complexity-${task.complexity}`}>●</span>
              )}
              <span className="task-text">{task.text}</span>
              {task.deadline && (
                <span className="task-deadline">
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
            <button className="delete-btn" onClick={() => onRemoveTask(task.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
