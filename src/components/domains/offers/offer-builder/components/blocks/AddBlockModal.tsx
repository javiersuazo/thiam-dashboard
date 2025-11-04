'use client'

import { useState } from 'react'
import type { OfferBlock } from '../../types'
import Button from '@/components/shared/ui/button/Button'
import Input from '@/components/shared/form/input/InputField'
import TextArea from '@/components/shared/form/input/TextArea'

interface AddBlockModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (block: Omit<OfferBlock, 'id' | 'offerId' | 'items' | 'subtotalCents' | 'position'>) => void
}

export function AddBlockModal({ isOpen, onClose, onAdd }: AddBlockModalProps) {
  const today = new Date().toISOString().split('T')[0]
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)
  const [deliveryTime, setDeliveryTime] = useState('08:00')
  const [startTime, setStartTime] = useState('08:30')
  const [endTime, setEndTime] = useState('10:00')
  const [pickupTime, setPickupTime] = useState('10:30')
  const [headcount, setHeadcount] = useState<number | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    onAdd({
      name,
      description: description || undefined,
      date,
      deliveryTime,
      startTime,
      endTime,
      pickupTime,
      headcount,
    })

    // Reset form
    setName('')
    setDescription('')
    setDate(today)
    setDeliveryTime('08:00')
    setStartTime('08:30')
    setEndTime('10:00')
    setPickupTime('10:30')
    setHeadcount(undefined)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold">Add Service Block</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Create a new time slot for your offer
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Block Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Breakfast Service, Lunch Service"
                required
                className="rounded-xl border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this service block"
                rows={2}
                className="rounded-xl border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">📅 Date *</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="rounded-xl border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">👥 Headcount</label>
                <Input
                  type="number"
                  value={headcount || ''}
                  onChange={(e) => setHeadcount(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Expected guests"
                  min={1}
                  className="rounded-xl border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">⏰ Timing Schedule</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">🚚 Delivery</label>
                  <Input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    required
                    className="rounded-xl border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">▶️ Start</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="rounded-xl border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">⏹️ End</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="rounded-xl border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">📦 Pickup</label>
                  <Input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                    className="rounded-xl border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-400">
              <strong>Timing Flow:</strong> Delivery → Service Start → Service End → Pickup
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full px-6 hover:shadow-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="rounded-full px-8 shadow-md hover:shadow-lg bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
            >
              Add Block
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
