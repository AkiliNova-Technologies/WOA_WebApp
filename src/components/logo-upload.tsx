"use client";

import { X, Eye, FolderUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React from "react";

export interface LogoUploadProps {
  onLogoChange: (file: File | null) => void;
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
}

export function LogoUpload({
  onLogoChange,
  className,
  maxSize = 2, // 2MB for logos
  acceptedFormats = "image/jpeg,image/jpg,image/png,image/svg+xml",
}: LogoUploadProps) {
  const [logo, setLogo] = React.useState<{
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
    const newLogo = { file, previewUrl };

    setLogo(newLogo);
    onLogoChange(file);
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

  const removeLogo = () => {
    if (logo?.previewUrl) {
      URL.revokeObjectURL(logo.previewUrl);
    }
    setLogo(null);
    onLogoChange(null);
  };

  // Clean up object URL on unmount
  React.useEffect(() => {
    return () => {
      if (logo?.previewUrl) {
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
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                <img
                  src={logo.previewUrl}
                  alt="Store logo preview"
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(logo.previewUrl, "_blank")}
                  className="w-6 h-6 p-0 bg-white border"
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
            </div>
            <p
              className="text-xs text-gray-500 mt-2 text-center truncate"
              title={logo.file.name}
            >
              {logo.file.name}
            </p>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer w-full flex-1",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-[#F5F5F5] hover:border-[#CC5500]",
            logo && "max-w-full"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("logo-upload-input")?.click()}
        >
          <div className="space-y-3 flex-1 ">
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-full">
                <FolderUp className="w-6 h-6"/>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {logo ? "Change logo" : "Upload store logo"}
              </p>
              <p className="text-sm text-gray-600">OR</p>
              <p className="text-xs text-gray-500">Drag and drop logo</p>
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
      <div className="text-xs text-gray-400 space-y-1">
        <p>
          Recommended size: 1920×1080px · Format: JPEG or PNG thumbnail · Max
          size: {maxSize}MB
        </p>
      </div>
    </div>
  );
}
