"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { DataTable, DataTableColumn } from "@/components/shared/common/DataTable";
import { useBulkOperations } from "@/hooks/useBulkOperations";
import { useDeleteMenuItem, useUpdateMenuItem } from "@/lib/api/menuItems.hooks";
import type { MenuItem, MenuItemWithDetails } from "@/lib/api/menuItems.hooks";
import { Trash2, Image as ImageIcon, List } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface MenuItemTableProps {
  catererId: string;
  data: MenuItem[];
  isLoading: boolean;
  onShowIngredients?: (item: MenuItem) => void;
  onShowMedia?: (item: MenuItem) => void;
}

export function MenuItemTable({
  catererId,
  data,
  isLoading,
  onShowIngredients,
  onShowMedia,
}: MenuItemTableProps) {
  const t = useTranslations("menu.items");
  const queryClient = useQueryClient();

  const deleteMutation = useDeleteMenuItem(catererId);
  const updateMutation = useUpdateMenuItem(catererId);

  // Format currency helper
  const formatCurrency = (cents: number | null | undefined, currency: string) => {
    if (cents === null || cents === undefined) return "—";
    const amount = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Bulk operations
  const { bulkDelete } = useBulkOperations<MenuItem>({
    deleteFn: async (ids) => {
      await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", catererId] });
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
  const columns: DataTableColumn<MenuItem>[] = [
    {
      key: "name",
      label: t("table.name"),
      sortable: true,
      editable: true,
      width: "250px",
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
          {row.sku && (
            <span className="text-xs text-gray-400 dark:text-gray-600">SKU: {row.sku}</span>
          )}
        </div>
      ),
    },
    {
      key: "tags",
      label: t("table.courseType"),
      width: "150px",
      render: (_, row) => {
        const menuItemWithDetails = row as MenuItemWithDetails;
        const courseTag = menuItemWithDetails.tags?.find(tag =>
          ["starter", "main", "dessert", "snack", "drink", "side"].includes(tag.groupSlug || "")
        );

        if (!courseTag && !menuItemWithDetails.courseType) {
          return <span className="text-xs text-gray-400 dark:text-gray-600">—</span>;
        }

        const courseType = menuItemWithDetails.courseType || courseTag?.groupSlug;

        const colors = {
          starter: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-500",
          main: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-500",
          dessert: "bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-500",
          snack: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-500",
          drink: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-500",
          side: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500",
          other: "bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-500",
        };

        return (
          <span
            className={`text-xs rounded-full px-2 py-0.5 font-medium capitalize ${
              colors[courseType as keyof typeof colors] || colors.other
            }`}
          >
            {courseType}
          </span>
        );
      },
    },
    {
      key: "priceCents",
      label: t("table.price"),
      sortable: true,
      editable: true,
      align: "right",
      render: (value, row) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
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
          placeholder="Price (cents)"
        />
      ),
    },
    {
      key: "portionSize",
      label: t("table.portionSize"),
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-400">{value || "—"}</span>
      ),
    },
    {
      key: "numberOfPeopleServed",
      label: t("table.servings"),
      align: "center",
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {value ? `${value} ${value === 1 ? "person" : "people"}` : "—"}
        </span>
      ),
    },
    {
      key: "deliveryType",
      label: t("table.deliveryType"),
      render: (value) => {
        if (!value) return <span className="text-sm text-gray-500 dark:text-gray-500">—</span>;

        const colors = {
          hot: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500",
          cold: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-500",
          frozen: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-500",
          ambient: "bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-500",
        };

        return (
          <span
            className={`text-xs rounded-full px-2 py-0.5 font-medium capitalize ${
              colors[value as keyof typeof colors] || colors.ambient
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "visibility",
      label: t("table.visibility"),
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-400 capitalize">
          {value}
        </span>
      ),
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
  const handleUpdate = async (id: string, updateData: Partial<MenuItem>) => {
    // Validation
    if (updateData.name !== undefined && updateData.name.trim() === "") {
      toast.error(t("inlineEdit.validation.nameRequired"));
      throw new Error("Name is required");
    }
    if (
      updateData.priceCents !== undefined &&
      (updateData.priceCents < 0 || isNaN(updateData.priceCents))
    ) {
      toast.error(t("inlineEdit.validation.pricePositive"));
      throw new Error("Invalid price");
    }

    try {
      await updateMutation.mutateAsync({
        menuItemId: id,
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
    } catch {
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
            const items = data.filter((item) => ids.includes(item.id));
            bulkDelete(ids, items);
          },
        },
      ]}
      actions={[
        ...(onShowIngredients
          ? [
              {
                label: t("actions.viewIngredients"),
                icon: <List className="h-4 w-4" />,
                onClick: (row: MenuItem) => onShowIngredients(row),
              },
            ]
          : []),
        ...(onShowMedia
          ? [
              {
                label: t("actions.viewMedia"),
                icon: <ImageIcon className="h-4 w-4" />,
                onClick: (row: MenuItem) => onShowMedia(row),
              },
            ]
          : []),
        {
          label: t("actions.delete"),
          icon: <Trash2 className="h-4 w-4" />,
          variant: "danger" as const,
          onClick: (row: MenuItem) => handleDelete(row.id),
        },
      ]}
      defaultSortBy="name"
      defaultSortOrder="asc"
    />
  );
}
