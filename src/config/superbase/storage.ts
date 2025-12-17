import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use your provided URL and Anon key
const supabaseUrl = 'https://uovgxmoarvgrpnwnckcl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdmd4bW9hcnZncnBud25ja2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTYxODYsImV4cCI6MjA3ODk3MjE4Nn0.w_mEFVgy8SYvxMzSnXrKjx4aENjKV2rEI97ytGt1-mg';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadResult {
  url: string | null;
  error: string | null;
  path?: string;
  signedUrl?: string; // For private files
}

/**
 * Uploads a file to Supabase Storage and returns URL
 * Using your vendor-assets bucket
 */
export const uploadToStorage = async (
  file: File,
  bucket: string = 'vendor-assets', // Your default bucket
  folder: string = '',
  isPublic: boolean = false // Your SUPABASE_PUBLIC_READ=false
): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log('Uploading to:', { bucket, filePath, size: file.size });

    // Upload file to Supabase
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { url: null, error: error.message };
    }

    // For private files (your SUPABASE_PUBLIC_READ=false), generate signed URL
    if (!isPublic) {
      const signedUrlResult = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour TTL

      if (signedUrlResult.data?.signedUrl) {
        return {
          url: signedUrlResult.data.signedUrl,
          error: null,
          path: filePath,
          signedUrl: signedUrlResult.data.signedUrl
        };
      }
    }

    // For public files
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      error: null,
      path: filePath
    };

  } catch (error) {
    console.error('Upload failed:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'Unknown upload error' 
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
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    return { error: error?.message || null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Unknown deletion error' 
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
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};