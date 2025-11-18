import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Steps } from "@/components/steps";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import { CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define the form data type
export interface FormData {
  // Step1 data
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  videoFile: File | null;

  // Step2 data
  identityDocuments: any[];

  // Step3 data
  storeName: string;
  country: string;
  city: string;
  storeDescription: string;
  storeLogo: File | null;

  // Step4 data
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  swiftCode: string;
}

const steps = [
  {
    title: "Identity verification",

    content: "step1",
  },
  {
    title: "Store details",

    content: "step2",
  },
  {
    title: "Bank details",

    content: "step3",
  },
  {
    title: "Preview",
    content: "step4",
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
    videoFile: null,
    identityDocuments: [],
    storeName: "",
    country: "",
    city: "",
    storeDescription: "",
    storeLogo: null,
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    swiftCode: "",
  });

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log("Submitting form data:", formData);
    next(); // Move to done step after submission
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return <Step2 formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <Step3 formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step4 formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step5 formData={formData} />;
      default:
        return (
          <Card className="shadow-none border-0">
            <CardContent className=" space-y-8">
              {/* Header Section */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center">
                    <Clock className="w-10 h-10 text-[#303030]" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Verification in Progress
                </h1>
                <p className="text-gray-600 mx-auto text-sm -mt-2">
                  Your application has been successfully submitted. This usually
                  takes 1–3 business days.
                </p>
              </div>

              <div className=" gap-8 max-w-4xl mx-auto">
                {/* Left Column - What we're doing */}
                <div className="space-y-4 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900">
                    What we're doing
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Identity Document Verification
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          We're reviewing your details to make sure everything
                          checks out.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Store Information Verification
                        </h3>
                        <p className="text-sm text-gray-600">
                          We're reviewing your details to make sure everything
                          checks out.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - What's next */}
                <div className="space-y-4 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900">
                    What's next
                  </h2>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Once approved, you'll be able to start listing products
                        and receiving orders.
                      </p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        In the meantime, feel free to explore seller resources
                        or prepare your first listings.
                      </p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        You'll receive an update via email or SMS once your
                        store is verified and ready to go.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Go to Dashboard Button */}
              <div className="text-center">
                <Button className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-8" onClick={()=> navigate("/seller")}>
                  Go to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const getButtonText = () => {
    if (current === steps.length - 1) return "Submit";
    return "Next";
  };

  const handleButtonClick = () => {
    if (current === steps.length - 1) {
      handleSubmit();
    } else {
      next();
    }
  };

  const isNextDisabled = () => {
    // Add validation logic for each step if needed
    switch (current) {
      case 0:
        // Validate identity verification step
        return false;
      case 1:
        // Validate store details step
        // return !formData.storeName || !formData.country || !formData.city;
        return false;

      case 2:
        // Validate bank details step
        // return !formData.accountHolderName || !formData.bankName || !formData.accountNumber;
        return false;

      default:
        return false;
    }
  };

  return (
    <div className="px-4 md:px-16 pt-32 md:pt-40 pb-20 min-h-screen">
      {/* Custom Steps Component */}
      <Steps
        current={current}
        items={steps}
        onChange={setCurrent}
        direction="horizontal"
        responsive={true}
        contentAlignment="center"
      />

      <Card className="p-6 md:p-8 shadow-none border mx-auto my-8 max-w-7xl">
        <div className="">{renderStepContent()}</div>
        <div className="flex justify-between gap-4 mt-6">
          {current > 0 && current < steps.length && (
            <Button
              variant="outline"
              onClick={() => prev()}
              className="h-11 px-6 md:px-10 bg-[#CCCCCC] hover:bg-[#CCCCCC]/90 text-gray-700"
            >
              Previous Step
            </Button>
          )}

          {/* Spacer to push next button to right when previous button is hidden */}
          {current === 0 && <div />}

          {current < steps.length && (
            <Button
              variant="secondary"
              onClick={handleButtonClick}
              disabled={isNextDisabled()}
              className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-6 md:px-10 w-32 md:w-40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getButtonText()}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
