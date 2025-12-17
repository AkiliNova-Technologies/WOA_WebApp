import { useState } from "react";
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

// Define the form data type
export interface FormData {
  // Step1 data - Personal Info & Identity Verification
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  identityDocuments: any[];
  step1Completed: boolean;

  // Step2 data - Shop Setup
  storeName: string;
  country: string;
  city: string;
  district: string;
  streetName: string;
  additionalAddress: string;
  emailVerified: boolean;
  step2Completed: boolean;

  // Step3 data - Store Description & Seller Story
  storeDescription: string;
  videoFile: File | null;
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
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+256",
    identityDocuments: [],
    emailVerified: false,
    step1Completed: false,
    storeName: "",
    country: "",
    city: "",
    district: "",
    streetName: "",
    additionalAddress: "",
    step2Completed: false,
    storeDescription: "",
    videoFile: null,
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

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };

      // Check which step is being updated and mark it as completed if all required fields are filled
      if (
        newData.firstName !== undefined ||
        newData.lastName !== undefined ||
        newData.email !== undefined ||
        newData.phoneNumber !== undefined
      ) {
        const step1Complete = Boolean(
          updated.firstName &&
            updated.lastName &&
            updated.email &&
            updated.phoneNumber
        );
        updated.step1Completed = step1Complete;
        if (step1Complete && !completedSteps.includes(1)) {
          setCompletedSteps((prev) => [...prev, 1]);
        }
      }

      if (
        newData.storeName !== undefined ||
        newData.country !== undefined ||
        newData.city !== undefined ||
        newData.district !== undefined
      ) {
        const step2Complete = Boolean(
          updated.storeName &&
            updated.country &&
            updated.city &&
            updated.district
        );
        updated.step2Completed = step2Complete;
        if (step2Complete && !completedSteps.includes(2)) {
          setCompletedSteps((prev) => [...prev, 2]);
        }
      }

      if (newData.storeDescription !== undefined) {
        const step3Complete = Boolean(
          updated.storeDescription.trim().length > 0
        );
        updated.step3Completed = step3Complete;
        if (step3Complete && !completedSteps.includes(3)) {
          setCompletedSteps((prev) => [...prev, 3]);
        }
      }

      if (
        newData.accountHolderName !== undefined ||
        newData.accountNumber !== undefined ||
        newData.confirmAccountNumber !== undefined
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

  const handleEmailVerified = () => {
    // This callback is called after successful email verification
    console.log("Email verified successfully!");
    // You can add any additional logic here, like showing a success message
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to:
    // 1. Current step (always allowed)
    // 2. Previously completed steps (always allowed)
    // 3. Next step only if current step is completed
    if (stepIndex === current) return;

    if (stepIndex < current) {
      // Going back to previous steps is always allowed
      setCurrent(stepIndex);
    } else if (stepIndex === current + 1) {
      // Going to next step is allowed if current step is completed
      if (isStepCompleted(current)) {
        setCurrent(stepIndex);
        if (!completedSteps.includes(stepIndex)) {
          setCompletedSteps((prev) => [...prev, stepIndex]);
        }
      }
    } else if (completedSteps.includes(stepIndex)) {
      // Jumping to any previously completed step is allowed
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

  const saveAndContinue = () => {
    if (current < steps.length - 1) {
      // Mark current step as completed
      const currentStepKey = `step${current + 1}Completed` as keyof FormData;
      const updateData = { [currentStepKey]: true } as Partial<FormData>;
      updateFormData(updateData);

      // Add to completed steps if not already there
      if (!completedSteps.includes(current)) {
        setCompletedSteps((prev) => [...prev, current]);
      }

      // Move to next step
      setCurrent(current + 1);
      if (!completedSteps.includes(current + 1)) {
        setCompletedSteps((prev) => [...prev, current + 1]);
      }
    }
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log("Submitting form data:", formData);
    updateFormData({ step5Completed: true });

    // Show success/verification step
    setCurrent(steps.length); // Move to done step
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <Step1
            formData={formData}
            updateFormData={updateFormData}
            onEmailVerified={handleEmailVerified}
          />
        );
      case 1:
        return <Step2 formData={formData} updateFormData={updateFormData} />;
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
              {/* Header Section */}
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
                {/* What we're doing */}
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

                {/* What's next */}
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

              {/* Back to Website Button */}
              <div className="text-center">
                <Button
                  className="bg-black hover:bg-black/90 text-white h-11 px-8 rounded-md"
                  onClick={() => navigate("/vendor")}
                >
                  Back to Website
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const getButtonText = () => {
    if (current === steps.length - 1) return "Submit";
    return "Save and continue";
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
        return !formData.step1Completed;
      case 1:
        return !formData.step2Completed;
      case 2:
        return !formData.step3Completed;
      case 3:
        return !formData.step4Completed;
      case 4:
        return false; // Preview step doesn't need validation
      default:
        return true;
    }
  };

  return (
    <div className="px-4 md:px-16 pt-32 md:pt-40 pb-20 min-h-screen dark:bg-[#121212]">
      {/* Custom Steps Component - Now clickable for navigation */}
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

        {/* Save and Continue Button Only */}
        {current < steps.length && (
          <div className="flex flex-col items-center justify-center gap-4 mt-8 pt-6 border-t">
            <div className="flex items-center gap-4 w-full justify-center">
              {current < steps.length - 1 && (
                <p className="text-sm text-gray-500 text-center max-w-2xl">
                  By clicking Save and continue, you agree to World of Afrika's{" "}
                  <span className="underline cursor-pointer">Terms of Use</span>
                  , <span className="underline cursor-pointer">Cookies</span>{" "}
                  and{" "}
                  <span className="underline cursor-pointer">
                    Privacy Policy
                  </span>
                </p>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={handleButtonClick}
              disabled={isSaveButtonDisabled()}
              className="bg-black hover:bg-black/90 text-white h-11 px-8 w-auto disabled:opacity-50 disabled:cursor-not-allowed rounded-md mt-4"
            >
              {getButtonText()}
            </Button>
          </div>
        )}

        {/* Submit button for preview page */}
        {current === steps.length - 1 && (
          <div className="flex flex-col items-center justify-center gap-4 mt-8 pt-6 border-t">
            <div className="flex items-center gap-4 w-full justify-center">
              <p className="text-sm text-gray-500 text-center max-w-2xl">
                By clicking submit, you agree to World of Afrika's{" "}
                <span className="underline cursor-pointer">Terms of Use</span>,{" "}
                <span className="underline cursor-pointer">Cookies</span> and{" "}
                <span className="underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              className="bg-black hover:bg-black/90 text-white h-11 px-8 w-auto rounded-md mt-4"
            >
              Submit
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
