export default function OmniChatTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            OmniChat Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the AI-driven chat interface with draggable, dockable, and fullscreen capabilities
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Features Demo
          </h2>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🎯 Minimized Mode
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Look for the floating circle in the bottom-right corner. Click it to expand!
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                🎨 Floating Mode
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Click the circle to expand into a draggable chat window. Drag it near screen edges to auto-dock
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                📍 Docked Mode
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                When docked, the chat slides in and pushes the entire page content (including navbar) to the side. Try the dock buttons in the chat header!
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                🖥️ Fullscreen Mode
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Expand chat to take over the entire screen. Use the fullscreen button in the chat header.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Interaction Guide
          </h2>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400 font-bold">1.</span>
              <p>
                <strong>Dragging:</strong> Click and hold the header to drag the chat window anywhere on the screen
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400 font-bold">2.</span>
              <p>
                <strong>Auto-Docking:</strong> Drag the chat near the left, right, or bottom edge to automatically dock it
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400 font-bold">3.</span>
              <p>
                <strong>Mode Switching:</strong> Use the buttons in the chat header to switch between minimized, floating, docked, and fullscreen modes
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400 font-bold">4.</span>
              <p>
                <strong>Sending Messages:</strong> Type in the input field and press Enter or click the send button
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400 font-bold">5.</span>
              <p>
                <strong>Special Commands:</strong> Try typing "show table" to see a table rendered in the chat
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400 font-bold">6.</span>
              <p>
                <strong>Streaming:</strong> AI responses are streamed word-by-word for a natural conversation experience
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Scenarios
          </h2>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Scenario 1: Basic Chat Flow
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Start minimized → Click to expand → Send a message → Watch streaming response
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Scenario 2: Drag and Dock
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Expand to floating → Drag near left edge → Watch it auto-dock → Try other edges
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Scenario 3: Table Rendering
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Open chat → Type "show table" → See structured data rendered as a table
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Scenario 4: Fullscreen Experience
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Start fullscreen → Have a full conversation → Exit to docked mode
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 border border-brand-200 dark:border-brand-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-brand-900 dark:text-brand-100 mb-2">
            Architecture Highlights
          </h2>
          <ul className="space-y-2 text-sm text-brand-800 dark:text-brand-200">
            <li className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span>
              <span><strong>DDD Architecture:</strong> Clean separation with domain types, business logic, adapters, and presentation layers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span>
              <span><strong>Adapter Pattern:</strong> API responses transformed to domain models via adapters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span>
              <span><strong>Mock Data:</strong> Fully functional with simulated API responses and streaming</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span>
              <span><strong>React Query:</strong> Data fetching and caching ready for real backend integration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span>
              <span><strong>Special Content:</strong> Supports text, tables, and custom component rendering in messages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
