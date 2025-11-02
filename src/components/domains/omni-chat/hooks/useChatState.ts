import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMode, DockPosition, Position, Message, ChatState } from '../types'
import { DEFAULT_CHAT_STATE } from '../types'

interface UseChatStateProps {
  initialMode?: ChatMode
  initialDockPosition?: DockPosition
  onModeChange?: (mode: ChatMode) => void
}

export function useChatState({
  initialMode = 'minimized',
  initialDockPosition = 'right',
  onModeChange,
}: UseChatStateProps = {}) {
  const [mode, setMode] = useState<ChatMode>(initialMode)
  const [dockPosition, setDockPosition] = useState<DockPosition>(initialDockPosition)
  const [floatingPosition, setFloatingPosition] = useState<Position>(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }
    return {
      x: window.innerWidth - 40,
      y: window.innerHeight - 40,
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
    } else if (newMode === 'docked' || newMode === 'floating') {
      setIsExpanded(true)
    } else if (newMode === 'fullscreen') {
      setIsExpanded(true)
    }
    onModeChange?.(newMode)
  }, [onModeChange])

  const toggleMinimize = useCallback(() => {
    if (mode === 'minimized') {
      changeMode('docked')
    } else {
      changeMode('minimized')
    }
  }, [mode, changeMode])

  const toggleFullscreen = useCallback(() => {
    if (mode === 'fullscreen') {
      changeMode('docked')
    } else {
      changeMode('fullscreen')
    }
  }, [mode, changeMode])

  const changeDockPosition = useCallback((position: DockPosition) => {
    setDockPosition(position)
    if (mode !== 'docked') {
      changeMode('docked')
    }
  }, [mode, changeMode])

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true)
    dragStartPos.current = { x: clientX, y: clientY }
    chatStartPos.current = { ...floatingPosition }
  }, [floatingPosition])

  const onDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return

    const deltaX = clientX - dragStartPos.current.x
    const deltaY = clientY - dragStartPos.current.y

    const newX = chatStartPos.current.x + deltaX
    const newY = chatStartPos.current.y + deltaY

    setFloatingPosition({ x: newX, y: newY })
  }, [isDragging])

  const endDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(false)

    const threshold = 50
    if (typeof window === 'undefined') return

    if (clientX < threshold) {
      changeDockPosition('left')
    } else if (clientX > window.innerWidth - threshold) {
      changeDockPosition('right')
    } else if (clientY > window.innerHeight - threshold) {
      changeDockPosition('bottom')
    } else {
      if (mode !== 'floating') {
        changeMode('floating')
      }
    }
  }, [mode, changeMode, changeDockPosition])

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
        changeMode('docked')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, changeMode])

  const chatState: ChatState = {
    mode,
    dockPosition,
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
    toggleFullscreen,
    changeDockPosition,
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
