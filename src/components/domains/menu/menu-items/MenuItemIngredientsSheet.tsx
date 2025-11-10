"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/shared/ui/sheet";
import { DataTable, DataTableColumn } from "@/components/shared/common/DataTable";
import { Button } from "@/components/shared/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem, MenuItemIngredient } from "@/lib/api/menuItems.hooks";
import { useRemoveIngredient } from "@/lib/api/menuItems.hooks";

interface MenuItemIngredientsSheetProps {
  catererId: string;
  menuItem: MenuItem | null;
  ingredients: MenuItemIngredient[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIngredient?: () => void;
}

export function MenuItemIngredientsSheet({
  catererId,
  menuItem,
  ingredients,
  open,
  onOpenChange,
  onAddIngredient,
}: MenuItemIngredientsSheetProps) {
  const t = useTranslations("menu.items.ingredients");
  const removeIngredientMutation = useRemoveIngredient(catererId);

  // Format currency helper
  const formatCurrency = (cents: number | null | undefined, currency: string) => {
    if (cents === null || cents === undefined) return "—";
    const amount = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Calculate cost for an ingredient based on quantity
  const calculateIngredientCost = (ingredient: MenuItemIngredient) => {
    if (!ingredient.ingredient) return 0;
    const { costPerUnitCents } = ingredient.ingredient;
    const quantity = ingredient.quantityPerPortion;
    return (costPerUnitCents * quantity) / 100; // Convert to dollars
  };

  // Calculate total cost of all ingredients
  const totalCost = ingredients.reduce((sum, ing) => {
    return sum + calculateIngredientCost(ing);
  }, 0);

  // Define columns for ingredients table (simplified, read-only version)
  const columns: DataTableColumn<MenuItemIngredient>[] = [
    {
      key: "ingredient",
      label: t("table.name"),
      width: "200px",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            {row.ingredient?.name || "Unknown"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {t("table.available")}: {row.ingredient?.currentStock || 0}{" "}
            {row.ingredient?.unit || ""}
          </span>
        </div>
      ),
    },
    {
      key: "quantityPerPortion",
      label: t("table.quantity"),
      align: "right",
      render: (value, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {value.toFixed(2)} {row.unit || row.ingredient?.unit || ""}
        </span>
      ),
    },
    {
      key: "ingredient",
      label: t("table.costPerUnit"),
      align: "right",
      render: (_, row) => {
        if (!row.ingredient) return <span className="text-sm text-gray-500">—</span>;
        return (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {formatCurrency(row.ingredient.costPerUnitCents, row.ingredient.currency)}
          </span>
        );
      },
    },
    {
      key: "id",
      label: t("table.totalCost"),
      align: "right",
      render: (_, row) => {
        const cost = calculateIngredientCost(row);
        return (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            {formatCurrency(cost * 100, row.ingredient?.currency || "USD")}
          </span>
        );
      },
    },
  ];

  // Handle delete ingredient
  const handleDelete = async (ingredientId: string) => {
    if (!menuItem) return;

    try {
      await removeIngredientMutation.mutateAsync({
        menuItemId: menuItem.id,
        ingredientId,
      });
      toast.success(t("deleteSuccess"));
    } catch {
      toast.error(t("deleteFailed"));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {t("title")} - {menuItem?.name}
          </SheetTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Cost Summary */}
          {ingredients.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("summary.ingredientCost")}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(totalCost * 100, menuItem?.currency || "USD")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("summary.sellingPrice")}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(menuItem?.priceCents, menuItem?.currency || "USD")}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {t("summary.margin")}:
                </span>
                <span
                  className={`font-medium ${
                    menuItem && menuItem.priceCents > totalCost * 100
                      ? "text-green-600 dark:text-green-500"
                      : "text-red-600 dark:text-red-500"
                  }`}
                >
                  {menuItem
                    ? formatCurrency(
                        menuItem.priceCents - totalCost * 100,
                        menuItem.currency
                      )
                    : "—"}{" "}
                  {menuItem && totalCost > 0
                    ? `(${(
                        ((menuItem.priceCents / 100 - totalCost) / (menuItem.priceCents / 100)) *
                        100
                      ).toFixed(1)}%)`
                    : ""}
                </span>
              </div>
            </div>
          )}

          {/* Ingredients Table */}
          <DataTable
            data={ingredients}
            columns={columns}
            loading={false}
            emptyMessage={t("emptyState")}
            selectable={false}
            onDoubleClickEdit={false}
            actions={[
              {
                label: t("actions.remove"),
                icon: <Trash2 className="h-4 w-4" />,
                variant: "danger",
                onClick: (row) => handleDelete(row.ingredientId),
              },
            ]}
          />

          {/* Add Ingredient Button */}
          {onAddIngredient && (
            <Button
              onClick={onAddIngredient}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("actions.addIngredient")}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
