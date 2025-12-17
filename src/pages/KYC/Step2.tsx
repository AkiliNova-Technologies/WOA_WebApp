import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SearchSelectContent,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  countriesApi,
  //  type City,
  type Country,
} from "@/lib/countries";
import React from "react";
import type { FormData } from "./StepsContainer";

interface Step2Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step2({ formData, updateFormData }: Step2Props) {
  const [countries, setCountries] = React.useState<Country[]>([]);
  // const [cities, setCities] = React.useState<City[]>([]);
  // const [citiesLoading, setCitiesLoading] = React.useState(false);
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
  // React.useEffect(() => {
  //   const fetchCities = async () => {
  //     if (!formData.country) {
  //       setCities([]);
  //       return;
  //     }

  //     try {
  //       setCitiesLoading(true);
  //       const citiesData = await countriesApi.getCitiesByCountry(
  //         formData.country
  //       );
  //       setCities(citiesData);
  //     } catch (error) {
  //       console.error("Error fetching cities:", error);
  //       setCities([]);
  //     } finally {
  //       setCitiesLoading(false);
  //     }
  //   };

  //   fetchCities();
  // }, [formData.country]);

  const handleCountryChange = (value: string) => {
    updateFormData({
      country: value,
      city: "", // Reset city when country changes
    });
  };

  // const handleCityChange = (value: string) => {
  //   updateFormData({ city: value });
  // };

  // const handleCitySearch = async (searchValue: string) => {
  //   if (!formData.country) return;

  //   try {
  //     const filteredCities = await countriesApi.searchCities(
  //       formData.country,
  //       searchValue
  //     );
  //     setCities(filteredCities);
  //   } catch (error) {
  //     console.error("Error searching cities:", error);
  //   }
  // };

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
  };

  // Helper function to get country name from code
  const getCountryName = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  return (
    <div>
      {/* Shop Name Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Shop Name</h2>
        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
          This is how your shop will appear to buyers. Keep it clear and
          memorable.
        </p>

        <div className="space-y-6">
          <div>
            <Label htmlFor="storeName" className="mb-2 block">
              Store name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="storeName"
              placeholder="e.g. Johnshop"
              className="h-11"
              value={formData.storeName}
              onChange={(e) => handleInputChange("storeName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="country" className="mb-2 block">
                Country of Operation <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
                disabled={loading}
              >
                <SelectTrigger id="country" className="min-h-11 w-full">
                  <SelectValue
                    placeholder={
                      loading ? "Loading countries..." : "Select the country"
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

            <div>
              <Label htmlFor="city" className="mb-2 block">
                City of Operation <span className="text-red-500">*</span>
              </Label>
              {/* <Select
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
                        : "Select the city"
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
              </Select> */}

              <Input
                id="city"
                placeholder="Select the city"
                className="h-11"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-2">
          Enter Address of the shop
        </h2>
        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
          By sharing a verified location, you unlock access to local logistics
          support, and guarantee that payouts and compliance checks run
          seamlessly.
        </p>

        <div className="space-y-6">
          <div>
            <Label htmlFor="district" className="mb-2 block">
              District <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.district}
              onValueChange={(value) => handleInputChange("district", value)}
            >
              <SelectTrigger id="district" className="min-h-11 w-full">
                <SelectValue placeholder="Select the city" />
              </SelectTrigger>
              <SearchSelectContent searchPlaceholder="Search districts...">
                {/* Add your district options here */}
                <SelectItem value="district1">District 1</SelectItem>
                <SelectItem value="district2">District 2</SelectItem>
              </SearchSelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="streetName" className="mb-2 block">
              Street name/Street number/landmark{" "}
              <span className="text-gray-500">(optional)</span>
            </Label>
            <Input
              id="streetName"
              placeholder="Select the city"
              className="h-11"
              value={formData.streetName}
              onChange={(e) => handleInputChange("streetName", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="additionalAddress" className="mb-2 block">
              Additional details/Detailed address{" "}
              <span className="text-gray-500">(optional)</span>
            </Label>
            <Textarea
              id="additionalAddress"
              rows={5}
              className="resize-none"
              value={formData.additionalAddress}
              onChange={(e) =>
                handleInputChange("additionalAddress", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
