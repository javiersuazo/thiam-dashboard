"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { DataTable, DataTableColumn } from "@/components/shared/common/DataTable";
import { useBulkOperations } from "@/hooks/useBulkOperations";
import { useDeleteIngredient, useUpdateIngredient } from "@/lib/api/ingredients.hooks";
import type { Ingredient } from "@/lib/api/ingredients.hooks";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface IngredientTableProps {
  accountId: string;
  data: Ingredient[];
  isLoading: boolean;
}

export function IngredientTable({ accountId, data, isLoading }: IngredientTableProps) {
  const t = useTranslations("inventory.ingredients");
  const queryClient = useQueryClient();

  const deleteMutation = useDeleteIngredient(accountId);
  const updateMutation = useUpdateIngredient(accountId);

  // Format currency helper
  const formatCurrency = (cents: number | null | undefined, currency: string) => {
    if (cents === null || cents === undefined) return "—";
    const amount = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Get stock status helper
  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    if (currentStock <= 0) {
      return {
        label: t("stockStatus.outOfStock"),
        className: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
      };
    }
    if (currentStock <= reorderLevel) {
      return {
        label: t("stockStatus.lowStock"),
        className: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500"
      };
    }
    return {
      label: t("stockStatus.inStock"),
      className: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500"
    };
  };

  // Bulk operations
  const { bulkDelete } = useBulkOperations<Ingredient>({
    deleteFn: async (ids) => {
      // Delete all selected ingredients
      await Promise.all(ids.map(id => deleteMutation.mutateAsync(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', accountId] });
      toast.success(t("deleteSuccess"));
    },
    onError: () => {
      toast.error(t("deleteFailed"));
    },
    messages: {
      deleted: t("deleteSuccess"),
    },
  });

  // Define columns
  const columns: DataTableColumn<Ingredient>[] = [
    {
      key: "name",
      label: t("table.name"),
      sortable: true,
      editable: true,
      width: "200px",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            {value}
          </span>
          {row.description && (
            <span className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-xs">
              {row.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: t("table.category"),
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-400 capitalize">
          {t(`categories.${value}`)}
        </span>
      ),
    },
    {
      key: "currentStock",
      label: t("table.stock"),
      sortable: true,
      editable: true,
      render: (value, row) => (
        <div>
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {value.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
            ({t("table.reorderLevel")}: {row.reorderLevel})
          </span>
        </div>
      ),
      renderEdit: (value, onChange) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            value={value ?? ""}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="text-sm w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ),
    },
    {
      key: "unit",
      label: t("table.unit"),
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-400 uppercase">
          {value}
        </span>
      ),
    },
    {
      key: "costPerUnitCents",
      label: t("table.costPerUnit"),
      sortable: true,
      editable: true,
      render: (value, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {formatCurrency(value, row.currency)}
        </span>
      ),
      renderEdit: (value, onChange) => (
        <input
          type="number"
          step="1"
          value={value ?? ""}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="text-sm w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Cost (cents)"
        />
      ),
    },
    {
      key: "supplier",
      label: t("table.supplier"),
      editable: true,
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {value || "—"}
        </span>
      ),
      renderEdit: (value, onChange) => (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Supplier"
        />
      ),
    },
    {
      key: "stockStatus",
      label: t("table.status"),
      render: (_, row) => {
        const status = getStockStatus(row.currentStock, row.reorderLevel);
        return (
          <span className={`text-theme-xs rounded-full px-2 py-0.5 font-medium ${status.className}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: t("table.active"),
      align: "center",
      editable: true,
      render: (value) => (
        <input
          type="checkbox"
          checked={value}
          disabled
          className="h-4 w-4 rounded border-gray-300 text-blue-600 disabled:opacity-50 dark:border-gray-600"
        />
      ),
      renderEdit: (value, onChange) => (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
      ),
    },
  ];

  // Handle update with validation
  const handleUpdate = async (id: string, updateData: Partial<Ingredient>) => {
    // Validation
    if (updateData.name !== undefined && updateData.name.trim() === '') {
      toast.error(t("inlineEdit.validation.nameRequired"));
      throw new Error("Name is required");
    }
    if (updateData.currentStock !== undefined && (updateData.currentStock < 0 || isNaN(updateData.currentStock))) {
      toast.error(t("inlineEdit.validation.stockPositive"));
      throw new Error("Invalid stock");
    }
    if (updateData.reorderLevel !== undefined && (updateData.reorderLevel < 0 || isNaN(updateData.reorderLevel))) {
      toast.error(t("inlineEdit.validation.reorderLevelPositive"));
      throw new Error("Invalid reorder level");
    }
    if (updateData.costPerUnitCents !== undefined && (updateData.costPerUnitCents < 0 || isNaN(updateData.costPerUnitCents))) {
      toast.error(t("inlineEdit.validation.costPositive"));
      throw new Error("Invalid cost");
    }

    try {
      await updateMutation.mutateAsync({
        ingredientId: id,
        data: updateData,
      });
      toast.success(t("inlineEdit.success"));
    } catch (error) {
      toast.error(t("inlineEdit.error"));
      throw error;
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteFailed"));
    }
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={isLoading}
      emptyMessage={t("emptyState")}
      selectable
      onDoubleClickEdit
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      bulkActions={[
        {
          label: t("actions.delete") + " selected",
          variant: "danger",
          onClick: (ids) => {
            const items = data.filter(item => ids.includes(item.id));
            bulkDelete(ids, items);
          },
        },
      ]}
      actions={[
        {
          label: t("actions.delete"),
          icon: <Trash2 className="h-4 w-4" />,
          variant: "danger",
          onClick: (row) => handleDelete(row.id),
        },
      ]}
      defaultSortBy="name"
      defaultSortOrder="asc"
    />
  );
}
