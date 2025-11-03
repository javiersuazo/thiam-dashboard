'use client'

import type { Position } from '../types'

interface ChatMinimizedProps {
  position: Position
  onClick: () => void
}

export function ChatMinimized({ position, onClick }: ChatMinimizedProps) {
  return (
    <div className="fixed z-[9999]" style={{ right: '24px', bottom: '24px' }}>
      {/* Ambient glow ring */}
      <div className="absolute inset-0 rounded-full">
        <div className="absolute inset-0 rounded-full bg-brand-500/30 animate-[ping_3s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 rounded-full bg-brand-400/20 animate-[ping_3s_ease-in-out_infinite_1s]"></div>
      </div>

      {/* Main button */}
      <button
        onClick={onClick}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 shadow-2xl hover:shadow-brand-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group animate-[breath_4s_ease-in-out_infinite]"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-[shimmer_2s_linear_infinite]"></div>

        {/* Icon with subtle animation */}
        <svg
          className="w-8 h-8 text-white relative z-10 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            className="animate-[float_3s_ease-in-out_infinite]"
          />
        </svg>

        {/* Online indicator with enhanced pulse */}
        <div className="absolute -top-1 -right-1 z-20">
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-[heartbeat_2s_ease-in-out_infinite]"></div>
          </div>
        </div>

        {/* Hover ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1 h-1 bg-brand-400 rounded-full animate-[float_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-brand-300 rounded-full animate-[float_5s_ease-in-out_infinite_1s]"></div>
        <div className="absolute top-2 left-0 w-0.5 h-0.5 bg-brand-500 rounded-full animate-[float_3s_ease-in-out_infinite_2s]"></div>
      </div>

      <style jsx>{`
        @keyframes breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
