"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { User, Mail, Phone, MapPin, Building, CreditCard } from "lucide-react";
import type { FormData } from "./StepsContainer";

interface Step5Props {
  formData: FormData;
}

export default function Step5({ formData }: Step5Props) {
  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
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
              {formData.identityDocuments && formData.identityDocuments.length > 0 ? (
                formData.identityDocuments.map((_doc, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden aspect-video bg-gray-50"
                  >
                    {/* Document preview would go here */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Document {index + 1}
                    </div>
                  </div>
                ))
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
          <CardTitle>Shop Details</CardTitle>
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
                <span>Country of Operation</span>
              </div>
              <p className="font-medium">{formData.country}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <MapPin className="w-4 h-4 text-[#CC5500]" />
                <span>City of operation</span>
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
          {(formData.streetName || formData.additionalAddress) && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Verified location</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm">
                  {formData.streetName && <span>{formData.streetName}</span>}
                  {formData.streetName && formData.additionalAddress && ", "}
                  {formData.additionalAddress && (
                    <span>{formData.additionalAddress}</span>
                  )}
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
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formData.storeDescription }}
          />
        </CardContent>
      </Card>

      {/* Seller Story */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Seller story</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.videoFile ? (
            <video
              className="border w-full rounded-md"
              controls
              src={URL.createObjectURL(formData.videoFile)}
            />
          ) : (
            <div className="border w-full h-64 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
              No video uploaded
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Bank details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                <span>Account Name</span>
              </div>
              <p className="font-medium">{formData.bankName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#303030]">
                <Building className="w-4 h-4 text-[#CC5500]" />
                <span>Bank Name</span>
              </div>
              <p className="font-medium">{formData.bankName}</p>
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