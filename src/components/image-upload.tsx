"use client";

import * as React from "react";
import { X, Eye, FolderUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
  aspectRatio?: "square" | "video" | "custom";
  height?: string;
  maxHeight?: string;
}

export function ImageUpload({
  onImageChange,
  className,
  maxSize = 10, // 10MB default for product images
  acceptedFormats = "image/jpeg,image/jpg,image/png",
  aspectRatio = "square",
  height = "h-48",
  maxHeight = "max-h-48", // Default max height
}: ImageUploadProps) {
  const [image, setImage] = React.useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFile = (file: File) => {
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
    const newImage = { file, previewUrl };

    setImage(newImage);
    onImageChange(file);
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

  const removeImage = () => {
    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setImage(null);
    onImageChange(null);
  };

  // Clean up object URL on unmount
  React.useEffect(() => {
    return () => {
      if (image?.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, [image]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg transition-colors cursor-pointer overflow-hidden",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-100 hover:border-[#CC5500]",
          image ? "border-solid border-gray-300" : height,
          // Apply max height to the container
          maxHeight
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("image-upload-input")?.click()}
      >
        {image ? (
          <div className={cn("relative group w-full h-full", maxHeight)}>
            <img
              src={image.previewUrl}
              alt="Product image preview"
              className={cn(
                "w-full h-full object-contain", // Use object-contain to maintain aspect ratio without cropping
                aspectRatio === "square" ? "aspect-square" : "aspect-video",
                maxHeight // Apply max height to the image itself
              )}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(image.previewUrl, "_blank");
                }}
                className="bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="bg-red-500/80 backdrop-blur-sm border-white/30 hover:bg-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="p-3 bg-white rounded-full mb-3">
              <FolderUp className="w-5 h-5 text-gray-600" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Click or drop image</p>
            <p className="text-sm text-gray-500">JPEG or PNG • Max {maxSize}MB</p>
          </div>
        )}

        <input
          id="image-upload-input"
          type="file"
          accept={acceptedFormats}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}