import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://uovgxmoarvgrpnwnckcl.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
const defaultBucket = import.meta.env.VITE_SUPABASE_BUCKET_VENDOR || "World_of_Africa";
const signedUrlTTL = parseInt(import.meta.env.VITE_SUPABASE_SIGNED_URL_TTL_SEC || "3600", 10);
const publicRead = import.meta.env.VITE_SUPABASE_PUBLIC_READ === "true";

// Create client for general use (with anon key)
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Create admin client for privileged operations (with service role key)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface UploadResult {
  url: string | null;
  error: string | null;
  path?: string;
  signedUrl?: string;
}

// Get bucket from environment variable or use default
export const DEFAULT_BUCKET = defaultBucket;

/**
 * Uploads a file to Supabase Storage using admin client for bypassing RLS
 */
export const uploadToStorage = async (
  file: File,
  bucket: string = DEFAULT_BUCKET,
  folder: string = "", // No subfolder by default
  isPublic: boolean = publicRead
): Promise<UploadResult> => {
  try {
    // Validate file
    if (!file) {
      return { url: null, error: "No file provided" };
    }

    // Validate file type - includes images, documents, and videos
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
      "video/quicktime",
      "video/x-msvideo",
      "video/x-flv",
      "video/x-ms-wmv",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: `File type not allowed. Please upload images (JPEG, PNG, WebP, GIF), PDFs, or videos (MP4, AVI, MOV, WMV, FLV, WebM). Received: ${file.type}`,
      };
    }

    // Generate unique filename with original extension
    const originalName = file.name.replace(/\s+/g, "-");
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "file";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    
    // Build file path (with or without folder)
    const filePath = folder && folder.trim() 
      ? `${folder.trim()}/${fileName}`
      : fileName;

    console.log("Uploading to Supabase:", {
      bucket,
      folder: folder || "(root)",
      filePath,
      originalName,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      supabaseUrl,
      usingServiceRole: true,
    });

    // Use admin client for upload (bypasses RLS policies)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error details:", {
        message: uploadError.message,
        name: uploadError.name,
        status: (uploadError as any).status,
        statusCode: (uploadError as any).statusCode,
        bucket,
        url: supabaseUrl,
      });

      // Enhanced error handling
      let userErrorMessage = uploadError.message;

      if (
        uploadError.message.includes("not found") ||
        uploadError.message.includes("404") ||
        uploadError.message.toLowerCase().includes("bucket")
      ) {
        userErrorMessage = `Bucket '${bucket}' doesn't exist. Please verify:\n1. Bucket exists in Supabase Dashboard\n2. Bucket name is correct\n3. Service role key has access`;
      } else if (
        uploadError.message.includes("Invalid Compact JWS") ||
        uploadError.message.includes("JWT") ||
        uploadError.message.includes("token")
      ) {
        userErrorMessage = `Authentication error. Please verify:\n1. SUPABASE_SERVICE_ROLE_KEY is correct\n2. Key hasn't expired\n3. Key has proper permissions\n\nTechnical: ${uploadError.message}`;
      } else if (
        uploadError.message.includes("policy") ||
        uploadError.message.includes("permission") ||
        uploadError.message.includes("unauthorized") ||
        uploadError.message.includes("403")
      ) {
        userErrorMessage = `Permission denied. Using service role key should bypass RLS policies.\n\nTechnical: ${uploadError.message}`;
      } else if (uploadError.message.includes("already exists")) {
        // Retry with upsert
        console.log("File exists, retrying with upsert...");
        
        const { error: retryError } = await supabaseAdmin.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true, // Overwrite existing file
            contentType: file.type,
          });

        if (retryError) {
          return {
            url: null,
            error: `Upload failed: ${retryError.message}`,
          };
        }

        return await generateFileUrl(bucket, filePath, isPublic);
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
        error: `Network error: Unable to connect to Supabase at ${supabaseUrl}. Please check internet connection.`,
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
      // Generate signed URL for private files using admin client
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, signedUrlTTL);

      if (signedError) {
        console.warn("Signed URL failed, falling back to public URL:", signedError);
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

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
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

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
  bucket: string = DEFAULT_BUCKET,
  folder: string = "",
  isPublic: boolean = publicRead
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
  bucket: string = DEFAULT_BUCKET,
  folder: string = "",
  limit: number = 100
): Promise<{ data: any[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(folder, {
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
  bucket: string = DEFAULT_BUCKET,
  filePath: string
): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);

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
 * Get signed URL for private file
 */
export const getSignedUrl = async (
  bucket: string,
  filePath: string,
  expiresIn: number = signedUrlTTL
): Promise<string | null> => {
  try {
    const { data, error } = await supabaseAdmin.storage
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
  details?: any;
}> => {
  try {
    console.log("Testing storage connection...");
    console.log("Supabase URL:", supabaseUrl);
    console.log("Using service role key:", supabaseServiceRoleKey ? "Yes (hidden)" : "No");
    console.log("Default bucket:", defaultBucket);

    // Test with admin client
    const { data, error } = await supabaseAdmin.storage.listBuckets();

    if (error) {
      return {
        success: false,
        message: `Storage connection failed: ${error.message}`,
        details: error,
      };
    }

    const buckets = data?.map((b: any) => b.name) || [];
    const hasBucket = buckets.includes(defaultBucket);

    return {
      success: true,
      message: `Connected successfully. Found ${buckets.length} bucket(s).`,
      details: {
        buckets,
        defaultBucketExists: hasBucket,
        defaultBucket,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      details: error,
    };
  }
};

/**
 * Test upload to verify permissions
 */
export const testUpload = async (
  bucket: string = DEFAULT_BUCKET,
  folder: string = ""
): Promise<{ success: boolean; message: string; url?: string }> => {
  try {
    console.log("Testing upload to bucket:", bucket, "folder:", folder || "(root)");

    const testFile = new File(
      ["test content"], 
      `test-${Date.now()}.txt`, 
      { type: "text/plain" }
    );

    const result = await uploadToStorage(testFile, bucket, folder, true);

    if (result.error) {
      return {
        success: false,
        message: `Upload test failed: ${result.error}`,
      };
    }

    // Clean up test file
    if (result.path) {
      await deleteFromStorage(bucket, result.path);
    }

    return {
      success: true,
      message: `Upload test successful to bucket '${bucket}'${folder ? `, folder '${folder}'` : ""}`,
      url: result.url || undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: `Test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

/**
 * Check bucket exists and is accessible
 */
export const checkBucketExists = async (
  bucketName: string = DEFAULT_BUCKET
): Promise<{ exists: boolean; accessible: boolean; message: string }> => {
  try {
    // List buckets
    const { data, error } = await supabaseAdmin.storage.listBuckets();

    if (error) {
      return {
        exists: false,
        accessible: false,
        message: `Cannot list buckets: ${error.message}`,
      };
    }

    const buckets = data?.map((b: any) => b.name) || [];
    const exists = buckets.includes(bucketName);

    if (!exists) {
      return {
        exists: false,
        accessible: false,
        message: `Bucket '${bucketName}' not found. Available buckets: ${buckets.join(", ")}`,
      };
    }

    // Try to list files in bucket to verify access
    const { error: listError } = await supabaseAdmin.storage
      .from(bucketName)
      .list("", { limit: 1 });

    if (listError) {
      return {
        exists: true,
        accessible: false,
        message: `Bucket '${bucketName}' exists but is not accessible: ${listError.message}`,
      };
    }

    return {
      exists: true,
      accessible: true,
      message: `Bucket '${bucketName}' is accessible`,
    };
  } catch (error) {
    return {
      exists: false,
      accessible: false,
      message: `Check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

/**
 * Validate configuration
 */
export const validateConfiguration = (): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!supabaseUrl) {
    errors.push("VITE_SUPABASE_URL is not set");
  } else if (!supabaseUrl.startsWith("https://")) {
    errors.push("VITE_SUPABASE_URL must start with https://");
  }

  if (!supabaseAnonKey) {
    errors.push("VITE_SUPABASE_ANON_KEY is not set");
  }

  if (!supabaseServiceRoleKey) {
    errors.push("VITE_SUPABASE_SERVICE_ROLE_KEY is not set");
  } else if (!supabaseServiceRoleKey.startsWith("eyJ")) {
    warnings.push("VITE_SUPABASE_SERVICE_ROLE_KEY might be incorrect (should start with 'eyJ')");
  }

  if (!defaultBucket) {
    warnings.push("VITE_SUPABASE_BUCKET_VENDOR is not set, using default");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// Log configuration on load (only in development)
if (import.meta.env.DEV) {
  console.log("Supabase Storage Configuration:", {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceRoleKey: !!supabaseServiceRoleKey,
    defaultBucket,
    signedUrlTTL,
    publicRead,
  });

  const validation = validateConfiguration();
  if (!validation.valid) {
    console.error("Configuration errors:", validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn("Configuration warnings:", validation.warnings);
  }
}