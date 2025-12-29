import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import Steps from "@/components/steps";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AfricanPhoneInput } from "@/components/african-phone-input";
import {
  IdentityUpload,
  type IdentityDocument,
} from "@/components/identity-upload";
import { TextEditor } from "@/components/text-editor";
import { VideoUpload } from "@/components/video-upload";
import {
  SearchSelectContent,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countriesApi, type Country } from "@/lib/countries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/utils/api";
import { toast } from "sonner";
import images from "@/assets/images";

// Form Data Interface
interface FormDataState {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;

  // Identity Verification
  identityDocuments: IdentityDocument[];
  identityDocumentUrls: string[];

  // Store Details
  storeName: string;
  storeDescription: string;
  country: string;
  city: string;
  district: string;
  streetName: string;
  additionalAddress: string;
  videoUrl: string | null; // Changed from File to URL
  gpsCoordinates?: { latitude: number; longitude: number };

  // Bank Details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  swiftCode: string;
}

// ============================================================================
// OPTIONAL: Required Field Indicator Component
// Add this helper component near the top of your file, after imports
// ============================================================================
const RequiredFieldIndicator = ({ completed }: { completed: boolean }) => (
  <span className={`ml-1 ${completed ? "text-green-600" : "text-red-500"}`}>
    {completed ? "✓" : "*"}
  </span>
);

export default function AdminCreateVendorPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [timeLeft, setTimeLeft] = useState(375); // 6 minutes 15 seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);

  const [showLocationVerification, setShowLocationVerification] =
    useState(false);
  const [showAddressConfirmation, setShowAddressConfirmation] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState("");

  const steps = [
    { title: "Business owner Identity" },
    { title: "Identity Verification" },
    { title: "Store details" },
    { title: "Bank details" },
    { title: "Preview" },
  ];

  // Initialize form data state
  const [formData, setFormData] = useState<FormDataState>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+256", // Default country code
    identityDocuments: [],
    identityDocumentUrls: [],
    storeName: "",
    storeDescription: "",
    country: "",
    city: "",
    district: "",
    streetName: "",
    additionalAddress: "",
    videoUrl: null, // Changed to null for URL
    gpsCoordinates: undefined,
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    swiftCode: "",
  });

  const [countries, setCountries] = useState<Country[]>([]);
  // ============================================================================
  // STEP 1: REMOVE UNUSED VARIABLES (Lines 123-124)
  // ============================================================================
  // REMOVE these lines:
  // const [cities, setCities] = useState<City[]>([]);
  // const [citiesLoading, setCitiesLoading] = useState(false);
  // ============================================================================

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
  });

  const [locationProgress, setLocationProgress] = useState(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [bestLocation, setBestLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);

  const [touched, setTouched] = useState({
    accountNumber: false,
    confirmAccountNumber: false,
  });

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const countriesData = await countriesApi.getAfricanCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // ============================================================================
  // STEP 1: REMOVE THE useEffect THAT FETCHES CITIES
  // Remove this entire block:
  // ============================================================================
  /*
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.country) {
        setCities([]);
        return;
      }

      try {
        setCitiesLoading(true);
        const citiesData = await countriesApi.getCitiesByCountry(
          formData.country
        );
        setCities(citiesData);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, [formData.country]);
  */
  // ============================================================================

  // Update form data helper function
  const updateFormData = (updates: Partial<FormDataState>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleChange = (field: keyof FormDataState, value: string) => {
    updateFormData({ [field]: value });

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Validate account numbers in real-time if both are filled
    if (field === "accountNumber" && touched.confirmAccountNumber) {
      validateAccountNumbers(value, formData.confirmAccountNumber);
    } else if (field === "confirmAccountNumber" && touched.accountNumber) {
      validateAccountNumbers(formData.accountNumber, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Validate when field loses focus
    if (field === "accountNumber" || field === "confirmAccountNumber") {
      validateAccountNumbers(
        formData.accountNumber,
        formData.confirmAccountNumber
      );
    }
  };

  const validateAccountNumbers = (
    accountNumber: string,
    confirmAccountNumber: string
  ) => {
    const newErrors = {
      accountNumber: "",
      confirmAccountNumber: "",
    };

    // Basic account number validation (numbers only, typical length)
    if (accountNumber && !/^\d+$/.test(accountNumber)) {
      newErrors.accountNumber = "Account number should contain only numbers";
    } else if (
      accountNumber &&
      (accountNumber.length < 8 || accountNumber.length > 17)
    ) {
      newErrors.accountNumber = "Account number should be between 8-17 digits";
    }

    // Confirm account number validation
    if (confirmAccountNumber && accountNumber !== confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }

    setErrors(newErrors);
  };

  const getAccountNumberStatus = () => {
    if (!touched.accountNumber || !formData.accountNumber) return null;

    if (errors.accountNumber) {
      return { type: "error", message: errors.accountNumber };
    }

    if (
      formData.accountNumber.length >= 8 &&
      /^\d+$/.test(formData.accountNumber)
    ) {
      return { type: "success", message: "Valid account number" };
    }

    return null;
  };

  const getConfirmAccountNumberStatus = () => {
    if (!touched.confirmAccountNumber || !formData.confirmAccountNumber)
      return null;

    if (errors.confirmAccountNumber) {
      return { type: "error", message: errors.confirmAccountNumber };
    }

    if (
      formData.confirmAccountNumber &&
      formData.accountNumber === formData.confirmAccountNumber
    ) {
      return { type: "success", message: "Account numbers match" };
    }

    return null;
  };

  const accountNumberStatus = getAccountNumberStatus();
  const confirmAccountNumberStatus = getConfirmAccountNumberStatus();

  // Check if all required bank details are filled
  const isBankDetailsComplete =
    formData.accountHolderName &&
    formData.bankName &&
    formData.accountNumber &&
    formData.confirmAccountNumber &&
    !errors.accountNumber &&
    !errors.confirmAccountNumber;

  const handleCountryChange = (value: string) => {
    updateFormData({
      country: value,
      city: "", // Reset city when country changes
    });
  };

  const handleStoreDescriptionChange = (value: string) => {
    updateFormData({ storeDescription: value });
  };

  const handleInputChange = (field: keyof FormDataState, value: string) => {
    updateFormData({ [field]: value });
  };

  // Changed to handle video URL instead of File
  const handleVideoChange = (url: string | null) => {
    updateFormData({ videoUrl: url });
  };

  const handleDocumentsChange = (urls: { front?: string; back?: string }) => {
    // Convert URLs to identity documents array
    const documents: string[] = [];
    if (urls.front) documents.push(urls.front);
    if (urls.back) documents.push(urls.back);

    updateFormData({ identityDocumentUrls: documents });
  };

  // Helper function to get country name from code
  const getCountryName = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setVerificationCode(newCode);

      // Focus the last input
      const lastInput = document.getElementById(`code-5`);
      lastInput?.focus();
    }
  };

  // ============================================================================
  // STEP 6: ADD isCurrentStepValid HELPER FUNCTION
  // Add this helper function for button disabled states
  // ============================================================================
  const isCurrentStepValid = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!(
          formData.firstName?.trim() &&
          formData.lastName?.trim() &&
          formData.email?.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
          formData.phoneNumber?.trim() &&
          formData.identityDocumentUrls &&
          formData.identityDocumentUrls.length >= 2
        );

      case 1:
        return !!(
          formData.storeName?.trim() &&
          formData.country &&
          formData.city?.trim() &&
          formData.district?.trim() &&
          formData.gpsCoordinates
        );

      case 2:
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = formData.storeDescription || "";
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        return textContent.trim().length >= 10;

      case 3:
        return !!(
          formData.accountHolderName?.trim() &&
          formData.bankName?.trim() &&
          formData.accountNumber?.trim() &&
          formData.confirmAccountNumber?.trim() &&
          formData.accountNumber === formData.confirmAccountNumber &&
          !errors.accountNumber &&
          !errors.confirmAccountNumber
        );

      default:
        return true;
    }
  };

  // ============================================================================
  // STEP 2: ADD VALIDATION FUNCTION (already present in your code)
  // ============================================================================
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Step 1: Personal Information & Identity
        if (!formData.firstName?.trim()) {
          toast.error("Please enter your first name");
          return false;
        }
        if (!formData.lastName?.trim()) {
          toast.error("Please enter your last name");
          return false;
        }
        if (!formData.email?.trim()) {
          toast.error("Please enter your email address");
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return false;
        }
        if (!formData.phoneNumber?.trim()) {
          toast.error("Please enter your phone number");
          return false;
        }
        if (
          !formData.identityDocumentUrls ||
          formData.identityDocumentUrls.length < 2
        ) {
          toast.error("Please upload both front and back of your ID");
          return false;
        }
        return true;

      case 1: // Step 2: Store Details & Location
        if (!formData.storeName?.trim()) {
          toast.error("Please enter your store name");
          return false;
        }
        if (!formData.country) {
          toast.error("Please select your country of operation");
          return false;
        }
        if (!formData.city?.trim()) {
          toast.error("Please enter your city of operation");
          return false;
        }
        if (!formData.district?.trim()) {
          toast.error("Please enter your district");
          return false;
        }
        if (!formData.gpsCoordinates) {
          toast.error("Please verify your shop location before continuing");
          return false;
        }
        return true;

      case 2: // Step 3: Store Description & Video
        if (!formData.storeDescription?.trim()) {
          toast.error("Please add a store description");
          return false;
        }
        // Check if description has actual content (not just HTML tags)
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = formData.storeDescription;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        if (textContent.trim().length < 10) {
          toast.error(
            "Please provide a meaningful store description (at least 10 characters)"
          );
          return false;
        }
        // Video is optional, so we don't validate it
        return true;

      case 3: // Step 4: Bank Details
        if (!formData.accountHolderName?.trim()) {
          toast.error("Please enter account holder name");
          return false;
        }
        if (!formData.bankName?.trim()) {
          toast.error("Please enter bank name");
          return false;
        }
        if (!formData.accountNumber?.trim()) {
          toast.error("Please enter account number");
          return false;
        }
        if (!formData.confirmAccountNumber?.trim()) {
          toast.error("Please confirm your account number");
          return false;
        }
        if (formData.accountNumber !== formData.confirmAccountNumber) {
          toast.error("Account numbers do not match");
          return false;
        }
        if (errors.accountNumber || errors.confirmAccountNumber) {
          toast.error("Please fix account number errors before continuing");
          return false;
        }
        return true;

      case 4: // Step 5: Preview - always valid since it's just review
        return true;

      default:
        return true;
    }
  };

  // ============================================================================
  // STEP 3: UPDATE handleNext FUNCTION (already present in your code)
  // ============================================================================
  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // ============================================================================
  // STEP 4: ADD STEP NAVIGATION VALIDATION
  // Add this function to prevent clicking ahead to incomplete steps
  // ============================================================================
  const handleStepClick = (stepIndex: number) => {
    // Can't skip ahead to future steps
    if (stepIndex > currentStep) {
      toast.error("Please complete the current step before proceeding");
      return;
    }

    // Can go back to previous steps
    setCurrentStep(stepIndex);
  };

  const handleSubmit = () => {
    console.log("Submitting form data:", formData);
    // TODO: Implement API call to submit form data
    alert("Form submitted successfully!");
    navigate("/vendors");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const reverseGeocode = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      // BigDataCloud free API - no API key required, generous rate limits
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

      const data = await response.json();

      // Build a comprehensive address from the response
      const addressParts = [
        data.locality || data.city,
        data.principalSubdivision,
        data.countryName,
      ].filter(Boolean);

      return addressParts.length > 0
        ? addressParts.join(", ")
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error("Error with BigDataCloud geocoding:", error);

      // Fallback to Nominatim if BigDataCloud fails
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              "User-Agent": "ShopRegistration/1.0", // Nominatim requires a user agent
            },
          }
        );
        const data = await response.json();
        return (
          data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );
      } catch (fallbackError) {
        console.error("Fallback geocoding also failed:", fallbackError);
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setVerificationError("Please enter the complete verification code");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      // Verify code with API
      await api.post("/api/v1/auth/verify-email-code", {
        email: formData.email,
        code: code,
      });

      setShowVerification(false);
      toast.success("Email verified successfully!");
    } catch (error: any) {
      console.error("Error verifying code:", error);
      setVerificationError(
        error?.response?.data?.message ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsSendingCode(true);
      await api.post("/api/v1/auth/send-verification-code", {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setTimeLeft(375);
      setVerificationCode(["", "", "", "", "", ""]);
      setVerificationError("");
      toast.success("Verification code resent to your email");

      // Focus first input
      const firstInput = document.getElementById("code-0");
      firstInput?.focus();
    } catch (error: any) {
      console.error("Error resending code:", error);
      toast.error(
        error?.response?.data?.message || "Failed to resend verification code"
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleContinueToLocationVerification = () => {
    // Validate required fields before showing location verification
    if (
      !formData.storeName ||
      !formData.country ||
      !formData.city ||
      !formData.district
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setShowLocationVerification(true);
  };

  const handleVerifyLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsVerifyingLocation(true);
    setLocationProgress(0);
    setCurrentAccuracy(null);
    setBestLocation(null);

    const COLLECTION_DURATION = 8000; // 8 seconds to collect readings
    const PROGRESS_INTERVAL = 100; // Update progress every 100ms
    const startTime = Date.now();
    let watchId: number;
    let progressInterval: NodeJS.Timeout;

    // ✅ FIX: Use a local variable to track best location instead of relying on state
    let currentBestLocation: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: number;
    } | null = null;

    // Progress bar animation
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / COLLECTION_DURATION) * 100, 100);
      setLocationProgress(progress);
    }, PROGRESS_INTERVAL);

    try {
      // Use watchPosition to continuously improve accuracy
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setCurrentAccuracy(newLocation.accuracy);

          // ✅ FIX: Update both state AND local variable
          if (
            !currentBestLocation ||
            newLocation.accuracy < currentBestLocation.accuracy
          ) {
            currentBestLocation = newLocation;
            setBestLocation(newLocation);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          clearInterval(progressInterval);
          navigator.geolocation.clearWatch(watchId);

          let errorMessage = "Failed to get your location. ";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                "Please enable location services in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out. Please try again.";
              break;
            default:
              errorMessage += "Please enable location services.";
          }

          toast.error(errorMessage);
          setIsVerifyingLocation(false);
          setLocationProgress(0);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        }
      );

      // After collection duration, process the best location
      setTimeout(async () => {
        clearInterval(progressInterval);
        navigator.geolocation.clearWatch(watchId);
        setLocationProgress(100);

        // ✅ FIX: Use the local variable instead of state
        if (currentBestLocation) {
          try {
            // Reverse geocode the best location
            const address = await reverseGeocode(
              currentBestLocation.latitude,
              currentBestLocation.longitude
            );

            setDetectedAddress(address);

            // Store coordinates in form data
            const coordinates = {
              latitude: currentBestLocation.latitude,
              longitude: currentBestLocation.longitude,
            };
            updateFormData({ gpsCoordinates: coordinates });

            // Show success message with accuracy info
            toast.success(
              `Location captured with ${currentBestLocation.accuracy.toFixed(
                0
              )}m accuracy`
            );

            // Transition to address confirmation
            setTimeout(() => {
              setShowLocationVerification(false);
              setShowAddressConfirmation(true);
              setIsVerifyingLocation(false);
              setLocationProgress(0);
            }, 500);
          } catch (error) {
            console.error("Error processing location:", error);
            toast.error("Failed to process location. Please try again.");
            setIsVerifyingLocation(false);
            setLocationProgress(0);
          }
        } else {
          console.error("No location data collected");
          toast.error("Unable to get accurate location. Please try again.");
          setIsVerifyingLocation(false);
          setLocationProgress(0);
        }
      }, COLLECTION_DURATION);
    } catch (error) {
      console.error("Error verifying location:", error);
      toast.error("Failed to verify location. Please try again.");
      setIsVerifyingLocation(false);
      setLocationProgress(0);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };

  const handleConfirmAddress = () => {
    setShowAddressConfirmation(false);
  };

  const handleReverifyLocation = () => {
    setShowAddressConfirmation(false);
    setShowLocationVerification(true);
    setBestLocation(null);
    setCurrentAccuracy(null);
    setLocationProgress(0);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader label="Seller Management" />

      {/* Main Content */}
      <div className="mx-auto px-10 py-8">
        <div className="flex gap-8">
          {/* Sticky Steps Sidebar */}
          <div className="w-60 max-w-60 shrink-0">
            <div className="sticky top-8 bg-white rounded-lg p-6 dark:bg-[#303030]">
              <Steps
                current={currentStep}
                items={steps}
                onChange={handleStepClick}
                direction="vertical"
              />
            </div>
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-md mb-6 dark:bg-[#303030]">
              <div className="mx-auto px-10 py-4 flex items-center justify-between">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={"secondary"}
                    className="bg-white hover:text-gray-900 dark:bg-[#303030]"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Back to Seller Display
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1">
              {/* Step 1: Personal Information */}
              {currentStep === 0 && (
                <div className="bg-white rounded-lg p-6 dark:bg-[#303030]">
                  {!showVerification ? (
                    <>
                      {/* Personal Information Section */}
                      <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-2">
                          Tell us a bit about yourself
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          For compliance purposes, we may verify your identity.
                          This information will never be displayed publicly on
                          World of Afrika.{" "}
                          <span className="text-[#CC5500] cursor-pointer hover:underline">
                            Learn more
                          </span>
                        </p>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <Label htmlFor="firstName" className="mb-2 block">
                              First name
                              <RequiredFieldIndicator
                                completed={!!formData.firstName?.trim()}
                              />
                            </Label>
                            <Input
                              id="firstName"
                              className="h-11"
                              placeholder="e.g. John"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="middleName" className="mb-2 block">
                              Middle name
                            </Label>
                            <Input
                              id="middleName"
                              className="h-11"
                              placeholder="e.g. Mason"
                              value={formData.middleName}
                              onChange={(e) =>
                                handleInputChange("middleName", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="mb-2 block">
                              Last name{" "}
                              <RequiredFieldIndicator
                                completed={!!formData.lastName?.trim()}
                              />
                            </Label>
                            <Input
                              id="lastName"
                              className="h-11"
                              placeholder="e.g. Doe"
                              value={formData.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Contact Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="email" className="mb-2 block">
                              Email Address{" "}
                              <RequiredFieldIndicator
                                completed={
                                  !!formData.email?.trim() &&
                                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                    formData.email
                                  )
                                }
                              />
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              className="h-11"
                              placeholder="e.g. john.doe@gmail.com"
                              value={formData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="mb-2 block">
                              Phone number{" "}
                              <RequiredFieldIndicator
                                completed={!!formData.phoneNumber?.trim()}
                              />
                            </Label>
                            <AfricanPhoneInput
                              value={formData.phoneNumber}
                              onChange={(value) =>
                                handleInputChange("phoneNumber", value)
                              }
                              countryCode={formData.countryCode}
                              onCountryCodeChange={(value) =>
                                handleInputChange("countryCode", value)
                              }
                              placeholder="e.g. 743027395"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Identity Verification Section */}
                      <div className="border-t pt-8">
                        <h2 className="text-xl font-semibold mb-2">
                          Verify your identity{" "}
                          <RequiredFieldIndicator
                            completed={
                              formData.identityDocumentUrls &&
                              formData.identityDocumentUrls.length >= 2
                            }
                          />
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          Upload clear images of both the front and back of your
                          valid ID—National ID, Driving Permit, or Passport.
                          Make sure all details are visible and legible.
                        </p>

                        {/* Identity Upload Component */}
                        <IdentityUpload
                          onDocumentsChange={handleDocumentsChange}
                          maxSize={1}
                          documentType="national_id"
                          bucket="vendor-assets"
                          folder="identity-documents"
                          initialUrls={
                            formData.identityDocumentUrls &&
                            formData.identityDocumentUrls.length > 0
                              ? {
                                  front: formData.identityDocumentUrls[0],
                                  back: formData.identityDocumentUrls[1],
                                }
                              : undefined
                          }
                        />

                        {/* Security Note */}
                        <div className="mt-6">
                          <h3 className="text-md font-semibold mb-2">Note</h3>
                          <p className="text-sm text-[#303030] dark:text-gray-400">
                            Your documents are encrypted and stored securely. We
                            only use them for verification and never share them
                            with third parties.
                          </p>
                        </div>
                      </div>

                      <div className="mt-12 border float-right items-end">
                        <Button
                          variant={"default"}
                          onClick={handleNext}
                          disabled={!isCurrentStepValid()}
                          className="px-8 py-3 w-xs h-12 text-white dark:text-black text-md font-smeibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save and Continue
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Email Verification Screen
                    <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
                      {/* Illustration */}
                      <div className="mb-8">
                        <img
                          src={images.VerifyIMG}
                          alt="checking email image"
                          className="h-52 w-52 object-contain"
                        />
                      </div>

                      <h2 className="text-2xl font-semibold mb-4 text-center">
                        Verify your email address
                      </h2>

                      <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
                        We have sent a verification code to your email{" "}
                        <span className="font-semibold">{formData.email}</span>
                      </p>

                      {/* Verification Code Inputs */}
                      <div className="flex gap-3 mb-8">
                        {verificationCode.map((digit, index) => (
                          <Input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleCodeChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="w-12 h-14 text-center text-xl font-semibold"
                          />
                        ))}
                      </div>

                      {/* Error Message */}
                      {verificationError && (
                        <p className="text-red-500 text-sm mb-4">
                          {verificationError}
                        </p>
                      )}

                      {/* Verify Button */}
                      <Button
                        onClick={handleVerify}
                        disabled={
                          isVerifying || verificationCode.join("").length !== 6
                        }
                        className="bg-black hover:bg-black/90 text-white h-11 px-12 rounded-full mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? "Verifying..." : "VERIFY"}
                      </Button>

                      {/* Resend Link */}
                      <p className="text-sm text-[#303030] dark:text-gray-400">
                        Didn't receive a code? ({formatTime(timeLeft)}){" "}
                        <button
                          onClick={handleResend}
                          disabled={timeLeft > 0 || isSendingCode}
                          className={`${
                            timeLeft > 0 || isSendingCode
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-[#CC5500] hover:underline cursor-pointer"
                          }`}
                        >
                          {isSendingCode ? "Sending..." : "Resend"}
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Store Details - First Part */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg p-6 dark:bg-[#303030]">
                  {!showLocationVerification && !showAddressConfirmation ? (
                    <>
                      {/* Shop Name Section */}
                      <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-2">
                          Shop Name
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          This is how your shop will appear to buyers. Keep it
                          clear and memorable.
                        </p>

                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="storeName" className="mb-2 block">
                              Store name{" "}
                              <RequiredFieldIndicator
                                completed={!!formData.storeName?.trim()}
                              />
                            </Label>
                            <Input
                              id="storeName"
                              placeholder="e.g. Johnshop"
                              className="h-11"
                              value={formData.storeName}
                              onChange={(e) =>
                                handleInputChange("storeName", e.target.value)
                              }
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="country" className="mb-2 block">
                                Country of Operation{" "}
                                <RequiredFieldIndicator
                                  completed={!!formData.country}
                                />
                              </Label>
                              <Select
                                value={formData.country}
                                onValueChange={handleCountryChange}
                                disabled={loading}
                              >
                                <SelectTrigger
                                  id="country"
                                  className="min-h-11 w-full"
                                >
                                  <SelectValue
                                    placeholder={
                                      loading
                                        ? "Loading countries..."
                                        : "Select the country"
                                    }
                                  >
                                    {formData.country &&
                                      getCountryName(formData.country)}
                                  </SelectValue>
                                </SelectTrigger>
                                <SearchSelectContent searchPlaceholder="Search countries...">
                                  {countries.map((country) => (
                                    <SelectItem
                                      key={country.code}
                                      value={country.code}
                                    >
                                      {country.name}
                                    </SelectItem>
                                  ))}
                                </SearchSelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="city" className="mb-2 block">
                                City of Operation{" "}
                                <RequiredFieldIndicator
                                  completed={!!formData.city?.trim()}
                                />
                              </Label>
                              <Input
                                id="city"
                                placeholder="Select the city"
                                className="h-11"
                                value={formData.city}
                                onChange={(e) =>
                                  handleInputChange("city", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address Section */}
                      <div className="border-t pt-8">
                        <h2 className="text-xl font-semibold mb-2">
                          Enter Address of the shop
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          By sharing a verified location, you unlock access to
                          local logistics support, and guarantee that payouts
                          and compliance checks run seamlessly.
                        </p>

                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="district" className="mb-2 block">
                              District{" "}
                              <RequiredFieldIndicator
                                completed={!!formData.district?.trim()}
                              />
                            </Label>
                            <Input
                              id="district"
                              placeholder="Enter district"
                              className="h-11"
                              value={formData.district}
                              onChange={(e) =>
                                handleInputChange("district", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="streetName" className="mb-2 block">
                              Street name/Street number/landmark{" "}
                              <span className="text-gray-500">(optional)</span>
                            </Label>
                            <Input
                              id="streetName"
                              placeholder="Enter street details"
                              className="h-11"
                              value={formData.streetName}
                              onChange={(e) =>
                                handleInputChange("streetName", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="additionalAddress"
                              className="mb-2 block"
                            >
                              Additional details/Detailed address{" "}
                              <span className="text-gray-500">(optional)</span>
                            </Label>
                            <Textarea
                              id="additionalAddress"
                              rows={5}
                              className="resize-none"
                              placeholder="Enter additional address details"
                              value={formData.additionalAddress}
                              onChange={(e) =>
                                handleInputChange(
                                  "additionalAddress",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Continue to Location Verification Button */}
                      <div className="mt-8 flex justify-end">
                        <Button
                          onClick={handleContinueToLocationVerification}
                          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-8"
                          disabled={
                            !(
                              formData.storeName?.trim() &&
                              formData.country &&
                              formData.city?.trim() &&
                              formData.district?.trim()
                            )
                          }
                        >
                          Continue to Location Verification
                        </Button>
                      </div>
                    </>
                  ) : showLocationVerification ? (
                    <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
                      <div className="mb-8">
                        <div className="h-52 w-52 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg
                            className="w-24 h-24 text-[#CC5500]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-semibold mb-4 text-center">
                        {isVerifyingLocation
                          ? "Verifying your location"
                          : "Verify your location"}
                      </h2>

                      {/* Description */}
                      {!isVerifyingLocation ? (
                        <>
                          <p className="text-[#303030] dark:text-gray-400 mb-4 text-center max-w-2xl">
                            To verify your shop location, please ensure you are
                            physically at your shop premises. This allows us to
                            capture the exact GPS pin of your store, helping
                            customers trust your business and ensuring smooth
                            deliveries.
                          </p>

                          <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-2xl text-sm">
                            If you are not at your shop right now, you can pause
                            here and return later — your progress will be saved,
                            and you can complete verification once you're at the
                            location.
                          </p>
                        </>
                      ) : (
                        <div className="w-full max-w-md mb-8">
                          <p className="text-[#303030] dark:text-gray-400 mb-4 text-center">
                            Improving location accuracy...
                          </p>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                            <div
                              className="bg-[#CC5500] h-2.5 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${locationProgress}%` }}
                            />
                          </div>

                          {/* Accuracy Info */}
                          {currentAccuracy !== null && (
                            <p className="text-sm text-center text-[#303030] dark:text-gray-400">
                              Current accuracy:{" "}
                              <span className="font-semibold">
                                {currentAccuracy.toFixed(0)}m
                              </span>
                              {bestLocation && (
                                <span className="ml-2">
                                  (Best: {bestLocation.accuracy.toFixed(0)}m)
                                </span>
                              )}
                            </p>
                          )}

                          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                            Please keep your device steady for best results
                          </p>
                        </div>
                      )}

                      {/* Verify Button */}
                      {!isVerifyingLocation && (
                        <Button
                          onClick={handleVerifyLocation}
                          className="bg-black hover:bg-black/90 text-white h-11 px-12 rounded-md mb-6"
                        >
                          VERIFY
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Address Confirmation Screen
                    <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
                      {/* Illustration placeholder */}
                      <div className="mb-8">
                        <div className="h-52 w-52 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                          <CheckCircle className="w-24 h-24 text-green-600 dark:text-green-400" />
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-semibold mb-4 text-center">
                        Confirm Address
                      </h2>

                      {/* Description */}
                      <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
                        Please review your shop address details carefully.
                      </p>

                      {/* Instructions */}
                      <div className="mb-8 space-y-2 text-sm text-[#303030] dark:text-gray-400 max-w-2xl">
                        <div className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            If everything looks correct, click Continue to
                            proceed.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            If something is wrong, choose Re-verify to update
                            your location before moving forward.
                          </span>
                        </div>
                      </div>

                      {/* Address Display */}
                      <div className="w-full max-w-2xl mb-8">
                        <Label htmlFor="detectedAddress" className="mb-2 block">
                          Address
                        </Label>
                        <Input
                          id="detectedAddress"
                          value={detectedAddress}
                          readOnly
                          className="h-11 bg-gray-50 dark:bg-gray-800"
                        />
                        {bestLocation && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Location accuracy:{" "}
                            {bestLocation.accuracy.toFixed(0)} meters
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <Button
                          onClick={handleReverifyLocation}
                          variant="outline"
                          className="h-11 px-12 rounded-md"
                        >
                          RE-VERIFY
                        </Button>
                        <Button
                          onClick={handleConfirmAddress}
                          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-12 rounded-md"
                        >
                          CONTINUE
                        </Button>
                      </div>
                    </div>
                  )}

                  {!showLocationVerification && !showAddressConfirmation && (
                    <div className="mt-12 border float-right items-end">
                      <Button
                        variant={"default"}
                        onClick={handleNext}
                        disabled={!isCurrentStepValid()}
                        className="px-8 py-3 w-xs h-12 text-white dark:text-black text-md font-smeibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save and Continue
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Store Details - Second Part */}
              {currentStep === 2 && (
                <div>
                  <div className="bg-white rounded-lg p-8 dark:bg-[#303030]">
                    <div>
                      <div>
                        <h2 className="text-xl font-semibold mb-3">
                          Store Details
                        </h2>
                        <p className="text-sm text-[#303030] mb-8">
                          This is how your shop will appear to buyers. Keep it
                          clear and memorable.
                        </p>

                        <div className="space-y-5">
                          <div>
                            <Label className="mb-2 block">
                              Store Description{" "}
                              <RequiredFieldIndicator
                                completed={!!formData.storeDescription?.trim()}
                              />
                            </Label>
                            <TextEditor
                              value={formData.storeDescription}
                              onChange={handleStoreDescriptionChange}
                              placeholder="Start writing your amazing content..."
                              className="mb-4"
                            />
                          </div>

                          {/* Video Upload Section */}
                          <div className="border-t pt-6">
                            <h2 className="text-xl font-semibold mb-2">
                              Share Your Story
                            </h2>
                            <p className="text-[#303030] text-sm mb-6">
                              We'd love to hear your story. Record a short video
                              introducing yourself and your business—this helps
                              buyers connect with the real person behind the
                              products.
                            </p>

                            <VideoUpload
                              onVideoChange={handleVideoChange}
                              maxSize={100}
                              className="w-full"
                              bucket="vendor-assets"
                              folder="seller-stories"
                              initialUrl={formData.videoUrl || undefined}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-12 border float-right items-end">
                    <Button
                      variant={"default"}
                      onClick={handleNext}
                      disabled={!isCurrentStepValid()}
                      className="px-8 py-3 w-xs h-12 text-white dark:text-black text-md font-smeibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save and Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Bank Details */}
              {currentStep === 3 && (
                <div>
                  <div className="bg-white p-6 rounded-md mt-6 dark:bg-[#303030]">
                    <div>
                      <h2 className="text-xl font-semibold mb-3">
                        Bank Details
                      </h2>
                      <p className="text-sm text-[#303030] mb-8">
                        Share your bank details so we can send your earnings
                        securely and on time.
                      </p>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>
                              Account Holder Name{" "}
                              <RequiredFieldIndicator
                                completed={!!formData.accountHolderName?.trim()}
                              />
                            </Label>
                            <Input
                              placeholder="e.g Your Fit"
                              className="h-11"
                              value={formData.accountHolderName}
                              onChange={(e) =>
                                handleChange(
                                  "accountHolderName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              Bank Name{" "}
                              <RequiredFieldIndicator
                                completed={!!formData.bankName?.trim()}
                              />
                            </Label>
                            <Input
                              placeholder="e.g Equity Bank"
                              className="h-11"
                              value={formData.bankName}
                              onChange={(e) =>
                                handleChange("bankName", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>
                              Account Number{" "}
                              <RequiredFieldIndicator
                                completed={
                                  !!formData.accountNumber?.trim() &&
                                  !errors.accountNumber
                                }
                              />
                            </Label>
                            <Input
                              placeholder="Enter account number"
                              className="h-11"
                              value={formData.accountNumber}
                              onChange={(e) =>
                                handleChange("accountNumber", e.target.value)
                              }
                              onBlur={() => handleBlur("accountNumber")}
                            />
                            {accountNumberStatus && (
                              <div
                                className={`flex items-center gap-1 text-xs ${
                                  accountNumberStatus.type === "error"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {accountNumberStatus.type === "error" ? (
                                  <AlertCircle className="w-3 h-3" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                <span>{accountNumberStatus.message}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>
                              Repeat Account Number{" "}
                              <RequiredFieldIndicator
                                completed={
                                  !!formData.confirmAccountNumber?.trim() &&
                                  formData.accountNumber ===
                                    formData.confirmAccountNumber
                                }
                              />
                            </Label>
                            <Input
                              placeholder="Confirm account number"
                              className="h-11"
                              value={formData.confirmAccountNumber}
                              onChange={(e) =>
                                handleChange(
                                  "confirmAccountNumber",
                                  e.target.value
                                )
                              }
                              onBlur={() => handleBlur("confirmAccountNumber")}
                            />
                            {confirmAccountNumberStatus && (
                              <div
                                className={`flex items-center gap-1 text-xs ${
                                  confirmAccountNumberStatus.type === "error"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {confirmAccountNumberStatus.type === "error" ? (
                                  <AlertCircle className="w-3 h-3" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                <span>
                                  {confirmAccountNumberStatus.message}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Swift Code (Optional)</Label>
                            <Input
                              placeholder="Enter swift code"
                              className="h-11"
                              value={formData.swiftCode}
                              onChange={(e) =>
                                handleChange("swiftCode", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Validation Summary */}
                        {isBankDetailsComplete && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-medium">
                                All bank details are complete and valid
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-12 border float-right items-end">
                    <Button
                      variant={"default"}
                      onClick={handleNext}
                      disabled={!isCurrentStepValid()}
                      className="px-8 py-3 w-xs h-12 text-white dark:text-black text-md font-smeibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save and Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Preview */}
              {currentStep === 4 && (
                <div>
                  <div className="bg-white p-6 rounded-md mt-6 dark:bg-[#303030]">
                    <div className="space-y-8">
                      {/* Review Header */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                        <div className="flex items-center">
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <div className="ml-4">
                            <h2 className="text-xl font-semibold text-green-800 dark:text-green-300">
                              Ready to Submit Vendor Application
                            </h2>
                            <p className="text-green-700 dark:text-green-400 mt-1">
                              Please review all information below. Once
                              submitted, the application will be processed.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <Card className="shadow-none">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-[#CC5500]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span>Full Name</span>
                              </div>
                              <p className="font-medium">
                                {formData.firstName} {formData.middleName}{" "}
                                {formData.lastName}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>Email Address</span>
                              </div>
                              <p className="font-medium">{formData.email}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                <span>Phone Number</span>
                              </div>
                              <p className="font-medium">
                                {formData.countryCode} {formData.phoneNumber}
                              </p>
                            </div>
                          </div>

                          {/* Identity Verification Images */}
                          <div className="pt-4 border-t">
                            <h3 className="text-md font-semibold mb-4">
                              Identity verification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {formData.identityDocumentUrls &&
                              formData.identityDocumentUrls.length > 0 ? (
                                formData.identityDocumentUrls.map(
                                  (url: string, index: number) => (
                                    <div
                                      key={index}
                                      className="border rounded-lg overflow-hidden aspect-video bg-gray-50 dark:bg-gray-800 relative group"
                                    >
                                      <img
                                        src={url}
                                        alt={`Identity document ${index + 1}`}
                                        className="w-full h-full object-contain"
                                      />
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                      >
                                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                                          View Document
                                        </div>
                                      </a>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="col-span-2 text-gray-400 text-center py-8">
                                  No identity documents uploaded
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Shop Details */}
                      <Card className="shadow-none">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-[#CC5500]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            Shop Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                <span>Shop Name</span>
                              </div>
                              <p className="font-medium">
                                {formData.storeName}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span>Country</span>
                              </div>
                              <p className="font-medium">
                                {getCountryName(formData.country)}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span>City</span>
                              </div>
                              <p className="font-medium">{formData.city}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span>District</span>
                              </div>
                              <p className="font-medium">
                                {formData.district || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Verified Location */}
                          {formData.gpsCoordinates && (
                            <div className="pt-4 border-t">
                              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                Verified Location
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  ✓ Verified
                                </span>
                              </h3>
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                <p className="text-sm">
                                  {formData.streetName && (
                                    <span>{formData.streetName}</span>
                                  )}
                                  {formData.streetName &&
                                    formData.additionalAddress &&
                                    ", "}
                                  {formData.additionalAddress && (
                                    <span>{formData.additionalAddress}</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  GPS:{" "}
                                  {formData.gpsCoordinates.latitude.toFixed(6)},{" "}
                                  {formData.gpsCoordinates.longitude.toFixed(6)}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Store Description */}
                      <Card className="shadow-none">
                        <CardHeader>
                          <CardTitle>Store description</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: formData.storeDescription,
                            }}
                          />
                          {!formData.storeDescription && (
                            <p className="text-gray-400 italic">
                              No store description provided
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Seller Story */}
                      <Card className="shadow-none">
                        <CardHeader>
                          <CardTitle>Seller story</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {formData.videoUrl ? (
                            <div className="space-y-4">
                              <video
                                className="border w-full rounded-md max-h-[300px]"
                                controls
                                src={formData.videoUrl}
                              />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Click play to preview your seller story video
                              </p>
                            </div>
                          ) : (
                            <div className="border w-full h-64 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <p className="mb-2">No video uploaded</p>
                                <p className="text-sm">
                                  Seller story video is optional
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Bank Details */}
                      <Card className="shadow-none">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-[#CC5500]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            Bank Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span>Account Holder Name</span>
                              </div>
                              <p className="font-medium">
                                {formData.accountHolderName}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                <span>Bank Name</span>
                              </div>
                              <p className="font-medium">
                                {formData.bankName || "N/A"}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                  />
                                </svg>
                                <span>Account Number</span>
                              </div>
                              <p className="font-medium">
                                {formData.accountNumber
                                  ? "•".repeat(formData.accountNumber.length)
                                  : "N/A"}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#303030] dark:text-gray-400">
                                <svg
                                  className="w-4 h-4 text-[#CC5500]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                  />
                                </svg>
                                <span>Swift Code</span>
                              </div>
                              <p className="font-medium">
                                {formData.swiftCode || "N/A"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-12 border float-right items-end">
                    <Button
                      variant={"default"}
                      onClick={handleSubmit}
                      className="px-8 py-3 w-xs h-12 text-white dark:text-black text-md font-smeibold"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
