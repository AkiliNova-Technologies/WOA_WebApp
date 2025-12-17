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
import React from "react";
import { countriesApi, type City, type Country } from "@/lib/countries";
import { Label } from "@/components/ui/label";

export function EditStore() {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<string>("");
  const [selectedCity, setSelectedCity] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [citiesLoading, setCitiesLoading] = React.useState(false);

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
      if (!selectedCountry) {
        setCities([]);
        return;
      }

      try {
        setCitiesLoading(true);
        setSelectedCity(""); // Reset city when country changes
        const citiesData = await countriesApi.getCitiesByCountry(
          selectedCountry
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
  }, [selectedCountry]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

  const handleCitySearch = async (searchValue: string) => {
    if (!selectedCountry) return;

    try {
      const filteredCities = await countriesApi.searchCities(
        selectedCountry,
        searchValue
      );
      setCities(filteredCities);
    } catch (error) {
      console.error("Error searching cities:", error);
    }
  };
  return (
    <div className="space-y-6">
      {/* ================= STORE DETAILS ================= */}
      <Card className="min-w-6xl max-w-8xl mx-auto shadow-xs border bg-white">
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
                <label className="text-sm font-medium">Store Name</label>
                <Input placeholder="e.g. Your fit" className="h-11" />
              </div>

              {/* Store Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Category</label>
                <Select>
                  <SelectTrigger className="min-h-11">
                    <SelectValue placeholder="Choose the category that best fits your products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="accessories">
                      Home Decor & Lifetyle
                    </SelectItem>
                    <SelectItem value="handmade">
                      Jewelry & Accessories
                    </SelectItem>
                    <SelectItem value="home">
                      Gourmet & Speciality Foods
                    </SelectItem>
                    <SelectItem value="beauty">Health & Beauty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              
                {/* Country Select */}
                <div>
                  <Label htmlFor="country" className="mb-2 block">
                    Country / Region
                  </Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={handleCountryChange}
                    disabled={loading}
                  >
                    <SelectTrigger id="country" className="min-h-11 w-full">
                      <SelectValue
                        placeholder={
                          loading ? "Loading countries..." : "Select country"
                        }
                      />
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
                    value={selectedCity}
                    onValueChange={handleCityChange}
                    disabled={!selectedCountry || citiesLoading}
                  >
                    <SelectTrigger id="city" className="min-h-11 w-full">
                      <SelectValue
                        placeholder={
                          !selectedCountry
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
                      {cities.length === 0 && selectedCountry && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                          No cities found
                        </div>
                      )}
                    </SearchSelectContent>
                  </Select>
                </div>
              

              {/* Store Description - Full Width */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Store Description</label>
                <Textarea
                  placeholder="Tell buyers about your store, your products, and what makes you unique..."
                  className="min-h-[120px] resize-none"
                  defaultValue="Namugenyi Sarah is a passionate entrepreneur based in Kampala, specializing in authentic Ugandan fashion and handmade accessories. With over 5 years of experience in local retail, she brings a vibrant mix of tradition and modern style to her storefront. Her products are ethically sourced, quality-checked, and crafted to celebrate East African culture.

Sarah is known for her responsive customer service, fast order fulfillment, and commitment to sustainable packaging. Whether you're shopping for a bold kitenge outfit or a unique gift, her store offers a curated experience that blends creativity, reliability, and heart."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= SELLER STORY ================= */}
      <Card className="max-w-6xl mx-auto shadow-xs border bg-white">
        <CardContent className="px-6">
          <h2 className="text-lg font-semibold mb-4">Vendor Story</h2>

          <div className="w-full overflow-hidden rounded-xl">
            <video
              controls
              className="w-full rounded-xl"
              src="/sample-video.mp4"
            />
          </div>

          <div className="flex flex-1 flex-row gap-5 items-center mt-8">
            <Button variant="secondary" className="h-11 flex-1">
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="h-11 bg-[#CC5500] hover:bg-[#CC5500]/80 text-white flex-1"
            >
              Update Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
