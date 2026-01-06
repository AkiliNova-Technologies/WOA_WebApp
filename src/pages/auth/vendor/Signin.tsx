import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { toastError, toastPromise, toastWarning, toastInfo } from "@/lib/toast";

export default function VendorSignInPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();
  const {
    signin,
    loading,
    error: authError,
    isAuthenticated,
    clearError,
    user,
  } = useReduxAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user is a vendor
      const isVendor = user.userType === "vendor";

      if (isVendor) {
        // Check if password change is required
        if (user.forcePasswordChange) {
          toastWarning("Password change required", {
            description: "You need to change your password to continue",
          });

          // Redirect to password change page
          setTimeout(() => {
            navigate("/vendor/settings/change-password", { replace: true });
          }, 1500);
        } else {
          // Redirect to vendor dashboard
          toastInfo("Login successful! Redirecting to vendor dashboard...");

          setTimeout(() => {
            navigate("/vendor/", { replace: true });
          }, 1500);
        }
      } else {
        // Show warning for non-vendor users
        toastWarning("You don't have vendor privileges", {
          description: "Redirecting to appropriate dashboard...",
        });

        // Check if user is admin
        if (user.userType === "admin") {
          setTimeout(() => {
            navigate("/admin", { replace: true });
          }, 1500);
        } else {
          setTimeout(() => {
            navigate("/profile", { replace: true });
          }, 1500);
        }
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (formErrors.email || formErrors.password) {
      setFormErrors({});
    }
    if (authError) {
      clearError();
    }
  }, [email, password]);

  // Show auth error as toast when it changes
  useEffect(() => {
    if (authError) {
      toastError("Login failed", {
        description: authError,
      });
    }
  }, [authError]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormErrors({});

    if (!validateForm()) {
      // Show validation errors as toasts
      if (formErrors.email) {
        toastError("Invalid email", {
          description: formErrors.email,
        });
      }
      if (formErrors.password) {
        toastError("Invalid password", {
          description: formErrors.password,
        });
      }
      return;
    }

    try {
      await toastPromise(
        signin(email, password),
        {
          loading: "Signing in...",
          success: (_data) => {
            // Success message and redirect are handled in useEffect
            return "Login successful!";
          },
          error: (_error) => {
            // Error message will come from the promise rejection
            return "Login failed";
          },
        },
        {
          description: "Please wait while we authenticate your credentials",
        }
      );

      // Optionally: Store email in localStorage if remember me is checked
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (error) {
      console.error("Vendor login failed:", error);
    }
  };

  const handleForgotPassword = () => {
    toastInfo("Redirecting to password reset...");
    setTimeout(() => {
      navigate("/vendor/auth/forgot-password");
    }, 500);
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the blurred field
    if (field === "email" && email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, email: undefined }));
      }
    }

    if (field === "password" && password && password.length < 6) {
      setFormErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters",
      }));
    } else if (field === "password" && password) {
      setFormErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  // Check if user is attempting to access vendor page without vendor privileges
  useEffect(() => {
    if (isAuthenticated && user && user.userType !== "vendor") {
      // Show info toast
      toastInfo("Non-vendor user detected", {
        description:
          "You are accessing the vendor login page without vendor privileges",
      });
    }
  }, [isAuthenticated, user, navigate]);

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
        <Card className="w-full max-w-xl shadow-xs border-none rounded-xs bg-[#F5F5F5] py-8 px-8">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-gray-800 dark:text-white">
              Welcome to World of Afrika
            </CardTitle>
            <p className="mt-3 text-center font-medium text-lg">
              Login to manage your shop
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSignIn}>
              {/* Email */}
              <div className="space-y-3">
                <Label className="text-sm text-gray-700 dark:text-white">
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="vendor@email.com"
                  className="mt-1 h-11 bg-[#FCFCFC]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={loading}
                  required
                />
                {touched.email && formErrors.email && (
                  <p className="text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-700 dark:text-white">
                    Password
                  </Label>
                </div>
                <PasswordInput
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className="mt-1 bg-[#FCFCFC]"
                  disabled={loading}
                  required
                />
                {touched.password && formErrors.password && (
                  <p className="text-sm text-red-600">{formErrors.password}</p>
                )}
                <div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#3B82F6] float-right hover:underline p-0"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#CC5500] border-gray-300 rounded"
                  disabled={loading}
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-gray-700 dark:text-white"
                >
                  Remember me
                </label>
              </div>

              {/* Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm mt-5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Vendor Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
