import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password";
import { cn } from "@/lib/utils";

export default function CreatePassword() {
  const { changePassword } = useReduxAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdatePassword = async () => {
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Current password is required");
      toast.error("Current password is required");
      return;
    }

    if (!newPassword) {
      setPasswordError("New password is required");
      toast.error("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
      );
      toast.error(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password updated successfully!");
    } catch (error: any) {
      console.error("Failed to update password:", error);
      setPasswordError(error.message || "Failed to update password");
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    toast.info("Password update cancelled");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdatePassword();
    }
  };

  const isFormValid = () => {
    return (
      currentPassword &&
      newPassword &&
      confirmPassword &&
      newPassword === confirmPassword
    );
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return null;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const hasLength = password.length >= 8;

    const strength = [hasLower, hasUpper, hasNumber, hasSpecial, hasLength].filter(
      Boolean
    ).length;

    return {
      strength,
      label: strength <= 2 ? "Weak" : strength <= 4 ? "Moderate" : "Strong",
      color:
        strength <= 2 ? "text-red-500" : strength <= 4 ? "text-yellow-500" : "text-green-500",
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Password requirement check helper
  const PasswordCheck = ({
    passed,
    text,
  }: {
    passed: boolean;
    text: string;
  }) => (
    <p className={cn("text-xs", passed ? "text-green-500" : "text-gray-400")}>
      {passed ? "✓" : "○"} {text}
    </p>
  );

  return (
    <div className="w-full">
      <Card className="w-full shadow-sm border bg-white">
        <CardHeader className="p-4 sm:p-5 lg:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg">Create Your Password</CardTitle>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            For security reasons, please create a new permanent password for your account.
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 lg:p-6 pt-2 sm:pt-3">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Error Message */}
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">
                {passwordError}
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-medium">Current Password</Label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="h-10 sm:h-11 text-sm sm:text-base"
                type="password"
                disabled={isUpdatingPassword}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">New Password</Label>
                {passwordStrength && (
                  <span className={cn("text-xs sm:text-sm", passwordStrength.color)}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="h-10 sm:h-11 text-sm sm:text-base"
                type="password"
                disabled={isUpdatingPassword}
                onKeyPress={handleKeyPress}
              />

              {/* Password Requirements - Responsive Grid */}
              {newPassword && (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-0.5 sm:gap-1 mt-2">
                  <PasswordCheck passed={newPassword.length >= 8} text="At least 8 characters" />
                  <PasswordCheck passed={/[a-z]/.test(newPassword)} text="One lowercase letter" />
                  <PasswordCheck passed={/[A-Z]/.test(newPassword)} text="One uppercase letter" />
                  <PasswordCheck passed={/\d/.test(newPassword)} text="One number" />
                  <PasswordCheck
                    passed={/[@$!%*?&]/.test(newPassword)}
                    text="One special character (@$!%*?&)"
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-medium">Confirm Password</Label>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className={cn(
                  "h-10 sm:h-11 text-sm sm:text-base",
                  confirmPassword && newPassword !== confirmPassword && "border-red-500"
                )}
                type="password"
                disabled={isUpdatingPassword}
                onKeyPress={handleKeyPress}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs sm:text-sm text-red-500">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword && (
                <p className="text-xs sm:text-sm text-green-500">✓ Passwords match</p>
              )}
            </div>

            <Separator className="my-2 sm:my-3" />

            {/* Action Buttons - Stack on mobile */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="secondary"
                className="h-10 sm:h-11 w-full sm:flex-1 text-sm sm:text-base"
                onClick={handleCancel}
                disabled={isUpdatingPassword}
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "h-10 sm:h-11 w-full sm:flex-1 text-sm sm:text-base text-white transition-colors",
                  !isFormValid() || isUpdatingPassword
                    ? "bg-[#CC5500]/50 cursor-not-allowed"
                    : "bg-[#CC5500] hover:bg-[#CC5500]/90"
                )}
                onClick={handleUpdatePassword}
                disabled={!isFormValid() || isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>

            {/* Security Tips */}
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg mt-2 sm:mt-4">
              <h3 className="text-xs sm:text-sm font-medium text-blue-800 mb-1.5 sm:mb-2">
                Security Tips:
              </h3>
              <ul className="text-xs text-blue-700 space-y-0.5 sm:space-y-1">
                <li>• Use a unique password that you don't use elsewhere</li>
                <li>• Avoid using personal information like your name or birthdate</li>
                <li>• Consider using a password manager to generate and store passwords</li>
                <li>• Update your password regularly for better security</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}