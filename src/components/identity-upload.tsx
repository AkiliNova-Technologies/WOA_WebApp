"use client";

import * as React from "react";
import { X, Eye, FolderUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface IdentityDocument {
  id: string;
  file: File;
  previewUrl: string;
  type: "front" | "back";
  documentType: "national_id" | "passport" | "driving_permit";
  uploadProgress?: number;
  status?: "uploading" | "success" | "error";
}

export interface IdentityUploadProps {
  onDocumentsChange: (documents: IdentityDocument[]) => void;
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
  documentType?: "national_id" | "passport" | "driving_permit";
}

export function IdentityUpload({
  onDocumentsChange,
  className,
  maxSize = 1,
  acceptedFormats = "image/jpeg,image/jpg,image/png",
  documentType = "national_id",
}: IdentityUploadProps) {
  const [documents, setDocuments] = React.useState<IdentityDocument[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);


  // Check if document type requires both sides
//   const requiresBothSides = (
//     docType: "national_id" | "passport" | "driving_permit"
//   ) => {
//     return docType !== "passport";
//   };

  const getNextRequiredSide = () => {
    const hasFront = documents.some((doc) => doc.type === "front");
    const hasBack = documents.some((doc) => doc.type === "back");

    if (documentType === "passport") {
      return hasFront ? "Change passport" : "Upload passport";
    }

    if (!hasFront) return "Upload front side";
    if (!hasBack) return "Upload back side";
    return "Change ID document";
  };

  const handleFiles = (files: FileList) => {
    // const newDocuments: IdentityDocument[] = [];
    const existingTypes = documents.map((doc) => doc.type);
    // const requiresBack = requiresBothSides(documentType);

    Array.from(files).forEach((file, index) => {
      // Validate file type
      if (!acceptedFormats.split(",").includes(file.type)) {
        alert(`Please upload image files only. Supported formats: JPEG, PNG`);
        return;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }

      // For passport, only allow front side
      if (documentType === "passport") {
        const previewUrl = URL.createObjectURL(file);
        const newDoc: IdentityDocument = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl,
          type: "front",
          documentType,
          status: "success",
        };

        // Replace any existing passport document
        const updatedDocuments = documents.filter(
          (doc) => doc.type !== "front"
        );
        const finalDocuments = [...updatedDocuments, newDoc];
        setDocuments(finalDocuments);
        onDocumentsChange(finalDocuments);
        return;
      }

      // For other documents, be flexible about front/back assignment
      let type: "front" | "back";
      const hasFront = existingTypes.includes("front");
      const hasBack = existingTypes.includes("back");

      if (!hasFront) {
        type = "front";
      } else if (!hasBack) {
        type = "back";
      } else {
        // If both sides exist, replace the one that was uploaded first (or use index)
        type = index === 0 ? "front" : "back";
      }

      // Remove existing document of the same type if it exists
      const updatedDocuments = documents.filter((doc) => doc.type !== type);

      const previewUrl = URL.createObjectURL(file);
      const newDoc: IdentityDocument = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl,
        type,
        documentType,
        status: "success",
      };

      const finalDocuments = [...updatedDocuments, newDoc];
      setDocuments(finalDocuments);
      onDocumentsChange(finalDocuments);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
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
      handleFiles(files);
    }
    e.target.value = "";
  };

  const removeDocument = (id: string) => {
    const docToRemove = documents.find((doc) => doc.id === id);
    const updatedDocuments = documents.filter((doc) => doc.id !== id);

    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);

    if (docToRemove?.previewUrl) {
      URL.revokeObjectURL(docToRemove.previewUrl);
    }
  };

  const getFrontDocument = () => documents.find((doc) => doc.type === "front");
  const getBackDocument = () => documents.find((doc) => doc.type === "back");

  const hasFront = () => !!getFrontDocument();
  const hasBack = () => !!getBackDocument();


  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      documents.forEach((doc) => {
        if (doc.previewUrl) {
          URL.revokeObjectURL(doc.previewUrl);
        }
      });
    };
  }, [documents]);

  // Compact preview component matching logo upload style
  const CompactDocumentPreview = ({
    document,
  }: {
    document: IdentityDocument;
  }) => (
    <div className="shrink-0">
      <div className="relative group">
        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={document.previewUrl}
            alt="Store logo preview"
            className="w-full h-full object-contain p-2"
          />
        </div>
        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(document.previewUrl, "_blank")}
            className="w-6 h-6 p-0 bg-white border"
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeDocument(document.id)}
            className="w-6 h-6 p-0 text-gray-400 hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Document Previews - Only show when documents are uploaded */}
        {documents.length > 0 && (
          <div className="shrink-0 space-y-3 min-w-[200px]">
            {documents.map((document) => (
              <CompactDocumentPreview key={document.id} document={document} />
            ))}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer w-full flex-1",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-[#F5F5F5] hover:border-[#CC5500]",
            documents.length > 0 && "max-w-full"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() =>
            document.getElementById("identity-upload-input")?.click()
          }
        >
          <div className="space-y-3 flex-1">
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-full">
                <FolderUp className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {getNextRequiredSide()}
              </p>
              <p className="text-sm text-gray-600">OR</p>
              <p className="text-xs text-gray-500">
                {documentType === "passport"
                  ? "Drag and drop passport"
                  : `Drag and drop ${getNextRequiredSide().toLowerCase()}`}
              </p>
            </div>
          </div>

          <input
            id="identity-upload-input"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInput}
            className="hidden"
            multiple={documentType !== "passport"}
          />
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p>
          Recommended size: 1920×1080px · Format: JPEG or PNG · Max size:{" "}
          {maxSize}MB
        </p>
        {documentType !== "passport" && (
          <p className="text-amber-600">
            {hasFront() &&
              !hasBack() &&
              "✓ Front side uploaded. Please upload back side."}
            {!hasFront() &&
              hasBack() &&
              "✓ Back side uploaded. Please upload front side."}
          </p>
        )}
      </div>

      {/* Progress & Status */}
      <div className="space-y-4">
        {/* Upload Progress */}
        {documents.some(
          (doc) => doc.uploadProgress && doc.uploadProgress < 100
        ) && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Uploading documents...
            </p>
            {documents.map((doc) =>
              doc.uploadProgress !== undefined && doc.uploadProgress < 100 ? (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 mb-2 last:mb-0"
                >
                  <span className="text-sm text-blue-700 capitalize min-w-[60px]">
                    {doc.type}
                  </span>
                  <Progress value={doc.uploadProgress} className="flex-1 h-2" />
                  <span className="text-sm text-blue-700 min-w-10">
                    {Math.round(doc.uploadProgress)}%
                  </span>
                </div>
              ) : null
            )}
          </div>
        )}

      </div>
    </div>
  );
}
