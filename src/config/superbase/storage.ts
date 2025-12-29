import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = "https://repdwvidgouhbfuppmed.supabase.co";
const supabaseAnonKey = "sb_publishable_RGUYwCV5tZ8nEqcF7TLLHg_KId1yPvo";

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        apikey: supabaseAnonKey,
      },
    },
  }
);

export interface UploadResult {
  url: string | null;
  error: string | null;
  path?: string;
  signedUrl?: string;
}

// Allowed subfolders for organization
export const ALLOWED_SUBFOLDERS = [
  "identity-documents",
  "production-story",
  "product-images",
  "vendor-logos",
  "user-avatars",
  "videos",
  "seller-stories",
  "public", // Default folder
] as const;

export type AllowedSubfolder = (typeof ALLOWED_SUBFOLDERS)[number];

/**
 * Uploads a file to Supabase Storage with proper folder organization
 */
export const uploadToStorage = async (
  file: File,
  bucket: string = "vendor-assets",
  folder: AllowedSubfolder | string = "public",
  isPublic: boolean = false
): Promise<UploadResult> => {
  try {
    // Validate file
    if (!file) {
      return { url: null, error: "No file provided" };
    }

    // Validate file type - now includes video formats
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      // Documents
      "application/pdf",
      // Videos
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/quicktime", // .mov files
      "video/x-msvideo", // .avi files
      "video/x-flv", // .flv files
      "video/x-ms-wmv", // .wmv files
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: `File type not allowed. Please upload images (JPEG, PNG, WebP, GIF), PDFs, or videos (MP4, AVI, MOV, WMV, FLV, WebM). Received: ${file.type}`,
      };
    }

    // Validate folder (convert to lowercase for consistency)
    const normalizedFolder = folder.toLowerCase().trim();

    // Generate unique filename with original extension
    const originalName = file.name.replace(/\s+/g, "-"); // Replace spaces with hyphens
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "file";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = normalizedFolder
      ? `${normalizedFolder}/${fileName}`
      : fileName;

    console.log("Uploading to Supabase:", {
      bucket,
      folder: normalizedFolder,
      filePath,
      originalName,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
    });

    // Direct upload attempt
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
        duplex: "half", // Required for some environments
      });

    if (uploadError) {
      console.error("Upload error details:", {
        message: uploadError.message,
        name: uploadError.name,
        errorString: JSON.stringify(uploadError),
      });

      // Enhanced error handling with specific messages
      let userErrorMessage = uploadError.message;

      // Check for 404/not found errors in the message
      if (
        uploadError.message.includes("not found") ||
        uploadError.message.includes("404") ||
        uploadError.message.toLowerCase().includes("bucket")
      ) {
        userErrorMessage = `Bucket '${bucket}' doesn't exist or you don't have access. Please:\n1. Verify bucket exists in Supabase Dashboard\n2. Check bucket permissions and policies`;
      } else if (
        uploadError.message.includes("policy") ||
        uploadError.message.includes("permission") ||
        uploadError.message.includes("unauthorized") ||
        uploadError.message.includes("403")
      ) {
        userErrorMessage = `Permission denied for folder '${normalizedFolder}'. Please:\n1. Update storage policies to allow '${normalizedFolder}' folder\n2. Ensure file type '${file.type}' is allowed\n\nTechnical: ${uploadError.message}`;
      } else if (
        uploadError.message.includes("invalid") ||
        uploadError.message.includes("Invalid")
      ) {
        userErrorMessage = `Invalid file or path. Please:\n1. Check file type is supported\n2. Ensure folder name is valid\n\nTechnical: ${uploadError.message}`;
      } else if (uploadError.message.includes("already exists")) {
        // Retry with a different filename
        const retryFileName = `${timestamp}-${randomStr}-retry.${fileExt}`;
        const retryFilePath = normalizedFolder
          ? `${normalizedFolder}/${retryFileName}`
          : retryFileName;

        console.log("File exists, retrying with:", retryFilePath);

        const { data: _retryData, error: retryError } = await supabase.storage
          .from(bucket)
          .upload(retryFilePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (retryError) {
          return {
            url: null,
            error: `Upload failed: ${retryError.message}`,
          };
        }

        // Use retry data
        return await generateFileUrl(bucket, retryFilePath, isPublic);
      }

      return { url: null, error: userErrorMessage };
    }

    console.log("Upload successful:", uploadData);

    // Generate appropriate URL based on privacy setting
    return await generateFileUrl(bucket, filePath, isPublic);
  } catch (error) {
    console.error("Unexpected upload error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown upload error";

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        url: null,
        error:
          "Network error: Unable to connect to Supabase. Please check:\n1. Internet connection\n2. Supabase URL is correct\n3. CORS is configured in Supabase dashboard",
      };
    }

    return {
      url: null,
      error: `Unexpected error: ${errorMessage}`,
    };
  }
};

/**
 * Helper function to generate file URL (public or signed)
 */
const generateFileUrl = async (
  bucket: string,
  filePath: string,
  isPublic: boolean
): Promise<UploadResult> => {
  try {
    if (!isPublic) {
      // Generate signed URL for private files
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour TTL

      if (signedError) {
        console.warn("Signed URL failed, using public URL:", signedError);
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        return {
          url: publicUrl,
          error: null,
          path: filePath,
        };
      }

      return {
        url: signedData.signedUrl,
        error: null,
        path: filePath,
        signedUrl: signedData.signedUrl,
      };
    }

    // For public files
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    console.log("Generated public URL:", publicUrl);

    return {
      url: publicUrl,
      error: null,
      path: filePath,
    };
  } catch (error) {
    console.error("Error generating URL:", error);
    return {
      url: null,
      error: `Failed to generate URL: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      path: filePath,
    };
  }
};

/**
 * Upload multiple files to the same folder
 */
export const uploadMultipleToStorage = async (
  files: File[],
  bucket: string = "vendor-assets",
  folder: AllowedSubfolder | string = "public",
  isPublic: boolean = false
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) =>
    uploadToStorage(file, bucket, folder, isPublic)
  );

  return await Promise.all(uploadPromises);
};

/**
 * Get folder contents
 */
export const listFolderContents = async (
  bucket: string = "vendor-assets",
  folder: string = "",
  limit: number = 100
): Promise<{ data: any[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Delete file from storage
 */
export const deleteFromStorage = async (
  bucket: string,
  filePath: string
): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return { error: error.message };
    }

    console.log("Successfully deleted from storage:", filePath);
    return { error: null };
  } catch (error) {
    console.error("Delete failed:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown deletion error",
    };
  }
};

/**
 * Get signed URL for private file (3600 seconds = 1 hour)
 */
export const getSignedUrl = async (
  bucket: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }
};

/**
 * Test connection to Supabase Storage
 */
export const testStorageConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        success: false,
        message: `Storage connection failed: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Connected successfully. Found ${data?.length || 0} buckets.`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

/**
 * Test if a specific subfolder is accessible
 */
export const testSubfolderAccess = async (
  bucket: string = "vendor-assets",
  folder: AllowedSubfolder | string = "identity-documents"
): Promise<{ accessible: boolean; message: string }> => {
  try {
    const testFile = new File(["test"], `test-access-${Date.now()}.txt`, {
      type: "text/plain",
    });

    const result = await uploadToStorage(testFile, bucket, folder, true);

    if (result.error) {
      return {
        accessible: false,
        message: `Folder '${folder}' not accessible: ${result.error}`,
      };
    }

    // Clean up test file
    if (result.path) {
      await deleteFromStorage(bucket, result.path);
    }

    return {
      accessible: true,
      message: `Folder '${folder}' is accessible`,
    };
  } catch (error) {
    return {
      accessible: false,
      message: `Test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

/**
 * Simple bucket existence check (alternative method)
 */
export const checkBucketExists = async (
  bucketName: string = "vendor-assets"
): Promise<boolean> => {
  try {
    // Try to list a non-existent path to see if bucket exists
    const { error } = await supabase.storage
      .from(bucketName)
      .list("", { limit: 0 });

    // If we get a "bucket not found" error, bucket doesn't exist
    if (error) {
      // Check error message for bucket not found
      if (
        error.message.toLowerCase().includes("bucket") &&
        error.message.toLowerCase().includes("not found")
      ) {
        return false;
      }
      // Any other error means bucket exists but we might not have permission
      return true;
    }

    return true;
  } catch {
    return false;
  }
};