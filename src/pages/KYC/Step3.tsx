import { TextEditor } from "@/components/text-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SearchSelectContent,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countriesApi, type City, type Country } from "@/lib/countries";
import React from "react";
import { LogoUpload } from "@/components/logo-upload";
import type { FormData } from "./StepsContainer";
import { VideoUpload } from "@/components/video-upload";
import { AfricanPhoneInput } from "@/components/african-phone-input";

interface Step3Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step3({ formData, updateFormData }: Step3Props) {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Fetch countries on component mount
  React.useEffect(() => {
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
  React.useEffect(() => {
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

  const handleLogoChange = (file: File | null) => {
    updateFormData({ storeLogo: file });
    console.log("Store logo:", file);
  };

   const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleVideoChange = (file: File | null) => {
    updateFormData({ videoFile: file });
  };

  // Helper function to get country name from code
  const getCountryName = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Store Details</h2>
      <p className="text-sm text-[#303030] mb-8">
        This is how your shop will appear to buyers. Keep it clear and
        memorable.
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
                onChange={(e) => handleStoreNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
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
                <SelectTrigger id="country" className="min-h-11 w-full">
                  <SelectValue
                    placeholder={
                      loading ? "Loading countries..." : "Select country"
                    }
                  >
                    {formData.country && getCountryName(formData.country)}
                  </SelectValue>
                </SelectTrigger>
                <SearchSelectContent searchPlaceholder="Search countries...">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
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
                <SelectTrigger id="city" className="min-h-11 w-full">
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
                  {cities.length === 0 && formData.country && (
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
          <Label className="mb-2 block">Store Description</Label>
          <TextEditor
            value={formData.storeDescription}
            onChange={handleStoreDescriptionChange}
            placeholder="Start writing your amazing content..."
            className="mb-4"
          />
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

        {/* Logo Upload Field */}
        <div className="space-y-2">
          <Label className="text-xl font-semibold mb-2">Upload your Store Logo</Label>
          <LogoUpload
            onLogoChange={handleLogoChange}
            maxSize={2}
            className="mb-4"
            // initialLogo={formData.storeLogo}
          />
        </div>
      </div>
    </div>
  );
}
