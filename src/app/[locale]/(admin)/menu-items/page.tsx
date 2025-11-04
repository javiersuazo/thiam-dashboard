import { MenuItemList } from "@/components/domains/inventory/menu-items";
import { createServerClient } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Items | Inventory Management",
  description: "Manage your menu items and recipes",
};

export default async function MenuItemsPage() {
  const api = await createServerClient();

  if (!api) {
    redirect("/signin");
  }

  const catererId = "a0000001-0000-0000-0000-000000000001";

  return (
    <div className="p-6">
      <div className="mb-4 rounded-lg border border-info-200 bg-info-50 p-4 dark:border-info-800 dark:bg-info-900/20">
        <h3 className="text-sm font-semibold text-info-800 dark:text-info-200">
          Development Mode
        </h3>
        <p className="mt-1 text-xs text-info-700 dark:text-info-300">
          Using fallback caterer ID for development.
        </p>
      </div>
      <MenuItemList catererId={catererId} />
    </div>
  );
}
