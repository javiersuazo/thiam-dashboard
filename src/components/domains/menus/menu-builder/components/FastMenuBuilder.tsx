'use client'

import { useState, useRef, useEffect } from 'react'
import { MenuItem, MenuBuilder, CourseItem } from '../types'
import { useMenuBuilderState } from '../hooks/useMenuBuilderState'
import Input from '@/components/shared/form/input/InputField'
import Label from '@/components/shared/form/Label'
import Select from '@/components/shared/form/Select'
import TextArea from '@/components/shared/form/input/TextArea'
import Badge from '@/components/shared/ui/badge/Badge'
import Button from '@/components/shared/ui/button/Button'
import { toast } from 'sonner'

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
  const [leadTime, setLeadTime] = useState('48')
  const [cities, setCities] = useState('Berlin, Munich')
  const [capacity, setCapacity] = useState('50')
  const [imageUrl, setImageUrl] = useState(initialMenu?.imageUrl || '')
  const [tags, setTags] = useState<string[]>(initialMenu?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Computed values from business logic
  const filteredItems = availableItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalItems = menuState.getTotalItems()
  const displayPrice = menuState.getTotalPrice()
  const targetCourse = menuState.courses.find((c) => c.id === menuState.targetCourseId)

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
    <div className="flex h-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden pb-16">
      {/* Main Builder View */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
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
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-xl font-bold cursor-pointer hover:text-brand-600 dark:hover:text-brand-400"
              >
                {menuState.name}
              </h1>
            )}

            {/* Pricing Strategy Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => menuState.setPricingStrategy('sum-of-items')}
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

            {/* Status Badge */}
            <Badge variant="solid" color={menuState.isActive ? 'success' : 'light'} size="sm">
              {menuState.isActive ? 'Published' : 'Draft'}
            </Badge>

            {/* Details Button */}
            <button
              onClick={() => setView('details')}
              className="ml-auto px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Details →
            </button>
          </div>

          {/* Quick Info Badges */}
          {view === 'builder' && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setView('details')}
                className="hover:opacity-80 transition-opacity"
              >
                <Badge variant="light" color="light" size="sm">Lead {leadTime}h</Badge>
              </button>
              <button
                onClick={() => setView('details')}
                className="hover:opacity-80 transition-opacity"
              >
                <Badge variant="light" color="light" size="sm">{cities.split(',')[0]}</Badge>
              </button>
              <button
                onClick={() => setView('details')}
                className="hover:opacity-80 transition-opacity"
              >
                <Badge variant="light" color="light" size="sm">{capacity} ppl</Badge>
              </button>
            </div>
          )}
        </div>

        {/* Global Search */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Type to search... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {targetCourse && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Badge variant="light" color="primary" size="sm">
                  Adding to: {targetCourse.name}
                </Badge>
              </div>
            )}
            {searchQuery && filteredItems.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-30">
                {filteredItems.slice(0, 10).map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                      idx === selectedResultIndex ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                    }`}
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">${(item.priceCents / 100).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
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
        className={`absolute inset-0 bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out ${
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

              {/* Lead Time */}
              <div>
                <Label htmlFor="leadTime">Lead Time (hours)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  placeholder="48"
                />
              </div>

              {/* Cities */}
              <div>
                <Label htmlFor="cities">Cities</Label>
                <Input
                  id="cities"
                  type="text"
                  value={cities}
                  onChange={(e) => setCities(e.target.value)}
                  placeholder="Berlin, Munich, Hamburg"
                />
              </div>

              {/* Capacity */}
              <div>
                <Label htmlFor="capacity">Capacity (people)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="50"
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

      {/* Fixed Footer - Visible on all slides */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span>{menuState.courses.length} courses</span>
            <span>•</span>
            <span>{totalItems} items</span>
            <span>•</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${(displayPrice / 100).toFixed(2)}
              {menuState.pricingStrategy === 'fixed' && <span className="text-xs ml-1">(Fixed)</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Export</Button>
            <Button variant="outline" size="sm">Duplicate</Button>
            <Button variant="outline" size="sm">Clear</Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
