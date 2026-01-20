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

// Store categories
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

// Define the store form data type
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
  // Hooks
  const { user } = useReduxAuth();
  const { 
    selectedVendor, 
    getVendor, 
    updateVendor,
    loading: vendorLoading,
    actionLoading
  } = useReduxVendors();

  // State for countries and cities
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Store form state
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
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Helper to update form data
  const updateFormData = (field: keyof StoreFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  // Parse address to extract street, city, and country
  const parseAddress = (address: string = "") => {
    const addressParts = address.split(',').map(part => part.trim());
    
    let street = "";
    let city = "";
    let country = "";
    
    if (addressParts.length === 1) {
      street = addressParts[0];
    } else if (addressParts.length === 2) {
      street = addressParts[0];
      country = addressParts[1];
    } else if (addressParts.length >= 3) {
      street = addressParts.slice(0, -2).join(', ');
      city = addressParts[addressParts.length - 2];
      country = addressParts[addressParts.length - 1];
    }
    
    return { street, city, country };
  };

  // Fetch countries on component mount
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

  // Fetch vendor data
  useEffect(() => {
    const loadVendorData = async () => {
      if (!user?.id) return;

      try {
        await getVendor(user.id);
      } catch (error) {
        console.error("Failed to load vendor data:", error);
        toast.error("Failed to load vendor information");
      }
    };

    loadVendorData();
  }, [user?.id, getVendor]);

  // Initialize form with vendor data
  useEffect(() => {
    if (selectedVendor) {
      // Parse address to extract street, city, and country
      const { street, city, country } = parseAddress(selectedVendor.businessAddress);
      
      // Get category from vendor data
      const category = (selectedVendor as any).category || 
                      (selectedVendor as any).storeCategory || 
                      (selectedVendor as any).businessType || 
                      "";

      // Get story video URL from vendor data
      const storyVideoUrl = (selectedVendor as any).storyVideoUrl || 
                           (selectedVendor as any).introVideoUrl || 
                           (selectedVendor as any).vendorStoryVideo || 
                           "";

      const newFormData: StoreFormData = {
        businessName: selectedVendor.businessName || "",
        category: category,
        businessDescription: selectedVendor.businessDescription || "",
        businessEmail: selectedVendor.businessEmail || "",
        businessPhone: selectedVendor.businessPhone || "",
        businessAddress: street, // Only street address
        country: country,
        city: city,
        storyVideoUrl: storyVideoUrl,
      };

      setFormData(newFormData);
      setIsDirty(false);
    }
  }, [selectedVendor]);

  // Fetch cities when country changes
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
    updateFormData('country', value);
  };

  const handleCityChange = (value: string) => {
    updateFormData('city', value);
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

  // Handle video upload changes
  const handleVideoChange = (videoUrl: string | null) => {
    updateFormData('storyVideoUrl', videoUrl || "");
    toast.info(videoUrl ? "Video uploaded successfully!" : "Video removed", {
      duration: 3000,
    });
  };

  // Form validation
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      // Construct full address
      const fullAddress = formData.businessAddress.trim() 
        ? `${formData.businessAddress}, ${formData.city}, ${formData.country}`
        : `${formData.city}, ${formData.country}`;

      // Create updated vendor data
      const updatedVendorData: any = {
        ...selectedVendor, // Keep existing data
        businessName: formData.businessName.trim(),
        businessDescription: formData.businessDescription.trim(),
        businessEmail: formData.businessEmail.trim() || user?.email || "",
        businessPhone: formData.businessPhone.trim() || user?.phoneNumber || "",
        businessAddress: fullAddress,
        storyVideoUrl: formData.storyVideoUrl || null,
      };

      // Add category if it exists in VendorProfile type
      updatedVendorData.category = formData.category;

      // Update vendor in Redux store
      updateVendor(updatedVendorData);

      // Here you would typically make an API call to update the vendor
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Store updated successfully!");
      setIsDirty(false);
      
    } catch (error: any) {
      console.error("Failed to update store:", error);
      toast.error(error.message || "Failed to update store");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
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

  // Reset form to initial values
  const resetForm = () => {
    if (selectedVendor) {
      // Parse address to extract street, city, and country
      const { street, city, country } = parseAddress(selectedVendor.businessAddress);
      
      // Get category from vendor data
      const category = (selectedVendor as any).category || 
                      (selectedVendor as any).storeCategory || 
                      (selectedVendor as any).businessType || 
                      "";

      // Get story video URL from vendor data
      const storyVideoUrl = (selectedVendor as any).storyVideoUrl || 
                           (selectedVendor as any).introVideoUrl || 
                           (selectedVendor as any).vendorStoryVideo || 
                           "";

      const newFormData: StoreFormData = {
        businessName: selectedVendor.businessName || "",
        category: category,
        businessDescription: selectedVendor.businessDescription || "",
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

  // Show loading state while fetching vendor data
  if (vendorLoading && !selectedVendor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#CC5500]" />
        <span className="ml-2">Loading store information...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ================= STORE DETAILS ================= */}
      <Card className="min-w-5xl max-w-8xl mx-auto shadow-xs border bg-white py-6">
        <CardContent className="px-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Store Details</h2>
              <p className="text-sm text-gray-600">
                This is how your shop will appear to buyers. Keep it clear and
                memorable.
              </p>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name *</label>
                <Input 
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  placeholder="e.g. Your fit" 
                  className={`h-11 ${formErrors.businessName ? 'border-red-500' : ''}`}
                />
                {formErrors.businessName && (
                  <p className="text-sm text-red-500">{formErrors.businessName}</p>
                )}
              </div>

              {/* Store Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Category *</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => updateFormData('category', value)}
                >
                  <SelectTrigger className={`min-h-11 ${formErrors.category ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Choose the category that best fits your products" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              {/* Country Select */}
              <div className="space-y-2">
                <Label htmlFor="country" className="block">
                  Country / Region *
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={handleCountryChange}
                  disabled={countriesLoading}
                >
                  <SelectTrigger 
                    id="country" 
                    className={`min-h-11 w-full ${formErrors.country ? 'border-red-500' : ''}`}
                  >
                    <SelectValue
                      placeholder={
                        countriesLoading ? "Loading countries..." : "Select country"
                      }
                    />
                  </SelectTrigger>
                  <SearchSelectContent searchPlaceholder="Search countries...">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SearchSelectContent>
                </Select>
                {formErrors.country && (
                  <p className="text-sm text-red-500">{formErrors.country}</p>
                )}
              </div>

              {/* City Select */}
              <div className="space-y-2">
                <Label htmlFor="city" className="block">
                  City *
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={handleCityChange}
                  disabled={!formData.country || citiesLoading}
                >
                  <SelectTrigger 
                    id="city" 
                    className={`min-h-11 w-full ${formErrors.city ? 'border-red-500' : ''}`}
                  >
                    <SelectValue
                      placeholder={
                        !formData.country
                          ? "Select country first"
                          : citiesLoading
                          ? "Loading cities..."
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
                      >
                        {city.name}
                      </SelectItem>
                    ))}
                    {cities.length === 0 && formData.country && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                        No cities found
                      </div>
                    )}
                  </SearchSelectContent>
                </Select>
                {formErrors.city && (
                  <p className="text-sm text-red-500">{formErrors.city}</p>
                )}
              </div>

              {/* Business Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Email</label>
                <Input 
                  value={formData.businessEmail}
                  onChange={(e) => updateFormData('businessEmail', e.target.value)}
                  placeholder="business@example.com" 
                  className={`h-11 ${formErrors.businessEmail ? 'border-red-500' : ''}`}
                  type="email"
                />
                <p className="text-xs text-gray-500">
                  Leave empty to use your account email: {user?.email}
                </p>
                {formErrors.businessEmail && (
                  <p className="text-sm text-red-500">{formErrors.businessEmail}</p>
                )}
              </div>

              {/* Business Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Phone</label>
                <Input 
                  value={formData.businessPhone}
                  onChange={(e) => updateFormData('businessPhone', e.target.value)}
                  placeholder="+256 XXX XXX XXX" 
                  className={`h-11 ${formErrors.businessPhone ? 'border-red-500' : ''}`}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to use your account phone: {user?.phoneNumber || "Not set"}
                </p>
                {formErrors.businessPhone && (
                  <p className="text-sm text-red-500">{formErrors.businessPhone}</p>
                )}
              </div>

              {/* Business Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Business Address (Street)</label>
                <Input 
                  value={formData.businessAddress}
                  onChange={(e) => updateFormData('businessAddress', e.target.value)}
                  placeholder="Street address, building, etc." 
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Street address only. Country and city will be added automatically.
                </p>
              </div>

              {/* Store Description - Full Width */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Store Description *</label>
                <Textarea
                  value={formData.businessDescription}
                  onChange={(e) => updateFormData('businessDescription', e.target.value)}
                  placeholder="Tell buyers about your store, your products, and what makes you unique..."
                  className={`min-h-[120px] resize-none ${formErrors.businessDescription ? 'border-red-500' : ''}`}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Minimum 50 characters. {formData.businessDescription.length}/50
                  </p>
                  {formErrors.businessDescription && (
                    <p className="text-sm text-red-500">{formErrors.businessDescription}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= VENDOR STORY ================= */}
      <Card className="max-w-6xl mx-auto shadow-xs border bg-white py-6">
        <CardContent className="px-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Vendor Story</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share your story through a short video to connect better with customers.
              </p>
            </div>

            {/* Video Upload Component */}
            <VideoUpload
              onVideoChange={handleVideoChange}
              initialUrl={formData.storyVideoUrl}
              maxSize={50} // 50MB max size for story videos
              description="Upload a short video introducing yourself and your business. Keep it under 2 minutes for best results."
              footer={true}
              bucket="videos"
              folder="vendor-stories"
              className="w-full"
            />

            {/* Video Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Video Guidelines</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Keep your video under 2 minutes</li>
                <li>• Introduce yourself and your passion</li>
                <li>• Showcase your products or craft</li>
                <li>• Good lighting and clear audio are important</li>
                <li>• Supported formats: MP4, MOV, AVI, WMV, FLV, WebM</li>
                <li>• Maximum file size: 50MB</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-1 flex-row gap-5 items-center pt-6">
              <Button 
                type="button"
                variant="secondary" 
                className="h-11 flex-1"
                onClick={handleCancel}
                disabled={isSubmitting || actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                className={`h-11 flex-1 ${isSubmitting || actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting || actionLoading || !isDirty}
              >
                {(isSubmitting || actionLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Store"
                )}
              </Button>
            </div>

            {/* Form status indicators */}
            <div className="flex items-center justify-between text-sm">
              <div>
                {isDirty && (
                  <span className="text-amber-600">
                    You have unsaved changes
                  </span>
                )}
              </div>
              <div className="text-gray-500">
                Required fields are marked with *
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}