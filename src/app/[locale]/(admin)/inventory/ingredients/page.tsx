import { IngredientList } from "@/components/domains/inventory/ingredients";
import { createServerClient } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingredients | Inventory Management",
  description: "Manage your ingredient inventory with batch tracking and FIFO consumption",
};

export default async function IngredientsPage() {
  const api = await createServerClient();

  if (!api) {
    redirect("/signin");
  }

  const { data: accounts, error } = await api.GET('/v1/accounts');

  console.log('🔍 Accounts Debug:', {
    hasAccounts: !!accounts,
    accountsLength: accounts?.length,
    accounts: accounts,
    error: error,
  });

  let accountId: string;

  if (error || !accounts || accounts.length === 0) {
    console.warn('⚠️ No accounts found via /accounts endpoint - Using fallback account');

    accountId = "550e8400-e29b-41d4-a716-446655440002";

    return (
      <div>
        <div className="mb-4 rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
          <h3 className="text-sm font-semibold text-warning-800 dark:text-warning-200">
            Using Development Account
          </h3>
          <p className="mt-1 text-xs text-warning-700 dark:text-warning-300">
            No accounts found via API. Using fallback account ID for development.
          </p>
          {error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-warning-600">View Error</summary>
              <pre className="mt-2 text-xs text-error-600">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
        <IngredientList accountId={accountId} />
      </div>
    );
  }

  accountId = accounts[0].id!;

  return (
    <div>
      <IngredientList accountId={accountId} />
    </div>
  );
}
