'use client'

import { useState, type ReactNode } from 'react'
import { OmniChat, type ChatStateInfo } from './OmniChat'
import type { ChatMode, DockPosition } from '../types'

interface OmniChatLayoutProps {
  children: ReactNode
  initialMode?: ChatMode
  initialDockPosition?: DockPosition
  onMessageSent?: (message: string) => void
}

export function OmniChatLayout({
  children,
  initialMode = 'minimized',
  initialDockPosition = 'right',
  onMessageSent,
}: OmniChatLayoutProps) {
  const [chatState, setChatState] = useState<ChatStateInfo>({
    mode: initialMode,
    dockPosition: initialDockPosition,
    isExpanded: false,
  })

  const isDocked = chatState.mode === 'docked' && chatState.isExpanded
  const isFullscreen = chatState.mode === 'fullscreen'

  const getLayoutStyles = () => {
    if (isFullscreen) {
      return {
        display: 'none',
      }
    }

    if (isDocked) {
      const baseStyles = {
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }

      switch (chatState.dockPosition) {
        case 'left':
          return {
            ...baseStyles,
            marginLeft: '384px',
          }
        case 'right':
          return {
            ...baseStyles,
            marginRight: '384px',
          }
        case 'bottom':
          return {
            ...baseStyles,
            marginBottom: '384px',
          }
        default:
          return baseStyles
      }
    }

    return {
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }

  return (
    <div className="relative w-full h-full">
      <div style={getLayoutStyles()}>
        {children}
      </div>

      <OmniChat
        initialMode={initialMode}
        initialDockPosition={initialDockPosition}
        onMessageSent={onMessageSent}
        onStateChange={setChatState}
      />
    </div>
  )
}
