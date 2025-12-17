import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export default function VendorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset requested for email:", email);
    // TODO: Add password reset logic here
    
    // Navigate to OTP verification page with email as state
    navigate("/admin/auth/verify", { state: { email } });
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
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 text-center dark:text-white">
              Forgot Password
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Enter your email to reset password
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleResetPassword}>
              {/* Email */}
              <div className="space-y-3">
                <Label className="text-sm text-gray-700 dark:text-white">Email</Label>
                <Input
                  type="email"
                  placeholder="email@email.com"
                  className="mt-1 h-11 bg-[#FCFCFC]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Buttons */}
              <Button 
                type="submit"
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm mt-5"
              >
                Continue
              </Button>
              
              
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}