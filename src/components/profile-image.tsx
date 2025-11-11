"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export interface ProfileImageProps {
  /** The image source URL */
  src?: string | null;
  /** User's name for fallback avatar and alt text */
  alt?: string;
  /** Size of the profile image */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Additional CSS classes */
  className?: string;
}

export function ProfileImage({
  src,
  alt = "Profile image",
  size = "md",
  className,
}: ProfileImageProps) {
  const [imageError, setImageError] = React.useState(false);

  // Size configurations
  const sizeConfig = {
    sm: { container: "w-16 h-16", text: "text-lg" },
    md: { container: "w-24 h-24", text: "text-xl" },
    lg: { container: "w-32 h-32", text: "text-2xl" },
    xl: { container: "w-40 h-40", text: "text-3xl" },
    "2xl": { container: "w-60 h-60", text: "text-4xl" },
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Generate initials from alt text (user's name)
  const getInitials = () => {
    if (!alt) return <User className="w-1/2 h-1/2" />;

    return alt
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hasImage = src && !imageError;

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border",
          sizeConfig[size].container
        )}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div
            className={cn(
              "text-muted-foreground font-semibold flex items-center justify-center",
              sizeConfig[size].text
            )}
          >
            {getInitials()}
          </div>
        )}
      </div>
    </div>
  );
}
