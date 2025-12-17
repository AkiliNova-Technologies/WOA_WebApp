import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, AlertCircle } from "lucide-react";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import icons from "@/assets/icons";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AfricanPhoneInput } from "@/components/african-phone-input";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [countryCode, setCountryCode] = useState("+256"); // Internal state for UI
  const [phoneInputValue, setPhoneInputValue] = useState(""); // Internal state for phone input
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
  });

  const navigate = useNavigate();
  const {
    loading,
    error: authError,
    isAuthenticated,
    clearError,
  } = useReduxAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneInputValue(value);

    // Combine country code and phone number (remove + from country code)
    const combinedPhone = `${countryCode.replace("+", "")}${value}`;
    handleInputChange("phoneNumber", combinedPhone);
  };

  const handleCountryCodeChange = (value: string) => {
    // Update country code
    setCountryCode(value);

    // Recalculate combined phone number
    const combinedPhone = `${value.replace("+", "")}${phoneInputValue}`;
    handleInputChange("phoneNumber", combinedPhone);
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the blurred field
    if (field === "email") {
      validateEmail();
    } else if (field === "phoneNumber") {
      validatePhoneNumber();
    }
  };

  const validateEmail = () => {
    if (!formData.email) {
      setFormErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }

    setFormErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const validatePhoneNumber = () => {
    if (!formData.phoneNumber) {
      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: "Phone number is required",
      }));
      return false;
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: "Please enter a valid phone number (10-15 digits)",
      }));
      return false;
    }

    setFormErrors((prev) => ({ ...prev, phoneNumber: "" }));
    return true;
  };

  const validateForm = () => {
    const errors: Partial<FormData> = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    }

    if (!validateEmail()) isValid = false;
    if (!validatePhoneNumber()) isValid = false;

    setFormErrors(errors);
    return isValid;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    const signupData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    };

    console.log("Signup data:", signupData);

    navigate("/auth/create-password", {
      state: {
        formData: signupData,
      },
    });
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in");
  };

  const handleAppleSignIn = () => {
    console.log("Apple sign in");
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
            <p className="mt-3 text-center font-medium text-lg">Sign up</p>
            <div className="flex flex-row justify-center items-center gap-2 -mt-2 ">
              <p className="text-sm text-gray-500">Already have an Account?</p>
              <Button
                variant={"link"}
                className="p-0 text-[#1B84FF]"
                onClick={() => navigate("/auth/signin")}
                disabled={loading}
              >
                Sign in
              </Button>
            </div>
            <div className="flex flex-row justify-center gap-6">
              <Button
                variant={"outline"}
                className="h-11 shadow-xs px-10 text-[#4B5675] dark:text-white"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <img src={icons.Google} alt="Google" />
                Use Google
              </Button>
              <Button
                variant={"outline"}
                className="h-11 shadow-xs px-10 text-[#4B5675] dark:text-white"
                onClick={handleAppleSignIn}
                disabled={loading}
              >
                <img src={icons.Apple} alt="Apple" />
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
            {/* Error Messages */}
            {(authError ||
              Object.keys(formErrors).some(
                (key) => formErrors[key as keyof typeof formErrors]
              )) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {authError ||
                    Object.values(formErrors).find((error) => error) ||
                    "Please fix the errors above"}
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleContinue}>
              {/* Full Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700 dark:text-white">
                    First name
                  </Label>
                  <Input
                    type="text"
                    placeholder="John"
                    className="mt-1 h-11 bg-[#FCFCFC]"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    onBlur={() => handleBlur("firstName")}
                    disabled={loading}
                    required
                  />
                  {touched.firstName && formErrors.firstName && (
                    <p className="text-sm text-red-600">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700 dark:text-white">
                    Last name
                  </Label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    className="mt-1 h-11 bg-[#FCFCFC]"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    onBlur={() => handleBlur("lastName")}
                    disabled={loading}
                    required
                  />
                  {touched.lastName && formErrors.lastName && (
                    <p className="text-sm text-red-600">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 dark:text-white">
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="email@email.com"
                  className="mt-1 h-11 bg-[#FCFCFC]"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={loading}
                  required
                />
                {touched.email && formErrors.email && (
                  <p className="text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm text-gray-700 dark:text-white"
                >
                  Phone Number
                </Label>
                <AfricanPhoneInput
                  value={phoneInputValue}
                  onChange={handlePhoneNumberChange}
                  countryCode={countryCode}
                  onCountryCodeChange={handleCountryCodeChange}
                  placeholder="Enter your phone number"
                  className="bg-white shadow-none dark:bg-input/20"
                  disabled={loading}
                />
                {touched.phoneNumber && formErrors.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Continue Button */}
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
