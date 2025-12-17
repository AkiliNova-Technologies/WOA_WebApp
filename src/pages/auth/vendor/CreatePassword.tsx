
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import images from "@/assets/images";
import { Link, useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password";
import { useState } from "react";
import icons from "@/assets/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function VendorCreatePasswordPage() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign in attempted with:", { password });
    // TODO: Add sign in logic here

    // For now, navigate to dashboard or next page
    navigate("/kyc");
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Section */}
      <div className="flex flex-col justify-center items-center bg-[#EBEBEB] w-full md:w-1/3 px-8 py-12">
        <div className="max-w-sm text-center md:text-left">
          <div className="flex justify-center md:justify-center mb-8">
            <img
              src={images.SigninIMG}
              alt="Why we are best"
              className="h-36 w-36 object-contain"
            />
          </div>

          <div className="px-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
              Why we are the best
            </h2>

            <ul className="space-y-4 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <Check className="text-green-600 mt-[3px] h-4 w-4" />
                <span className="">
                  Real vendor experiences presented in a compelling way.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-600 mt-[3px] h-4 w-4" />
                <span>Made locally, shipped globally.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-green-600 mt-[3px] h-4 w-4" />
                <span>Get tailored recommendations.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex justify-center items-center w-full p-6 md:p-12">
        <Card className="w-full max-w-xl shadow-xs rounded-xs bg-[#F5F5F5] py-8 px-8">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-gray-800">
              Welcome to World of Afrika
            </CardTitle>
            <p className="mt-3 text-center font-medium text-lg">Sign up</p>
            <div className="flex flex-row justify-center items-center gap-2 -mt-2 ">
              <p className="text-sm text-gray-500">Already have an Account?</p>
              <Button
                variant={"link"}
                className="p-0 text-[#1B84FF]"
                onClick={() => navigate("/auth/signin")}
              >
                Sign in
              </Button>
            </div>
            <div className="flex flex-row justify-center gap-2">
              <Button
                variant={"outline"}
                className="h-11 shadow-xs px-10 text-[#4B5675]"
              >
                <img src={icons.Google} />
                Use Google
              </Button>
              <Button
                variant={"outline"}
                className="h-11 shadow-xs px-10 text-[#4B5675]"
              >
                <img src={icons.Apple} />
                Use Apple
              </Button>
            </div>
          </CardHeader>

          <div className="flex flex-row gap-4 items-center px-4">
            <Separator className="flex-1" />
            <p className="text-[#78829D] text-sm">OR</p>
            <Separator className="flex-1" />
          </div>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSignUp}>

              {/* Password */}
              <div>
                <label className="text-sm text-gray-700">Password</label>
                <PasswordInput
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-[#FCFCFC]"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm text-gray-700">
                  Confirm Password
                </label>
                <PasswordInput
                  placeholder="Re-enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-[#FCFCFC]"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="terms" className="bg-white" />
                <div className="flex flex-row gap-2">
                  <Label htmlFor="terms" className="text-sm text-gray-700">
                    I accept
                  </Label>
                  <Link to={"/t&c"} className="text-[#1B84FF] text-sm ">
                    Terms & Conditions
                  </Link>
                </div>
              </div>

              {/* Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm mt-5"
                onClick={handleSignUp}
              >
                Sign up
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
