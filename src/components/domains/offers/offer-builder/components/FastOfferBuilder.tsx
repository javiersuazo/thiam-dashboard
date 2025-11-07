'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('offers.builder')
  const offerState = useOfferBuilderState({
    initialOffer,
    onUpdate: () => {}
  })

  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [draggedItem, setDraggedItem] = useState<{ id: string; index: number } | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [adjustments, setAdjustments] = useState<OfferAdjustment[]>(initialAdjustments)
  const [sidebarTab, setSidebarTab] = useState<'request' | 'adjustments'>('request')
  const [activeCommentBox, setActiveCommentBox] = useState<{
    type: 'block' | 'item'
    id: string
    name: string
  } | null>(null)
  const [commentText, setCommentText] = useState('')
  const [commentPhotos, setCommentPhotos] = useState<File[]>([])
  const [lastAdjustmentId, setLastAdjustmentId] = useState<string | null>(null)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [previousTotal, setPreviousTotal] = useState<number | null>(null)
  const [priceChangeDirection, setPriceChangeDirection] = useState<'up' | 'down' | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const priceChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const blockScrollRef = useRef<HTMLDivElement>(null)

  const selectedBlock = offerState.offer?.blocks.find(b => b.id === offerState.selectedBlockId)

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group items by sections
  const foodItems = availableItems.filter(item =>
    item.type === 'menu_item' && ['Appetizer', 'Main Course', 'Side', 'Dessert', 'Beverage'].includes(item.category || '')
  )
  const equipmentItems = availableItems.filter(item => item.type === 'equipment')
  const serviceItems = availableItems.filter(item => item.type === 'service')
  const deliveryItems = availableItems.filter(item => item.type === 'delivery')

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

  const calculateSmartQuantity = (item: MenuItem) => {
    const selectedBlock = offerState.offer?.blocks.find(b => b.id === offerState.selectedBlockId)
    const headcount = selectedBlock?.headcount || request?.guestCount || 1
    const desc = item.description?.toLowerCase() || ''

    // Beverages: 1-1.5 per person
    if (desc.includes('beverage') || desc.includes('drink') || desc.includes('coffee') || desc.includes('juice')) {
      return Math.ceil(headcount * 1.2)
    }

    // Appetizers/Sides: 0.5-0.75 per person (shared)
    if (desc.includes('appetizer') || desc.includes('side') || desc.includes('salad')) {
      return Math.ceil(headcount * 0.6)
    }

    // Desserts: 0.8 per person
    if (desc.includes('dessert')) {
      return Math.ceil(headcount * 0.8)
    }

    // Main courses: 1 per person
    if (desc.includes('main') || desc.includes('entree')) {
      return headcount
    }

    // Default: 1 per person
    return headcount
  }

  const handleAddItem = (item: MenuItem) => {
    if (!offerState.selectedBlockId) {
      toast.error('Select a block first')
      return
    }

    const smartQuantity = calculateSmartQuantity(item)

    offerState.addItemToBlock(offerState.selectedBlockId, {
      itemType: 'menu_item',
      itemName: item.name,
      itemDescription: item.description,
      menuItemId: item.id,
      quantity: smartQuantity,
      unitPriceCents: item.priceCents,
      isOptional: false,
      taxRateBps: 825
    })

    toast.success(`Added ${item.name}`, {
      description: `Auto-filled ${smartQuantity} based on ${offerState.offer?.blocks.find(b => b.id === offerState.selectedBlockId)?.headcount || 'guest'} guests`
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
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault()
        setShowShortcutsModal(true)
      }

      if (e.key === 'Escape') {
        setShowShortcutsModal(false)
      }

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

  useEffect(() => {
    const currentTotal = offerState.calculateTotals().totalCents
    if (previousTotal !== null && previousTotal !== currentTotal) {
      if (currentTotal > previousTotal) {
        setPriceChangeDirection('up')
      } else if (currentTotal < previousTotal) {
        setPriceChangeDirection('down')
      }

      if (priceChangeTimeoutRef.current) {
        clearTimeout(priceChangeTimeoutRef.current)
      }

      priceChangeTimeoutRef.current = setTimeout(() => {
        setPriceChangeDirection(null)
      }, 2000)
    }
    setPreviousTotal(currentTotal)
  }, [offerState.offer])

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isRightSwipe = distance < -minSwipeDistance

    if (isRightSwipe && !isSidebarOpen) {
      setIsSidebarOpen(true)
    } else if (distance > minSwipeDistance && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }

  const handleUndoAdjustment = (adjustmentId: string) => {
    setAdjustments(prev => prev.filter(a => a.id !== adjustmentId))
    setLastAdjustmentId(null)
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }
    toast.info('Adjustment removed')
  }

  const handleAddAdjustment = (
    targetType: 'block' | 'item',
    targetId: string,
    targetName: string,
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
    setLastAdjustmentId(newAdjustment.id)

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }

    undoTimeoutRef.current = setTimeout(() => {
      setLastAdjustmentId(null)
    }, 5000)

    toast.success('✓ Adjustment sent to caterer!', {
      description: 'They typically respond within 2-4 hours',
      action: {
        label: 'Undo',
        onClick: () => handleUndoAdjustment(newAdjustment.id)
      }
    })
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
    <>
      {/* Print-optimized styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* Hide UI elements */
          nav,
          button,
          aside,
          [class*="fixed"],
          header {
            display: none !important;
          }

          /* Show print-only elements */
          .print\\:block {
            display: block !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Prevent page breaks inside blocks */
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Reset positioning for print */
          .print\\:static {
            position: static !important;
          }

          .print\\:pt-0 {
            padding-top: 0 !important;
          }

          .print\\:pb-0 {
            padding-bottom: 0 !important;
          }

          .print\\:max-w-none {
            max-width: none !important;
          }

          .print\\:shadow-none {
            box-shadow: none !important;
          }

          .print\\:rounded-lg {
            border-radius: 0.5rem !important;
          }

          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }

          .print\\:mt-8 {
            margin-top: 2rem !important;
          }

          .print\\:border {
            border-width: 1px !important;
          }

          .print\\:border-gray-900 {
            border-color: #111827 !important;
          }

          .print\\:bg-white {
            background-color: white !important;
          }

          .print\\:overflow-visible {
            overflow: visible !important;
          }

          /* Preserve backgrounds and colors */
          .bg-gradient-to-br {
            background: #f9fafb !important;
          }

          .bg-white\\/50 {
            background: #ffffff !important;
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>

    <div className="flex h-full max-h-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden print:bg-white print:overflow-visible">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16 min-w-0">
        {/* Header with Block Pills */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {offerState.offer.title}
            </h2>

            {/* View Mode Toggle & Actions */}
            <div className="flex items-center gap-2">
              {/* Share Preview Button - Only in Preview Mode */}
              {viewMode === 'preview' && (
                <button
                  onClick={() => {
                    const previewUrl = `${window.location.origin}/en/offers/${offerState.offer.id}/preview`
                    window.open(previewUrl, '_blank')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 print:hidden"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="hidden sm:inline">Open Customer View</span>
                  <span className="sm:hidden">Share</span>
                </button>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1 print:hidden">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    viewMode === 'edit'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span>✏️</span>
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    viewMode === 'preview'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span>👁️</span>
                  <span className="hidden sm:inline">Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Block Pills - Horizontal Scroll - Airbnb Style - Only in Edit Mode */}
          {viewMode === 'edit' && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsAddBlockModalOpen(true)}
                className="flex-shrink-0 px-4 sm:px-5 py-3 sm:py-2.5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white hover:shadow-sm transition-all text-sm sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white min-h-[44px] active:scale-95"
              >
                <span className="hidden sm:inline">{t('addBlockShort')}</span>
                <span className="sm:hidden">+</span>
              </button>

            <div
              ref={blockScrollRef}
              className="flex-1 overflow-x-auto flex items-center gap-2 sm:gap-3 pb-2 no-scrollbar"
            >
              {offerState.offer.blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className={`flex-shrink-0 px-4 sm:px-5 py-3 sm:py-2.5 rounded-full border transition-all group min-h-[44px] ${
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
                          setIsSidebarOpen(true)
                          setSidebarTab('adjustments')
                          setActiveCommentBox({
                            type: 'block',
                            id: block.id,
                            name: block.name
                          })
                          setCommentText('')
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
          )}
        </div>

        {/* Request Info Pills - Only in Edit Mode */}
        {viewMode === 'edit' && request && (
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

        {/* Quick Search - Only in Edit Mode */}
        {viewMode === 'edit' && (
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

            {/* Show All Catalog Sections */}
            {!searchQuery && (
              <div className="mt-4 space-y-6">
                {/* Food & Beverage Section */}
                {foodItems.length > 0 && (
                  <div id="catalog-food" className="scroll-mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🍽️</span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Food & Beverage</h3>
                    </div>
                    <div className="space-y-3">
                      {['Appetizer', 'Main Course', 'Side', 'Dessert', 'Beverage'].map(category => {
                        const categoryItems = foodItems.filter(item => item.category === category)
                        if (categoryItems.length === 0) return null

                        return (
                          <div key={category} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                              {category}
                            </h4>
                            <div className="space-y-1">
                              {categoryItems.map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => handleAddItem(item)}
                                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all text-left group"
                                >
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                    {item.description && (
                                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-3">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      ${(item.priceCents / 100).toFixed(2)}
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                      ➕
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Equipment Section */}
                {equipmentItems.length > 0 && (
                  <div id="catalog-equipment" className="scroll-mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">⚙️</span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Equipment</h3>
                    </div>
                    <div className="space-y-2">
                      {equipmentItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleAddItem(item)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all text-left group border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              ${(item.priceCents / 100).toFixed(2)}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              ➕
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Section */}
                {serviceItems.length > 0 && (
                  <div id="catalog-service" className="scroll-mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">👔</span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Service</h3>
                    </div>
                    <div className="space-y-2">
                      {serviceItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleAddItem(item)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all text-left group border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              ${(item.priceCents / 100).toFixed(2)}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              ➕
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Section */}
                {deliveryItems.length > 0 && (
                  <div id="catalog-delivery" className="scroll-mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🚚</span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Delivery</h3>
                    </div>
                    <div className="space-y-2">
                      {deliveryItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleAddItem(item)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all text-left group border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              ${(item.priceCents / 100).toFixed(2)}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              ➕
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Block Content - Organized Sections - Only in Edit Mode */}
        {viewMode === 'edit' && (
        <div className="flex-1 overflow-y-auto pt-3 sm:pt-4 pb-24 sm:pb-20 bg-transparent">
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
                                    <div key={item.id} className="relative">
                                      {/* Drop Indicator */}
                                      {dragOverIndex === itemIndex && draggedItem?.index !== itemIndex && (
                                        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-brand-500 rounded-full animate-pulse">
                                          <div className="absolute left-0 -top-1.5 w-3 h-3 bg-brand-500 rounded-full"></div>
                                          <div className="absolute right-0 -top-1.5 w-3 h-3 bg-brand-500 rounded-full"></div>
                                        </div>
                                      )}

                                      <div
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
                                        draggedItem?.id === item.id
                                          ? 'opacity-40 scale-95 border-dashed border-gray-400 dark:border-gray-500'
                                          : dragOverIndex === itemIndex &&
                                            draggedItem?.index !== itemIndex
                                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg'
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
                                              setIsSidebarOpen(true)
                                              setSidebarTab('adjustments')
                                              setActiveCommentBox({
                                                type: 'item',
                                                id: item.id,
                                                name: item.itemName
                                              })
                                              setCommentText('')
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
        )}

        {/* Preview Mode - Customer View */}
        {viewMode === 'preview' && (
          <div className="flex-1 overflow-y-auto pt-4 sm:pt-6 pb-24 sm:pb-20 px-4 sm:px-6 bg-transparent print:pt-0 print:pb-0">
            <div className="max-w-4xl mx-auto space-y-6 print:max-w-none">
              {/* PDF Header - Only visible when printing */}
              <div className="hidden print:block mb-8">
                <div className="border-b-4 border-gray-900 pb-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Catering Proposal
                      </h1>
                      <p className="text-lg text-gray-600">{offerState.offer.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Proposal ID</div>
                      <div className="font-mono text-sm font-semibold">{offerState.offer.id}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        Generated: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {request && (
                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Event Type</div>
                        <div className="font-semibold">{request.eventType}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Event Date</div>
                        <div className="font-semibold">{request.eventDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Guest Count</div>
                        <div className="font-semibold">{request.guestCount} guests</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {offerState.offer.blocks.map((block, index) => {
                const blockTotal = block.items.reduce((sum, item) => sum + item.lineItemTotal, 0)
                const groups = groupItemsByCategory(block.items)

                return (
                  <div key={block.id} className="relative print:break-inside-avoid">
                    {/* Timeline Connector */}
                    {index < offerState.offer.blocks.length - 1 && (
                      <div className="absolute left-6 top-full h-6 w-0.5 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600 z-0 print:hidden" />
                    )}

                    {/* Block Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow print:shadow-none print:rounded-lg print:mb-6">
                      {/* Block Header */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xl font-bold text-gray-900 dark:text-gray-100">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                  {block.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {block.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${(blockTotal / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">subtotal</div>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 mb-0.5">Date</div>
                            <div className="font-semibold text-sm">{block.date}</div>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 mb-0.5">Service Time</div>
                            <div className="font-semibold text-sm">{block.startTime} - {block.endTime}</div>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 mb-0.5">Guests</div>
                            <div className="font-semibold text-sm">{block.headcount || 'TBD'}</div>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 mb-0.5">Location</div>
                            <div className="font-semibold text-sm truncate">{block.location || 'TBD'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Block Items - Grouped */}
                      <div className="p-6 space-y-6">
                        {/* Food Items */}
                        {groups.food.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl">🍽️</span>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Menu Items</h4>
                            </div>
                            <div className="space-y-2">
                              {groups.food.map(item => (
                                <div key={item.id} className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{item.itemName}</div>
                                    {item.itemDescription && (
                                      <div className="text-sm text-gray-500">{item.itemDescription}</div>
                                    )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-sm text-gray-500">×{item.quantity}</div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                      ${(item.lineItemTotal / 100).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Equipment */}
                        {groups.equipment.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl">🔧</span>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Equipment & Rentals</h4>
                            </div>
                            <div className="space-y-2">
                              {groups.equipment.map(item => (
                                <div key={item.id} className="flex items-start justify-between gap-3 py-2">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.itemName}</div>
                                    {item.itemDescription && (
                                      <div className="text-sm text-gray-500">{item.itemDescription}</div>
                                    )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-sm text-gray-500">×{item.quantity}</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      ${(item.lineItemTotal / 100).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Service */}
                        {groups.service.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl">👔</span>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Service & Staff</h4>
                            </div>
                            <div className="space-y-2">
                              {groups.service.map(item => (
                                <div key={item.id} className="flex items-start justify-between gap-3 py-2">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.itemName}</div>
                                    {item.itemDescription && (
                                      <div className="text-sm text-gray-500">{item.itemDescription}</div>
                                    )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-sm text-gray-500">×{item.quantity}</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      ${(item.lineItemTotal / 100).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery */}
                        {groups.delivery.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl">🚚</span>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Delivery & Setup</h4>
                            </div>
                            <div className="space-y-2">
                              {groups.delivery.map(item => (
                                <div key={item.id} className="flex items-start justify-between gap-3 py-2">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.itemName}</div>
                                    {item.itemDescription && (
                                      <div className="text-sm text-gray-500">{item.itemDescription}</div>
                                    )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      ${(item.lineItemTotal / 100).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Total Summary */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-900 dark:border-white shadow-xl p-6 print:static print:border print:border-gray-900 print:shadow-none print:mt-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <span>{t('subtotal')}</span>
                    <span className="font-semibold">${(totals.subtotalCents / 100).toFixed(2)}</span>
                  </div>
                  {totals.discountCents > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>{t('discount')}</span>
                      <span className="font-semibold">-${(totals.discountCents / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('total')}</span>
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${(totals.totalCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-6 sm:right-6 z-50 pb-0 sm:pb-6 pointer-events-none">
        <div className="max-w-4xl mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t sm:border border-gray-200 dark:border-gray-700 sm:rounded-3xl px-3 sm:px-8 py-3 sm:py-5 shadow-2xl pointer-events-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-8">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('subtotal')}
                </span>
                <span className="font-bold text-lg">
                  ${(totals.subtotalCents / 100).toFixed(2)}
                </span>
              </div>

              <div className="hidden md:flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('discount')}
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

              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('total')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">
                    ${(totals.totalCents / 100).toFixed(2)}
                  </span>
                  {priceChangeDirection && (
                    <span className={`text-sm font-semibold animate-bounce ${
                      priceChangeDirection === 'up' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {priceChangeDirection === 'up' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </div>

              {/* Budget Gauge */}
              {request?.budgetMin && request?.budgetMax && (
                <div className="hidden md:flex flex-col gap-1 min-w-[120px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Budget</span>
                    <span className={`font-semibold ${
                      totals.totalCents / 100 > request.budgetMax
                        ? 'text-red-600 dark:text-red-400'
                        : totals.totalCents / 100 < request.budgetMin
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {totals.totalCents / 100 > request.budgetMax
                        ? `+$${((totals.totalCents / 100) - request.budgetMax).toFixed(0)} over`
                        : totals.totalCents / 100 < request.budgetMin
                        ? `$${(request.budgetMin - (totals.totalCents / 100)).toFixed(0)} under`
                        : '✓ In range'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        totals.totalCents / 100 > request.budgetMax
                          ? 'bg-red-500'
                          : totals.totalCents / 100 < request.budgetMin
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(100, ((totals.totalCents / 100) / request.budgetMax) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="hidden sm:block text-xs text-gray-500">
                {offerState.getTotalItems()} {t('items')} •{' '}
                {offerState.offer?.blocks.length || 0} blocks
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onCancel}
                size="sm"
                className="hidden sm:flex rounded-full px-4 sm:px-6 hover:shadow-sm min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="flex-1 sm:flex-none rounded-full px-4 sm:px-6 hover:shadow-sm text-sm sm:text-sm min-h-[44px] font-medium active:scale-95 transition-transform"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="flex-1 sm:flex-none rounded-full px-6 sm:px-8 shadow-md hover:shadow-lg bg-gray-900 hover:bg-gray-800 dark:bg:white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm sm:text-sm min-h-[44px] font-semibold active:scale-95 transition-transform"
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

      {/* Right Drawer - Full Screen on Mobile with Swipe Support */}
      {request && (
        <div
          className={`fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-96 lg:w-[28rem] bg-white dark:bg-gray-800 shadow-2xl z-999999 transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="h-full flex flex-col">
            {/* Drawer Header with Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-6 pt-6 pb-0 flex items-center justify-between">
                <h3 className="font-bold text-xl">Details</h3>
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

              {/* Tabs */}
              <div className="flex px-6 mt-4">
                <button
                  onClick={() => setSidebarTab('request')}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    sidebarTab === 'request'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Request Info
                </button>
                <button
                  onClick={() => setSidebarTab('adjustments')}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    sidebarTab === 'adjustments'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Adjustments
                  {adjustments.filter(a => a.status === 'pending').length > 0 && (
                    <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                      {adjustments.filter(a => a.status === 'pending').length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {sidebarTab === 'request' ? (
                <>
              {/* Primary Action Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-5">
                <div className="space-y-4">
                  {/* Price & Status */}
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalPrice')}</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${((offerState.offer?.totalCents || 0) / 100).toFixed(2)}
                    </div>
                  </div>

                  {/* Urgency Indicator */}
                  {offerState.offer?.validUntil && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-orange-600 dark:text-orange-400">⏰</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Expires {new Date(offerState.offer.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Primary CTA */}
                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    onClick={() => {
                      toast.success('✓ Offer accepted!', {
                        description: 'The caterer will receive your confirmation'
                      })
                    }}
                  >
                    ✓ Accept Offer
                  </button>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 transition-all text-sm"
                      onClick={() => {
                        toast.info('Offer declined')
                      }}
                    >
                      Decline
                    </button>
                    <button
                      className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 transition-all text-sm"
                      onClick={() => {
                        window.print()
                      }}
                    >
                      Print
                    </button>
                  </div>
                </div>
              </div>

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
                </>
              ) : (
                /* Adjustments Tab Content */
                <div className="space-y-6">
                  {/* Comment Input for Active Item/Block */}
                  {activeCommentBox && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                      <div className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        Request adjustment for "{activeCommentBox.name}"
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm">
                          👤
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Describe what needs to be adjusted..."
                            rows={3}
                            className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            autoFocus
                          />

                          {/* Quick Reply Templates */}
                          {!commentText && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {[
                                { icon: '➕', text: 'Can we add 10 more servings?', label: 'Add servings' },
                                { icon: '⏰', text: 'Need this 30 minutes earlier', label: 'Earlier time' },
                                { icon: '🥗', text: 'Any vegetarian options available?', label: 'Vegetarian' },
                                { icon: '🌾', text: 'Do you have gluten-free alternatives?', label: 'Gluten-free' },
                                { icon: '💰', text: 'Can we reduce the price by 10%?', label: 'Price adjust' },
                              ].map((template, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCommentText(template.text)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700"
                                >
                                  <span>{template.icon}</span>
                                  <span className="font-medium">{template.label}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Helpful Hint */}
                          <div className="mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              💡 <span className="font-medium">Tip:</span> Be specific about quantities, times, or dietary needs for faster responses (typically 2-4 hours)
                            </p>
                          </div>

                          {/* Photo Attachments */}
                          {commentPhotos.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {commentPhotos.map((photo, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={URL.createObjectURL(photo)}
                                    alt={`Attachment ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                  />
                                  <button
                                    onClick={() => setCommentPhotos(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 mt-3 justify-between items-center">
                            <button
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.multiple = true
                                input.onchange = (e) => {
                                  const files = Array.from((e.target as HTMLInputElement).files || [])
                                  setCommentPhotos(prev => [...prev, ...files])
                                }
                                input.click()
                              }}
                              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Add Photo
                            </button>

                            <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveCommentBox(null)
                                setCommentText('')
                                setCommentPhotos([])
                              }}
                              className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (commentText.trim()) {
                                  handleAddAdjustment(activeCommentBox.type, activeCommentBox.id, activeCommentBox.name, commentText)
                                  setActiveCommentBox(null)
                                  setCommentText('')
                                  setCommentPhotos([])
                                  if (commentPhotos.length > 0) {
                                    toast.success('Photos attached!', {
                                      description: `${commentPhotos.length} photo(s) sent with adjustment`
                                    })
                                  }
                                }
                              }}
                              disabled={!commentText.trim()}
                              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
                            >
                              Send to Caterer
                              {commentPhotos.length > 0 && (
                                <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                                  +{commentPhotos.length}
                                </span>
                              )}
                            </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Adjustments List Grouped by Item/Block */}
                  {adjustments.length === 0 ? (
                    <div className="text-center py-12 px-6">
                      <div className="text-5xl mb-4">✨</div>
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Everything looks good!
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                        If you need any changes, click the <span className="inline-flex items-center justify-center w-5 h-5 text-xs">💬</span> icon next to any item to request adjustments.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                        Caterers typically respond within 2-4 hours
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(() => {
                        // Group adjustments by target
                        const grouped = adjustments.reduce((acc, adj) => {
                          const key = `${adj.targetEntity}-${adj.targetEntityId}`
                          if (!acc[key]) {
                            acc[key] = {
                              name: adj.targetEntity === 'block'
                                ? offerState.offer?.blocks.find(b => b.id === adj.targetEntityId)?.name || 'Block'
                                : offerState.offer?.blocks.flatMap(b => b.items).find(i => i.id === adj.targetEntityId)?.itemName || 'Item',
                              type: adj.targetEntity,
                              adjustments: []
                            }
                          }
                          acc[key].adjustments.push(adj)
                          return acc
                        }, {} as Record<string, { name: string; type: string; adjustments: typeof adjustments }>)

                        return Object.entries(grouped).map(([key, group]) => (
                          <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {group.name}
                                </span>
                                <Badge variant="light" color="info" size="sm">
                                  {group.type}
                                </Badge>
                                {group.adjustments.some(a => a.status === 'pending') && (
                                  <Badge variant="light" color="warning" size="sm">
                                    {group.adjustments.filter(a => a.status === 'pending').length} pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                              {group.adjustments.map(adjustment => (
                                <div key={adjustment.id} className="p-4">
                                  <AdjustmentThread
                                    adjustment={adjustment}
                                    onAddComment={message => handleAddComment(adjustment.id, message)}
                                    onResolve={() => handleResolveAdjustment(adjustment.id)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  )}
                </div>
              )}
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

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/75 z-99999 transition-opacity backdrop-blur-sm"
            onClick={() => setShowShortcutsModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-999999 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        ⌨️ Keyboard Shortcuts
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Boost your productivity with these shortcuts
                      </p>
                    </div>
                    <button
                      onClick={() => setShowShortcutsModal(false)}
                      className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Navigation */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <span className="text-lg">🧭</span>
                      Navigation
                    </h4>
                    <div className="space-y-2">
                      {[
                        { keys: ['Alt', '1-9'], description: 'Switch between blocks' },
                        { keys: ['/'], description: 'Focus search bar' },
                        { keys: ['Esc'], description: 'Close modal or unfocus' },
                      ].map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, j) => (
                              <kbd key={j} className="px-2 py-1 text-xs font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Search */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <span className="text-lg">🔍</span>
                      Search & Add Items
                    </h4>
                    <div className="space-y-2">
                      {[
                        { keys: ['↑', '↓'], description: 'Navigate search results' },
                        { keys: ['Enter'], description: 'Add selected item' },
                      ].map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, j) => (
                              <kbd key={j} className="px-2 py-1 text-xs font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      General
                    </h4>
                    <div className="space-y-2">
                      {[
                        { keys: ['?'], description: 'Show this help dialog' },
                      ].map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, j) => (
                              <kbd key={j} className="px-2 py-1 text-xs font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                    💡 Tip: These shortcuts work anywhere in the offer builder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
    </>
  )
}
