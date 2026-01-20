import { useState } from 'react'
import './App.css'
import { DEFAULT_RECURRENCE_FORM } from './constants'
import type { Complexity, Quadrant, Task, RecurrenceFormState } from './types'
import { buildRecurrenceConfig } from './utils/recurrence'
import { useTasks } from './hooks/useTasks'
import { useMobile } from './hooks/useMobile'
import {
  AddTaskModal,
  EditTaskModal,
  parseRecurrenceToFormState,
  FAB,
  FilterBar,
  QuadrantView
} from './components'

interface EditFormState {
  text: string
  description: string
  deadline: string
  isUrgent: boolean
  isImportant: boolean
  recurrence: RecurrenceFormState
  complexity: Complexity
}

function App() {
  const {
    visibleTasks,
    nonEmptyQuadrants,
    totalTasks,
    isLoading,
    isAiSorting,
    isAddingTask,
    error,
    setError,
    addTask,
    removeTask,
    toggleComplete,
    updateTask,
    autoSortWithAI
  } = useTasks()

  const { isMobile, expandedQuadrants, toggleQuadrantExpand } = useMobile()

  const [isFabOpen, setIsFabOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addInput, setAddInput] = useState('')

  const [editingTask, setEditingTask] = useState<{ task: Task; quadrant: Quadrant } | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({
    text: '',
    description: '',
    deadline: '',
    isUrgent: false,
    isImportant: false,
    recurrence: { ...DEFAULT_RECURRENCE_FORM },
    complexity: 'medium'
  })

  const openAddModal = () => {
    setIsFabOpen(false)
    setShowAddModal(true)
    setError('')
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    setAddInput('')
    setError('')
  }

  const handleAddTask = async () => {
    const success = await addTask(addInput)
    if (success) {
      setAddInput('')
      setShowAddModal(false)
    }
  }

  const openEditModal = (task: Task, quadrant: Quadrant) => {
    setEditingTask({ task, quadrant })
    const isUrgent = quadrant === 'urgent-important' || quadrant === 'urgent-not-important'
    const isImportant = quadrant === 'urgent-important' || quadrant === 'not-urgent-important'

    setEditForm({
      text: task.text,
      description: task.description || '',
      deadline: task.deadline || '',
      isUrgent,
      isImportant,
      recurrence: parseRecurrenceToFormState(task.recurrence || null),
      complexity: task.complexity || 'medium'
    })
  }

  const closeEditModal = () => {
    setEditingTask(null)
    setEditForm({
      text: '',
      description: '',
      deadline: '',
      isUrgent: false,
      isImportant: false,
      recurrence: { ...DEFAULT_RECURRENCE_FORM },
      complexity: 'medium'
    })
  }

  const saveTaskEdit = () => {
    if (!editingTask) return

    if (editForm.text.trim() === '') {
      setError('Task name cannot be empty')
      return
    }

    let newQuadrant: Quadrant
    if (editForm.isUrgent && editForm.isImportant) {
      newQuadrant = 'urgent-important'
    } else if (!editForm.isUrgent && editForm.isImportant) {
      newQuadrant = 'not-urgent-important'
    } else if (editForm.isUrgent && !editForm.isImportant) {
      newQuadrant = 'urgent-not-important'
    } else {
      newQuadrant = 'not-urgent-not-important'
    }

    const builtRecurrence = buildRecurrenceConfig(editForm.recurrence)
    const updatedTask: Task = {
      ...editingTask.task,
      text: editForm.text.trim(),
      description: editForm.description.trim() || undefined,
      deadline: editForm.deadline || undefined,
      recurrence: builtRecurrence || undefined,
      complexity: editForm.complexity
    }

    updateTask(editingTask.quadrant, updatedTask, newQuadrant)
    closeEditModal()
  }

  const handleAutoSort = () => {
    setIsFabOpen(false)
    autoSortWithAI()
  }

  return (
    <div className="app">
      {isLoading ? (
        <div className="empty-state">
          <p>Loading tasks...</p>
        </div>
      ) : totalTasks === 0 ? (
        <div className="empty-state">
          <p>Add a task to start</p>
        </div>
      ) : (
        <>
          {isMobile && (
            <FilterBar
              nonEmptyQuadrants={nonEmptyQuadrants}
              expandedQuadrants={expandedQuadrants}
              visibleTasks={visibleTasks}
              onToggleQuadrant={toggleQuadrantExpand}
            />
          )}
          <div className={`matrix quadrants-${nonEmptyQuadrants.length}`}>
            {nonEmptyQuadrants.map(quadrant => (
              <QuadrantView
                key={quadrant}
                quadrant={quadrant}
                tasks={visibleTasks[quadrant]}
                isMobile={isMobile}
                isExpanded={expandedQuadrants.has(quadrant)}
                onToggleExpand={() => toggleQuadrantExpand(quadrant)}
                onToggleComplete={(taskId) => toggleComplete(quadrant, taskId)}
                onEditTask={(task) => openEditModal(task, quadrant)}
                onRemoveTask={(taskId) => removeTask(quadrant, taskId)}
              />
            ))}
          </div>
        </>
      )}

      <FAB
        isOpen={isFabOpen}
        isAiSorting={isAiSorting}
        onToggle={() => setIsFabOpen(!isFabOpen)}
        onAddTask={openAddModal}
        onAutoSort={handleAutoSort}
      />

      {isAiSorting && (
        <div className="sorting-overlay">
          <div className="sorting-spinner"></div>
          <p>Sorting with AI...</p>
        </div>
      )}

      {error && (
        <div className="error-toast" onClick={() => setError('')}>
          {error}
        </div>
      )}

      <AddTaskModal
        isOpen={showAddModal}
        isAdding={isAddingTask}
        input={addInput}
        onInputChange={setAddInput}
        onSubmit={handleAddTask}
        onClose={closeAddModal}
      />

      {editingTask && (
        <EditTaskModal
          task={editingTask.task}
          quadrant={editingTask.quadrant}
          form={editForm}
          onFormChange={setEditForm}
          onSave={saveTaskEdit}
          onClose={closeEditModal}
        />
      )}
    </div>
  )
}

export default App
