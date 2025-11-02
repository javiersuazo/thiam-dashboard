import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { menuBuilderService, type CreateMenuRequest, type UpdateMenuRequest } from '../api/menuBuilder.service'
import type { MenuItem } from '../types'

const USE_MOCK_DATA = true

const MOCK_MENU_ITEMS: MenuItem[] = [
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
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce',
    category: 'mains',
    dietaryTags: ['gluten-free'],
    priceCents: 2800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Ribeye Steak',
    description: '12oz prime ribeye grilled to perfection',
    category: 'mains',
    priceCents: 3500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Truffle Fries',
    description: 'Crispy fries with truffle oil and parmesan',
    category: 'sides',
    priceCents: 850,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '6',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center',
    category: 'desserts',
    priceCents: 1200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80',
    isAvailable: true,
  },
]

export const MENU_BUILDER_KEYS = {
  all: ['menu-builder'] as const,
  lists: () => [...MENU_BUILDER_KEYS.all, 'list'] as const,
  list: (accountId: string) => [...MENU_BUILDER_KEYS.lists(), accountId] as const,
  details: () => [...MENU_BUILDER_KEYS.all, 'detail'] as const,
  detail: (accountId: string, menuId: string) => [...MENU_BUILDER_KEYS.details(), accountId, menuId] as const,
  items: () => [...MENU_BUILDER_KEYS.all, 'items'] as const,
  itemsList: (accountId: string) => [...MENU_BUILDER_KEYS.items(), accountId] as const,
}

export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.itemsList(accountId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return MOCK_MENU_ITEMS
      }
      return menuBuilderService.getAvailableItems(accountId)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useMenu(accountId: string, menuId?: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.detail(accountId, menuId || ''),
    queryFn: () => menuBuilderService.getMenu(accountId, menuId!),
    enabled: !!menuId,
  })
}

export function useMenus(accountId: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.list(accountId),
    queryFn: () => menuBuilderService.listMenus(accountId),
  })
}

export function useCreateMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (menu: CreateMenuRequest) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Mock: Created menu', menu)
        return {
          ...menu,
          id: `menu_${Date.now()}`,
          accountId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          courses: menu.courses.map((c, idx) => ({
            ...c,
            id: `course_${idx}`,
            items: c.items.map((item, itemIdx) => ({
              ...item,
              id: `item_${itemIdx}`,
            })),
          })),
        }
      }
      return menuBuilderService.createMenu(accountId, menu)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      toast.success('Menu created successfully')
    },
    onError: () => {
      toast.error('Failed to create menu')
    },
  })
}

export function useUpdateMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ menuId, menu }: { menuId: string; menu: UpdateMenuRequest }) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Mock: Updated menu', menuId, menu)
        return {
          ...menu,
          id: menuId,
          accountId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          courses: menu.courses.map((c, idx) => ({
            ...c,
            id: c.id || `course_${idx}`,
            items: c.items.map((item, itemIdx) => ({
              ...item,
              id: `item_${itemIdx}`,
            })),
          })),
        }
      }
      return menuBuilderService.updateMenu(accountId, menuId, menu)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.detail(accountId, data.id) })
      toast.success('Menu updated successfully')
    },
    onError: () => {
      toast.error('Failed to update menu')
    },
  })
}

export function useDeleteMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (menuId: string) => menuBuilderService.deleteMenu(accountId, menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      toast.success('Menu deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete menu')
    },
  })
}

export function useDuplicateMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (menuId: string) => menuBuilderService.duplicateMenu(accountId, menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      toast.success('Menu duplicated successfully')
    },
    onError: () => {
      toast.error('Failed to duplicate menu')
    },
  })
}
