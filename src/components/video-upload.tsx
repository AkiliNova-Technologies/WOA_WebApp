"use client";

import * as React from "react";
import { X, Play, Pause, FolderUp, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadToStorage, deleteFromStorage } from "@/config/superbase/storage";
import { toast } from "sonner"; // Added for better error notifications

export interface VideoUploadProps {
  onVideoChange: (url: string | null) => void; 
  className?: string;
  maxSize?: number;
  acceptedFormats?: string;
  description?: string;
  footer?: boolean;
  bucket?: string;
  folder?: string;
  initialUrl?: string;
}

export function VideoUpload({
  onVideoChange,
  className,
  maxSize = 10, // Changed default from 50 to 10MB
  description,
  acceptedFormats = "video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm",
  footer = true,
  bucket = undefined,
  folder = "videos",
  initialUrl,
}: VideoUploadProps) {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(initialUrl || null);
  const [storagePath, setStoragePath] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const progressInterval = React.useRef<NodeJS.Timeout | null>(null);
  
  const MAX_SIZE_MB = maxSize; // 10MB limit
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Initialize with URL if provided
  React.useEffect(() => {
    if (initialUrl && !videoUrl) {
      setVideoUrl(initialUrl);
    }
  }, [initialUrl]);

  // Validate file before upload
  const validateVideoFile = (file: File): { isValid: boolean; error?: string } => {
    // Reset any previous error
    setFileError(null);

    // 1. Check file type
    const acceptedTypes = acceptedFormats.split(",");
    if (!acceptedTypes.includes(file.type)) {
      const errorMsg = `Unsupported video format. Supported formats: ${acceptedTypes
        .map(format => format.replace("video/", "").toUpperCase())
        .join(", ")}`;
      return { isValid: false, error: errorMsg };
    }

    // 2. Check file size
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `File size (${fileSizeMB}MB) exceeds the ${MAX_SIZE_MB}MB limit. Please upload a smaller video.`;
      return { isValid: false, error: errorMsg };
    }

    // 3. Optional: Check file extension for extra safety
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    if (extension && !validExtensions.includes(extension)) {
      const errorMsg = `Invalid file extension (.${extension}). Supported extensions: ${validExtensions.join(", ").toUpperCase()}`;
      return { isValid: false, error: errorMsg };
    }

    return { isValid: true };
  };

  const handleFileChange = async (file: File) => {
    // Validate file first
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      setFileError(validation.error || "Invalid video file");
      toast.error(validation.error || "Invalid video file", {
        duration: 5000,
        icon: <AlertCircle className="w-4 h-4" />
      });
      return;
    }

    // Set file and create preview
    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoUrl(previewUrl);
    setUploading(true);
    setUploadProgress(0);

    // Show file info in toast
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    toast.info(`Uploading video: ${file.name} (${fileSizeMB}MB / ${MAX_SIZE_MB}MB limit)`, {
      duration: 3000,
    });

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Upload to Supabase
      const result = await uploadToStorage(file, bucket, folder, true);

      clearInterval(interval);

      if (result.error) {
        const errorMsg = `Upload failed: ${result.error}`;
        setFileError(errorMsg);
        toast.error(errorMsg, {
          duration: 5000,
        });
        setUploadProgress(0);
        setUploading(false);
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl);
        setVideoUrl(null);
        setVideoFile(null);
        return;
      }

      // Success - update with storage URL
      setUploadProgress(100);
      setStoragePath(result.path!);
      
      // Clean up preview URL and use storage URL
      URL.revokeObjectURL(previewUrl);
      setVideoUrl(result.url!);
      setUploading(false);
      
      // Notify parent with the URL
      onVideoChange(result.url!);

      toast.success("Video uploaded successfully!", {
        duration: 3000,
      });

      console.log("Video uploaded successfully:", {
        url: result.url,
        path: result.path,
        size: fileSizeMB,
        maxSize: MAX_SIZE_MB,
      });
    } catch (error) {
      clearInterval(interval);
      console.error("Upload error:", error);
      const errorMsg = `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setFileError(errorMsg);
      toast.error(errorMsg, {
        duration: 5000,
      });
      setUploadProgress(0);
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
      setVideoUrl(null);
      setVideoFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
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
      handleFileChange(files[0]);
    }
    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const handleRemoveVideo = async () => {
    // Delete from Supabase if it exists
    if (storagePath) {
      try {
        await deleteFromStorage(bucket, storagePath);
        console.log("Deleted video from storage:", storagePath);
        toast.info("Video removed successfully", { duration: 3000 });
      } catch (error) {
        console.error("Failed to delete video from storage:", error);
        toast.error("Failed to delete video from storage", { duration: 3000 });
      }
    }

    // Stop video playback
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    // Clean up state
    setVideoFile(null);
    setVideoUrl(null);
    setStoragePath(null);
    setCurrentTime(0);
    setDuration(0);
    setFileError(null);
    
    // Notify parent
    onVideoChange(null);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Update progress bar in real-time while playing
  React.useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [isPlaying]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {!videoUrl && !uploading && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-[#CC5500] bg-orange-50 dark:bg-orange-950/20"
              : "border-gray-300 bg-gray-50 hover:border-[#CC5500] dark:border-gray-600 dark:bg-[#303030] dark:hover:border-[#CC5500]",
            fileError && "border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-950/20"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("video-upload-input")?.click()}
        >
          <div className="flex justify-center">
            <div className={cn(
              "p-3 rounded-full",
              fileError 
                ? "bg-red-100 dark:bg-red-900/30" 
                : "bg-white dark:bg-gray-700"
            )}>
              <FolderUp className={cn(
                "w-6 h-6",
                fileError ? "text-red-500 dark:text-red-400" : "text-[#CC5500]"
              )} />
            </div>
          </div>
          <div className="space-y-2 mt-3">
            <p className={cn(
              "text-lg font-medium",
              fileError 
                ? "text-red-600 dark:text-red-400" 
                : "text-gray-900 dark:text-white"
            )}>
              Upload a Short Story
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">or</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Drag and Drop Intro Video
            </p>
          </div>
          
          {/* Error message display */}
          {fileError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-md">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{fileError}</p>
              </div>
            </div>
          )}
          
          <input
            id="video-upload-input"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* Footer with description */}
      {footer && !videoUrl && !uploading && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description ||
              `Recommended size: 1920x1080px • Format: MP4, AVI, MOV, WMV, FLV, WebM • Max ${MAX_SIZE_MB}MB`}
          </p>
          
          {/* Size limit indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 dark:text-gray-500">
              Maximum file size: <strong>{MAX_SIZE_MB}MB</strong>
            </span>
            {fileError && (
              <button
                type="button"
                onClick={() => setFileError(null)}
                className="text-[#CC5500] hover:underline"
              >
                Clear error
              </button>
            )}
          </div>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#303030]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#CC5500]/10 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-[#CC5500] animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {videoFile?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Uploading... {uploadProgress}%
                    </p>
                    {videoFile && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({(videoFile.size / (1024 * 1024)).toFixed(2)}MB / {MAX_SIZE_MB}MB)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#CC5500] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {videoUrl && !uploading && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#303030]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#CC5500]/10 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-[#CC5500]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {videoFile?.name || "Video"}
                </p>
                {videoFile && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    {/* Size validation indicator */}
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      videoFile.size <= MAX_SIZE_BYTES
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {videoFile.size <= MAX_SIZE_BYTES ? "✓ Within limit" : "✗ Exceeds limit"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveVideo}
              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Video Player */}
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto max-h-64 object-contain"
              onEnded={handleVideoEnd}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              playsInline
            />

            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
              <Button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                size="icon"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={togglePlay}
                  size="sm"
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 text-white" />
                  ) : (
                    <Play className="w-3 h-3 text-white" />
                  )}
                </Button>
                <div className="flex-1 bg-white/30 rounded-full h-1">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-100"
                    style={{
                      width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-white font-medium min-w-[40px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the play button to preview your video
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                document.getElementById("video-upload-input")?.click()
              }
              className="border-gray-300 dark:border-gray-600"
            >
              Change Video
            </Button>
          </div>

          {/* Hidden input for changing video */}
          <input
            id="video-upload-input"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}