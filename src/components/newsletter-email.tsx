import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Check, Loader2, Mail, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Omit the native 'size' attribute since we're using our own
interface EmailInputProps 
  extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "size" | "onSubmit"> {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (email: string) => Promise<void> | void;
  inputSize?: "sm" | "md" | "lg"; 
  variant?: "default" | "minimal";
  showIcon?: boolean;
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
}

function NewsletterEmail({
  className,
  value = "",
  onChange,
  onSubmit,
  inputSize = "md", // Use the renamed prop
  variant = "default",
  showIcon = false,
  disabled = false,
  loading = false,
  success = false,
  ...props
}: EmailInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(success);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle success state
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsValid(validateEmail(newValue) || newValue === "");
    onChange?.(newValue);
  };

  const handleSubmit = async () => {
    if (!localValue.trim()) {
      setIsValid(false);
      inputRef.current?.focus();
      return;
    }

    if (!validateEmail(localValue)) {
      setIsValid(false);
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(localValue);
      setShowSuccess(true);
      setLocalValue("");
      onChange?.("");
      // Auto-hide success after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  // Size variants
  const sizeClasses = {
    sm: "h-9 text-sm",
    md: "h-11 text-base",
    lg: "h-14 text-lg"
  };

  const buttonSizeClasses = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg"
  };

  // Variant styles
  const variantClasses = {
    default: "border border-gray-300 bg-white",
    minimal: "border-b border-gray-300 bg-transparent"
  };

  const buttonVariantClasses = {
    default: "bg-[#CC5500] hover:bg-[#b04f00] text-white",
    minimal: "bg-gray-900 hover:bg-gray-800 text-white"
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "flex items-center w-full transition-all duration-200 bg-[#FFFFFF] py-0",
          variant === "default" && "rounded-full overflow-hidden",
          variant === "minimal" && "rounded-none",
          isFocused && "ring ring-[#CC5500]",
          !isValid && "ring-2 ring-red-500 ring-opacity-50"
        )}
      >
        {/* Email Input */}
        <div className="relative flex-1">
          {showIcon && (
            <Mail className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors",
              inputSize === "sm" ? "h-4 w-4" : "h-5 w-5",
              isFocused && "text-[#C75A00]",
              !isValid && "text-red-500"
            )} />
          )}
          <input
            ref={inputRef}
            type="email"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || isSubmitting || showSuccess}
            placeholder="Your email address"
            className={cn(
              "w-full h-12 outline-none bg-transparent transition-colors shadow-0 duration-200 text-[#1A1A1A] placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-none",
              showIcon ? "pl-10 pr-4" : "px-4",
              isFocused && "ring-[#CC5500]",
              sizeClasses[inputSize],
              variantClasses[variant],
              // !isValid && " text-red-500 placeholder-red-300",
              className
            )}
            {...props}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || showSuccess || !localValue.trim()}
          className={cn(
            "flex items-center min-h-12 justify-center font-medium transition-all duration-200 rounded-full disabled:opacity-100 disabled:cursor-not-allowed whitespace-nowrap",
            buttonSizeClasses[inputSize],
            buttonVariantClasses[variant],
            variant === "default" && "rounded-full",
            "min-w-[110px]"
          )}
        >
          {isSubmitting ? (
            <Loader2 className={cn(
              "animate-spin",
              inputSize === "sm" ? "h-4 w-4" : "h-5 w-5"
            )} />
          ) : showSuccess ? (
            <Check className={cn(
              inputSize === "sm" ? "h-4 w-4" : "h-5 w-5"
            )} />
          ) : (
            "Subscribe"
          )}
        </button>
      </div>

      {/* Validation Error */}
      {!isValid && localValue && (
        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Please enter a valid email address</span>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-1 mt-2 text-green-600 text-sm animate-in fade-in duration-200">
          <Check className="h-4 w-4" />
          <span>Successfully subscribed! Thank you.</span>
        </div>
      )}
    </div>
  );
}

// Alternative minimal version for footer use
function NewsletterEmailMinimal(props: EmailInputProps) {
  return <NewsletterEmail variant="minimal" inputSize="sm" {...props} />;
}

export { NewsletterEmail, NewsletterEmailMinimal };
export type { EmailInputProps };