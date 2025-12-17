import { useState, useEffect } from "react";
import { AfricanPhoneInput } from "@/components/african-phone-input";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FormData } from "./StepsContainer";

interface Step1Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onEmailVerified?: () => void;
}

export default function Step1({ formData, updateFormData, onEmailVerified }: Step1Props) {
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(375); // 6 minutes 15 seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // Countdown timer for resend
  useEffect(() => {
    if (showVerification && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showVerification, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleDocumentsChange = (documents: any[]) => {
    updateFormData({ identityDocuments: documents });
  };

  const handleContinueToVerification = () => {
    // Validate required fields before showing verification
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
      alert("Please fill in all required fields");
      return;
    }

    // TODO: Send verification email API call here
    setShowVerification(true);
    setTimeLeft(375); // Reset timer
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setVerificationError("Please enter the complete verification code");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    // TODO: Verify code with API
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // On success, update form data and call callback
      updateFormData({ emailVerified: true });
      if (onEmailVerified) {
        onEmailVerified();
      }
    } catch (error) {
      setVerificationError("Invalid verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    // TODO: Resend verification email API call
    setTimeLeft(375);
    setVerificationCode(["", "", "", "", "", ""]);
    setVerificationError("");
    
    // Focus first input
    const firstInput = document.getElementById("code-0");
    firstInput?.focus();
  };

  // If email is already verified, don't show verification screen
  if (formData.emailVerified && !showVerification) {
    // This component will just render the form
  }

  return (
    <div>
      {!showVerification ? (
        // Form Section
        <>
          {/* Personal Information Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-2">Tell us a bit about yourself</h2>
            <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
              For compliance purposes, we may verify your identity. This information will never be displayed publicly on World of Afrika.{" "}
              <span className="text-[#CC5500] cursor-pointer hover:underline">Learn more</span>
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
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
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
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
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
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
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
                />
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
              Upload clear images of both the front and back of your valid ID—National ID, Driving Permit, or Passport. Make sure all details are visible and legible.
            </p>

            {/* Identity Upload Component */}
            <ImageUpload
              onImageChange={() => handleDocumentsChange}
              maxSize={1} // 1MB as per the design requirements
              className="mb-6"
              description="Upload the front and back face of your National ID or Passport or Driving Permit"
            />

            {/* Security Note */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Note</h3>
              <p className="text-sm text-[#303030] dark:text-gray-400">
                Your documents are encrypted and stored securely. We only use them for verification and never share them with third parties.
              </p>
            </div>
          </div>

          {/* Continue Button - This will trigger email verification */}
          {!formData.emailVerified && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleContinueToVerification}
                className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-8"
              >
                Continue to Email Verification
              </Button>
            </div>
          )}
        </>
      ) : (
        // Email Verification Screen
        <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
          {/* Illustration */}
          <div className="mb-8">
            <svg
              width="300"
              height="250"
              viewBox="0 0 300 250"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simple illustration placeholder - you can replace with actual SVG */}
              <circle cx="150" cy="125" r="100" fill="#f5f5f5" />
              <path
                d="M150 75 L150 125 L175 100"
                stroke="#303030"
                strokeWidth="3"
                fill="none"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Verify your email address
          </h2>

          {/* Description */}
          <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
            We have sent a verification code to your email{" "}
            <span className="font-semibold">{formData.email}</span>
          </p>

          {/* Verification Code Inputs */}
          <div className="flex gap-3 mb-8">
            {verificationCode.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-semibold"
              />
            ))}
          </div>

          {/* Error Message */}
          {verificationError && (
            <p className="text-red-500 text-sm mb-4">{verificationError}</p>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isVerifying || verificationCode.join("").length !== 6}
            className="bg-black hover:bg-black/90 text-white h-11 px-12 rounded-full mb-6"
          >
            {isVerifying ? "Verifying..." : "VERIFY"}
          </Button>

          {/* Resend Link */}
          <p className="text-sm text-[#303030] dark:text-gray-400">
            Didn't receive a code? ({formatTime(timeLeft)}){" "}
            <button
              onClick={handleResend}
              disabled={timeLeft > 0}
              className={`${
                timeLeft > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#CC5500] hover:underline cursor-pointer"
              }`}
            >
              Resend
            </button>
          </p>
        </div>
      )}
    </div>
  );
}