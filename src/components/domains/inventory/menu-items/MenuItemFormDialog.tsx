"use client";

import React, { useState, useEffect } from "react";
import { useCreateMenuItem, useUpdateMenuItem, type MenuItem, type CreateMenuItemRequest, type MenuItemVisibility } from "@/lib/api/menuItems.hooks";
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

interface MenuItemFormDialogProps {
  catererId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem?: MenuItem;
}

const VISIBILITY_OPTIONS: { value: MenuItemVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "storefront", label: "Storefront" },
  { value: "hidden", label: "Hidden" },
  { value: "inherit", label: "Inherit" },
];

export function MenuItemFormDialog({
  catererId,
  open,
  onOpenChange,
  menuItem,
}: MenuItemFormDialogProps) {
  const isEditMode = !!menuItem;
  const createMutation = useCreateMenuItem(catererId);
  const updateMutation = useUpdateMenuItem(catererId);

  const [formData, setFormData] = useState<CreateMenuItemRequest>({
    catererId,
    name: "",
    description: "",
    priceCents: 0,
    currency: "USD",
    portionSize: "",
    sku: "",
    visibility: "public",
    isBundleOnly: false,
    singlePackaged: false,
  });

  useEffect(() => {
    if (menuItem) {
      setFormData({
        catererId,
        name: menuItem.name,
        description: menuItem.description,
        priceCents: menuItem.priceCents,
        currency: menuItem.currency,
        portionSize: menuItem.portionSize,
        sku: menuItem.sku,
        visibility: menuItem.visibility,
        isBundleOnly: menuItem.isBundleOnly,
        singlePackaged: menuItem.singlePackaged,
        numberOfPeopleServed: menuItem.numberOfPeopleServed,
        calories: menuItem.calories,
        proteinG: menuItem.proteinG,
        carbsG: menuItem.carbsG,
        fatG: menuItem.fatG,
      });
    } else {
      setFormData({
        catererId,
        name: "",
        description: "",
        priceCents: 0,
        currency: "USD",
        portionSize: "",
        sku: "",
        visibility: "public",
        isBundleOnly: false,
        singlePackaged: false,
      });
    }
  }, [menuItem, open, catererId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          menuItemId: menuItem.id,
          data: formData,
        });
        toast.success("Menu item updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Menu item created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(isEditMode ? "Failed to update menu item" : "Failed to create menu item");
    }
  };

  const handlePriceChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      setFormData((prev) => ({
        ...prev,
        priceCents: Math.round(amount * 100),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        priceCents: 0,
      }));
    }
  };

  const getPriceValue = () => {
    return (formData.priceCents / 100).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Menu Item" : "Add New Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name - Full Width */}
            <div className="col-span-2">
              <Label htmlFor="name">
                Menu Item Name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grilled Salmon Platter"
                required
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Price */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="price">
                Price <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={getPriceValue()}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  required
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

            {/* Visibility */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="visibility">
                Visibility <span className="text-error-500">*</span>
              </Label>
              <Select
                options={VISIBILITY_OPTIONS}
                defaultValue={formData.visibility}
                onChange={(value) =>
                  setFormData({ ...formData, visibility: value as MenuItemVisibility })
                }
                placeholder="Select visibility"
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Portion Size */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="portionSize">Portion Size</Label>
              <Input
                id="portionSize"
                type="text"
                value={formData.portionSize || ""}
                onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                placeholder="e.g., Serves 10-12"
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* SKU */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                type="text"
                value={formData.sku || ""}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., GS-001"
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Number of People Served */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="numberOfPeopleServed">Number of People Served</Label>
              <Input
                id="numberOfPeopleServed"
                type="number"
                value={formData.numberOfPeopleServed || ""}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfPeopleServed: parseInt(e.target.value) || undefined })
                }
                placeholder="e.g., 10"
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
                placeholder="Describe this menu item..."
                rows={3}
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Nutrition Info Section */}
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
                Nutritional Information (Optional)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, calories: parseInt(e.target.value) || undefined })
                    }
                    placeholder="0"
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <Label htmlFor="proteinG">Protein (g)</Label>
                  <Input
                    id="proteinG"
                    type="number"
                    step="0.1"
                    value={formData.proteinG || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, proteinG: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="0.0"
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <Label htmlFor="carbsG">Carbs (g)</Label>
                  <Input
                    id="carbsG"
                    type="number"
                    step="0.1"
                    value={formData.carbsG || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, carbsG: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="0.0"
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <Label htmlFor="fatG">Fat (g)</Label>
                  <Input
                    id="fatG"
                    type="number"
                    step="0.1"
                    value={formData.fatG || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fatG: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="0.0"
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="col-span-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBundleOnly}
                  onChange={(e) => setFormData({ ...formData, isBundleOnly: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Bundle Only
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.singlePackaged}
                  onChange={(e) => setFormData({ ...formData, singlePackaged: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Single Packaged
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
                  ? "Update Menu Item"
                  : "Create Menu Item"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
