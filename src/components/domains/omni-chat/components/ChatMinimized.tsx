'use client'

import type { Position } from '../types'

interface ChatMinimizedProps {
  position: Position
  onClick: () => void
}

export function ChatMinimized({ position, onClick }: ChatMinimizedProps) {
  return (
    <button
      onClick={onClick}
      className="fixed z-[9999] w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group"
      style={{
        right: '24px',
        bottom: '24px',
      }}
    >
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>

      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></div>

      <div className="absolute inset-0 rounded-full bg-brand-400 opacity-0 group-hover:opacity-20 transition-opacity animate-ping"></div>
    </button>
  )
}
