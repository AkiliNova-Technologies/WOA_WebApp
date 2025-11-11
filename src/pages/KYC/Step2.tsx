"use client";

import {
  IdentityUpload,
  type IdentityDocument,
} from "@/components/identity-upload";
import type { FormData } from "./StepsContainer";

interface Step2Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step2({ updateFormData }: Step2Props) {
  const handleDocumentsChange = (newDocuments: IdentityDocument[]) => {
    console.log("Current documents:", newDocuments);
    // Update the form data with the new documents
    updateFormData({ identityDocuments: newDocuments });
    
    // You can handle the documents here - upload to your server, validate, etc.
  };

  return (
    <div className="shadow-none">
      <h2 className="text-xl font-semibold mb-3">Verify your Identity</h2>
      <p className="text-sm text-[#303030] mb-8">
        Upload clear images of both the front and back of your valid ID—National
        ID, Driving Permit, or Passport. Make sure all details are visible and
        legible.
      </p>

      {/* Identity Upload Component */}
      <IdentityUpload
        onDocumentsChange={handleDocumentsChange}
        maxSize={1} // 1MB as per the design requirements
        className="mb-8"
        // initialDocuments={formData.identityDocuments}
      />

      {/* Security Note */}
      <div className="">
        <h3 className="text-md font-medium mb-1">Note</h3>
        <p className="text-sm text-[#303030]">
          Your documents are encrypted and stored securely. We only use them for
          verification and never share them with third parties.
        </p>
      </div>

    </div>
  );
}