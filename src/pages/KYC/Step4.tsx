import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormData } from "./StepsContainer";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Step4Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step4({ formData, updateFormData }: Step4Props) {
  const [accountNumbersMatch, setAccountNumbersMatch] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if account numbers match whenever they change
    if (formData.accountNumber && formData.confirmAccountNumber) {
      const match = formData.accountNumber === formData.confirmAccountNumber;
      setAccountNumbersMatch(match);
      
      if (!match) {
        setValidationErrors(prev => ({
          ...prev,
          confirmAccountNumber: "Account numbers do not match"
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmAccountNumber;
          return newErrors;
        });
      }
    } else if (formData.accountNumber && !formData.confirmAccountNumber) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmAccountNumber;
        return newErrors;
      });
    }
  }, [formData.accountNumber, formData.confirmAccountNumber]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Auto-mark step as completed when all required fields are filled
    if (field === 'accountHolderName' || field === 'accountNumber' || field === 'confirmAccountNumber') {
      const isStepComplete = Boolean(
        formData.accountHolderName && 
        formData.accountNumber && 
        formData.confirmAccountNumber && 
        formData.accountNumber === formData.confirmAccountNumber
      );
      
      // Only update if it's not already set to true to avoid infinite loops
      if (isStepComplete && !formData.step4Completed) {
        updateFormData({ step4Completed: true });
      } else if (!isStepComplete && formData.step4Completed) {
        updateFormData({ step4Completed: false });
      }
    }
  };

  const validateAccountNumber = (accountNumber: string) => {
    // Basic validation - adjust based on your requirements
    if (!accountNumber) return "Account number is required";
    if (accountNumber.length < 8) return "Account number must be at least 8 digits";
    if (!/^\d+$/.test(accountNumber)) return "Account number must contain only digits";
    return "";
  };

  const validateAccountHolderName = (name: string) => {
    if (!name) return "Account holder name is required";
    if (name.length < 2) return "Name is too short";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces";
    return "";
  };

  const handleBlur = (field: keyof FormData, value: string) => {
    let error = "";
    
    switch (field) {
      case 'accountHolderName':
        error = validateAccountHolderName(value);
        break;
      case 'accountNumber':
        error = validateAccountNumber(value);
        break;
      case 'confirmAccountNumber':
        if (value && formData.accountNumber !== value) {
          error = "Account numbers do not match";
        }
        break;
    }
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Don't allow proceeding without email verification
  if (!formData.emailVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
        {/* Illustration */}
        <div className="mb-8">
          <svg
            width="300"
            height="250"
            viewBox="0 0 300 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="150" cy="100" r="80" fill="#f5f5f5" />
            <path
              d="M150 60 L150 100 L175 80"
              stroke="#303030"
              strokeWidth="3"
              fill="none"
            />
            <text x="150" y="180" textAnchor="middle" className="text-lg font-semibold fill-[#303030]">
              Email Verification Required
            </text>
          </svg>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Complete Email Verification First
        </h2>

        <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
          Please complete Step 1 email verification before adding your bank details.
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-12 rounded-full"
        >
          Go Back to Step 1
        </Button>
      </div>
    );
  }

  // Don't allow proceeding without location verification
  if (!formData.locationVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
        <div className="mb-8">
          <svg
            width="300"
            height="250"
            viewBox="0 0 300 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="150" cy="100" r="80" fill="#f5f5f5" />
            <path
              d="M150 60 L150 100 L175 80"
              stroke="#303030"
              strokeWidth="3"
              fill="none"
            />
            <text x="150" y="180" textAnchor="middle" className="text-lg font-semibold fill-[#303030]">
              Location Verification Required
            </text>
          </svg>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Complete Location Verification First
        </h2>

        <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
          Please complete Step 2 location verification before adding your bank details.
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-12 rounded-full"
        >
          Go Back to Step 2
        </Button>
      </div>
    );
  }

  // Don't allow proceeding without store description
  if (!formData.step3Completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
        <div className="mb-8">
          <svg
            width="300"
            height="250"
            viewBox="0 0 300 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="150" cy="100" r="80" fill="#f5f5f5" />
            <path
              d="M150 60 L150 100 L175 80"
              stroke="#303030"
              strokeWidth="3"
              fill="none"
            />
            <text x="150" y="180" textAnchor="middle" className="text-lg font-semibold fill-[#303030]">
              Store Description Required
            </text>
          </svg>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Complete Store Description First
        </h2>

        <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
          Please complete Step 3 store description before adding your bank details.
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-12 rounded-full"
        >
          Go Back to Step 3
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Bank Details</h2>
      </div>
      <p className="text-sm text-[#303030] mb-8 dark:text-gray-400">
        Share your bank details so we can send your earnings securely and on time.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="accountHolderName" className="mb-2 block">
              Account holder name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountHolderName"
              placeholder="e.g. John Doe"
              className="h-11"
              value={formData.accountHolderName}
              onChange={(e) =>
                handleInputChange("accountHolderName", e.target.value)
              }
              onBlur={(e) => handleBlur("accountHolderName", e.target.value)}
            />
            {validationErrors.accountHolderName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.accountHolderName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bankName" className="mb-2 block">
              Bank name <span className="text-gray-500">(optional)</span>
            </Label>
            <Input
              id="bankName"
              placeholder="e.g. Standard Chartered Bank"
              className="h-11"
              value={formData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              The name of your bank (helps us verify payments)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="accountNumber" className="mb-2 block">
              Account number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              className={`h-11 ${!accountNumbersMatch && formData.confirmAccountNumber ? 'border-red-500' : ''}`}
              value={formData.accountNumber}
              onChange={(e) =>
                handleInputChange("accountNumber", e.target.value)
              }
              onBlur={(e) => handleBlur("accountNumber", e.target.value)}
            />
            {validationErrors.accountNumber && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.accountNumber}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 digits
            </p>
          </div>

          <div>
            <Label htmlFor="confirmAccountNumber" className="mb-2 block">
              Confirm account number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmAccountNumber"
              placeholder="Re-enter account number"
              className={`h-11 ${!accountNumbersMatch && formData.confirmAccountNumber ? 'border-red-500' : ''}`}
              value={formData.confirmAccountNumber}
              onChange={(e) =>
                handleInputChange("confirmAccountNumber", e.target.value)
              }
              onBlur={(e) => handleBlur("confirmAccountNumber", e.target.value)}
            />
            {validationErrors.confirmAccountNumber && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.confirmAccountNumber}</p>
            )}
            {accountNumbersMatch && formData.accountNumber && formData.confirmAccountNumber && (
              <p className="text-green-500 text-xs mt-1">✓ Account numbers match</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="swiftCode" className="mb-2 block">
            Swift code <span className="text-gray-500">(optional)</span>
          </Label>
          <Input
            id="swiftCode"
            placeholder="Enter Swift code (e.g., SCBLUGKA)"
            className="h-11"
            value={formData.swiftCode}
            onChange={(e) => handleInputChange("swiftCode", e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for international transfers
          </p>
        </div>

      </div>
    </div>
  );
}