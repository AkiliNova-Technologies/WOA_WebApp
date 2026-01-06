import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password";
import { useState, useEffect } from "react";
import icons from "@/assets/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { toast } from "sonner";

export default function SignInPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const navigate = useNavigate();
  const {
    signin,
    signInWithGoogle,
    loading,
    error: authError,
    isAuthenticated,
    clearError,
  } = useReduxAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear form error when inputs change
  useEffect(() => {
    if (formError) {
      setFormError(null);
    }
    if (authError) {
      clearError();
    }
  }, [email, password]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setFormError(null);

    // Basic validation
    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    if (!password.trim()) {
      setFormError("Password is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    try {
      // Call the signin function from useReduxAuth
      await signin(email, password);

      // Optionally: Store email in localStorage if remember me is checked
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Error is already handled in the auth slice and toast
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setFormError(null);
      clearError();

      // Call the signInWithGoogle function from useReduxAuth
      await signInWithGoogle();


      // Optionally: Store email in localStorage if remember me is checked
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberedEmail", email);
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };


  const handleForgotPassword = () => {
    navigate("/auth/forgot-password");
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple OAuth or show message
    toast.info("Apple sign-in is coming soon!");
  };

  // Load remembered email on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem("rememberedEmail");
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, []);

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
        <Card className="w-full max-w-xl shadow-xs rounded-xs bg-[#F5F5F5] py-8 px-8">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-gray-800 dark:text-white">
              Welcome to World of Afrika
            </CardTitle>
            <p className="mt-3 text-center font-medium text-lg dark:text-white">
              Sign in
            </p>
            <div className="flex flex-row justify-center items-center gap-2 -mt-2 ">
              <p className="text-sm text-gray-500 dark:text-white">
                Need an account?
              </p>
              <Button
                variant={"link"}
                className="p-0 text-[#1B84FF]"
                onClick={() => navigate("/auth/signup")}
                disabled={loading}
              >
                Sign up
              </Button>
            </div>

            {/* Social Sign-in Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
              <Button
                variant={"outline"}
                className="h-11 shadow-xs px-6 text-[#4B5675] dark:text-white flex-1"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <img src={icons.Google} alt="Google" className="h-5 w-5 mr-2" />
                Use Google
              </Button>
              <Button
                variant={"outline"}
                className="h-11 shadow-xs px-6 text-[#4B5675] dark:text-white flex-1"
                onClick={handleAppleSignIn}
                disabled={loading}
              >
                <img src={icons.Apple} alt="Apple" className="h-5 w-5 mr-2" />
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
            <form className="space-y-4" onSubmit={handleSignIn}>
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 dark:text-white">
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="email@email.com"
                  className="mt-1 h-11 bg-[#FCFCFC]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex flex-1 flex-row justify-between mb-2">
                  <Label className="text-sm text-gray-700 dark:text-white">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#3B82F6] float-right hover:underline p-0 mb-1"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>
                <PasswordInput
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-[#FCFCFC]"
                  required
                  disabled={loading}
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="remember"
                  className="bg-white"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  disabled={loading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-gray-700 dark:text-white"
                >
                  Remember me
                </Label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm mt-5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
