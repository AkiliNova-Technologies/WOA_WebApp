import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import images from "@/assets/images";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AdminEmailOTPPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Fallback if no email is passed, you can redirect back or use a default
      console.warn("No email provided, redirecting back...");
      navigate("/admin/auth/forgot-password");
    }
  }, [location.state, navigate]);

  const handleOTPVerification = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "OTP verification attempted for email:",
      email,
      "with code:",
      otp
    );
    // TODO: Add OTP verification logic here

    // For now, navigate to reset password page with email
    navigate("/admin/auth/signin");

    // navigate("/auth/reset-password", { state: { email } });
  };

  const handleResendOTP = () => {
    console.log("Resend OTP requested for email:", email);
    // TODO: Add resend OTP logic here
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
                <span className="dark:text-white">Made locally, shipped globally.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-600 mt-[3px] h-4 w-4" />
                <span className="dark:text-white">Get tailored recommendations.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex justify-center items-center w-full p-6 md:p-12">
        <Card className="w-full max-w-xl shadow-xs border-none rounded-sm bg-[#F5F5F5] py-8 px-8">
          <CardHeader className="flex flex-col items-center">
            <img
              src={images.VerifyIMG}
              alt="checking email image"
              className="h-52 w-52 object-contain justify-center"
            />
            <CardTitle className="text-2xl font-semibold text-gray-800 text-center dark:text-white">
              Check your email
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1 text-center">
              We have sent a verification code to your email{" "}
              <span className="text-[#071437] font-medium dark:text-white mx-2">{email}</span> to
              verify your account. Thank you
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleOTPVerification}>
              {/* OTP */}
              <div className="flex flex-row justify-center items-center">
                <InputOTP
                  maxLength={5}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Button */}
              <Button
                type="submit"
                disabled={otp.length !== 5}
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </Button>

              <div className="flex flex-row items-center gap-3 justify-center">
                <p className="text-sm text-[#4B5675]">
                  Didn't receive an email?
                </p>
                <Button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-[#1B84FF] text-md bg-transparent border-none hover:bg-transparent p-0 hover:underline"
                >
                  Resend
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
