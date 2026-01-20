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
import { Button } from "@/components/ui/button";
import {
  // countriesApi,
  type Country,
} from "@/lib/countries";
import React, { useEffect } from "react";
import type { FormData } from "./StepsContainer";
import { toast } from "sonner";
import images from "@/assets/images";

interface Step2Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onLocationVerified?: (coordinates: {
    latitude: number;
    longitude: number;
  }) => void;
}

interface LocationAccuracy {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export default function Step2({
  formData,
  updateFormData,
  onLocationVerified,
}: Step2Props) {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showLocationVerification, setShowLocationVerification] =
    React.useState(false);
  const [showAddressConfirmation, setShowAddressConfirmation] =
    React.useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = React.useState(false);
  const [detectedAddress, setDetectedAddress] = React.useState("");
  const [locationProgress, setLocationProgress] = React.useState(0);
  const [currentAccuracy, setCurrentAccuracy] = React.useState<number | null>(
    null,
  );
  const [bestLocation, setBestLocation] =
    React.useState<LocationAccuracy | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        // 🔒 COMMENTED OUT REAL API CALL
        // const countriesData = await countriesApi.getAfricanCountries();

        // 🔧 MOCK DATA: African countries with all required properties
        const mockCountries: Country[] = [
          { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬" },
          { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
          { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿" },
          { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" },
          { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
          { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭" },
          { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
          { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹" },
        ];

        setCountries(mockCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (value: string) => {
    updateFormData({
      country: value,
      city: "", // Reset city when country changes
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
  };

  // Helper function to get country name from code
  const getCountryName = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  const handleContinueToLocationVerification = () => {
    // Validate required fields before showing location verification
    if (
      !formData.storeName ||
      !formData.country ||
      !formData.city ||
      !formData.district
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Don't allow location verification if email isn't verified
    if (!formData.emailVerified) {
      toast.error("Please complete email verification first");
      return;
    }

    setShowLocationVerification(true);
  };

  /**
   * Reverse geocode using the free BigDataCloud API
   * This is a reliable free alternative to Nominatim with better rate limits
   */
  /**
   * Reverse geocode using mock data instead of real API
   */
  const reverseGeocode = async (
    latitude: number,
    longitude: number,
  ): Promise<string> => {
    try {
      // 🔧 MOCK DATA: Return a simulated address
      const mockAddresses = [
        `Kampala, Central Region, Uganda`,
        `Nairobi, Nairobi County, Kenya`,
        `Dar es Salaam, Dar es Salaam Region, Tanzania`,
        `Kigali, Kigali City, Rwanda`,
        `Accra, Greater Accra Region, Ghana`,
        `Johannesburg, Gauteng, South Africa`,
        `Addis Ababa, Addis Ababa, Ethiopia`,
        `Lagos, Lagos State, Nigeria`,
      ];

      // Pick a random mock address or use coordinates
      const randomIndex = Math.floor(Math.random() * mockAddresses.length);
      return mockAddresses[randomIndex];

      /*
    // 🔒 COMMENTED OUT REAL API CALL
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();

    // Build a comprehensive address from the response
    const addressParts = [
      data.locality || data.city,
      data.principalSubdivision,
      data.countryName,
    ].filter(Boolean);

    return addressParts.length > 0
      ? addressParts.join(", ")
      : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    */
    } catch (error) {
      console.error("Error with geocoding:", error);
      // Return coordinates as fallback
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const handleVerifyLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsVerifyingLocation(true);
    setLocationProgress(0);
    setCurrentAccuracy(null);
    setBestLocation(null);

    const COLLECTION_DURATION = 3000; // Reduced to 3 seconds for simulation
    const PROGRESS_INTERVAL = 100;
    const startTime = Date.now();
    let progressInterval: NodeJS.Timeout;

    // 🔧 MOCK DATA: Simulate location verification without actual GPS
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / COLLECTION_DURATION) * 100, 100);
      setLocationProgress(progress);

      // Simulate improving accuracy
      if (elapsed < COLLECTION_DURATION) {
        const simulatedAccuracy = Math.max(5, 100 - (progress / 100) * 95);
        setCurrentAccuracy(simulatedAccuracy);
      }
    }, PROGRESS_INTERVAL);

    try {
      // 🔧 MOCK DATA: Simulate location collection
      setTimeout(async () => {
        clearInterval(progressInterval);
        setLocationProgress(100);

        // Generate mock coordinates (Kampala, Uganda coordinates)
        const mockCoordinates = {
          latitude: 0.3476 + (Math.random() * 0.01 - 0.005), // Small random variation
          longitude: 32.5825 + (Math.random() * 0.01 - 0.005),
          accuracy: 5 + Math.random() * 10,
          timestamp: Date.now(),
        };

        setBestLocation(mockCoordinates);

        try {
          // Reverse geocode with mock data
          const address = await reverseGeocode(
            mockCoordinates.latitude,
            mockCoordinates.longitude,
          );

          setDetectedAddress(address);

          // Store coordinates in form data
          const coordinates = {
            latitude: mockCoordinates.latitude,
            longitude: mockCoordinates.longitude,
          };
          updateFormData({ gpsCoordinates: coordinates });

          // Show success message with accuracy info
          toast.success(
            `Location captured with ${mockCoordinates.accuracy.toFixed(0)}m accuracy (Simulated)`,
          );

          // Transition to address confirmation
          setTimeout(() => {
            setShowLocationVerification(false);
            setShowAddressConfirmation(true);
            setIsVerifyingLocation(false);
            setLocationProgress(0);
          }, 500);
        } catch (error) {
          console.error("Error processing location:", error);
          toast.error("Failed to process location. Please try again.");
          setIsVerifyingLocation(false);
          setLocationProgress(0);
        }
      }, COLLECTION_DURATION);
    } catch (error) {
      console.error("Error verifying location:", error);
      toast.error("Failed to verify location. Please try again.");
      setIsVerifyingLocation(false);
      setLocationProgress(0);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };

  const handleConfirmAddress = () => {
    updateFormData({ locationVerified: true });
    if (onLocationVerified && formData.gpsCoordinates) {
      onLocationVerified(formData.gpsCoordinates);
    }
    setShowAddressConfirmation(false);
  };

  const handleReverifyLocation = () => {
    setShowAddressConfirmation(false);
    setShowLocationVerification(true);
    setBestLocation(null);
    setCurrentAccuracy(null);
  };

  // If location is already verified, show a success message
  useEffect(() => {
    if (
      formData.locationVerified &&
      !showLocationVerification &&
      !showAddressConfirmation
    ) {
      // Don't automatically mark step as completed
      // User must click "Save and continue" to proceed
    }
  }, [
    formData.locationVerified,
    showLocationVerification,
    showAddressConfirmation,
  ]);

  // Don't allow proceeding without email verification
  if (!formData.emailVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
        {/* Illustration */}
        <div className="mb-8">
          <img
            src={images.VerifyIMG}
            alt="checking email image"
            className="h-52 w-52 object-contain"
          />
          <p className="text-lg font-semibold fill-[#303030]">
            Email Verification Required
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Complete Email Verification First
        </h2>

        <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
          Please go back to Step 1 and complete your email verification before
          setting up your shop details.
        </p>

        <Button
          onClick={() => window.location.reload()} // Or navigate back if you have navigation logic
          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-12 rounded-full"
        >
          Go Back to Step 1
        </Button>
      </div>
    );
  }

  return (
    <div>
      {!showLocationVerification && !showAddressConfirmation ? (
        <>
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
                  onChange={(e) =>
                    handleInputChange("storeName", e.target.value)
                  }
                  disabled={formData.locationVerified}
                />
                {formData.locationVerified && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Location verified
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="country" className="mb-2 block">
                    Country of Operation <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.country}
                    onValueChange={handleCountryChange}
                    disabled={loading || formData.locationVerified}
                  >
                    <SelectTrigger id="country" className="min-h-11 w-full">
                      <SelectValue
                        placeholder={
                          loading
                            ? "Loading countries..."
                            : "Select the country"
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
                  <Input
                    id="city"
                    placeholder="Select the city"
                    className="h-11"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    disabled={formData.locationVerified}
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
              By sharing a verified location, you unlock access to local
              logistics support, and guarantee that payouts and compliance
              checks run seamlessly.
            </p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="district" className="mb-2 block">
                  District <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="district"
                  placeholder="Enter district"
                  className="h-11"
                  value={formData.district}
                  onChange={(e) =>
                    handleInputChange("district", e.target.value)
                  }
                  disabled={formData.locationVerified}
                />
              </div>

              <div>
                <Label htmlFor="streetName" className="mb-2 block">
                  Street name/Street number/landmark{" "}
                  <span className="text-gray-500">(optional)</span>
                </Label>
                <Input
                  id="streetName"
                  placeholder="Enter street details"
                  className="h-11"
                  value={formData.streetName}
                  onChange={(e) =>
                    handleInputChange("streetName", e.target.value)
                  }
                  disabled={formData.locationVerified}
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
                  placeholder="Enter additional address details"
                  value={formData.additionalAddress}
                  onChange={(e) =>
                    handleInputChange("additionalAddress", e.target.value)
                  }
                  disabled={formData.locationVerified}
                />
              </div>
            </div>
          </div>

          {/* Continue to Location Verification Button */}
          {!formData.locationVerified && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleContinueToLocationVerification}
                className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-8"
                disabled={
                  !formData.storeName ||
                  !formData.country ||
                  !formData.city ||
                  !formData.district
                }
              >
                Continue to Location Verification
              </Button>
            </div>
          )}

          {/* Success message when location is verified */}
          {formData.locationVerified && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    src={images.VerifyIMG}
                    alt="checking email image"
                    className="h-52 w-52 object-contain"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Location verified successfully! Your shop address has been
                    confirmed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : showLocationVerification ? (
        // Location Verification Screen with Loading State
        <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
          {/* Illustration */}
          <div className="mb-8">
            <img
              src={images.VerifyIMG}
              alt="checking email image"
              className="h-52 w-52 object-contain"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold mb-4 text-center">
            {isVerifyingLocation
              ? "Verifying your location"
              : "Verify your location"}
          </h2>

          {/* Description */}
          {!isVerifyingLocation ? (
            <>
              <p className="text-[#303030] dark:text-gray-400 mb-4 text-center max-w-2xl">
                To verify your shop location, please ensure you are physically
                at your shop premises. This allows us to capture the exact GPS
                pin of your store, helping customers trust your business and
                ensuring smooth deliveries.
              </p>

              <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-2xl text-sm">
                If you are not at your shop right now, you can pause here and
                return later — your progress will be saved, and you can complete
                verification once you're at the location.
              </p>
            </>
          ) : (
            <div className="w-full max-w-md mb-8">
              <p className="text-[#303030] dark:text-gray-400 mb-4 text-center">
                Improving location accuracy...
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-[#CC5500] h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${locationProgress}%` }}
                />
              </div>

              {/* Accuracy Info */}
              {currentAccuracy !== null && (
                <p className="text-sm text-center text-[#303030] dark:text-gray-400">
                  Current accuracy:{" "}
                  <span className="font-semibold">
                    {currentAccuracy.toFixed(0)}m
                  </span>
                  {bestLocation && (
                    <span className="ml-2">
                      (Best: {bestLocation.accuracy.toFixed(0)}m)
                    </span>
                  )}
                </p>
              )}

              <p className="text-xs text-center text-gray-500 mt-2">
                Please keep your device steady for best results
              </p>
            </div>
          )}

          {/* Verify Button */}
          {!isVerifyingLocation && (
            <Button
              onClick={handleVerifyLocation}
              className="bg-black hover:bg-black/90 text-white h-11 px-12 rounded-full mb-6"
            >
              VERIFY
            </Button>
          )}
        </div>
      ) : (
        // Address Confirmation Screen - REMOVED "Save and continue" button
        <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
          {/* Illustration */}
          <div className="mb-8">
            <img
              src={images.VerifyIMG}
              alt="checking email image"
              className="h-52 w-52 object-contain"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Confirm Address
          </h2>

          {/* Description */}
          <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
            Please review your shop address details carefully.
          </p>

          {/* Instructions */}
          <div className="mb-8 space-y-2 text-sm text-[#303030] dark:text-gray-400 max-w-2xl">
            <div className="flex items-start gap-2">
              <span>•</span>
              <span>
                If everything looks correct, click the main "Save and continue"
                button below to proceed.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span>•</span>
              <span>
                If something is wrong, choose Re-verify to update your location
                before moving forward.
              </span>
            </div>
          </div>

          {/* Address Display */}
          <div className="w-full max-w-2xl mb-8">
            <Label htmlFor="detectedAddress" className="mb-2 block">
              Address
            </Label>
            <Input
              id="detectedAddress"
              value={detectedAddress}
              readOnly
              className="h-11 bg-gray-50"
            />
            {bestLocation && (
              <p className="text-xs text-gray-500 mt-1">
                Location accuracy: {bestLocation.accuracy.toFixed(0)} meters
              </p>
            )}
          </div>

          {/* Action Buttons - ONLY Re-verify button here */}
          <div className="flex gap-4">
            <Button
              onClick={handleReverifyLocation}
              variant="outline"
              className="h-11 px-12 rounded-full"
            >
              RE-VERIFY
            </Button>
            <Button
              onClick={handleConfirmAddress}
              className="bg-black hover:bg-black/90 text-white h-11 px-12 rounded-full"
            >
              Confirm Address
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
