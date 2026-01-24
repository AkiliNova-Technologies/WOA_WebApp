"use client";

import * as React from "react";
import { X, Eye, FolderUp, Loader2, ImageIcon } from "lucide-react";
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
  /**
   * Maximum number of images allowed.
   * Set to 1 for single image upload mode.
   * Leave undefined for unlimited uploads.
   */
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Derived state
  const isSingleImageMode = maxImages === 1;
  const currentImageCount = documents.length;
  const uploadingCount = documents.filter((d) => d.uploading).length;
  const successCount = documents.filter((d) => d.status === "success").length;
  
  // Check if we can upload more images
  const canUploadMore = React.useMemo(() => {
    if (maxImages === undefined) return true;
    return currentImageCount < maxImages;
  }, [maxImages, currentImageCount]);

  // Check if max limit is reached (including uploading images)
  const isAtMaxLimit = React.useMemo(() => {
    if (maxImages === undefined) return false;
    return currentImageCount >= maxImages;
  }, [maxImages, currentImageCount]);

  const canInteract = !disabled && !readOnly;

  // Initialize with URLs if provided
  React.useEffect(() => {
    if (initialUrls.length > 0) {
      const urlsToUse = maxImages ? initialUrls.slice(0, maxImages) : initialUrls;
      const initialDocs: UploadDocument[] = urlsToUse.map((url, index) => ({
        id: `initial_${index}_${Date.now()}`,
        previewUrl: url,
        storageUrl: url,
        name: `Image ${index + 1}`,
        status: "success" as const,
      }));
      setDocuments(initialDocs);
    }
  }, [initialUrls, maxImages]);

  const handleFile = async (
    file: File,
    type: "front" | "back" | "other" = "other"
  ) => {
    if (disabled || readOnly) return;

    // Check max images limit before processing
    if (maxImages !== undefined && documents.length >= maxImages) {
      const message = isSingleImageMode
        ? "Only 1 image allowed. Please remove the current image first."
        : `Maximum of ${maxImages} images allowed. Please remove some images first.`;
      alert(message);
      return;
    }

    // Validate file type
    const acceptedTypes = acceptedFormats.split(",").map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
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
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tempDocument: UploadDocument = {
      id: tempId,
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

    try {
      // Upload to Supabase
      const result = await uploadToStorage(file, bucket, folder, false);

      if (result.error) {
        alert(`Upload failed: ${result.error}`);
        // Remove temp document on error
        setDocuments((prev) => prev.filter((doc) => doc.id !== tempId));
        URL.revokeObjectURL(previewUrl);
        return;
      }

      // Clean up the blob URL
      URL.revokeObjectURL(previewUrl);

      // Update document with storage URL
      const uploadedDocument: UploadDocument = {
        ...tempDocument,
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        previewUrl: result.url!,
        storageUrl: result.url!,
        storagePath: result.path,
        uploading: false,
        uploadProgress: 100,
        status: "success",
      };

      setDocuments((prev) => {
        const newDocs = prev.map((doc) =>
          doc.id === tempId ? uploadedDocument : doc
        );

        // Notify parent with URLs
        const urls = newDocs
          .filter((d) => d.storageUrl && d.status === "success")
          .map((d) => d.storageUrl!);
        onImageChange?.(urls);

        return newDocs;
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
      setDocuments((prev) => prev.filter((doc) => doc.id !== tempId));
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || readOnly || isAtMaxLimit) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Calculate how many files we can accept
    const availableSlots = maxImages !== undefined 
      ? maxImages - documents.length 
      : files.length;

    if (availableSlots <= 0) {
      const message = isSingleImageMode
        ? "Only 1 image allowed. Please remove the current image first."
        : `Maximum of ${maxImages} images allowed.`;
      alert(message);
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    
    if (filesToUpload.length < files.length) {
      const skipped = files.length - filesToUpload.length;
      alert(`Only ${availableSlots} slot(s) available. ${skipped} file(s) will be skipped.`);
    }

    filesToUpload.forEach((file) => handleFile(file));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || readOnly || isAtMaxLimit) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;

    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Calculate how many files we can accept
    const availableSlots = maxImages !== undefined 
      ? maxImages - documents.length 
      : files.length;

    if (availableSlots <= 0) {
      const message = isSingleImageMode
        ? "Only 1 image allowed. Please remove the current image first."
        : `Maximum of ${maxImages} images allowed.`;
      alert(message);
      e.target.value = "";
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    
    if (filesToUpload.length < files.length) {
      const skipped = files.length - filesToUpload.length;
      alert(`Only ${availableSlots} slot(s) available. ${skipped} file(s) will be skipped.`);
    }

    filesToUpload.forEach((file) => handleFile(file));
    e.target.value = "";
  };

  const removeDocument = async (id: string) => {
    if (disabled || readOnly) return;

    const documentToRemove = documents.find((doc) => doc.id === id);
    if (!documentToRemove) return;

    // Delete from Supabase if it has a storage path
    if (documentToRemove.storagePath) {
      try {
        await deleteFromStorage(bucket, documentToRemove.storagePath);
      } catch (error) {
        console.error("Failed to delete from storage:", error);
      }
    }

    // Clean up preview URL if it's a blob
    if (documentToRemove.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(documentToRemove.previewUrl);
    }

    setDocuments((prev) => {
      const newDocs = prev.filter((doc) => doc.id !== id);

      // Notify parent with updated URLs
      const urls = newDocs
        .filter((d) => d.storageUrl && d.status === "success")
        .map((d) => d.storageUrl!);
      onImageChange?.(urls);

      return newDocs;
    });
  };

  const replaceImage = (id: string) => {
    if (disabled || readOnly) return;
    
    // Store the ID to replace, then trigger file input
    const input = fileInputRef.current;
    if (input) {
      // Remove the image first, then open file picker
      removeDocument(id);
      setTimeout(() => {
        input.click();
      }, 100);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      documents.forEach((doc) => {
        if (doc.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(doc.previewUrl);
        }
      });
    };
  }, []);

  const triggerFileInput = () => {
    if (!canInteract || isAtMaxLimit) return;
    fileInputRef.current?.click();
  };

  // Get description text
  const getDescription = () => {
    if (description) return description;
    if (disabled) return "Upload disabled";
    if (readOnly) return "No images uploaded";
    if (isAtMaxLimit) {
      return isSingleImageMode
        ? "Remove image to upload a new one"
        : `Maximum ${maxImages} images reached`;
    }
    if (documents.length > 0) {
      return isSingleImageMode ? "Replace image" : "Add more images";
    }
    return "Click to upload from computer";
  };

  // Compact Image Preview Component
  const CompactImagePreview = ({ document }: { document: UploadDocument }) => (
    <div className="shrink-0">
      <div className="relative group">
        <div
          className={cn(
            "w-24 h-24 sm:w-28 sm:h-28 border-2 rounded-lg overflow-hidden transition-all",
            document.uploading
              ? "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#404040]"
              : "border-solid border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#404040] hover:border-[#CC5500]"
          )}
        >
          {document.uploading ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-[#CC5500] mb-1.5 sm:mb-2" />
              <span className="text-xs text-gray-500">Uploading...</span>
            </div>
          ) : (
            <img
              src={document.previewUrl}
              alt={document.name || "Image"}
              className="w-full h-full object-contain p-1.5 sm:p-2"
            />
          )}
        </div>

        {/* Action buttons - visible on hover */}
        {!document.uploading && canInteract && (
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(document.previewUrl, "_blank");
              }}
              className="w-6 h-6 p-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm"
              title="View image"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeDocument(document.id);
              }}
              className="w-6 h-6 p-0 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-950 border border-gray-300 dark:border-gray-600 shadow-sm"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Upload progress bar */}
        {document.uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-[#CC5500] transition-all duration-300"
              style={{ width: `${document.uploadProgress || 0}%` }}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center truncate max-w-[96px] sm:max-w-[112px]">
        {document.name || "Image"}
      </p>
    </div>
  );

  // Single Image Mode - Different Layout
  if (isSingleImageMode && documents.length > 0) {
    const singleDoc = documents[0];
    
    return (
      <div className={cn("space-y-4", className)}>
        <div className="relative group">
          <div
            className={cn(
              "w-full aspect-video max-w-md border-2 rounded-lg overflow-hidden transition-all",
              singleDoc.uploading
                ? "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#404040]"
                : "border-solid border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#404040]"
            )}
          >
            {singleDoc.uploading ? (
              <div className="w-full h-full flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#CC5500] mb-3" />
                <span className="text-sm text-gray-500">Uploading image...</span>
              </div>
            ) : (
              <img
                src={singleDoc.previewUrl}
                alt={singleDoc.name || "Uploaded image"}
                className="w-full h-full object-contain p-2"
              />
            )}
          </div>

          {/* Action buttons for single image */}
          {!singleDoc.uploading && canInteract && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.open(singleDoc.previewUrl, "_blank")}
                className="h-8 px-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                View
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => removeDocument(singleDoc.id)}
                className="h-8 px-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1.5" />
                Remove
              </Button>
            </div>
          )}
        </div>

        {/* Replace button for single image mode */}
        {canInteract && !singleDoc.uploading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => replaceImage(singleDoc.id)}
            className="text-sm"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Replace Image
          </Button>
        )}

        {footer && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>
              Format: {acceptedFormats.replace(/image\//g, "").toUpperCase()} · Max: {maxSize}MB
            </p>
            {singleDoc.status === "success" && (
              <p className="text-[#CC5500] font-medium mt-1">✓ Image uploaded successfully</p>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleFileInput}
          className="hidden"
          disabled={!canInteract}
        />
      </div>
    );
  }

  // Multi-image mode or empty state
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        {/* Image Previews Grid */}
        {documents.length > 0 && (
          <div className="shrink-0 flex flex-wrap gap-2 sm:gap-3 max-w-full">
            {documents.map((document) => (
              <CompactImagePreview key={document.id} document={document} />
            ))}
          </div>
        )}

        {/* Upload Area - Show if no images or can upload more */}
        {(documents.length === 0 || (canInteract && canUploadMore)) && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg transition-all",
              canInteract && !isAtMaxLimit
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-60",
              isDragging
                ? "border-[#CC5500] bg-orange-50 dark:bg-orange-950/20"
                : "border-gray-300 bg-gray-50 hover:border-[#CC5500] dark:border-gray-600 dark:bg-[#303030] dark:hover:border-[#CC5500]",
              documents.length > 0
                ? "p-6 sm:p-8 lg:p-12 text-center w-full flex-1 min-w-[200px]"
                : "p-8 sm:p-10 lg:p-12 w-full"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={triggerFileInput}
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-center">
                <div className="p-2.5 sm:p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                  <FolderUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#CC5500]" />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2 flex flex-col justify-center items-center">
                <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                  {getDescription()}
                </p>
                {canInteract && !isAtMaxLimit && (
                  <>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      OR
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Drag and Drop
                    </p>
                  </>
                )}
                {maxImages !== undefined && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 sm:mt-2">
                    {currentImageCount} / {maxImages} image{maxImages > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Show message when at max limit with existing images */}
        {isAtMaxLimit && documents.length > 0 && !isSingleImageMode && (
          <div className="flex-1 min-w-[200px] p-6 sm:p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-[#303030]/50">
            <div className="text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maximum {maxImages} images reached
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Remove an image to add a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {footer && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>
            Recommended: 1920x1080px · Format:{" "}
            {acceptedFormats.replace(/image\//g, "").toUpperCase()} · Max: {maxSize}MB
            {maxImages !== undefined && ` · Limit: ${maxImages} image${maxImages > 1 ? "s" : ""}`}
          </p>
          {successCount > 0 && (
            <p className="text-[#CC5500] font-medium">
              ✓ {successCount} image{successCount > 1 ? "s" : ""} uploaded successfully
            </p>
          )}
          {uploadingCount > 0 && (
            <p className="text-blue-600 dark:text-blue-500 font-medium">
              ⟳ {uploadingCount} uploading...
            </p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileInput}
        className="hidden"
        disabled={!canInteract || isAtMaxLimit}
        multiple={maxImages !== 1}
      />
    </div>
  );
}