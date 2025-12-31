// lib/supabase/upload-service.ts
import { uploadToStorage, deleteFromStorage, getSignedUrl } from '@/config/superbase/storage';

export interface UploadedAsset {
  id?: string;
  url: string;
  path: string;
  name: string;
  type: string;
  size: number;
  bucket: string;
  isPublic?: boolean;
  signedUrl?: string; // For private files
}

export interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export class SupabaseUploadService {
  private defaultBucket = 'world_of_africa';
  private isPublicBucket = false; // Based on your SUPABASE_PUBLIC_READ=false

  /**
   * Upload a file and return asset data
   */
  async uploadFile(
    file: File,
    folder: string = '',
    bucket: string = this.defaultBucket,
    isPublic: boolean = this.isPublicBucket,
    // onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedAsset | null> {
    try {
      // You can implement progress tracking if needed
      const result = await uploadToStorage(file, bucket, folder, isPublic);

      if (result.error) {
        console.error('Upload failed:', result.error);
        return null;
      }

      return {
        url: result.url!,
        path: result.path!,
        name: file.name,
        type: file.type,
        size: file.size,
        bucket,
        isPublic,
        signedUrl: result.signedUrl
      };
    } catch (error) {
      console.error('Upload service error:', error);
      return null;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    folder: string = '',
    bucket: string = this.defaultBucket,
    isPublic: boolean = this.isPublicBucket
  ): Promise<UploadedAsset[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, folder, bucket, isPublic)
    );
    
    const results = await Promise.all(uploadPromises);
    return results.filter((result): result is UploadedAsset => result !== null);
  }

  /**
   * Delete asset from storage
   */
  async deleteAsset(path: string, bucket: string = this.defaultBucket): Promise<boolean> {
    try {
      const { error } = await deleteFromStorage(bucket, path);
      return !error;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get signed URL for private asset
   */
  async getAssetUrl(path: string, bucket: string = this.defaultBucket): Promise<string | null> {
    // For public buckets, construct URL directly
    // For private buckets, get signed URL
    const signedUrl = await getSignedUrl(bucket, path, 3600); // 1 hour
    return signedUrl;
  }

  /**
   * Extract folder structure from path
   */
  getFolderFromPath(path: string): string {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : '';
  }

  /**
   * Extract filename from path
   */
  getFilenameFromPath(path: string): string {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(lastSlash + 1) : path;
  }
}

// Singleton instance
export const uploadService = new SupabaseUploadService();