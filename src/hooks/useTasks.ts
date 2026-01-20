import { useState, useEffect } from 'react'
import type { Quadrant, Task } from '../types'
import { STORAGE_KEY, VALID_COMPLEXITIES, VALID_QUADRANTS } from '../constants'
import { calculateNextDeadline } from '../utils/recurrence'
import { isTaskVisible } from '../utils/task'
import { addTaskWithAI, sortTasksWithAI } from '../services/ai'
import { validateRecurrence } from '../utils/validation'

type TasksState = Record<Quadrant, Task[]>

const getInitialTasks = (): TasksState => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    return JSON.parse(saved)
  }
  return {
    'urgent-important': [],
    'not-urgent-important': [],
    'urgent-not-important': [],
    'not-urgent-not-important': []
  }
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<TasksState>(getInitialTasks)
  const [isAiSorting, setIsAiSorting] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = async (input: string) => {
    const trimmedInput = input.trim()

    if (trimmedInput === '') {
      setError('Please describe your task')
      return false
    }

    if (trimmedInput.length > 500) {
      setError('Input must be 500 characters or less')
      return false
    }

    setIsAddingTask(true)
    setError('')

    try {
      const { task, quadrant } = await addTaskWithAI(trimmedInput)

      setTasks(prev => ({
        ...prev,
        [quadrant]: [...prev[quadrant], task]
      }))

      return true
    } catch (err) {
      console.error('AI categorization error:', err)
      setError('Failed to process task. Please try again.')
      return false
    } finally {
      setIsAddingTask(false)
    }
  }

  const removeTask = (quadrant: Quadrant, taskId: number) => {
    setTasks(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter(task => task.id !== taskId)
    }))
  }

  const toggleComplete = (quadrant: Quadrant, taskId: number) => {
    setTasks(prev => {
      const task = prev[quadrant].find(t => t.id === taskId)
      if (!task) return prev

      const isCompleting = !task.completed
      const today = new Date().toISOString().split('T')[0]

      if (isCompleting && task.recurrence) {
        const nextOccurrenceDate = calculateNextDeadline(today, task.recurrence)

        const nextDeadline = task.deadline
          ? calculateNextDeadline(task.deadline, task.recurrence)
          : undefined

        const nextTask: Task = {
          id: Date.now(),
          text: task.text,
          description: task.description,
          deadline: nextDeadline,
          completed: false,
          recurrence: task.recurrence,
          complexity: task.complexity,
          showAfter: nextOccurrenceDate
        }

        return {
          ...prev,
          [quadrant]: [
            ...prev[quadrant].map(t =>
              t.id === taskId ? { ...t, completed: true, completedAt: today } : t
            ),
            nextTask
          ]
        }
      }

      return {
        ...prev,
        [quadrant]: prev[quadrant].map(t =>
          t.id === taskId ? {
            ...t,
            completed: !t.completed,
            completedAt: isCompleting ? today : undefined
          } : t
        )
      }
    })
  }

  const updateTask = (originalQuadrant: Quadrant, updatedTask: Task, newQuadrant: Quadrant) => {
    if (newQuadrant !== originalQuadrant) {
      setTasks(prev => ({
        ...prev,
        [originalQuadrant]: prev[originalQuadrant].filter(task => task.id !== updatedTask.id),
        [newQuadrant]: [...prev[newQuadrant], updatedTask]
      }))
    } else {
      setTasks(prev => ({
        ...prev,
        [originalQuadrant]: prev[originalQuadrant].map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      }))
    }
  }

  const autoSortWithAI = async () => {
    const allTasks: (Task & { currentQuadrant: Quadrant })[] = []
    Object.entries(tasks).forEach(([quadrant, taskList]) => {
      taskList.forEach(task => {
        allTasks.push({ ...task, currentQuadrant: quadrant as Quadrant })
      })
    })

    if (allTasks.length === 0) {
      setError('No tasks to sort')
      return
    }

    setIsAiSorting(true)
    setError('')

    try {
      const sortedTasks = await sortTasksWithAI(allTasks)

      const newTasks: TasksState = {
        'urgent-important': [],
        'not-urgent-important': [],
        'urgent-not-important': [],
        'not-urgent-not-important': []
      }

      sortedTasks.forEach(categorized => {
        const originalTask = allTasks.find(t => t.text === categorized.text)
        if (originalTask) {
          const complexity = VALID_COMPLEXITIES.includes(categorized.complexity)
            ? categorized.complexity
            : 'medium'
          const quadrant = VALID_QUADRANTS.includes(categorized.quadrant)
            ? categorized.quadrant
            : originalTask.currentQuadrant

          const aiRecurrence = validateRecurrence(categorized.recurrence)
          const recurrence = aiRecurrence !== null ? aiRecurrence : originalTask.recurrence

          newTasks[quadrant].push({
            id: originalTask.id,
            text: originalTask.text,
            description: originalTask.description,
            deadline: originalTask.deadline,
            completed: originalTask.completed,
            recurrence: recurrence || undefined,
            completedAt: originalTask.completedAt,
            complexity
          })
        }
      })

      setTasks(newTasks)
    } catch (err) {
      console.error('AI sorting error:', err)
      setError('Failed to sort tasks with AI. Please try again.')
    } finally {
      setIsAiSorting(false)
    }
  }

  const visibleTasks: TasksState = {
    'urgent-important': tasks['urgent-important'].filter(isTaskVisible),
    'not-urgent-important': tasks['not-urgent-important'].filter(isTaskVisible),
    'urgent-not-important': tasks['urgent-not-important'].filter(isTaskVisible),
    'not-urgent-not-important': tasks['not-urgent-not-important'].filter(isTaskVisible)
  }

  const nonEmptyQuadrants = (Object.keys(visibleTasks) as Quadrant[]).filter(
    q => visibleTasks[q].length > 0
  )

  const totalTasks = Object.values(visibleTasks).reduce((sum, arr) => sum + arr.length, 0)

  return {
    tasks,
    visibleTasks,
    nonEmptyQuadrants,
    totalTasks,
    isAiSorting,
    isAddingTask,
    error,
    setError,
    addTask,
    removeTask,
    toggleComplete,
    updateTask,
    autoSortWithAI
  }
}
