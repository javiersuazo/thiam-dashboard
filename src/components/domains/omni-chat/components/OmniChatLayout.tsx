'use client'

import { useState, type ReactNode } from 'react'
import { OmniChat, type ChatStateInfo } from './OmniChat'
import type { ChatMode } from '../types'

interface OmniChatLayoutProps {
  children: ReactNode
  initialMode?: ChatMode
  onMessageSent?: (message: string) => void
}

export function OmniChatLayout({
  children,
  initialMode = 'minimized',
  onMessageSent,
}: OmniChatLayoutProps) {
  const [chatState, setChatState] = useState<ChatStateInfo>({
    mode: initialMode,
    isExpanded: false,
  })

  const isFullscreen = chatState.mode === 'fullscreen'
  const isSidebarOpen = chatState.mode === 'sidebar'

  return (
    <div className="relative w-full h-full flex">
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'mr-[500px] md:mr-[600px] lg:mr-[700px]' : 'mr-0'
        }`}
        style={{ display: isFullscreen ? 'none' : undefined }}
      >
        {children}
      </div>

      <OmniChat
        initialMode={initialMode}
        onMessageSent={onMessageSent}
        onStateChange={setChatState}
      />
    </div>
  )
}
