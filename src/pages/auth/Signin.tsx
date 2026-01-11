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
  
  // Individual loading states for each auth method
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const navigate = useNavigate();
  const {
    signin,
    signInWithGoogle,
    signInWithApple,
    loading: globalLoading,
    error: authError,
    isAuthenticated,
    clearError,
  } = useReduxAuth();

  // Check if any auth method is loading
  const isAnyLoading = emailLoading || googleLoading || appleLoading || globalLoading;

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

  // Display form errors as toasts
  useEffect(() => {
    if (formError) {
      toast.error(formError);
    }
  }, [formError]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setFormError(null);

    // Basic validation
    if (!email.trim()) {
      setFormError("Please enter your email address");
      return;
    }

    if (!password.trim()) {
      setFormError("Please enter your password");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    setEmailLoading(true);
    try {
      // Call the signin function from useReduxAuth
      await signin(email, password);

      // Store email in localStorage if remember me is checked
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Success toast is handled in useReduxAuth
      toast.success("Welcome back! Redirecting...", {
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Display user-friendly error messages
      let errorMessage = "Unable to sign in. Please try again.";
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes("invalid") || msg.includes("wrong") || msg.includes("incorrect")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (msg.includes("not found") || msg.includes("user not found")) {
          errorMessage = "No account found with this email. Please sign up first.";
        } else if (msg.includes("network") || msg.includes("connection")) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (msg.includes("disabled")) {
          errorMessage = "This account has been disabled. Please contact support.";
        } else if (msg.includes("too many")) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (msg.includes("verify") || msg.includes("verification")) {
          errorMessage = "Please verify your email before signing in.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    clearError();
    setGoogleLoading(true);

    try {
      // Call the signInWithGoogle function from useReduxAuth
      await signInWithGoogle();

      // Store email in localStorage if remember me is checked
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberedEmail", email);
      }

      // Success toast is handled in useReduxAuth
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      
      // Display user-friendly error messages
      let errorMessage = "Google sign-in failed. Please try again.";
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes("popup") && msg.includes("closed")) {
          errorMessage = "Sign-in was cancelled. Please try again.";
        } else if (msg.includes("popup") && msg.includes("blocked")) {
          errorMessage = "Popup was blocked. Please allow popups for this site.";
        } else if (msg.includes("network")) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (msg.includes("timeout")) {
          errorMessage = "Sign-in timed out. Please try again.";
        } else if (msg.includes("account-exists")) {
          errorMessage = "An account with this email already exists with a different sign-in method.";
        } else if (msg.includes("unauthorized") || msg.includes("not authorized")) {
          errorMessage = "Google sign-in is not properly configured. Please contact support.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setFormError(null);
    clearError();
    setAppleLoading(true);

    try {
      // Call the signInWithApple function from useReduxAuth
      await signInWithApple();

      // Store email in localStorage if remember me is checked
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberedEmail", email);
      }

      // Success toast is handled in useReduxAuth
    } catch (error: any) {
      console.error("Apple sign-in failed:", error);
      
      // Display user-friendly error messages
      let errorMessage = "Apple sign-in failed. Please try again.";
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes("popup") && msg.includes("closed")) {
          errorMessage = "Sign-in was cancelled. Please try again.";
        } else if (msg.includes("popup") && msg.includes("blocked")) {
          errorMessage = "Popup was blocked. Please allow popups for this site.";
        } else if (msg.includes("network")) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (msg.includes("timeout")) {
          errorMessage = "Sign-in timed out. Please try again.";
        } else if (msg.includes("account-exists")) {
          errorMessage = "An account with this email already exists with a different sign-in method.";
        } else if (msg.includes("unauthorized") || msg.includes("not authorized")) {
          errorMessage = "Apple sign-in is not properly configured. Please contact support.";
        } else if (msg.includes("not supported")) {
          errorMessage = "Apple sign-in is not available on this device.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setAppleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/auth/forgot-password");
  };

  // Load remembered email on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem("rememberedEmail");
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
        toast.success(`Welcome back! We remembered your email.`, {
          duration: 3000,
        });
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
                disabled={isAnyLoading}
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
                disabled={isAnyLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <img src={icons.Google} alt="Google" className="h-5 w-5 mr-2" />
                )}
                Use Google
              </Button>
              <Button
                variant={"outline"}
                className="h-11 shadow-xs px-6 text-[#4B5675] dark:text-white flex-1"
                onClick={handleAppleSignIn}
                disabled={isAnyLoading}
              >
                {appleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <img src={icons.Apple} alt="Apple" className="h-5 w-5 mr-2" />
                )}
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
                  disabled={isAnyLoading}
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
                    disabled={isAnyLoading}
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
                  disabled={isAnyLoading}
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
                  disabled={isAnyLoading}
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
                disabled={isAnyLoading}
              >
                {emailLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
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