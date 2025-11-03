'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { MenuItem, MenuBuilder, CourseItem } from '../types'
import { useMenuBuilderState } from '../hooks/useMenuBuilderState'
import Input from '@/components/shared/form/input/InputField'
import Label from '@/components/shared/form/Label'
import Select from '@/components/shared/form/Select'
import TextArea from '@/components/shared/form/input/TextArea'
import Badge from '@/components/shared/ui/badge/Badge'
import Button from '@/components/shared/ui/button/Button'
import { toast } from 'sonner'
import { useSidebar } from '@/context/SidebarContext'

interface FastMenuBuilderProps {
  accountId: string
  initialMenu?: MenuBuilder
  availableItems: MenuItem[]
  onSave?: (menu: MenuBuilder) => void | Promise<void>
  onCancel?: () => void
}

export function FastMenuBuilder({
  initialMenu,
  availableItems,
  onSave,
}: FastMenuBuilderProps) {
  // Translations
  const t = useTranslations('menu.builder')

  // Sidebar state for bottom bar positioning
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()

  // Business logic hook - handles all menu state and operations
  const menuState = useMenuBuilderState({
    initialName: initialMenu?.name,
    initialCourses: initialMenu?.courses,
    initialPricingStrategy: initialMenu?.pricingStrategy,
    initialFixedPrice: initialMenu?.fixedPriceCents,
    initialIsActive: initialMenu?.isActive,
    availableItems,
  })

  // UI-only state (not business logic)
  const [isEditingName, setIsEditingName] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [view, setView] = useState<'builder' | 'details'>('builder')
  const [description, setDescription] = useState(initialMenu?.description || '')
  const [imageUrl, setImageUrl] = useState(initialMenu?.imageUrl || '')
  const [tags, setTags] = useState<string[]>(initialMenu?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false)
  const [browseFilter, setBrowseFilter] = useState<string>('all')
  const [browseSearch, setBrowseSearch] = useState('')
  const [browsePage, setBrowsePage] = useState(1)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Pagination settings
  const ITEMS_PER_PAGE = 24

  // Computed values from business logic
  const filteredItems = availableItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalItems = menuState.getTotalItems()
  const displayPrice = menuState.getTotalPrice()
  const targetCourse = menuState.courses.find((c) => c.id === menuState.targetCourseId)

  // Extract all unique dietary tags for autocomplete
  const allDietaryTags = Array.from(
    new Set(
      availableItems
        .flatMap((item) => item.dietaryTags || [])
        .filter(Boolean)
    )
  ).sort()

  // Browse modal filtered items with tag filtering
  const browseFilteredItems = availableItems.filter((item) => {
    const matchesCategory = browseFilter === 'all' || item.category === browseFilter
    const matchesSearch = browseSearch === '' ||
      item.name.toLowerCase().includes(browseSearch.toLowerCase()) ||
      item.description?.toLowerCase().includes(browseSearch.toLowerCase())
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => item.dietaryTags?.includes(tag))
    return matchesCategory && matchesSearch && matchesTags
  })

  // Paginated items
  const totalPages = Math.ceil(browseFilteredItems.length / ITEMS_PER_PAGE)
  const paginatedItems = browseFilteredItems.slice(
    (browsePage - 1) * ITEMS_PER_PAGE,
    browsePage * ITEMS_PER_PAGE
  )

  // Event handlers - delegate to business logic
  const handleAddItem = (item: MenuItem, keepFocus = false) => {
    menuState.addItem(item)
    setSearchQuery('')
    setSelectedResultIndex(0)
    if (!keepFocus) {
      searchInputRef.current?.focus()
    }
  }

  const handleDragStart = (e: React.DragEvent, courseId: string, itemId: string) => {
    menuState.setDraggedItem({ courseId, itemId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    menuState.setDraggedItem(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnCourse = (e: React.DragEvent, targetCourseId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!menuState.draggedItem) return
    if (menuState.draggedItem.courseId === targetCourseId) {
      menuState.setDraggedItem(null)
      return
    }

    menuState.moveItemBetweenCourses(
      menuState.draggedItem.courseId,
      targetCourseId,
      menuState.draggedItem.itemId
    )
    menuState.setDraggedItem(null)
  }

  const handleSave = async () => {
    const menu: MenuBuilder = {
      id: initialMenu?.id,
      name: menuState.name,
      courses: menuState.courses.filter((c) => c.items.length > 0),
      isActive: menuState.isActive,
      pricingStrategy: menuState.pricingStrategy,
      fixedPriceCents: menuState.pricingStrategy === 'fixed' ? menuState.fixedPriceCents : undefined,
    }

    setIsSaving(true)
    try {
      await onSave?.(menu)
      toast.success('Menu saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setBrowsePage(1)
  }

  const handleCloseBrowseModal = () => {
    setIsBrowseModalOpen(false)
    setBrowseFilter('all')
    setBrowseSearch('')
    setSelectedTags([])
    setBrowsePage(1)
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      if (e.key === ']') {
        setView('details')
      }

      if (e.key === '[' || (e.key === 'Escape' && view !== 'builder')) {
        setView('builder')
      }

      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1
        if (index < menuState.courses.length) {
          menuState.setTargetCourseId(menuState.courses[index].id)
          toast.info(`Target: ${menuState.courses[index].name}`)
        }
      }

      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedResultIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedResultIndex((prev) => Math.max(prev - 1, 0))
        }
        if (e.key === 'Enter' && filteredItems[selectedResultIndex]) {
          e.preventDefault()
          handleAddItem(filteredItems[selectedResultIndex], e.shiftKey)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuState.courses, menuState.setTargetCourseId, filteredItems, selectedResultIndex, view, handleAddItem])

  useEffect(() => {
    setSelectedResultIndex(0)
  }, [searchQuery])

  const viewLabels = {
    builder: 'Menu Builder',
    details: 'Menu Details',
  }

  return (
    <div className="flex h-full max-h-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Main Builder View */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out pb-16 ${
          view !== 'builder' ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{viewLabels[view]}</span>
            </div>

            {/* Editable Menu Name */}
            {isEditingName ? (
              <input
                type="text"
                value={menuState.name}
                onChange={(e) => menuState.setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingName(false)
                }}
                autoFocus
                className="text-xl font-bold border-b-2 border-brand-500 bg-transparent focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h1
                  onClick={() => setIsEditingName(true)}
                  className="text-xl font-bold cursor-pointer hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {menuState.name}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  title="Edit menu name"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Pricing Strategy Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => menuState.setPricingStrategy('sum-of-items')}
                title="Menu price is the sum of all item prices"
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  menuState.pricingStrategy === 'sum-of-items'
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Sum
              </button>
              <button
                onClick={() => menuState.setPricingStrategy('fixed')}
                title="Menu has one fixed price regardless of items"
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  menuState.pricingStrategy === 'fixed'
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Fixed
              </button>
              {menuState.pricingStrategy === 'fixed' && (
                <input
                  type="number"
                  value={menuState.fixedPriceCents ? (menuState.fixedPriceCents / 100).toFixed(2) : ''}
                  onChange={(e) => menuState.setFixedPriceCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                  placeholder="0.00"
                  className="w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              )}
            </div>

            {/* Summary Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{totalItems} items</span>
              <span>•</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${(displayPrice / 100).toFixed(2)}
              </span>
            </div>

            {/* Status Badge */}
            <Badge variant="solid" color={menuState.isActive ? 'success' : 'light'} size="sm">
              {menuState.isActive ? 'Published' : 'Draft'}
            </Badge>

            {/* Action Buttons */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setView('details')}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Details →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search & Browse Button */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Quick search... (Press /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {targetCourse && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge variant="light" color="primary" size="sm">
                    → {targetCourse.name}
                  </Badge>
                </div>
              )}
              {/* Quick Search Dropdown */}
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-30">
                  {filteredItems.length > 0 ? (
                    filteredItems.slice(0, 5).map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        className={`w-full px-4 py-2.5 text-left hover:bg-brand-50 dark:hover:bg-brand-900/20 flex items-center justify-between ${
                          idx === selectedResultIndex ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 capitalize mt-0.5">{item.category}</div>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                          ${(item.priceCents / 100).toFixed(2)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      No items found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsBrowseModalOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Browse All ({availableItems.length})
            </Button>
          </div>
        </div>

        {/* All Courses */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {menuState.courses.map((course) => {
            const courseItems = course.items
              .map((ci) => {
                const menuItem = availableItems.find((mi) => mi.id === ci.menuItemId)
                return menuItem ? { ...menuItem, courseItem: ci } : null
              })
              .filter(Boolean) as (MenuItem & { courseItem: CourseItem })[]

            const subtotal = menuState.getCourseSubtotal(course.id)

            return (
              <div
                key={course.id}
                ref={(el) => (menuState.courseRefs.current[course.id] = el)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnCourse(e, course.id)}
              >
                {/* Course Header */}
                <div
                  className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => menuState.setTargetCourseId(course.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{course.icon}</span>
                    <h3 className="text-sm font-semibold">{course.name}</h3>
                    <span className="text-xs text-gray-500">({courseItems.length})</span>
                    <span
                      className={`text-xs font-medium ${
                        menuState.pricingStrategy === 'fixed' ? 'opacity-50' : ''
                      }`}
                    >
                      ${(subtotal / 100).toFixed(2)}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">⋯</button>
                </div>

                {/* Course Items Table */}
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-24">Unit €</th>
                      <th className="px-4 py-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseItems.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">
                          Type to add or paste a list
                        </td>
                      </tr>
                    ) : (
                      courseItems.map((item) => {
                        const rowId = `${course.id}-${item.id}`
                        const isDragging =
                          menuState.draggedItem?.courseId === course.id &&
                          menuState.draggedItem?.itemId === item.id

                        return (
                          <tr
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, course.id, item.id)}
                            onDragEnd={handleDragEnd}
                            className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-grab active:cursor-grabbing ${
                              menuState.highlightedRow === rowId ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                            } ${isDragging ? 'opacity-50' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M7 2a2 2 0 10-.001 4.001A2 2 0 007 2zm0 6a2 2 0 10-.001 4.001A2 2 0 007 8zm0 6a2 2 0 10-.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10-.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10-.001 4.001A2 2 0 0013 14z" />
                                </svg>
                                <div>
                                  <div className="font-medium text-sm">{item.name}</div>
                                  {item.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={(item.courseItem.priceCents / 100).toFixed(2)}
                                onChange={(e) =>
                                  menuState.updateItemPrice(
                                    course.id,
                                    item.id,
                                    Math.round(parseFloat(e.target.value || '0') * 100)
                                  )
                                }
                                className="w-20 px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => menuState.duplicateItem(course.id, item.id)}
                                  className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                  title="Duplicate item"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => menuState.removeItem(course.id, item.id)}
                                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  title="Remove item"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>

      {/* Details Slide-In Panel */}
      <div
        className={`absolute inset-0 bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out pb-16 ${
          view !== 'builder' ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Details Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('builder')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <button onClick={() => setView('builder')} className="hover:text-brand-600 dark:hover:text-brand-400">
                Menu Builder
              </button>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">{viewLabels[view]}</span>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="overflow-y-auto p-6" style={{ height: 'calc(100% - 80px)' }}>
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Menu Name */}
              <div className="sm:col-span-2">
                <Label htmlFor="menuNameDetail">Menu Name</Label>
                <Input
                  id="menuNameDetail"
                  type="text"
                  value={menuState.name}
                  onChange={(e) => menuState.setName(e.target.value)}
                  placeholder="Enter menu name"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  value={description}
                  onChange={(value) => setDescription(value)}
                  placeholder="Describe your menu..."
                  rows={3}
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                  ]}
                  defaultValue={menuState.isActive ? 'published' : 'draft'}
                  onChange={(value) => menuState.setIsActive(value === 'published')}
                />
              </div>

              {/* Cover Image URL */}
              <div className="sm:col-span-2">
                <Label htmlFor="imageUrl">Cover Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrl && (
                  <div className="mt-3 w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={imageUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="sm:col-span-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Add tags (press Enter)"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag} disabled={!tagInput.trim()}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="light" color="primary" size="sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Items Modal */}
      {isBrowseModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Browse Menu Items</h2>
                <button
                  onClick={handleCloseBrowseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search by name or description..."
                  value={browseSearch}
                  onChange={(e) => {
                    setBrowseSearch(e.target.value)
                    setBrowsePage(1)
                  }}
                />
              </div>

              {/* Category Filters */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  Category
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Items', count: availableItems.length },
                    { value: 'appetizers', label: 'Appetizers', count: availableItems.filter(i => i.category === 'appetizers').length },
                    { value: 'mains', label: 'Mains', count: availableItems.filter(i => i.category === 'mains').length },
                    { value: 'sides', label: 'Sides', count: availableItems.filter(i => i.category === 'sides').length },
                    { value: 'desserts', label: 'Desserts', count: availableItems.filter(i => i.category === 'desserts').length },
                    { value: 'beverages', label: 'Beverages', count: availableItems.filter(i => i.category === 'beverages').length },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setBrowseFilter(filter.value)
                        setBrowsePage(1)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        browseFilter === filter.value
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Tag Filters (Autocomplete) */}
              {allDietaryTags.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Dietary Filters
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allDietaryTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                          selectedTags.includes(tag)
                            ? 'bg-green-600 text-white ring-2 ring-green-600 ring-offset-2 dark:ring-offset-gray-800'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {selectedTags.includes(tag) && (
                          <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Content - Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {paginatedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleAddItem(item)
                        toast.success(`Added ${item.name}`)
                      }}
                      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500 transition-all text-left"
                    >
                      {/* Image */}
                      {item.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                          <span className="text-brand-600 dark:text-brand-400 font-bold text-sm whitespace-nowrap">
                            ${(item.priceCents / 100).toFixed(2)}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <Badge variant="light" size="sm" className="capitalize">
                            {item.category}
                          </Badge>

                          <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                          </div>
                        </div>

                        {/* Dietary Tags */}
                        {item.dietaryTags && item.dietaryTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.dietaryTags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No items found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search</p>
                </div>
              )}
            </div>

            {/* Modal Footer with Pagination */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((browsePage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(browsePage * ITEMS_PER_PAGE, browseFilteredItems.length)} of {browseFilteredItems.length} items
                  {browseFilteredItems.length !== availableItems.length && (
                    <span className="ml-1 text-gray-500">
                      (filtered from {availableItems.length})
                    </span>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBrowsePage(1)}
                      disabled={browsePage === 1}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setBrowsePage(p => Math.max(1, p - 1))}
                      disabled={browsePage === 1}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      ← Prev
                    </button>

                    <span className="px-3 py-1.5 text-sm font-medium">
                      Page {browsePage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setBrowsePage(p => Math.min(totalPages, p + 1))}
                      disabled={browsePage === totalPages}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Next →
                    </button>
                    <button
                      onClick={() => setBrowsePage(totalPages)}
                      disabled={browsePage === totalPages}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Last
                    </button>
                  </div>
                )}

                <button
                  onClick={handleCloseBrowseModal}
                  className="text-brand-600 dark:text-brand-400 hover:underline text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar - Fixed to viewport like navbar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 shadow-lg z-[9997] transition-all duration-300 ${
          isMobileOpen
            ? 'xl:left-0'
            : isExpanded || isHovered
            ? 'xl:left-[290px]'
            : 'xl:left-[90px]'
        }`}
      >
        <div className="flex items-center justify-between max-w-(--breakpoint-2xl) mx-auto">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span>{menuState.courses.length} {t('bottomBar.courses')}</span>
            <span>•</span>
            <span>{totalItems} {t('bottomBar.items')}</span>
            <span>•</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${(displayPrice / 100).toFixed(2)}
              {menuState.pricingStrategy === 'fixed' && <span className="text-xs ml-1">{t('bottomBar.fixedPrice')}</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('bottomBar.savingButton') : t('bottomBar.saveButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
