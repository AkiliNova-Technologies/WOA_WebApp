import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { countriesApi, type Country } from "@/lib/countries";
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
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxUsers } from "@/hooks/useReduxUsers";
import { toast } from "sonner";
import { useReduxAddresses } from "@/hooks/useReduxAddresses";
import { useReduxNotifications } from "@/hooks/useReduxNotifications";
import type { NotificationPreferences } from "@/redux/slices/notificationsSlice";
import type { Address as BaseAddress } from "@/redux/slices/addressesSlice";

// Extended Address type to handle both backend and frontend fields
type Address = BaseAddress & {
  recipient?: string;
  addLine1?: string;
  addLine2?: string | null;
  addLine3?: string | null;
  postCode?: string;
};

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

export default function ProfileSettingsPage() {
  const { user, updateCurrentUser, changePassword } = useReduxAuth();
  const { profile, getUserProfile, updateProfile, deleteAccount } =
    useReduxUsers();
  const {
    addresses,
    getAddresses,
    addAddress,
    editAddress,
    removeAddress,
    setAddressAsDefault,
  } = useReduxAddresses();
  const { preferences, getPreferences, updatePreferences } =
    useReduxNotifications();

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+256");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [selectedSubReason, setSelectedSubReason] = useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Notification settings
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationPreferences>(() => ({
      promotions: false,
      myActivity: false,
      orderUpdates: false,
      wishlistFavorites: false,
      messages: false,
      reviewsFeedback: false,
    }));

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        await Promise.all([getUserProfile(), getAddresses(), getPreferences()]);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Update notification settings when preferences are fetched
  useEffect(() => {
    if (preferences) {
      setNotificationSettings(preferences);
    }
  }, [preferences]);

  // Update form fields when user data changes
  useEffect(() => {
    if (profile) {
      const userData = profile.user || profile;

      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setEmail(userData.email || "");
      setPhoneNumber(userData.phoneNumber || "");
    } else if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [profile, user]);

  // Load address data when editing
  useEffect(() => {
    if (editingAddressId && addresses.length > 0) {
      const addressToEdit = addresses.find(
        (addr) => addr.id === editingAddressId
      );
      if (addressToEdit) {
        // Use a timeout to ensure we don't cause rapid re-renders
        const timer = setTimeout(() => {
          // Parse recipient name if it exists
          const recipientParts = addressToEdit.recipient?.split(' ') || [];
          const recipientFirstName = recipientParts[0] || '';
          const recipientLastName = recipientParts.slice(1).join(' ') || '';
          
          setFirstName(recipientFirstName || addressToEdit.firstName || "");
          setLastName(recipientLastName || addressToEdit.lastName || "");
          setEmail(user?.email || addressToEdit.email || "");
          setPhoneNumber(user?.phoneNumber || addressToEdit.phoneNumber || "");
          setSelectedCountry(addressToEdit.country || "");
          setSelectedCity(addressToEdit.city || "");
          setAddress(addressToEdit.address || addressToEdit.addLine1 || "");
          setStreet(addressToEdit.addLine1 || addressToEdit.street || "");
          setDistrict(addressToEdit.postCode || addressToEdit.district || "");
          setAdditionalDetails(addressToEdit.addLine2 || addressToEdit.additionalDetails || "");
          setIsDefault(addressToEdit.isDefault || false);
        }, 0);

        return () => clearTimeout(timer);
      }
    }
  }, [editingAddressId, addresses, user]);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await countriesApi.getAfricanCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Handle edit profile
  const handleEditProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setIsEditingProfile(true);
    try {
      const updatedData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(middleName && { middleName: middleName.trim() }),
        ...(phoneNumber && { phoneNumber }),
      };

      // Update in Redux store
      updateCurrentUser(updatedData);

      // Update in backend if you have an updateProfile function
      await updateProfile(updatedData);

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsEditingProfile(false);
    }
  };

  // Handle update password
  const handleUpdatePassword = async () => {
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

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password updated successfully!");
    } catch (error: any) {
      console.error("Failed to update password:", error);
      setPasswordError(error.message || "Failed to update password");
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Call the deleteAccount function from useReduxUsers
      await deleteAccount();

      toast.success("Account deletion process started successfully!");
      setDeleteDialogOpen(false);

      // Reset form
      setSelectedReason("");
      setSelectedSubReason("");
      setAdditionalFeedback("");

      // Redirect to home or login page
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(
        error.message || "Failed to delete account. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Handle save address (for both create and update)
  const handleSaveAddress = async () => {
    if (
      !firstName ||
      !lastName ||
      !selectedCountry ||
      !street ||
      !district
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const addressData: any = {
        recipient: `${firstName.trim()} ${lastName.trim()}`,
        addLine1: street.trim(),
        addLine2: additionalDetails.trim() || null,
        addLine3: null,
        postCode: district.trim(),
        country: selectedCountry,
        isDefault,
      };

      if (editingAddressId) {
        // Update existing address
        await editAddress({
          id: editingAddressId,
          ...addressData,
        });
        toast.success("Address updated successfully!");
      } else {
        // Create new address
        await addAddress(addressData);
        toast.success("Address saved successfully!");
      }

      // Reset form
      setShowAddAddress(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (error: any) {
      console.error("Failed to save address:", error);
      toast.error(error.message || "Failed to save address");
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (addresses.length <= 1) {
      toast.error("You must have at least one address");
      return;
    }

    try {
      await removeAddress(addressId);
      toast.success("Address deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete address:", error);
      toast.error(error.message || "Failed to delete address");
    }
  };

  // Handle set default address
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setAddressAsDefault(addressId);
      toast.success("Default address updated successfully!");
    } catch (error: any) {
      console.error("Failed to set default address:", error);
      toast.error(error.message || "Failed to set default address");
    }
  };

  // Handle edit address button click
  const handleEditAddressClick = (address: Address) => {
    setEditingAddressId(address.id);
    setShowAddAddress(true);
  };

  // Reset address form
  const resetAddressForm = () => {
    if (profile) {
      const userData = profile.user || profile;
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setEmail(userData.email || "");
      setPhoneNumber(userData.phoneNumber || "");
    }
    setSelectedCountry("");
    setSelectedCity("");
    setAddress("");
    setStreet("");
    setDistrict("");
    setAdditionalDetails("");
    setIsDefault(false);
    setEditingAddressId(null);
  };

  // Handle notification settings
  const handleSaveNotifications = async () => {
    try {
      await updatePreferences(notificationSettings);
      toast.success("Notification settings saved successfully!");
    } catch (error: any) {
      console.error("Failed to save notification settings:", error);
      toast.error(error.message || "Failed to save notification settings");
    }
  };

  // Handle phone number changes
  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  // Handle country code changes
  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCity("");
  };

  // Reset sub-reason when main reason changes
  useEffect(() => {
    setSelectedSubReason("");
  }, [selectedReason]);

  // Handler for notification settings change
  const handleNotificationChange = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // If showing add address form, return only that
  if (showAddAddress) {
    return (
      <div className="min-h-screen">
        <div className="bg-white p-6 px-8 rounded-md mb-6">
          <h1 className="text-2xl font-medium">Account Settings</h1>
        </div>
        {/* Header with Back Button */}
        <div className="bg-white p-6 rounded-md mb-6 flex items-center gap-3">
          <Button
            className="bg-white hover:bg-gray-100 text-[#303030] h-8 w-8 p-0"
            onClick={() => {
              setShowAddAddress(false);
              setEditingAddressId(null);
              resetAddressForm();
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">
            {editingAddressId ? "Edit Address" : "Add new address"}
          </h1>
        </div>

        {/* Address Form */}
        <div className="bg-white p-6 px-8 rounded-md">
          <Card className="shadow-none border-0 py-6">
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
                    disabled
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
                  Address <span className="text-gray-500">(Optional)</span>
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
                  City <span className="text-gray-500">(Optional)</span>
                </Label>
                <Input
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-11"
                  placeholder="Enter your City"
                />
              </div>

              {/* Post Code */}
              <div className="space-y-3">
                <Label className="font-medium">
                  Post Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="h-11"
                  placeholder="Enter post code"
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
              <div className="flex justify-end pt-4 gap-4">
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    setShowAddAddress(false);
                    setEditingAddressId(null);
                    resetAddressForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#CC5500] hover:bg-[#CC5500]/90 h-11 w-xs text-white"
                  onClick={handleSaveAddress}
                  disabled={
                    !firstName ||
                    !lastName ||
                    !selectedCountry ||
                    !street ||
                    !district
                  }
                >
                  {editingAddressId ? "Update Address" : "Save Address"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
              <Card className="shadow-none py-6">
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
                          placeholder="Enter middle name (optional)"
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
                          type="email"
                          disabled
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
                        disabled={isEditingProfile}
                      >
                        {isEditingProfile ? "Saving..." : "Edit Profile"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Create Your Password */}
              <Card className="shadow-none py-6">
                <CardHeader>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {passwordError && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-md">
                        {passwordError}
                      </div>
                    )}
                    <div className="space-y-3">
                      <Label className="font-medium">Current Password</Label>
                      <Input
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="h-11"
                        type="password"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-medium">New Password</Label>
                      <Input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="h-11"
                        type="password"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-medium">Confirm Password</Label>
                      <Input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        disabled={
                          isUpdatingPassword ||
                          !currentPassword ||
                          !newPassword ||
                          !confirmPassword
                        }
                      >
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delete your account */}
              <Card className="shadow-xs py-6">
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
                          Your account will be permanently deleted.
                        </li>
                        <li className="list-disc">
                          Your profile, shop, and listings will no longer appear
                          anywhere on World of Afrika.
                        </li>
                        <li className="list-disc">
                          We'll close any non-delivery cases you opened.
                        </li>
                        <li className="list-disc">
                          All your data will be removed from our systems.
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
                        setSelectedSubReason("");
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
                    {selectedReason &&
                      subReasons[selectedReason]?.length > 0 && (
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
                          <span className="text-[#8A8A8A] ml-2">Optional</span>
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
                      selectedReason &&
                        (selectedSubReason ||
                          selectedReason === "something else")
                        ? "bg-[#DC2626] hover:bg-[#DC2626]/90"
                        : "bg-[#CCCCCC] hover:bg-[#CCCCCC]/60 cursor-not-allowed"
                    )}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={
                      !selectedReason ||
                      (!selectedSubReason &&
                        selectedReason !== "something else")
                    }
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
                <p className="text-lg font-medium">Saved Addresses</p>
                <Button
                  className="bg-[#CC5500] hover:bg-[#CC5500] h-11 w-xs text-white"
                  onClick={() => {
                    resetAddressForm();
                    setShowAddAddress(true);
                  }}
                >
                  Add new Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <Card className="shadow-none py-6">
                  <div className="flex flex-col items-center justify-center p-6">
                    <img
                      src={images.EmptyWallet}
                      alt="No addresses"
                      className="h-3xs w-3xs mb-6"
                    />
                    <h2 className="text-md text-center mb-4">
                      You don't have any saved addresses yet.
                    </h2>
                  </div>
                </Card>
              ) : (
                <div className="space-y-6">
                  {addresses.map((addr) => {
                    return (
                      <Card key={addr.id} className="shadow-none px-6 py-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <CardTitle className="text-xl font-medium flex items-center gap-2">
                              {addr.isDefault && (
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                              {addr.recipient || `${addr.firstName || ''} ${addr.lastName || ''}`.trim()}
                            </CardTitle>
                            <p className="text-gray-600 mt-1">
                              {addr.country}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!addr.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="h-9"
                              >
                                Set as Default
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAddressClick(addr)}
                              className="h-9"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            {addresses.length > 1 && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="h-9"
                                disabled={
                                  addr.isDefault && addresses.length === 1
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="font-medium">
                                Contact Information
                              </Label>
                              <div className="space-y-1">
                                <p className="text-gray-700">{user?.email || addr.email}</p>
                                <p className="text-gray-700">
                                  {user?.phoneNumber || addr.phoneNumber}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="font-medium">
                                Address Details
                              </Label>
                              <div className="space-y-1">
                                {/* Display addLine1 (main address line) */}
                                {addr.addLine1 && (
                                  <p className="text-gray-700">{addr.addLine1}</p>
                                )}
                                {/* Display addLine2 if exists */}
                                {addr.addLine2 && (
                                  <p className="text-gray-700">{addr.addLine2}</p>
                                )}
                                {/* Display addLine3 if exists */}
                                {addr.addLine3 && (
                                  <p className="text-gray-700">{addr.addLine3}</p>
                                )}
                                {/* Display country */}
                                <p className="text-gray-700">{addr.country}</p>
                                {/* Display post code */}
                                {addr.postCode && (
                                  <p className="text-gray-700">
                                    Post Code: {addr.postCode}
                                  </p>
                                )}
                                
                              </div>
                            </div>
                          </div>
                        </div>

                        {addr.additionalDetails && (
                          <div className="mt-4 space-y-2">
                            <Label className="font-medium">
                              Additional Details
                            </Label>
                            <p className="text-gray-700">
                              {addr.additionalDetails}
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="mt-8">
            <div className="space-y-8">
              <div className="bg-white rounded-xl border py-4 px-6">
                <p className="text-lg font-medium">Notify me about</p>
              </div>

              <Card className="shadow-none py-6">
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
                <div className="flex flex-col items-center justify-center p-6">
                  <img
                    src={images.EmptyWallet}
                    alt=""
                    className="h-3xs w-3xs mb-6"
                  />
                  <h2 className="text-md text-center">
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