"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useMenuItems, useMenuItemWithDetails } from "@/lib/api/menuItems.hooks";
import type { MenuItemListParams, MenuItem } from "@/lib/api/menuItems.hooks";
import { MenuItemTable } from "./MenuItemTable";
import { MenuItemIngredientsSheet } from "./MenuItemIngredientsSheet";
import { MenuItemMediaSheet } from "./MenuItemMediaSheet";
import { Button } from "@/components/shared/ui/button";
import { Plus, Search, Filter, X } from "lucide-react";

interface MenuItemListProps {
  catererId: string;
}

export function MenuItemList({ catererId }: MenuItemListProps) {
  const t = useTranslations("menu.items");

  const [params, setParams] = useState<MenuItemListParams>({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
  });
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [showIngredientsSheet, setShowIngredientsSheet] = useState(false);
  const [showMediaSheet, setShowMediaSheet] = useState(false);

  // Build query params with filters
  const queryParams: MenuItemListParams = {
    ...params,
    search: search || undefined,
  };

  const { data, isLoading } = useMenuItems(catererId, queryParams);
  const { data: selectedItemDetails } = useMenuItemWithDetails(selectedMenuItem || "");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleShowIngredients = (item: MenuItem) => {
    setSelectedMenuItem(item.id);
    setShowIngredientsSheet(true);
  };

  const handleShowMedia = (item: MenuItem) => {
    setSelectedMenuItem(item.id);
    setShowMediaSheet(true);
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
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
            {t("title")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilter(!showFilter)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addButton")}
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search")}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        {showFilter && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
              All Items
            </button>
            <button className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
              Active Only
            </button>
            <button className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
              By Course
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <MenuItemTable
        catererId={catererId}
        data={data?.data || []}
        isLoading={isLoading}
        onShowIngredients={handleShowIngredients}
        onShowMedia={handleShowMedia}
      />

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

      {/* Ingredients Sheet */}
      <MenuItemIngredientsSheet
        catererId={catererId}
        menuItem={selectedItemDetails || null}
        ingredients={selectedItemDetails?.ingredients || []}
        open={showIngredientsSheet}
        onOpenChange={setShowIngredientsSheet}
      />

      {/* Media Sheet */}
      <MenuItemMediaSheet
        catererId={catererId}
        menuItem={selectedItemDetails || null}
        open={showMediaSheet}
        onOpenChange={setShowMediaSheet}
      />
    </div>
  );
}
