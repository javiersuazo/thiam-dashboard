export interface MenuItem {
  id: string
  name: string
  description?: string
  category: string
  dietaryTags?: string[]
  ingredients?: string[]
  priceCents: number
  currency: string
  imageUrl?: string
  isAvailable: boolean
}

export interface CourseItem {
  menuItemId: string
  position: number
  priceCents?: number
  isAvailable: boolean
}

export interface Course {
  id: string
  name: string
  icon: string
  position: number
  items: CourseItem[]
  isCollapsed?: boolean
}

export type PricingStrategy = 'fixed' | 'sum-of-items'

export interface MenuBuilder {
  id?: string
  name: string
  description?: string
  imageUrl?: string
  availableFrom?: string
  availableTo?: string
  tags?: string[]
  courses: Course[]
  isActive: boolean
  pricingStrategy?: PricingStrategy
  fixedPriceCents?: number
}

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'halal' | 'kosher'

export const DEFAULT_COURSES: Omit<Course, 'id' | 'items'>[] = [
  { name: 'Appetizers', icon: '🥗', position: 0 },
  { name: 'Soups & Salads', icon: '🥣', position: 1 },
  { name: 'Main Courses', icon: '🍽️', position: 2 },
  { name: 'Sides', icon: '🥙', position: 3 },
  { name: 'Desserts', icon: '🍰', position: 4 },
  { name: 'Beverages', icon: '🥤', position: 5 },
]

export type WizardStep = 'setup' | 'build'

export interface WizardState {
  currentStep: WizardStep
  completedSteps: WizardStep[]
  canProceed: boolean
}
