import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMode, Position, Message, ChatState } from '../types'
import { DEFAULT_CHAT_STATE } from '../types'

interface UseChatStateProps {
  initialMode?: ChatMode
  onModeChange?: (mode: ChatMode) => void
}

export function useChatState({
  initialMode = 'minimized',
  onModeChange,
}: UseChatStateProps = {}) {
  const [mode, setMode] = useState<ChatMode>(initialMode)
  const [floatingPosition, setFloatingPosition] = useState<Position>(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }

    const chatWidth = 500
    const chatHeight = 700
    const padding = 20

    return {
      x: window.innerWidth - chatWidth / 2 - padding - 40,
      y: window.innerHeight - chatHeight / 2 - padding - 40,
    }
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const dragStartPos = useRef<Position>({ x: 0, y: 0 })
  const chatStartPos = useRef<Position>({ x: 0, y: 0 })

  const changeMode = useCallback((newMode: ChatMode) => {
    setMode(newMode)
    if (newMode === 'minimized') {
      setIsExpanded(false)
    } else if (newMode === 'floating' || newMode === 'fullscreen' || newMode === 'sidebar') {
      setIsExpanded(true)
    }
    onModeChange?.(newMode)
  }, [onModeChange])

  const toggleMinimize = useCallback(() => {
    if (mode === 'minimized') {
      changeMode('floating')
    } else {
      changeMode('minimized')
    }
  }, [mode, changeMode])

  const toggleSidebar = useCallback(() => {
    if (mode === 'minimized') {
      changeMode('sidebar')
    } else {
      changeMode('minimized')
    }
  }, [mode, changeMode])

  const toggleFullscreen = useCallback(() => {
    if (mode === 'fullscreen') {
      changeMode('sidebar')
    } else {
      changeMode('fullscreen')
    }
  }, [mode, changeMode])

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true)
    dragStartPos.current = { x: clientX, y: clientY }
    chatStartPos.current = { ...floatingPosition }
  }, [floatingPosition])

  const onDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return
    if (typeof window === 'undefined') return

    const deltaX = clientX - dragStartPos.current.x
    const deltaY = clientY - dragStartPos.current.y

    let newX = chatStartPos.current.x + deltaX
    let newY = chatStartPos.current.y + deltaY

    const chatWidth = 500
    const chatHeight = 700
    const padding = 20

    const minX = chatWidth / 2 + padding
    const maxX = window.innerWidth - chatWidth / 2 - padding
    const minY = chatHeight / 2 + padding
    const maxY = window.innerHeight - chatHeight / 2 - padding

    newX = Math.max(minX, Math.min(maxX, newX))
    newY = Math.max(minY, Math.min(maxY, newY))

    setFloatingPosition({ x: newX, y: newY })
  }, [isDragging])

  const endDrag = useCallback(() => {
    setIsDragging(false)
  }, [])

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg))
    )
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const setInput = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  const clearInput = useCallback(() => {
    setInputValue('')
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'fullscreen') {
        changeMode('floating')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, changeMode])

  const chatState: ChatState = {
    mode,
    floatingPosition,
    isExpanded,
    isDragging,
    messages,
    inputValue,
    isLoading,
  }

  return {
    ...chatState,
    changeMode,
    toggleMinimize,
    toggleSidebar,
    toggleFullscreen,
    startDrag,
    onDrag,
    endDrag,
    addMessage,
    updateMessage,
    clearMessages,
    setInput,
    clearInput,
    setLoading,
  }
}
