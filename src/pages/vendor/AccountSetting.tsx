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
import { useNavigate } from "react-router-dom";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxUsers } from "@/hooks/useReduxUsers";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

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

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { 
    user, 
    updateCurrentUser, 
    changePassword, 
    signout,
    getFullName,
    getAvatar,
    loading: authLoading 
  } = useReduxAuth();
  
  const { 
    profile, 
    updateProfile, 
    deleteAccount,
    loading: usersLoading 
  } = useReduxUsers();

  // Form states
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [streetAddress, setStreetAddress] = React.useState("");
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  
  // Change password states
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");

  // Location states
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<string>("");
  const [selectedCity, setSelectedCity] = React.useState<string>("");
  const [loadingCountries, setLoadingCountries] = React.useState(true);
  const [citiesLoading, setCitiesLoading] = React.useState(false);

  // Delete account states
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [selectedSubReason, setSelectedSubReason] = React.useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = React.useState("");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const loading = authLoading || usersLoading;

  // Initialize form with user data
  React.useEffect(() => {
    if (user || profile) {
      const userData = user || profile;
      if (userData) {
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setEmail(userData.email || "");
        setPhoneNumber(userData.phoneNumber || "");
        setProfileImage(getAvatar() || null);
      }
    }
  }, [user, profile, getAvatar]);

  // Fetch countries on component mount
  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const countriesData = await countriesApi.getAfricanCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching countries:", error);
        toast.error("Failed to load countries");
      } finally {
        setLoadingCountries(false);
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
        toast.error("Failed to load cities");
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

  // ========================
  // PROFILE IMAGE UPLOAD
  // ========================

  const handleChooseImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL immediately for better UX
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      // Create FormData for upload
      const formData = new FormData();
      formData.append("profileImage", file);
      formData.append("userId", user?.id || profile?.id || "");

      // Upload to backend
      const response = await fetch("/api/v1/user/upload-profile-image", {
        method: "POST",
        body: formData,
        headers: {
          // Note: Don't set Content-Type for FormData, browser does it automatically
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result?.avatarUrl) {
        // Update local state with new avatar URL
        const newAvatarUrl = result.avatarUrl;
        setProfileImage(newAvatarUrl);
        
        // Update user in Redux state
        updateCurrentUser({ avatar: newAvatarUrl });
        
        toast.success("Profile image updated successfully!");
      } else {
        throw new Error("No avatar URL in response");
      }
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      toast.error(error.message || "Failed to upload image");
      // Revert to previous image
      setProfileImage(getAvatar() || null);
    } finally {
      setIsUploading(false);
      // Reset the input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ========================
  // UPDATE PROFILE FUNCTION
  // ========================

  const handleUpdateProfile = async () => {
    try {
      // Validate required fields
      if (!firstName.trim()) {
        toast.error("First name is required");
        return;
      }
      if (!lastName.trim()) {
        toast.error("Last name is required");
        return;
      }

      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      };

      // Call update profile function
      await updateProfile(updateData);
      
      // Also update auth state if needed
      updateCurrentUser(updateData);
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  // ========================
  // CHANGE PASSWORD FUNCTION
  // ========================

  const handleChangePassword = async () => {
    // Reset error
    setPasswordError("");

    // Validate passwords
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      
      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordError("");
      
      toast.success("Password changed successfully!");
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // ========================
  // DELETE ACCOUNT FUNCTION
  // ========================

  const handleDeleteAccount = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for deleting your account");
      return;
    }

    setDeleting(true);
    try {
      // Prepare delete data
      const deleteData = {
        reason: selectedReason,
        subReason: selectedSubReason || undefined,
        additionalFeedback: additionalFeedback || undefined,
      };

      console.log("Deleting account with data:", deleteData);
      
      // Delete account using users hook
      await deleteAccount();
      
      toast.success("Account deleted successfully!");
      
      // Logout the user after account deletion
      await signout();
      
      // Navigate to home page
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // ========================
  // SAVE ADDRESS FUNCTION
  // ========================

  const handleSaveAddress = async () => {
    try {
      const addressData = {
        streetAddress: streetAddress.trim(),
        country: selectedCountry,
        city: selectedCity,
      };

      // Save to backend
      const response = await fetch("/api/v1/user/save-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      toast.success("Address saved successfully!");
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error.message || "Failed to save address");
    }
  };

  // Reset sub-reason when main reason changes
  React.useEffect(() => {
    setSelectedSubReason("");
  }, [selectedReason]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#CC5500]" />
        <span className="ml-2">Loading account settings...</span>
      </div>
    );
  }

  // Show error state if no user data
  if (!user && !profile) {
    return (
      <div className="min-h-screen p-6">
        <Card className="shadow-xs">
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Account Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                Unable to load your account information. Please try logging in again.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="bg-[#CC5500] hover:bg-[#CC5500]/90"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Account Settings */}
      <Card className="shadow-xs">
        <CardHeader className="border-b">
          <CardTitle>
            <h1 className="text-2xl font-medium">Account Settings</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="firstName" className="mb-2 block text-sm font-medium">
                  First name
                </Label>
                <Input
                  id="firstName"
                  className="h-11"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-2 block text-sm font-medium">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  className="h-11"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  className="h-11"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  className="h-11"
                  placeholder="(603) 555-0123"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="pt-4">
                <Button
                  variant="default"
                  className="h-11 rounded-full px-8 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-semibold"
                  onClick={handleUpdateProfile}
                  disabled={loading || !firstName.trim() || !lastName.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <ProfileImage
                  src={profileImage}
                  alt={getFullName() || "User"}
                  size="2xl"
                  className="mb-4 border-4 border-white shadow-lg"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-3 text-center">
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-6 border-[#CC5500] text-[#CC5500] hover:bg-[#CC5500] hover:text-white font-semibold transition-colors"
                  onClick={handleChooseImageClick}
                  disabled={isUploading || loading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Choose Image"
                  )}
                </Button>
                <p className="text-xs text-gray-500 max-w-xs">
                  Supported formats: JPEG, PNG. Max size: 5MB
                </p>
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

      {/* Change Password */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-medium">Change Password</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-red-600 text-sm">
              <AlertCircle className="inline-block w-4 h-4 mr-2" />
              {passwordError}
            </div>
          )}
          
          <div className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="currentPassword" className="mb-2 block text-sm font-medium">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                className="h-11"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={changingPassword || loading}
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword" className="mb-2 block text-sm font-medium">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                className="h-11"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changingPassword || loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirmNewPassword" className="mb-2 block text-sm font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                className="h-11"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={changingPassword || loading}
              />
            </div>
            
            <Button
              variant="default"
              className="h-11 rounded-full px-8 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-semibold"
              onClick={handleChangePassword}
              disabled={changingPassword || loading || !currentPassword || !newPassword || !confirmNewPassword}
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
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
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="streetAddress" className="mb-2 block text-sm font-medium">
              Street Address
            </Label>
            <Input
              id="streetAddress"
              className="h-11"
              placeholder="Enter street address"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Country Select */}
            <div>
              <Label htmlFor="country" className="mb-2 block text-sm font-medium">
                Country / Region
              </Label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
                disabled={loadingCountries || loading}
              >
                <SelectTrigger id="country" className="min-h-11 w-full">
                  <SelectValue
                    placeholder={
                      loadingCountries ? "Loading countries..." : "Select country"
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
              <Label htmlFor="city" className="mb-2 block text-sm font-medium">
                City
              </Label>
              <Select
                value={selectedCity}
                onValueChange={handleCityChange}
                disabled={!selectedCountry || citiesLoading || loading}
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
          
          <Button
            variant="default"
            className="h-11 rounded-full px-8 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-semibold"
            onClick={handleSaveAddress}
            disabled={loading || !streetAddress.trim() || !selectedCountry || !selectedCity}
          >
            Save Address
          </Button>
        </CardContent>
      </Card>

      {/* Store Status (For Vendors) */}
      {(user?.userType === "vendor" || profile?.userType === "vendor") && (
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-medium">Store Status</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Input 
                className="h-11" 
                placeholder={profile?.vendorStatus === "pending" ? "Pending Approval" : "Approved"}
                disabled 
              />
            </div>
            <div>
              <Button
                variant="outline"
                className="h-11 rounded-full px-8 border-[#CC5500] text-[#CC5500] hover:bg-[#CC5500] hover:text-white font-semibold transition-colors"
                onClick={() => navigate("/vendor")}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete your account */}
      <Card className="shadow-xs border-red-100">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-medium text-red-700">Delete your account</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <div className="mb-6 text-[#1A1A1A] bg-red-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-red-800">
                ⚠️ What happens when you delete your account?
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Your account will be permanently deleted and cannot be recovered</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Your profile, shop, and listings will be removed from World of Afrika</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>All your data including orders, messages, and preferences will be deleted</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Any active subscriptions or pending transactions will be cancelled</span>
                </li>
              </ul>
            </div>

            <p className="mb-4 font-medium">
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
              <div className="mt-4 space-y-3 py-4 border-t">
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
              <div className="mt-6">
                <Label htmlFor="feedback" className="text-sm font-medium block mb-2">
                  Do you have anything else to tell us?
                  <span className="text-gray-500 font-normal ml-2">(Optional)</span>
                </Label>
                <Textarea
                  id="feedback"
                  className="h-32 resize-none"
                  placeholder="Your feedback helps us improve..."
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button
            variant="destructive"
            className={cn(
              "h-11 rounded-full px-8 text-white font-semibold transition-colors duration-200",
              selectedReason
                ? "bg-red-600 hover:bg-red-700" // Destructive red when reason is selected
                : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" // Gray when no reason
            )}
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!selectedReason || loading}
          >
            Delete account permanently
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