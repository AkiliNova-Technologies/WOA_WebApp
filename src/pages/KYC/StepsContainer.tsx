import { useState } from "react";
import { Steps } from "antd";
import { Button } from "@/components/ui/button";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import { Card } from "@/components/ui/card";

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
    title: "Business Owner Identity",
    content: "step1",
  },
  {
    title: "Identity verification",
    content: "step2",
  },
  {
    title: "Store details",
    content: "step3",
  },
  {
    title: "Bank details",
    content: "step4",
  },
  {
    title: "Preview",
    content: "step5",
  },
  {
    title: "Done",
    content: "step6",
  },
];

export default function StepsContainer() {
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
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log("Submitting form data:", formData);
    next(); // Move to done step after submission
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return <Step1 formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <Step2 formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step3 formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step4 formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step5 formData={formData} />;
      case 5:
        return <Step5 formData={formData} />
      default:
        return null;
    }
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const getButtonText = () => {
    if (current === 4) return "Submit";
    if (current === 5) return "Done";
    return "Next";
  };

  const handleButtonClick = () => {
    if (current === 4) {
      handleSubmit();
    } else if (current === 5) {
      // Handle done action
      console.log("Process completed");
    } else {
      next();
    }
  };

  return (
    <div className="px-16 pt-40 pb-20 min-h-screen">
      <Steps current={current} items={items} size="default" />
      <Card className="p-8 shadow-none border my-8">
        <div className="">{renderStepContent()}</div>
        <div className="flex justify-between gap-4 mt-6">
          {current > 0 && current < 5 && (
            <Button
              variant="outline"
              onClick={() => prev()}
              className="h-11 px-10 bg-[#CCCCCC] hover:bg-[#CCCCCC]/90"
            >
              Previous Step
            </Button>
          )}
          {current < 5 && (
            <Button
              variant="secondary"
              onClick={handleButtonClick}
              className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-10 w-40"
            >
              {getButtonText()}
            </Button>
          )}
          {current === 5 && (
            <Button
              variant="secondary"
              onClick={handleButtonClick}
              className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-10"
            >
              Done
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}