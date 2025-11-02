'use client'

import { MenuBuilderContainer } from '@/components/domains/menus/menu-builder'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'
import { useRouter } from 'next/navigation'

export default function MenuBuilderTestPage() {
  const router = useRouter()

  return (
    <div className="h-screen flex flex-col">
      <PageBreadcrumb pageTitle="Menu Builder" />
      <div className="flex-1 overflow-hidden">
        <MenuBuilderContainer
          accountId="test-account"
          onSuccess={(menuId) => {
            console.log('Menu saved with ID:', menuId)
            router.push(`/menus/${menuId}`)
          }}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  )
}

/*
 * OLD VERSION WITH MANUAL MOCK DATA - Keeping for reference
 * The new version uses MenuBuilderContainer which automatically
 * fetches data from useAvailableMenuItems hook (currently returns mock data)
 */

/*
const MOCK_MENU_ITEMS_OLD: MenuItem[] = [
  {
    id: '1',
    name: 'Caesar Salad',
    description: 'Classic romaine lettuce with parmesan, croutons, and Caesar dressing',
    category: 'appetizers',
    dietaryTags: ['vegetarian'],
    priceCents: 1200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'French Onion Soup',
    description: 'Caramelized onions in rich beef broth with melted gruyere',
    category: 'appetizers',
    priceCents: 1000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-c6f3b43e2c85?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1633967135257-1d5c8e87dc0d?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '15',
    name: 'Greek Salad',
    description: 'Mixed greens with feta, olives, cucumber, and Greek vinaigrette',
    category: 'appetizers',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 1100,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '16',
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast with marinara and melted mozzarella',
    category: 'mains',
    priceCents: 2400,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '17',
    name: 'Lobster Ravioli',
    description: 'Handmade ravioli stuffed with lobster in cream sauce',
    category: 'mains',
    priceCents: 3200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1587740908075-9ea9e6e6e0b4?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '21',
    name: 'Tuna Tartare',
    description: 'Fresh yellowfin tuna with avocado, sesame, and soy glaze',
    category: 'appetizers',
    dietaryTags: ['gluten-free'],
    priceCents: 1800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '22',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
    category: 'mains',
    dietaryTags: ['vegetarian'],
    priceCents: 1600,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '23',
    name: 'Fish Tacos',
    description: 'Grilled mahi-mahi with cabbage slaw and chipotle mayo',
    category: 'mains',
    priceCents: 1900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '24',
    name: 'Truffle Fries',
    description: 'Crispy fries tossed with truffle oil and parmesan',
    category: 'sides',
    dietaryTags: ['vegetarian'],
    priceCents: 850,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '25',
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 950,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1533134242820-b4f7f2e89c8c?w=400&q=80',
    isAvailable: true,
  },
]

// OLD handleSave function
const handleSave_OLD = async (menu: MenuBuilder) => {
  console.log('Saving menu:', menu)
  await new Promise(resolve => setTimeout(resolve, 1000))
}

// OLD render
<FastMenuBuilder
  accountId="test-account"
  availableItems={MOCK_MENU_ITEMS_OLD}
  onSave={handleSave_OLD}
/>
*/
