"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                readOnly
                className="h-11 bg-gray-50"
              />
            </div>
            <div className="space-y-3">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                readOnly
                className="h-11 bg-gray-50"
              />
            </div>
            <div className="space-y-3">
              <Label>Email</Label>
              <Input
                value={formData.email}
                readOnly
                className="h-11 bg-gray-50"
              />
            </div>
            <div className="space-y-3">
              <Label>Phone Number</Label>
              <Input
                value={`${formData.countryCode} ${formData.phoneNumber}`}
                readOnly
                className="h-11 bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>My Story</Label>
            {formData.videoFile ? (
              <video
                controls
                className="w-full h-64 rounded-lg border border-gray-200"
                src={URL.createObjectURL(formData.videoFile)}
              />
            ) : (
              <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg text-gray-500">
                No video uploaded
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Store Details */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Store Name</Label>
              <Input
                value={formData.storeName}
                readOnly
                className="h-11 bg-gray-50"
              />
            </div>
            <div className="space-y-3">
              <Label>Country</Label>
              <Input
                value={formData.country}
                readOnly
                className="h-11 bg-gray-50"
              />
            </div>
            <div className="space-y-3">
              <Label>City</Label>
              <Input
                value={formData.city}
                readOnly
                className="h-11 bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Store Description</Label>
            <Textarea
              rows={5}
              value={formData.storeDescription}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </CardContent>
      </Card>
      {/* Bank Details */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>Account Holder Name</Label>
            <Input
              value={formData.accountHolderName}
              readOnly
              className="h-11 bg-gray-50"
            />
          </div>
          <div className="space-y-3">
            <Label>Bank Name</Label>
            <Input
              value={formData.bankName}
              readOnly
              className="h-11 bg-gray-50"
            />
          </div>
          <div className="space-y-3">
            <Label>Account Number</Label>
            <Input
              value={
                formData.accountNumber
                  ? "•".repeat(formData.accountNumber.length)
                  : ""
              }
              readOnly
              className="h-11 bg-gray-50"
            />
          </div>
          <div className="space-y-3">
            <Label>Swift Code</Label>
            <Input
              value={formData.swiftCode}
              readOnly
              className="h-11 bg-gray-50"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
