'use client'

import { Course, MenuItem, CourseItem } from './types'
import { ChevronDownIcon, PlusIcon } from '@/icons'
import { useState } from 'react'

interface CourseSectionProps {
  course: Course
  menuItems: MenuItem[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, courseId: string) => void
  onRemoveItem: (courseId: string, menuItemId: string) => void
  onReorder: (courseId: string, fromIndex: number, toIndex: number) => void
  onToggleCollapse: (courseId: string) => void
}

export function CourseSection({
  course,
  menuItems,
  onDragOver,
  onDrop,
  onRemoveItem,
  onReorder,
  onToggleCollapse,
}: CourseSectionProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100)
  }

  const getCourseItems = () => {
    return course.items
      .map(courseItem => {
        const menuItem = menuItems.find(mi => mi.id === courseItem.menuItemId)
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

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Course Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={() => onToggleCollapse(course.id)}
          className="flex items-center gap-3 flex-1 text-left group"
        >
          <span className="text-2xl">{course.icon}</span>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {course.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {courseItems.length} item{courseItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-400 transition-transform ${
              course.isCollapsed ? '-rotate-90' : ''
            }`}
          />
        </button>

        <button className="ml-3 p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/15 rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Course Items */}
      {!course.isCollapsed && (
        <div
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, course.id)}
          className="p-4 min-h-[120px]"
        >
          {courseItems.length === 0 ? (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drop items here or click + to add
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {courseItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleItemDrop(e, index)}
                  className={`group p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                    draggingIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <div className="mt-1 text-gray-400 group-hover:text-brand-500">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2.43311 5.0001C2.43311 4.50304 2.83605 4.1001 3.33311 4.1001L16.6664 4.1001C17.1635 4.1001 17.5664 4.50304 17.5664 5.0001C17.5664 5.49715 17.1635 5.9001 16.6664 5.9001L3.33311 5.9001C2.83605 5.9001 2.43311 5.49716 2.43311 5.0001ZM2.43311 15.0001C2.43311 14.503 2.83605 14.1001 3.33311 14.1001L16.6664 14.1001C17.1635 14.1001 17.5664 14.503 17.5664 15.0001C17.5664 15.4972 17.1635 15.9001 16.6664 15.9001L3.33311 15.9001C2.83605 15.9001 2.43311 15.4972 2.43311 15.0001ZM3.33311 9.1001C2.83605 9.1001 2.43311 9.50304 2.43311 10.0001C2.43311 10.4972 2.83605 10.9001 3.33311 10.9001L16.6664 10.9001C17.1635 10.9001 17.5664 10.4972 17.5664 10.0001C17.5664 9.50304 17.1635 9.1001 16.6664 9.1001L3.33311 9.1001Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                          {formatPrice(
                            item.courseItem.priceCents ?? item.priceCents,
                            item.currency
                          )}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      )}

                      {item.dietaryTags && item.dietaryTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.dietaryTags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveItem(course.id, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/15 rounded transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
