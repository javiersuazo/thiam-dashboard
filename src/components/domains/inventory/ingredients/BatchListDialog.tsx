"use client";

import React from "react";
import { useIngredientBatches } from "@/lib/api/ingredients.hooks";
import type { IngredientBatch, QualityStatus } from "@/lib/api/ingredients.hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";

interface BatchListDialogProps {
  accountId: string;
  ingredientId: string;
  ingredientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchListDialog({
  accountId,
  ingredientId,
  ingredientName,
  open,
  onOpenChange,
}: BatchListDialogProps) {
  const { data: batches, isLoading, error } = useIngredientBatches(accountId, ingredientId, {
    enabled: open,
  });

  const getQualityBadge = (status: QualityStatus) => {
    const styles: Record<QualityStatus, string> = {
      good: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
      near_expiry: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500",
      expired: "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500",
      damaged: "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500",
      recalled: "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500",
    };

    const labels: Record<QualityStatus, string> = {
      good: "Good",
      near_expiry: "Near Expiry",
      expired: "Expired",
      damaged: "Damaged",
      recalled: "Recalled",
    };

    return (
      <span className={`text-theme-xs rounded-full px-2 py-0.5 font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (cents: number | null | undefined, currency: string) => {
    if (cents === null || cents === undefined) return "—";
    const amount = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const getDaysUntilExpiry = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return null;
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Batches for {ingredientName}
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and manage stock batches (FIFO consumption)
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-sm text-error-600 dark:text-error-500">
                Failed to load batches. Please try again.
              </p>
            </div>
          ) : !batches || batches.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No batches found. Add a batch to track stock.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch, index) => {
                const daysUntilExpiry = getDaysUntilExpiry(batch.expirationDate);
                const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

                return (
                  <div
                    key={batch.id}
                    className={`rounded-lg border p-4 ${
                      isExpired
                        ? "border-error-300 bg-error-50/50 dark:border-error-500/30 dark:bg-error-500/5"
                        : isExpiringSoon
                        ? "border-warning-300 bg-warning-50/50 dark:border-warning-500/30 dark:bg-warning-500/5"
                        : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Batch #{index + 1}
                          </span>
                          {batch.batchNumber && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {batch.batchNumber}
                            </span>
                          )}
                          {getQualityBadge(batch.qualityStatus)}
                          {isExpiringSoon && (
                            <span className="text-xs font-medium text-warning-600 dark:text-warning-500">
                              Expires in {daysUntilExpiry} days
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-xs font-medium text-error-600 dark:text-error-500">
                              Expired {Math.abs(daysUntilExpiry!)} days ago
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Received</p>
                            <p className="font-medium text-gray-800 dark:text-gray-300">
                              {formatDate(batch.receivedDate)}
                            </p>
                          </div>
                          {batch.expirationDate && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expires</p>
                              <p className="font-medium text-gray-800 dark:text-gray-300">
                                {formatDate(batch.expirationDate)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                            <p className="font-medium text-gray-800 dark:text-gray-300">
                              {batch.currentQuantity.toFixed(2)}{" "}
                              <span className="text-xs text-gray-500">
                                / {batch.receivedQuantity.toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reserved</p>
                            <p className="font-medium text-gray-800 dark:text-gray-300">
                              {batch.reservedQuantity.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
                          {batch.supplierName && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Supplier</p>
                              <p className="text-gray-800 dark:text-gray-300">
                                {batch.supplierName}
                              </p>
                            </div>
                          )}
                          {batch.unitCostCents && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Cost</p>
                              <p className="text-gray-800 dark:text-gray-300">
                                {formatCurrency(batch.unitCostCents, batch.currency)}
                              </p>
                            </div>
                          )}
                          {batch.notes && (
                            <div className="md:col-span-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                              <p className="text-gray-800 dark:text-gray-300">
                                {batch.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className={`h-2 rounded-full ${
                                batch.currentQuantity / batch.receivedQuantity < 0.3
                                  ? "bg-error-500"
                                  : batch.currentQuantity / batch.receivedQuantity < 0.5
                                  ? "bg-warning-500"
                                  : "bg-success-500"
                              }`}
                              style={{
                                width: `${
                                  (batch.currentQuantity / batch.receivedQuantity) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex justify-between">
            <button
              onClick={() => onOpenChange(false)}
              className="shadow-theme-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Close
            </button>
            <button className="bg-brand-500 hover:bg-brand-600 shadow-theme-xs rounded-lg px-4 py-2 text-sm font-medium text-white">
              Add Batch
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
