import images from "@/assets/images";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Store,
  Calendar,
  Building,
  User,
  Tag,
  Banknote,
  Mail,
  Globe,
  CreditCard,
  Phone,
  MapPin,
  Code,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useReduxVendors } from "@/hooks/useReduxVendors";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InfoProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconContainerStyle?: React.CSSProperties;
  iconContainerClassName?: string;
}

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

function Info({
  label,
  value,
  icon,
  iconContainerStyle,
  iconContainerClassName = "w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center",
}: InfoProps) {
  return (
    <div>
      <div className="flex flex-row items-center gap-2 sm:gap-3">
        {/* Icon section */}
        {icon && (
          <div className={iconContainerClassName} style={iconContainerStyle}>
            {icon}
          </div>
        )}

        {/* Text section */}
        <div className="flex flex-col space-y-0.5 sm:space-y-1 flex-1 min-w-0">
          <p className="text-[#666666] text-xs sm:text-sm truncate">{label}</p>
          <p className="font-medium text-sm sm:text-base truncate">{value || "Not set"}</p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  // Hooks
  const { user, getFullName } = useReduxAuth();
  const {
    selectedVendor,
    getVendor,
    deleteProfile,
    loading: vendorLoading,
    actionLoading,
  } = useReduxVendors();

  // State for delete account
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [selectedSubReason, setSelectedSubReason] = useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Parse address to extract country and city
  const parseAddress = (address: string | undefined) => {
    if (!address) return { country: "Not set", city: "Not set" };

    const addressParts = address.split(",").map((part) => part.trim());

    let country = "";
    let city = "";

    if (addressParts.length > 1) {
      country = addressParts[addressParts.length - 1];
      city = addressParts[0];
    } else {
      country = addressParts[0] || "Not set";
      city = addressParts[0] || "Not set";
    }

    return { country, city };
  };

  // Get vendor data safely
  // Replace the getVendorData function in your Settings.tsx with this:

  const getVendorData = () => {
    if (!selectedVendor) return null;

    // Extract user data from vendor
    const userData = selectedVendor.user || {};
    const vendorData = selectedVendor;

    // Safely get user properties with type checking
    const userFirstName =
      typeof userData === "object" &&
      userData !== null &&
      "firstName" in userData
        ? (userData as any).firstName
        : "";
    const userLastName =
      typeof userData === "object" &&
      userData !== null &&
      "lastName" in userData
        ? (userData as any).lastName
        : "";
    const userEmail =
      typeof userData === "object" && userData !== null && "email" in userData
        ? (userData as any).email
        : "";

    // Parse address
    const { country, city } = parseAddress(vendorData.businessAddress);

    // Get bank details - these might be in different fields
    const bankName =
      (vendorData as any).bankName ||
      (vendorData as any).bankDetails?.name ||
      "Not provided";
    const accountNumber =
      (vendorData as any).accountNumber ||
      (vendorData as any).bankDetails?.accountNumber ||
      "Not provided";
    const swiftCode =
      (vendorData as any).swiftCode ||
      (vendorData as any).bankDetails?.swiftCode ||
      "Not provided";

    // Get category - check multiple possible fields
    const category =
      (vendorData as any).category ||
      (vendorData as any).storeCategory ||
      (vendorData as any).businessType ||
      "Not set";

    // Get story video URL
    const storyVideoUrl =
      (vendorData as any).storyVideoUrl ||
      (vendorData as any).introVideoUrl ||
      (vendorData as any).vendorStoryVideo ||
      "";

    return {
      storeName: vendorData.businessName || "Not set",
      businessEmail: vendorData.businessEmail || userEmail || "Not set",
      businessPhone:
        vendorData.businessPhone || (userData as any).phoneNumber || "Not set",
      businessDescription:
        vendorData.businessDescription || "No description provided.",
      businessAddress: vendorData.businessAddress || "",
      businessLogo: vendorData.businessLogo || "",
      businessBanner: vendorData.businessBanner || images.Placeholder,
      country,
      city,
      category,
      storyVideoUrl,
      bankName,
      accountNumber,
      swiftCode,
      accountName:
        `${vendorData.businessName || ""} ${vendorData.businessName ? "Inc." : ""}`.trim() ||
        "Not provided",
      joinedAt: vendorData.joinedAt || (userData as any).createdAt,
      rating: vendorData.rating || 0,
      followerCount: vendorData.followerCount || 0,
      productCount: vendorData.productCount || 0,
      vendorStatus: vendorData.vendorStatus || "pending",
      isVerified: vendorData.isVerified || false,
      userFirstName,
      userLastName,
      userEmail,
    };
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Call the deleteProfile function from useReduxVendors
      await deleteProfile();

      toast.success("Account deletion process started successfully!");
      setDeleteDialogOpen(false);

      // Reset form
      setSelectedReason("");
      setSelectedSubReason("");
      setAdditionalFeedback("");

      // Redirect to home or login page
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(
        error.message || "Failed to delete account. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Show loading state while fetching vendor data
  if (vendorLoading && !selectedVendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#CC5500]" />
        <span className="ml-2">Loading vendor information...</span>
      </div>
    );
  }

  const vendorData = getVendorData();
  if (!vendorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No vendor data available</p>
      </div>
    );
  }

  const managerName =
    getFullName() ||
    `${vendorData.userFirstName} ${vendorData.userLastName}`.trim() ||
    "Not set";
  const joinedDate = formatDate(vendorData.joinedAt);

  return (
    <>
      <div className="min-h-screen w-full max-w-full">
        {/* ================= COVER IMAGE ================= */}
        <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] overflow-hidden rounded-xl sm:rounded-2xl">
          <img
            src={vendorData.businessBanner}
            alt="Cover"
            className="object-cover w-full h-full"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
            {/* You can add edit/remove buttons here if needed */}
          </div>
        </div>

        {/* ================= STORE SUMMARY ================= */}
        <Card className="relative mx-auto -mt-8 sm:-mt-12 mx-3 sm:mx-6 shadow-xs border bg-white py-4 sm:py-6">
          <CardContent className="px-3 sm:px-6 flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
            <div className="w-30 h-30 rounded-full bg-[#EFEFEF] flex items-center justify-center text-4xl font-bold text-[#5B5B5B]">
              {vendorData.businessLogo ? (
                <img
                  src={vendorData.businessLogo}
                  alt={vendorData.storeName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                vendorData.storeName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-semibold">{vendorData.storeName}</h1>
              <p className="text-[#6F6F6F]">
                {vendorData.country} • {vendorData.city}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-6 text-md">
              <div className="flex flex-row gap-8 text-md">
                <div>
                  <p className="font-semibold">Followers:</p>
                  <p>{vendorData.followerCount}</p>
                </div>
                <div>
                  <p className="font-semibold">Rating:</p>
                  <p>{vendorData.rating?.toFixed(1) || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Total Products:</p>
                  <p>{vendorData.productCount}</p>
                </div>
              </div>
              <div
                className={`h-11 rounded-md flex flex-col justify-center items-center text-white text-md ${
                  vendorData.vendorStatus === "active"
                    ? "bg-green-600"
                    : vendorData.vendorStatus === "pending"
                      ? "bg-yellow-600"
                      : vendorData.vendorStatus === "suspended"
                        ? "bg-red-600"
                        : vendorData.vendorStatus === "deactivated"
                          ? "bg-gray-600"
                          : "bg-gray-400"
                }`}
              >
                <p className="text-center capitalize">
                  {vendorData.vendorStatus === "active"
                    ? "Store Active"
                    : vendorData.vendorStatus === "pending"
                      ? "Pending Approval"
                      : vendorData.vendorStatus === "suspended"
                        ? "Store Suspended"
                        : vendorData.vendorStatus === "deactivated"
                          ? "Store Deactivated"
                          : vendorData.vendorStatus || "Unknown Status"}
                </p>
              </div>
            </div>
          </CardContent>

          <CardContent className="px-3 sm:px-6">
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#1A1A1A]">
              {/* Row 1 */}
              <Info
                label="Store name"
                value={vendorData.storeName}
                icon={<Store className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center"
              />
              <Info
                label="Joined"
                value={joinedDate}
                icon={<Calendar className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center"
              />
              <Info
                label="Manager's name"
                value={managerName}
                icon={<User className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center"
              />

              {/* Row 2 */}
              <Info
                label="Category"
                value={vendorData.category}
                icon={<Tag className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center"
              />
              <Info
                label="Bank name"
                value={vendorData.bankName}
                icon={<Banknote className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center"
              />
              <Info
                label="Account name"
                value={vendorData.accountName}
                icon={<Building className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center"
              />

              {/* Row 3 */}
              <Info
                label="Email"
                value={vendorData.businessEmail}
                icon={<Mail className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center"
              />
              <Info
                label="Country"
                value={vendorData.country}
                icon={<Globe className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center"
              />
              <Info
                label="Account number"
                value={vendorData.accountNumber}
                icon={<CreditCard className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-violet-100 text-violet-600 flex items-center justify-center"
              />

              {/* Row 4 */}
              <Info
                label="Phone"
                value={vendorData.businessPhone}
                icon={<Phone className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center"
              />
              <Info
                label="City"
                value={vendorData.city}
                icon={<MapPin className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center"
              />
              <Info
                label="Swift code"
                value={vendorData.swiftCode}
                icon={<Code className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center"
              />
            </div>
          </CardContent>
        </Card>

        {/* ================= STORE DESCRIPTION ================= */}
         <Card className="max-w-full mx-auto mt-6 sm:mt-8 mx-3 sm:mx-6 shadow-xs border bg-white">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Store Description</h2>

            <div className="border rounded-sm p-3">
              <p className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                {vendorData.businessDescription}
              </p>
            </div>

            <h2 className="text-lg font-semibold mt-8 mb-4">Vendor Story</h2>

            {vendorData.storyVideoUrl ? (
              <div className="w-full overflow-hidden rounded-xl">
                <video
                  controls
                  className="w-full rounded-xl"
                  src={vendorData.storyVideoUrl}
                  poster="/video-thumbnail.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500">
                  No vendor story video uploaded yet
                </p>
                <Button
                  className="mt-4 bg-[#CC5500] hover:bg-[#CC5500]/80 text-white"
                  onClick={() =>
                    (window.location.href = "/vendor/settings/edit-store")
                  }
                >
                  Upload Story Video
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete your account */}
        <Card className="shadow-xs mt-6 sm:mt-8 py-4 sm:py-6 mx-3 sm:mx-6">
          <CardHeader>
            <CardTitle>
               <h1 className="text-xl sm:text-2xl font-medium">Delete your account</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
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
              {selectedReason && subReasons[selectedReason]?.length > 0 && (
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
                    <span className="text-[#8A8A8A] ml-2">Optional</span>
                  </Label>
                  <Textarea
                    id="feedback"
                    className="mt-2 h-28 resize-none"
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    placeholder="Share any additional feedback or suggestions..."
                  />
                </div>
              )}
            </div>

            <Button
              variant={"secondary"}
              className={cn(
                "h-11 rounded-full px-6 text-white font-semibold transition-colors duration-200",
                selectedReason &&
                  (selectedSubReason || selectedReason === "something else")
                  ? "bg-[#DC2626] hover:bg-[#DC2626]/90"
                  : "bg-[#CCCCCC] hover:bg-[#CCCCCC]/60 cursor-not-allowed",
              )}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={
                !selectedReason ||
                (!selectedSubReason && selectedReason !== "something else")
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
          loading={deleting || actionLoading}
        />
      </div>
    </>
  );
}
