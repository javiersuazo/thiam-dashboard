"use client";

import React, { useState } from "react";
import { useIngredients, useDeleteIngredient } from "@/lib/api/ingredients.hooks";
import type { IngredientListParams, IngredientCategory, Ingredient } from "@/lib/api/ingredients.hooks";
import { useSession } from "@/components/features/session/hooks/useSession";
import TableDropdown from "@/components/shared/common/TableDropdown";
import { IngredientFormDialog } from "./IngredientFormDialog";
import { BatchListDialog } from "./BatchListDialog";
import { CSVUploadDialog } from "./CSVUploadDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/shared/ui/sheet";
import { toast } from "sonner";

const INGREDIENT_CATEGORIES: { value: IngredientCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "meat", label: "Meat" },
  { value: "seafood", label: "Seafood" },
  { value: "dairy", label: "Dairy" },
  { value: "grains", label: "Grains" },
  { value: "bakery", label: "Bakery" },
  { value: "spices", label: "Spices" },
  { value: "oils", label: "Oils" },
  { value: "condiments", label: "Condiments" },
  { value: "beverages", label: "Beverages" },
  { value: "canned", label: "Canned" },
  { value: "frozen", label: "Frozen" },
  { value: "supplies", label: "Supplies" },
  { value: "other", label: "Other" },
];

export function IngredientList() {
  // Get accountId from authenticated session
  const { user, isLoading: sessionLoading } = useSession();
  const accountId = user?.accountId || "";

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 IngredientList - Session state:', {
      hasUser: !!user,
      accountId,
      sessionLoading,
      user
    });
  }

  const [params, setParams] = useState<IngredientListParams>({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
  });
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<IngredientCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"active" | "inactive" | "low_stock" | "all">("all");
  const [showFilter, setShowFilter] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>();
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | undefined>();
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const deleteMutation = useDeleteIngredient(accountId);

  // Build query params with filters
  const queryParams: IngredientListParams = {
    ...params,
    search: search || undefined,
    category: filterCategory !== "all" ? filterCategory : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
  };

  // Only fetch ingredients if we have an accountId
  const { data, isLoading } = useIngredients(accountId, queryParams, {
    enabled: !!accountId && !sessionLoading,
  });

  const handleSort = (field: NonNullable<IngredientListParams["sortBy"]>) => {
    setParams((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (category: IngredientCategory | "all") => {
    setFilterCategory(category);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: "active" | "inactive" | "low_stock" | "all") => {
    setFilterStatus(status);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormDialogOpen(true);
  };

  const handleDelete = async (ingredient: Ingredient) => {
    if (confirm(`Are you sure you want to delete "${ingredient.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(ingredient.id);
        toast.success("Ingredient deleted successfully");
      } catch (error) {
        toast.error("Failed to delete ingredient");
      }
    }
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setEditingIngredient(undefined);
  };

  const handleViewBatches = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setBatchDialogOpen(true);
  };

  const handleBatchDialogClose = () => {
    setBatchDialogOpen(false);
    setSelectedIngredient(undefined);
  };

  const formatCurrency = (cents: number | null | undefined, currency: string) => {
    if (cents === null || cents === undefined) return "—";
    const amount = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    if (currentStock <= 0) {
      return { label: "Out of Stock", className: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500" };
    }
    if (currentStock <= reorderLevel) {
      return { label: "Low Stock", className: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500" };
    }
    return { label: "In Stock", className: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500" };
  };

  // Pagination calculation
  const totalPages = data?.meta.totalPages || 1;
  const currentPage = data?.meta.page || 1;
  const startEntry = data?.data.length === 0 ? 0 : ((data?.meta.page || 1) - 1) * (data?.meta.limit || 10) + 1;
  const endEntry = Math.min((data?.meta.page || 1) * (data?.meta.limit || 10), data?.meta.total || 0);

  const visiblePages = React.useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Ingredients
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your ingredient inventory
          </p>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden flex items-center justify-center h-11 w-11 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Desktop Controls */}
        <div className="hidden lg:flex gap-3.5">
          {/* Status Filter Tabs */}
          <div className="hidden h-11 items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 lg:inline-flex dark:bg-gray-900">
            <button
              onClick={() => handleStatusFilter("all")}
              className={`text-theme-sm h-10 rounded-md px-3 py-2 font-medium hover:text-gray-900 dark:hover:text-white ${
                filterStatus === "all"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter("active")}
              className={`text-theme-sm h-10 rounded-md px-3 py-2 font-medium hover:text-gray-900 dark:hover:text-white ${
                filterStatus === "active"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusFilter("low_stock")}
              className={`text-theme-sm h-10 rounded-md px-3 py-2 font-medium hover:text-gray-900 dark:hover:text-white ${
                filterStatus === "low_stock"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Low Stock
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search ingredients..."
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative">
              <button
                className="shadow-theme-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 sm:w-auto sm:min-w-[140px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                onClick={() => setShowFilter(!showFilter)}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M14.6537 5.90414C14.6537 4.48433 13.5027 3.33331 12.0829 3.33331C10.6631 3.33331 9.51206 4.48433 9.51204 5.90415M14.6537 5.90414C14.6537 7.32398 13.5027 8.47498 12.0829 8.47498C10.663 8.47498 9.51204 7.32398 9.51204 5.90415M14.6537 5.90414L17.7087 5.90411M9.51204 5.90415L2.29199 5.90411M5.34694 14.0958C5.34694 12.676 6.49794 11.525 7.91777 11.525C9.33761 11.525 10.4886 12.676 10.4886 14.0958M5.34694 14.0958C5.34694 15.5156 6.49794 16.6666 7.91778 16.6666C9.33761 16.6666 10.4886 15.5156 10.4886 14.0958M5.34694 14.0958L2.29199 14.0958M10.4886 14.0958L17.7087 14.0958"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {INGREDIENT_CATEGORIES.find((c) => c.value === filterCategory)?.label || "Category"}
              </button>
              {showFilter && (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-80 overflow-y-auto">
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        handleCategoryFilter(cat.value);
                        setShowFilter(false);
                      }}
                      className={`text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium hover:bg-gray-100 dark:hover:bg-white/5 ${
                        filterCategory === cat.value
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setCsvUploadOpen(true)}
              className="shadow-theme-xs flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M16.6671 13.3333V15.4166C16.6671 16.1069 16.1074 16.6666 15.4171 16.6666H4.58301C3.89265 16.6666 3.33301 16.1069 3.33301 15.4166V13.3333M10.0013 3.33325L10.0013 13.3333M6.14553 7.18708L9.99958 3.33549L13.8539 7.18708"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Import CSV
            </button>

            <button
              onClick={() => setFormDialogOpen(true)}
              className="bg-brand-500 hover:bg-brand-600 shadow-theme-xs flex h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 4.16675V15.8334M4.16667 10.0001H15.8333"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add Ingredient
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter & Actions Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-full sm:w-96 bg-white dark:bg-gray-900 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters & Actions
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 mt-6 px-4 pb-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Search
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Status
              </label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStatusFilter("all")}
                  className={`text-sm h-10 rounded-lg px-4 py-2 text-left font-medium ${
                    filterStatus === "all"
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusFilter("active")}
                  className={`text-sm h-10 rounded-lg px-4 py-2 text-left font-medium ${
                    filterStatus === "active"
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusFilter("low_stock")}
                  className={`text-sm h-10 rounded-lg px-4 py-2 text-left font-medium ${
                    filterStatus === "low_stock"
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
                >
                  Low Stock
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Category
              </label>
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryFilter(cat.value)}
                    className={`text-sm flex w-full rounded-lg px-4 py-2 text-left font-medium ${
                      filterCategory === cat.value
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  setCsvUploadOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="shadow-theme-xs flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M16.6671 13.3333V15.4166C16.6671 16.1069 16.1074 16.6666 15.4171 16.6666H4.58301C3.89265 16.6666 3.33301 16.1069 3.33301 15.4166V13.3333M10.0013 3.33325L10.0013 13.3333M6.14553 7.18708L9.99958 3.33549L13.8539 7.18708"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Import CSV
              </button>

              <button
                onClick={() => {
                  setFormDialogOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="bg-brand-500 hover:bg-brand-600 shadow-theme-xs flex h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 4.16675V15.8334M4.16667 10.0001H15.8333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add Ingredient
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        {!accountId || sessionLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading session...
            </p>
          </div>
        ) : isLoading || !data ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : data.data.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No ingredients found. Add your first ingredient to get started.
            </p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                <th
                  className="cursor-pointer p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-3">
                    <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                      Name
                    </p>
                    <span className="flex flex-col gap-0.5">
                      <svg
                        className={
                          params.sortBy === "name" && params.sortOrder === "asc"
                            ? "text-gray-500"
                            : "text-gray-300"
                        }
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                          fill="currentColor"
                        />
                      </svg>
                      <svg
                        className={
                          params.sortBy === "name" && params.sortOrder === "desc"
                            ? "text-gray-500"
                            : "text-gray-300"
                        }
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-3">
                    <p className="text-theme-xs font-medium">Category</p>
                    <span className="flex flex-col gap-0.5">
                      <svg
                        className={
                          params.sortBy === "category" && params.sortOrder === "asc"
                            ? "text-gray-500"
                            : "text-gray-300"
                        }
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                          fill="currentColor"
                        />
                      </svg>
                      <svg
                        className={
                          params.sortBy === "category" && params.sortOrder === "desc"
                            ? "text-gray-500"
                            : "text-gray-300"
                        }
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort("stock")}
                >
                  <div className="flex items-center gap-3">
                    <p className="text-theme-xs font-medium">Stock</p>
                    <span className="flex flex-col gap-0.5">
                      <svg
                        className={
                          params.sortBy === "stock" && params.sortOrder === "asc"
                            ? "text-gray-500"
                            : "text-gray-300"
                        }
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                          fill="currentColor"
                        />
                      </svg>
                      <svg
                        className={
                          params.sortBy === "stock" && params.sortOrder === "desc"
                            ? "text-gray-500"
                            : "text-gray-300"
                        }
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                  Unit
                </th>
                <th
                  className="cursor-pointer p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort("cost")}
                >
                  <div className="flex items-center gap-3">
                    <p className="text-theme-xs font-medium">Cost/Unit</p>
                    <span className="flex flex-col gap-0.5">
                      <svg
                        className={
                          params.sortBy === "cost" && params.sortOrder === "asc"
                            ? "text-gray-500"
                            : "text-gray-300"
                        }
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                          fill="currentColor"
                        />
                      </svg>
                      <svg
                        className={
                          params.sortBy === "cost" && params.sortOrder === "desc"
                            ? "text-gray-500"
                            : "text-gray-300"
                        }
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                  Supplier
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                  Status
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {data?.data.map((ingredient) => {
                const stockStatus = getStockStatus(ingredient.currentStock, ingredient.reorderLevel);
                return (
                  <tr
                    key={ingredient.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                          {ingredient.name}
                        </span>
                        {ingredient.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-xs">
                            {ingredient.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-400 capitalize">
                        {ingredient.category}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-400">
                        {ingredient.currentStock.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
                        (reorder: {ingredient.reorderLevel})
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-400 uppercase">
                        {ingredient.unit}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-400">
                        {formatCurrency(ingredient.costPerUnitCents, ingredient.currency)}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-400">
                        {ingredient.supplier || "—"}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`text-theme-xs rounded-full px-2 py-0.5 font-medium ${stockStatus.className}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="relative flex justify-center dropdown">
                        <TableDropdown
                          dropdownButton={
                            <button className="text-gray-500 dark:text-gray-400">
                              <svg
                                className="fill-current"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                                />
                              </svg>
                            </button>
                          }
                          dropdownContent={
                            <>
                              <button
                                onClick={() => handleEdit(ingredient)}
                                className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleViewBatches(ingredient)}
                                className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                              >
                                View Batches
                              </button>
                              <button
                                onClick={() => handleDelete(ingredient)}
                                disabled={deleteMutation.isPending}
                                className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-error-500 hover:bg-error-50 hover:text-error-700 dark:hover:bg-error-500/15 dark:hover:text-error-400 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.data.length > 0 && (
        <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <div className="pb-4 sm:pb-0">
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="text-gray-800 dark:text-white/90">{startEntry}</span> to{" "}
              <span className="text-gray-800 dark:text-white/90">{endEntry}</span> of{" "}
              <span className="text-gray-800 dark:text-white/90">{data.meta.total}</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-gray-50 p-4 sm:p-0 rounded-lg sm:bg-transparent dark:sm:bg-transparent w-full sm:w-auto dark:bg-white/[0.03] sm:justify-normal">
            <button
              className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                !data.meta.hasPreviousPage ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!data.meta.hasPreviousPage}
            >
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"
                />
              </svg>
            </button>
            <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <ul className="hidden items-center gap-0.5 sm:flex">
              {visiblePages.map((page) => (
                <li key={page}>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                      page === currentPage
                        ? "bg-brand-500 text-white"
                        : "hover:bg-brand-500 text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                </li>
              ))}
              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  <li>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
                      ...
                    </span>
                  </li>
                  <li>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="hover:bg-brand-500 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
                    >
                      {totalPages}
                    </button>
                  </li>
                </>
              )}
            </ul>
            <button
              className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                !data.meta.hasNextPage ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!data.meta.hasNextPage}
            >
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <IngredientFormDialog
        accountId={accountId}
        open={formDialogOpen}
        onOpenChange={handleFormClose}
        ingredient={editingIngredient}
      />

      {/* Batch List Dialog */}
      {selectedIngredient && (
        <BatchListDialog
          accountId={accountId}
          ingredientId={selectedIngredient.id}
          ingredientName={selectedIngredient.name}
          open={batchDialogOpen}
          onOpenChange={handleBatchDialogClose}
        />
      )}

      {/* CSV Upload Dialog */}
      <CSVUploadDialog
        accountId={accountId}
        open={csvUploadOpen}
        onOpenChange={setCsvUploadOpen}
      />
    </div>
  );
}
