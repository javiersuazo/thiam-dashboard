import { MenuItemList } from "@/components/domains/inventory/menu-items";
import { createServerClient } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Items | Inventory Management",
  description: "Manage your menu items catalog with pricing and nutritional information",
};

export default async function MenuItemsPage() {
  const api = await createServerClient();

  if (!api) {
    redirect("/signin");
  }

  const { data: caterers, error } = await api.GET('/v1/caterers');

  console.log('🔍 Caterers Debug:', {
    hasCaterers: !!caterers,
    caterersLength: caterers?.data?.length,
    caterers: caterers,
    error: error,
  });

  let catererId: string;

  if (error || !caterers || !caterers.data || caterers.data.length === 0) {
    console.warn('⚠️ No caterers found via /caterers endpoint - Using fallback caterer');

    catererId = "550e8400-e29b-41d4-a716-446655440001";

    return (
      <div>
        <div className="mb-4 rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
          <h3 className="text-sm font-semibold text-warning-800 dark:text-warning-200">
            Using Development Caterer
          </h3>
          <p className="mt-1 text-xs text-warning-700 dark:text-warning-300">
            No caterers found via API. Using fallback caterer ID for development.
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
        <MenuItemList catererId={catererId} />
      </div>
    );
  }

  catererId = caterers.data[0].id!;

  return (
    <div>
      <MenuItemList catererId={catererId} />
    </div>
  );
}
