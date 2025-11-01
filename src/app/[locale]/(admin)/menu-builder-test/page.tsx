'use client'

import { MenuBuilderWizard } from '@/components/domains/menus/menu-builder/MenuBuilderWizard'
import { MenuItem, MenuBuilder } from '@/components/domains/menus/menu-builder/types'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'

const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Caesar Salad',
    description: 'Classic romaine lettuce with parmesan, croutons, and Caesar dressing',
    category: 'salads',
    dietaryTags: ['vegetarian'],
    priceCents: 1200,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Bruschetta',
    description: 'Toasted bread topped with fresh tomatoes, basil, and olive oil',
    category: 'appetizers',
    dietaryTags: ['vegan', 'vegetarian'],
    priceCents: 800,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'French Onion Soup',
    description: 'Caramelized onions in rich beef broth with melted gruyere',
    category: 'soups',
    priceCents: 1000,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables',
    category: 'mains',
    dietaryTags: ['gluten-free'],
    priceCents: 2800,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Ribeye Steak',
    description: '12oz prime ribeye grilled to perfection with garlic butter',
    category: 'mains',
    dietaryTags: ['gluten-free'],
    priceCents: 3500,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '6',
    name: 'Pasta Primavera',
    description: 'Fresh seasonal vegetables tossed with penne in light cream sauce',
    category: 'mains',
    dietaryTags: ['vegetarian'],
    priceCents: 2200,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '7',
    name: 'Mushroom Risotto',
    description: 'Creamy arborio rice with wild mushrooms and truffle oil',
    category: 'mains',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 2400,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '8',
    name: 'Garlic Bread',
    description: 'Warm baguette with garlic butter and fresh parsley',
    category: 'sides',
    dietaryTags: ['vegetarian'],
    priceCents: 600,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '9',
    name: 'Roasted Vegetables',
    description: 'Seasonal vegetables roasted with herbs and olive oil',
    category: 'sides',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 700,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '10',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 1000,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '11',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 1200,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '12',
    name: 'Crème Brûlée',
    description: 'Creamy vanilla custard with caramelized sugar topping',
    category: 'desserts',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 900,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '13',
    name: 'Caprese Salad',
    description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
    category: 'appetizers',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 1100,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '14',
    name: 'Shrimp Cocktail',
    description: 'Chilled jumbo shrimp with zesty cocktail sauce',
    category: 'appetizers',
    dietaryTags: ['gluten-free'],
    priceCents: 1500,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '15',
    name: 'Greek Salad',
    description: 'Mixed greens with feta, olives, cucumber, and Greek vinaigrette',
    category: 'salads',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 1100,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '16',
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast with marinara and melted mozzarella',
    category: 'mains',
    priceCents: 2400,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '17',
    name: 'Lobster Ravioli',
    description: 'Handmade ravioli stuffed with lobster in cream sauce',
    category: 'mains',
    priceCents: 3200,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '18',
    name: 'Fresh Lemonade',
    description: 'Freshly squeezed lemon juice with mint',
    category: 'beverages',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 400,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '19',
    name: 'Iced Tea',
    description: 'Freshly brewed black tea served over ice',
    category: 'beverages',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 350,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: '20',
    name: 'Espresso',
    description: 'Rich Italian espresso shot',
    category: 'beverages',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 300,
    currency: 'USD',
    isAvailable: true,
  },
]

export default function MenuBuilderTestPage() {
  const handleSave = async (menu: MenuBuilder) => {
    console.log('Saving menu:', menu)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <div className="h-screen flex flex-col">
      <PageBreadcrumb pageTitle="Create New Menu" />
      <div className="flex-1 overflow-hidden">
        <MenuBuilderWizard
          accountId="test-account"
          availableItems={MOCK_MENU_ITEMS}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
