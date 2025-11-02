'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/shared/ui/badge'
import { Button } from '@/components/shared/ui/button'
import { MarketplaceFilters } from '../../types'

interface FilterChipRailProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: MarketplaceFilters
  onFiltersChange: (filters: MarketplaceFilters) => void
  availableCategories: string[]
  availableTags: string[]
  onReset: () => void
}

type PopoverType = 'cuisine' | 'price' | 'rating' | 'availability' | 'tags' | null

export function FilterChipRail({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableCategories,
  availableTags,
  onReset,
}: FilterChipRailProps) {
  const [activePopover, setActivePopover] = useState<PopoverType>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const activeFilterCount =
    (filters.categories?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.availableOnly ? 1 : 0)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-popover]')) {
        setActivePopover(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleCategory = (category: string) => {
    const current = filters.categories || []
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    onFiltersChange({ ...filters, categories: updated })
  }

  const toggleTag = (tag: string) => {
    const current = filters.tags || []
    const updated = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    onFiltersChange({ ...filters, tags: updated })
  }

  const clearFilter = (type: 'categories' | 'tags' | 'price' | 'rating' | 'availability') => {
    if (type === 'categories') onFiltersChange({ ...filters, categories: [] })
    if (type === 'tags') onFiltersChange({ ...filters, tags: [] })
    if (type === 'price') onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined })
    if (type === 'rating') onFiltersChange({ ...filters, minRating: undefined })
    if (type === 'availability') onFiltersChange({ ...filters, availableOnly: false })
  }

  return (
    <div className="sticky top-0 z-30 bg-white border-b">
      <div className="max-w-[1360px] mx-auto px-4 py-3">
        {/* Search + Filter Chips */}
        <div className="flex items-center gap-2 mb-3">
          {/* Search field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products... (Press /)"
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2">
            {/* Cuisine */}
            <div className="relative" data-popover>
              <button
                onClick={() => setActivePopover(activePopover === 'cuisine' ? null : 'cuisine')}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5 ${
                  filters.categories && filters.categories.length > 0
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-300 hover:border-gray-900'
                }`}
              >
                Cuisine
                {filters.categories && filters.categories.length > 0 && (
                  <Badge variant="secondary" className="bg-white text-gray-900 h-4 px-1 text-xs">
                    {filters.categories.length}
                  </Badge>
                )}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {activePopover === 'cuisine' && (
                <div className="absolute top-full mt-2 w-64 bg-white border rounded-2xl shadow-lg py-2 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Cuisine Types
                  </div>
                  {availableCategories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories?.includes(cat) || false}
                        onChange={() => toggleCategory(cat)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="relative" data-popover>
              <button
                onClick={() => setActivePopover(activePopover === 'price' ? null : 'price')}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5 ${
                  filters.minPrice || filters.maxPrice
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-300 hover:border-gray-900'
                }`}
              >
                Price
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {activePopover === 'price' && (
                <div className="absolute top-full mt-2 w-64 bg-white border rounded-2xl shadow-lg p-4 z-50">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Price Range
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Min</label>
                      <input
                        type="number"
                        value={filters.minPrice || ''}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            minPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="0"
                        className="w-full px-3 py-1.5 text-sm border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Max</label>
                      <input
                        type="number"
                        value={filters.maxPrice || ''}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            maxPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="500"
                        className="w-full px-3 py-1.5 text-sm border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="relative" data-popover>
              <button
                onClick={() => setActivePopover(activePopover === 'rating' ? null : 'rating')}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5 ${
                  filters.minRating
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-300 hover:border-gray-900'
                }`}
              >
                Rating
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {activePopover === 'rating' && (
                <div className="absolute top-full mt-2 w-48 bg-white border rounded-2xl shadow-lg py-2 z-50">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        onFiltersChange({ ...filters, minRating: rating })
                        setActivePopover(null)
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>⭐ {rating}+</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="relative" data-popover>
              <button
                onClick={() => setActivePopover(activePopover === 'tags' ? null : 'tags')}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5 ${
                  filters.tags && filters.tags.length > 0
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-300 hover:border-gray-900'
                }`}
              >
                Tags
                {filters.tags && filters.tags.length > 0 && (
                  <Badge variant="secondary" className="bg-white text-gray-900 h-4 px-1 text-xs">
                    {filters.tags.length}
                  </Badge>
                )}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {activePopover === 'tags' && (
                <div className="absolute top-full mt-2 w-64 bg-white border rounded-2xl shadow-lg py-2 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Dietary & Features
                  </div>
                  {availableTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.tags?.includes(tag) || false}
                        onChange={() => toggleTag(tag)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Availability */}
            <button
              onClick={() =>
                onFiltersChange({ ...filters, availableOnly: !filters.availableOnly })
              }
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                filters.availableOnly
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white border-gray-300 hover:border-gray-900'
              }`}
            >
              Available
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">{activeFilterCount} active:</span>

            {filters.categories?.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="pl-2 pr-1 py-1 gap-1 text-xs bg-gray-100"
              >
                {cat}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}

            {filters.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="pl-2 pr-1 py-1 gap-1 text-xs bg-gray-100"
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}

            {(filters.minPrice || filters.maxPrice) && (
              <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-xs bg-gray-100">
                €{filters.minPrice || 0} - €{filters.maxPrice || '∞'}
                <button
                  onClick={() => clearFilter('price')}
                  className="hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.minRating && (
              <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-xs bg-gray-100">
                ⭐ {filters.minRating}+
                <button
                  onClick={() => clearFilter('rating')}
                  className="hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.availableOnly && (
              <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-xs bg-gray-100">
                Available only
                <button
                  onClick={() => clearFilter('availability')}
                  className="hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            <Button variant="ghost" size="sm" onClick={onReset} className="h-6 text-xs px-2">
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
