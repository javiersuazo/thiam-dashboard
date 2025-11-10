import type { ISchemaProvider, ColumnDefinition, FieldType } from '../../core/interfaces'

export class ManualSchemaProvider<TRow = any> implements ISchemaProvider<TRow> {
  constructor(private columns: ColumnDefinition<TRow>[]) {}

  getColumns(): ColumnDefinition<TRow>[] {
    return this.columns
  }

  getColumn(key: keyof TRow | string): ColumnDefinition<TRow> | undefined {
    return this.columns.find(col => col.key === key)
  }

  getFieldType(field: keyof TRow): FieldType {
    const column = this.getColumn(field)
    return column?.type || 'text'
  }
}
