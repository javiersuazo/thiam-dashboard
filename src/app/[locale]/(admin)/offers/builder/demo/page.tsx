'use client'

import React from 'react'
import {
  OfferBuilder,
  CateringOfferBuilderPlugin,
  MockOfferRepository,
  MockCatalogRepository,
  type Offer,
  type CatalogItem,
} from '@/components/shared/offer-builder'
import { toast } from 'sonner'

const DEMO_CATALOG_ITEMS: CatalogItem[] = [
  // APPETIZERS
  {
    id: 'cat-app-001',
    type: 'menu_item',
    name: 'Caprese Skewers',
    description: 'Fresh mozzarella, cherry tomatoes, basil, balsamic glaze',
    priceCents: 850,
    category: 'Appetizer',
    tags: ['vegetarian', 'appetizer'],
    isAvailable: true,
  },
  {
    id: 'cat-app-002',
    type: 'menu_item',
    name: 'Beef Sliders',
    description: 'Mini angus beef burgers with caramelized onions',
    priceCents: 1250,
    category: 'Appetizer',
    tags: ['protein', 'appetizer'],
    isAvailable: true,
  },
  {
    id: 'cat-app-003',
    type: 'menu_item',
    name: 'Vegetable Spring Rolls',
    description: 'Crispy spring rolls with sweet chili sauce',
    priceCents: 750,
    category: 'Appetizer',
    tags: ['vegetarian', 'appetizer', 'vegan'],
    isAvailable: true,
  },
  {
    id: 'cat-app-004',
    type: 'menu_item',
    name: 'Shrimp Cocktail',
    description: 'Jumbo shrimp with zesty cocktail sauce',
    priceCents: 1650,
    category: 'Appetizer',
    tags: ['seafood', 'appetizer', 'premium'],
    isAvailable: true,
  },
  {
    id: 'cat-app-005',
    type: 'menu_item',
    name: 'Bruschetta',
    description: 'Toasted bread with tomato, garlic, basil',
    priceCents: 650,
    category: 'Appetizer',
    tags: ['vegetarian', 'appetizer'],
    isAvailable: true,
  },

  // MAIN COURSES
  {
    id: 'cat-main-001',
    type: 'menu_item',
    name: 'Grilled Chicken Breast',
    description: 'Herb-marinated chicken with seasonal vegetables',
    priceCents: 1850,
    category: 'Main Course',
    tags: ['protein', 'healthy', 'gluten-free'],
    isAvailable: true,
  },
  {
    id: 'cat-main-002',
    type: 'menu_item',
    name: 'Salmon Fillet',
    description: 'Grilled Atlantic salmon with lemon butter',
    priceCents: 2200,
    category: 'Main Course',
    tags: ['protein', 'seafood', 'premium'],
    isAvailable: true,
  },
  {
    id: 'cat-main-003',
    type: 'menu_item',
    name: 'Beef Tenderloin',
    description: 'Roasted beef tenderloin with red wine reduction',
    priceCents: 3200,
    category: 'Main Course',
    tags: ['protein', 'premium', 'gluten-free'],
    isAvailable: true,
  },
  {
    id: 'cat-main-004',
    type: 'menu_item',
    name: 'Pasta Primavera',
    description: 'Penne pasta with seasonal vegetables in light sauce',
    priceCents: 1350,
    category: 'Main Course',
    tags: ['vegetarian', 'pasta'],
    isAvailable: true,
  },
  {
    id: 'cat-main-005',
    type: 'menu_item',
    name: 'Stuffed Bell Peppers',
    description: 'Quinoa-stuffed peppers with Mediterranean spices',
    priceCents: 1450,
    category: 'Main Course',
    tags: ['vegetarian', 'vegan', 'gluten-free'],
    isAvailable: true,
  },

  // SIDES
  {
    id: 'cat-side-001',
    type: 'menu_item',
    name: 'Caesar Salad',
    description: 'Fresh romaine, parmesan, croutons, house-made dressing',
    priceCents: 950,
    category: 'Side',
    tags: ['vegetarian', 'salad'],
    isAvailable: true,
  },
  {
    id: 'cat-side-002',
    type: 'menu_item',
    name: 'Roasted Vegetables',
    description: 'Seasonal roasted vegetables with herbs',
    priceCents: 750,
    category: 'Side',
    tags: ['vegetarian', 'vegan', 'healthy'],
    isAvailable: true,
  },
  {
    id: 'cat-side-003',
    type: 'menu_item',
    name: 'Garlic Mashed Potatoes',
    description: 'Creamy mashed potatoes with roasted garlic',
    priceCents: 650,
    category: 'Side',
    tags: ['vegetarian', 'comfort'],
    isAvailable: true,
  },

  // DESSERTS
  {
    id: 'cat-des-001',
    type: 'menu_item',
    name: 'Chocolate Brownies',
    description: 'Decadent chocolate brownies',
    priceCents: 450,
    category: 'Dessert',
    tags: ['dessert', 'vegetarian'],
    isAvailable: true,
  },
  {
    id: 'cat-des-002',
    type: 'menu_item',
    name: 'Fruit Platter',
    description: 'Seasonal fresh fruit selection',
    priceCents: 850,
    category: 'Dessert',
    tags: ['dessert', 'healthy', 'vegetarian', 'vegan'],
    isAvailable: true,
  },
  {
    id: 'cat-des-003',
    type: 'menu_item',
    name: 'Tiramisu',
    description: 'Classic Italian coffee-flavored dessert',
    priceCents: 650,
    category: 'Dessert',
    tags: ['dessert', 'vegetarian', 'premium'],
    isAvailable: true,
  },
  {
    id: 'cat-des-004',
    type: 'menu_item',
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    priceCents: 750,
    category: 'Dessert',
    tags: ['dessert', 'vegetarian'],
    isAvailable: true,
  },

  // BEVERAGES
  {
    id: 'cat-bev-001',
    type: 'menu_item',
    name: 'Fresh Lemonade',
    description: 'House-made lemonade with mint',
    priceCents: 350,
    category: 'Beverage',
    tags: ['beverage', 'non-alcoholic'],
    isAvailable: true,
  },
  {
    id: 'cat-bev-002',
    type: 'menu_item',
    name: 'Iced Tea',
    description: 'Freshly brewed iced tea',
    priceCents: 300,
    category: 'Beverage',
    tags: ['beverage', 'non-alcoholic'],
    isAvailable: true,
  },
  {
    id: 'cat-bev-003',
    type: 'menu_item',
    name: 'Coffee Service',
    description: 'Freshly brewed coffee with cream and sugar',
    priceCents: 250,
    category: 'Beverage',
    tags: ['beverage', 'hot'],
    isAvailable: true,
  },
  {
    id: 'cat-bev-004',
    type: 'menu_item',
    name: 'Sparkling Water',
    description: 'Premium sparkling water',
    priceCents: 200,
    category: 'Beverage',
    tags: ['beverage', 'non-alcoholic'],
    isAvailable: true,
  },

  // EQUIPMENT
  {
    id: 'cat-eq-001',
    type: 'equipment',
    name: 'Chafing Dish',
    description: 'Stainless steel chafing dish with fuel',
    priceCents: 2500,
    category: 'Equipment',
    tags: ['equipment', 'serving'],
    isAvailable: true,
  },
  {
    id: 'cat-eq-002',
    type: 'equipment',
    name: 'Beverage Dispenser',
    description: '5-gallon glass beverage dispenser',
    priceCents: 1500,
    category: 'Equipment',
    tags: ['equipment', 'beverage'],
    isAvailable: true,
  },
  {
    id: 'cat-eq-003',
    type: 'equipment',
    name: 'Serving Platters',
    description: 'Set of decorative serving platters',
    priceCents: 1000,
    category: 'Equipment',
    tags: ['equipment', 'serving'],
    isAvailable: true,
  },
  {
    id: 'cat-eq-004',
    type: 'equipment',
    name: 'Table Linens Set',
    description: 'Premium tablecloths and napkins',
    priceCents: 3500,
    category: 'Equipment',
    tags: ['equipment', 'decor'],
    isAvailable: true,
  },

  // SERVICES
  {
    id: 'cat-srv-001',
    type: 'service',
    name: 'Professional Server (4 hours)',
    description: 'Experienced catering server',
    priceCents: 15000,
    category: 'Service',
    tags: ['service', 'labor'],
    isAvailable: true,
  },
  {
    id: 'cat-srv-002',
    type: 'service',
    name: 'Bartender (4 hours)',
    description: 'Professional bartender service',
    priceCents: 18000,
    category: 'Service',
    tags: ['service', 'labor'],
    isAvailable: true,
  },
  {
    id: 'cat-srv-003',
    type: 'service',
    name: 'Setup & Cleanup',
    description: 'Complete event setup and post-event cleanup',
    priceCents: 8500,
    category: 'Service',
    tags: ['service', 'labor'],
    isAvailable: true,
  },
  {
    id: 'cat-srv-004',
    type: 'service',
    name: 'Event Coordinator',
    description: 'On-site event coordination',
    priceCents: 25000,
    category: 'Service',
    tags: ['service', 'premium'],
    isAvailable: true,
  },

  // DELIVERY
  {
    id: 'cat-del-001',
    type: 'delivery',
    name: 'Standard Delivery',
    description: 'Delivery within 15 miles',
    priceCents: 5000,
    category: 'Delivery',
    tags: ['delivery'],
    isAvailable: true,
  },
  {
    id: 'cat-del-002',
    type: 'delivery',
    name: 'Premium Delivery',
    description: 'White-glove delivery within 30 miles',
    priceCents: 10000,
    category: 'Delivery',
    tags: ['delivery', 'premium'],
    isAvailable: true,
  },
  {
    id: 'cat-del-003',
    type: 'delivery',
    name: 'Same-Day Rush Delivery',
    description: 'Expedited same-day delivery',
    priceCents: 15000,
    category: 'Delivery',
    tags: ['delivery', 'rush'],
    isAvailable: true,
  },
]

const DEMO_OFFER: Offer = {
  id: 'demo-offer-001',
  title: 'Tech Corp November Catering',
  status: 'draft',
  currency: 'USD',
  version: 1,
  blocks: [],
  subtotalCents: 0,
  taxCents: 0,
  discountCents: 0,
  totalCents: 0,
  createdAt: new Date().toISOString(),
  createdBy: 'demo-user',
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
    <OfferBuilder
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
