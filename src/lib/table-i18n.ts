import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import type {
  ColumnDefinition,
  SelectOption,
  TableLabels,
  TranslationFunction
} from '@/components/shared/tables/AdvancedTable/core/interfaces'

export function useTableTranslations() {
  const t = useTranslations()

  const translateColumn = useMemo(
    () =>
      <TRow,>(column: ColumnDefinition<TRow>): ColumnDefinition<TRow> => {
        return {
          ...column,
          header: column.headerTranslationKey ? t(column.headerTranslationKey) : column.header,
          options: column.options?.map((option) => ({
            ...option,
            label: option.translationKey ? t(option.translationKey) : option.label
          }))
        }
      },
    [t]
  )

  const translateValue = useMemo(
    () => (value: any, translationKey?: string): string => {
      if (!value) return ''
      if (!translationKey) return String(value)

      const fullKey = `${translationKey}.${value}`
      try {
        return t(fullKey)
      } catch {
        return String(value)
      }
    },
    [t]
  )

  const getTableLabels = useMemo(
    (): TableLabels => ({
      show: t('table.show', { default: 'Show' }),
      entries: t('table.entries', { default: 'entries' }),
      showing: t('table.showing', { default: 'Showing' }),
      to: t('table.to', { default: 'to' }),
      of: t('table.of', { default: 'of' }),
      page: t('table.page', { default: 'Page' }),
      exportCSV: t('table.exportCSV', { default: 'Export CSV' }),
      columns: t('table.columns', { default: 'Columns' }),
      manageColumns: t('table.manageColumns', { default: 'Manage Columns' }),
      showAll: t('table.showAll', { default: 'Show All' }),
      apply: t('table.apply', { default: 'Apply' }),
      clear: t('table.clear', { default: 'Clear' }),
      cancel: t('table.cancel', { default: 'Cancel' }),
      saveAllChanges: t('table.saveAllChanges', { default: 'Save All Changes' }),
      filterBy: t('table.filterBy', { default: 'Filter by' }),
      search: t('table.search', { default: 'Search' }),
      searchPlaceholder: t('table.searchPlaceholder', { default: 'Search...' }),
      min: t('table.min', { default: 'Min' }),
      max: t('table.max', { default: 'Max' }),
      from: t('table.from', { default: 'From' }),
      all: t('table.all', { default: 'All' }),
      yes: t('table.yes', { default: 'Yes' }),
      no: t('table.no', { default: 'No' }),
      selectValue: t('table.selectValue', { default: 'Select value...' }),
      selected: t('table.selected', { default: 'Selected' }),
      availableOptions: t('table.availableOptions', { default: 'Available options' }),
      dragToReorder: t('table.dragToReorder', { default: 'Drag items to reorder columns' }),
      clearSearch: t('table.clearSearch', { default: 'Clear search' })
    }),
    [t]
  )

  const translateOption = useMemo(
    () => (option: SelectOption): SelectOption => ({
      ...option,
      label: option.translationKey ? t(option.translationKey) : option.label
    }),
    [t]
  )

  const createTranslatedOptions = useMemo(
    () =>
      <T extends { id: string; name: string; translationKey?: string }>(
        items: T[],
        namespace: string
      ): SelectOption[] => {
        return items.map((item) => ({
          value: item.id,
          label: item.name,
          translationKey: item.translationKey ? `${namespace}.${item.translationKey}` : undefined
        }))
      },
    []
  )

  return {
    translateColumn,
    translateValue,
    translateOption,
    getTableLabels,
    createTranslatedOptions,
    t
  }
}

export function getTranslatedLabel(option: SelectOption, t: TranslationFunction): string {
  if (!option.translationKey) return option.label

  try {
    return t(option.translationKey)
  } catch {
    return option.label
  }
}
