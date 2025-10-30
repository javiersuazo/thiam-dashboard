import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Custom hook for bulk operations with undo functionality
 *
 * Features:
 * - Bulk delete with undo
 * - Optimistic updates
 * - Error handling with rollback
 * - Toast notifications with undo button
 *
 * @example
 * ```tsx
 * const { bulkDelete, isProcessing } = useBulkOperations({
 *   deleteFn: async (ids) => {
 *     await Promise.all(ids.map(id => deleteIngredient(id)));
 *   },
 *   onSuccess: () => queryClient.invalidateQueries(['ingredients']),
 *   undoTimeoutMs: 5000,
 * });
 * ```
 */

interface UseBulkOperationsOptions<T = any> {
  deleteFn: (ids: string[]) => Promise<void>;
  restoreFn?: (items: T[]) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  undoTimeoutMs?: number;
  messages?: {
    deleting?: string;
    deleted?: string;
    undo?: string;
    error?: string;
  };
}

export function useBulkOperations<T = any>({
  deleteFn,
  restoreFn,
  onSuccess,
  onError,
  undoTimeoutMs = 5000,
  messages = {},
}: UseBulkOperationsOptions<T>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[];
    items: T[];
    timeoutId: NodeJS.Timeout;
  } | null>(null);

  const {
    deleting = "Deleting items...",
    deleted = "items deleted",
    undo = "Undo",
    error = "Failed to delete items",
  } = messages;

  const bulkDelete = useCallback(
    async (ids: string[], items: T[]) => {
      if (isProcessing) return;

      setIsProcessing(true);

      // Show toast with undo button
      const toastId = toast.success(`${ids.length} ${deleted}`, {
        action: restoreFn
          ? {
              label: undo,
              onClick: async () => {
                // Cancel the pending delete
                if (pendingDelete) {
                  clearTimeout(pendingDelete.timeoutId);
                  setPendingDelete(null);
                }

                // Restore the items
                try {
                  await restoreFn(items);
                  toast.success("Items restored");
                  onSuccess?.();
                } catch (err) {
                  console.error("Failed to restore:", err);
                  toast.error("Failed to restore items");
                  onError?.(err as Error);
                }
              },
            }
          : undefined,
        duration: undoTimeoutMs,
      });

      // Set up delayed deletion
      const timeoutId = setTimeout(async () => {
        try {
          await deleteFn(ids);
          setPendingDelete(null);
          onSuccess?.();
        } catch (err) {
          console.error("Failed to delete:", err);
          toast.error(error);
          onError?.(err as Error);
        } finally {
          setIsProcessing(false);
        }
      }, undoTimeoutMs);

      setPendingDelete({ ids, items, timeoutId });
    },
    [deleteFn, restoreFn, onSuccess, onError, undoTimeoutMs, isProcessing, pendingDelete, deleted, undo, error]
  );

  const cancelPending = useCallback(() => {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
      setPendingDelete(null);
      setIsProcessing(false);
    }
  }, [pendingDelete]);

  return {
    bulkDelete,
    isProcessing,
    pendingDelete,
    cancelPending,
  };
}
