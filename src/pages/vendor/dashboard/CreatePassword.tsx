import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password";

export default function CreatePassword() {
  // Get the changePassword function from Redux auth hook
  const { changePassword } = useReduxAuth();

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Loading state
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Handle update password
  const handleUpdatePassword = async () => {
    setPasswordError("");

    // Validate passwords
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

    // Add more password strength validation if needed
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character");
      toast.error("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // Call the changePassword function from useReduxAuth
      await changePassword(currentPassword, newPassword);

      // Clear form
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

  // Handle cancel button
  const handleCancel = () => {
    // Clear form and errors
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    
    // You could also navigate away or close the modal depending on your use case
    toast.info("Password update cancelled");
  };

  // Handle key press events (Enter key to submit)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdatePassword();
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;
  };

  // Show password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return null;
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const hasLength = password.length >= 8;
    
    const strength = [hasLower, hasUpper, hasNumber, hasSpecial, hasLength].filter(Boolean).length;
    
    return {
      strength,
      label: strength <= 2 ? "Weak" : strength <= 4 ? "Moderate" : "Strong",
      color: strength <= 2 ? "text-red-500" : strength <= 4 ? "text-yellow-500" : "text-green-500"
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="flex relative flex-1 w-full max-w-8xl">
      <Card className="flex flex-1 shadow-none min-w-5xl w-full max-w-7xl py-6">
        <CardHeader>
          <CardTitle className="text-lg">Create Your Password</CardTitle>
          <p className="text-sm text-gray-500">
            For security reasons, please create a new permanent password for
            your account.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Error Message */}
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {passwordError}
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-3">
              <Label className="font-medium">Current Password</Label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="h-11"
                type="password"
                disabled={isUpdatingPassword}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-medium">New Password</Label>
                {passwordStrength && (
                  <span className={`text-sm ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="h-11"
                type="password"
                disabled={isUpdatingPassword}
                onKeyPress={handleKeyPress}
              />
              {newPassword && (
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p className={newPassword.length >= 8 ? "text-green-500" : "text-gray-400"}>
                    ✓ At least 8 characters
                  </p>
                  <p className={/[a-z]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                    ✓ At least one lowercase letter
                  </p>
                  <p className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                    ✓ At least one uppercase letter
                  </p>
                  <p className={/\d/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                    ✓ At least one number
                  </p>
                  <p className={/[@$!%*?&]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                    ✓ At least one special character (@$!%*?&)
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label className="font-medium">Confirm Password</Label>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className={`h-11 ${confirmPassword && newPassword !== confirmPassword ? "border-red-500" : ""}`}
                type="password"
                disabled={isUpdatingPassword}
                onKeyPress={handleKeyPress}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword && (
                <p className="text-sm text-green-500">✓ Passwords match</p>
              )}
            </div>

            <Separator />

            {/* Buttons */}
            <div className="flex flex-1 flex-row gap-5 items-center">
              <Button 
                variant={"secondary"} 
                className="h-11 flex-1"
                onClick={handleCancel}
                disabled={isUpdatingPassword}
              >
                Cancel
              </Button>
              <Button 
                variant={"secondary"} 
                className={`h-11 flex-1 ${!isFormValid() || isUpdatingPassword ? "bg-[#CC5500]/50 cursor-not-allowed" : "bg-[#CC5500] hover:bg-[#CC5500]/80"} text-white`}
                onClick={handleUpdatePassword}
                disabled={!isFormValid() || isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>

            {/* Additional Security Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Security Tips:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
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