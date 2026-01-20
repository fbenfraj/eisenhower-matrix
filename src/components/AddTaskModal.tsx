import { useRef, useEffect } from 'react'

interface AddTaskModalProps {
  isOpen: boolean
  isAdding: boolean
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  onClose: () => void
}

export const AddTaskModal = ({
  isOpen,
  isAdding,
  input,
  onInputChange,
  onSubmit,
  onClose
}: AddTaskModalProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
        requestAnimationFrame(() => {
          textareaRef.current?.focus()
        })
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={isAdding ? undefined : onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add Task</h2>
        <div className="modal-form">
          <div className="form-group">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Describe your task... (e.g., 'Submit report by Friday' or 'Learn Spanish for vacation next month')"
              rows={4}
              maxLength={500}
              disabled={isAdding}
              autoFocus
              inputMode="text"
              onTouchEnd={(e) => {
                e.currentTarget.focus()
              }}
            />
            <span className="char-count">{input.length}/500</span>
          </div>
          <div className="modal-actions">
            <button onClick={onClose} className="cancel-btn" disabled={isAdding}>
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="save-btn"
              disabled={isAdding || !input.trim()}
            >
              {isAdding ? 'Processing...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
