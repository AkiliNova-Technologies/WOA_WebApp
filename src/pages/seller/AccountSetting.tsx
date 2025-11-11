"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SearchSelectContent,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { countriesApi, type Country, type City } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProfileImage } from "@/components/profile-image";
import { DeleteDialog } from "@/components/delete-dialog";
import { cn } from "@/lib/utils";

const reasons = [
  {
    value: "business reasons",
    label: "Business reasons",
  },
  {
    value: "personal reasons",
    label: "Personal reasons",
  },
  {
    value: "world of afrika ain't right for me",
    label: "World of Afrika ain't right for me",
  },
  {
    value: "something else",
    label: "Something else",
  },
];

// Sub-reasons for each main reason
const subReasons: Record<string, string[]> = {
  "business reasons": [
    "I only had one (or a few) things to sell",
    "I’m moving my business to my own site",
    "The income is not worth my time",
    "I’m switching to a different World of Afrika account or shop",
    "I’m focusing on craft fairs or other in-person sales",
    "Other",
  ],
  "personal reasons": [
    "I can’t keep up with my orders",
    "I need to focus on family matters",
    "I’m starting a new job or moving to a new town",
    "It’s no longer fun",
    "Other",
  ],
  "world of afrika ain't right for me": [
    "World of Afrika is complicated or hard to use",
    "World of Afrika is not a good fit for my product",
    "I’m not getting enough views or finding it hard to stand out",
    "I’m unhappy with World of Afrika’s policies, recent changes or overall direction",
    "My business is too big for World of Afrika",
    "Other",
  ],
  "something else": [],
};

export default function AccountSettingsPage() {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<string>("");
  const [selectedCity, setSelectedCity] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [citiesLoading, setCitiesLoading] = React.useState(false);

  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [selectedSubReason, setSelectedSubReason] = React.useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = React.useState("");
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [userName] = React.useState("John Doe");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

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

  const handleChooseImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB");
        return;
      }

      try {
        // Simulate upload - replace with your actual upload logic
        console.log("Uploading profile image:", file.name);

        // Create preview URL (in production, use the URL from your server)
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);

        // TODO: Upload to your backend
        // const formData = new FormData();
        // formData.append('profileImage', file);
        // await fetch('/api/upload-profile', { method: 'POST', body: formData });
      } catch (error) {
        console.error("Error uploading profile image:", error);
        alert("Failed to upload image. Please try again.");
      }
    }

    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Replace with actual delete API call
      // await fetch('/api/delete-account', { method: 'DELETE' });

      console.log("Account deletion data:", {
        reason: selectedReason,
        subReason: selectedSubReason,
        feedback: additionalFeedback,
      });

      // Show success message or redirect
      alert("Account deletion process started successfully!");
      setDeleteDialogOpen(false);

      // Reset form
      setSelectedReason("");
      setSelectedSubReason("");
      setAdditionalFeedback("");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Reset sub-reason when main reason changes
  React.useEffect(() => {
    setSelectedSubReason("");
  }, [selectedReason]);

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
                <Input
                  id="phoneNumber"
                  className="h-11"
                  placeholder="(603) 555-0123"
                />
              </div>
              <div>
                <Button
                  variant={"secondary"}
                  className="h-11 rounded-full px-10 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-semibold"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4">
              <ProfileImage
                src={profileImage}
                alt={userName}
                size="2xl"
                className="mb-4"
              />
              <div>
                <Button
                  variant={"outline"}
                  className="h-11 rounded-full px-6 border-[#CC5500] text-[#CC5500] hover:bg-[#CC5500] hover:text-white font-semibold"
                  onClick={handleChooseImageClick}
                >
                  Choose Image
                </Button>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
          </div>
        </CardContent>
      </Card>

      {/* Store Status */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-medium">Store Status</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input className="h-11" placeholder="Pending Approval" />
          </div>
          <div>
            <Button
              variant={"secondary"}
              className="h-11 rounded-full px-6 bg-[#CCCCCC] hover:bg-[#CCCCCC]/60 text-white font-semibold"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete your account */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-medium">Delete your account</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-6 text-[#1A1A1A]">
              <h2 className="text-xl font-medium mb-2">
                What happens when you delete your account?
              </h2>
              <ul className="px-8 space-y-1 text-sm">
                <li className="list-disc">
                  Your account will be inactive until you reopen it.
                </li>
                <li className="list-disc">
                  Your profile, shop, and listings will no longer appear
                  anywhere on World of Afrika.
                </li>
                <li className="list-disc">
                  We'll close any non-delivery cases you opened.
                </li>
                <li className="list-disc">
                  Your account settings will remain intact, and you can reopen
                  your account anytime.
                </li>
              </ul>
            </div>

            <p className="mb-2 font-medium">
              Please help us improve by telling us why you're leaving.
            </p>

            {/* Main Reason */}
            <Select
              value={selectedReason}
              onValueChange={(value) => {
                setSelectedReason(value);
                setSelectedSubReason(""); // Reset sub-reason when main reason changes
              }}
            >
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="h-11">
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Conditional Sub-reasons with Radio Buttons */}
            {selectedReason && (
              <div className="mt-4 space-y-3 py-4">
                <RadioGroup
                  value={selectedSubReason}
                  onValueChange={setSelectedSubReason}
                  className="space-y-4"
                >
                  {subReasons[selectedReason].map((sub) => (
                    <div key={sub} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={sub}
                        id={`${selectedReason}-${sub}`}
                      />
                      <Label
                        htmlFor={`${selectedReason}-${sub}`}
                        className="text-sm cursor-pointer"
                      >
                        {sub}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Additional Feedback */}
            {selectedReason && (
              <div className="mt-4">
                <Label htmlFor="feedback" className="text-md font-medium">
                  Do you have anything else to tell us?
                  <span className="text-[#8A8A8A]">Optional</span>
                </Label>
                <Textarea
                  id="feedback"
                  className="mt-2 h-28 resize-none"
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button
            variant={"secondary"}
            className={cn(
              "h-11 rounded-full px-6 text-white font-semibold transition-colors duration-200",
              selectedReason && selectedSubReason
                ? "bg-[#DC2626] hover:bg-[#DC2626]/90" // Destructive red when reason is selected
                : "bg-[#CCCCCC] hover:bg-[#CCCCCC]/60 cursor-not-allowed" // Gray when no reason
            )}
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!selectedReason}
          >
            Delete account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteAccount}
        loading={deleting}
      />
    </div>
  );
}
