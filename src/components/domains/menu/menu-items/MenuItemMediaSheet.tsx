"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/shared/ui/sheet";
import { MediaManager } from "@/components/shared/media/MediaManager";
import {
  useAttachMedia,
  useRemoveMedia,
  useSetPrimaryMedia,
  useReorderMedia,
  type MenuItemWithDetails,
  type Media,
} from "@/lib/api/menuItems.hooks";
import { toast } from "sonner";

interface MenuItemMediaSheetProps {
  catererId: string;
  menuItem: MenuItemWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuItemMediaSheet({
  catererId,
  menuItem,
  open,
  onOpenChange,
}: MenuItemMediaSheetProps) {
  const t = useTranslations("menu.items.media");

  const attachMutation = useAttachMedia(catererId);
  const removeMutation = useRemoveMedia(catererId);
  const setPrimaryMutation = useSetPrimaryMedia(catererId);
  const reorderMutation = useReorderMedia(catererId);

  if (!menuItem) return null;

  const handleAttachMedia = async (media: Media[]) => {
    try {
      for (const item of media) {
        await attachMutation.mutateAsync({
          menuItemId: menuItem.id,
          data: {
            mediaId: item.id,
            displayOrder: menuItem.media?.length || 0,
            isPrimary: !menuItem.media || menuItem.media.length === 0,
          },
        });
      }
      toast.success(t("attachSuccess"));
    } catch {
      toast.error(t("attachFailed"));
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    try {
      await removeMutation.mutateAsync({
        menuItemId: menuItem.id,
        mediaId,
      });
      toast.success(t("removeSuccess"));
    } catch {
      toast.error(t("removeFailed"));
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    try {
      await setPrimaryMutation.mutateAsync({
        menuItemId: menuItem.id,
        mediaId,
      });
      toast.success(t("setPrimarySuccess"));
    } catch {
      toast.error(t("setPrimaryFailed"));
    }
  };

  const handleReorder = async (items: { mediaId: string; displayOrder: number }[]) => {
    try {
      await reorderMutation.mutateAsync({
        menuItemId: menuItem.id,
        items,
      });
      toast.success(t("reorderSuccess"));
    } catch {
      toast.error(t("reorderFailed"));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {menuItem.name}
          </p>
        </SheetHeader>

        <div className="mt-6">
          <MediaManager
            media={menuItem.media || []}
            onAttach={handleAttachMedia}
            onRemove={handleRemoveMedia}
            onSetPrimary={handleSetPrimary}
            onReorder={handleReorder}
            allowUpload={true}
            allowDelete={true}
            allowSetPrimary={true}
            allowReorder={true}
            maxFiles={10}
          />
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
            💡 Tips
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• The first image is automatically set as primary</li>
            <li>• Drag and drop to reorder images</li>
            <li>• Primary image appears in listings and previews</li>
            <li>• Recommended size: 1200x1200px for best quality</li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
