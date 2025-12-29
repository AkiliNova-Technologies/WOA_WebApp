"use client";

import * as React from "react";
import { X, Play, Pause, FolderUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadToStorage, deleteFromStorage } from "@/config/superbase/storage";

export interface VideoUploadProps {
  onVideoChange: (url: string | null) => void; // Now returns URL instead of file
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
  maxSize = 50,
  description,
  acceptedFormats = "video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm",
  footer = true,
  bucket = "vendor-assets",
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
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const progressInterval = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize with URL if provided
  React.useEffect(() => {
    if (initialUrl && !videoUrl) {
      setVideoUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFileChange = async (file: File) => {
    // Validate file type
    if (!acceptedFormats.split(",").includes(file.type)) {
      alert(
        `Please upload a video file. Supported formats: ${acceptedFormats
          .replace(/video\//g, "")
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

    // Set file and create preview
    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoUrl(previewUrl);
    setUploading(true);
    setUploadProgress(0);

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
        alert(`Upload failed: ${result.error}`);
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

      console.log("Video uploaded successfully:", {
        url: result.url,
        path: result.path,
      });
    } catch (error) {
      clearInterval(interval);
      console.error("Upload error:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      await deleteFromStorage(bucket, storagePath);
      console.log("Deleted video from storage:", storagePath);
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
              : "border-gray-300 bg-gray-50 hover:border-[#CC5500] dark:border-gray-600 dark:bg-[#303030] dark:hover:border-[#CC5500]"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("video-upload-input")?.click()}
        >
          <div className="flex justify-center">
            <div className="p-3 bg-white dark:bg-gray-700 rounded-full">
              <FolderUp className="w-6 h-6 text-[#CC5500]" />
            </div>
          </div>
          <div className="space-y-2 mt-3">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Upload a Short Story
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">or</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Drag and Drop Intro Video
            </p>
          </div>
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
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description ||
            `Recommended size: 1920x1080px • Format: MP4, AVI, MOV, WMV, FLV, WebM • Max ${maxSize}MB`}
        </p>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Uploading... {uploadProgress}%
                  </p>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
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