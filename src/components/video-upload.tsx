"use client";

import * as React from "react";
import { X, Play, Pause, FolderUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface VideoUploadProps {
  onVideoChange: (file: File | null) => void;
  className?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string;
}

export function VideoUpload({
  onVideoChange,
  className,
  maxSize = 50, // 50MB default
  acceptedFormats = "video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm",
}: VideoUploadProps) {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleFileChange = (file: File) => {
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

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    onVideoChange(file);
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
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    onVideoChange(null);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
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

  // Clean up object URL on unmount
  React.useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {!videoFile && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
             isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-[#F5F5F5] hover:border-[#CC5500]",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("video-upload-input")?.click()}
        >
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-full">
              <FolderUp className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Upload a Short Story
            </p>
            <p className="text-md text-gray-500">or</p>
            <p>
              <span className="text-gray-500 text-sm font-medium">
                Drag and Drop Intro Video
              </span>
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
      <p className="text-xs text-gray-400">
        Recommended size: 1920x1080px • Format: MP4, AVI, MOV, WMV, FLV, WebM •
        Max {maxSize}MB
      </p>

      {/* Video Preview */}
      {videoFile && videoUrl && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{videoFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveVideo}
              className="text-gray-400 hover:text-gray-600"
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
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/50 to-transparent p-4">
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
                      width: videoRef.current
                        ? `${
                            (videoRef.current.currentTime /
                              videoRef.current.duration) *
                            100
                          }%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-white font-medium">
                  {videoRef.current
                    ? `${Math.floor(
                        videoRef.current.currentTime / 60
                      )}:${Math.floor(videoRef.current.currentTime % 60)
                        .toString()
                        .padStart(2, "0")}`
                    : "0:00"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Click the play button to preview your video
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                document.getElementById("video-upload-input")?.click()
              }
            >
              Change Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
