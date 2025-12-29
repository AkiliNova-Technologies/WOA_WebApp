import React from "react";
import { ArrowRight } from "lucide-react";

interface ClippedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
  variant?: "primary" | "secondary";
}

export function ClippedButton({
  children,
  onClick,
  className = "",
  showArrow = true,
  variant = "primary",
}: ClippedButtonProps) {
  const baseStyles = "clipped-button group";
  const variantStyles = {
    primary: "clipped-button-primary",
    secondary: "clipped-button-secondary",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <span className="flex items-center gap-2">
        {children}
        {showArrow && (
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        )}
      </span>
    </button>
  );
}

// Usage examples:
/*
import { ClippedButton } from "@/components/ClippedButton";

// Basic usage
<ClippedButton onClick={() => console.log("clicked")}>
  LEARN MORE
</ClippedButton>

// Without arrow
<ClippedButton showArrow={false}>
  GET STARTED
</ClippedButton>

// Secondary variant (dark)
<ClippedButton variant="secondary">
  SHOP NOW
</ClippedButton>

// With custom styling
<ClippedButton className="w-full md:w-auto">
  EXPLORE MORE
</ClippedButton>

// With onClick handler
<ClippedButton onClick={() => router.push('/about')}>
  LEARN MORE
</ClippedButton>
*/