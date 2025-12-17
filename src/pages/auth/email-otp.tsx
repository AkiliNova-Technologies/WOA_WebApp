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
import api from "@/utils/api";

export default function EmailOTPPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const {
    verifyAuth,
    clearError,
    loading,
    error: authError,
    isAuthenticated,
  } = useReduxAuth();

  useEffect(() => {
    console.log("EmailOTPPage - Location state:", location.state);
    
    // Try to get email from multiple sources in order of preference
    let foundEmail = "";
    
    // 1. First check navigation state
    if (location.state?.email) {
      foundEmail = location.state.email;
      console.log("EmailOTPPage - Found email in location state:", foundEmail);
    }
    
    // 2. Check localStorage backup
    if (!foundEmail) {
      const storedEmail = localStorage.getItem("pendingVerificationEmail");
      if (storedEmail) {
        foundEmail = storedEmail;
        console.log("EmailOTPPage - Found email in localStorage:", foundEmail);
      }
    }
    
    // 3. Check other localStorage key (for backward compatibility)
    if (!foundEmail) {
      const storedEmail = localStorage.getItem("verificationEmail");
      if (storedEmail) {
        foundEmail = storedEmail;
        console.log("EmailOTPPage - Found email in verificationEmail:", foundEmail);
      }
    }
    
    if (foundEmail) {
      setEmail(foundEmail);
      // Store in localStorage as fallback for page refresh
      localStorage.setItem("verificationEmail", foundEmail);
    } else {
      console.log("EmailOTPPage - No email found, redirecting to signup");
      // navigate("/auth/signup");
    }

    // Start countdown for resend button
    const lastResendTime = localStorage.getItem("lastResendTime");
    if (lastResendTime) {
      const timePassed = Date.now() - parseInt(lastResendTime);
      const timeLeft = Math.max(0, 60 - Math.floor(timePassed / 1000));

      if (timeLeft > 0) {
        setCountdown(timeLeft);
        setCanResend(false);
        startCountdown(timeLeft);
      }
    }

    // Cleanup localStorage on component unmount or after verification
    return () => {
      if (verificationSuccess) {
        localStorage.removeItem("verificationEmail");
        localStorage.removeItem("pendingVerificationEmail");
        localStorage.removeItem("lastResendTime");
      }
    };
  }, [location, navigate, verificationSuccess]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer remains same
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    setCanResend(false);
  };

  // Actual OTP verification API call
  const verifyOTP = async (emailToVerify: string, otpToVerify: string) => {
    try {
      console.log("EmailOTPPage - Verifying OTP for:", emailToVerify);
      const response = await api.post("/api/v1/auth/verify-email", {
        email: emailToVerify,
        otp: otpToVerify,
      });
      console.log("EmailOTPPage - OTP verification response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("EmailOTPPage - OTP verification error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to verify OTP. Please try again."
      );
    }
  };

  // Actual resend OTP API call
  const resendOTP = async (emailToResend: string) => {
    try {
      console.log("EmailOTPPage - Resending OTP to:", emailToResend);
      const response = await api.post("/api/v1/auth/email-verification/resend", {
        email: emailToResend,
      });
      console.log("EmailOTPPage - Resend OTP response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("EmailOTPPage - Resend OTP error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    clearError();
    setVerificationError("");

    if (otp.length !== 5) {
      setVerificationError("Please enter a valid 5-digit OTP code");
      return;
    }

    if (!email) {
      setVerificationError("Email not found. Please try signing up again.");
      return;
    }

    try {
      console.log("EmailOTPPage - Starting OTP verification for:", email);
      const response = await verifyOTP(email, otp);

      if (response.success) {
        console.log("EmailOTPPage - OTP verification successful");
        setVerificationSuccess(true);
        
        localStorage.removeItem("verificationEmail");
        localStorage.removeItem("pendingVerificationEmail");
        localStorage.removeItem("lastResendTime");

        console.log("EmailOTPPage - Verifying authentication status...");
        const isAuthVerified = await verifyAuth();

        if (isAuthVerified) {
          console.log("EmailOTPPage - Auth verified, navigating to profile");
          navigate("/profile", { replace: true });
        } else {
          console.log("EmailOTPPage - Auth not verified, navigating to signin");
          navigate("/auth/signin", {
            state: {
              message: "Email verified successfully! Please sign in.",
              email: email,
            },
          });
        }
      } else {
        console.log("EmailOTPPage - OTP verification failed:", response.message);
        setVerificationError(
          response.message || "Invalid OTP code. Please try again."
        );
      }
    } catch (error) {
      console.error("EmailOTPPage - OTP verification failed:", error);
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again."
      );
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !email) return;

    clearError();
    setVerificationError("");

    try {
      const response = await resendOTP(email);

      if (response.success) {
        startCountdown(60);
        localStorage.setItem("lastResendTime", Date.now().toString());
        console.log("EmailOTPPage - OTP resent successfully");
        setVerificationError(""); // Clear any errors
      } else {
        setVerificationError(
          response.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (error) {
      console.error("EmailOTPPage - Resend OTP failed:", error);
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Failed to resend OTP. Please try again."
      );
    }
  };

  // Format email for display
  const formatEmailForDisplay = (emailToFormat: string) => {
    if (!emailToFormat) return "";

    const [localPart, domain] = emailToFormat.split("@");
    if (localPart.length <= 3) return emailToFormat;

    const maskedLocal =
      localPart.substring(0, 3) + "*".repeat(localPart.length - 3);
    return `${maskedLocal}@${domain}`;
  };

  const handleUseDifferentEmail = () => {
    localStorage.removeItem("verificationEmail");
    localStorage.removeItem("pendingVerificationEmail");
    localStorage.removeItem("lastResendTime");
    navigate("/auth/signup");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-[#121212]">
      {/* Left Section remains same */}
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
        <Card className="w-full max-w-xl shadow-xs rounded-sm bg-[#F5F5F5] py-8 px-8">
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
          </CardHeader>

          <CardContent>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-yellow-50 text-yellow-800 text-sm rounded">
                Debug: Email being verified: {email}
              </div>
            )}

            {(authError || verificationError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {verificationError || authError}
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleOTPVerification}>
              {/* OTP Input */}
              <div className="flex flex-row justify-center items-center">
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
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                disabled={otp.length !== 5 || loading}
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Continue"
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
                  disabled={!canResend || loading}
                  className="text-[#1B84FF] text-md bg-transparent border-none hover:bg-transparent p-0 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResend ? "Resend" : `Resend in ${countdown}s`}
                </Button>
              </div>

              {/* Back to Sign Up Option */}
              <div className="flex flex-row justify-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleUseDifferentEmail}
                  className="text-[#4B5675] text-sm"
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