import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import Steps from "@/components/steps";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AfricanPhoneInput } from "@/components/african-phone-input";
import { ImageUpload } from "@/components/image-upload";
import type { IdentityDocument } from "@/components/identity-upload";
import { TextEditor } from "@/components/text-editor";
import { VideoUpload } from "@/components/video-upload";
import {
  SearchSelectContent,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countriesApi, type City, type Country } from "@/lib/countries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Interfaces
export interface SubCategory {
  id: string;
  name: string;
  image: string;
  types: SubCategoryType[];
}

export interface SubCategoryType {
  id: string;
  name: string;
  image: string;
}

export interface Attribute {
  id: string;
  name: string;
  inputType: "dropdown" | "multiselect" | "boolean" | "text" | "number";
  purpose: string;
  values: string[];
  filterStatus: "active" | "inactive";
  [key: string]: any;
}

// Form Data Interface
interface FormDataState {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;

  // Identity Verification
  identityDocuments: IdentityDocument[];

  // Store Details
  storeName: string;
  storeDescription: string;
  country: string;
  city: string;
  videoFile: File | null;

  // Bank Details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  swiftCode: string;
}

export default function AdminCreateVendorPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Business owner Identity" },
    { title: "Identity Verification" },
    { title: "Store details" },
    { title: "Bank details" },
    { title: "Preview" },
  ];

  // Initialize form data state
  const [formData, setFormData] = useState<FormDataState>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+256", // Default country code
    identityDocuments: [],
    storeName: "",
    storeDescription: "",
    country: "",
    city: "",
    videoFile: null,
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    swiftCode: "",
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
  });

  const [touched, setTouched] = useState({
    accountNumber: false,
    confirmAccountNumber: false,
  });

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const countriesData = await countriesApi.getAfricanCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.country) {
        setCities([]);
        return;
      }

      try {
        setCitiesLoading(true);
        const citiesData = await countriesApi.getCitiesByCountry(
          formData.country
        );
        setCities(citiesData);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, [formData.country]);

  // Update form data helper function
  const updateFormData = (updates: Partial<FormDataState>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleChange = (field: keyof FormDataState, value: string) => {
    updateFormData({ [field]: value });

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
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
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Validate when field loses focus
    if (field === "accountNumber" || field === "confirmAccountNumber") {
      validateAccountNumbers(
        formData.accountNumber,
        formData.confirmAccountNumber
      );
    }
  };

  const validateAccountNumbers = (
    accountNumber: string,
    confirmAccountNumber: string
  ) => {
    const newErrors = {
      accountNumber: "",
      confirmAccountNumber: "",
    };

    // Basic account number validation (numbers only, typical length)
    if (accountNumber && !/^\d+$/.test(accountNumber)) {
      newErrors.accountNumber = "Account number should contain only numbers";
    } else if (
      accountNumber &&
      (accountNumber.length < 8 || accountNumber.length > 17)
    ) {
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

    if (
      formData.accountNumber.length >= 8 &&
      /^\d+$/.test(formData.accountNumber)
    ) {
      return { type: "success", message: "Valid account number" };
    }

    return null;
  };

  const getConfirmAccountNumberStatus = () => {
    if (!touched.confirmAccountNumber || !formData.confirmAccountNumber)
      return null;

    if (errors.confirmAccountNumber) {
      return { type: "error", message: errors.confirmAccountNumber };
    }

    if (
      formData.confirmAccountNumber &&
      formData.accountNumber === formData.confirmAccountNumber
    ) {
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

  const handleCountryChange = (value: string) => {
    updateFormData({
      country: value,
      city: "", // Reset city when country changes
    });
  };

  const handleCityChange = (value: string) => {
    updateFormData({ city: value });
  };

  const handleCitySearch = async (searchValue: string) => {
    if (!formData.country) return;

    try {
      const filteredCities = await countriesApi.searchCities(
        formData.country,
        searchValue
      );
      setCities(filteredCities);
    } catch (error) {
      console.error("Error searching cities:", error);
    }
  };

  const handleStoreNameChange = (value: string) => {
    updateFormData({ storeName: value });
  };

  const handleStoreDescriptionChange = (value: string) => {
    updateFormData({ storeDescription: value });
  };

  const handleInputChange = (field: keyof FormDataState, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleVideoChange = (file: File | null) => {
    updateFormData({ videoFile: file });
  };

  const handleDocumentsChange = (newDocuments: IdentityDocument[]) => {
    console.log("Current documents:", newDocuments);
    updateFormData({ identityDocuments: newDocuments });
  };

  // Helper function to get country name from code
  const getCountryName = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Submitting form data:", formData);
    // TODO: Implement API call to submit form data
    alert("Form submitted successfully!");
    navigate("/vendors");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader label="Category Management" />

      {/* Main Content */}
      <div className="mx-auto px-10 py-8">
        <div className="flex gap-8">
          {/* Sticky Steps Sidebar */}
          <div className="w-60 max-w-60 shrink-0">
            <div className="sticky top-8 bg-white rounded-lg p-6 dark:bg-[#303030]">
              <Steps
                current={currentStep}
                items={steps}
                onChange={setCurrentStep}
                direction="vertical"
              />
            </div>
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-md mb-6 dark:bg-[#303030]">
              <div className="mx-auto px-10 py-4 flex items-center justify-between">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={"secondary"}
                    className="bg-white hover:text-gray-900 dark:bg-[#303030]"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Back to Vendor Display
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1">
              {/* Step 1:  */}
              {currentStep === 0 && (
                <div className="">
                  <div className="bg-white rounded-lg p-6 dark:bg-[#303030]">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        Your Profile
                      </h2>
                      <p className="text-sm text-[#303030] mb-6">
                        This section verifies who you are and how to communicate
                        with you
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
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
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
                            onChange={(e) =>
                              handleInputChange("middleName", e.target.value)
                            }
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
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
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
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="mb-2 block">
                            Phone Number
                          </Label>
                          <AfricanPhoneInput
                            value={formData.phoneNumber}
                            onChange={(value) =>
                              handleInputChange("phoneNumber", value)
                            }
                            countryCode={formData.countryCode}
                            onCountryCodeChange={(value) =>
                              handleInputChange("countryCode", value)
                            }
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={handleNext}
                      className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12 text-white text-md font-smeibold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2:  */}
              {currentStep === 1 && (
                <div className="">
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 dark:bg-[#303030]">
                      <div className="shadow-none">
                        <h2 className="text-xl font-semibold mb-3">
                          Verify your Identity
                        </h2>
                        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
                          Upload clear images of both the front and back of your
                          valid ID—National ID, Driving Permit, or Passport.
                          Make sure all details are visible and legible.
                        </p>

                        {/* Identity Upload Component */}
                        <ImageUpload
                          onImageChange={() => handleDocumentsChange}
                          maxSize={1} // 1MB as per the design requirements
                          className="mb-6"
                          description="Upload either the National ID or Passport or Driving Permit"
                          initialDocuments={formData.identityDocuments}
                        />

                        {/* Security Note */}
                        <div className="">
                          <h3 className="text-md font-medium mb-1">Note</h3>
                          <p className="text-sm text-[#303030] dark:text-gray-400">
                            Your documents are encrypted and stored securely. We
                            only use them for verification and never share them
                            with third parties.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="px-8 py-3 w-xs h-12"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12 text-white text-md font-smeibold"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3:  */}
              {currentStep === 2 && (
                <div>
                  <div className="bg-white rounded-lg p-8 dark:bg-[#303030]">
                    <div>
                      <div>
                        <h2 className="text-xl font-semibold mb-3">
                          Store Details
                        </h2>
                        <p className="text-sm text-[#303030] mb-8">
                          This is how your shop will appear to buyers. Keep it
                          clear and memorable.
                        </p>

                        <div className="space-y-5">
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label>Store Name</Label>
                                <Input
                                  placeholder="e.g Your fit"
                                  className="h-11"
                                  value={formData.storeName}
                                  onChange={(e) =>
                                    handleStoreNameChange(e.target.value)
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <AfricanPhoneInput
                                  value={formData.phoneNumber}
                                  onChange={(value) =>
                                    handleInputChange("phoneNumber", value)
                                  }
                                  countryCode={formData.countryCode}
                                  onCountryCodeChange={(value) =>
                                    handleInputChange("countryCode", value)
                                  }
                                  placeholder="Enter your phone number"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="country" className="mb-2 block">
                                  Country / Region
                                </Label>
                                <Select
                                  value={formData.country}
                                  onValueChange={handleCountryChange}
                                  disabled={loading}
                                >
                                  <SelectTrigger
                                    id="country"
                                    className="min-h-11 w-full"
                                  >
                                    <SelectValue
                                      placeholder={
                                        loading
                                          ? "Loading countries..."
                                          : "Select country"
                                      }
                                    >
                                      {formData.country &&
                                        getCountryName(formData.country)}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SearchSelectContent searchPlaceholder="Search countries...">
                                    {countries.map((country) => (
                                      <SelectItem
                                        key={country.code}
                                        value={country.code}
                                      >
                                        {country.name}
                                      </SelectItem>
                                    ))}
                                  </SearchSelectContent>
                                </Select>
                              </div>

                              {/* City Select */}
                              <div>
                                <Label htmlFor="city" className="mb-2 block">
                                  City
                                </Label>
                                <Select
                                  value={formData.city}
                                  onValueChange={handleCityChange}
                                  disabled={!formData.country || citiesLoading}
                                >
                                  <SelectTrigger
                                    id="city"
                                    className="min-h-11 w-full"
                                  >
                                    <SelectValue
                                      placeholder={
                                        !formData.country
                                          ? "Select country first"
                                          : citiesLoading
                                          ? "Loading cities..."
                                          : "Select city"
                                      }
                                    >
                                      {formData.city}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SearchSelectContent
                                    searchPlaceholder="Search cities..."
                                    onSearchChange={handleCitySearch}
                                  >
                                    {cities.map((city) => (
                                      <SelectItem
                                        key={`${city.countryCode}-${city.name}`}
                                        value={city.name}
                                      >
                                        {city.name}
                                      </SelectItem>
                                    ))}
                                    {cities.length === 0 &&
                                      formData.country && (
                                        <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                                          No cities found
                                        </div>
                                      )}
                                  </SearchSelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2 block">
                              Store Description
                            </Label>
                            <TextEditor
                              value={formData.storeDescription}
                              onChange={handleStoreDescriptionChange}
                              placeholder="Start writing your amazing content..."
                              className="mb-4"
                            />
                          </div>

                          {/* Video Upload Section */}
                          <div className="border-t pt-6">
                            <h2 className="text-xl font-semibold mb-2">
                              Share Your Story
                            </h2>
                            <p className="text-[#303030] text-sm">
                              We'd love to hear your story. Record a short video
                              introducing yourself and your business—this helps
                              buyers connect with the real person behind the
                              products.
                            </p>

                            <VideoUpload
                              onVideoChange={handleVideoChange}
                              maxSize={100}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="px-8 py-3 w-xs h-12"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12 text-white text-md font-smeibold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4:*/}
              {currentStep === 3 && (
                <div>
                  <div className="bg-white p-6 rounded-md mt-6 dark:bg-[#303030]">
                    <div>
                      <h2 className="text-xl font-semibold mb-3">
                        Bank Details
                      </h2>
                      <p className="text-sm text-[#303030] mb-8">
                        Share your bank details so we can send your earnings
                        securely and on time.
                      </p>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Account Holder Name</Label>
                            <Input
                              placeholder="e.g Your Fit"
                              className="h-11"
                              value={formData.accountHolderName}
                              onChange={(e) =>
                                handleChange(
                                  "accountHolderName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Input
                              placeholder="e.g Equity Bank"
                              className="h-11"
                              value={formData.bankName}
                              onChange={(e) =>
                                handleChange("bankName", e.target.value)
                              }
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
                              onChange={(e) =>
                                handleChange("accountNumber", e.target.value)
                              }
                              onBlur={() => handleBlur("accountNumber")}
                            />
                            {accountNumberStatus && (
                              <div
                                className={`flex items-center gap-1 text-xs ${
                                  accountNumberStatus.type === "error"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
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
                              onChange={(e) =>
                                handleChange(
                                  "confirmAccountNumber",
                                  e.target.value
                                )
                              }
                              onBlur={() => handleBlur("confirmAccountNumber")}
                            />
                            {confirmAccountNumberStatus && (
                              <div
                                className={`flex items-center gap-1 text-xs ${
                                  confirmAccountNumberStatus.type === "error"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {confirmAccountNumberStatus.type === "error" ? (
                                  <AlertCircle className="w-3 h-3" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                <span>
                                  {confirmAccountNumberStatus.message}
                                </span>
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
                              onChange={(e) =>
                                handleChange("swiftCode", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Validation Summary */}
                        {isBankDetailsComplete && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-medium">
                                All bank details are complete and valid
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-between mt-8 pt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="px-8 py-3 w-xs h-12"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12 text-white text-md font-smeibold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Preview */}
              {currentStep === 4 && (
                <div>
                  <div className="bg-white p-6 rounded-md mt-6 dark:bg-[#303030]">
                    <div className="space-y-8">
                      {/* Personal Information */}
                      <Card className="shadow-none border-none">
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
                        </CardContent>
                      </Card>
                      {/* Store Details */}
                      <Card className="shadow-none">
                        <CardHeader>
                          <CardTitle>Store Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3 col-span-2">
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
                                value={getCountryName(formData.country)}
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
                              className="bg-gray-50 dark:bg-input/30"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* My story  */}
                      <Card className="shadow-none">
                        <CardHeader>
                          <CardTitle>My Story</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div>
                            {formData.videoFile ? (
                              <video
                                src={URL.createObjectURL(formData.videoFile)}
                                className="border w-full h-100 rounded-md"
                                controls
                              />
                            ) : (
                              <div className="border w-full h-64 rounded-md flex items-center justify-center bg-gray-50">
                                <p className="text-gray-500">
                                  No video uploaded
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Identity Verification */}
                      <Card className="shadow-none">
                        <CardHeader>
                          <CardTitle>Identity Verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            <ImageUpload
                              onImageChange={() => {}}
                              footer={false}
                              disabled
                              initialDocuments={formData.identityDocuments}
                            />
                            <ImageUpload
                              onImageChange={() => {}}
                              footer={false}
                              disabled
                              initialDocuments={formData.identityDocuments}
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
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-between mt-8 pt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="px-8 py-3 w-xs h-12"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12 text-white text-md font-smeibold"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
