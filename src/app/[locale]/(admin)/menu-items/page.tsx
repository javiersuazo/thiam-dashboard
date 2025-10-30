import { MenuItemList } from "@/components/domains/menu/menu-items/MenuItemList";
import { getServerAuthToken } from "@/lib/api/server";
import { decodeToken } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Items | Inventory Management",
  description: "Manage your menu items and recipes",
};

export default async function MenuItemsPage() {
  // Get JWT token from httpOnly cookie
  const token = await getServerAuthToken();

  if (!token) {
    redirect("/signin");
  }

  // Decode JWT to get account_id claim
  const claims = decodeToken(token);
  const accountId = claims.account_id;

  if (!accountId) {
    return (
      <div className="p-8">
        <p className="text-error-600">No account ID found in session. Please sign in again.</p>
      </div>
    );
  }

  // DEV MODE: Hardcoded account for staff@test.thiam.com
  // TODO: Remove this once we have proper account assignment
  const devAccountId = "550e8400-e29b-41d4-a716-446655440002";

  return (
    <div className="p-6">
      <MenuItemList catererId={devAccountId} />
    </div>
  );
}
