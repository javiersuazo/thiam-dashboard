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

interface MenuSetupStepProps {
  initialData?: Partial<MenuSetupData>
  onContinue: (data: MenuSetupData) => void
}

export function MenuSetupStep({ initialData, onContinue }: MenuSetupStepProps) {
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
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const canProceed =
    name.trim().length > 0 &&
    (pricingStrategy === 'sum-of-items' || (pricingStrategy === 'fixed' && parseFloat(fixedPrice) > 0))

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
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-brand-600 dark:text-brand-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Menu Setup</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Configure your menu details and pricing
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Basic Information
                </h3>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="menuName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Menu Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="menuName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Summer BBQ Package"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      maxLength={100}
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      {name.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="menuDescription"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Description <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <textarea
                      id="menuDescription"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what makes this menu special..."
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                      maxLength={500}
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      {description.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="imageUrl"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Menu Image URL <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      id="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                    {imageUrl && (
                      <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                        <img
                          src={imageUrl}
                          alt="Menu preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = ''
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="tags"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Tags <span className="text-gray-400 text-xs">(optional, up to 10)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder="e.g., Vegetarian, Holiday..."
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        disabled={tags.length >= 10}
                      />
                      <Button
                        type="button"
                        variant="outline"
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:bg-brand-200 dark:hover:bg-brand-800 rounded-full p-0.5 transition-colors"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Availability Period <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="availableFrom"
                          className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5"
                        >
                          From
                        </label>
                        <input
                          id="availableFrom"
                          type="date"
                          value={availableFrom}
                          onChange={(e) => setAvailableFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="availableTo"
                          className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5"
                        >
                          Until
                        </label>
                        <input
                          id="availableTo"
                          type="date"
                          value={availableTo}
                          onChange={(e) => setAvailableTo(e.target.value)}
                          min={availableFrom || undefined}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    {availableFrom && availableTo && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {Math.ceil(
                          (new Date(availableTo).getTime() - new Date(availableFrom).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pricing Strategy
              </h3>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setPricingStrategy('sum-of-items')}
                  className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                    pricingStrategy === 'sum-of-items'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                        pricingStrategy === 'sum-of-items'
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {pricingStrategy === 'sum-of-items' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Sum of Items</h4>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Price calculated by adding all selected items
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                        <p>✓ Automatic price updates</p>
                        <p>✓ Transparent for customers</p>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingStrategy('fixed')}
                  className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                    pricingStrategy === 'fixed'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                        pricingStrategy === 'fixed'
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {pricingStrategy === 'fixed' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Fixed Price</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Set a single price for the entire menu
                      </p>

                      {pricingStrategy === 'fixed' && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <label
                            htmlFor="fixedPrice"
                            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                          >
                            Menu Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
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
                              className="w-full pl-7 pr-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1 mt-2">
                        <p>• Great for bundled deals</p>
                        <p>• Control profit margins</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end">
          <Button onClick={handleContinue} disabled={!canProceed} size="lg">
            Continue to Build Menu
          </Button>
        </div>
      </div>
    </div>
  )
}
