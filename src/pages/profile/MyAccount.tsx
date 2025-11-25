"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileImage } from "@/components/profile-image";
import { AfricanPhoneInput } from "@/components/african-phone-input";

export default function MyAccountPage() {

  const [profileImage] = React.useState<string | null>(null);
  const [userName] = React.useState("John Doe");
  
  // Add state for phone number and country code
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+256"); // Default to Uganda




  // Handler for phone number changes
  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  // Handler for country code changes
  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
  };

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card className="shadow-xs">
        <CardHeader className="border-b">
          <CardTitle>
            <h1 className="text-2xl font-medium">Account Settings</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 flex-col-reverse">
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="mb-2 block">
                  First name
                </Label>
                <Input
                  id="firstName"
                  className="h-11"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-2 block">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  className="h-11"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  className="h-11"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="mb-2 block">
                  Phone Number
                </Label>
                <AfricanPhoneInput
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  countryCode={countryCode}
                  onCountryCodeChange={handleCountryCodeChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4">
              <ProfileImage
                src={profileImage}
                alt={userName}
                size="2xl"
                className="mb-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-medium">Address Information</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="streetAddress" className="mb-2 block">
              Street Address
            </Label>
            <Input
              id="streetAddress"
              className="h-11"
              placeholder="Enter street address"
            />
          </div>


        </CardContent>
      </Card>
    </div>
  );
}