"use client";

import { X, Eye, FolderUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React from "react";
import { uploadToStorage, deleteFromStorage } from "@/config/superbase/storage";

export interface LogoUploadProps {
  onLogoChange: (url: string | null) => void;
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
  bucket?: string;
  folder?: string;
  initialUrl?: string;
}

export function LogoUpload({
  onLogoChange,
  className,
  maxSize = 2,
  acceptedFormats = "image/jpeg,image/jpg,image/png,image/svg+xml",
  bucket = "World_of_Africa",
  folder = "logos",
  initialUrl,
}: LogoUploadProps) {
  const [logo, setLogo] = React.useState<{
    file?: File;
    previewUrl: string;
    storageUrl?: string;
    storagePath?: string;
  } | null>(initialUrl ? { previewUrl: initialUrl, storageUrl: initialUrl } : null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const handleFile = async (file: File) => {
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
    setLogo({ file, previewUrl });
    setUploading(true);

    // Upload to Supabase
    const result = await uploadToStorage(file, bucket, folder, false);

    setUploading(false);

    if (result.error) {
      alert(`Upload failed: ${result.error}`);
      setLogo(null);
      return;
    }

    // Update with storage URL
    URL.revokeObjectURL(previewUrl);
    setLogo({
      file,
      previewUrl: result.url!,
      storageUrl: result.url!,
      storagePath: result.path,
    });
    onLogoChange(result.url!);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const removeLogo = async () => {
    // Delete from Supabase if it exists
    if (logo?.storagePath) {
      await deleteFromStorage(bucket, logo.storagePath);
    }

    if (logo?.previewUrl && !logo.storageUrl) {
      URL.revokeObjectURL(logo.previewUrl);
    }
    setLogo(null);
    onLogoChange(null);
  };

  React.useEffect(() => {
    return () => {
      if (logo?.previewUrl && !logo.storageUrl) {
        URL.revokeObjectURL(logo.previewUrl);
      }
    };
  }, [logo]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Logo Preview */}
        {logo && (
          <div className="shrink-0">
            <div className="relative group">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#404040] flex items-center justify-center overflow-hidden">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-[#CC5500]" />
                ) : (
                  <img
                    src={logo.previewUrl}
                    alt="Store logo preview"
                    className="w-full h-full object-contain p-2"
                  />
                )}
              </div>
              {!uploading && (
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(logo.previewUrl, "_blank")}
                    className="w-6 h-6 p-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeLogo}
                    className="w-6 h-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            {logo.file && (
              <p
                className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center truncate"
                title={logo.file.name}
              >
                {logo.file.name}
              </p>
            )}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer w-full flex-1",
            isDragging
              ? "border-[#CC5500] bg-orange-50 dark:bg-orange-950/20"
              : "border-gray-300 bg-gray-50 hover:border-[#CC5500] dark:border-gray-600 dark:bg-[#303030] dark:hover:border-[#CC5500]",
            logo && "max-w-full"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("logo-upload-input")?.click()}
        >
          <div className="space-y-3 flex-1">
            <div className="flex justify-center">
              <div className="p-3 bg-white dark:bg-gray-700 rounded-full">
                <FolderUp className="w-6 h-6 text-[#CC5500]" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {logo ? "Change logo" : "Upload store logo"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">OR</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag and drop logo
              </p>
            </div>
          </div>

          <input
            id="logo-upload-input"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          Recommended size: 512×512px · Format: JPEG, PNG, or SVG · Max size:{" "}
          {maxSize}MB
        </p>
      </div>
    </div>
  );
}