'use client'

import { useState } from 'react'
import Button from '@/components/shared/ui/button/Button'

interface MenuBasicInfo {
  name: string
  description?: string
  imageUrl?: string
  tags?: string[]
  availableFrom?: string
  availableTo?: string
}

interface MenuBasicInfoStepProps {
  initialData?: MenuBasicInfo
  onContinue: (data: MenuBasicInfo) => void
}

export function MenuBasicInfoStep({ initialData, onContinue }: MenuBasicInfoStepProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [availableFrom, setAvailableFrom] = useState(initialData?.availableFrom || '')
  const [availableTo, setAvailableTo] = useState(initialData?.availableTo || '')

  const canProceed = name.trim().length > 0

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

  const handleContinue = () => {
    onContinue({
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      availableFrom: availableFrom || undefined,
      availableTo: availableTo || undefined,
    })
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-4">
          <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Let's Create Your Menu
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Start by giving your menu a name and optional description
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <label htmlFor="menuName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Menu Name <span className="text-red-500">*</span>
          </label>
          <input
            id="menuName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Summer BBQ Package, Corporate Lunch Menu..."
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            maxLength={100}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {name.length}/100 characters
          </p>
        </div>

        <div>
          <label htmlFor="menuDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <textarea
            id="menuDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what makes this menu special, ideal occasions, or any other details..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow resize-none"
            maxLength={500}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description.length}/500 characters
          </p>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Menu Image URL <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="space-y-3">
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/menu-image.jpg"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            />
            {imageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
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
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags <span className="text-gray-400 text-xs">(optional, up to 10)</span>
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="e.g., Vegetarian, Gluten-Free, Holiday..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
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
              <div className="flex flex-wrap gap-2">
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
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Availability Period <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="availableFrom" className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                Available From
              </label>
              <input
                id="availableFrom"
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="availableTo" className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                Available Until
              </label>
              <input
                id="availableTo"
                type="date"
                value={availableTo}
                onChange={(e) => setAvailableTo(e.target.value)}
                min={availableFrom || undefined}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>
          {availableFrom && availableTo && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Menu will be available for {Math.ceil((new Date(availableTo).getTime() - new Date(availableFrom).getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          )}
        </div>

        {name.trim() && (
          <div className="p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-brand-900 dark:text-brand-300">
                  Looking good!
                </p>
                <p className="text-sm text-brand-700 dark:text-brand-400 mt-1">
                  Your menu "{name}" is ready to move to the next step.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end pt-8 border-t border-gray-200 dark:border-gray-800 mt-8">
        <Button
          onClick={handleContinue}
          disabled={!canProceed}
          size="lg"
        >
          Continue to Pricing
        </Button>
      </div>
    </div>
  )
}
