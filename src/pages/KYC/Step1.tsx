import { useState, useEffect } from "react";
import { AfricanPhoneInput } from "@/components/african-phone-input";
import { IdentityUpload } from "@/components/identity-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FormData } from "./StepsContainer";
import api from "@/utils/api";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress";
import images from "@/assets/images";
import { toast } from "sonner";

// Helper function to format email for display
const formatEmailForDisplay = (email: string): string => {
  if (!email) return "";
  if (email.length <= 25) return email;
  const [localPart, domain] = email.split("@");
  if (localPart.length > 15) {
    return `${localPart.substring(0, 12)}...@${domain}`;
  }
  return email;
};

interface Step1Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onEmailVerified?: () => void;
  requestVerification: boolean;
  onVerificationStarted: () => void;
  kycStatus?: 'draft' | 'email_pending' | 'email_verified' | 'submitted';
}

export default function Step1({
  formData,
  updateFormData,
  onEmailVerified,
  requestVerification,
  onVerificationStarted,
  kycStatus = 'draft',
}: Step1Props) {
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  // Auto-show verification if KYC is in email_pending status
  useEffect(() => {
    if (kycStatus === 'email_pending' && !showVerification) {
      setShowVerification(true);
      setTimeLeft(60);
    }
  }, [kycStatus, showVerification]);

  // Countdown timer for resend
  useEffect(() => {
    if (showVerification && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showVerification, timeLeft]);

  // Reset verification attempts when showing verification
  useEffect(() => {
    if (showVerification) {
      setVerificationAttempts(0);
      setVerificationError("");
      setVerificationCode(""); // Reset code when showing verification
    }
  }, [showVerification]);

  // Auto-verify when all 5 digits are entered
  useEffect(() => {
    if (showVerification && verificationCode.length === 5 && !isVerifying && !isAutoVerifying) {
      // Small delay to allow user to see the full code
      const timer = setTimeout(() => {
        handleAutoVerify();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [verificationCode, showVerification, isVerifying, isAutoVerifying]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
  };

  // Handle identity document URLs from IdentityUpload
  const handleDocumentsChange = (urls: { front?: string; back?: string }) => {
    // Convert URLs to identity documents array
    const documents: string[] = [];
    if (urls.front) documents.push(urls.front);
    if (urls.back) documents.push(urls.back);

    updateFormData({ identityDocumentUrls: documents });
  };

  // This is called from parent when "Save and continue" is clicked
  const sendVerificationCode = async () => {
    if (isSendingCode) return;

    try {
      setIsSendingCode(true);

      // ONLY send email for KYC start (no other data)
      await api.post("/api/v1/vendor/kyc/email/otp", {
        email: formData.email,
      });

      // Show verification UI
      setShowVerification(true);
      setTimeLeft(60);
      toast.success("Verification code sent to your email");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(
        error?.response?.data?.message || "Failed to send verification code"
      );
      throw error;
    } finally {
      setIsSendingCode(false);
    }
  };

  useEffect(() => {
    if (!requestVerification) return;

    const run = async () => {
      try {
        // Parent already started KYC via /kyc/start
        // We just need to resend OTP if needed
        if (kycStatus === 'email_pending') {
          await sendVerificationCode();
        } else {
          // This shouldn't happen, but just in case
          setShowVerification(true);
          setTimeLeft(60);
        }
        onVerificationStarted(); // reset parent flag
      } catch {
        onVerificationStarted(); // prevent lock if API fails
      }
    };

    run();
  }, [requestVerification]);

  const handleAutoVerify = async () => {
    if (verificationCode.length !== 5) {
      return;
    }

    // Check attempts limit
    if (verificationAttempts >= 3) {
      setVerificationError("Too many attempts. Please try again later.");
      toast.error("Too many attempts. Please try again later.");
      return;
    }

    setIsVerifying(true);
    setIsAutoVerifying(true);
    setVerificationError("");

    try {
      // Verify code with the NEW KYC email verification endpoint
      const response = await api.post("/api/v1/vendor/kyc/email/verify", {
        email: formData.email,
        code: verificationCode,
      });

      if (response.data.emailVerified) {
        // On success, update form data and call callback
        updateFormData({ emailVerified: true });
        if (onEmailVerified) {
          onEmailVerified();
        }
        toast.success("Email verified successfully!");
        setShowVerification(false);
      } else {
        throw new Error("Email verification failed");
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      setVerificationAttempts(prev => prev + 1);
      const errorMessage = error?.response?.data?.message ||
        "Invalid verification code. Please try again.";
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
      setIsAutoVerifying(false);
    }
  };

  const handleResend = async () => {
    // Check cooldown
    if (timeLeft > 0) {
      const errorMessage = `Please wait ${timeLeft} seconds before resending`;
      setVerificationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    // Check attempts limit
    if (verificationAttempts >= 3) {
      const errorMessage = "Too many attempts. Please try again later.";
      setVerificationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setIsSendingCode(true);
      
      // Use the KYC OTP endpoint
      await api.post("/api/v1/vendor/kyc/email/otp", {
        email: formData.email
      });

      setTimeLeft(60);
      setVerificationCode("");
      setVerificationError("");
      toast.success("Verification code resent to your email");
    } catch (error: any) {
      console.error("Error resending code:", error);
      const errorMessage = error?.response?.data?.message || "Failed to resend verification code";
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSendingCode(false);
    }
  };

  // Show email verification status if already verified
  useEffect(() => {
    if (formData.emailVerified && showVerification) {
      setShowVerification(false);
    }
  }, [formData.emailVerified, showVerification]);

  // Manual verification fallback (in case auto-verify fails)
  const handleManualVerify = async () => {
    await handleAutoVerify();
  };

  return (
    <div>
      {!showVerification ? (
        // Form Section - Matches screenshot exactly
        <>
          {/* Personal Information Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-2">
              Tell us a bit about yourself
            </h2>
            <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
              For compliance purposes, we may verify your identity. This
              information will never be displayed publicly on World of Afrika.{" "}
              <span className="text-[#CC5500] cursor-pointer hover:underline">
                Learn more
              </span>
            </p>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="firstName" className="mb-2 block">
                  First name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  className="h-11"
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  disabled={formData.emailVerified}
                />
              </div>
              <div>
                <Label htmlFor="middleName" className="mb-2 block">
                  Middle name
                </Label>
                <Input
                  id="middleName"
                  className="h-11"
                  placeholder="e.g. Mason"
                  value={formData.middleName}
                  onChange={(e) =>
                    handleInputChange("middleName", e.target.value)
                  }
                  disabled={formData.emailVerified}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-2 block">
                  Last name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  className="h-11"
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  disabled={formData.emailVerified}
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="h-11"
                  placeholder="e.g. john.doe@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={formData.emailVerified}
                />
                {formData.emailVerified && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Email verified
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  Phone number <span className="text-red-500">*</span>
                </Label>
                <AfricanPhoneInput
                  value={formData.phoneNumber}
                  onChange={(value) => handleInputChange("phoneNumber", value)}
                  countryCode={formData.countryCode}
                  onCountryCodeChange={(value) =>
                    handleInputChange("countryCode", value)
                  }
                  placeholder="e.g. 743027395"
                  disabled={formData.emailVerified}
                />
              </div>
            </div>
          </div>

          {/* Identity Verification Section */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-2">
              Verify your identity <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
              Upload clear images of both the front and back of your valid
              ID—National ID, Driving Permit, or Passport. Make sure all details
              are visible and legible.
            </p>

            {/* Identity Upload Component */}
            <IdentityUpload
              onDocumentsChange={handleDocumentsChange}
              maxSize={1}
              documentType="national_id"
              bucket="world_of_afrika"
              folder="identity-documents"
              initialUrls={
                formData.identityDocumentUrls &&
                formData.identityDocumentUrls.length > 0
                  ? {
                      front: formData.identityDocumentUrls[0],
                      back: formData.identityDocumentUrls[1],
                    }
                  : undefined
              }
              // disabled={formData.emailVerified}
            />

            {/* Security Note */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Note</h3>
              <p className="text-sm text-[#303030] dark:text-gray-400">
                Your documents are encrypted and stored securely. We only use
                them for verification and never share them with third parties.
              </p>
            </div>
          </div>
        </>
      ) : (
        // Email Verification Screen
        <div className="flex flex-col items-center justify-center min-h-[600px] dark:bg-[#121212]">
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="flex flex-col items-center mb-3">
              <img
                src={images.VerifyIMG}
                alt="checking email image"
                className="h-52 w-52 object-contain"
              />
              <h2 className="text-2xl font-semibold text-gray-800 text-center mt-4 dark:text-white">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 mt-1 text-center dark:text-gray-300">
                We have sent a verification code to your email{" "}
                <span className="text-[#071437] font-medium dark:text-white">
                  {formatEmailForDisplay(formData.email)}
                </span>{" "}
                to verify your account.
              </p>
              
              {/* Attempts counter */}
              {verificationAttempts > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Attempts: {verificationAttempts}/3
                </p>
              )}
              
              {/* Cooldown indicator */}
              {timeLeft > 0 && (
                <div className="w-full max-w-xs mt-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-1">
                    You can resend in {timeLeft}s
                  </p>
                  <Progress 
                    value={((60 - timeLeft) / 60) * 100} 
                    className="h-1 bg-gray-200 dark:bg-gray-700"
                  />
                </div>
              )}
            </div>

            {/* OTP Input */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative">
                <InputOTP
                  maxLength={5}
                  value={verificationCode}
                  onChange={(value) => {
                    setVerificationCode(value);
                    if (verificationError) setVerificationError("");
                  }}
                  disabled={isVerifying}
                  autoFocus
                >
                  <InputOTPGroup>
                    {[...Array(5)].map((_, index) => (
                      <InputOTPSlot 
                        key={index} 
                        index={index}
                        className="border-gray-300 dark:border-gray-600 h-14 w-12 text-xl"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                
                
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {isVerifying 
                  ? "Verifying your code..." 
                  : "Enter the 5-digit code sent to your email (auto-verifies when complete)"}
              </p>
            </div>

            {/* Manual Verify Button (fallback) */}
            <div className="mb-4">
              <Button
                onClick={handleManualVerify}
                disabled={verificationCode.length !== 5 || isVerifying || verificationAttempts >= 3}
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
              <p className="text-xs text-gray-400 text-center mt-1">
                Or wait for auto-verification when all 5 digits are entered
              </p>
            </div>

            {/* Resend OTP Section */}
            <div className="flex flex-row items-center gap-3 justify-center mb-4">
              <p className="text-sm text-[#4B5675] dark:text-gray-300">
                Didn't receive an email?
              </p>
              <Button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 || isSendingCode || verificationAttempts >= 3}
                className="text-[#1B84FF] text-md bg-transparent border-none hover:bg-transparent p-0 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingCode ? "Sending..." : 
                 timeLeft > 0 ? `Resend (${timeLeft}s)` : 
                 verificationAttempts >= 3 ? "Too many attempts" : 
                 "Resend"}
              </Button>
            </div>

            {/* Back to Form Button */}
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowVerification(false)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                disabled={isVerifying || isSendingCode}
              >
                Back to form
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}