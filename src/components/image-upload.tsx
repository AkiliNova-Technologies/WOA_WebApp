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
  storageUrl?: string;
  storagePath?: string;
  uploading?: boolean;
  uploadProgress?: number;
  status?: "uploading" | "success" | "error";
  [key: string]: any;
}

export interface ImageUploadProps {
  onImageChange?: (urls: string[]) => void;
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
  description?: string;
  footer?: boolean;
  disabled?: boolean;
  initialUrls?: string[];
  readOnly?: boolean;
  bucket?: string;
  folder?: string;
  maxImages?: number;
}

export function ImageUpload({
  onImageChange,
  className,
  maxSize = 10,
  acceptedFormats = "image/jpeg,image/jpg,image/png",
  description,
  footer = true,
  disabled = false,
  initialUrls = [],
  readOnly = false,
  bucket = "World_of_Africa",
  folder = "products",
  maxImages,
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
        status: "success",
      }));
      setDocuments(initialDocs);
    }
  }, [initialUrls]);

  const canUploadMore = () => {
    if (maxImages) {
      return documents.length < maxImages;
    }
    return true;
  };

  const handleFile = async (
    file: File,
    type: "front" | "back" | "other" = "other"
  ) => {
    if (disabled || readOnly) return;

    // Check max images limit
    if (!canUploadMore()) {
      alert(`Maximum of ${maxImages} images allowed`);
      return;
    }

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
      status: "uploading",
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

    // Clean up the blob URL
    URL.revokeObjectURL(previewUrl);

    // Update document with storage URL
    const uploadedDocument: UploadDocument = {
      ...tempDocument,
      id: `doc_${Date.now()}`,
      previewUrl: result.url!,
      storageUrl: result.url!,
      storagePath: result.path,
      uploading: false,
      uploadProgress: 100,
      status: "success",
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
      const filesToUpload = maxImages 
        ? Array.from(files).slice(0, maxImages - documents.length)
        : Array.from(files);
      
      filesToUpload.forEach((file) => handleFile(file));
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
      const filesToUpload = maxImages 
        ? Array.from(files).slice(0, maxImages - documents.length)
        : Array.from(files);
      
      filesToUpload.forEach((file) => handleFile(file));
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

  const CompactImagePreview = ({ document }: { document: UploadDocument }) => (
    <div className="shrink-0">
      <div className="relative group">
        <div
          className={cn(
            "w-24 h-24 border-2 rounded-lg overflow-hidden",
            document.uploading
              ? "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#404040]"
              : "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#404040]"
          )}
        >
          {document.uploading ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#CC5500] mb-2" />
              <span className="text-xs text-gray-500">Uploading...</span>
            </div>
          ) : (
            <img
              src={document.previewUrl}
              alt={document.name || "Image"}
              className="w-full h-full object-contain p-2"
            />
          )}
        </div>

        {!document.uploading && canInteract && (
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(document.previewUrl, "_blank");
              }}
              className="w-6 h-6 p-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeDocument(document.id);
              }}
              className="w-6 h-6 p-0 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {document.uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-[#CC5500] transition-all duration-300"
              style={{ width: `${document.uploadProgress || 0}%` }}
            />
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center truncate max-w-[96px]">
        {document.name || "Image"}
      </p>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Image Previews */}
        {documents.length > 0 && (
          <div className="shrink-0 flex flex-wrap gap-3 max-w-full">
            {documents.map((document) => (
              <CompactImagePreview key={document.id} document={document} />
            ))}
          </div>
        )}

        {/* Upload Area - Show if no images or can upload more */}
        {(documents.length === 0 || (canInteract && canUploadMore())) && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg transition-colors",
              canInteract ? "cursor-pointer" : "cursor-not-allowed opacity-60",
              isDragging
                ? "border-[#CC5500] bg-orange-50 dark:bg-orange-950/20"
                : "border-gray-300 bg-gray-50 hover:border-[#CC5500] dark:border-gray-600 dark:bg-[#303030] dark:hover:border-[#CC5500]",
              documents.length > 0 ? "p-12 text-center w-full flex-1" : "p-12 w-full"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() =>
              canInteract &&
              document.getElementById("image-upload-input")?.click()
            }
          >
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-full">
                  <FolderUp className="w-6 h-6 text-[#CC5500]" />
                </div>
              </div>
              <div className="space-y-2 flex flex-col justify-center items-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {description ||
                    (disabled
                      ? "Upload disabled"
                      : readOnly
                      ? "No images uploaded"
                      : documents.length > 0
                      ? "Add more images"
                      : "Click to upload from computer")}
                </p>
                {canInteract && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">OR</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Drag and Drop
                    </p>
                  </>
                )}
                {maxImages && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {documents.length} / {maxImages} images
                  </p>
                )}
              </div>
            </div>

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
      </div>

      {footer && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>
            Recommended: 1920x1080px · Format:{" "}
            {acceptedFormats.replace(/image\//g, "").toUpperCase()} · Max:{" "}
            {maxSize}MB
          </p>
          {documents.length > 0 && documents.filter((d) => d.status === "success").length > 0 && (
            <p className="text-[#CC5500] font-medium">
              ✓ {documents.filter((d) => d.status === "success").length} image(s)
              uploaded successfully
            </p>
          )}
          {documents.some((d) => d.uploading) && (
            <p className="text-blue-600 dark:text-blue-500 font-medium">
              ⟳ {documents.filter((d) => d.uploading).length} uploading...
            </p>
          )}
        </div>
      )}
    </div>
  );
}