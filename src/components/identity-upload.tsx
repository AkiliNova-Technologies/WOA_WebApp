"use client";

import * as React from "react";
import { X, Eye, FolderUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadToStorage, deleteFromStorage } from "@/config/superbase/storage";

export interface IdentityDocument {
  id: string;
  file?: File;
  previewUrl: string;
  storageUrl?: string;
  storagePath?: string;
  type: "front" | "back";
  documentType: "national_id" | "passport" | "driving_permit";
  uploading?: boolean;
  status?: "uploading" | "success" | "error";
}

export interface IdentityUploadProps {
  onDocumentsChange: (urls: { front?: string; back?: string }) => void; // Now returns URLs
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
  documentType?: "national_id" | "passport" | "driving_permit";
  bucket?: string;
  folder?: string;
  initialUrls?: { front?: string; back?: string };
}

export function IdentityUpload({
  onDocumentsChange,
  className,
  maxSize = 1,
  acceptedFormats = "image/jpeg,image/jpg,image/png",
  documentType = "national_id",
  bucket = "world_of_afrika",
  folder = "identity",
  initialUrls,
}: IdentityUploadProps) {
  const [documents, setDocuments] = React.useState<IdentityDocument[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

  // Initialize with URLs if provided
  React.useEffect(() => {
    if (initialUrls) {
      const initialDocs: IdentityDocument[] = [];
      if (initialUrls.front) {
        initialDocs.push({
          id: "initial_front",
          previewUrl: initialUrls.front,
          storageUrl: initialUrls.front,
          type: "front",
          documentType,
          status: "success",
        });
      }
      if (initialUrls.back) {
        initialDocs.push({
          id: "initial_back",
          previewUrl: initialUrls.back,
          storageUrl: initialUrls.back,
          type: "back",
          documentType,
          status: "success",
        });
      }
      setDocuments(initialDocs);
    }
  }, [initialUrls, documentType]);

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

  const handleFiles = async (files: FileList) => {
    const existingTypes = documents.map((doc) => doc.type);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!acceptedFormats.split(",").includes(file.type)) {
        alert(`Please upload image files only. Supported formats: JPEG, PNG`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        continue;
      }

      // Determine type
      let type: "front" | "back";
      if (documentType === "passport") {
        type = "front";
      } else {
        const hasFront = existingTypes.includes("front");
        const hasBack = existingTypes.includes("back");

        if (!hasFront) {
          type = "front";
        } else if (!hasBack) {
          type = "back";
        } else {
          type = i === 0 ? "front" : "back";
        }
      }

      const previewUrl = URL.createObjectURL(file);
      const tempDoc: IdentityDocument = {
        id: `temp_${Date.now()}_${type}`,
        file,
        previewUrl,
        type,
        documentType,
        uploading: true,
        status: "uploading",
      };

      // Remove existing document of same type
      setDocuments((prev) => {
        const filtered = prev.filter((doc) => doc.type !== type);
        return [...filtered, tempDoc];
      });

      // Upload to Supabase
      const result = await uploadToStorage(file, bucket, folder, false);

      if (result.error) {
        alert(`Upload failed: ${result.error}`);
        setDocuments((prev) => prev.filter((doc) => doc.id !== tempDoc.id));
        continue;
      }

      // Update with storage URL
      URL.revokeObjectURL(previewUrl);
      const uploadedDoc: IdentityDocument = {
        ...tempDoc,
        id: `doc_${Date.now()}_${type}`,
        previewUrl: result.url!,
        storageUrl: result.url!,
        storagePath: result.path,
        uploading: false,
        status: "success",
      };

      setDocuments((prev) => {
        const newDocs = prev.map((doc) =>
          doc.id === tempDoc.id ? uploadedDoc : doc
        );

        // Notify parent with URLs
        const urls: { front?: string; back?: string } = {};
        newDocs.forEach((doc) => {
          if (doc.storageUrl) {
            urls[doc.type] = doc.storageUrl;
          }
        });
        onDocumentsChange(urls);

        return newDocs;
      });
    }
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

  const removeDocument = async (id: string) => {
    const docToRemove = documents.find((doc) => doc.id === id);

    // Delete from Supabase if it exists
    if (docToRemove?.storagePath) {
      await deleteFromStorage(bucket, docToRemove.storagePath);
    }

    // Clean up preview URL
    if (docToRemove?.previewUrl && !docToRemove.storageUrl) {
      URL.revokeObjectURL(docToRemove.previewUrl);
    }

    setDocuments((prev) => {
      const newDocs = prev.filter((doc) => doc.id !== id);

      // Notify parent with updated URLs
      const urls: { front?: string; back?: string } = {};
      newDocs.forEach((doc) => {
        if (doc.storageUrl) {
          urls[doc.type] = doc.storageUrl;
        }
      });
      onDocumentsChange(urls);

      return newDocs;
    });
  };

  const getFrontDocument = () => documents.find((doc) => doc.type === "front");
  const getBackDocument = () => documents.find((doc) => doc.type === "back");
  const hasFront = () => !!getFrontDocument();
  const hasBack = () => !!getBackDocument();

  React.useEffect(() => {
    return () => {
      documents.forEach((doc) => {
        if (doc.previewUrl && !doc.storageUrl) {
          URL.revokeObjectURL(doc.previewUrl);
        }
      });
    };
  }, [documents]);

  const CompactDocumentPreview = ({
    document,
  }: {
    document: IdentityDocument;
  }) => (
    <div className="shrink-0">
      <div className="relative group">
        <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#404040] flex items-center justify-center overflow-hidden">
          {document.uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#CC5500]" />
          ) : (
            <img
              src={document.previewUrl}
              alt={`${document.type} side`}
              className="w-full h-full object-contain p-2"
            />
          )}
        </div>
        {!document.uploading && (
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(document.previewUrl, "_blank")}
              className="w-6 h-6 p-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeDocument(document.id)}
              className="w-6 h-6 p-0 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center capitalize">
        {document.type} side
      </p>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Document Previews */}
        {documents.length > 0 && (
          <div className="shrink-0 flex gap-3">
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
              ? "border-[#CC5500] bg-orange-50 dark:bg-orange-950/20"
              : "border-gray-300 bg-gray-50 hover:border-[#CC5500] dark:border-gray-600 dark:bg-[#303030] dark:hover:border-[#CC5500]",
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
              <div className="p-3 bg-white dark:bg-gray-700 rounded-full">
                <FolderUp className="w-6 h-6 text-[#CC5500]" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {getNextRequiredSide()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">OR</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          Recommended size: 1920×1080px · Format: JPEG or PNG · Max size:{" "}
          {maxSize}MB
        </p>
        {documentType !== "passport" && (
          <>
            {hasFront() && !hasBack() && (
              <p className="text-[#CC5500] font-medium">
                ✓ Front side uploaded. Please upload back side.
              </p>
            )}
            {!hasFront() && hasBack() && (
              <p className="text-[#CC5500] font-medium">
                ✓ Back side uploaded. Please upload front side.
              </p>
            )}
            {hasFront() && hasBack() && (
              <p className="text-green-600 dark:text-green-500 font-medium">
                ✓ Both sides uploaded successfully.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}