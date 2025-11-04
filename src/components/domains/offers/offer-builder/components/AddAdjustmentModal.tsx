'use client'

import { useState } from 'react'
import Button from '@/components/shared/ui/button/Button'

interface AddAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (message: string) => void
  targetName: string
  targetType: 'item' | 'block'
}

export function AddAdjustmentModal({ isOpen, onClose, onAdd, targetName, targetType }: AddAdjustmentModalProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    onAdd(message)
    setMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Add Adjustment</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Request a change to <span className="font-medium text-gray-900 dark:text-gray-100">{targetName}</span>
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                What needs to be adjusted?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the change you'd like to see..."
                rows={4}
                className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                autoFocus
                required
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-400">
              <strong className="flex items-center gap-2 mb-1">
                <span>💡</span> Quick tip
              </strong>
              <p className="text-xs">
                Be specific about what you'd like changed. This helps the caterer respond faster!
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!message.trim()}
              className="rounded-full px-8 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
            >
              Add Adjustment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
