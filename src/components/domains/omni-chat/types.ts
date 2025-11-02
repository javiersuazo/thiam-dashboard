export type ChatMode = 'minimized' | 'docked' | 'floating' | 'fullscreen'

export type DockPosition = 'left' | 'right' | 'bottom'

export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageContentType = 'text' | 'component' | 'table' | 'chart' | 'form'

export interface Position {
  x: number
  y: number
}

export interface ComponentData {
  type: string
  props: Record<string, unknown>
}

export interface TableData {
  headers: string[]
  rows: Array<Record<string, unknown>>
}

export interface MessageContent {
  type: MessageContentType
  text?: string
  component?: ComponentData
  table?: TableData
  data?: unknown
}

export interface Message {
  id: string
  role: MessageRole
  content: MessageContent[]
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatState {
  mode: ChatMode
  dockPosition?: DockPosition
  floatingPosition?: Position
  isExpanded: boolean
  isDragging: boolean
  messages: Message[]
  inputValue: string
  isLoading: boolean
}

export interface ChatSettings {
  showTimestamp: boolean
  enableSounds: boolean
  animationsEnabled: boolean
  defaultMode: ChatMode
  defaultDockPosition: DockPosition
}

export const DEFAULT_CHAT_STATE: ChatState = {
  mode: 'minimized',
  dockPosition: 'right',
  floatingPosition: { x: window.innerWidth - 100, y: window.innerHeight - 100 },
  isExpanded: false,
  isDragging: false,
  messages: [],
  inputValue: '',
  isLoading: false,
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  showTimestamp: true,
  enableSounds: true,
  animationsEnabled: true,
  defaultMode: 'docked',
  defaultDockPosition: 'right',
}
