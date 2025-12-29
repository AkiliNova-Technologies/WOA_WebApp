import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, AlertCircle } from "lucide-react";
import images from "@/assets/images";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Helper function to format email for display (truncates if too long)
const formatEmailForDisplay = (email: string): string => {
  if (!email) return "";
  if (email.length <= 25) return email;
  const [localPart, domain] = email.split("@");
  if (localPart.length > 15) {
    return `${localPart.substring(0, 12)}...@${domain}`;
  }
  return email;
};

export default function VendorEmailOTPPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    verifyEmail, // This is the verifyEmailWithOTP function from useReduxAuth
    resendVerificationEmail, // This is resendVerificationOTP from useReduxAuth
    clearEmailVerification,
    canResendVerification,
    getResendCooldown,
    verificationAttempts,
    error: authError,
    clearError: clearAuthError,
  } = useReduxAuth();

  // Get email from navigation state or localStorage
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      console.log("EmailOTPPage - Found email in location state:", location.state.email);
    } else {
      // Try to get from localStorage
      const storedEmail = localStorage.getItem("pendingVerificationEmail");
      if (storedEmail) {
        setEmail(storedEmail);
        console.log("EmailOTPPage - Found email in localStorage:", storedEmail);
      } else {
        // Fallback if no email is passed
        console.warn("No email provided, redirecting back to signup...");
        navigate("/auth/signup", { replace: true });
      }
    }
  }, [location.state, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Initialize cooldown and check resend availability
  useEffect(() => {
    const cooldown = getResendCooldown();
    if (cooldown > 0) {
      setResendCooldown(cooldown);
      setCanResend(false);
    } else {
      setCanResend(true);
    }
  }, [getResendCooldown]);

  // Update canResend when cooldown reaches 0
  useEffect(() => {
    if (resendCooldown === 0) {
      setCanResend(canResendVerification());
    } else {
      setCanResend(false);
    }
  }, [resendCooldown, canResendVerification]);

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 5) {
      setVerificationError("Please enter a 5-digit verification code");
      return;
    }

    setLoading(true);
    setVerificationError("");
    setSuccess("");
    clearAuthError(); // Clear any previous auth errors

    try {
      console.log("EmailOTPPage - Verifying OTP for email:", email, "with code:", otp);
      
      // IMPORTANT: Use the verifyEmail function from useReduxAuth
      // This calls the correct endpoint: /api/v1/auth/email-verification
      const result = await verifyEmail(email, otp);
      console.log("EmailOTPPage - OTP verification result:", result);
      
      setSuccess("Email verified successfully! Redirecting to login...");
      
      // Clear pending data from localStorage
      localStorage.removeItem("pendingVerificationEmail");
      localStorage.removeItem("pendingRegistrationData");
      
      // Clear verification state
      clearEmailVerification();
      
      // Navigate to success page or login page after 2 seconds
      setTimeout(() => {
        navigate("/auth/signin", { 
          state: { 
            message: "Email verified successfully! Please sign in to continue.",
            email: email
          },
          replace: true 
        });
      }, 2000);
      
    } catch (error: any) {
      console.error("EmailOTPPage - OTP verification failed:", error);
      setVerificationError(error.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || !canResendVerification()) {
      setVerificationError(`Please wait ${resendCooldown} seconds before resending`);
      return;
    }

    if (verificationAttempts >= 3) {
      setVerificationError("Too many attempts. Please try again later.");
      return;
    }

    setLoading(true);
    setVerificationError("");
    setSuccess("");
    clearAuthError(); // Clear any previous auth errors
    
    try {
      console.log("EmailOTPPage - Resend OTP requested for email:", email);
      
      // IMPORTANT: Use the resendVerificationEmail function from useReduxAuth
      // This calls the correct endpoint: /api/v1/auth/email-verification/resend
      const result = await resendVerificationEmail(email);
      console.log("EmailOTPPage - Resend OTP result:", result);
      
      setSuccess("Verification code has been resent to your email.");
      setResendCooldown(60); // 60 second cooldown
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      
    } catch (error: any) {
      console.error("EmailOTPPage - Resend OTP failed:", error);
      setVerificationError(error.message || "Failed to resend verification code.");
      setResendCooldown(60); // Still set cooldown on error
    } finally {
      setLoading(false);
    }
  };

  const handleUseDifferentEmail = () => {
    // Clear verification data
    localStorage.removeItem("pendingVerificationEmail");
    localStorage.removeItem("pendingRegistrationData");
    clearEmailVerification();
    
    // Navigate back to signup
    navigate("/auth/signup", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-[#121212]">
      {/* Left Section */}
      <div className="flex flex-col justify-center items-center bg-[#EBEBEB] w-full md:w-1/3 px-8 py-12 dark:bg-[#303030]">
        <div className="max-w-sm text-center md:text-left">
          <div className="flex justify-center md:justify-center mb-8">
            <img
              src={images.SigninIMG}
              alt="Why we are best"
              className="h-36 w-36 object-contain"
            />
          </div>

          <div className="px-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center dark:text-white">
              Why we are the best
            </h2>

            <ul className="space-y-4 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <Check className="text-green-600 mt-[3px] h-4 w-4" />
                <span className="dark:text-white">
                  Real vendor experiences presented in a compelling way.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-600 mt-[3px] h-4 w-4" />
                <span className="dark:text-white">
                  Made locally, shipped globally.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-600 mt-[3px] h-4 w-4" />
                <span className="dark:text-white">
                  Get tailored recommendations.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex justify-center items-center w-full p-6 md:p-12">
        <Card className="w-full max-w-xl shadow-xs rounded-sm bg-[#F5F5F5] py-8 px-8 dark:bg-[#1e1e1e]">
          <CardHeader className="flex flex-col items-center">
            <img
              src={images.VerifyIMG}
              alt="checking email image"
              className="h-52 w-52 object-contain justify-center"
            />
            <CardTitle className="text-2xl font-semibold text-gray-800 text-center dark:text-white">
              Check your email
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1 text-center dark:text-gray-300">
              We have sent a verification code to your email{" "}
              <span className="text-[#071437] font-medium dark:text-white">
                {formatEmailForDisplay(email)}
              </span>{" "}
              to verify your account. Thank you
            </p>
            
            {/* Attempts counter */}
            {verificationAttempts > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Attempts: {verificationAttempts}/3
              </p>
            )}
            
            {/* Cooldown indicator */}
            {resendCooldown > 0 && (
              <div className="w-full max-w-xs mt-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-1">
                  You can resend in {resendCooldown}s
                </p>
                <Progress 
                  value={((60 - resendCooldown) / 60) * 100} 
                  className="h-1 bg-gray-200 dark:bg-gray-700"
                />
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Error Messages */}
            {(authError || verificationError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {verificationError || authError}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Success Message */}
            {success && (
              <Alert variant="default" className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleOTPVerification}>
              {/* OTP Input */}
              <div className="flex flex-col items-center space-y-4">
                <InputOTP
                  maxLength={5}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    if (verificationError) setVerificationError("");
                  }}
                  disabled={loading}
                  autoFocus
                >
                  <InputOTPGroup>
                    {[...Array(5)].map((_, index) => (
                      <InputOTPSlot 
                        key={index} 
                        index={index}
                        className="border-gray-300 dark:border-gray-600"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Enter the 5-digit code sent to your email
                </p>
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={otp.length !== 5 || loading}
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              {/* Resend OTP Section */}
              <div className="flex flex-row items-center gap-3 justify-center">
                <p className="text-sm text-[#4B5675] dark:text-gray-300">
                  Didn't receive an email?
                </p>
                <Button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || loading || verificationAttempts >= 3}
                  className="text-[#1B84FF] text-md bg-transparent border-none hover:bg-transparent p-0 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : 
                   resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 
                   verificationAttempts >= 3 ? "Too many attempts" : 
                   "Resend"}
                </Button>
              </div>

              {/* Back to Sign Up Option */}
              <div className="text-center mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleUseDifferentEmail}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  disabled={loading}
                >
                  Use a different email
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}