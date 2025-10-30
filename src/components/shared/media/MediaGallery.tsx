"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Upload, X, Image as ImageIcon, Video, Star, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useUploadMedia, useDeleteMedia, type Media } from "@/lib/api/media.hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  media: Media[];
  onSelect?: (media: Media) => void;
  onDelete?: (mediaId: string) => void;
  onSetPrimary?: (mediaId: string) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowSetPrimary?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  mode?: "grid" | "list";
  selectedIds?: string[];
  multiSelect?: boolean;
}

export function MediaGallery({
  media,
  onSelect,
  onDelete,
  onSetPrimary,
  allowUpload = true,
  allowDelete = true,
  allowSetPrimary = true,
  maxFiles = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  mode = "grid",
  selectedIds = [],
  multiSelect = false,
}: MediaGalleryProps) {
  const t = useTranslations("media");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      await handleFiles(files);
    },
    [media, maxFiles]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      await handleFiles(files);
    },
    [media, maxFiles]
  );

  const handleFiles = async (files: File[]) => {
    if (media.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = files.filter((file) =>
      acceptedTypes.some((type) => file.type.match(type))
    );

    if (validFiles.length === 0) {
      toast.error("No valid files selected");
      return;
    }

    setUploading(true);

    try {
      for (const file of validFiles) {
        const mediaType = file.type.startsWith("video/") ? "video" : "image";
        await uploadMutation.mutateAsync({
          file,
          mediaType,
          metadata: {
            originalName: file.name,
          },
        });
      }
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    } catch {
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await deleteMutation.mutateAsync(mediaId);
      onDelete?.(mediaId);
      toast.success("Media deleted successfully");
    } catch {
      toast.error("Failed to delete media");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const isSelected = (mediaId: string) => selectedIds.includes(mediaId);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {allowUpload && media.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-gray-300 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-600"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {acceptedTypes.includes("image/") && "Images"}{" "}
                {acceptedTypes.includes("video/") && "& Videos"} up to 10MB each
              </p>
            </div>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Choose Files"}
            </Button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {media.length > 0 && (
        <div
          className={cn(
            mode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              : "space-y-2"
          )}
        >
          {media.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative rounded-lg overflow-hidden border-2 transition-all",
                isSelected(item.id)
                  ? "border-brand-500 ring-2 ring-brand-500 ring-offset-2"
                  : "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600",
                onSelect && "cursor-pointer"
              )}
              onClick={() => onSelect?.(item)}
            >
              {/* Primary Badge */}
              {item.isPrimary && (
                <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Media Preview */}
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
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMedia(item);
                    }}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <a
                    href={item.url}
                    download={item.originalFilename}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-gray-700" />
                  </a>
                  {allowSetPrimary && !item.isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetPrimary?.(item.id);
                      }}
                      className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                      title="Set as primary"
                    >
                      <Star className="h-4 w-4 text-yellow-500" />
                    </button>
                  )}
                  {allowDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2 bg-red-500/90 rounded-lg hover:bg-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Media Info */}
              <div className="p-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.originalFilename || "Untitled"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(item.sizeBytes)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {media.length === 0 && !allowUpload && (
        <div className="text-center py-12">
          <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No media files yet</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            {previewMedia.mediaType === "image" ? (
              <img
                src={previewMedia.url}
                alt={previewMedia.originalFilename || "Preview"}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={previewMedia.url}
                controls
                className="w-full h-auto max-h-[90vh] rounded-lg"
              />
            )}
            <div className="mt-4 text-center text-white">
              <p className="font-medium">{previewMedia.originalFilename}</p>
              <p className="text-sm text-gray-300">
                {formatFileSize(previewMedia.sizeBytes)} •{" "}
                {new Date(previewMedia.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
