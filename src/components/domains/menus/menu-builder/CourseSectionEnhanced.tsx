'use client'

import { Course, MenuItem, CourseItem } from './types'
import { ChevronDownIcon } from '@/icons'
import { useState } from 'react'

interface CourseSectionEnhancedProps {
  course: Course
  menuItems: MenuItem[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, courseId: string) => void
  onRemoveItem: (courseId: string, menuItemId: string) => void
  onReorder: (courseId: string, fromIndex: number, toIndex: number) => void
  onToggleCollapse: (courseId: string) => void
}

const DIETARY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  vegan: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: '🌱' },
  vegetarian: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: '🥬' },
  'gluten-free': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '🌾' },
  'dairy-free': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: '🥛' },
  'nut-free': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: '🥜' },
  halal: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: '☪️' },
  kosher: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', icon: '✡️' },
}

export function CourseSectionEnhanced({
  course,
  menuItems,
  onDragOver,
  onDrop,
  onRemoveItem,
  onReorder,
  onToggleCollapse,
}: CourseSectionEnhancedProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100)
  }

  const getCourseItems = () => {
    return course.items
      .map((courseItem) => {
        const menuItem = menuItems.find((mi) => mi.id === courseItem.menuItemId)
        return menuItem ? { ...menuItem, courseItem } : null
      })
      .filter(Boolean) as (MenuItem & { courseItem: CourseItem })[]
  }

  const courseItems = getCourseItems()

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('courseId', course.id)
    e.dataTransfer.setData('fromIndex', index.toString())
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
  }

  const handleItemDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    const fromCourseId = e.dataTransfer.getData('courseId')
    const fromIndex = parseInt(e.dataTransfer.getData('fromIndex'))

    if (fromCourseId === course.id && !isNaN(fromIndex)) {
      onReorder(course.id, fromIndex, toIndex)
    }

    setDraggingIndex(null)
  }

  const getHealthScore = (item: MenuItem) => {
    let score = 50
    if (item.dietaryTags?.includes('vegan')) score += 20
    if (item.dietaryTags?.includes('vegetarian')) score += 15
    if (item.dietaryTags?.includes('gluten-free')) score += 10
    if (item.dietaryTags?.includes('dairy-free')) score += 5
    return Math.min(score, 100)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => onToggleCollapse(course.id)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{course.icon}</span>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{course.name}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({courseItems.length})
          </span>
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform ${
            course.isCollapsed ? '-rotate-90' : ''
          }`}
        />
      </button>

      {!course.isCollapsed && (
        <div
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, course.id)}
          className="p-3 min-h-[100px]"
        >
          {courseItems.length === 0 ? (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Drop items here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courseItems.map((item, index) => {
                const healthScore = getHealthScore(item)
                const scoreColor =
                  healthScore >= 80
                    ? 'text-green-600 dark:text-green-400'
                    : healthScore >= 60
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-600 dark:text-gray-400'

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleItemDrop(e, index)}
                    className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                      draggingIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex gap-3 p-3">
                      {item.imageUrl && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className={`text-xs font-medium ${scoreColor}`}>
                                {healthScore}
                              </div>
                              <svg
                                className={`w-3.5 h-3.5 ${scoreColor}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 3.22l-.61-.6a5.5 5.5 0 00-7.778 7.77L10 18.78l8.39-8.4a5.5 5.5 0 00-7.78-7.77l-.61.61z" />
                              </svg>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                              {formatPrice(
                                item.courseItem.priceCents ?? item.priceCents,
                                item.currency
                              )}
                            </span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        {item.dietaryTags && item.dietaryTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.dietaryTags.slice(0, 3).map((tag) => {
                              const colors = DIETARY_COLORS[tag] || {
                                bg: 'bg-gray-100 dark:bg-gray-700',
                                text: 'text-gray-700 dark:text-gray-300',
                                icon: '•',
                              }
                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded ${colors.bg} ${colors.text}`}
                                >
                                  <span>{colors.icon}</span>
                                  <span className="capitalize">{tag}</span>
                                </span>
                              )
                            })}
                            {item.dietaryTags.length > 3 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                +{item.dietaryTags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onRemoveItem(course.id, item.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/15 rounded transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>

                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 4.5A.5.5 0 012.5 4h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zm0 5A.5.5 0 012.5 9h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zm0 5a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
