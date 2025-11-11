"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { FormData } from "./StepsContainer";

interface Step4Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step4({ formData, updateFormData }: Step4Props) {
  const [errors, setErrors] = useState({
    accountNumber: "",
    confirmAccountNumber: ""
  });

  const [touched, setTouched] = useState({
    accountNumber: false,
    confirmAccountNumber: false
  });

  const handleChange = (field: keyof FormData, value: string) => {
    // Update the form data
    updateFormData({ [field]: value });

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
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
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate when field loses focus
    if (field === "accountNumber" || field === "confirmAccountNumber") {
      validateAccountNumbers(formData.accountNumber, formData.confirmAccountNumber);
    }
  };

  const validateAccountNumbers = (accountNumber: string, confirmAccountNumber: string) => {
    const newErrors = {
      accountNumber: "",
      confirmAccountNumber: ""
    };

    // Basic account number validation (numbers only, typical length)
    if (accountNumber && !/^\d+$/.test(accountNumber)) {
      newErrors.accountNumber = "Account number should contain only numbers";
    } else if (accountNumber && (accountNumber.length < 8 || accountNumber.length > 17)) {
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
    
    if (formData.accountNumber.length >= 8 && /^\d+$/.test(formData.accountNumber)) {
      return { type: "success", message: "Valid account number" };
    }
    
    return null;
  };

  const getConfirmAccountNumberStatus = () => {
    if (!touched.confirmAccountNumber || !formData.confirmAccountNumber) return null;
    
    if (errors.confirmAccountNumber) {
      return { type: "error", message: errors.confirmAccountNumber };
    }
    
    if (formData.confirmAccountNumber && formData.accountNumber === formData.confirmAccountNumber) {
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Bank Details</h2>
      <p className="text-sm text-[#303030] mb-8">
        Share your bank details so we can send your earnings securely and on
        time.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Account Holder Name</Label>
            <Input 
              placeholder="e.g Your Fit" 
              className="h-11"
              value={formData.accountHolderName}
              onChange={(e) => handleChange("accountHolderName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input 
              placeholder="e.g Equity Bank" 
              className="h-11"
              value={formData.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input 
              placeholder="Enter account number" 
              className="h-11"
              value={formData.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
              onBlur={() => handleBlur("accountNumber")}
            />
            {accountNumberStatus && (
              <div className={`flex items-center gap-1 text-xs ${
                accountNumberStatus.type === "error" ? "text-red-600" : "text-green-600"
              }`}>
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
            <Label>Repeat Account Number</Label>
            <Input 
              placeholder="Confirm account number" 
              className="h-11"
              value={formData.confirmAccountNumber}
              onChange={(e) => handleChange("confirmAccountNumber", e.target.value)}
              onBlur={() => handleBlur("confirmAccountNumber")}
            />
            {confirmAccountNumberStatus && (
              <div className={`flex items-center gap-1 text-xs ${
                confirmAccountNumberStatus.type === "error" ? "text-red-600" : "text-green-600"
              }`}>
                {confirmAccountNumberStatus.type === "error" ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                <span>{confirmAccountNumberStatus.message}</span>
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
              onChange={(e) => handleChange("swiftCode", e.target.value)}
            />
          </div>
        </div>

        {/* Validation Summary */}
        {isBankDetailsComplete && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">All bank details are complete and valid</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}