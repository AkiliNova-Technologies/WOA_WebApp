import { uploadToStorage } from '@/config/superbase/storage';
import { useState } from 'react';


export const useSupabaseUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    options?: {
      bucket?: string;
      folder?: string;
      isPublic?: boolean;
    }
  ) => {
    setUploading(true);
    setError(null);

    try {
      const result = await uploadToStorage(
        file,
        options?.bucket || 'vendor-assets',
        options?.folder || '',
        options?.isPublic || false
      );

      if (result.error) {
        setError(result.error);
        return null;
      }

      return result.url;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiple = async (
    files: File[],
    options?: {
      bucket?: string;
      folder?: string;
      isPublic?: boolean;
    }
  ) => {
    const urls: string[] = [];

    for (const file of files) {
      const url = await uploadFile(file, options);
      if (url) urls.push(url);
    }

    return urls;
  };

  return {
    uploadFile,
    uploadMultiple,
    uploading,
    error,
    resetError: () => setError(null)
  };
};