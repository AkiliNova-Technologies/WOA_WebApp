import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormData } from "./StepsContainer";

interface Step4Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step4({ formData, updateFormData }: Step4Props) {
  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Bank Details</h2>
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
              placeholder="e.g. John"
              className="h-11"
              value={formData.accountHolderName}
              onChange={(e) =>
                handleInputChange("accountHolderName", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="bankName" className="mb-2 block">
              Bank name
            </Label>
            <Input
              id="bankName"
              placeholder="e.g. Mason"
              className="h-11"
              value={formData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
            />
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
              className="h-11"
              value={formData.accountNumber}
              onChange={(e) =>
                handleInputChange("accountNumber", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="confirmAccountNumber" className="mb-2 block">
              Confirm account number
            </Label>
            <Input
              id="confirmAccountNumber"
              placeholder="Re-enter account number"
              className="h-11"
              value={formData.confirmAccountNumber}
              onChange={(e) =>
                handleInputChange("confirmAccountNumber", e.target.value)
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="swiftCode" className="mb-2 block">
            Swift code <span className="text-gray-500">(optional)</span>
          </Label>
          <Input
            id="swiftCode"
            placeholder="Enter Swift code"
            className="h-11"
            value={formData.swiftCode}
            onChange={(e) => handleInputChange("swiftCode", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}