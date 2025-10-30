"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { MediaGallery } from "./MediaGallery";
import { useMediaList, type Media } from "@/lib/api/media.hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Image as ImageIcon, Video } from "lucide-react";

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media | Media[]) => void;
  multiSelect?: boolean;
  mediaType?: "image" | "video";
  selectedIds?: string[];
}

export function MediaSelector({
  open,
  onOpenChange,
  onSelect,
  multiSelect = false,
  mediaType,
  selectedIds = [],
}: MediaSelectorProps) {
  const t = useTranslations("media");
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);

  const { data: imageData } = useMediaList({
    mediaType: "image",
    limit: 100,
  });

  const { data: videoData } = useMediaList({
    mediaType: "video",
    limit: 100,
  });

  const currentMedia = activeTab === "image" ? imageData?.data || [] : videoData?.data || [];

  const handleMediaSelect = (media: Media) => {
    if (multiSelect) {
      if (localSelectedIds.includes(media.id)) {
        setLocalSelectedIds(localSelectedIds.filter((id) => id !== media.id));
      } else {
        setLocalSelectedIds([...localSelectedIds, media.id]);
      }
    } else {
      onSelect(media);
      onOpenChange(false);
    }
  };

  const handleConfirmSelection = () => {
    const selectedMedia = currentMedia.filter((m) => localSelectedIds.includes(m.id));
    onSelect(selectedMedia);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        {!mediaType ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "image" | "video")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="mt-4">
              <MediaGallery
                media={imageData?.data || []}
                onSelect={handleMediaSelect}
                allowUpload={true}
                allowDelete={false}
                allowSetPrimary={false}
                selectedIds={localSelectedIds}
                multiSelect={multiSelect}
              />
            </TabsContent>

            <TabsContent value="video" className="mt-4">
              <MediaGallery
                media={videoData?.data || []}
                onSelect={handleMediaSelect}
                allowUpload={true}
                allowDelete={false}
                allowSetPrimary={false}
                selectedIds={localSelectedIds}
                multiSelect={multiSelect}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-4">
            <MediaGallery
              media={currentMedia}
              onSelect={handleMediaSelect}
              allowUpload={true}
              allowDelete={false}
              allowSetPrimary={false}
              selectedIds={localSelectedIds}
              multiSelect={multiSelect}
            />
          </div>
        )}

        {multiSelect && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {localSelectedIds.length} file(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSelection} disabled={localSelectedIds.length === 0}>
                Select ({localSelectedIds.length})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
