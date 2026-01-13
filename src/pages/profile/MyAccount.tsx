"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileImage } from "@/components/profile-image";
import { AfricanPhoneInput } from "@/components/african-phone-input";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxUsers } from "@/hooks/useReduxUsers";
import { useEffect, useRef } from "react";

export default function MyAccountPage() {
  const { user, firebaseUser, getFullName, getAvatar } = useReduxAuth();
  const { profile, getUserProfile } = useReduxUsers();

  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  
  // Add state for phone number and country code
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+256"); // Default to Uganda
  const [streetAddress, setStreetAddress] = React.useState("");

  // Use refs to track if we've already set data from profile
  const hasSetProfileData = useRef(false);

  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        await getUserProfile();
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };
    
    loadUserData();
  }, [getUserProfile]);

  // Update state when user data changes - ONLY use profile data
  useEffect(() => {
    console.log("Profile useEffect triggered:", {
      profile: !!profile,
      user: !!user,
      hasSetProfileData: hasSetProfileData.current
    });

    // Reset the flag when profile becomes null (user logs out)
    if (!profile) {
      hasSetProfileData.current = false;
    }

    // Use profile data first (from usersSlice) - this should be the primary source
    if (profile && !hasSetProfileData.current) {
      console.log("Setting data from profile:", profile);
      
      // Extract user data from the nested structure
      const userData = profile.user || profile;
      
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setEmail(userData.email || "");
      
      // Handle phone number
      const phone = userData.phoneNumber || "";
      setPhoneNumber(phone);
      
      // Mark that we've set data from profile
      hasSetProfileData.current = true;
      
      // Set user name
      const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
      setUserName(fullName || "User");
      
      // Set profile image
      const avatar = userData.avatarUrl || userData.avatar || "";
      if (avatar) {
        setProfileImage(avatar);
      }
    }
    
    // Only use auth user data if we have NO profile data at all
    // and we haven't already set data from profile
    if (!hasSetProfileData.current && user && !profile) {
      console.log("Falling back to auth user data:", user);
      
      // Fallback to auth user data - but check if names are empty
      // If auth user has empty names, don't overwrite any existing form values
      if (user.firstName && user.firstName.trim() !== "") {
        setFirstName(user.firstName);
      }
      if (user.lastName && user.lastName.trim() !== "") {
        setLastName(user.lastName);
      }
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setUserName(getFullName() || "User");
      
      // Check for avatar
      const avatar = getAvatar();
      if (avatar) {
        setProfileImage(avatar);
      }
    }
    
    // Firebase is last resort
    if (!hasSetProfileData.current && !user && firebaseUser) {
      console.log("Using Firebase user data:", firebaseUser);
      
      // Fallback to Firebase user data
      const firebaseFirstName = firebaseUser.displayName?.split(" ")[0] || "";
      const firebaseLastName = firebaseUser.displayName?.split(" ").slice(1).join(" ") || "";
      
      if (firebaseFirstName.trim() !== "") {
        setFirstName(firebaseFirstName);
      }
      if (firebaseLastName.trim() !== "") {
        setLastName(firebaseLastName);
      }
      setEmail(firebaseUser.email || "");
      setUserName(firebaseUser.displayName || "User");
      
      if (firebaseUser.photoURL) {
        setProfileImage(firebaseUser.photoURL);
      }
    }
  }, [profile, user, firebaseUser, getFullName, getAvatar]);

  // Handler for phone number changes
  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  // Handler for country code changes
  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
  };

  // Handler for input changes
  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "streetAddress":
        setStreetAddress(value);
        break;
      default:
        break;
    }
  };

  // Render loading state
  if (!profile && !user && !firebaseUser) {
    return (
      <div className="space-y-6">
        <Card className="shadow-xs">
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading user data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card className="shadow-xs py-6">
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
                  value={firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled
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
                  value={lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled
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
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  type="email"
                  disabled // Email is usually not editable
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="mb-2 block">
                  Phone Number
                </Label>
                <AfricanPhoneInput
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  countryCode={countryCode}
                  onCountryCodeChange={handleCountryCodeChange}
                  placeholder="Enter your phone number"
                  disabled
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4">
              <ProfileImage
                src={profileImage}
                alt={userName}
                size="2xl"
                className="mb-4"
              />
              {!profileImage && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {userName ? `Profile picture for ${userName}` : "Add a profile picture"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

       {/* Address Information */}
      <Card className="shadow-xs py-6">
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
              value={streetAddress}
              onChange={(e) => handleInputChange("streetAddress", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>


      {/* Debug Information (Optional - remove in production) */}
      {/* {process.env.NODE_ENV === "development" && (
        <Card className="shadow-xs border-dashed border-gray-300">
          <CardHeader>
            <CardTitle>
              <h1 className="text-lg font-medium text-gray-500">Debug Info</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-500">
            <p><strong>Has Profile Data:</strong> {profile ? "Yes" : "No"}</p>
            <p><strong>Has Auth User:</strong> {user ? "Yes" : "No"}</p>
            <p><strong>Has Firebase User:</strong> {firebaseUser ? "Yes" : "No"}</p>
            <p><strong>Data Source:</strong> {hasSetProfileData.current ? "Profile" : user ? "Auth User" : firebaseUser ? "Firebase" : "None"}</p>
            {profile && (
              <>
                <p><strong>Profile Structure:</strong> Has user object: {!!profile.user}</p>
                <p><strong>First Name:</strong> {profile.user?.firstName || "Not set"}</p>
                <p><strong>Last Name:</strong> {profile.user?.lastName || "Not set"}</p>
                <p><strong>Email:</strong> {profile.user?.email || "Not set"}</p>
                <p><strong>Phone:</strong> {profile.user?.phoneNumber || "Not set"}</p>
              </>
            )}
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}