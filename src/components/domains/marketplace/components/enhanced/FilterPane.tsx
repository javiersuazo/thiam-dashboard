'use client'

import { useEffect } from 'react'
import { StoreFilters as IStoreFilters } from '../../types'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/shared/ui/label'
import { Checkbox } from '@/components/shared/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/ui/select'
import { Badge } from '@/components/shared/ui/badge'

export interface FilterPaneProps {
  isOpen: boolean
  onClose: () => void
  filters: IStoreFilters
  availableCategories: string[]
  availableTags: string[]
  onFiltersChange: (filters: IStoreFilters) => void
  onReset: () => void
}

export function FilterPane({
  isOpen,
  onClose,
  filters,
  availableCategories,
  availableTags,
  onFiltersChange,
  onReset,
}: FilterPaneProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ']' && !isOpen) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('openFilterPane'))
      }
      if (e.key === '[' && isOpen) {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const updateFilter = <K extends keyof IStoreFilters>(key: K, value: IStoreFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleCategory = (category: string) => {
    const current = filters.categories || []
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    updateFilter('categories', updated)
  }

  const toggleTag = (tag: string) => {
    const current = filters.tags || []
    const updated = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    updateFilter('tags', updated)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-50 transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-lg font-semibold">Filters</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">[</kbd> to close
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onReset}>
                Reset
              </Button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Sort By</Label>
              <Select
                value={filters.sortBy || 'name'}
                onValueChange={(value: any) => updateFilter('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Price Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.[0] || ''}
                  onChange={(e) =>
                    updateFilter('priceRange', [
                      parseFloat(e.target.value) || 0,
                      filters.priceRange?.[1] || 1000,
                    ])
                  }
                  className="h-9"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.[1] || ''}
                  onChange={(e) =>
                    updateFilter('priceRange', [
                      filters.priceRange?.[0] || 0,
                      parseFloat(e.target.value) || 1000,
                    ])
                  }
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Minimum Rating</Label>
              <Select
                value={filters.rating?.toString() || 'any'}
                onValueChange={(value) =>
                  updateFilter('rating', value === 'any' ? undefined : parseFloat(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Availability</Label>
              <Select
                value={filters.availability || 'all'}
                onValueChange={(value: any) =>
                  updateFilter('availability', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="limited">Limited Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {availableCategories.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Categories</Label>
                <div className="space-y-2">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories?.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableTags.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t">
            <Button className="w-full" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
