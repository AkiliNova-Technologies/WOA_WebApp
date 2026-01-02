import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Steps } from "@/components/steps";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import { CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/utils/api";
import kycApi from "@/utils/kyc-api";

// Define the form data type
export interface FormData {
  // Step1 data - Personal Info & Identity Verification
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  identityDocumentUrls: string[];
  emailVerified: boolean;
  step1Completed: boolean;

  // Step2 data - Shop Setup
  storeName: string;
  country: string;
  city: string;
  district: string;
  streetName: string;
  additionalAddress: string;
  locationVerified: boolean;
  gpsCoordinates?: { latitude: number; longitude: number };
  step2Completed: boolean;

  // Step3 data - Store Description & Seller Story
  storeDescription: string;
  videoUrl: string | null;
  step3Completed: boolean;

  // Step4 data - Bank Details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  swiftCode: string;
  step4Completed: boolean;

  // Step5 data - Preview
  step5Completed: boolean;
}

const steps = [
  {
    title: "Setup your account",
    content: "step1",
  },
  {
    title: "Setup your shop",
    content: "step2",
  },
  {
    title: "What do you sell",
    content: "step3",
  },
  {
    title: "Bank details",
    content: "step4",
  },
  {
    title: "Preview and submit",
    content: "step5",
  },
];

export default function StepsContainer() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestEmailVerification, setRequestEmailVerification] = useState(false);
  const [_kycSessionId, setKycSessionId] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<
    "draft" | "email_pending" | "email_verified" | "submitted"
  >("draft");
  const [isStartingKYC, setIsStartingKYC] = useState(false);
  const [_isLoading, setIsLoading] = useState(true); 

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+256",
    identityDocumentUrls: [],
    emailVerified: false,
    step1Completed: false,
    storeName: "",
    country: "",
    city: "",
    district: "",
    streetName: "",
    additionalAddress: "",
    locationVerified: false,
    step2Completed: false,
    storeDescription: "",
    videoUrl: null,
    step3Completed: false,
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    swiftCode: "",
    step4Completed: false,
    step5Completed: false,
  });

  // Track completed steps
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  // const [authRequired, setAuthRequired] = useState(false);

  // Check existing KYC status on component mount
  useEffect(() => {
    const checkExistingKYCStatus = async () => {
      setIsLoading(true);
      try {
        const response = await kycApi.get("/api/v1/vendor/kyc");
        if (response.data) {
          setKycStatus(response.data.kycStatus);
          
          // If KYC is already submitted, redirect or show message
          if (response.data.kycStatus === 'submitted' || response.data.kycStatus === 'approved') {
            toast.info('Your KYC has already been submitted and is under review');
            navigate('/dashboard', { replace: true });
            return;
          }
          
          if (response.data.emailVerified) {
            updateFormData({
              emailVerified: true,
              email: response.data.email || formData.email,
            });
          }
          if (response.data.email) {
            updateFormData({ email: response.data.email });
          }
          if (response.data.sessionId) {
            setKycSessionId(response.data.sessionId);
          }
        }
      } catch (error: any) {
        console.log("No existing KYC session or error checking status:", error);
        
        // Handle 401 Unauthorized specifically
        if (error.response?.status === 401) {
          console.log('Authentication required for KYC');
          // setAuthRequired(true);
        }
        
        // For other errors, just continue (user might not have started KYC yet)
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingKYCStatus();
  }, []);

  // Load saved KYC data from localStorage
  useEffect(() => {
    const savedKycData = localStorage.getItem('kycDraftData');
    if (savedKycData) {
      try {
        const parsedData = JSON.parse(savedKycData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        localStorage.removeItem('kycDraftData');
      } catch (error) {
        console.error('Error loading saved KYC data:', error);
      }
    }
  }, []);

  // const handleAuthRequired = () => {
  //   // Store current KYC data before redirecting
  //   localStorage.setItem('kycDraftData', JSON.stringify(formData));
    
  //   navigate('/auth/login', {
  //     state: {
  //       from: '/vendor/kyc',
  //       message: 'Please login to continue with KYC',
  //       preserveKycData: true
  //     }
  //   });
  // };

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };

      // Update step 1 completion
      if (
        newData.firstName !== undefined ||
        newData.lastName !== undefined ||
        newData.email !== undefined ||
        newData.phoneNumber !== undefined ||
        newData.emailVerified !== undefined ||
        newData.identityDocumentUrls !== undefined
      ) {
        const step1Complete = Boolean(
          updated.firstName &&
            updated.lastName &&
            updated.email &&
            updated.phoneNumber &&
            updated.emailVerified &&
            updated.identityDocumentUrls &&
            updated.identityDocumentUrls.length >= 2
        );
        updated.step1Completed = step1Complete;
        if (step1Complete && !completedSteps.includes(1)) {
          setCompletedSteps((prev) => [...prev, 1]);
        }
      }

      // Update step 2 completion
      if (
        newData.storeName !== undefined ||
        newData.country !== undefined ||
        newData.city !== undefined ||
        newData.district !== undefined ||
        newData.locationVerified !== undefined
      ) {
        const step2Complete = Boolean(
          updated.storeName &&
            updated.country &&
            updated.city &&
            updated.district &&
            updated.locationVerified
        );
        updated.step2Completed = step2Complete;
        if (step2Complete && !completedSteps.includes(2)) {
          setCompletedSteps((prev) => [...prev, 2]);
        }
      }

      // Update step 3 completion
      if (newData.storeDescription !== undefined && newData.step3Completed === undefined) {
        const step3Complete = Boolean(
          updated.storeDescription.trim().length > 0
        );
        updated.step3Completed = step3Complete;
        if (step3Complete && !completedSteps.includes(3)) {
          setCompletedSteps((prev) => [...prev, 3]);
        }
      }

      // Update step 4 completion
      if (
        (newData.accountHolderName !== undefined ||
        newData.accountNumber !== undefined ||
        newData.confirmAccountNumber !== undefined) &&
        newData.step4Completed === undefined
      ) {
        const step4Complete = Boolean(
          updated.accountHolderName &&
            updated.accountNumber &&
            updated.confirmAccountNumber &&
            updated.accountNumber === updated.confirmAccountNumber
        );
        updated.step4Completed = step4Complete;
        if (step4Complete && !completedSteps.includes(4)) {
          setCompletedSteps((prev) => [...prev, 4]);
        }
      }

      return updated;
    });
  };

  // Start KYC process with backend (Step 1 according to backend flow)
  const startKYCProcess = async () => {
    try {
      setIsStartingKYC(true);

      // Call the backend endpoint to start KYC
      const response = await api.post("/api/v1/vendor/kyc/start", {
        email: formData.email,
        phone_number: formData.phoneNumber,
      });

      if (response.data.otpSent) {
        setKycSessionId(response.data.sessionId);
        setKycStatus("email_pending");
        setRequestEmailVerification(true);
        toast.success("Verification code sent to your email");
      } else {
        toast.error("Failed to send verification code");
      }
    } catch (error: any) {
      console.error("Error starting KYC:", error);
      
      // Handle 401 specifically
      if (error.response?.status === 401) {
        // setAuthRequired(true);
        toast.error("Your session has expired. Please login again.");
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to start KYC process"
        );
      }
      throw error;
    } finally {
      setIsStartingKYC(false);
    }
  };

  const handleEmailVerified = () => {
    console.log("Email verified successfully!");
    updateFormData({ emailVerified: true });
    setKycStatus("email_verified");
    toast.success("Email verified successfully!");
  };

  const handleLocationVerified = (coordinates: {
    latitude: number;
    longitude: number;
  }) => {
    console.log("Location verified successfully!", coordinates);
    updateFormData({
      locationVerified: true,
      gpsCoordinates: coordinates,
    });
    toast.success("Location verified successfully!");
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex === current) return;

    // Prevent navigating to steps that require email verification
    if (stepIndex > 0 && !formData.emailVerified) {
      toast.error("Please complete email verification first");
      return;
    }

    if (stepIndex < current) {
      setCurrent(stepIndex);
    } else if (stepIndex === current + 1) {
      if (isStepCompleted(current)) {
        setCurrent(stepIndex);
        if (!completedSteps.includes(stepIndex)) {
          setCompletedSteps((prev) => [...prev, stepIndex]);
        }
      }
    } else if (completedSteps.includes(stepIndex)) {
      setCurrent(stepIndex);
    }
  };

  const isStepCompleted = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return formData.step1Completed;
      case 1:
        return formData.step2Completed;
      case 2:
        return formData.step3Completed;
      case 3:
        return formData.step4Completed;
      case 4:
        return formData.step5Completed;
      default:
        return false;
    }
  };

  const saveAndContinue = async () => {
    // Special handling for Step 1 - trigger email verification
    if (current === 0 && !formData.emailVerified) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phoneNumber
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (
        !formData.identityDocumentUrls ||
        formData.identityDocumentUrls.length < 2
      ) {
        toast.error("Please upload both front and back of your ID");
        return;
      }

      // 🔑 Start KYC process with backend (email verification only)
      await startKYCProcess();
      return;
    }

    // For other steps, proceed normally
    if (current < steps.length - 1) {
      const currentStepKey = `step${current + 1}Completed` as keyof FormData;
      const updateData = { [currentStepKey]: true } as Partial<FormData>;
      updateFormData(updateData);

      if (!completedSteps.includes(current)) {
        setCompletedSteps((prev) => [...prev, current]);
      }

      setCurrent(current + 1);
      if (!completedSteps.includes(current + 1)) {
        setCompletedSteps((prev) => [...prev, current + 1]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate all required fields
      if (!formData.emailVerified) {
        toast.error("Please verify your email first");
        return;
      }

      // Create JSON object with all data according to backend requirements
      const kycData = {
        // Personal Information
        first_name: formData.firstName,
        middle_name: formData.middleName || undefined,
        last_name: formData.lastName,
        phone_number: `${formData.countryCode}${formData.phoneNumber}`,
        id_docs: formData.identityDocumentUrls,

        // Business Information
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

        // Bank Details
        account_name: formData.accountHolderName,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        swift_code: formData.swiftCode || undefined,
      };

      // Submit full KYC to the new endpoint
      await api.post("/api/v1/vendor/kyc/submit", {
        ...kycData,
        email: formData.email, // Include email to match with verified user
      });

      // Update local state
      updateFormData({ step5Completed: true });
      setKycStatus("submitted");
      toast.success("KYC submitted successfully!");

      // Show success/verification step
      setCurrent(steps.length);
    } catch (error: any) {
      console.error("Failed to submit KYC:", error);
      
      // Handle 401 specifically
      if (error.response?.status === 401) {
        // setAuthRequired(true);
        toast.error("Your session has expired. Please login again.");
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Failed to submit KYC. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <Step1
            formData={formData}
            updateFormData={updateFormData}
            onEmailVerified={handleEmailVerified}
            requestVerification={requestEmailVerification}
            onVerificationStarted={() => setRequestEmailVerification(false)}
            kycStatus={kycStatus}
          />
        );
      case 1:
        return (
          <Step2
            formData={formData}
            updateFormData={updateFormData}
            onLocationVerified={handleLocationVerified}
          />
        );
      case 2:
        return <Step3 formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step4 formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step5 formData={formData} />;
      default:
        return (
          <Card className="shadow-none border-none p-0">
            <CardContent className="space-y-8 border-none">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <Clock className="w-10 h-10 text-[#303030]" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verification in Progress
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm dark:text-gray-300">
                  Your application has been successfully submitted. This usually
                  takes 1–3 business days.
                </p>
              </div>

              <div className="gap-8 max-w-4xl mx-auto">
                <div className="space-y-4 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    What we're doing
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Identity Document Verification
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">
                          We're reviewing your details to make sure everything
                          checks out.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Store Information Verification
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          We're reviewing your details to make sure everything
                          checks out.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    What's next
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Once approved, you'll be able to start listing products
                        and receiving orders.
                      </p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        In the meantime, feel free to explore seller resources
                        or prepare your first listings
                      </p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        You'll receive an update via email or SMS once your
                        store is verified and ready to go.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  className="bg-black hover:bg-black/90 text-white h-11 px-8 rounded-md"
                  onClick={() => navigate("/")}
                >
                  Back to Website
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const handleButtonClick = () => {
    if (current === steps.length - 1) {
      handleSubmit();
    } else {
      saveAndContinue();
    }
  };

  const isSaveButtonDisabled = () => {
    switch (current) {
      case 0:
        // For step 1, check if basic fields are filled
        if (!formData.emailVerified) {
          // Before email verification
          return (
            !(
              formData.firstName &&
              formData.lastName &&
              formData.email &&
              formData.phoneNumber &&
              formData.identityDocumentUrls &&
              formData.identityDocumentUrls.length >= 2
            ) || isStartingKYC
          );
        } else {
          // After email verification
          return false;
        }
      case 1:
        return !formData.step2Completed || !formData.emailVerified;
      case 2:
        return !formData.step3Completed || !formData.emailVerified;
      case 3:
        return !formData.step4Completed || !formData.emailVerified;
      case 4:
        return !formData.emailVerified; // Can't submit without email verification
      default:
        return true;
    }
  };

  return (
    <div className="px-4 md:px-16 pt-32 md:pt-40 pb-20 min-h-screen dark:bg-[#121212]">
      <Steps
        current={current}
        items={steps}
        onChange={handleStepClick}
        direction="horizontal"
        responsive={true}
        contentAlignment="center"
        completedSteps={completedSteps}
      />

      <Card className="p-6 md:p-8 shadow-none border mx-auto my-8 max-w-7xl">
        <div>{renderStepContent()}</div>

        {/* Button section for steps 1-4 */}
        {current < steps.length - 1 && (
          <div className="flex flex-row items-center justify-end gap-12 mt-8 pt-6 border-t">
            <div className="flex items-center gap-4 justify-center">
              <p className="text-sm text-gray-500 text-center max-w-2xl">
                By clicking Save and continue, you agree to World of Afrika's{" "}
                <span className="underline cursor-pointer">Terms of Use</span>,{" "}
                <span className="underline cursor-pointer">Cookies</span> and{" "}
                <span className="underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={handleButtonClick}
              disabled={isSaveButtonDisabled() || isSubmitting}
              className="bg-black hover:bg-black/90 text-white h-11 px-8 w-auto disabled:opacity-50 disabled:cursor-not-allowed rounded-md mt-4"
            >
              {isSubmitting
                ? "Submitting..."
                : isStartingKYC
                ? "Starting KYC..."
                : "Save and continue"}
            </Button>
          </div>
        )}

        {/* Button section for step 5 only */}
        {current === steps.length - 1 && (
          <div className="flex flex-row items-center justify-end gap-12 mt-8 pt-6 border-t">
            <div className="flex items-center gap-4 justify-center">
              <p className="text-sm text-gray-500 text-center max-w-2xl">
                By clicking submit, you agree to World of Afrika's{" "}
                <span className="underline cursor-pointer">Terms of Use</span>,{" "}
                <span className="underline cursor-pointer">Cookies</span> and{" "}
                <span className="underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.emailVerified}
              className="bg-black hover:bg-black/90 text-white h-11 px-8 w-auto rounded-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}