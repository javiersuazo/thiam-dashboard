'use client'

import { useState, useEffect } from 'react'
import { FastOfferBuilder } from '@/components/domains/offers/offer-builder/components/FastOfferBuilder'
import { createOfferService, createCatalogService } from '@/components/domains/offers/offer-builder/adapters'
import { MOCK_ADJUSTMENTS } from '@/components/domains/offers/offer-builder/infrastructure/mock/offerBuilder.mock'
import type { Offer, MenuItem } from '@/components/domains/offers/offer-builder/types'
import { toast } from 'sonner'

export default function OfferBuilderDemoPage() {
  const [offer, setOffer] = useState<Offer | null>(null)
  const [availableItems, setAvailableItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const offerService = createOfferService()
      const catalogService = createCatalogService()

      const existingOffer = await offerService.getOfferById('offer-001')

      const items = await catalogService.getMenuItems('caterer-456')

      setOffer(existingOffer)
      setAvailableItems(items)
    } catch (error) {
      toast.error('Failed to load offer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (updatedOffer: Offer) => {
    const offerService = createOfferService()
    await offerService.updateOffer(updatedOffer.id, { title: updatedOffer.title })
    console.log('Saved offer:', updatedOffer)
  }

  const handleCancel = () => {
    window.history.back()
  }

  if (isLoading || !offer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading offer builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <FastOfferBuilder
        offer={offer}
        availableItems={availableItems}
        onSave={handleSave}
        onCancel={handleCancel}
        initialAdjustments={MOCK_ADJUSTMENTS}
        request={{
          id: 'request-123',
          eventType: 'Corporate Meeting',
          eventDate: '2025-06-15',
          guestCount: 50,
          dietaryRequirements: ['Vegetarian', 'Gluten-Free', 'Nut Allergies'],
          budgetMin: 1000,
          budgetMax: 2000,
          description: 'We need catering for our quarterly company meeting. Looking for breakfast and lunch service for 50 people.'
        }}
      />
    </div>
  )
}
