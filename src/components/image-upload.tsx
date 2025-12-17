"use client";

import * as React from "react";
import { X, Eye, FolderUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// More flexible document type
export interface UploadDocument {
  id: string;
  type?: "front" | "back" | "other";
  name?: string; // Make optional
  file?: File; // Make optional for existing/preview-only documents
  previewUrl: string;
  [key: string]: any; // Allow additional properties
}

export interface ImageUploadProps {
  onImageChange?: (files: UploadDocument[]) => void;
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
  aspectRatio?: "square" | "video" | "custom";
  height?: string;
  maxHeight?: string;
  description?: string;
  footer?: boolean;
  disabled?: boolean;
  initialDocuments?: UploadDocument[];
  readOnly?: boolean;
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
  initialDocuments = [],
  readOnly = false,
}: ImageUploadProps) {
  const [documents, setDocuments] = React.useState<UploadDocument[]>(initialDocuments);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const handleFile = (file: File, type: "front" | "back" | "other" = "other") => {
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
    const newDocument: UploadDocument = {
      id: `doc_${Date.now()}`,
      type,
      name: file.name,
      file,
      previewUrl,
    };

    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);
    
    if (onImageChange) {
      onImageChange(updatedDocuments);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
    
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
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
      handleFile(files[0]);
    }
    e.target.value = "";
  };

  const removeDocument = (id: string) => {
    if (disabled || readOnly) return;
    
    const documentToRemove = documents.find(doc => doc.id === id);
    if (documentToRemove?.previewUrl) {
      URL.revokeObjectURL(documentToRemove.previewUrl);
    }

    const updatedDocuments = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocuments);
    
    if (onImageChange) {
      onImageChange(updatedDocuments);
    }
  };

  const updateDocumentType = (id: string, type: "front" | "back" | "other") => {
    if (disabled || readOnly) return;
    
    const updatedDocuments = documents.map(doc => 
      doc.id === id ? { ...doc, type } : doc
    );
    setDocuments(updatedDocuments);
    
    if (onImageChange) {
      onImageChange(updatedDocuments);
    }
  };

  React.useEffect(() => {
    return () => {
      documents.forEach(doc => {
        if (doc.previewUrl) {
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
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-100 hover:border-[#CC5500] dark:border-white/30 dark:bg-[#505050] dark:hover:border-[#CC5500]",
            documents.length > 0 ? "border-solid border-gray-300" : height,
            maxHeight
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => canInteract && document.getElementById("image-upload-input")?.click()}
        >
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="p-3 bg-white rounded-full mb-3">
                <FolderUp className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 mb-1 dark:text-white">
                  {description || (disabled ? "Upload disabled" : readOnly ? "No documents uploaded" : "Click or drop image")}
                </p>
                {canInteract && (
                  <>
                    <p className="text-sm text-gray-400">OR</p>
                    <p className="text-sm text-gray-400">Drag and Drop</p>
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
          />
        </div>
      )}

      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className={cn(
                "relative border rounded-lg overflow-hidden group",
                !canInteract && "opacity-80"
              )}
            >
              <img
                src={doc.previewUrl}
                alt={`Document: ${doc.name || "Document"}`}
                className={cn(
                  "w-full h-full object-contain",
                  aspectRatio === "square" ? "aspect-square" : "aspect-video",
                  "max-h-48"
                )}
              />
              
              {canInteract && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(doc.previewUrl, "_blank");
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
                      removeDocument(doc.id);
                    }}
                    className="bg-red-500/80 backdrop-blur-sm border-white/30 hover:bg-red-600"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs truncate">{doc.name || "Document"}</span>
                  {canInteract && doc.type !== undefined && (
                    <select
                      value={doc.type}
                      onChange={(e) => updateDocumentType(doc.id, e.target.value as "front" | "back" | "other")}
                      className="text-xs bg-black/50 border border-white/30 rounded px-1 py-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="front">Front</option>
                      <option value="back">Back</option>
                      <option value="other">Other</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {footer && canInteract && (
        <div className="flex flex-wrap items-center gap-2 text-sm dark:text-gray-400">
          <p>Recommended size: 1920x1080px</p>
          <span className="h-1 w-1 rounded-full bg-gray-400"></span>
          <p>Format: JPEG or PNG</p>
          <span className="h-1 w-1 rounded-full bg-gray-400"></span>
          <p>Max size: {maxSize}MB</p>
          {documents.length > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
              <p>{documents.length} document(s) uploaded</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}