import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./index";

// ============================================================================
// Types
// ============================================================================

export interface Media {
  id: string;
  key: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  mediaType: "image" | "video";
  originalFilename?: string;
  uploadedBy?: string;
  metadata?: Record<string, string>;
  displayOrder?: number;
  isPrimary?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListParams {
  page?: number;
  limit?: number;
  mediaType?: "image" | "video";
  sortBy?: "createdAt" | "sizeBytes" | "originalFilename";
  sortOrder?: "asc" | "desc";
}

export interface MediaListResponse {
  data: Media[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UploadMediaRequest {
  file: File;
  mediaType: "image" | "video";
  metadata?: Record<string, string>;
}

export interface UpdateMediaRequest {
  metadata?: Record<string, string>;
}

// ============================================================================
// API Functions
// ============================================================================

export async function getMediaList(params?: MediaListParams): Promise<MediaListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.mediaType) queryParams.set("mediaType", params.mediaType);
  if (params?.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.set("sortOrder", params.sortOrder);

  const response = await api.get(`/media?${queryParams.toString()}`);
  return response.data;
}

export async function getMedia(id: string): Promise<Media> {
  const response = await api.get(`/media/${id}`);
  return response.data;
}

export async function uploadMedia(data: UploadMediaRequest): Promise<Media> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("mediaType", data.mediaType);
  if (data.metadata) {
    formData.append("metadata", JSON.stringify(data.metadata));
  }

  const response = await api.post("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateMedia(id: string, data: UpdateMediaRequest): Promise<Media> {
  const response = await api.put(`/media/${id}`, data);
  return response.data;
}

export async function deleteMedia(id: string): Promise<void> {
  await api.delete(`/media/${id}`);
}

// ============================================================================
// React Query Hooks
// ============================================================================

export function useMediaList(params?: MediaListParams) {
  return useQuery({
    queryKey: ["media", params],
    queryFn: () => getMediaList(params),
  });
}

export function useMedia(id: string) {
  return useQuery({
    queryKey: ["media", id],
    queryFn: () => getMedia(id),
    enabled: !!id,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaId, data }: { mediaId: string; data: UpdateMediaRequest }) =>
      updateMedia(mediaId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["media", variables.mediaId] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}
