'use client'

import { useAvailableMenuItems, useCreateMenu, useUpdateMenu, useMenu } from '../hooks/useMenuBuilder'
import { FastMenuBuilder } from './FastMenuBuilder'
import { menuBuilderSchema } from '../validation/schemas'
import type { MenuBuilder } from '../types'

interface MenuBuilderContainerProps {
  accountId: string
  menuId?: string
  onSuccess?: (menuId: string) => void
  onCancel?: () => void
}

export function MenuBuilderContainer({ accountId, menuId, onSuccess, onCancel }: MenuBuilderContainerProps) {
  const { data: availableItems = [], isLoading: isLoadingItems } = useAvailableMenuItems(accountId)
  const { data: existingMenu, isLoading: isLoadingMenu } = useMenu(accountId, menuId)
  const createMutation = useCreateMenu(accountId)
  const updateMutation = useUpdateMenu(accountId)

  const isLoading = isLoadingItems || (menuId && isLoadingMenu)

  const handleSave = async (menu: MenuBuilder) => {
    const validationResult = menuBuilderSchema.safeParse(menu)

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      throw new Error(firstError.message)
    }

    if (menuId) {
      const result = await updateMutation.mutateAsync({
        menuId,
        menu: { ...menu, id: menuId },
      })
      onSuccess?.(result.id!)
    } else {
      const result = await createMutation.mutateAsync(menu)
      onSuccess?.(result.id!)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  return (
    <FastMenuBuilder
      accountId={accountId}
      initialMenu={existingMenu as MenuBuilder | undefined}
      availableItems={availableItems}
      onSave={handleSave}
      onCancel={onCancel}
    />
  )
}
