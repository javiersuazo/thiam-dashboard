'use client'

import { useState } from 'react'
import { Course, MenuItem, CourseItem, MenuBuilder, DEFAULT_COURSES } from './types'
import { MenuItemLibrary } from './MenuItemLibrary'
import { CourseSection } from './CourseSection'
import { MenuMetadataPanel } from './MenuMetadataPanel'
import Button from '@/components/shared/ui/button/Button'
import { toast } from 'sonner'

interface WizardMode {
  menuName: string
  pricingStrategy: 'fixed' | 'sum-of-items'
  fixedPriceCents?: number
}

interface MenuBuilderCanvasProps {
  accountId: string
  initialMenu?: MenuBuilder
  availableItems: MenuItem[]
  onSave?: (menu: MenuBuilder) => void | Promise<void>
  wizardMode?: WizardMode
}

export function MenuBuilderCanvas({
  accountId,
  initialMenu,
  availableItems,
  onSave,
  wizardMode,
}: MenuBuilderCanvasProps) {
  const [metadata, setMetadata] = useState({
    name: wizardMode?.menuName || initialMenu?.name || 'New Menu',
    description: initialMenu?.description,
    imageUrl: initialMenu?.imageUrl,
    isActive: initialMenu?.isActive ?? true,
    availableFrom: initialMenu?.availableFrom,
    availableTo: initialMenu?.availableTo,
    tags: initialMenu?.tags || [],
  })

  const [courses, setCourses] = useState<Course[]>(
    initialMenu?.courses ||
    DEFAULT_COURSES.map((course, index) => ({
      ...course,
      id: `course-${index}`,
      items: [],
      isCollapsed: false,
    }))
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isMetadataDrawerOpen, setIsMetadataDrawerOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)

  const handleDragStartFromLibrary = (e: React.DragEvent, item: MenuItem) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('menuItemId', item.id)
    e.dataTransfer.setData('source', 'library')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDropOnCourse = (e: React.DragEvent, courseId: string) => {
    e.preventDefault()
    e.stopPropagation()

    const source = e.dataTransfer.getData('source')
    const menuItemId = e.dataTransfer.getData('menuItemId')

    if (source === 'library' && menuItemId) {
      const menuItem = availableItems.find(item => item.id === menuItemId)
      if (!menuItem) return

      setCourses(prev => prev.map(course => {
        if (course.id !== courseId) return course

        const alreadyExists = course.items.some(item => item.menuItemId === menuItemId)
        if (alreadyExists) {
          toast.info('Item already in this course')
          return course
        }

        const newItem: CourseItem = {
          menuItemId,
          position: course.items.length,
          priceCents: menuItem.priceCents,
          isAvailable: menuItem.isAvailable,
        }

        return {
          ...course,
          items: [...course.items, newItem],
        }
      }))

      toast.success(`Added to ${courses.find(c => c.id === courseId)?.name}`)
    }
  }

  const handleRemoveItem = (courseId: string, menuItemId: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course

      return {
        ...course,
        items: course.items
          .filter(item => item.menuItemId !== menuItemId)
          .map((item, index) => ({ ...item, position: index })),
      }
    }))

    toast.success('Item removed')
  }

  const handleReorder = (courseId: string, fromIndex: number, toIndex: number) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course

      const items = [...course.items]
      const [movedItem] = items.splice(fromIndex, 1)
      items.splice(toIndex, 0, movedItem)

      return {
        ...course,
        items: items.map((item, index) => ({ ...item, position: index })),
      }
    }))
  }

  const handleToggleCollapse = (courseId: string) => {
    setCourses(prev => prev.map(course =>
      course.id === courseId
        ? { ...course, isCollapsed: !course.isCollapsed }
        : course
    ))
  }

  const handleSave = async () => {
    if (!metadata.name.trim()) {
      toast.error('Please enter a menu name')
      return
    }

    const menu: MenuBuilder = {
      id: initialMenu?.id,
      name: metadata.name,
      description: metadata.description,
      imageUrl: metadata.imageUrl,
      availableFrom: metadata.availableFrom,
      availableTo: metadata.availableTo,
      tags: metadata.tags,
      courses: courses.filter(course => course.items.length > 0),
      isActive: metadata.isActive,
    }

    setIsSaving(true)
    try {
      await onSave?.(menu)
      toast.success('Menu saved successfully')
    } catch (error) {
      toast.error('Failed to save menu')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const totalItems = courses.reduce((sum, course) => sum + course.items.length, 0)

  const calculateTotalPrice = () => {
    if (wizardMode?.pricingStrategy === 'fixed') {
      return wizardMode.fixedPriceCents || 0
    }

    return courses.reduce((total, course) => {
      return total + course.items.reduce((courseTotal, item) => {
        return courseTotal + (item.priceCents || 0)
      }, 0)
    }, 0)
  }

  const totalPriceCents = calculateTotalPrice()

  return (
    <div className="flex flex-col h-full relative">
      {/* Simplified Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex-1 flex items-center gap-4">
          {isEditingName ? (
            <input
              type="text"
              value={metadata.name}
              onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false)
                if (e.key === 'Escape') {
                  setMetadata({ ...metadata, name: initialMenu?.name || 'New Menu' })
                  setIsEditingName(false)
                }
              }}
              autoFocus
              className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-brand-500 focus:outline-none px-2 -ml-2"
              placeholder="Enter menu name..."
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-2xl font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2 -ml-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {metadata.name || 'New Menu'}
            </button>
          )}

          <button
            onClick={() => setIsMetadataDrawerOpen(true)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1"
          >
            <span>+ Add details</span>
            <span className="text-xs">(optional)</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalItems} items · {courses.filter(c => c.items.length > 0).length} courses
            </p>
            {wizardMode && totalItems > 0 && (
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                ${(totalPriceCents / 100).toFixed(2)}
                {wizardMode.pricingStrategy === 'fixed' && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    (fixed)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Item Library - Left Side */}
        <div className="w-80 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <MenuItemLibrary
            items={availableItems}
            onDragStart={handleDragStartFromLibrary}
          />
        </div>

        {/* Course Builder - Right Side */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-3">
            {courses.map(course => (
              <CourseSection
                key={course.id}
                course={course}
                menuItems={availableItems}
                onDragOver={handleDragOver}
                onDrop={handleDropOnCourse}
                onRemoveItem={handleRemoveItem}
                onReorder={handleReorder}
                onToggleCollapse={handleToggleCollapse}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Suggestions
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || totalItems === 0 || !metadata.name.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Menu'}
            </Button>
          </div>
        </div>
      </div>

      {/* Metadata Drawer */}
      {isMetadataDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={() => setIsMetadataDrawerOpen(false)}
          />

          {/* Drawer */}
          <div
            className="relative w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-xl overflow-hidden flex flex-col transition-transform duration-300 ease-out"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <style jsx>{`
              @keyframes slideInRight {
                from {
                  transform: translateX(100%);
                }
                to {
                  transform: translateX(0);
                }
              }
            `}</style>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Menu Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add optional information about this menu
                </p>
              </div>
              <button
                onClick={() => setIsMetadataDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 14 14" fill="currentColor" className="text-gray-500">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                  />
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <MenuMetadataPanel
                metadata={metadata}
                onChange={setMetadata}
                isCollapsed={false}
                onToggleCollapse={() => {}}
              />
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <Button
                onClick={() => setIsMetadataDrawerOpen(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
