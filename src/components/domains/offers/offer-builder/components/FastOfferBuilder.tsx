'use client'

import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type {
  Offer,
  MenuItem,
  OfferBlock,
  OfferBlockItem,
  OfferAdjustment,
  AdjustmentComment
} from '../types'
import { useOfferBuilderState } from '../hooks/useOfferBuilderState'
import Button from '@/components/shared/ui/button/Button'
import Input from '@/components/shared/form/input/InputField'
import Badge from '@/components/shared/ui/badge/Badge'
import { AddBlockModal } from './blocks/AddBlockModal'
import { AddAdjustmentModal } from './AddAdjustmentModal'
import { AdjustmentThread } from './AdjustmentThread'

interface FastOfferBuilderProps {
  offer: Offer
  availableItems: MenuItem[]
  request?: any
  initialAdjustments?: OfferAdjustment[]
  onSave?: (offer: Offer) => Promise<void>
  onCancel?: () => void
}

export function FastOfferBuilder({
  offer: initialOffer,
  availableItems,
  request,
  initialAdjustments = [],
  onSave,
  onCancel
}: FastOfferBuilderProps) {
  const offerState = useOfferBuilderState({
    initialOffer,
    onUpdate: () => {}
  })

  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false)
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [draggedItem, setDraggedItem] = useState<{ id: string; index: number } | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [adjustments, setAdjustments] = useState<OfferAdjustment[]>(initialAdjustments)
  const [selectedAdjustmentTarget, setSelectedAdjustmentTarget] = useState<{
    type: 'block' | 'item'
    id: string
  } | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const blockScrollRef = useRef<HTMLDivElement>(null)

  const selectedBlock = offerState.offer?.blocks.find(b => b.id === offerState.selectedBlockId)

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'menu':
        return '🍽️'
      case 'menu_item':
        return '🍕'
      case 'equipment':
        return '⚙️'
      case 'service':
        return '👔'
      case 'delivery':
        return '🚚'
      case 'custom':
        return '✏️'
      default:
        return '📦'
    }
  }

  const getItemCategory = (itemType: string) => {
    if (['menu', 'menu_item', 'custom'].includes(itemType)) return 'Food'
    if (itemType === 'equipment') return 'Equipment'
    if (itemType === 'service') return 'Service'
    if (itemType === 'delivery') return 'Delivery'
    return 'Other'
  }

  const groupItemsByCategory = (items: OfferBlockItem[]) => {
    const groups = {
      food: items.filter(i => ['menu', 'menu_item', 'custom'].includes(i.itemType)),
      equipment: items.filter(i => i.itemType === 'equipment'),
      service: items.filter(i => i.itemType === 'service'),
      delivery: items.filter(i => i.itemType === 'delivery')
    }
    return groups
  }

  const getCourseFromDescription = (description?: string) => {
    if (!description) return 'Main Course'
    const lower = description.toLowerCase()
    if (lower.includes('appetizer') || lower.includes('starter')) return 'Appetizers'
    if (lower.includes('salad')) return 'Salads'
    if (lower.includes('main') || lower.includes('entree')) return 'Main Course'
    if (lower.includes('side')) return 'Sides'
    if (lower.includes('dessert')) return 'Desserts'
    if (lower.includes('beverage') || lower.includes('drink')) return 'Beverages'
    return 'Main Course'
  }

  const groupFoodByCourse = (foodItems: any[]) => {
    const courseGroups: { [key: string]: any[] } = {}
    foodItems.forEach(item => {
      const course = getCourseFromDescription(item.itemDescription)
      if (!courseGroups[course]) courseGroups[course] = []
      courseGroups[course].push(item)
    })
    return courseGroups
  }

  const handleAddItem = (item: MenuItem) => {
    if (!offerState.selectedBlockId) {
      toast.error('Select a block first')
      return
    }

    offerState.addItemToBlock(offerState.selectedBlockId, {
      itemType: 'menu_item',
      itemName: item.name,
      itemDescription: item.description,
      menuItemId: item.id,
      quantity: 1,
      unitPriceCents: item.priceCents,
      isOptional: false,
      taxRateBps: 825
    })

    setSearchQuery('')
    setSelectedResultIndex(0)
    searchInputRef.current?.focus()
  }

  const handleSave = async () => {
    if (!offerState.offer) return
    setIsSaving(true)
    try {
      await onSave?.(offerState.offer)
      toast.success('Offer saved')
    } catch {
      toast.error('Failed to save offer')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFiles = files.filter(f => f.type === 'application/pdf')

    if (pdfFiles.length > 0) {
      toast.success(`Dropped ${pdfFiles.length} PDF file(s)`)
    } else {
      toast.error('Only PDF files are supported')
    }
  }

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }

  const handleFileDragLeave = () => {
    setIsDraggingFile(false)
  }

  const handleItemDragStart = (e: React.DragEvent, itemId: string, index: number) => {
    setDraggedItem({ id: itemId, index })
    e.dataTransfer.effectAllowed = 'move'
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleItemDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedItem && draggedItem.index !== index) {
      setDragOverIndex(index)
    }
  }

  const handleItemDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (!draggedItem || !selectedBlock || draggedItem.index === dropIndex) {
      setDragOverIndex(null)
      return
    }

    offerState.reorderItems(selectedBlock.id, draggedItem.index, dropIndex)
    setDragOverIndex(null)
    toast.success('Item reordered')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1
        if (offerState.offer && index < offerState.offer.blocks.length) {
          offerState.setSelectedBlockId(offerState.offer.blocks[index].id)
          toast.info(`Block: ${offerState.offer.blocks[index].name}`)
        }
      }

      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedResultIndex(prev => Math.min(prev + 1, filteredItems.length - 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedResultIndex(prev => Math.max(prev - 1, 0))
        }
        if (e.key === 'Enter' && filteredItems[selectedResultIndex]) {
          e.preventDefault()
          handleAddItem(filteredItems[selectedResultIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [offerState.offer, filteredItems, selectedResultIndex])

  useEffect(() => {
    setSelectedResultIndex(0)
  }, [searchQuery])

  const handleAddAdjustment = (
    targetType: 'block' | 'item',
    targetId: string,
    message: string
  ) => {
    if (!offerState.offer) return

    const newAdjustment: OfferAdjustment = {
      id: `adj-${Date.now()}`,
      offerId: offerState.offer.id,
      requestedBy: 'current-user',
      requestedByType: 'customer',
      requestedAt: new Date().toISOString(),
      adjustmentType: 'special_instruction',
      targetEntity: targetType,
      targetEntityId: targetId,
      changeDescription: message,
      proposedChange: {},
      priceImpactCents: 0,
      status: 'pending',
      comments: []
    }

    setAdjustments(prev => [...prev, newAdjustment])
    toast.success('Adjustment added')
  }

  const handleAddComment = (adjustmentId: string, message: string) => {
    setAdjustments(prev =>
      prev.map(adj => {
        if (adj.id === adjustmentId) {
          const newComment: AdjustmentComment = {
            id: `comment-${Date.now()}`,
            adjustmentId,
            authorId: 'current-user',
            authorType: 'customer',
            message,
            createdAt: new Date().toISOString()
          }
          return { ...adj, comments: [...adj.comments, newComment] }
        }
        return adj
      })
    )
    toast.success('Comment added')
  }

  const handleResolveAdjustment = (adjustmentId: string) => {
    setAdjustments(prev =>
      prev.map(adj =>
        adj.id === adjustmentId ? { ...adj, status: 'approved' as const } : adj
      )
    )
    toast.success('Adjustment resolved')
  }

  const unresolvedAdjustments = adjustments.filter(adj => adj.status === 'pending')

  const totals = offerState.calculateTotals()

  if (!offerState.offer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full max-h-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16 min-w-0">
        {/* Header with Block Pills */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          {/* Block Pills - Horizontal Scroll - Airbnb Style */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAddBlockModalOpen(true)}
              className="flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white hover:shadow-sm transition-all text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="hidden sm:inline">+ Add Block</span>
              <span className="sm:hidden">+</span>
            </button>

            <div
              ref={blockScrollRef}
              className="flex-1 overflow-x-auto flex items-center gap-2 sm:gap-3 pb-2 no-scrollbar"
            >
              {offerState.offer.blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className={`flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border transition-all group ${
                    offerState.selectedBlockId === block.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => offerState.setSelectedBlockId(block.id)}
                      className="flex items-center gap-2.5"
                    >
                      <span
                        className={`text-xs font-medium ${
                          offerState.selectedBlockId === block.id
                            ? 'text-gray-400 dark:text-gray-600'
                            : 'text-gray-500'
                        }`}
                      >
                        Alt+{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm whitespace-nowrap">
                            {block.name}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              offerState.selectedBlockId === block.id
                                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-gray-900'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {block.items.length}
                          </span>
                          {adjustments.some(adj => adj.targetEntityId === block.id && adj.targetEntity === 'block' && adj.status === 'pending') && (
                            <Badge variant="light" color="warning" size="sm" className="rounded-full">
                              {adjustments.filter(adj => adj.targetEntityId === block.id && adj.targetEntity === 'block' && adj.status === 'pending').length}
                            </Badge>
                          )}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${
                            offerState.selectedBlockId === block.id
                              ? 'text-gray-300 dark:text-gray-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {block.date} • {block.startTime}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 ml-2 border-l pl-2 border-gray-300 dark:border-gray-600">
                      <button
                        onClick={() => {
                          const newName = prompt('Edit block name:', block.name)
                          if (newName) offerState.updateBlock(block.id, { name: newName })
                        }}
                        className={`p-1 rounded-full transition-all ${
                          offerState.selectedBlockId === block.id
                            ? 'hover:bg-white/20 dark:hover:bg-black/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title="Edit block"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAdjustmentTarget({
                            type: 'block',
                            id: block.id,
                            name: block.name
                          })
                          setIsAdjustmentModalOpen(true)
                        }}
                        className={`p-1 rounded-full transition-all ${
                          offerState.selectedBlockId === block.id
                            ? 'hover:bg-white/20 dark:hover:bg-black/20'
                            : 'hover:bg-blue-50 dark:hover:bg-blue-500/10'
                        } text-blue-600`}
                        title="Add adjustment to block"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this block?')) {
                            offerState.deleteBlock(block.id)
                          }
                        }}
                        className={`p-1 rounded-full transition-all ${
                          offerState.selectedBlockId === block.id
                            ? 'hover:bg-red-500/20'
                            : 'hover:bg-red-50 dark:hover:bg-red-500/10'
                        } text-error-600`}
                        title="Delete block"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Request Info Pills */}
        {request && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Request:</span>
              {request.eventType && (
                <Badge variant="light" color="primary" size="sm" className="rounded-full flex-shrink-0">
                  {request.eventType}
                </Badge>
              )}
              {request.guestCount && (
                <Badge variant="light" color="info" size="sm" className="rounded-full flex-shrink-0">
                  {request.guestCount} guests
                </Badge>
              )}
              {request.eventDate && (
                <Badge variant="light" color="light" size="sm" className="rounded-full flex-shrink-0">
                  📅 {request.eventDate}
                </Badge>
              )}
              {request.budgetMin && request.budgetMax && (
                <Badge variant="light" color="success" size="sm" className="rounded-full flex-shrink-0">
                  ${request.budgetMin}-${request.budgetMax}
                </Badge>
              )}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="ml-auto text-xs text-brand-600 dark:text-brand-400 hover:underline flex-shrink-0"
              >
                View Details →
              </button>
            </div>
          </div>
        )}

        {/* Quick Search */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="relative">
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search items to add... (Press /)"
              autoFocus
              className="rounded-full border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow pl-4 sm:pl-5 pr-4 sm:pr-32 text-sm w-full"
            />
            {selectedBlock && (
              <div className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2">
                <Badge variant="light" color="primary" size="sm" className="rounded-full">
                  → {selectedBlock.name}
                </Badge>
              </div>
            )}

            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-30">
                {filteredItems.length > 0 ? (
                  filteredItems.slice(0, 5).map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className={`w-full px-5 py-3 text-left transition-all flex items-center justify-between first:rounded-t-2xl last:rounded-b-2xl ${
                        idx === selectedResultIndex
                          ? 'bg-gray-50 dark:bg-gray-700/50'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-gray-500 capitalize mt-0.5">
                          {item.category}
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        ${(item.priceCents / 100).toFixed(2)}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center text-sm text-gray-500">
                    No items found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Block Content - Organized Sections */}
        <div className="flex-1 overflow-y-auto pt-3 sm:pt-4 pb-24 sm:pb-20">
          {selectedBlock ? (
            <div className="space-y-4 sm:space-y-6">
              {(() => {
                const groups = groupItemsByCategory(selectedBlock.items)
                const foodByCourse = groupFoodByCourse(groups.food)

                return (
                  <>
                    {/* Food Section - Organized by Course */}
                    {Object.keys(foodByCourse).length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-2xl">🍽️</span>
                            Food & Beverages
                            <span className="text-sm font-normal text-gray-500">
                              ({groups.food.length} items)
                            </span>
                          </h3>
                        </div>
                        <div>
                          {Object.entries(foodByCourse).map(([course, items], idx, arr) => (
                            <div
                              key={course}
                              className={`px-3 sm:px-6 pt-4 sm:pt-6 ${
                                idx === arr.length - 1 ? 'pb-4 sm:pb-6' : ''
                              }`}
                            >
                              <h4 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                                {course}
                                <span className="text-xs font-normal text-gray-500">
                                  ({items.length})
                                </span>
                              </h4>
                              <div className="space-y-2">
                                {items.map((item: any) => {
                                  const itemIndex = selectedBlock.items.findIndex(
                                    i => i.id === item.id
                                  )
                                  return (
                                    <div
                                      key={item.id}
                                      draggable
                                      onDragStart={e =>
                                        handleItemDragStart(e, item.id, itemIndex)
                                      }
                                      onDragEnd={handleItemDragEnd}
                                      onDragOver={e =>
                                        handleItemDragOver(e, itemIndex)
                                      }
                                      onDrop={e => handleItemDrop(e, itemIndex)}
                                      className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all cursor-move border-2 ${
                                        dragOverIndex === itemIndex &&
                                        draggedItem?.index !== itemIndex
                                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                          : 'border-gray-200 dark:border-gray-700'
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                          <svg
                                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M7 2a2 2 0 10-.001 4.001A2 2 0 007 2zm0 6a2 2 0 10-.001 4.001A2 2 0 007 8zm0 6a2 2 0 10-.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10-.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10-.001 4.001A2 2 0 0013 14z" />
                                          </svg>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <div className="font-semibold text-sm">
                                                {item.itemName}
                                              </div>
                                              {adjustments.some(adj => adj.targetEntityId === item.id && adj.targetEntity === 'item') && (
                                                <Badge variant="light" color="warning" size="sm" className="rounded-full flex-shrink-0">
                                                  {adjustments.filter(adj => adj.targetEntityId === item.id && adj.targetEntity === 'item' && adj.status === 'pending').length}
                                                </Badge>
                                              )}
                                            </div>
                                            {item.itemDescription && (
                                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                {item.itemDescription}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div
                                          className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap"
                                          onMouseDown={e => e.stopPropagation()}
                                        >
                                          <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={e =>
                                              offerState.updateItem(
                                                selectedBlock.id,
                                                item.id,
                                                {
                                                  quantity: Number(
                                                    e.target.value
                                                  )
                                                }
                                              )
                                            }
                                            min={1}
                                            className="w-16 px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                            draggable={false}
                                          />
                                          <span className="text-xs text-gray-500">
                                            ×
                                          </span>
                                          <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                              $
                                            </span>
                                            <input
                                              type="number"
                                              value={(
                                                item.unitPriceCents / 100
                                              ).toFixed(2)}
                                              onChange={e =>
                                                offerState.updateItem(
                                                  selectedBlock.id,
                                                  item.id,
                                                  {
                                                    unitPriceCents: Math.round(
                                                      Number(
                                                        e.target.value
                                                      ) * 100
                                                    )
                                                  }
                                                )
                                              }
                                              step={0.01}
                                              className="w-24 px-2 py-1.5 pl-5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                              draggable={false}
                                            />
                                          </div>
                                          <span className="text-sm font-bold min-w-[80px] text-right">
                                            $
                                            {(
                                              item.lineItemTotal / 100
                                            ).toFixed(2)}
                                          </span>
                                          <button
                                            onClick={() => {
                                              setSelectedAdjustmentTarget({
                                                type: 'item',
                                                id: item.id
                                              })
                                              setIsAdjustmentModalOpen(true)
                                            }}
                                            className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                            title="Add adjustment"
                                          >
                                            <svg
                                              className="w-4 h-4"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                              />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() =>
                                              offerState.deleteItem(
                                                selectedBlock.id,
                                                item.id
                                              )
                                            }
                                            className="p-1.5 rounded-full text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10"
                                          >
                                            <svg
                                              className="w-4 h-4"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Equipment Section */}
                    {groups.equipment.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-2xl">⚙️</span>
                            Equipment
                            <span className="text-sm font-normal text-gray-500">
                              ({groups.equipment.length} items)
                            </span>
                          </h3>
                        </div>
                        <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6 space-y-2">
                          {groups.equipment.map((item: any) => {
                            const itemIndex = selectedBlock.items.findIndex(
                              i => i.id === item.id
                            )
                            return (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={e =>
                                  handleItemDragStart(e, item.id, itemIndex)
                                }
                                onDragEnd={handleItemDragEnd}
                                onDragOver={e =>
                                  handleItemDragOver(e, itemIndex)
                                }
                                onDrop={e => handleItemDrop(e, itemIndex)}
                                className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all cursor-move border-2 ${
                                  dragOverIndex === itemIndex &&
                                  draggedItem?.index !== itemIndex
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <svg
                                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M7 2a2 2 0 10-.001 4.001A2 2 0 007 2zm0 6a2 2 0 10-.001 4.001A2 2 0 007 8zm0 6a2 2 0 10-.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10-.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10-.001 4.001A2 2 0 0013 14z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div className="font-semibold text-sm">
                                          {item.itemName}
                                        </div>
                                        {adjustments.some(adj => adj.targetEntityId === item.id && adj.targetEntity === 'item') && (
                                          <Badge variant="light" color="warning" size="sm" className="rounded-full flex-shrink-0">
                                            {adjustments.filter(adj => adj.targetEntityId === item.id && adj.targetEntity === 'item' && adj.status === 'pending').length}
                                          </Badge>
                                        )}
                                      </div>
                                      {item.itemDescription && (
                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                          {item.itemDescription}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap"
                                    onMouseDown={e => e.stopPropagation()}
                                  >
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={e =>
                                        offerState.updateItem(
                                          selectedBlock.id,
                                          item.id,
                                          { quantity: Number(e.target.value) }
                                        )
                                      }
                                      min={1}
                                      className="w-16 px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                      draggable={false}
                                    />
                                    <span className="text-xs text-gray-500">
                                      ×
                                    </span>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                        $
                                      </span>
                                      <input
                                        type="number"
                                        value={(
                                          item.unitPriceCents / 100
                                        ).toFixed(2)}
                                        onChange={e =>
                                          offerState.updateItem(
                                            selectedBlock.id,
                                            item.id,
                                            {
                                              unitPriceCents: Math.round(
                                                Number(e.target.value) * 100
                                              )
                                            }
                                          )
                                        }
                                        step={0.01}
                                        className="w-24 px-2 py-1.5 pl-5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                        draggable={false}
                                      />
                                    </div>
                                    <span className="text-sm font-bold min-w-[80px] text-right">
                                      $
                                      {(item.lineItemTotal / 100).toFixed(2)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedAdjustmentTarget({
                                          type: 'item',
                                          id: item.id
                                        })
                                        setIsAdjustmentModalOpen(true)
                                      }}
                                      className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                      title="Add adjustment"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() =>
                                        offerState.deleteItem(
                                          selectedBlock.id,
                                          item.id
                                        )
                                      }
                                      className="p-1.5 rounded-full text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Service Section */}
                    {groups.service.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-2xl">👔</span>
                            Service
                            <span className="text-sm font-normal text-gray-500">
                              ({groups.service.length} items)
                            </span>
                          </h3>
                        </div>
                        <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6 space-y-2">
                          {groups.service.map((item: any) => {
                            const itemIndex = selectedBlock.items.findIndex(
                              i => i.id === item.id
                            )
                            return (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={e =>
                                  handleItemDragStart(e, item.id, itemIndex)
                                }
                                onDragEnd={handleItemDragEnd}
                                onDragOver={e =>
                                  handleItemDragOver(e, itemIndex)
                                }
                                onDrop={e => handleItemDrop(e, itemIndex)}
                                className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all cursor-move border-2 ${
                                  dragOverIndex === itemIndex &&
                                  draggedItem?.index !== itemIndex
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <svg
                                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M7 2a2 2 0 10-.001 4.001A2 2 0 007 2zm0 6a2 2 0 10-.001 4.001A2 2 0 007 8zm0 6a2 2 0 10-.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10-.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10-.001 4.001A2 2 0 0013 14z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div className="font-semibold text-sm">
                                          {item.itemName}
                                        </div>
                                        {adjustments.some(adj => adj.targetEntityId === item.id && adj.targetEntity === 'item') && (
                                          <Badge variant="light" color="warning" size="sm" className="rounded-full flex-shrink-0">
                                            {adjustments.filter(adj => adj.targetEntityId === item.id && adj.targetEntity === 'item' && adj.status === 'pending').length}
                                          </Badge>
                                        )}
                                      </div>
                                      {item.itemDescription && (
                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                          {item.itemDescription}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap"
                                    onMouseDown={e => e.stopPropagation()}
                                  >
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={e =>
                                        offerState.updateItem(
                                          selectedBlock.id,
                                          item.id,
                                          { quantity: Number(e.target.value) }
                                        )
                                      }
                                      min={1}
                                      className="w-16 px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                      draggable={false}
                                    />
                                    <span className="text-xs text-gray-500">
                                      ×
                                    </span>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                        $
                                      </span>
                                      <input
                                        type="number"
                                        value={(
                                          item.unitPriceCents / 100
                                        ).toFixed(2)}
                                        onChange={e =>
                                          offerState.updateItem(
                                            selectedBlock.id,
                                            item.id,
                                            {
                                              unitPriceCents: Math.round(
                                                Number(e.target.value) * 100
                                              )
                                            }
                                          )
                                        }
                                        step={0.01}
                                        className="w-24 px-2 py-1.5 pl-5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                        draggable={false}
                                      />
                                    </div>
                                    <span className="text-sm font-bold min-w-[80px] text-right">
                                      $
                                      {(item.lineItemTotal / 100).toFixed(2)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedAdjustmentTarget({
                                          type: 'item',
                                          id: item.id
                                        })
                                        setIsAdjustmentModalOpen(true)
                                      }}
                                      className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                      title="Add adjustment"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() =>
                                        offerState.deleteItem(
                                          selectedBlock.id,
                                          item.id
                                        )
                                      }
                                      className="p-1.5 rounded-full text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Delivery Section */}
                    {groups.delivery.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-2xl">🚚</span>
                            Delivery
                            <span className="text-sm font-normal text-gray-500">
                              ({groups.delivery.length} items)
                            </span>
                          </h3>
                        </div>
                        <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6 space-y-2">
                          {groups.delivery.map((item: any) => {
                            const itemIndex = selectedBlock.items.findIndex(
                              i => i.id === item.id
                            )
                            return (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={e =>
                                  handleItemDragStart(e, item.id, itemIndex)
                                }
                                onDragEnd={handleItemDragEnd}
                                onDragOver={e =>
                                  handleItemDragOver(e, itemIndex)
                                }
                                onDrop={e => handleItemDrop(e, itemIndex)}
                                className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all cursor-move border-2 ${
                                  dragOverIndex === itemIndex &&
                                  draggedItem?.index !== itemIndex
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <svg
                                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M7 2a2 2 0 10-.001 4.001A2 2 0 007 2zm0 6a2 2 0 10-.001 4.001A2 2 0 007 8zm0 6a2 2 0 10-.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10-.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10-.001 4.001A2 2 0 0013 14z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div className="font-semibold text-sm">
                                          {item.itemName}
                                        </div>
                                        {adjustments.some(adj => adj.targetEntityId === item.id && adj.targetEntity === 'item') && (
                                          <Badge variant="light" color="warning" size="sm" className="rounded-full flex-shrink-0">
                                            {adjustments.filter(adj => adj.targetEntityId === item.id && adj.targetEntity === 'item' && adj.status === 'pending').length}
                                          </Badge>
                                        )}
                                      </div>
                                      {item.itemDescription && (
                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                          {item.itemDescription}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap"
                                    onMouseDown={e => e.stopPropagation()}
                                  >
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={e =>
                                        offerState.updateItem(
                                          selectedBlock.id,
                                          item.id,
                                          { quantity: Number(e.target.value) }
                                        )
                                      }
                                      min={1}
                                      className="w-16 px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                      draggable={false}
                                    />
                                    <span className="text-xs text-gray-500">
                                      ×
                                    </span>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                        $
                                      </span>
                                      <input
                                        type="number"
                                        value={(
                                          item.unitPriceCents / 100
                                        ).toFixed(2)}
                                        onChange={e =>
                                          offerState.updateItem(
                                            selectedBlock.id,
                                            item.id,
                                            {
                                              unitPriceCents: Math.round(
                                                Number(e.target.value) * 100
                                              )
                                            }
                                          )
                                        }
                                        step={0.01}
                                        className="w-24 px-2 py-1.5 pl-5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                        draggable={false}
                                      />
                                    </div>
                                    <span className="text-sm font-bold min-w-[80px] text-right">
                                      $
                                      {(item.lineItemTotal / 100).toFixed(2)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedAdjustmentTarget({
                                          type: 'item',
                                          id: item.id
                                        })
                                        setIsAdjustmentModalOpen(true)
                                      }}
                                      className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                      title="Add adjustment"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() =>
                                        offerState.deleteItem(
                                          selectedBlock.id,
                                          item.id
                                        )
                                      }
                                      className="p-1.5 rounded-full text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {selectedBlock.items.length === 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
                        <div className="text-gray-400 dark:text-gray-500">
                          <div className="text-4xl mb-3">🔍</div>
                          <p className="text-sm font-medium">No items yet</p>
                          <p className="text-xs mt-1">
                            Press{' '}
                            <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 font-mono text-xs">
                              /
                            </kbd>{' '}
                            to search and add items
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3">👆</div>
                <p>Select a block from above</p>
                <p className="text-sm mt-1">or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar - Airbnb Style - Constrained */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-6 sm:right-6 z-50 pb-0 sm:pb-6 pointer-events-none">
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 border-t sm:border border-gray-200 dark:border-gray-700 sm:rounded-3xl px-4 sm:px-8 py-3 sm:py-5 shadow-2xl pointer-events-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-8">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 overflow-x-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="font-bold text-lg">
                  ${(totals.subtotalCents / 100).toFixed(2)}
                </span>
              </div>

              <div className="hidden md:flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Discount
                </span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={(totals.discountCents / 100).toFixed(2)}
                    onChange={e => {
                      if (offerState.offer) {
                        offerState.setOffer({
                          ...offerState.offer,
                          discountCents: Math.round(Number(e.target.value) * 100)
                        })
                      }
                    }}
                    step={0.01}
                    min={0}
                    className="w-24 px-2 py-1 pl-6 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="hidden sm:flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tax
                </span>
                <span className="font-semibold text-sm sm:text-base">
                  ${(totals.taxCents / 100).toFixed(2)}
                </span>
              </div>

              <div className="hidden sm:block h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </span>
                <span className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">
                  ${(totals.totalCents / 100).toFixed(2)}
                </span>
              </div>

              <div className="hidden sm:block text-xs text-gray-500">
                {offerState.getTotalItems()} items •{' '}
                {offerState.offer?.blocks.length || 0} blocks
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onCancel}
                size="sm"
                className="hidden sm:flex rounded-full px-4 sm:px-6 hover:shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="flex-1 sm:flex-none rounded-full px-4 sm:px-6 hover:shadow-sm text-xs sm:text-sm"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="flex-1 sm:flex-none rounded-full px-6 sm:px-8 shadow-md hover:shadow-lg bg-gray-900 hover:bg-gray-800 dark:bg:white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs sm:text-sm"
              >
                {isSaving ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* Backdrop */}
      {request && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-9999 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Right Drawer */}
      {request && (
        <div className={`fixed inset-y-0 right-0 w-full sm:w-96 lg:w-[28rem] bg-white dark:bg-gray-800 shadow-2xl z-999999 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-xl">Request Details</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Request Info Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Event Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Event Type</span>
                      <p className="font-medium">
                        {request.eventType || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Date</span>
                      <p className="font-medium">
                        {request.eventDate || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Guest Count</span>
                      <p className="font-medium">
                        {request.guestCount || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                {request.dietaryRequirements &&
                  request.dietaryRequirements.length > 0 && (
                    <>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Dietary Requirements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {request.dietaryRequirements.map(
                            (req: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="light"
                                color="primary"
                                size="sm"
                                className="rounded-full"
                              >
                                {req}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                      <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                    </>
                  )}

                {request.budgetMin && request.budgetMax && (
                  <>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Budget Range
                      </h4>
                      <p className="font-medium">
                        ${request.budgetMin} - ${request.budgetMax}
                      </p>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  </>
                )}

                {request.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Adjustments Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Adjustments & Comments
                  </h4>
                  {unresolvedAdjustments.length > 0 && (
                    <Badge variant="light" color="warning" size="sm" className="rounded-full">
                      {unresolvedAdjustments.length} pending
                    </Badge>
                  )}
                </div>

                {adjustments.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <div className="text-2xl mb-2 text-gray-400">💬</div>
                    <p className="text-xs text-gray-500">No adjustments yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click the chat icon on items to request changes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adjustments.map(adjustment => (
                      <AdjustmentThread
                        key={adjustment.id}
                        adjustment={adjustment}
                        onAddComment={message =>
                          handleAddComment(adjustment.id, message)
                        }
                        onResolve={() =>
                          handleResolveAdjustment(adjustment.id)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* PDF Attachments Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Attachments
                </h4>
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 text-center cursor-pointer hover:border-brand-500 dark:hover:border-brand-400 transition-all"
                  onDrop={handleFileDrop}
                  onDragOver={handleFileDragOver}
                  onDragLeave={handleFileDragLeave}
                >
                  {isDraggingFile ? (
                    <div className="animate-pulse">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        Drop files here
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2 text-gray-400">📎</div>
                      <p className="text-xs font-medium mb-2">Attach Documents</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Drag & drop or click to browse
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'application/pdf'
                          input.multiple = true
                          input.onchange = e => {
                            const files = Array.from(
                              (e.target as HTMLInputElement).files || []
                            )
                            if (files.length > 0) {
                              handleFileDrop({
                                preventDefault: () => {},
                                dataTransfer: { files }
                              } as any)
                            }
                          }
                          input.click()
                        }}
                        className="rounded-full px-4 text-xs"
                      >
                        Browse
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Drawer Button */}
      {request && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed right-6 top-24 z-30 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">
            Request Info
          </span>
          {unresolvedAdjustments.length > 0 && (
            <Badge variant="light" color="warning" size="sm">
              {unresolvedAdjustments.length}
            </Badge>
          )}
        </button>
      )}

      {/* Modals */}
      <AddBlockModal
        isOpen={isAddBlockModalOpen}
        onClose={() => setIsAddBlockModalOpen(false)}
        onAdd={block => {
          offerState.addBlock(block)
          setIsAddBlockModalOpen(false)
        }}
      />

      <AddAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false)
          setSelectedAdjustmentTarget(null)
        }}
        onAdd={message => {
          if (selectedAdjustmentTarget) {
            handleAddAdjustment(
              selectedAdjustmentTarget.type,
              selectedAdjustmentTarget.id,
              message
            )
          }
        }}
        targetName={
          selectedAdjustmentTarget
            ? selectedAdjustmentTarget.type === 'block'
              ? offerState.offer?.blocks.find(
                  b => b.id === selectedAdjustmentTarget.id
                )?.name || 'Block'
              : offerState.offer?.blocks
                  .flatMap(b => b.items)
                  .find(i => i.id === selectedAdjustmentTarget.id)?.itemName ||
                'Item'
            : ''
        }
        targetType={selectedAdjustmentTarget?.type || 'item'}
      />
    </div>
  )
}
