/**
 * TagSelector Component Usage Examples
 *
 * This demonstrates the creative tag selection UX for menu items
 */

import { TagSelector } from "./TagSelector";
import { useState } from "react";

// ============================================================================
// Example Tag Data (this will come from API)
// ============================================================================

const exampleTagGroups = [
  {
    slug: "composition-types",
    name: "Course Type",
    tags: [
      { slug: "starter", name: "Starter", groupSlug: "composition-types" },
      { slug: "main", name: "Main Course", groupSlug: "composition-types" },
      { slug: "dessert", name: "Dessert", groupSlug: "composition-types" },
      { slug: "snack", name: "Snack", groupSlug: "composition-types" },
      { slug: "drink", name: "Drink", groupSlug: "composition-types" },
      { slug: "side", name: "Side Dish", groupSlug: "composition-types" },
    ],
  },
  {
    slug: "dietary-options",
    name: "Dietary Options",
    tags: [
      { slug: "vegetarian", name: "Vegetarian", groupSlug: "dietary-options" },
      { slug: "vegan", name: "Vegan", groupSlug: "dietary-options" },
      { slug: "gluten-free", name: "Gluten-Free", groupSlug: "dietary-options" },
      { slug: "lactose-free", name: "Lactose-Free", groupSlug: "dietary-options" },
      { slug: "halal", name: "Halal", groupSlug: "dietary-options" },
      { slug: "kosher", name: "Kosher", groupSlug: "dietary-options" },
      { slug: "organic", name: "Organic", groupSlug: "dietary-options" },
      { slug: "low-carb", name: "Low Carb", groupSlug: "dietary-options" },
      { slug: "keto", name: "Keto", groupSlug: "dietary-options" },
    ],
  },
  {
    slug: "allergens",
    name: "Allergen Warnings",
    tags: [
      { slug: "contains-nuts", name: "Contains Nuts", groupSlug: "allergens" },
      { slug: "contains-gluten", name: "Contains Gluten", groupSlug: "allergens" },
      { slug: "contains-dairy", name: "Contains Dairy", groupSlug: "allergens" },
      { slug: "contains-eggs", name: "Contains Eggs", groupSlug: "allergens" },
      { slug: "contains-soy", name: "Contains Soy", groupSlug: "allergens" },
      { slug: "contains-fish", name: "Contains Fish", groupSlug: "allergens" },
      { slug: "contains-shellfish", name: "Contains Shellfish", groupSlug: "allergens" },
      { slug: "contains-sesame", name: "Contains Sesame", groupSlug: "allergens" },
    ],
  },
  {
    slug: "cuisines",
    name: "Cuisine Type",
    tags: [
      { slug: "italian", name: "Italian", groupSlug: "cuisines" },
      { slug: "asian", name: "Asian", groupSlug: "cuisines" },
      { slug: "mexican", name: "Mexican", groupSlug: "cuisines" },
      { slug: "french", name: "French", groupSlug: "cuisines" },
      { slug: "mediterranean", name: "Mediterranean", groupSlug: "cuisines" },
      { slug: "american", name: "American", groupSlug: "cuisines" },
      { slug: "indian", name: "Indian", groupSlug: "cuisines" },
      { slug: "japanese", name: "Japanese", groupSlug: "cuisines" },
      { slug: "thai", name: "Thai", groupSlug: "cuisines" },
      { slug: "middle-eastern", name: "Middle Eastern", groupSlug: "cuisines" },
    ],
  },
  {
    slug: "spice-level",
    name: "Spice Level",
    tags: [
      { slug: "no-spice", name: "No Spice", groupSlug: "spice-level" },
      { slug: "mild", name: "Mild", groupSlug: "spice-level" },
      { slug: "medium", name: "Medium", groupSlug: "spice-level" },
      { slug: "hot", name: "Hot", groupSlug: "spice-level" },
      { slug: "extra-hot", name: "Extra Hot", groupSlug: "spice-level" },
    ],
  },
  {
    slug: "labels",
    name: "Special Labels",
    tags: [
      { slug: "seasonal", name: "Seasonal", groupSlug: "labels" },
      { slug: "local", name: "Local", groupSlug: "labels" },
      { slug: "sustainable", name: "Sustainable", groupSlug: "labels" },
      { slug: "fair-trade", name: "Fair Trade", groupSlug: "labels" },
      { slug: "homemade", name: "Homemade", groupSlug: "labels" },
    ],
  },
];

// ============================================================================
// Example 1: Expanded Mode (Default) - Full Form
// ============================================================================

export function ExpandedTagSelectorExample() {
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "main",
    "vegan",
    "gluten-free",
    "italian",
    "mild",
    "seasonal",
  ]);

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Tag Selection (Expanded Mode)</h2>
      <p className="text-gray-600 mb-6">
        Create or edit a menu item with full tag selection interface
      </p>

      <TagSelector
        tagGroups={exampleTagGroups}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        mode="expanded"
      />

      {/* Preview */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Selected Tags:</h3>
        <pre className="text-sm">{JSON.stringify(selectedTags, null, 2)}</pre>
      </div>
    </div>
  );
}

// ============================================================================
// Example 2: Compact Mode - Show Selected Tags Only
// ============================================================================

export function CompactTagSelectorExample() {
  const [selectedTags] = useState<string[]>([
    "main",
    "vegan",
    "gluten-free",
    "contains-nuts",
    "italian",
    "mediterranean",
    "mild",
    "seasonal",
    "local",
    "organic",
  ]);

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Tag Display (Compact Mode)</h2>
      <p className="text-gray-600 mb-6">
        Show selected tags in a table cell or readonly view
      </p>

      <TagSelector
        tagGroups={exampleTagGroups}
        selectedTags={selectedTags}
        onChange={() => {}}
        mode="compact"
        maxVisible={5}
      />
    </div>
  );
}

// ============================================================================
// Example 3: In a Form Context
// ============================================================================

export function TagSelectorInFormExample() {
  const [formData, setFormData] = useState({
    name: "Vegan Pasta Primavera",
    price: 1250, // cents
    selectedTags: ["main", "vegan", "italian", "seasonal"],
  });

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Create Menu Item</h2>

      <form className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium mb-2">Dish Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Price Field */}
        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <input
            type="number"
            value={formData.price / 100}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) * 100 })
            }
            className="w-full px-4 py-2 border rounded-lg"
            step="0.01"
          />
        </div>

        {/* Tags Field */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tags & Attributes
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Select all that apply to help customers find this dish
          </p>

          <TagSelector
            tagGroups={exampleTagGroups}
            selectedTags={formData.selectedTags}
            onChange={(tags) => setFormData({ ...formData, selectedTags: tags })}
            mode="expanded"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Menu Item
        </button>
      </form>
    </div>
  );
}
