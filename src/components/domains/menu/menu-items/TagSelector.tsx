"use client";

import React, { useState } from "react";
import { Check, X, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Tag Group Icons - Visual indicators for each category
// ============================================================================

const TagGroupIcons = {
  "composition-types": "🍽️",
  "dietary-options": "🌱",
  "allergens": "⚠️",
  "cuisines": "🌍",
  "spice-level": "🌶️",
  "temperature": "🌡️",
  "catering-categories": "🎉",
  "degree-of-satiation": "🍔",
  "labels": "🏷️",
} as const;

const TagGroupColors = {
  "composition-types": "blue",
  "dietary-options": "green",
  "allergens": "red",
  "cuisines": "purple",
  "spice-level": "orange",
  "temperature": "cyan",
  "catering-categories": "pink",
  "degree-of-satiation": "yellow",
  "labels": "gray",
} as const;

type TagGroupSlug = keyof typeof TagGroupIcons;

// ============================================================================
// Types
// ============================================================================

export interface TagGroup {
  slug: string;
  name: string;
  tags: Tag[];
}

export interface Tag {
  slug: string;
  name: string;
  groupSlug: string;
}

interface TagSelectorProps {
  tagGroups: TagGroup[];
  selectedTags: string[]; // Array of tag slugs
  onChange: (selectedTags: string[]) => void;
  mode?: "compact" | "expanded"; // compact = chips, expanded = full cards
  maxVisible?: number; // Max tags to show before "+N more"
}

// ============================================================================
// Tag Selector Component - Creative Multi-Select
// ============================================================================

export function TagSelector({
  tagGroups,
  selectedTags,
  onChange,
  mode = "expanded",
  maxVisible = 50,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(tagGroups.map((g) => g.slug))
  );

  const toggleGroup = (groupSlug: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupSlug)) {
      newExpanded.delete(groupSlug);
    } else {
      newExpanded.add(groupSlug);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleTag = (tagSlug: string) => {
    const newSelected = selectedTags.includes(tagSlug)
      ? selectedTags.filter((t) => t !== tagSlug)
      : [...selectedTags, tagSlug];
    onChange(newSelected);
  };

  const isTagSelected = (tagSlug: string) => selectedTags.includes(tagSlug);

  // Filter tags by search query
  const filteredGroups = tagGroups
    .map((group) => ({
      ...group,
      tags: group.tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.tags.length > 0);

  const getColorClasses = (color: string, selected: boolean) => {
    const colors = {
      blue: selected
        ? "bg-blue-500 text-white border-blue-600"
        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50",
      green: selected
        ? "bg-green-500 text-white border-green-600"
        : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/50",
      red: selected
        ? "bg-red-500 text-white border-red-600"
        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50",
      purple: selected
        ? "bg-purple-500 text-white border-purple-600"
        : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/50",
      orange: selected
        ? "bg-orange-500 text-white border-orange-600"
        : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/50",
      cyan: selected
        ? "bg-cyan-500 text-white border-cyan-600"
        : "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800 dark:hover:bg-cyan-900/50",
      pink: selected
        ? "bg-pink-500 text-white border-pink-600"
        : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800 dark:hover:bg-pink-900/50",
      yellow: selected
        ? "bg-yellow-500 text-white border-yellow-600"
        : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/50",
      gray: selected
        ? "bg-gray-500 text-white border-gray-600"
        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800 dark:hover:bg-gray-900/50",
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  if (mode === "compact") {
    // Compact mode - Show selected tags as chips with "+N more"
    const visibleTags = selectedTags.slice(0, maxVisible);
    const remainingCount = selectedTags.length - visibleTags.length;

    return (
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tagSlug) => {
          const tag = tagGroups
            .flatMap((g) => g.tags)
            .find((t) => t.slug === tagSlug);
          if (!tag) return null;

          const color = TagGroupColors[tag.groupSlug as TagGroupSlug] || "gray";

          return (
            <button
              key={tagSlug}
              onClick={() => toggleTag(tagSlug)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors",
                getColorClasses(color, true)
              )}
            >
              {tag.name}
              <X className="h-3 w-3" />
            </button>
          );
        })}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  }

  // Expanded mode - Full tag selection interface
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg dark:bg-gray-900">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected ({selectedTags.length}):
          </span>
          {selectedTags.map((tagSlug) => {
            const tag = tagGroups
              .flatMap((g) => g.tags)
              .find((t) => t.slug === tagSlug);
            if (!tag) return null;

            const color = TagGroupColors[tag.groupSlug as TagGroupSlug] || "gray";

            return (
              <button
                key={tagSlug}
                onClick={() => toggleTag(tagSlug)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  getColorClasses(color, true)
                )}
              >
                {tag.name}
                <X className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      )}

      {/* Tag Groups */}
      <div className="space-y-3">
        {filteredGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.slug);
          const groupColor = TagGroupColors[group.slug as TagGroupSlug] || "gray";
          const groupIcon = TagGroupIcons[group.slug as TagGroupSlug] || "🏷️";
          const selectedInGroup = group.tags.filter((t) =>
            selectedTags.includes(t.slug)
          ).length;

          return (
            <div
              key={group.slug}
              className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-800"
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.slug)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{groupIcon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {group.name}
                  </span>
                  {selectedInGroup > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                      {selectedInGroup}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gray-500 transition-transform",
                    isExpanded && "transform rotate-180"
                  )}
                />
              </button>

              {/* Group Tags */}
              {isExpanded && (
                <div className="p-3 flex flex-wrap gap-2 bg-white dark:bg-gray-950">
                  {group.tags.map((tag) => {
                    const isSelected = isTagSelected(tag.slug);

                    return (
                      <button
                        key={tag.slug}
                        onClick={() => toggleTag(tag.slug)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                          getColorClasses(groupColor, isSelected),
                          isSelected && "shadow-sm"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No tags found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}
