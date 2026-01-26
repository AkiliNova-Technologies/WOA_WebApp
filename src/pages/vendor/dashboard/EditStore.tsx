import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SearchSelectContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect, useCallback } from "react";
import { countriesApi, type City, type Country } from "@/lib/countries";
import { Label } from "@/components/ui/label";
import { useReduxVendors } from "@/hooks/useReduxVendors";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { VideoUpload } from "@/components/video-upload";

const STORE_CATEGORIES = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "home", label: "Home Decor & Lifestyle" },
  { value: "jewelry", label: "Jewelry & Accessories" },
  { value: "food", label: "Gourmet & Specialty Foods" },
  { value: "beauty", label: "Health & Beauty" },
  { value: "art", label: "Art & Collectibles" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "books", label: "Books & Stationery" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "toys", label: "Toys & Games" },
  { value: "other", label: "Other" },
];

interface StoreFormData {
  businessName: string;
  category: string;
  businessDescription: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  country: string;
  city: string;
  storyVideoUrl?: string;
}

export function EditStore() {
  const { user } = useReduxAuth();
  const {
    selectedVendor,
    getOwnVendorProfile,
    updateVendor,
    loading: vendorLoading,
    actionLoading,
  } = useReduxVendors();

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [formData, setFormData] = useState<StoreFormData>({
    businessName: "",
    category: "",
    businessDescription: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    country: "",
    city: "",
    storyVideoUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const updateFormData = (field: keyof StoreFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const parseAddress = (address: string = "") => {
    const addressParts = address.split(",").map((part) => part.trim());
    let street = "";
    let city = "";
    let country = "";

    if (addressParts.length === 1) {
      street = addressParts[0];
    } else if (addressParts.length === 2) {
      street = addressParts[0];
      country = addressParts[1];
    } else if (addressParts.length >= 3) {
      street = addressParts.slice(0, -2).join(", ");
      city = addressParts[addressParts.length - 2];
      country = addressParts[addressParts.length - 1];
    }

    return { street, city, country };
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        const countriesData = await countriesApi.getAfricanCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching countries:", error);
        toast.error("Failed to load countries");
      } finally {
        setCountriesLoading(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const loadVendorData = async () => {
      if (!user?.id) return;
      try {
        await getOwnVendorProfile();
      } catch (error) {
        console.error("Failed to load vendor data:", error);
        toast.error("Failed to load vendor information");
      }
    };
    loadVendorData();
  }, [user?.id, getOwnVendorProfile]);

  useEffect(() => {
    if (selectedVendor) {
      // Get street from direct field or parse from businessAddress
      let street = selectedVendor.street || "";
      let city = selectedVendor.city || "";
      let country = selectedVendor.country || "";

      // If not available directly, try parsing from businessAddress
      if (!street && selectedVendor.businessAddress) {
        const parsed = parseAddress(selectedVendor.businessAddress);
        street = parsed.street;
        if (!city) city = parsed.city;
        if (!country) country = parsed.country;
      }

      const category =
        (selectedVendor as any).category ||
        (selectedVendor as any).storeCategory ||
        (selectedVendor as any).businessType ||
        "";

      const storyVideoUrl =
        (selectedVendor as any).storyVideoUrl ||
        (selectedVendor as any).introVideoUrl ||
        (selectedVendor as any).vendorStoryVideo ||
        "";

      const newFormData: StoreFormData = {
        businessName: selectedVendor.storeName || selectedVendor.businessName || "",
        category: category,
        businessDescription: selectedVendor.businessDescription || selectedVendor.storyText || "",
        businessEmail: selectedVendor.businessEmail || "",
        businessPhone: selectedVendor.businessPhone || "",
        businessAddress: street,
        country: country,
        city: city,
        storyVideoUrl: storyVideoUrl,
      };

      setFormData(newFormData);
      setIsDirty(false);
    }
  }, [selectedVendor]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.country) {
        setCities([]);
        return;
      }

      try {
        setCitiesLoading(true);
        const citiesData = await countriesApi.getCitiesByCountry(formData.country);
        setCities(citiesData);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
        toast.error("Failed to load cities for selected country");
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, [formData.country]);

  const handleCountryChange = (value: string) => {
    updateFormData("country", value);
  };

  const handleCityChange = (value: string) => {
    updateFormData("city", value);
  };

  const handleCitySearch = async (searchValue: string) => {
    if (!formData.country) return;
    try {
      const filteredCities = await countriesApi.searchCities(formData.country, searchValue);
      setCities(filteredCities);
    } catch (error) {
      console.error("Error searching cities:", error);
    }
  };

  const handleVideoChange = (videoUrl: string | null) => {
    updateFormData("storyVideoUrl", videoUrl || "");
    toast.info(videoUrl ? "Video uploaded successfully!" : "Video removed", {
      duration: 3000,
    });
  };

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      errors.businessName = "Store name is required";
    } else if (formData.businessName.trim().length < 3) {
      errors.businessName = "Store name must be at least 3 characters";
    }

    if (!formData.category) {
      errors.category = "Store category is required";
    }

    if (!formData.businessDescription.trim()) {
      errors.businessDescription = "Store description is required";
    } else if (formData.businessDescription.trim().length < 50) {
      errors.businessDescription = "Description should be at least 50 characters";
    }

    if (!formData.country) {
      errors.country = "Country is required";
    }

    if (!formData.city) {
      errors.city = "City is required";
    }

    if (formData.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      errors.businessEmail = "Please enter a valid email address";
    }

    if (formData.businessPhone && !/^[\d\s\+\-\(\)]{10,20}$/.test(formData.businessPhone)) {
      errors.businessPhone = "Please enter a valid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = formData.businessAddress.trim()
        ? `${formData.businessAddress}, ${formData.city}, ${formData.country}`
        : `${formData.city}, ${formData.country}`;

      const updatedVendorData: any = {
        ...selectedVendor,
        businessName: formData.businessName.trim(),
        storeName: formData.businessName.trim(),
        businessDescription: formData.businessDescription.trim(),
        businessEmail: formData.businessEmail.trim() || user?.email || "",
        businessPhone: formData.businessPhone.trim() || user?.phoneNumber || "",
        businessAddress: fullAddress,
        street: formData.businessAddress.trim(),
        city: formData.city,
        country: formData.country,
        storyVideoUrl: formData.storyVideoUrl || null,
      };

      updatedVendorData.category = formData.category;

      updateVendor(updatedVendorData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Store updated successfully!");
      setIsDirty(false);
    } catch (error: any) {
      console.error("Failed to update store:", error);
      toast.error(error.message || "Failed to update store");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        resetForm();
        toast.info("Changes discarded");
      }
    } else {
      toast.info("No changes to discard");
    }
  };

  const resetForm = () => {
    if (selectedVendor) {
      // Get street from direct field or parse from businessAddress
      let street = selectedVendor.street || "";
      let city = selectedVendor.city || "";
      let country = selectedVendor.country || "";

      // If not available directly, try parsing from businessAddress
      if (!street && selectedVendor.businessAddress) {
        const parsed = parseAddress(selectedVendor.businessAddress);
        street = parsed.street;
        if (!city) city = parsed.city;
        if (!country) country = parsed.country;
      }

      const category =
        (selectedVendor as any).category ||
        (selectedVendor as any).storeCategory ||
        (selectedVendor as any).businessType ||
        "";

      const storyVideoUrl =
        (selectedVendor as any).storyVideoUrl ||
        (selectedVendor as any).introVideoUrl ||
        (selectedVendor as any).vendorStoryVideo ||
        "";

      const newFormData: StoreFormData = {
        businessName: selectedVendor.storeName || selectedVendor.businessName || "",
        category: category,
        businessDescription: selectedVendor.businessDescription || selectedVendor.storyText || "",
        businessEmail: selectedVendor.businessEmail || "",
        businessPhone: selectedVendor.businessPhone || "",
        businessAddress: street,
        country: country,
        city: city,
        storyVideoUrl: storyVideoUrl,
      };

      setFormData(newFormData);
    }
    setFormErrors({});
    setIsDirty(false);
  };

  if (vendorLoading && !selectedVendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] px-4">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-[#CC5500] mb-3 sm:mb-4" />
        <span className="text-sm sm:text-base text-gray-600 text-center">
          Loading store information...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6 w-full">
      {/* ================= STORE DETAILS ================= */}
      <Card className="w-full border bg-white">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Store Details</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                This is how your shop will appear to buyers. Keep it clear and memorable.
              </p>
            </div>

            {/* Form Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              {/* Store Name */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm font-medium">Store Name *</Label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => updateFormData("businessName", e.target.value)}
                  placeholder="e.g. Your fit"
                  className={`h-10 sm:h-11 text-sm sm:text-base ${
                    formErrors.businessName ? "border-red-500" : ""
                  }`}
                />
                {formErrors.businessName && (
                  <p className="text-xs sm:text-sm text-red-500">{formErrors.businessName}</p>
                )}
              </div>

              {/* Store Category */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm font-medium">Store Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData("category", value)}
                >
                  <SelectTrigger
                    className={`h-10 sm:h-11 text-sm sm:text-base ${
                      formErrors.category ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_CATEGORIES.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="text-sm sm:text-base"
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-xs sm:text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              {/* Country Select */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  Country / Region *
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={handleCountryChange}
                  disabled={countriesLoading}
                >
                  <SelectTrigger
                    id="country"
                    className={`h-10 sm:h-11 w-full text-sm sm:text-base ${
                      formErrors.country ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={countriesLoading ? "Loading..." : "Select country"}
                    />
                  </SelectTrigger>
                  <SearchSelectContent searchPlaceholder="Search countries...">
                    {countries.map((country) => (
                      <SelectItem
                        key={country.code}
                        value={country.name}
                        className="text-sm sm:text-base"
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SearchSelectContent>
                </Select>
                {formErrors.country && (
                  <p className="text-xs sm:text-sm text-red-500">{formErrors.country}</p>
                )}
              </div>

              {/* City Select */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  City *
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={handleCityChange}
                  disabled={!formData.country || citiesLoading}
                >
                  <SelectTrigger
                    id="city"
                    className={`h-10 sm:h-11 w-full text-sm sm:text-base ${
                      formErrors.city ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        !formData.country
                          ? "Select country first"
                          : citiesLoading
                          ? "Loading..."
                          : "Select city"
                      }
                    />
                  </SelectTrigger>
                  <SearchSelectContent
                    searchPlaceholder="Search cities..."
                    onSearchChange={handleCitySearch}
                  >
                    {cities.map((city) => (
                      <SelectItem
                        key={`${city.countryCode}-${city.name}`}
                        value={city.name}
                        className="text-sm sm:text-base"
                      >
                        {city.name}
                      </SelectItem>
                    ))}
                    {cities.length === 0 && formData.country && (
                      <div className="px-2 py-1.5 text-xs sm:text-sm text-muted-foreground text-center">
                        No cities found
                      </div>
                    )}
                  </SearchSelectContent>
                </Select>
                {formErrors.city && (
                  <p className="text-xs sm:text-sm text-red-500">{formErrors.city}</p>
                )}
              </div>

              {/* Business Email */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm font-medium">Business Email</Label>
                <Input
                  value={formData.businessEmail}
                  onChange={(e) => updateFormData("businessEmail", e.target.value)}
                  placeholder="business@example.com"
                  className={`h-10 sm:h-11 text-sm sm:text-base ${
                    formErrors.businessEmail ? "border-red-500" : ""
                  }`}
                  type="email"
                />
                <p className="text-xs text-gray-500">
                  Leave empty to use: {user?.email || "your account email"}
                </p>
                {formErrors.businessEmail && (
                  <p className="text-xs sm:text-sm text-red-500">{formErrors.businessEmail}</p>
                )}
              </div>

              {/* Business Phone */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm font-medium">Business Phone</Label>
                <Input
                  value={formData.businessPhone}
                  onChange={(e) => updateFormData("businessPhone", e.target.value)}
                  placeholder="+256 XXX XXX XXX"
                  className={`h-10 sm:h-11 text-sm sm:text-base ${
                    formErrors.businessPhone ? "border-red-500" : ""
                  }`}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to use: {user?.phoneNumber || "your account phone"}
                </p>
                {formErrors.businessPhone && (
                  <p className="text-xs sm:text-sm text-red-500">{formErrors.businessPhone}</p>
                )}
              </div>

              {/* Business Address - Full Width */}
              <div className="sm:col-span-2 space-y-1.5 sm:space-y-2">
                <Label className="text-sm font-medium">Business Address (Street)</Label>
                <Input
                  value={formData.businessAddress}
                  onChange={(e) => updateFormData("businessAddress", e.target.value)}
                  placeholder="Street address, building, etc."
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500">
                  Street address only. Country and city will be added automatically.
                </p>
              </div>

              {/* Store Description - Full Width */}
              <div className="sm:col-span-2 space-y-1.5 sm:space-y-2">
                <Label className="text-sm font-medium">Store Description *</Label>
                <Textarea
                  value={formData.businessDescription}
                  onChange={(e) => updateFormData("businessDescription", e.target.value)}
                  placeholder="Tell buyers about your store, your products, and what makes you unique..."
                  className={`min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base ${
                    formErrors.businessDescription ? "border-red-500" : ""
                  }`}
                />
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <p className="text-xs text-gray-500">
                    Minimum 50 characters. {formData.businessDescription.length}/50
                  </p>
                  {formErrors.businessDescription && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {formErrors.businessDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= VENDOR STORY ================= */}
      <Card className="w-full border bg-white">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Vendor Story</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Share your story through a short video to connect better with customers.
              </p>
            </div>

            {/* Video Upload Component */}
            <VideoUpload
              onVideoChange={handleVideoChange}
              initialUrl={formData.storyVideoUrl}
              maxSize={50}
              description="Upload a short video introducing yourself and your business. Keep it under 2 minutes for best results."
              footer={true}
              bucket="videos"
              folder="vendor-stories"
              className="w-full"
            />

            {/* Video Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1.5 sm:mb-2">
                Video Guidelines
              </h3>
              <ul className="text-xs text-blue-700 space-y-0.5 sm:space-y-1">
                <li>• Keep your video under 2 minutes</li>
                <li>• Introduce yourself and your passion</li>
                <li>• Showcase your products or craft</li>
                <li>• Good lighting and clear audio are important</li>
                <li>• Supported formats: MP4, MOV, AVI, WMV, FLV, WebM</li>
                <li>• Maximum file size: 50MB</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button
                type="button"
                variant="secondary"
                className="h-10 sm:h-11 w-full sm:flex-1 text-sm sm:text-base"
                onClick={handleCancel}
                disabled={isSubmitting || actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`h-10 sm:h-11 w-full sm:flex-1 text-sm sm:text-base ${
                  isSubmitting || actionLoading || !isDirty
                    ? "bg-[#CC5500]/50 cursor-not-allowed"
                    : "bg-[#CC5500] hover:bg-[#CC5500]/90"
                } text-white`}
                disabled={isSubmitting || actionLoading || !isDirty}
              >
                {isSubmitting || actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Store"
                )}
              </Button>
            </div>

            {/* Form Status */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 text-xs sm:text-sm">
              <div>
                {isDirty && <span className="text-amber-600">You have unsaved changes</span>}
              </div>
              <div className="text-gray-500">Required fields are marked with *</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}