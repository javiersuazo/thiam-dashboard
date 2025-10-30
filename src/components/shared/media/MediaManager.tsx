"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Plus, Star, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { MediaSelector } from "./MediaSelector";
import type { Media } from "@/lib/api/media.hooks";
import { cn } from "@/lib/utils";

interface MediaManagerProps {
  media: Media[];
  onAttach?: (media: Media[]) => void;
  onRemove?: (mediaId: string) => void;
  onSetPrimary?: (mediaId: string) => void;
  onReorder?: (items: { mediaId: string; displayOrder: number }[]) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowSetPrimary?: boolean;
  allowReorder?: boolean;
  maxFiles?: number;
  className?: string;
}

export function MediaManager({
  media = [],
  onAttach,
  onRemove,
  onSetPrimary,
  onReorder,
  allowUpload = true,
  allowDelete = true,
  allowSetPrimary = true,
  allowReorder = true,
  maxFiles = 10,
  className,
}: MediaManagerProps) {
  const t = useTranslations("media");
  const [showSelector, setShowSelector] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sortedMedia = [...media].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newMedia = [...sortedMedia];
    const draggedItem = newMedia[draggedIndex];
    newMedia.splice(draggedIndex, 1);
    newMedia.splice(index, 0, draggedItem);

    const reorderedItems = newMedia.map((item, idx) => ({
      mediaId: item.id,
      displayOrder: idx,
    }));

    onReorder?.(reorderedItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleMediaSelect = (selectedMedia: Media | Media[]) => {
    const mediaArray = Array.isArray(selectedMedia) ? selectedMedia : [selectedMedia];
    onAttach?.(mediaArray);
    setShowSelector(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Media Gallery
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {media.length} / {maxFiles} files
          </p>
        </div>
        {allowUpload && media.length < maxFiles && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSelector(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Media
          </Button>
        )}
      </div>

      {/* Media Grid */}
      {sortedMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sortedMedia.map((item, index) => (
            <div
              key={item.id}
              draggable={allowReorder}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group relative rounded-lg overflow-hidden border-2 transition-all",
                item.isPrimary
                  ? "border-yellow-400 ring-2 ring-yellow-400 ring-offset-2"
                  : "border-gray-200 dark:border-gray-700",
                allowReorder && "cursor-move",
                draggedIndex === index && "opacity-50"
              )}
            >
              {/* Drag Handle */}
              {allowReorder && (
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1 bg-black/50 rounded backdrop-blur-sm">
                    <GripVertical className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* Primary Badge */}
              {item.isPrimary && (
                <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Image */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                {item.mediaType === "image" ? (
                  <Image
                    src={item.url}
                    alt={item.originalFilename || "Media"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {allowSetPrimary && !item.isPrimary && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onSetPrimary?.(item.id)}
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Primary
                    </Button>
                  )}
                  {allowDelete && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemove?.(item.id)}
                      className="bg-red-500/90 hover:bg-red-500"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* File Name */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white truncate">
                  {item.originalFilename || "Untitled"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            No media added yet
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Add images or videos to showcase this item
          </p>
          {allowUpload && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSelector(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </Button>
          )}
        </div>
      )}

      {/* Media Selector Dialog */}
      <MediaSelector
        open={showSelector}
        onOpenChange={setShowSelector}
        onSelect={handleMediaSelect}
        multiSelect={true}
        mediaType="image"
      />
    </div>
  );
}
