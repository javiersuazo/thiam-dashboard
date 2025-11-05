'use client'

import { useState } from 'react'
import type { OfferAdjustment } from '../types'
import Button from '@/components/shared/ui/button/Button'
import Badge from '@/components/shared/ui/badge/Badge'

interface AdjustmentThreadProps {
  adjustment: OfferAdjustment
  onAddComment: (message: string) => void
  onResolve: () => void
}

export function AdjustmentThread({ adjustment, onAddComment, onResolve }: AdjustmentThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    onAddComment(newComment)
    setNewComment('')
    setIsReplying(false)
  }

  const getAuthorColor = (type: 'customer' | 'caterer' | 'staff') => {
    switch (type) {
      case 'customer': return 'text-blue-600 dark:text-blue-400'
      case 'caterer': return 'text-green-600 dark:text-green-400'
      case 'staff': return 'text-purple-600 dark:text-purple-400'
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
      {/* Thread Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-semibold ${getAuthorColor(adjustment.requestedByType)}`}>
                {adjustment.requestedByType === 'customer' ? '👤' : adjustment.requestedByType === 'caterer' ? '👨‍🍳' : '👔'} {adjustment.requestedByType}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(adjustment.requestedAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{adjustment.changeDescription}</p>
          </div>
          <Badge
            variant="light"
            color={adjustment.status === 'pending' ? 'warning' : 'success'}
            size="sm"
            className="rounded-full flex-shrink-0"
          >
            {adjustment.status}
          </Badge>
        </div>
      </div>

      {/* Comments */}
      {adjustment.comments.length > 0 && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {adjustment.comments.map((comment) => (
            <div key={comment.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
                  {comment.authorType === 'customer' ? '👤' : comment.authorType === 'caterer' ? '👨‍🍳' : '👔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${getAuthorColor(comment.authorType)}`}>
                      {comment.authorType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {adjustment.status === 'pending' && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {isReplying ? (
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a reply..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="rounded-full px-4 text-xs"
                >
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                  className="rounded-full px-4 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={onResolve}
                  className="rounded-full px-4 text-xs ml-auto"
                >
                  ✓ Resolve
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReplying(true)}
                className="rounded-full px-4 text-xs flex-1"
              >
                💬 Reply
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={onResolve}
                className="rounded-full px-4 text-xs"
              >
                ✓ Resolve
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Resolved State */}
      {adjustment.status === 'approved' && (
        <div className="p-4 bg-green-50 dark:bg-green-900/10 border-t border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <span className="text-lg">✓</span>
            <span className="font-medium">Resolved</span>
          </div>
        </div>
      )}
    </div>
  )
}
