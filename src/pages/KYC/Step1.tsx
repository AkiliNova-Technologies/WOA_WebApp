import { AfricanPhoneInput } from "@/components/african-phone-input";
import { VideoUpload } from "@/components/video-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormData } from "./StepsContainer";

interface Step1Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step1({ formData, updateFormData }: Step1Props) {
  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleVideoChange = (file: File | null) => {
    updateFormData({ videoFile: file });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
      <p className="text-sm text-[#303030] mb-6">
        This section verifies who you are and how to communicate with you
      </p>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <Label htmlFor="firstName" className="mb-2 block">
            First Name
          </Label>
          <Input
            id="firstName"
            className="h-11"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="middleName" className="mb-2 block">
            Middle Name
          </Label>
          <Input
            id="middleName"
            className="h-11"
            placeholder="Enter middle name"
            value={formData.middleName}
            onChange={(e) => handleInputChange("middleName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="mb-2 block">
            Last Name
          </Label>
          <Input
            id="lastName"
            className="h-11"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
          />
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="email" className="mb-2 block">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="h-11"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-2 block">
            Phone Number
          </Label>
          <AfricanPhoneInput
            value={formData.phoneNumber}
            onChange={(value) => handleInputChange("phoneNumber", value)}
            countryCode={formData.countryCode}
            onCountryCodeChange={(value) =>
              handleInputChange("countryCode", value)
            }
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      {/* Video Upload Section */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">Share Your Story</h2>
        <p className="text-[#303030] text-sm mb-6">
          We'd love to hear your story. Record a short video introducing
          yourself and your business—this helps buyers connect with the real
          person behind the products.
        </p>

        <VideoUpload
          onVideoChange={handleVideoChange}
          maxSize={100}
          className="w-full"
        />
      </div>
    </div>
  );
}
