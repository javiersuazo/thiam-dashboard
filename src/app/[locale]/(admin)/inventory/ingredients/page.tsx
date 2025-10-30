import { IngredientList } from "@/components/domains/inventory/ingredients";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingredients | Inventory Management",
  description: "Manage your ingredient inventory with batch tracking and FIFO consumption",
};

export default function IngredientsPage() {
  // Authentication is enforced by middleware - user is guaranteed to be logged in
  // The IngredientList component will get accountId from the client-side session context
  return (
    <div>
      <IngredientList />
    </div>
  );
}
