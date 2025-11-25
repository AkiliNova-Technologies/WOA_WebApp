import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

import { countriesApi, type City, type Country } from "@/lib/countries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/delete-dialog";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import images from "@/assets/images";
import { Switch } from "@/components/ui/switch";
import { AfricanPhoneInput } from "@/components/african-phone-input";
import { ArrowLeft } from "lucide-react";

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
    "I'm moving my business to my own site",
    "The income is not worth my time",
    "I'm switching to a different World of Afrika account or shop",
    "I'm focusing on craft fairs or other in-person sales",
    "Other",
  ],
  "personal reasons": [
    "I can't keep up with my orders",
    "I need to focus on family matters",
    "I'm starting a new job or moving to a new town",
    "It's no longer fun",
    "Other",
  ],
  "world of afrika ain't right for me": [
    "World of Afrika is complicated or hard to use",
    "World of Afrika is not a good fit for my product",
    "I'm not getting enough views or finding it hard to stand out",
    "I'm unhappy with World of Afrika's policies, recent changes or overall direction",
    "My business is too big for World of Afrika",
    "Other",
  ],
  "something else": [],
};

// Dummy data for form fields
const dummyUserData = {
  firstName: "Victor",
  lastName: "Wandulu",
  middleName: "John",
  email: "wandulu@tekjuice.co.uk",
  phoneNumber: "743027395",
  address: "Plot 19 Binayomba Road",
  street: "Plot 19",
  district: "Nakawa",
  additionalDetails: "",
  country: "Uganda",
  city: "Kampala",
};

export default function ProfileSettingsPage() {
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState(dummyUserData.phoneNumber);
  const [countryCode, setCountryCode] = useState("+256");

  // Add the missing state declarations
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [selectedSubReason, setSelectedSubReason] = useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = useState<string>("");

  // Address form state
  const [firstName, setFirstName] = useState(dummyUserData.firstName);
  const [lastName, setLastName] = useState(dummyUserData.lastName);
  const [middleName, setMiddleName] = useState(dummyUserData.middleName);
  const [email, setEmail] = useState(dummyUserData.email);
  const [address, setAddress] = useState(dummyUserData.address);
  const [street, setStreet] = useState(dummyUserData.street);
  const [district, setDistrict] = useState(dummyUserData.district);
  const [additionalDetails, setAdditionalDetails] = useState(
    dummyUserData.additionalDetails
  );
  const [isDefault, setIsDefault] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    promotions: true,
    myActivity: true,
    orderUpdates: true,
    wishlistFavorites: false,
    messages: true,
    reviewsFeedback: false,
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    dummyUserData.country
  );
  const [selectedCity, setSelectedCity] = useState<string>(dummyUserData.city);
  const [, setLoading] = useState(true);
  const [, setCitiesLoading] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

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

  // Handler for phone number changes
  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  // Handler for country code changes
  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
  };

  // Handle address form submission
  const handleSaveAddress = () => {
    // Handle address saving logic here
    console.log("Saving address:", {
      firstName,
      lastName,
      email,
      phoneNumber,
      country: selectedCountry,
      city: selectedCity,
      address,
      district,
      street,
      additionalDetails,
      isDefault,
    });

    // Show success message and go back to addresses tab
    alert("Address saved successfully!");
    setShowAddAddress(false);
  };

  // Handle notification settings change
  const handleNotificationChange = (
    key: keyof typeof notificationSettings,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle save notification settings
  const handleSaveNotifications = () => {
    console.log("Saving notification settings:", notificationSettings);
    alert("Notification settings saved successfully!");
  };

  // Handle edit profile
  const handleEditProfile = () => {
    console.log("Editing profile:", {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
    });
    alert("Profile updated successfully!");
  };

  // Handle update password
  const handleUpdatePassword = () => {
    console.log("Updating password");
    alert("Password updated successfully!");
  };

  // Handle edit address
  const handleEditAddress = () => {
    console.log("Editing address");
    alert("Address updated successfully!");
  };

  // Reset sub-reason when main reason changes
  useEffect(() => {
    setSelectedSubReason("");
  }, [selectedReason]);

  // Add New Address Form Component
  const AddAddressForm = () => (
    <div className="min-h-screen">
      <div className="bg-white p-6 px-8 rounded-md mb-6">
        <h1 className="text-2xl font-medium">Account Settings</h1>
      </div>
      {/* Header with Back Button */}
      <div className="bg-white p-6 rounded-md mb-6 flex items-center gap-3">
        <Button
          className="bg-white hover:bg-gray-100 text-[#303030] h-8 w-8 p-0"
          onClick={() => setShowAddAddress(false)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-medium">Add new address</h1>
      </div>

      {/* Address Form */}
      <div className="bg-white p-6 px-8 rounded-md">
        <Card className="shadow-none border-0">
          <CardContent className="space-y-6 p-0">
            {/* Country */}
            <div className="space-y-3">
              <Label className="font-medium">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="min-h-11 w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.name}
                      className="h-11"
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-medium">
                  First name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11"
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-medium">
                  Last name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Contact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  placeholder="Enter email address"
                  type="email"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-medium">
                  Contact <span className="text-red-500">*</span>
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

            {/* Address */}
            <div className="space-y-3">
              <Label className="font-medium">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11"
                placeholder="Enter your address"
              />
            </div>

            {/* City */}
            <div className="space-y-3">
              <Label className="font-medium">
                City <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="min-h-11 w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city, index) => (
                    <SelectItem key={index} value={city.name} className="h-11">
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District (Optional) */}
            <div className="space-y-3">
              <Label className="font-medium">
                District <span className="text-gray-500">(Optional)</span>
              </Label>
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="h-11"
                placeholder="Enter district"
              />
            </div>

            {/* Street/Landmark */}
            <div className="space-y-3">
              <Label className="font-medium">
                Street name / Street number / Landmark{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="h-11"
                placeholder="Enter street, number or landmark"
              />
            </div>

            {/* Additional Details (Optional) */}
            <div className="space-y-3">
              <Label className="font-medium">
                Additional details / Detailed Address{" "}
                <span className="text-gray-500">(Optional)</span>
              </Label>
              <Textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="min-h-24 resize-none"
                placeholder="Enter any additional address details"
              />
            </div>

            {/* Set as Default */}
            <div className="flex items-center justify-between space-x-3 py-4">
              <Label
                htmlFor="default-address"
                className="text-lg cursor-pointer"
              >
                Set as default
              </Label>
              <Switch
                checked={isDefault}
                onCheckedChange={setIsDefault}
                id="default-address"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                className="bg-[#CC5500] hover:bg-[#CC5500]/90 h-11 w-xs text-white"
                onClick={handleSaveAddress}
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // If showing add address form, return only that
  if (showAddAddress) {
    return <AddAddressForm />;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white p-6 rounded-md mb-6">
        <h1 className="text-2xl font-medium">Account Settings</h1>
      </div>

      {/* Tab List buttons */}
      <div className="bg-white p-6 rounded-md">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full justify-center h-14 bg-transparent p-0 border-b">
            <TabsTrigger
              value="account"
              className="flex-1 max-w-42 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-14"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="flex-1 max-w-42 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-14"
            >
              Addresses
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex-1 max-w-42 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-14"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="flex-1 max-w-42 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-14"
            >
              Payment settings
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="mt-8">
            <div className="space-y-8">
              {/* Create Your Password */}
              <Card className="shadow-none ">
                <CardHeader>
                  <CardTitle className="text-lg">Your Identity</CardTitle>
                  <CardDescription>
                    This section verifies who you are and how to communicate
                    with you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-5">
                      <div className="space-y-3">
                        <Label className="font-medium">First Name</Label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-medium">Middle Name</Label>
                        <Input
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-medium">Last Name</Label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <Label className="font-medium">Email</Label>
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-medium">Phone Number</Label>
                        <AfricanPhoneInput
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          countryCode={countryCode}
                          onCountryCodeChange={handleCountryCodeChange}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-row gap-5 justify-end mt-8">
                      <Button
                        variant={"secondary"}
                        className="h-11 bg-[#CC5500] hover:bg-[#CC5500]/80 text-white w-xs"
                        onClick={handleEditProfile}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Create Your Password */}
              <Card className="shadow-none ">
                <CardHeader>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-medium">Current Password</Label>
                      <Input
                        placeholder="Enter your current password"
                        className="h-11"
                        type="password"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-medium">Password</Label>
                      <Input
                        placeholder="Enter your new password"
                        className="h-11"
                        type="password"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-medium">Confirm Password</Label>
                      <Input
                        placeholder="Confirm your new password"
                        className="h-11"
                        type="password"
                      />
                    </div>

                    <div className="flex flex-1 flex-row gap-5 justify-end">
                      <Button
                        variant={"secondary"}
                        className="h-11 bg-[#CC5500] hover:bg-[#CC5500]/80 text-white w-xs"
                        onClick={handleUpdatePassword}
                      >
                        Update Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delete your account */}
              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle>
                    <h1 className="text-2xl font-medium">
                      Delete your account
                    </h1>
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
                          Your account settings will remain intact, and you can
                          reopen your account anytime.
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
                          <SelectItem
                            key={r.value}
                            value={r.value}
                            className="h-11"
                          >
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
                            <div
                              key={sub}
                              className="flex items-center space-x-3"
                            >
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
                        <Label
                          htmlFor="feedback"
                          className="text-md font-medium"
                        >
                          Do you have anything else to tell us?
                          <span className="text-[#8A8A8A]">Optional</span>
                        </Label>
                        <Textarea
                          id="feedback"
                          className="mt-2 h-28 resize-none"
                          value={additionalFeedback}
                          onChange={(e) =>
                            setAdditionalFeedback(e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    variant={"secondary"}
                    className={cn(
                      "h-11 rounded-full px-6 text-white font-semibold transition-colors duration-200",
                      selectedReason && selectedSubReason
                        ? "bg-[#DC2626] hover:bg-[#DC2626]/90"
                        : "bg-[#CCCCCC] hover:bg-[#CCCCCC]/60 cursor-not-allowed"
                    )}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={!selectedReason || !selectedSubReason}
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
          </TabsContent>

          {/* Addresses Settings */}
          <TabsContent value="addresses" className="mt-8">
            <div className="space-y-8">
              <div className="bg-white rounded-xl border py-8 px-6 flex flex-1 flex-row items-center justify-between">
                <p className="text-lg font-medium">Billing Address</p>
                <Button
                  className="bg-[#CC5500] hover:bg-[#CC5500] h-11 w-xs text-white"
                  onClick={() => setShowAddAddress(true)}
                >
                  Add new Address
                </Button>
              </div>

              <Card className="shadow-none px-6">
                <CardTitle className="text-xl font-medium">
                  Current Address
                </CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Full Name</Label>
                      <Input
                        value={`${firstName} ${lastName}`}
                        className="h-11"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Email</Label>
                      <Input value={email} className="h-11" readOnly />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Phone Number</Label>
                    <AfricanPhoneInput
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      countryCode={countryCode}
                      onCountryCodeChange={handleCountryCodeChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Address</Label>
                    <Input value={address} className="h-11" readOnly />
                  </div>
                </div>
                <div className="px-6 mt-6 flex flex-1 flex-row gap-5 justify-end">
                  <Button
                    className="bg-[#CC5500] hover:bg-[#CC5500] h-11 w-xs text-white"
                    onClick={handleEditAddress}
                  >
                    Edit Address
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="mt-8">
            <div className="space-y-8">
              <div className="bg-white rounded-xl border py-4 px-6">
                <p className="text-lg font-medium">Notify me about</p>
              </div>

              <Card className="shadow-none">
                <div className="space-y-6">
                  <div className="px-6">
                    <div className="flex flex-1 flex-row justify-between">
                      <Label htmlFor="promotions" className="text-lg mb-2">
                        Promotions
                      </Label>
                      <Switch
                        id="promotions"
                        checked={notificationSettings.promotions}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("promotions", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-[#000000BF]">
                      Be the first to know about discounts and special offers.
                    </p>
                  </div>
                  <div className="px-6">
                    <div className="flex flex-1 flex-row justify-between">
                      <Label htmlFor="my-activity" className="text-lg mb-2">
                        My activity
                      </Label>
                      <Switch
                        id="my-activity"
                        checked={notificationSettings.myActivity}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("myActivity", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-[#000000BF]">
                      Notifications and alerts based on your World of Afrika
                      activity.
                    </p>
                  </div>
                  <div className="px-6">
                    <div className="flex flex-1 flex-row justify-between">
                      <Label htmlFor="order-updates" className="text-lg mb-2">
                        Order Updates
                      </Label>
                      <Switch
                        id="order-updates"
                        checked={notificationSettings.orderUpdates}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("orderUpdates", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-[#000000BF]">
                      Share personalized updates on your orders, including
                      confirmation, shipping, delivery, and any delays.
                    </p>
                  </div>
                  <div className="px-6">
                    <div className="flex flex-1 flex-row justify-between">
                      <Label
                        htmlFor="wishlist-favorites"
                        className="text-lg mb-2"
                      >
                        Wishlist & Favorites
                      </Label>
                      <Switch
                        id="wishlist-favorites"
                        checked={notificationSettings.wishlistFavorites}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("wishlistFavorites", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-[#000000BF]">
                      Alert me when items I've saved go on sale, come back in
                      stock, or have limited availability.
                    </p>
                  </div>
                  <div className="px-6">
                    <div className="flex flex-1 flex-row justify-between">
                      <Label htmlFor="messages" className="text-lg mb-2">
                        Messages
                      </Label>
                      <Switch
                        id="messages"
                        checked={notificationSettings.messages}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("messages", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-[#000000BF]">
                      Messages from the World of Afrika community
                    </p>
                  </div>
                  <div className="px-6">
                    <div className="flex flex-1 flex-row justify-between">
                      <Label
                        htmlFor="reviews-feedback"
                        className="text-lg mb-2"
                      >
                        Reviews & Feedback
                      </Label>
                      <Switch
                        id="reviews-feedback"
                        checked={notificationSettings.reviewsFeedback}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("reviewsFeedback", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-[#000000BF]">
                      Gentle reminders to share your experience and help
                      artisans improve their craft.
                    </p>
                  </div>
                </div>
                <div className="px-6 mt-6 flex flex-1 flex-row gap-5 justify-end">
                  <Button
                    className="bg-[#CC5500] hover:bg-[#CC5500] h-11 w-sm text-white"
                    onClick={handleSaveNotifications}
                  >
                    Save
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="mt-8">
            <div>
              <Card className="shadow-none">
                <div className="flex flex-col items-center justify-center py-6">
                  <img
                    src={images.EmptyWallet}
                    alt=""
                    className="h-3xs w-3xs mb-6"
                  />
                  <h2 className="text-lg">
                    It seems you don't have a payment method yet. You can add a
                    new payment method during a purchase.
                  </h2>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
