'use client'

import { useState } from 'react'
import { PricingStrategy } from './types'
import Button from '@/components/shared/ui/button/Button'

interface MenuSetupData {
  name: string
  description?: string
  imageUrl?: string
  tags?: string[]
  availableFrom?: string
  availableTo?: string
  pricingStrategy: PricingStrategy
  fixedPriceCents?: number
}

interface MenuSetupStepMinimalProps {
  initialData?: Partial<MenuSetupData>
  onContinue: (data: MenuSetupData) => void
}

export function MenuSetupStepMinimal({ initialData, onContinue }: MenuSetupStepMinimalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [availableFrom, setAvailableFrom] = useState(initialData?.availableFrom || '')
  const [availableTo, setAvailableTo] = useState(initialData?.availableTo || '')
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>(
    initialData?.pricingStrategy || 'sum-of-items'
  )
  const [fixedPrice, setFixedPrice] = useState<string>(
    initialData?.fixedPriceCents ? (initialData.fixedPriceCents / 100).toFixed(2) : ''
  )

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

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const canProceed =
    name.trim().length > 0 &&
    (pricingStrategy === 'sum-of-items' ||
      (pricingStrategy === 'fixed' && parseFloat(fixedPrice) > 0))

  const handleContinue = () => {
    onContinue({
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      availableFrom: availableFrom || undefined,
      availableTo: availableTo || undefined,
      pricingStrategy,
      fixedPriceCents:
        pricingStrategy === 'fixed' ? Math.round(parseFloat(fixedPrice || '0') * 100) : undefined,
    })
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label
                htmlFor="menuName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Menu Name
              </label>
              <input
                id="menuName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter menu name"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="menuDescription"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="menuDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                maxLength={500}
              />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Image URL
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags"
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  disabled={tags.length >= 10}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-gray-900 dark:hover:text-white"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="availableFrom"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Available From
              </label>
              <input
                id="availableFrom"
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="availableTo"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Available Until
              </label>
              <input
                id="availableTo"
                type="date"
                value={availableTo}
                onChange={(e) => setAvailableTo(e.target.value)}
                min={availableFrom || undefined}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Pricing Strategy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPricingStrategy('sum-of-items')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    pricingStrategy === 'sum-of-items'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        pricingStrategy === 'sum-of-items'
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {pricingStrategy === 'sum-of-items' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Sum of Items</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                    Auto-calculated from items
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingStrategy('fixed')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    pricingStrategy === 'fixed'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        pricingStrategy === 'fixed'
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {pricingStrategy === 'fixed' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Fixed Price</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">Single menu price</p>
                </button>
              </div>

              {pricingStrategy === 'fixed' && (
                <div className="mt-4">
                  <label htmlFor="fixedPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Menu Price
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      id="fixedPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={fixedPrice}
                      onChange={(e) => setFixedPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 sm:px-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button onClick={handleContinue} disabled={!canProceed}>
            Continue to Build Menu
          </Button>
        </div>
      </div>
    </div>
  )
}
