"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Building, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import type { FormData } from "./StepsContainer";

interface Step5Props {
  formData: FormData;
  onEditStep?: (stepIndex: number) => void;
}

export default function Step5({ formData, onEditStep }: Step5Props) {
  // Don't allow proceeding without completing all previous steps
  const allStepsCompleted = 
    formData.step1Completed && 
    formData.step2Completed && 
    formData.step3Completed && 
    formData.step4Completed &&
    formData.emailVerified;

  if (!allStepsCompleted) {
    const missingSteps = [];
    if (!formData.emailVerified) missingSteps.push("Email Verification (Step 1)");
    if (!formData.step1Completed) missingSteps.push("Personal Information (Step 1)");
    if (!formData.step2Completed) missingSteps.push("Shop Setup (Step 2)");
    if (!formData.step3Completed) missingSteps.push("Store Description (Step 3)");
    if (!formData.step4Completed) missingSteps.push("Bank Details (Step 4)");

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
              Complete All Steps First
            </text>
          </svg>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Complete All Previous Steps
        </h2>

        <p className="text-[#303030] dark:text-gray-400 mb-6 text-center max-w-md">
          Please complete all previous steps before reviewing and submitting your KYC application.
        </p>

        <div className="w-full max-w-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Missing Information
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                <ul className="list-disc list-inside space-y-1">
                  {missingSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => window.location.reload()}
          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-12 rounded-full"
        >
          Go Back to Complete Steps
        </Button>
      </div>
    );
  }

  const renderDocumentPreview = (url: string, index: number) => {
    return (
      <div
        key={index}
        className="border rounded-lg overflow-hidden aspect-video bg-gray-50 relative group"
      >
        <img
          src={url}
          alt={`Identity document ${index + 1}`}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.parentElement!.innerHTML = `
              <div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <div class="text-sm mb-2">Document ${index + 1}</div>
                <div class="text-xs">Click to view</div>
              </div>
            `;
          }}
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
    );
  };

  return (
    <div className="space-y-8">
      {/* Review Header */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-300">
              Ready to Submit Your KYC Application
            </h2>
            <p className="text-green-700 dark:text-green-400 mt-1">
              Please review all your information below. Once submitted, your application will be reviewed within 1-3 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#CC5500]" />
            Personal Information
          </CardTitle>
          {onEditStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(0)}
              className="text-sm"
            >
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <User className="w-4 h-4 text-[#CC5500]" />
                <span>Full Name</span>
              </div>
              <p className="font-medium">
                {formData.firstName} {formData.middleName} {formData.lastName}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <Mail className="w-4 h-4 text-[#CC5500]" />
                <span>Email Address</span>
                {formData.emailVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              )}
              </div>
              <p className="font-medium">{formData.email}</p>
              
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <Phone className="w-4 h-4 text-[#CC5500]" />
                <span>Phone Number</span>
              </div>
              <p className="font-medium">
                {formData.countryCode} {formData.phoneNumber}
              </p>
            </div>
          </div>

          {/* Identity Verification Images */}
          <div className="pt-4 border-t">
            <h3 className="text-md font-semibold mb-4">Identity verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.identityDocumentUrls && formData.identityDocumentUrls.length > 0 ? (
                formData.identityDocumentUrls.map((url: string, index: number) => 
                  renderDocumentPreview(url, index)
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#CC5500]" />
            Shop Details
          </CardTitle>
          {onEditStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(1)}
              className="text-sm"
            >
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <Building className="w-4 h-4 text-[#CC5500]" />
                <span>Shop Name</span>
              </div>
              <p className="font-medium">{formData.storeName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <MapPin className="w-4 h-4 text-[#CC5500]" />
                <span>Country</span>
              </div>
              <p className="font-medium">{formData.country}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <MapPin className="w-4 h-4 text-[#CC5500]" />
                <span>City</span>
              </div>
              <p className="font-medium">{formData.city}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <MapPin className="w-4 h-4 text-[#CC5500]" />
                <span>District</span>
              </div>
              <p className="font-medium">{formData.district || "N/A"}</p>
            </div>
          </div>

          {/* Verified Location */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#CC5500]" />
              Verified Location
              {formData.locationVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              )}
            </h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">
                {formData.streetName && <span>{formData.streetName}</span>}
                {formData.streetName && formData.additionalAddress && ", "}
                {formData.additionalAddress && (
                  <span>{formData.additionalAddress}</span>
                )}
              </p>
              {formData.gpsCoordinates && (
                <p className="text-xs text-gray-500 mt-1">
                  GPS: {formData.gpsCoordinates.latitude.toFixed(6)}, {formData.gpsCoordinates.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Description */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Store description</CardTitle>
          {onEditStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(2)}
              className="text-sm"
            >
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formData.storeDescription }}
          />
          {!formData.storeDescription && (
            <p className="text-gray-400 italic">No store description provided</p>
          )}
        </CardContent>
      </Card>

      {/* Seller Story */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Seller story</CardTitle>
          {onEditStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(2)}
              className="text-sm"
            >
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {formData.videoUrl ? (
            <div className="space-y-4">
              <video
                className="border w-full rounded-md max-h-[300px]"
                controls
                src={formData.videoUrl}
              />
              <p className="text-sm text-gray-500">
                Click play to preview your seller story video
              </p>
            </div>
          ) : (
            <div className="border w-full h-64 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="mb-2">No video uploaded</p>
                <p className="text-sm">Seller story video is optional</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#CC5500]" />
            Bank Details
          </CardTitle>
          {onEditStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(3)}
              className="text-sm"
            >
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <User className="w-4 h-4 text-[#CC5500]" />
                <span>Account Holder Name</span>
              </div>
              <p className="font-medium">{formData.accountHolderName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <Building className="w-4 h-4 text-[#CC5500]" />
                <span>Bank Name</span>
              </div>
              <p className="font-medium">{formData.bankName || "N/A"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <CreditCard className="w-4 h-4 text-[#CC5500]" />
                <span>Account Number</span>
              </div>
              <p className="font-medium">
                {formData.accountNumber
                  ? "•".repeat(formData.accountNumber.length)
                  : "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <CreditCard className="w-4 h-4 text-[#CC5500]" />
                <span>Swift Code</span>
              </div>
              <p className="font-medium">{formData.swiftCode || "N/A"}</p>
            </div>
          </div>
          
        </CardContent>
      </Card>

    </div>
  );
}