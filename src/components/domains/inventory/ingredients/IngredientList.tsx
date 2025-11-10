'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { IngredientTable } from './IngredientTable'
import { IngredientFormDialog } from './IngredientFormDialog'
import { BatchListDialog } from './BatchListDialog'
import { CSVUploadDialog } from './CSVUploadDialog'
import type { components } from '@/lib/api'

type Ingredient = components['schemas']['response.IngredientResponse']

interface IngredientListProps {
  accountId: string
}

export function IngredientList({ accountId }: IngredientListProps) {
  const t = useTranslations('inventory.ingredients')

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>()
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | undefined>()
  const [csvUploadOpen, setCsvUploadOpen] = useState(false)

  const handleFormClose = () => {
    setFormDialogOpen(false)
    setEditingIngredient(undefined)
  }

  const handleBatchDialogClose = () => {
    setBatchDialogOpen(false)
    setSelectedIngredient(undefined)
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
            onClick={() => setCsvUploadOpen(true)}
            className="shadow-theme-xs flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M16.6671 13.3333V15.4166C16.6671 16.1069 16.1074 16.6666 15.4171 16.6666H4.58301C3.89265 16.6666 3.33301 16.1069 3.33301 15.4166V13.3333M10.0013 3.33325L10.0013 13.3333M6.14553 7.18708L9.99958 3.33549L13.8539 7.18708"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t('actions.importCSV')}
          </button>

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

      {/* Table - now handles all filtering, sorting, pagination */}
      <IngredientTable accountId={accountId} />

      {/* Form Dialog */}
      <IngredientFormDialog
        accountId={accountId}
        open={formDialogOpen}
        onOpenChange={handleFormClose}
        ingredient={editingIngredient}
      />

      {/* Batch List Dialog */}
      {selectedIngredient && (
        <BatchListDialog
          accountId={accountId}
          ingredientId={selectedIngredient.id!}
          ingredientName={selectedIngredient.name!}
          open={batchDialogOpen}
          onOpenChange={handleBatchDialogClose}
        />
      )}

      {/* CSV Upload Dialog */}
      <CSVUploadDialog
        accountId={accountId}
        open={csvUploadOpen}
        onOpenChange={setCsvUploadOpen}
      />
    </div>
  )
}
