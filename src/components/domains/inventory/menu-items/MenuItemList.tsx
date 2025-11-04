'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MenuItemTable } from './MenuItemTable'
import { MenuItemFormDialog } from './MenuItemFormDialog'
import type { components } from '@/lib/api'

type MenuItem = components['schemas']['response.MenuItem']

interface MenuItemListProps {
  catererId: string
}

export function MenuItemList({ catererId }: MenuItemListProps) {
  const t = useTranslations('inventory.menuItems')

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | undefined>()

  const handleFormClose = () => {
    setFormDialogOpen(false)
    setEditingMenuItem(undefined)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t('title')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3.5">
          <button
            onClick={() => setFormDialogOpen(true)}
            className="bg-brand-500 hover:bg-brand-600 shadow-theme-xs flex h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10 4.16675V15.8334M4.16667 10.0001H15.8333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t('actions.add')}
          </button>
        </div>
      </div>

      {/* Table */}
      <MenuItemTable catererId={catererId} />

      {/* Form Dialog */}
      <MenuItemFormDialog
        catererId={catererId}
        open={formDialogOpen}
        onOpenChange={handleFormClose}
        menuItem={editingMenuItem}
      />
    </div>
  )
}
