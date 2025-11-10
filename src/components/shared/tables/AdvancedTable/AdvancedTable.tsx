/**
 * AdvancedTable - Clean API Wrapper
 *
 * This is the new clean API that should be used for all new tables.
 * It wraps AdvancedTableEnhanced with a better configuration interface.
 *
 * @example
 * ```tsx
 * <AdvancedTable
 *   columns={columns}
 *   data={data}
 *   features={{ sorting: true, filtering: true }}
 *   server={{ enabled: true, isLoading, totalPages }}
 *   editing={{ enabled: true, columns: ['name', 'email'] }}
 * />
 * ```
 */

'use client'

import { AdvancedTableEnhanced } from './AdvancedTableEnhanced'
import { adaptTableConfig, applyDefaults } from './configAdapter'
import type { TableConfig } from './types'

export function AdvancedTable<TData>(config: TableConfig<TData>) {
  // Apply defaults and adapt to legacy format
  const fullConfig = applyDefaults(config)
  const legacyProps = adaptTableConfig(fullConfig)

  return <AdvancedTableEnhanced {...legacyProps} />
}

// Re-export types for convenience
export type { TableConfig } from './types'
export { createTableConfig, TablePresets } from './types'
