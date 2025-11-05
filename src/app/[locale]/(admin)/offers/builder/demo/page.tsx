'use client'

import React from 'react'
import { FastOfferBuilderAdapter } from '@/components/shared/offer-builder/adapters/FastOfferBuilderAdapter'
import { CateringOfferBuilderPlugin } from '@/components/shared/offer-builder/domain/plugins/CateringPlugin'
import { MockOfferRepository } from '@/components/shared/offer-builder/infrastructure/adapters/MockOfferRepository'
import { MockCatalogRepository } from '@/components/shared/offer-builder/infrastructure/adapters/MockCatalogRepository'
import type { Offer, OfferBlock, CatalogItem } from '@/components/shared/offer-builder/core/types'
import { toast } from 'sonner'

const DEMO_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'cat-001',
    type: 'menu_item',
    name: 'Grilled Chicken Platter',
    description: 'Herb-marinated grilled chicken with seasonal vegetables',
    priceCents: 1850,
    category: 'Main Course',
    tags: ['protein', 'healthy'],
    isAvailable: true,
  },
  {
    id: 'cat-002',
    type: 'menu_item',
    name: 'Caesar Salad',
    description: 'Fresh romaine, parmesan, croutons, house-made dressing',
    priceCents: 950,
    category: 'Salad',
    tags: ['vegetarian', 'salad'],
    isAvailable: true,
  },
  {
    id: 'cat-003',
    type: 'menu_item',
    name: 'Beef Sliders',
    description: 'Mini angus beef burgers with caramelized onions',
    priceCents: 1250,
    category: 'Appetizer',
    tags: ['protein', 'appetizer'],
    isAvailable: true,
  },
  {
    id: 'cat-004',
    type: 'menu_item',
    name: 'Vegetable Spring Rolls',
    description: 'Crispy spring rolls with sweet chili sauce',
    priceCents: 750,
    category: 'Appetizer',
    tags: ['vegetarian', 'appetizer'],
    isAvailable: true,
  },
  {
    id: 'cat-005',
    type: 'beverage',
    name: 'Fresh Lemonade',
    description: 'House-made lemonade with mint',
    priceCents: 350,
    category: 'Beverage',
    tags: ['beverage', 'non-alcoholic'],
    isAvailable: true,
  },
  {
    id: 'cat-006',
    type: 'beverage',
    name: 'Iced Tea',
    description: 'Freshly brewed iced tea',
    priceCents: 300,
    category: 'Beverage',
    tags: ['beverage', 'non-alcoholic'],
    isAvailable: true,
  },
  {
    id: 'cat-007',
    type: 'equipment',
    name: 'Chafing Dish',
    description: 'Stainless steel chafing dish with fuel',
    priceCents: 2500,
    category: 'Equipment',
    tags: ['equipment', 'serving'],
    isAvailable: true,
  },
  {
    id: 'cat-008',
    type: 'equipment',
    name: 'Beverage Dispenser',
    description: '5-gallon glass beverage dispenser',
    priceCents: 1500,
    category: 'Equipment',
    tags: ['equipment', 'beverage'],
    isAvailable: true,
  },
  {
    id: 'cat-009',
    type: 'service',
    name: 'Server (4 hours)',
    description: 'Professional catering server',
    priceCents: 15000,
    category: 'Service',
    tags: ['service', 'labor'],
    isAvailable: true,
  },
  {
    id: 'cat-010',
    type: 'service',
    name: 'Setup & Cleanup',
    description: 'Complete event setup and post-event cleanup',
    priceCents: 8500,
    category: 'Service',
    tags: ['service', 'labor'],
    isAvailable: true,
  },
  {
    id: 'cat-011',
    type: 'delivery',
    name: 'Standard Delivery',
    description: 'Delivery within 15 miles',
    priceCents: 5000,
    category: 'Delivery',
    tags: ['delivery'],
    isAvailable: true,
  },
  {
    id: 'cat-012',
    type: 'menu_item',
    name: 'Chocolate Brownies',
    description: 'Decadent chocolate brownies',
    priceCents: 450,
    category: 'Dessert',
    tags: ['dessert', 'vegetarian'],
    isAvailable: true,
  },
  {
    id: 'cat-013',
    type: 'menu_item',
    name: 'Fruit Platter',
    description: 'Seasonal fresh fruit selection',
    priceCents: 850,
    category: 'Dessert',
    tags: ['dessert', 'healthy', 'vegetarian'],
    isAvailable: true,
  },
  {
    id: 'cat-014',
    type: 'menu_item',
    name: 'Pasta Primavera',
    description: 'Penne pasta with seasonal vegetables in light sauce',
    priceCents: 1350,
    category: 'Main Course',
    tags: ['vegetarian', 'pasta'],
    isAvailable: true,
  },
  {
    id: 'cat-015',
    type: 'menu_item',
    name: 'Salmon Fillet',
    description: 'Grilled Atlantic salmon with lemon butter',
    priceCents: 2200,
    category: 'Main Course',
    tags: ['protein', 'seafood', 'premium'],
    isAvailable: true,
  },
]

const DEMO_OFFER_BLOCKS: OfferBlock[] = [
  {
    id: 'block-001',
    offerId: 'demo-offer-001',
    name: 'Corporate Lunch - Day 1',
    items: [],
    subtotalCents: 0,
    metadata: {
      date: '2025-11-15',
      deliveryTime: '12:00',
      headcount: 50,
      location: 'Tech Corp, Building A',
    },
  },
]

const DEMO_OFFER: Offer = {
  id: 'demo-offer-001',
  title: 'Tech Corp November Catering',
  status: 'draft',
  currency: 'USD',
  blocks: DEMO_OFFER_BLOCKS,
  subtotalCents: 0,
  taxCents: 0,
  discountCents: 0,
  totalCents: 0,
  metadata: {
    customerName: 'Tech Corp Inc.',
    requestId: 'req-12345',
    catererId: 'caterer-abc',
  },
  allowsStructuredEdit: true,
}

export default function OfferBuilderDemoPage() {
  const mockOfferRepo = React.useMemo(
    () => new MockOfferRepository({ [DEMO_OFFER.id]: DEMO_OFFER }),
    []
  )

  const mockCatalogRepo = React.useMemo(
    () => new MockCatalogRepository(DEMO_CATALOG_ITEMS),
    []
  )

  const plugin = React.useMemo(
    () => new CateringOfferBuilderPlugin(mockOfferRepo, mockCatalogRepo),
    [mockOfferRepo, mockCatalogRepo]
  )

  const handleSave = async (offer: Offer) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log('Saving offer:', offer)
    toast.success('Offer saved successfully!')
  }

  return (
    <FastOfferBuilderAdapter
      offerId="demo-offer-001"
      plugin={plugin}
      onSave={handleSave}
      onCancel={() => {
        toast.info('Cancelled')
        window.history.back()
      }}
      request={{
        id: 'request-123',
        eventType: 'Corporate Meeting',
        eventDate: '2025-11-15',
        guestCount: 50,
        dietaryRequirements: ['Vegetarian', 'Gluten-Free'],
        budgetMin: 1000,
        budgetMax: 2000,
        description: 'Corporate lunch for 50 people at Tech Corp Building A'
      }}
    />
  )
}
