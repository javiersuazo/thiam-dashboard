# OmniChat Domain

An AI-driven chat interface with advanced positioning capabilities: draggable, dockable, and fullscreen modes.

## Overview

OmniChat is TASTY LABS' intelligent chat assistant that guides users through the system. It features a unique interface that starts as a floating circle and transforms into various display modes while maintaining rich content rendering capabilities.

## Features

- **Multiple Display Modes**: Minimized, floating, docked (left/right/bottom), and fullscreen
- **Drag and Drop**: Draggable interface with auto-docking near screen edges
- **Rich Content**: Render tables, charts, forms, and custom components in messages
- **Streaming Responses**: Real-time word-by-word AI responses
- **Smart Positioning**: Automatic edge detection and docking
- **Responsive Design**: Adapts to different screen sizes
- **Persistent State**: Maintains position and conversation history

## Architecture

This domain follows DDD principles with clear layer separation:

```
omni-chat/
├── types.ts                    # Domain types
├── hooks/
│   ├── useChatState.ts        # Business logic layer
│   └── useChatData.ts         # Data layer (React Query)
├── api/
│   └── chat.service.ts        # API service (mock)
├── adapters/
│   └── chat.adapter.ts        # API ↔ Domain transformations
├── components/
│   ├── OmniChat.tsx           # Main orchestrator
│   ├── ChatMinimized.tsx      # Minimized circle
│   ├── ChatBubble.tsx         # Floating window
│   ├── ChatWindow.tsx         # Docked/fullscreen
│   ├── MessageList.tsx        # Message display
│   ├── MessageBubble.tsx      # Individual message
│   ├── ChatInput.tsx          # Input field
│   └── content/
│       └── TableContent.tsx   # Table renderer
└── index.ts                   # Public API
```

### Layer Responsibilities

**Domain Types (`types.ts`)**
- Pure TypeScript types
- No external dependencies
- Defines the ubiquitous language

**Business Logic (`hooks/useChatState.ts`)**
- State management
- Mode transitions
- Drag and drop logic
- Message management
- No UI or API dependencies

**API Service (`api/chat.service.ts`)**
- Raw API calls
- Mock data for testing
- Returns API-shaped responses

**Adapter (`adapters/chat.adapter.ts`)**
- Transforms API ↔ Domain types
- Isolates domain from backend changes

**Data Layer (`hooks/useChatData.ts`)**
- React Query integration
- Uses adapters for transformations
- Caching and mutations

**Presentation (`components/`)**
- UI rendering
- Uses business logic and data hooks
- No direct API calls

## Usage

### Basic Implementation

```tsx
import { OmniChat } from '@/components/domains/omni-chat'

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}

      <OmniChat
        initialMode="minimized"
        initialDockPosition="right"
        onMessageSent={(message) => console.log(message)}
      />
    </div>
  )
}
```

### Custom Initial State

```tsx
<OmniChat
  initialMode="docked"
  initialDockPosition="left"
  initialFloatingPosition={{ x: 100, y: 100 }}
  onModeChange={(mode) => console.log('Mode changed to:', mode)}
  onMessageSent={(message) => console.log('Message:', message)}
/>
```

### Programmatic Control

```tsx
import { OmniChat } from '@/components/domains/omni-chat'
import { useRef } from 'react'

export default function MyPage() {
  const chatRef = useRef<OmniChatRef>(null)

  const openChat = () => {
    chatRef.current?.changeMode('floating')
  }

  const sendMessage = (text: string) => {
    chatRef.current?.sendMessage(text)
  }

  return (
    <div>
      <button onClick={openChat}>Open Chat</button>
      <button onClick={() => sendMessage('Hello!')}>Send Hello</button>

      <OmniChat ref={chatRef} />
    </div>
  )
}
```

## Display Modes

### Minimized
- Floating circle button
- Draggable to any screen position
- Online indicator pulse animation
- Click to expand

### Floating
- Draggable chat window
- Fixed width (384px)
- Auto-docking when dragged near edges
- Translucent while dragging

### Docked
- Attached to screen edge (left/right/bottom)
- Fixed dimensions based on dock position
- Toggle between dock positions
- Can expand to fullscreen

### Fullscreen
- Takes over entire viewport
- Maximum conversation space
- Can minimize or dock

## Message Content Types

### Text
```tsx
{
  type: 'text',
  text: 'Hello! How can I help you today?'
}
```

### Table
```tsx
{
  type: 'table',
  table: {
    headers: ['Name', 'Status', 'Price'],
    rows: [
      { name: 'Item 1', status: 'Active', price: '$10' },
      { name: 'Item 2', status: 'Pending', price: '$20' }
    ]
  }
}
```

### Component
```tsx
{
  type: 'component',
  component: {
    type: 'OrderForm',
    props: { orderId: '123' }
  }
}
```

### Chart
```tsx
{
  type: 'chart',
  chart: {
    type: 'bar',
    data: [...],
    options: {...}
  }
}
```

### Form
```tsx
{
  type: 'form',
  form: {
    fields: [...],
    onSubmit: (data) => {...}
  }
}
```

## API Integration

### Current (Mock)

The domain currently uses mock data from `api/chat.service.ts`:

```typescript
export const chatService = {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: [{ type: 'text', text: `You said: "${request.message}"` }],
        created_at: new Date().toISOString(),
      },
    }
  },

  async streamMessage(request: SendMessageRequest, onChunk: (chunk: string) => void) {
    // Simulates streaming
  },
}
```

### Backend Integration

To integrate with a real backend:

1. **Update API Service** (`api/chat.service.ts`):
```typescript
import { api } from '@/lib/api'

export const chatService = {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const { data, error } = await api.POST('/chat/messages', {
      body: request
    })
    if (error) throw error
    return data
  },
}
```

2. **Adapter handles transformation** (no changes needed if API matches):
```typescript
// Adapter transforms API → Domain automatically
export const chatAdapter = {
  toMessage(apiMessage: ApiMessage): Message {
    return {
      id: apiMessage.id,
      role: apiMessage.role as MessageRole,
      content: apiMessage.content.map(c => this.toMessageContent(c)),
      timestamp: new Date(apiMessage.created_at),
    }
  },
}
```

3. **Data layer works automatically**:
```typescript
// No changes needed - adapters handle transformation
export function useSendMessage() {
  return useMutation({
    mutationFn: async ({ message, onStream }) => {
      const apiResponse = await chatService.sendMessage({ message })
      return chatAdapter.toMessage(apiResponse.message) // ✓ Transformed
    },
  })
}
```

## Drag and Drop Behavior

### Auto-Docking Logic

When dragging stops, the chat checks proximity to screen edges:

```typescript
const DOCK_THRESHOLD = 50 // pixels

const endDrag = (clientX: number, clientY: number) => {
  if (clientX < DOCK_THRESHOLD) {
    changeDockPosition('left')
  } else if (clientX > window.innerWidth - DOCK_THRESHOLD) {
    changeDockPosition('right')
  } else if (clientY > window.innerHeight - DOCK_THRESHOLD) {
    changeDockPosition('bottom')
  }
  // Otherwise stay in floating mode
}
```

### Drag Constraints

- Minimized mode: Circle can be dragged anywhere
- Floating mode: Window header is draggable
- Docked/Fullscreen: Not draggable (use mode buttons)

## Styling

The chat uses Tailwind classes with design tokens:

```typescript
// Primary brand colors
bg-brand-600        // Chat button, user messages
from-brand-500      // Gradient start
to-brand-600        // Gradient end

// Dark mode support
dark:bg-gray-800    // Backgrounds
dark:text-white     // Text
dark:border-gray-700 // Borders

// Animations
animate-pulse       // Online indicator
animate-bounce      // Loading dots
transition-all      // Smooth mode changes
```

## Testing

### Test Page

Access the test page at `/omni-chat-test`:

```bash
npm run dev
# Navigate to http://localhost:3000/en/omni-chat-test
```

### Test Scenarios

1. **Basic Flow**: Minimized → Click → Send message → Watch streaming
2. **Drag and Dock**: Floating → Drag to edge → Auto-dock
3. **Mode Switching**: Try all modes (minimized, floating, docked, fullscreen)
4. **Table Rendering**: Type "show table" to see table content
5. **Responsive**: Test on different screen sizes

### Manual Testing Checklist

- [ ] Circle appears in default position
- [ ] Circle is draggable
- [ ] Click expands to floating window
- [ ] Floating window is draggable
- [ ] Auto-docks when dragged to edges
- [ ] Dock position buttons work
- [ ] Fullscreen mode works
- [ ] Minimize button returns to circle
- [ ] Messages send successfully
- [ ] Streaming animation works
- [ ] Tables render correctly
- [ ] Dark mode support
- [ ] Responsive on mobile

## Customization

### Custom Positioning

```tsx
<OmniChat
  initialFloatingPosition={{ x: 200, y: 300 }}
  initialDockPosition="left"
/>
```

### Custom Styling

Override with Tailwind classes:

```tsx
// In ChatMinimized.tsx
className="fixed z-[9999] w-20 h-20 rounded-full bg-purple-600"
```

### Custom Message Renderers

Add new content types:

```typescript
// 1. Add to types
export type MessageContentType = 'text' | 'table' | 'custom'

// 2. Create renderer
export function CustomContent({ data }: CustomContentProps) {
  return <div>{/* Custom rendering */}</div>
}

// 3. Add to MessageBubble
{content.type === 'custom' && <CustomContent data={content.data} />}
```

## Performance Considerations

- **Auto-scroll**: MessageList scrolls to bottom on new messages
- **Streaming**: Word-by-word rendering for natural feel
- **Memoization**: Components use React.memo where appropriate
- **Query Caching**: React Query caches message history
- **Lazy Loading**: Message history loaded on demand

## Known Limitations

- Position not persisted to localStorage yet
- No message editing or deletion
- No file upload support
- No voice input
- No multi-user chat rooms
- Mock API only (backend integration pending)

## Future Enhancements

- [ ] Persist position to localStorage
- [ ] Message editing/deletion
- [ ] File upload and preview
- [ ] Voice input integration
- [ ] Multi-user support
- [ ] Real-time backend integration
- [ ] Custom component registry
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Mobile touch gestures

## Related Documentation

- **Architecture**: See `ARCHITECTURE.md` for DDD principles
- **API Client**: See `src/lib/api/README.md` for API integration
- **Menu Builder**: Similar pattern in `src/components/domains/menus/menu-builder`

## Support

For issues or questions:
1. Check the test page at `/omni-chat-test`
2. Review the architecture docs
3. Examine the menu-builder domain for similar patterns
4. Check React Query documentation for data layer questions
