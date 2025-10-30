"use client";

import React, { useState, useEffect } from "react";
import { useCreateIngredient, useUpdateIngredient } from "@/lib/api/ingredients.hooks";
import type { CreateIngredientRequest, Ingredient, IngredientCategory, IngredientUnit } from "@/lib/api/ingredients.hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import Label from "@/components/shared/form/Label";
import Input from "@/components/shared/form/input/InputField";
import Select from "@/components/shared/form/Select";
import TextArea from "@/components/shared/form/input/TextArea";
import Form from "@/components/shared/form/Form";
import Button from "@/components/shared/ui/button/Button";
import { toast } from "sonner";

interface IngredientFormDialogProps {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient;
}

const INGREDIENT_CATEGORIES: { value: IngredientCategory; label: string }[] = [
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "meat", label: "Meat" },
  { value: "seafood", label: "Seafood" },
  { value: "dairy", label: "Dairy" },
  { value: "grains", label: "Grains" },
  { value: "bakery", label: "Bakery" },
  { value: "spices", label: "Spices" },
  { value: "oils", label: "Oils" },
  { value: "condiments", label: "Condiments" },
  { value: "beverages", label: "Beverages" },
  { value: "canned", label: "Canned" },
  { value: "frozen", label: "Frozen" },
  { value: "supplies", label: "Supplies" },
  { value: "other", label: "Other" },
];

const INGREDIENT_UNITS: { value: IngredientUnit; label: string }[] = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "l", label: "Liters (l)" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "piece", label: "Pieces" },
];

export function IngredientFormDialog({
  accountId,
  open,
  onOpenChange,
  ingredient,
}: IngredientFormDialogProps) {
  const isEditMode = !!ingredient;
  const createMutation = useCreateIngredient(accountId);
  const updateMutation = useUpdateIngredient(accountId);

  const [formData, setFormData] = useState<CreateIngredientRequest>({
    name: "",
    category: "vegetables",
    unit: "kg",
    currentStock: 0,
    reorderLevel: 0,
    costPerUnitCents: undefined,
    currency: "USD",
    supplier: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        category: ingredient.category,
        unit: ingredient.unit,
        currentStock: ingredient.currentStock,
        reorderLevel: ingredient.reorderLevel,
        costPerUnitCents: ingredient.costPerUnitCents,
        currency: ingredient.currency,
        supplier: ingredient.supplier,
        description: ingredient.description,
        isActive: ingredient.isActive,
      });
    } else {
      setFormData({
        name: "",
        category: "vegetables",
        unit: "kg",
        currentStock: 0,
        reorderLevel: 0,
        costPerUnitCents: undefined,
        currency: "USD",
        supplier: "",
        description: "",
        isActive: true,
      });
    }
  }, [ingredient, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          ingredientId: ingredient.id,
          data: formData,
        });
        toast.success("Ingredient updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Ingredient created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(isEditMode ? "Failed to update ingredient" : "Failed to create ingredient");
    }
  };

  const handleCostChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      setFormData((prev) => ({
        ...prev,
        costPerUnitCents: Math.round(amount * 100),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        costPerUnitCents: undefined,
      }));
    }
  };

  const getCostValue = () => {
    if (formData.costPerUnitCents === undefined || formData.costPerUnitCents === null) return "";
    return (formData.costPerUnitCents / 100).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Ingredient" : "Add New Ingredient"}
          </DialogTitle>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name - Full Width */}
            <div className="col-span-2">
              <Label htmlFor="name">
                Ingredient Name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Organic Tomatoes"
                required
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Category */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="category">
                Category <span className="text-error-500">*</span>
              </Label>
              <Select
                options={INGREDIENT_CATEGORIES}
                defaultValue={formData.category}
                onChange={(value) =>
                  setFormData({ ...formData, category: value as IngredientCategory })
                }
                placeholder="Select category"
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Unit */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="unit">
                Unit <span className="text-error-500">*</span>
              </Label>
              <Select
                options={INGREDIENT_UNITS}
                defaultValue={formData.unit}
                onChange={(value) =>
                  setFormData({ ...formData, unit: value as IngredientUnit })
                }
                placeholder="Select unit"
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Current Stock */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="currentStock">
                Current Stock <span className="text-error-500">*</span>
              </Label>
              <Input
                id="currentStock"
                type="number"
                step="0.01"
                value={formData.currentStock}
                onChange={(e) =>
                  setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })
                }
                required
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Reorder Level */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="reorderLevel">
                Reorder Level <span className="text-error-500">*</span>
              </Label>
              <Input
                id="reorderLevel"
                type="number"
                step="0.01"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) || 0 })
                }
                required
                className="bg-gray-50 dark:bg-gray-800"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum stock before alert (e.g., 10 = alert when stock ≤ 10)
              </p>
            </div>

            {/* Cost per Unit */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="costPerUnit">Cost per Unit</Label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                  $
                </span>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  value={getCostValue()}
                  onChange={(e) => handleCostChange(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                type="text"
                value={formData.currency || "USD"}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="USD"
                maxLength={3}
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Supplier - Full Width */}
            <div className="col-span-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                type="text"
                value={formData.supplier || ""}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g., Fresh Farms Co."
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Description - Full Width */}
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                value={formData.description || ""}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Optional notes about this ingredient"
                rows={3}
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Is Active Checkbox */}
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Active ingredient
                </span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="col-span-2 flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                size="sm"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Ingredient"
                  : "Create Ingredient"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
