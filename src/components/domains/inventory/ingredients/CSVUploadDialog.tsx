"use client";

import React, { useState, useRef } from "react";
import { useBulkImportIngredients } from "@/lib/api/ingredients.hooks";
import type { CreateIngredientRequest, IngredientCategory, IngredientUnit } from "@/lib/api/ingredients.hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shared/ui/dialog";
import { toast } from "sonner";

interface CSVUploadDialogProps {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CSVUploadDialog({ accountId, open, onOpenChange }: CSVUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CreateIngredientRequest[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkImportMutation = useBulkImportIngredients(accountId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setParseError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setParseError(null);

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          setParseError("CSV file is empty or has no data rows");
          return;
        }

        // Parse header
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        // Validate required headers
        const requiredHeaders = ["name", "category", "unit", "current_stock", "reorder_level"];
        const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setParseError(`Missing required columns: ${missingHeaders.join(", ")}`);
          return;
        }

        // Parse data rows
        const ingredients: CreateIngredientRequest[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length !== headers.length) continue;

          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });

          // Map to CreateIngredientRequest
          const ingredient: CreateIngredientRequest = {
            name: row["name"] || "",
            category: (row["category"] || "other") as IngredientCategory,
            unit: (row["unit"] || "kg") as IngredientUnit,
            currentStock: parseFloat(row["current_stock"] || "0"),
            reorderLevel: parseFloat(row["reorder_level"] || "0"),
            costPerUnitCents: row["cost_per_unit"]
              ? Math.round(parseFloat(row["cost_per_unit"]) * 100)
              : undefined,
            currency: row["currency"] || "USD",
            supplier: row["supplier"] || undefined,
            description: row["description"] || undefined,
            isActive: row["is_active"]?.toLowerCase() !== "false",
          };

          ingredients.push(ingredient);
        }

        setPreview(ingredients);
        setParseError(null);
      } catch (error) {
        setParseError("Failed to parse CSV file. Please check the format.");
        console.error(error);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      toast.error("No ingredients to import");
      return;
    }

    try {
      const result = await bulkImportMutation.mutateAsync(preview);
      toast.success(
        `Successfully imported ${result.imported} ingredient(s). ${
          result.skipped ? `Skipped ${result.skipped} duplicate(s).` : ""
        }`
      );
      onOpenChange(false);
      resetState();
    } catch (error) {
      toast.error("Failed to import ingredients");
    }
  };

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const downloadTemplate = () => {
    const template = [
      "name,category,unit,current_stock,reorder_level,cost_per_unit,currency,supplier,description,is_active",
      "Organic Tomatoes,vegetables,kg,50,10,2.50,USD,Fresh Farms Co.,Roma tomatoes,true",
      "Chicken Breast,meat,kg,30,5,8.99,USD,Quality Meats Inc.,Boneless skinless,true",
      "Olive Oil,oils,l,20,5,12.50,USD,Mediterranean Imports,Extra virgin,true",
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ingredients_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Ingredients from CSV</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload a CSV file to bulk import ingredients
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Instructions */}
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
            <h4 className="text-sm font-medium text-brand-800 dark:text-brand-300 mb-2">
              CSV Format Requirements
            </h4>
            <ul className="text-xs text-brand-700 dark:text-brand-400 space-y-1 list-disc list-inside">
              <li>Required columns: name, category, unit, current_stock, reorder_level</li>
              <li>Optional columns: cost_per_unit, currency, supplier, description, is_active</li>
              <li>Categories: vegetables, fruits, meat, seafood, dairy, grains, bakery, spices, oils, condiments, beverages, canned, frozen, supplies, other</li>
              <li>Units: kg, g, l, ml, piece</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline"
            >
              Download template CSV
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="shadow-theme-xs cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Choose File
              </label>
              {file && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
              )}
            </div>
            {parseError && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-500">
                {parseError}
              </p>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview ({preview.length} ingredient{preview.length !== 1 ? "s" : ""})
              </h4>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-400">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-400">
                        Category
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-400">
                        Unit
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-400">
                        Stock
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-400">
                        Reorder
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-400">
                        Supplier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {preview.map((ingredient, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-400">
                          {ingredient.name}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-400 capitalize">
                          {ingredient.category}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-400 uppercase">
                          {ingredient.unit}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-400">
                          {ingredient.currentStock}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-400">
                          {ingredient.reorderLevel}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-400">
                          {ingredient.supplier || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            className="shadow-theme-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={preview.length === 0 || bulkImportMutation.isPending}
            className="bg-brand-500 hover:bg-brand-600 shadow-theme-xs rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkImportMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Importing...
              </span>
            ) : (
              `Import ${preview.length} Ingredient${preview.length !== 1 ? "s" : ""}`
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
