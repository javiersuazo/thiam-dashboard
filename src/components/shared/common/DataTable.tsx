"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

/**
 * Generic DataTable Component with Bulk Selection
 *
 * Features:
 * - Bulk selection with checkboxes
 * - Inline editing support
 * - Optimistic updates
 * - Sortable columns
 * - Customizable actions
 * - Loading skeletons
 * - Smooth animations
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={ingredients}
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true, editable: true },
 *     { key: 'stock', label: 'Stock', sortable: true, editable: true },
 *   ]}
 *   onUpdate={(id, data) => updateMutation.mutate({ id, data })}
 *   onDelete={(id) => deleteMutation.mutate(id)}
 *   onBulkDelete={(ids) => bulkDeleteMutation.mutate(ids)}
 * />
 * ```
 */

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  editable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  renderEdit?: (value: any, onChange: (value: any) => void) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "danger";
  hidden?: (row: T) => boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyField?: string;
  loading?: boolean;
  emptyMessage?: string;

  // Selection
  selectable?: boolean;
  onSelectionChange?: (selectedIds: Set<string>) => void;

  // Inline editing
  onUpdate?: (id: string, data: Partial<T>) => Promise<void>;
  onDoubleClickEdit?: boolean;

  // Actions
  actions?: DataTableAction<T>[];
  onDelete?: (id: string) => Promise<void>;

  // Bulk actions
  bulkActions?: Array<{
    label: string;
    onClick: (ids: string[]) => void;
    variant?: "default" | "danger";
  }>;

  // Sorting
  defaultSortBy?: string;
  defaultSortOrder?: "asc" | "desc";
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;

  // Customization
  rowClassName?: (row: T) => string;
  getRowId?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField = "id",
  loading = false,
  emptyMessage = "No data found",
  selectable = false,
  onSelectionChange,
  onUpdate,
  onDoubleClickEdit = true,
  actions = [],
  onDelete,
  bulkActions = [],
  defaultSortBy,
  defaultSortOrder = "asc",
  onSort,
  rowClassName,
  getRowId,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<T>>({});
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);

  // Get row ID
  const getRowIdFn = useCallback(
    (row: T) => {
      if (getRowId) return getRowId(row);
      return String(row[keyField]);
    },
    [getRowId, keyField]
  );

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
      onSelectionChange?.(new Set());
    } else {
      const allIds = new Set(data.map(getRowIdFn));
      setSelectedIds(allIds);
      onSelectionChange?.(allIds);
    }
  }, [data, selectedIds.size, getRowIdFn, onSelectionChange]);

  const handleSelectRow = useCallback(
    (id: string) => {
      const newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      setSelectedIds(newSelectedIds);
      onSelectionChange?.(newSelectedIds);
    },
    [selectedIds, onSelectionChange]
  );

  // Inline editing handlers
  const startEdit = useCallback((row: T) => {
    const id = getRowIdFn(row);
    setEditingRowId(id);
    const editableData: Partial<T> = {};
    columns.forEach((col) => {
      if (col.editable) {
        editableData[col.key as keyof T] = row[col.key];
      }
    });
    setEditFormData(editableData);
  }, [columns, getRowIdFn]);

  const cancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditFormData({});
  }, []);

  const saveEdit = useCallback(
    async (id: string) => {
      if (!onUpdate) return;
      try {
        await onUpdate(id, editFormData);
        setEditingRowId(null);
        setEditFormData({});
      } catch (error) {
        console.error("Failed to update:", error);
      }
    },
    [onUpdate, editFormData]
  );

  const handleRowDoubleClick = useCallback(
    (row: T) => {
      if (onDoubleClickEdit && onUpdate) {
        startEdit(row);
      }
    },
    [onDoubleClickEdit, onUpdate, startEdit]
  );

  // Sorting
  const handleSort = useCallback(
    (columnKey: string) => {
      const newSortOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc";
      setSortBy(columnKey);
      setSortOrder(newSortOrder);
      onSort?.(columnKey, newSortOrder);
    },
    [sortBy, sortOrder, onSort]
  );

  // Check if all rows are selected
  const allSelected = useMemo(
    () => data.length > 0 && selectedIds.size === data.length,
    [data.length, selectedIds.size]
  );

  // Check if some rows are selected
  const someSelected = useMemo(
    () => selectedIds.size > 0 && selectedIds.size < data.length,
    [selectedIds.size, data.length]
  );

  if (loading) {
    return <TableSkeleton columns={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} />;
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bulk Actions Bar */}
      {selectable && selectedIds.size > 0 && bulkActions.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center gap-4 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3 animate-in slide-in-from-top duration-200">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            {bulkActions.map((action, index) => (
              <button
                key={index}
                onClick={() => action.onClick(Array.from(selectedIds))}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  action.variant === "danger"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setSelectedIds(new Set());
              onSelectionChange?.(new Set());
            }}
            className="ml-auto text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {selectable && (
                <th className="p-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = someSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`p-4 text-${column.align || "left"} text-xs font-medium text-gray-700 dark:text-gray-400 ${
                    column.sortable ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900" : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      <span className="text-gray-500">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((row) => {
              const rowId = getRowIdFn(row);
              const isEditing = editingRowId === rowId;
              const isSelected = selectedIds.has(rowId);

              return (
                <tr
                  key={rowId}
                  onDoubleClick={() => handleRowDoubleClick(row)}
                  className={`transition-colors ${
                    isEditing
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : isSelected
                      ? "bg-gray-50 dark:bg-gray-900"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  } ${onDoubleClickEdit && onUpdate && !isEditing ? "cursor-pointer" : ""} ${
                    rowClassName?.(row) || ""
                  }`}
                >
                  {selectable && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={`p-4 whitespace-nowrap text-${column.align || "left"}`}>
                      {isEditing && column.editable ? (
                        column.renderEdit ? (
                          column.renderEdit(editFormData[column.key as keyof T], (value) =>
                            setEditFormData((prev) => ({ ...prev, [column.key]: value }))
                          )
                        ) : (
                          <input
                            type="text"
                            value={String(editFormData[column.key as keyof T] || "")}
                            onChange={(e) =>
                              setEditFormData((prev) => ({ ...prev, [column.key]: e.target.value }))
                            }
                            className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )
                      ) : column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-400">
                          {String(row[column.key] || "—")}
                        </span>
                      )}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="p-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(rowId)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded"
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {onUpdate && (
                            <button
                              onClick={() => startEdit(row)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {actions.map((action, index) => {
                            if (action.hidden?.(row)) return null;
                            return (
                              <button
                                key={index}
                                onClick={() => action.onClick(row)}
                                className={`p-1.5 rounded ${
                                  action.variant === "danger"
                                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                                title={action.label}
                              >
                                {action.icon || action.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Skeleton loader for table
function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
