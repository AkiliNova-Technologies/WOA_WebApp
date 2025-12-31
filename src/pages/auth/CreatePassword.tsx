import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import images from "@/assets/images";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReduxAuth } from "@/hooks/useReduxAuth";

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
}

// Password requirement type
interface PasswordRequirements {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  specialChars: string[]; // Track which special characters are actually present
}

export default function CreatePasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    signup,
    loading,
    error: authError,
    clearError,
    user,
    isAuthenticated,
    verificationPending,
  } = useReduxAuth();

  // Get form data from navigation state
  const signUpData = location.state?.formData as SignUpData;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
    terms: "",
  });
  
  // Track password requirements in real-time
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    specialChars: []
  });

  // Common special characters for validation
  const SPECIAL_CHARACTERS = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '[', ']', '{', '}', '|', '\\', ';', ':', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`'];

  // Clear localStorage before signup to prevent false authentication
  useEffect(() => {
    // Clear user data to prevent false authentication
    localStorage.removeItem("user");
    localStorage.removeItem("pendingVerificationEmail");
    localStorage.removeItem("pendingRegistrationData");

    // Only keep authData if it exists (for tokens)
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        // Remove user from authData too
        delete parsed.user;
        localStorage.setItem("authData", JSON.stringify(parsed));
      } catch (e) {
        localStorage.removeItem("authData");
      }
    }
  }, []);

  // Debug: Check what data we're receiving
  useEffect(() => {
    console.log("CreatePasswordPage - Received signUpData:", signUpData);
    console.log(
      "CreatePasswordPage - Email from signUpData:",
      signUpData?.email
    );

    if (!signUpData) {
      console.log("CreatePasswordPage - No signUpData, redirecting to signup");
      navigate("/auth/signup");
    }
  }, [signUpData, navigate]);

  // Debug: Add this useEffect to see auth state
  useEffect(() => {
    console.log("CreatePasswordPage - Auth state:", {
      isAuthenticated,
      user,
      verificationPending,
    });
  }, [isAuthenticated, user, verificationPending]);

  // Update password requirements in real-time as user types
  useEffect(() => {
    if (password) {
      const foundSpecialChars: string[] = [];
      SPECIAL_CHARACTERS.forEach(char => {
        if (password.includes(char)) {
          foundSpecialChars.push(char);
        }
      });

      setPasswordRequirements({
        minLength: password.length >= 8,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: foundSpecialChars.length > 0,
        specialChars: foundSpecialChars
      });
    } else {
      // Reset when password is empty
      setPasswordRequirements({
        minLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        specialChars: []
      });
    }
  }, [password]);

  const validatePassword = () => {
    const errors = { password: "", confirmPassword: "", terms: "" };
    let isValid = true;
    const missingRequirements: string[] = [];

    // Check each requirement and collect what's missing
    if (!passwordRequirements.minLength) {
      missingRequirements.push("at least 8 characters");
    }
    if (!passwordRequirements.hasLowercase) {
      missingRequirements.push("one lowercase letter (a-z)");
    }
    if (!passwordRequirements.hasUppercase) {
      missingRequirements.push("one uppercase letter (A-Z)");
    }
    if (!passwordRequirements.hasNumber) {
      missingRequirements.push("one number (0-9)");
    }
    if (!passwordRequirements.hasSpecialChar) {
      missingRequirements.push(`one special character (e.g., ! @ # $ % ^ & *)`);
    }

    // If there are missing requirements, create a detailed error message
    if (missingRequirements.length > 0) {
      errors.password = `Password must contain: ${missingRequirements.join(", ")}`;
      
      // If special character is missing, show examples
      if (!passwordRequirements.hasSpecialChar) {
        errors.password += `. Special characters include: ${SPECIAL_CHARACTERS.slice(0, 8).join(" ")}...`;
      }
      
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!agreedToTerms) {
      errors.terms = "You must accept the terms and conditions";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    // Clear password error when user starts typing
    if (formErrors.password && value) {
      setFormErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    clearError();
    setPasswordError("");

    if (!validatePassword()) {
      return;
    }

    // Check if we have all required data
    if (!signUpData?.email) {
      setPasswordError("Missing registration data. Please start over.");
      console.error("Missing signUpData:", signUpData);
      return;
    }

    // Combine all data for signup
    const registrationData = {
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      email: signUpData.email,
      phoneNumber: signUpData.phoneNumber,
      password: password,
    };

    console.log("CreatePasswordPage - Sending registration data:", {
      ...registrationData,
      password: "***HIDDEN***",
    });

    try {
      // Call signup API
      await signup(registrationData);

      // Store email in localStorage as backup
      localStorage.setItem("pendingVerificationEmail", signUpData.email);

      // Also store the registration data temporarily
      localStorage.setItem(
        "pendingRegistrationData",
        JSON.stringify({
          email: signUpData.email,
          firstName: signUpData.firstName,
          lastName: signUpData.lastName,
        })
      );

      // Navigate to verification page with success message
      navigate("/auth/verify", {
        state: {
          email: signUpData.email,
          message: "Registration successful! Please verify your email.",
        },
        replace: true,
      });
    } catch (error: any) {
      console.error("CreatePasswordPage - Sign up failed:", error);

      if (error.message?.includes("password")) {
        setPasswordError(error.message);
      } else {
        setPasswordError(
          error.message || "Failed to create account. Please try again."
        );
      }
    }
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
        <Card className="w-full max-w-xl shadow-xs rounded-xs bg-[#F5F5F5] py-8 px-8">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-gray-800 dark:text-white">
              Welcome to World of Afrika
            </CardTitle>
            <p className="mt-3 text-center font-medium text-lg">
              Create a Password
            </p>

            <div className="flex flex-row justify-center gap-2">
              <p className="text-[#4B5675] text-sm dark:text-gray-500">
                Already have an account?
              </p>
              <Link to={"/auth/"} className="text-[#1B84FF] text-sm">
                Sign in
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {passwordError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSignUp}>
              {/* Password with real-time feedback */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 dark:text-white">
                  Password
                </Label>
                <PasswordInput
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="mt-1 bg-[#FCFCFC]"
                  required
                />
                
                {/* Real-time password requirements indicator */}
                {password && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <p className="text-sm font-medium mb-2 dark:text-white">
                      Password must contain:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.minLength ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={`flex items-center ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.hasLowercase ? '✓' : '○'} One lowercase letter
                      </li>
                      <li className={`flex items-center ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.hasUppercase ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.hasNumber ? '✓' : '○'} One number
                      </li>
                      <li className={`flex items-center ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.hasSpecialChar ? '✓' : '○'} One special character
                        {passwordRequirements.specialChars.length > 0 && (
                          <span className="ml-2 text-xs">
                            (Found: {passwordRequirements.specialChars.slice(0, 3).join(", ")})
                          </span>
                        )}
                      </li>
                    </ul>
                  </div>
                )}
                
                {formErrors.password && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {formErrors.password}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 dark:text-white">
                  Confirm Password
                </Label>
                <PasswordInput
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 bg-[#FCFCFC]"
                  required
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="terms"
                  className=""
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked as boolean)
                  }
                />
                <div className="flex flex-row gap-2">
                  <Label
                    htmlFor="terms"
                    className="text-sm text-gray-700 dark:text-white"
                  >
                    I accept
                  </Label>
                  <Link to={"/t&c"} className="text-[#1B84FF] text-sm ">
                    Terms & Conditions
                  </Link>
                </div>
              </div>
              {formErrors.terms && (
                <p className="text-sm text-red-600">{formErrors.terms}</p>
              )}

              {/* Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm mt-5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}