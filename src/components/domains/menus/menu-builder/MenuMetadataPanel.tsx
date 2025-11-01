'use client'

import { useState } from 'react'
import Input from '@/components/shared/form/input/InputField'
import TextArea from '@/components/shared/form/input/TextArea'
import Label from '@/components/shared/form/Label'
import Button from '@/components/shared/ui/button/Button'
import { ChevronDownIcon } from '@/icons'
import Image from 'next/image'

interface MenuMetadata {
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  availableFrom?: string
  availableTo?: string
  tags?: string[]
}

interface MenuMetadataPanelProps {
  metadata: MenuMetadata
  onChange: (metadata: MenuMetadata) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function MenuMetadataPanel({
  metadata,
  onChange,
  isCollapsed = false,
  onToggleCollapse,
}: MenuMetadataPanelProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(metadata.imageUrl || null)
  const [tagInput, setTagInput] = useState('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        onChange({ ...metadata, imageUrl: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    onChange({ ...metadata, imageUrl: undefined })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !metadata.tags?.includes(tagInput.trim())) {
      onChange({
        ...metadata,
        tags: [...(metadata.tags || []), tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...metadata,
      tags: metadata.tags?.filter(tag => tag !== tagToRemove),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <Label htmlFor="menu-description">Description</Label>
                <TextArea
                  id="menu-description"
                  value={metadata.description || ''}
                  onChange={(value) => onChange({ ...metadata, description: value })}
                  placeholder="Describe this menu... (e.g., Fresh seasonal dishes featuring local ingredients)"
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This will be shown to customers
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="menu-active"
                  checked={metadata.isActive}
                  onChange={(e) => onChange({ ...metadata, isActive: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                />
                <div>
                  <Label htmlFor="menu-active" className="cursor-pointer">
                    Active Menu
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Make this menu visible to customers
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-4">
              <div>
                <Label>Menu Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative group">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <Image
                          src={imagePreview}
                          alt="Menu preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-brand-400 dark:hover:border-brand-600 transition-colors bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, or WEBP (MAX. 2MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Upload a cover image for this menu
                </p>
              </div>
            </div>
          </div>

          {/* Full Width - Availability Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div>
              <Label htmlFor="available-from">Available From</Label>
              <Input
                id="available-from"
                type="date"
                value={metadata.availableFrom || ''}
                onChange={(e) => onChange({ ...metadata, availableFrom: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                When this menu starts being available
              </p>
            </div>

            <div>
              <Label htmlFor="available-to">Available To</Label>
              <Input
                id="available-to"
                type="date"
                value={metadata.availableTo || ''}
                onChange={(e) => onChange({ ...metadata, availableTo: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                When this menu stops being available
              </p>
            </div>
          </div>

          {/* Tags Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <Label htmlFor="menu-tags">Tags</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="menu-tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., seasonal, holiday, vegan-friendly"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>

            {/* Display Tags */}
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-brand-900 dark:hover:text-brand-300"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Add tags to help organize and filter your menus
            </p>
          </div>
    </div>
  )
}
