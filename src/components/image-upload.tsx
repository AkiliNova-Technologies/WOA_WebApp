"use client";

import * as React from "react";
import { X, Eye, FolderUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadToStorage, deleteFromStorage } from "@/config/superbase/storage";

export interface UploadDocument {
  id: string;
  type?: "front" | "back" | "other";
  name?: string;
  file?: File;
  previewUrl: string;
  storageUrl?: string; // Supabase URL
  storagePath?: string; // Path in Supabase storage
  uploading?: boolean;
  uploadProgress?: number;
  [key: string]: any;
}

export interface ImageUploadProps {
  onImageChange?: (urls: string[]) => void; // Now returns URLs instead of files
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
  aspectRatio?: "square" | "video" | "custom";
  height?: string;
  maxHeight?: string;
  description?: string;
  footer?: boolean;
  disabled?: boolean;
  initialUrls?: string[]; // Accept initial URLs
  readOnly?: boolean;
  bucket?: string;
  folder?: string;
}

export function ImageUpload({
  onImageChange,
  className,
  maxSize = 10,
  acceptedFormats = "image/jpeg,image/jpg,image/png",
  aspectRatio = "square",
  height = "h-48",
  maxHeight = "max-h-48",
  description,
  footer = true,
  disabled = false,
  initialUrls = [],
  readOnly = false,
  bucket = "World_of_Africa",
  folder = "products",
}: ImageUploadProps) {
  const [documents, setDocuments] = React.useState<UploadDocument[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

  // Initialize with URLs if provided
  React.useEffect(() => {
    if (initialUrls.length > 0) {
      const initialDocs: UploadDocument[] = initialUrls.map((url, index) => ({
        id: `initial_${index}`,
        previewUrl: url,
        storageUrl: url,
        name: `Image ${index + 1}`,
      }));
      setDocuments(initialDocs);
    }
  }, [initialUrls]);

  const handleFile = async (
    file: File,
    type: "front" | "back" | "other" = "other"
  ) => {
    if (disabled || readOnly) return;

    // Validate file type
    if (!acceptedFormats.split(",").includes(file.type)) {
      alert(
        `Please upload image files only. Supported formats: ${acceptedFormats
          .replace(/image\//g, "")
          .split(",")
          .join(", ")}`
      );
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const tempDocument: UploadDocument = {
      id: `temp_${Date.now()}`,
      type,
      name: file.name,
      file,
      previewUrl,
      uploading: true,
      uploadProgress: 0,
    };

    // Add temp document with loading state
    setDocuments((prev) => [...prev, tempDocument]);

    // Upload to Supabase
    const result = await uploadToStorage(file, bucket, folder, false);

    if (result.error) {
      alert(`Upload failed: ${result.error}`);
      // Remove temp document on error
      setDocuments((prev) => prev.filter((doc) => doc.id !== tempDocument.id));
      return;
    }

    // Update document with storage URL
    const uploadedDocument: UploadDocument = {
      ...tempDocument,
      id: `doc_${Date.now()}`,
      storageUrl: result.url!,
      storagePath: result.path,
      uploading: false,
      uploadProgress: 100,
    };

    setDocuments((prev) => {
      const newDocs = prev.map((doc) =>
        doc.id === tempDocument.id ? uploadedDocument : doc
      );
      
      // Notify parent with URLs
      const urls = newDocs
        .filter((d) => d.storageUrl)
        .map((d) => d.storageUrl!);
      onImageChange?.(urls);
      
      return newDocs;
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;

    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      Array.from(files).forEach((file) => handleFile(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => handleFile(file));
    }
    e.target.value = "";
  };

  const removeDocument = async (id: string) => {
    if (disabled || readOnly) return;

    const documentToRemove = documents.find((doc) => doc.id === id);
    
    // Delete from Supabase if it has a storage path
    if (documentToRemove?.storagePath) {
      await deleteFromStorage(bucket, documentToRemove.storagePath);
    }

    // Clean up preview URL
    if (documentToRemove?.previewUrl && !documentToRemove.storageUrl) {
      URL.revokeObjectURL(documentToRemove.previewUrl);
    }

    setDocuments((prev) => {
      const newDocs = prev.filter((doc) => doc.id !== id);
      
      // Notify parent with updated URLs
      const urls = newDocs
        .filter((d) => d.storageUrl)
        .map((d) => d.storageUrl!);
      onImageChange?.(urls);
      
      return newDocs;
    });
  };

  React.useEffect(() => {
    return () => {
      documents.forEach((doc) => {
        if (doc.previewUrl && !doc.storageUrl) {
          URL.revokeObjectURL(doc.previewUrl);
        }
      });
    };
  }, [documents]);

  const canInteract = !disabled && !readOnly;

  return (
    <div className={cn("space-y-3", className)}>
      {(canInteract || documents.length === 0) && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg transition-colors overflow-hidden",
            canInteract ? "cursor-pointer" : "cursor-not-allowed opacity-60",
            isDragging
              ? "border-[#CC5500] bg-orange-50 dark:bg-orange-950/20"
              : "border-gray-300 bg-gray-50 hover:border-[#CC5500] dark:border-gray-600 dark:bg-[#303030] dark:hover:border-[#CC5500]",
            documents.length > 0 ? "border-solid border-gray-300 dark:border-gray-600" : height,
            maxHeight
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() =>
            canInteract &&
            document.getElementById("image-upload-input")?.click()
          }
        >
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="p-3 bg-white dark:bg-gray-700 rounded-full mb-3">
                <FolderUp className="w-5 h-5 text-[#CC5500]" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 mb-1 dark:text-white">
                  {description ||
                    (disabled
                      ? "Upload disabled"
                      : readOnly
                      ? "No images uploaded"
                      : "Click to upload from computer")}
                </p>
                {canInteract && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">OR</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Drag and Drop</p>
                  </>
                )}
              </div>
            </div>
          ) : null}

          <input
            id="image-upload-input"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInput}
            className="hidden"
            disabled={!canInteract}
            multiple
          />
        </div>
      )}

      {documents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "relative border rounded-lg overflow-hidden group",
                !canInteract && "opacity-80",
                "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#404040]"
              )}
            >
              {doc.uploading ? (
                <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Loader2 className="w-8 h-8 animate-spin text-[#CC5500]" />
                </div>
              ) : (
                <img
                  src={doc.previewUrl}
                  alt={`Document: ${doc.name || "Image"}`}
                  className={cn(
                    "w-full h-full object-cover",
                    aspectRatio === "square" ? "aspect-square" : "aspect-video"
                  )}
                />
              )}

              {canInteract && !doc.uploading && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(doc.previewUrl, "_blank");
                    }}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDocument(doc.id);
                    }}
                    className="bg-red-500/90 backdrop-blur-sm hover:bg-red-600"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2">
                <span className="text-xs truncate block">
                  {doc.name || "Image"}
                </span>
              </div>

              {doc.uploading && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-[#CC5500] transition-all duration-300"
                    style={{ width: `${doc.uploadProgress || 0}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {footer && canInteract && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <p>Recommended: 1920x1080px</p>
          <span className="h-1 w-1 rounded-full bg-gray-400"></span>
          <p>Format: JPEG, PNG</p>
          <span className="h-1 w-1 rounded-full bg-gray-400"></span>
          <p>Max: {maxSize}MB</p>
          {documents.length > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
              <p className="text-[#CC5500] font-medium">
                {documents.length} image(s) uploaded
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}