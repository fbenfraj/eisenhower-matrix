import { useState, useEffect, useCallback } from 'react'
import type { Quadrant, Task } from '../types'
import { VALID_COMPLEXITIES, VALID_QUADRANTS } from '../constants'
import { calculateNextDeadline } from '../utils/recurrence'
import { isTaskVisible } from '../utils/task'
import { addTaskWithAI, sortTasksWithAI } from '../services/ai'
import { validateRecurrence } from '../utils/validation'
import * as api from '../services/api'

type TasksState = Record<Quadrant, Task[]>

const emptyTasksState: TasksState = {
  'urgent-important': [],
  'not-urgent-important': [],
  'urgent-not-important': [],
  'not-urgent-not-important': []
}

function groupTasksByQuadrant(tasks: api.ApiTask[]): TasksState {
  const grouped: TasksState = {
    'urgent-important': [],
    'not-urgent-important': [],
    'urgent-not-important': [],
    'not-urgent-not-important': []
  }
  for (const task of tasks) {
    const { quadrant, ...taskWithoutQuadrant } = task
    if (grouped[quadrant]) {
      grouped[quadrant].push(taskWithoutQuadrant)
    }
  }
  return grouped
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<TasksState>(emptyTasksState)
  const [isLoading, setIsLoading] = useState(true)
  const [isAiSorting, setIsAiSorting] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [error, setError] = useState('')

  const loadTasks = useCallback(async () => {
    try {
      const apiTasks = await api.fetchTasks()
      setTasks(groupTasksByQuadrant(apiTasks))
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setError('Failed to load tasks from server')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

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

      const createdTask = await api.createTask({
        text: task.text,
        description: task.description,
        deadline: task.deadline,
        quadrant,
        complexity: task.complexity,
        showAfter: task.showAfter,
        recurrence: task.recurrence,
      })

      setTasks(prev => ({
        ...prev,
        [quadrant]: [...prev[quadrant], { ...createdTask, id: createdTask.id }]
      }))

      return true
    } catch (err) {
      console.error('Failed to add task:', err)
      setError('Failed to add task. Please try again.')
      return false
    } finally {
      setIsAddingTask(false)
    }
  }

  const removeTask = async (quadrant: Quadrant, taskId: number) => {
    try {
      await api.deleteTask(taskId)
      setTasks(prev => ({
        ...prev,
        [quadrant]: prev[quadrant].filter(task => task.id !== taskId)
      }))
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError('Failed to delete task')
    }
  }

  const toggleComplete = async (quadrant: Quadrant, taskId: number) => {
    const task = tasks[quadrant].find(t => t.id === taskId)
    if (!task) return

    const isCompleting = !task.completed
    const today = new Date().toISOString().split('T')[0]

    try {
      if (isCompleting && task.recurrence) {
        const nextOccurrenceDate = calculateNextDeadline(today, task.recurrence)
        const nextDeadline = task.deadline
          ? calculateNextDeadline(task.deadline, task.recurrence)
          : undefined

        await api.updateTask(taskId, { completed: true, completedAt: today })

        const nextTask = await api.createTask({
          text: task.text,
          description: task.description,
          deadline: nextDeadline,
          quadrant,
          recurrence: task.recurrence,
          complexity: task.complexity,
          showAfter: nextOccurrenceDate
        })

        setTasks(prev => ({
          ...prev,
          [quadrant]: [
            ...prev[quadrant].map(t =>
              t.id === taskId ? { ...t, completed: true, completedAt: today } : t
            ),
            nextTask
          ]
        }))
      } else {
        await api.updateTask(taskId, {
          completed: isCompleting,
          completedAt: isCompleting ? today : undefined
        })

        setTasks(prev => ({
          ...prev,
          [quadrant]: prev[quadrant].map(t =>
            t.id === taskId ? {
              ...t,
              completed: !t.completed,
              completedAt: isCompleting ? today : undefined
            } : t
          )
        }))
      }
    } catch (err) {
      console.error('Failed to toggle task completion:', err)
      setError('Failed to update task')
    }
  }

  const updateTask = async (originalQuadrant: Quadrant, updatedTask: Task, newQuadrant: Quadrant) => {
    try {
      await api.updateTask(updatedTask.id, {
        ...updatedTask,
        quadrant: newQuadrant
      })

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
    } catch (err) {
      console.error('Failed to update task:', err)
      setError('Failed to update task')
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

      const updatePromises: Promise<void>[] = []

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

          const updatedTask = {
            id: originalTask.id,
            text: originalTask.text,
            description: originalTask.description,
            deadline: originalTask.deadline,
            completed: originalTask.completed,
            recurrence: recurrence || undefined,
            completedAt: originalTask.completedAt,
            complexity
          }

          newTasks[quadrant].push(updatedTask)

          if (quadrant !== originalTask.currentQuadrant || complexity !== originalTask.complexity) {
            updatePromises.push(
              api.updateTask(originalTask.id, { quadrant, complexity }).then(() => {})
            )
          }
        }
      })

      await Promise.all(updatePromises)
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
  }
}
