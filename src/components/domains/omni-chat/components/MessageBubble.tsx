'use client'

import type { Message } from '../types'
import { TableContent } from './content/TableContent'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming

  return (
    <div className={`group w-full ${isUser ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0">
            {isUser ? (
              <div className="w-full h-full rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2 pt-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {isUser ? 'You' : 'TASTY LABS AI'}
              </span>
              {isStreaming && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Typing...
                </span>
              )}
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              {message.content.map((content, index) => (
                <div key={index} className="space-y-3">
                  {content.type === 'text' && content.text && (
                    <div className="text-[15px] leading-7 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {content.text}
                    </div>
                  )}

                  {content.type === 'table' && content.table && (
                    <div className="my-4">
                      <TableContent table={content.table} />
                    </div>
                  )}

                  {content.type === 'component' && content.component && (
                    <div className="my-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                        Component: {content.component.type}
                      </div>
                      <pre className="text-xs overflow-auto text-gray-700 dark:text-gray-300">
                        {JSON.stringify(content.component.props, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
