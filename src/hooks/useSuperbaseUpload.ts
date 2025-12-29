import { useState, useCallback } from "react";
import { uploadService, type UploadedAsset } from "@/lib/upload-service";

export interface UseSupabaseUploadOptions {
  bucket?: string;
  folder?: string;
  isPublic?: boolean;
  onUploadComplete?: (assets: UploadedAsset[]) => void;
  onUploadError?: (error: string) => void;
}

export function useSupabaseUpload(options: UseSupabaseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedAsset | null> => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const asset = await uploadService.uploadFile(
          file,
          options.folder || "",
          options.bucket || "world_of_afrika",
          options.isPublic || false
        );

        if (asset) {
          setUploadedAssets((prev) => [...prev, asset]);
          options.onUploadComplete?.([asset]);
        } else {
          throw new Error("Upload failed");
        }

        setUploadProgress(100);
        return asset;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        options.onUploadError?.(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const uploadMultipleFiles = useCallback(
    async (files: File[]): Promise<UploadedAsset[]> => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const assets = await uploadService.uploadMultipleFiles(
          files,
          options.folder || "",
          options.bucket || "world_of_afrika",
          options.isPublic || false
        );

        setUploadedAssets((prev) => [...prev, ...assets]);
        options.onUploadComplete?.(assets);
        setUploadProgress(100);

        return assets;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        options.onUploadError?.(errorMessage);
        return [];
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const deleteAsset = useCallback(
    async (path: string): Promise<boolean> => {
      try {
        const success = await uploadService.deleteAsset(
          path,
          options.bucket || "world_of_afrika"
        );
        if (success) {
          setUploadedAssets((prev) =>
            prev.filter((asset) => asset.path !== path)
          );
        }
        return success;
      } catch (err) {
        console.error("Delete error:", err);
        return false;
      }
    },
    [options.bucket]
  );

  const reset = useCallback(() => {
    setUploadedAssets([]);
    setError(null);
    setUploadProgress(0);
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteAsset,
    isUploading,
    uploadProgress,
    uploadedAssets,
    error,
    reset,
  };
}
