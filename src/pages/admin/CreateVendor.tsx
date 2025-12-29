import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";

// Helper function to format email for display
const formatEmailForDisplay = (email: string): string => {
  if (!email) return "";
  if (email.length <= 25) return email;
  const [localPart, domain] = email.split("@");
  if (localPart.length > 15) {
    return `${localPart.substring(0, 12)}...@${domain}`;
  }
  return email;
};

// Form Data Interface
interface FormDataState {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  emailVerified: boolean;

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
  videoUrl: string | null;
  gpsCoordinates?: { latitude: number; longitude: number };

  // Bank Details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  swiftCode: string;
}

// Required Field Indicator Component
const RequiredFieldIndicator = ({ completed }: { completed: boolean }) => (
  <span className={`ml-1 ${completed ? "text-green-600" : "text-red-500"}`}>
    {completed ? "✓" : "*"}
  </span>
);

export default function AdminCreateVendorPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email verification states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  // Location verification states
  const [showLocationVerification, setShowLocationVerification] =
    useState(false);
  const [showAddressConfirmation, setShowAddressConfirmation] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState("");
  const [locationProgress, setLocationProgress] = useState(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [bestLocation, setBestLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);

  const steps = [
    { title: "Personal Information" },
    { title: "Store Setup" },
    { title: "Store Description" },
    { title: "Bank Details" },
    { title: "Preview & Submit" },
  ];

  // Initialize form data state
  const [formData, setFormData] = useState<FormDataState>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+256",
    emailVerified: false,
    identityDocuments: [],
    identityDocumentUrls: [],
    storeName: "",
    storeDescription: "",
    country: "",
    city: "",
    district: "",
    streetName: "",
    additionalAddress: "",
    videoUrl: null,
    gpsCoordinates: undefined,
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    swiftCode: "",
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
  });

  const [touched, setTouched] = useState({
    accountNumber: false,
    confirmAccountNumber: false,
  });

  // Countdown timer for resend
  useEffect(() => {
    if (showVerification && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showVerification, timeLeft]);

  // Reset verification attempts when showing verification
  useEffect(() => {
    if (showVerification) {
      setVerificationAttempts(0);
      setVerificationError("");
      setVerificationCode("");
    }
  }, [showVerification]);

  // Auto-verify when all 5 digits are entered
  useEffect(() => {
    if (
      showVerification &&
      verificationCode.length === 5 &&
      !isVerifying &&
      !isAutoVerifying
    ) {
      const timer = setTimeout(() => {
        handleAutoVerify();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [verificationCode, showVerification, isVerifying, isAutoVerifying]);

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

    // Basic account number validation
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
      city: "",
    });
  };

  const handleStoreDescriptionChange = (value: string) => {
    updateFormData({ storeDescription: value });
  };

  const handleInputChange = (field: keyof FormDataState, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleVideoChange = (url: string | null) => {
    updateFormData({ videoUrl: url });
  };

  const handleDocumentsChange = (urls: { front?: string; back?: string }) => {
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

  // Send verification code
  const sendVerificationCode = async () => {
    if (isSendingCode) return;

    console.log("🔵 [EMAIL VERIFICATION] Starting process");
    console.log("🔵 [EMAIL VERIFICATION] Email:", formData.email);

    try {
      setIsSendingCode(true);
      setVerificationError("");
      setVerificationCode("");
      setVerificationAttempts(0);

      console.log("🔵 [EMAIL VERIFICATION] Sending OTP request to API...");

      await api.post("/api/v1/vendor/kyc/email/otp", {
        email: formData.email,
      });

      console.log("✅ [EMAIL VERIFICATION] OTP sent successfully");
      console.log("✅ [EMAIL VERIFICATION] Setting showVerification to true");

      setShowVerification(true);
      setTimeLeft(60);
      toast.success("Verification code sent to email");

      console.log("✅ [EMAIL VERIFICATION] State updated, screen should show");
    } catch (error: any) {
      console.error("❌ [EMAIL VERIFICATION] Error sending OTP:", error);
      console.error(
        "❌ [EMAIL VERIFICATION] Error response:",
        error?.response?.data
      );
      toast.error(
        error?.response?.data?.message || "Failed to send verification code"
      );
      throw error;
    } finally {
      setIsSendingCode(false);
      console.log("🔵 [EMAIL VERIFICATION] Cleanup complete");
    }
  };

  // Auto-verify when code is complete
  const handleAutoVerify = async () => {
    if (verificationCode.length !== 5) {
      return;
    }

    if (verificationAttempts >= 3) {
      setVerificationError("Too many attempts. Please try again later.");
      toast.error("Too many attempts. Please try again later.");
      return;
    }

    setIsVerifying(true);
    setIsAutoVerifying(true);
    setVerificationError("");

    try {
      const response = await api.post("/api/v1/vendor/kyc/email/verify", {
        email: formData.email,
        code: verificationCode,
      });

      if (response.data.emailVerified) {
        updateFormData({ emailVerified: true });
        toast.success("Email verified successfully!");
        setShowVerification(false);
      } else {
        throw new Error("Email verification failed");
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      setVerificationAttempts((prev) => prev + 1);
      const errorMessage =
        error?.response?.data?.message ||
        "Invalid verification code. Please try again.";
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
      setIsAutoVerifying(false);
    }
  };

  // Manual verify fallback
  const handleManualVerify = async () => {
    await handleAutoVerify();
  };

  // Resend verification code
  const handleResend = async () => {
    if (timeLeft > 0) {
      const errorMessage = `Please wait ${timeLeft} seconds before resending`;
      setVerificationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (verificationAttempts >= 3) {
      const errorMessage = "Too many attempts. Please try again later.";
      setVerificationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setIsSendingCode(true);

      await api.post("/api/v1/vendor/kyc/email/otp", {
        email: formData.email,
      });

      setTimeLeft(60);
      setVerificationCode("");
      setVerificationError("");
      toast.success("Verification code resent to email");
    } catch (error: any) {
      console.error("Error resending code:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to resend verification code";
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSendingCode(false);
    }
  };

  // Validation helper
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
          formData.identityDocumentUrls.length >= 2 &&
          formData.emailVerified
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

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!formData.firstName?.trim()) {
          toast.error("Please enter first name");
          return false;
        }
        if (!formData.lastName?.trim()) {
          toast.error("Please enter last name");
          return false;
        }
        if (!formData.email?.trim()) {
          toast.error("Please enter email address");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return false;
        }
        if (!formData.phoneNumber?.trim()) {
          toast.error("Please enter phone number");
          return false;
        }
        if (
          !formData.identityDocumentUrls ||
          formData.identityDocumentUrls.length < 2
        ) {
          toast.error("Please upload both front and back of ID");
          return false;
        }
        if (!formData.emailVerified) {
          toast.error("Please verify email before continuing");
          return false;
        }
        return true;

      case 1:
        if (!formData.storeName?.trim()) {
          toast.error("Please enter store name");
          return false;
        }
        if (!formData.country) {
          toast.error("Please select country of operation");
          return false;
        }
        if (!formData.city?.trim()) {
          toast.error("Please enter city of operation");
          return false;
        }
        if (!formData.district?.trim()) {
          toast.error("Please enter district");
          return false;
        }
        if (!formData.gpsCoordinates) {
          toast.error("Please verify shop location before continuing");
          return false;
        }
        return true;

      case 2:
        if (!formData.storeDescription?.trim()) {
          toast.error("Please add a store description");
          return false;
        }
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = formData.storeDescription;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        if (textContent.trim().length < 10) {
          toast.error(
            "Please provide a meaningful store description (at least 10 characters)"
          );
          return false;
        }
        return true;

      case 3:
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
          toast.error("Please confirm account number");
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

      case 4:
        return true;

      default:
        return true;
    }
  };

  const handleNext = async () => {
    // Special handling for Step 0 - trigger email verification if not verified
    if (currentStep === 0 && !formData.emailVerified) {
      if (
        !formData.firstName?.trim() ||
        !formData.lastName?.trim() ||
        !formData.email?.trim() ||
        !formData.phoneNumber?.trim()
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (
        !formData.identityDocumentUrls ||
        formData.identityDocumentUrls.length < 2
      ) {
        toast.error("Please upload both front and back of ID");
        return;
      }

      // Start email verification
      await sendVerificationCode();
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Can't skip ahead without email verification
    if (stepIndex > 0 && !formData.emailVerified) {
      toast.error("Please complete email verification first");
      return;
    }

    if (stepIndex > currentStep) {
      toast.error("Please complete the current step before proceeding");
      return;
    }
    setCurrentStep(stepIndex);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        first_name: formData.firstName,
        middle_name: formData.middleName || undefined,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: `${formData.countryCode}${formData.phoneNumber}`,
        id_docs: formData.identityDocumentUrls,
        store_name: formData.storeName,
        country: formData.country,
        city: formData.city,
        district: formData.district,
        street: formData.streetName || undefined,
        location: formData.gpsCoordinates
          ? `${formData.gpsCoordinates.latitude},${formData.gpsCoordinates.longitude}`
          : undefined,
        description: formData.storeDescription,
        video_story: formData.videoUrl || undefined,
        account_name: formData.accountHolderName,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        swift_code: formData.swiftCode || undefined,
      };

      // TODO: Replace with actual admin endpoint when available
      // await api.post("/api/v1/admin/vendors/create", payload);

      console.log("Vendor creation payload:", payload);

      toast.success("Vendor created successfully!");
      navigate("/vendors");
    } catch (error: any) {
      console.error("Failed to create vendor:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to create vendor. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const reverseGeocode = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

      const data = await response.json();

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

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              "User-Agent": "ShopRegistration/1.0",
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

  const handleContinueToLocationVerification = () => {
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

    const COLLECTION_DURATION = 8000;
    const PROGRESS_INTERVAL = 100;
    const startTime = Date.now();
    let watchId: number;
    let progressInterval: NodeJS.Timeout;

    let currentBestLocation: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: number;
    } | null = null;

    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / COLLECTION_DURATION) * 100, 100);
      setLocationProgress(progress);
    }, PROGRESS_INTERVAL);

    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setCurrentAccuracy(newLocation.accuracy);

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

      setTimeout(async () => {
        clearInterval(progressInterval);
        navigator.geolocation.clearWatch(watchId);
        setLocationProgress(100);

        if (currentBestLocation) {
          try {
            const address = await reverseGeocode(
              currentBestLocation.latitude,
              currentBestLocation.longitude
            );

            setDetectedAddress(address);

            const coordinates = {
              latitude: currentBestLocation.latitude,
              longitude: currentBestLocation.longitude,
            };
            updateFormData({ gpsCoordinates: coordinates });

            toast.success(
              `Location captured with ${currentBestLocation.accuracy.toFixed(
                0
              )}m accuracy`
            );

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
              {/* Step 0: Personal Information */}
              {currentStep === 0 && (
                <div className="bg-white rounded-lg p-6 dark:bg-[#303030]">
                  {!showVerification ? (
                    <>
                      {/* Personal Information Section */}
                      <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-2">
                          Personal Information
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          Enter the vendor's personal information. This
                          information will be used for verification purposes
                          only.
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
                              disabled={formData.emailVerified}
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
                              disabled={formData.emailVerified}
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
                              disabled={formData.emailVerified}
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
                              disabled={formData.emailVerified}
                            />
                            {formData.emailVerified && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Email verified
                              </p>
                            )}
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
                              disabled={formData.emailVerified}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Identity Verification Section */}
                      <div className="border-t pt-8">
                        <h2 className="text-xl font-semibold mb-2">
                          Identity Verification{" "}
                          <RequiredFieldIndicator
                            completed={
                              formData.identityDocumentUrls &&
                              formData.identityDocumentUrls.length >= 2
                            }
                          />
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          Upload clear images of both the front and back of the
                          vendor's valid ID—National ID, Driving Permit, or
                          Passport.
                        </p>

                        <IdentityUpload
                          onDocumentsChange={handleDocumentsChange}
                          maxSize={1}
                          documentType="national_id"
                          bucket="world_of_afrika"
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

                        <div className="mt-6">
                          <h3 className="text-md font-semibold mb-2">Note</h3>
                          <p className="text-sm text-[#303030] dark:text-gray-400">
                            Documents are encrypted and stored securely. Only
                            used for verification purposes.
                          </p>
                        </div>
                      </div>

                      <div className="mt-12 flex justify-end">
                        <Button
                          variant={"default"}
                          onClick={handleNext}
                          disabled={
                            !(
                              formData.firstName?.trim() &&
                              formData.lastName?.trim() &&
                              formData.email?.trim() &&
                              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                formData.email
                              ) &&
                              formData.phoneNumber?.trim() &&
                              formData.identityDocumentUrls?.length >= 2
                            ) || isSendingCode
                          }
                          className="px-8 py-3 h-12 text-white dark:text-black text-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingCode
                            ? "Starting..."
                            : formData.emailVerified
                            ? "Save and Continue"
                            : "Verify Email"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Email Verification Screen
                    <div className="flex flex-col items-center justify-center min-h-[600px] dark:bg-[#121212]">
                      <div className="w-full max-w-xl">
                        <div className="flex flex-col items-center mb-3">
                          <img
                            src={images.VerifyIMG}
                            alt="checking email image"
                            className="h-52 w-52 object-contain"
                          />
                          <h2 className="text-2xl font-semibold text-gray-800 text-center mt-4 dark:text-white">
                            Check email
                          </h2>
                          <p className="text-sm text-gray-500 mt-1 text-center dark:text-gray-300">
                            Verification code sent to{" "}
                            <span className="text-[#071437] font-medium dark:text-white">
                              {formatEmailForDisplay(formData.email)}
                            </span>
                          </p>

                          {verificationAttempts > 0 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Attempts: {verificationAttempts}/3
                            </p>
                          )}

                          {timeLeft > 0 && (
                            <div className="w-full max-w-xs mt-2">
                              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-1">
                                Resend in {timeLeft}s
                              </p>
                              <Progress
                                value={((60 - timeLeft) / 60) * 100}
                                className="h-1 bg-gray-200 dark:bg-gray-700"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center space-y-4 mb-6">
                          <div className="relative">
                            <InputOTP
                              maxLength={5}
                              value={verificationCode}
                              onChange={(value) => {
                                setVerificationCode(value);
                                if (verificationError) setVerificationError("");
                              }}
                              disabled={isVerifying}
                              autoFocus
                            >
                              <InputOTPGroup>
                                {[...Array(5)].map((_, index) => (
                                  <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="border-gray-300 dark:border-gray-600 h-14 w-12 text-xl"
                                  />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            {isVerifying
                              ? "Verifying code..."
                              : "Enter the 5-digit code (auto-verifies when complete)"}
                          </p>

                          {verificationError && (
                            <p className="text-red-500 text-sm text-center">
                              {verificationError}
                            </p>
                          )}
                        </div>

                        <div className="mb-4">
                          <Button
                            onClick={handleManualVerify}
                            disabled={
                              verificationCode.length !== 5 ||
                              isVerifying ||
                              verificationAttempts >= 3
                            }
                            className="w-full h-11 bg-[#CC5500] hover:bg-[#b04f00] text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify Email"
                            )}
                          </Button>
                          <p className="text-xs text-gray-400 text-center mt-1">
                            Or wait for auto-verification
                          </p>
                        </div>

                        <div className="flex flex-row items-center gap-3 justify-center mb-4">
                          <p className="text-sm text-[#4B5675] dark:text-gray-300">
                            Didn't receive code?
                          </p>
                          <Button
                            type="button"
                            onClick={handleResend}
                            disabled={
                              timeLeft > 0 ||
                              isSendingCode ||
                              verificationAttempts >= 3
                            }
                            className="text-[#1B84FF] text-md bg-transparent border-none hover:bg-transparent p-0 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSendingCode
                              ? "Sending..."
                              : timeLeft > 0
                              ? `Resend (${timeLeft}s)`
                              : verificationAttempts >= 3
                              ? "Too many attempts"
                              : "Resend"}
                          </Button>
                        </div>

                        <div className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowVerification(false)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            disabled={isVerifying || isSendingCode}
                          >
                            Back to form
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Store Setup - Same as before */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg p-6 dark:bg-[#303030]">
                  {!showLocationVerification && !showAddressConfirmation ? (
                    <>
                      <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-2">
                          Shop Information
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          Enter the shop details and verify its physical
                          location.
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
                                placeholder="Enter the city"
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

                      <div className="border-t pt-8">
                        <h2 className="text-xl font-semibold mb-2">
                          Shop Address
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          Enter the shop's physical address details.
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
                              Street name/number/landmark{" "}
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
                              Additional details{" "}
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
                    // Location Verification UI - same as KYC
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

                      <h2 className="text-2xl font-semibold mb-4 text-center">
                        {isVerifyingLocation
                          ? "Verifying location"
                          : "Verify Shop Location"}
                      </h2>

                      {!isVerifyingLocation ? (
                        <>
                          <p className="text-[#303030] dark:text-gray-400 mb-4 text-center max-w-2xl">
                            To verify the shop location, you need to be
                            physically at the shop premises or have access to
                            the device at that location.
                          </p>

                          <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-2xl text-sm">
                            This captures the exact GPS coordinates of the
                            store, helping with delivery accuracy and customer
                            trust.
                          </p>
                        </>
                      ) : (
                        <div className="w-full max-w-md mb-8">
                          <p className="text-[#303030] dark:text-gray-400 mb-4 text-center">
                            Improving location accuracy...
                          </p>

                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                            <div
                              className="bg-[#CC5500] h-2.5 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${locationProgress}%` }}
                            />
                          </div>

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
                            Please keep the device steady for best results
                          </p>
                        </div>
                      )}

                      {!isVerifyingLocation && (
                        <Button
                          onClick={handleVerifyLocation}
                          className="bg-black hover:bg-black/90 text-white h-11 px-12 rounded-md mb-6"
                        >
                          VERIFY LOCATION
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Address Confirmation Screen - same as KYC
                    <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
                      <div className="mb-8">
                        <div className="h-52 w-52 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                          <CheckCircle className="w-24 h-24 text-green-600 dark:text-green-400" />
                        </div>
                      </div>

                      <h2 className="text-2xl font-semibold mb-4 text-center">
                        Confirm Address
                      </h2>

                      <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
                        Please review the shop address details carefully.
                      </p>

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
                            the location.
                          </span>
                        </div>
                      </div>

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
                    <div className="mt-12 flex justify-end">
                      <Button
                        variant={"default"}
                        onClick={handleNext}
                        disabled={!isCurrentStepValid()}
                        className="px-8 py-3 h-12 text-white dark:text-black text-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save and Continue
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Store Description */}
              {currentStep === 2 && (
                <div>
                  <div className="bg-white rounded-lg p-8 dark:bg-[#303030]">
                    <div>
                      <h2 className="text-xl font-semibold mb-3">
                        Store Description
                      </h2>
                      <p className="text-sm text-[#303030] mb-8 dark:text-gray-400">
                        Describe what the store sells and what makes it unique.
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
                            placeholder="Describe the store, products, and what makes it special..."
                            className="mb-4"
                          />
                        </div>

                        {/* Video Upload Section */}
                        <div className="border-t pt-6">
                          <h2 className="text-xl font-semibold mb-2">
                            Seller Story{" "}
                            <span className="text-gray-500 text-sm font-normal">
                              (Optional)
                            </span>
                          </h2>
                          <p className="text-[#303030] text-sm mb-6 dark:text-gray-400">
                            Upload a video introducing the seller and their
                            business story.
                          </p>

                          <VideoUpload
                            onVideoChange={handleVideoChange}
                            maxSize={100}
                            className="w-full"
                            bucket="world_of_afrika"
                            folder="seller-stories"
                            initialUrl={formData.videoUrl || undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-end">
                    <Button
                      variant={"default"}
                      onClick={handleNext}
                      disabled={!isCurrentStepValid()}
                      className="px-8 py-3 h-12 text-white dark:text-black text-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save and Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Bank Details */}
              {currentStep === 3 && (
                <div>
                  <div className="bg-white p-6 rounded-md mt-6 dark:bg-[#303030]">
                    <div>
                      <h2 className="text-xl font-semibold mb-3">
                        Bank Details
                      </h2>
                      <p className="text-sm text-[#303030] mb-8 dark:text-gray-400">
                        Enter the bank account details for payment transfers.
                      </p>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>
                              Account Holder Name{" "}
                              <RequiredFieldIndicator
                                completed={!!formData.accountHolderName?.trim()}
                              />
                            </Label>
                            <Input
                              placeholder="e.g John Doe"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>
                              Swift Code{" "}
                              <span className="text-gray-500">(Optional)</span>
                            </Label>
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
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
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
                  <div className="mt-12 flex justify-end">
                    <Button
                      variant={"default"}
                      onClick={handleNext}
                      disabled={!isCurrentStepValid()}
                      className="px-8 py-3 h-12 text-white dark:text-black text-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save and Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Preview */}
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
                              Ready to Create Vendor Account
                            </h2>
                            <p className="text-green-700 dark:text-green-400 mt-1">
                              Please review all information below before
                              creating the vendor account.
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
                            className="prose prose-sm max-w-none dark:prose-invert"
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
                                Click play to preview the seller story video
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
                  <div className="mt-12 flex justify-end">
                    <Button
                      variant={"default"}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-3 h-12 text-white dark:text-black text-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating Vendor..." : "Create Vendor"}
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
