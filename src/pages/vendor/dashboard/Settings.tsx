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
  Loader2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useReduxVendors } from "@/hooks/useReduxVendors";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { toast } from "sonner";

interface InfoProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconContainerClassName?: string;
}

const reasons = [
  { value: "business reasons", label: "Business reasons" },
  { value: "personal reasons", label: "Personal reasons" },
  { value: "world of afrika ain't right for me", label: "World of Afrika ain't right for me" },
  { value: "something else", label: "Something else" },
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

function Info({ label, value, icon, iconContainerClassName }: InfoProps) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
      {icon && (
        <div
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0",
            iconContainerClassName
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <p className="text-[#666666] text-xs sm:text-sm truncate">{label}</p>
        <p className="font-medium text-sm sm:text-base truncate">{value || "Not set"}</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, getFullName } = useReduxAuth();
  const {
    selectedVendor,
    getVendor,
    deleteProfile,
    loading: vendorLoading,
    actionLoading,
  } = useReduxVendors();

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [selectedSubReason, setSelectedSubReason] = useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const getVendorData = () => {
    if (!selectedVendor) {
      return {
        storeName: user?.firstName ? `${user.firstName}'s Store` : "Your Store",
        businessEmail: user?.email || "Not set",
        businessPhone: user?.phoneNumber || "Not set",
        businessDescription: "No description provided yet. Update your store details to add a description.",
        businessAddress: "",
        businessLogo: "",
        businessBanner: images.Placeholder,
        country: "Not set",
        city: "Not set",
        category: "Not set",
        storyVideoUrl: "",
        bankName: "Not provided",
        accountNumber: "Not provided",
        swiftCode: "Not provided",
        accountName: "Your Store Inc.",
        joinedAt: user?.createdAt || new Date().toISOString(),
        rating: 0,
        followerCount: 0,
        productCount: 0,
        vendorStatus: "pending" as const,
        isVerified: false,
        userFirstName: user?.firstName || "",
        userLastName: user?.lastName || "",
        userEmail: user?.email || "",
      };
    }

    const userData = selectedVendor.user || {};
    const vendorData = selectedVendor;

    const userFirstName =
      typeof userData === "object" && userData !== null && "firstName" in userData
        ? (userData as any).firstName
        : "";
    const userLastName =
      typeof userData === "object" && userData !== null && "lastName" in userData
        ? (userData as any).lastName
        : "";
    const userEmail =
      typeof userData === "object" && userData !== null && "email" in userData
        ? (userData as any).email
        : "";

    const { country, city } = parseAddress(vendorData.businessAddress);

    const bankName =
      (vendorData as any).bankName || (vendorData as any).bankDetails?.name || "Not provided";
    const accountNumber =
      (vendorData as any).accountNumber || (vendorData as any).bankDetails?.accountNumber || "Not provided";
    const swiftCode =
      (vendorData as any).swiftCode || (vendorData as any).bankDetails?.swiftCode || "Not provided";

    const category =
      (vendorData as any).category ||
      (vendorData as any).storeCategory ||
      (vendorData as any).businessType ||
      "Not set";

    const storyVideoUrl =
      (vendorData as any).storyVideoUrl ||
      (vendorData as any).introVideoUrl ||
      (vendorData as any).vendorStoryVideo ||
      "";

    return {
      storeName: vendorData.businessName || "Your Store",
      businessEmail: vendorData.businessEmail || userEmail || "Not set",
      businessPhone: vendorData.businessPhone || (userData as any).phoneNumber || "Not set",
      businessDescription:
        vendorData.businessDescription ||
        "No description provided. Update your store details to add a description.",
      businessAddress: vendorData.businessAddress || "",
      businessLogo: vendorData.businessLogo || "",
      businessBanner: vendorData.businessBanner || images.Placeholder,
      country: country || "Not set",
      city: city || "Not set",
      category,
      storyVideoUrl,
      bankName,
      accountNumber,
      swiftCode,
      accountName:
        `${vendorData.businessName || ""} ${vendorData.businessName ? "Inc." : ""}`.trim() ||
        "Your Store Inc.",
      joinedAt: vendorData.joinedAt || (userData as any).createdAt || new Date().toISOString(),
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteProfile();
      toast.success("Account deletion process started successfully!");
      setDeleteDialogOpen(false);
      setSelectedReason("");
      setSelectedSubReason("");
      setAdditionalFeedback("");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

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

  // Loading states
  if (vendorLoading && !selectedVendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] px-4">
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#CC5500] mb-4" />
        <p className="text-gray-600 text-center text-sm sm:text-base">
          Loading your store information...
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
          If this takes too long, try refreshing the page
        </p>
      </div>
    );
  }

  const vendorData = getVendorData();
  const managerName =
    getFullName() || `${vendorData.userFirstName} ${vendorData.userLastName}`.trim() || "Not set";
  const joinedDate = formatDate(vendorData.joinedAt);

  return (
    <>
      <div className="min-h-screen w-full">
        {/* ================= COVER IMAGE ================= */}
        <div className="relative w-full h-[160px] xs:h-[180px] sm:h-[240px] md:h-[300px] lg:h-[360px] overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl">
          <img
            src={vendorData.businessBanner}
            alt="Cover"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* ================= STORE SUMMARY ================= */}
        <Card className="relative mx-2 sm:mx-4 lg:mx-6 -mt-12 sm:-mt-16 lg:-mt-20 shadow-sm border bg-white">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            {/* Profile Section */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 lg:gap-6">
              {/* Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-[#EFEFEF] flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold text-[#5B5B5B] shrink-0 mx-auto sm:mx-0 -mt-14 sm:-mt-16 lg:-mt-20 border-4 border-white shadow-md">
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

              {/* Store Info & Stats */}
              <div className="flex-1 min-w-0 text-center sm:text-left mt-2 sm:mt-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold truncate">
                  {vendorData.storeName}
                </h1>
                <p className="text-[#6F6F6F] text-sm sm:text-base mt-0.5">
                  {vendorData.country} • {vendorData.city}
                </p>

                {/* Stats - Responsive Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-5">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-500">Followers</p>
                    <p className="font-semibold text-base sm:text-lg">{vendorData.followerCount}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-500">Rating</p>
                    <p className="font-semibold text-base sm:text-lg">
                      {vendorData.rating?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-500">Products</p>
                    <p className="font-semibold text-base sm:text-lg">{vendorData.productCount}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={cn(
                  "px-4 py-2 sm:py-2.5 rounded-lg text-white text-sm sm:text-base font-medium text-center w-full sm:w-auto sm:min-w-[140px]",
                  vendorData.vendorStatus === "active" && "bg-green-600",
                  vendorData.vendorStatus === "pending" && "bg-yellow-600",
                  vendorData.vendorStatus === "suspended" && "bg-red-600",
                  vendorData.vendorStatus === "deactivated" && "bg-gray-600",
                  !["active", "pending", "suspended", "deactivated"].includes(
                    vendorData.vendorStatus
                  ) && "bg-gray-400"
                )}
              >
                {vendorData.vendorStatus === "active" && "Store Active"}
                {vendorData.vendorStatus === "pending" && "Pending Approval"}
                {vendorData.vendorStatus === "suspended" && "Store Suspended"}
                {vendorData.vendorStatus === "deactivated" && "Store Deactivated"}
                {!["active", "pending", "suspended", "deactivated"].includes(
                  vendorData.vendorStatus
                ) && (vendorData.vendorStatus || "Unknown Status")}
              </div>
            </div>
          </CardContent>

          {/* Basic Information Section */}
          <CardContent className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6 pt-0">
            <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">Basic Information</h2>

            {/* Info Grid - Responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              <Info
                label="Store name"
                value={vendorData.storeName}
                icon={<Store className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-purple-100 text-purple-600"
              />
              <Info
                label="Joined"
                value={joinedDate}
                icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-blue-100 text-blue-600"
              />
              <Info
                label="Manager's name"
                value={managerName}
                icon={<User className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-indigo-100 text-indigo-600"
              />
              <Info
                label="Category"
                value={vendorData.category}
                icon={<Tag className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-pink-100 text-pink-600"
              />
              <Info
                label="Bank name"
                value={vendorData.bankName}
                icon={<Banknote className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-orange-100 text-orange-600"
              />
              <Info
                label="Account name"
                value={vendorData.accountName}
                icon={<Building className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-emerald-100 text-emerald-600"
              />
              <Info
                label="Email"
                value={vendorData.businessEmail}
                icon={<Mail className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-red-100 text-red-600"
              />
              <Info
                label="Country"
                value={vendorData.country}
                icon={<Globe className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-cyan-100 text-cyan-600"
              />
              <Info
                label="Account number"
                value={vendorData.accountNumber}
                icon={<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-violet-100 text-violet-600"
              />
              <Info
                label="Phone"
                value={vendorData.businessPhone}
                icon={<Phone className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-green-100 text-green-600"
              />
              <Info
                label="City"
                value={vendorData.city}
                icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-rose-100 text-rose-600"
              />
              <Info
                label="Swift code"
                value={vendorData.swiftCode}
                icon={<Code className="h-4 w-4 sm:h-5 sm:w-5" />}
                iconContainerClassName="bg-amber-100 text-amber-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* ================= STORE DESCRIPTION ================= */}
        <Card className="mx-2 sm:mx-4 lg:mx-6 mt-4 sm:mt-6 shadow-sm border bg-white">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Store Description</h2>
            <div className="border rounded-lg p-3 sm:p-4 bg-gray-50/50">
              <p className="text-sm sm:text-base text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                {vendorData.businessDescription}
              </p>
            </div>

            <h2 className="text-base sm:text-lg font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">
              Vendor Story
            </h2>

            {vendorData.storyVideoUrl ? (
              <div className="w-full overflow-hidden rounded-lg sm:rounded-xl">
                <video
                  controls
                  className="w-full rounded-lg sm:rounded-xl"
                  src={vendorData.storyVideoUrl}
                  poster="/video-thumbnail.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 lg:py-10 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl">
                <p className="text-gray-500 text-sm sm:text-base">
                  No vendor story video uploaded yet
                </p>
                <Button
                  className="mt-3 sm:mt-4 bg-[#CC5500] hover:bg-[#CC5500]/80 text-white text-sm sm:text-base h-9 sm:h-10"
                  onClick={() => (window.location.href = "/vendor/settings/edit-store")}
                >
                  Upload Story Video
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================= DELETE ACCOUNT ================= */}
        <Card className="mx-2 sm:mx-4 lg:mx-6 mt-4 sm:mt-6 shadow-sm border bg-white">
          <CardHeader className="p-4 sm:p-5 lg:p-6 pb-0">
            <CardTitle>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-medium">Delete your account</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
            <div>
              <div className="mb-4 sm:mb-6 text-[#1A1A1A]">
                <h2 className="text-base sm:text-lg lg:text-xl font-medium mb-2 sm:mb-3">
                  What happens when you delete your account?
                </h2>
                <ul className="pl-5 sm:pl-6 lg:pl-8 space-y-1 sm:space-y-1.5 text-sm sm:text-base">
                  <li className="list-disc">Your account will be permanently deleted.</li>
                  <li className="list-disc">
                    Your profile, shop, and listings will no longer appear anywhere on World of Afrika.
                  </li>
                  <li className="list-disc">We'll close any non-delivery cases you opened.</li>
                  <li className="list-disc">All your data will be removed from our systems.</li>
                </ul>
              </div>

              <p className="mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                Please help us improve by telling us why you're leaving.
              </p>

              {/* Main Reason Select */}
              <Select
                value={selectedReason}
                onValueChange={(value) => {
                  setSelectedReason(value);
                  setSelectedSubReason("");
                }}
              >
                <SelectTrigger className="h-10 sm:h-11 w-full text-sm sm:text-base">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="h-10 sm:h-11 text-sm sm:text-base">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sub-reasons Radio Group */}
              {selectedReason && subReasons[selectedReason]?.length > 0 && (
                <div className="mt-4 sm:mt-5 py-3 sm:py-4">
                  <RadioGroup
                    value={selectedSubReason}
                    onValueChange={setSelectedSubReason}
                    className="space-y-3 sm:space-y-4"
                  >
                    {subReasons[selectedReason].map((sub) => (
                      <div key={sub} className="flex items-start sm:items-center space-x-2.5 sm:space-x-3">
                        <RadioGroupItem
                          value={sub}
                          id={`${selectedReason}-${sub}`}
                          className="mt-0.5 sm:mt-0"
                        />
                        <Label
                          htmlFor={`${selectedReason}-${sub}`}
                          className="text-sm sm:text-base cursor-pointer leading-tight sm:leading-normal"
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
                <div className="mt-4 sm:mt-5">
                  <Label htmlFor="feedback" className="text-sm sm:text-base font-medium">
                    Do you have anything else to tell us?
                    <span className="text-[#8A8A8A] ml-1.5 sm:ml-2 font-normal">Optional</span>
                  </Label>
                  <Textarea
                    id="feedback"
                    className="mt-2 h-24 sm:h-28 resize-none text-sm sm:text-base"
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    placeholder="Share any additional feedback or suggestions..."
                  />
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              className={cn(
                "h-10 sm:h-11 rounded-full px-5 sm:px-6 text-white font-semibold transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto",
                selectedReason && (selectedSubReason || selectedReason === "something else")
                  ? "bg-[#DC2626] hover:bg-[#DC2626]/90"
                  : "bg-[#CCCCCC] hover:bg-[#CCCCCC]/60 cursor-not-allowed"
              )}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!selectedReason || (!selectedSubReason && selectedReason !== "something else")}
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