import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";

interface PasswordInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  strength?: "weak" | "medium" | "strong" | "very-strong";
}

function PasswordInput({ 
  className, 
  type = "password",
  label,
  error,
  strength,
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getStrengthColor = () => {
    switch (strength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      case "very-strong":
        return "bg-green-600";
      default:
        return "bg-gray-200";
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case "weak":
        return "Weak";
      case "medium":
        return "Medium";
      case "strong":
        return "Strong";
      case "very-strong":
        return "Very Strong";
      default:
        return "";
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-11 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10",
            "focus-visible:ring-[#CC5500]/60 focus-visible:ring-1",
            error 
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" 
              : "border-gray-300",
            strength && "pr-16",
            className
          )}
          {...props}
        />
        
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 pt-2 rounded",
            error && "text-red-400 hover:text-red-600"
          )}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </button>

        {/* Password Strength Indicator */}
        {strength && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <div className={cn("w-1.5 h-1.5 rounded-full", getStrengthColor())} />
            <span className="text-xs text-gray-500">{getStrengthText()}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          {error}
        </p>
      )}

      {/* Password Strength Bar */}
      {strength && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  bar <= 
                    (strength === "weak" ? 1 : 
                     strength === "medium" ? 2 : 
                     strength === "strong" ? 3 : 4)
                    ? getStrengthColor()
                    : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Alternative version with integrated strength meter
function PasswordInputWithStrength({ 
  value,
  ...props 
}: PasswordInputProps & { value?: string }) {
  const calculateStrength = (password: string = ""): "weak" | "medium" | "strong" | "very-strong" => {
    if (password.length === 0) return "weak";
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    if (score <= 5) return "strong";
    return "very-strong";
  };

  const strength = calculateStrength(value as string);

  return (
    <PasswordInput
      value={value}
      strength={strength}
      {...props}
    />
  );
}

export { PasswordInput, PasswordInputWithStrength };
export type { PasswordInputProps };