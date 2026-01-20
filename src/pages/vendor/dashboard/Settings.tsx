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
import React, { useEffect } from "react";
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
  iconContainerClassName = "w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center",
}: InfoProps) {
  return (
    <div>
      <div className="flex flex-row items-center gap-3">
        {/* Icon section */}
        {icon && (
          <div className={iconContainerClassName} style={iconContainerStyle}>
            {icon}
          </div>
        )}

        {/* Text section */}
        <div className="flex flex-col space-y-1">
          <p className="text-[#666666] text-sm">{label}</p>
          <p className="font-medium">{value || "Not set"}</p>
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
    actionLoading 
  } = useReduxVendors();

  // State for delete account
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [selectedSubReason, setSelectedSubReason] = React.useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

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
    
    const addressParts = address.split(',').map(part => part.trim());
    
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
      toast.error(error.message || "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const { country, city } = parseAddress(selectedVendor?.businessAddress);
  const managerName = getFullName();
  const storeName = selectedVendor?.businessName || "Not set";
  const category = (selectedVendor as any)?.category || (selectedVendor as any)?.storeCategory || "Not set";
  const email = selectedVendor?.businessEmail || user?.email || "Not set";
  const phone = selectedVendor?.businessPhone || user?.phoneNumber || "Not set";
  const joinedDate = formatDate(selectedVendor?.joinedAt);
  const description = selectedVendor?.businessDescription || "No description provided.";
  const storyVideoUrl = (selectedVendor as any)?.storyVideoUrl || "/sample-video.mp4";
  
  // Mock bank details (you should get these from your vendor data)
  const bankName = "DTB Bank";
  const accountNumber = "1268290000282629";
  const swiftCode = "0000";

  return (
    <>
      <div className="min-h-screen min-w-5xl max-w-7xl">
        {/* ================= COVER IMAGE ================= */}
        <div className="relative w-full h-[360px] overflow-hidden rounded-2xl">
          <img
            src={selectedVendor?.businessBanner || images.Placeholder}
            alt="Cover"
            className="object-cover w-full h-full"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
            {/* <h2 className="text-white text-3xl font-semibold">
              {selectedVendor?.businessBanner ? "Edit cover image" : "Add cover image"}
            </h2>
            <p className="text-white/80 text-sm">
              Optimal dimension 1100×400 px
            </p>

            <div className="flex gap-4 mt-2">
              {selectedVendor?.businessBanner && (
                <Button className="bg-white text-black h-9 rounded-full px-6">
                  Remove
                </Button>
              )}
              <Button className="bg-white text-black h-9 rounded-full px-6">
                Edit
              </Button>
            </div> */}
          </div>
        </div>

        {/* ================= STORE SUMMARY ================= */}
        <Card className="relative mx-auto -mt-12 mx-6 shadow-xs border bg-white py-6">
          <CardContent className="px-6 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-30 h-30 rounded-full bg-[#EFEFEF] flex items-center justify-center text-4xl font-bold text-[#5B5B5B]">
              {selectedVendor?.businessLogo ? (
                <img 
                  src={selectedVendor.businessLogo} 
                  alt={storeName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                storeName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-semibold">{storeName}</h1>
              <p className="text-[#6F6F6F]">{country} • {city}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-6 text-md">
              <div className="flex flex-row gap-8 text-md">
                <div>
                  <p className="font-semibold">Followers:</p>
                  <p>{selectedVendor?.followerCount || 0}</p>
                </div>
                <div>
                  <p className="font-semibold">Rating:</p>
                  <p>{selectedVendor?.rating?.toFixed(1) || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Total Products:</p>
                  <p>{selectedVendor?.productCount || 0}</p>
                </div>
              </div>
              <div className={`h-11 rounded-md flex flex-col justify-center items-center text-white text-md ${
                selectedVendor?.vendorStatus === 'active' 
                  ? 'bg-green-600' 
                  : selectedVendor?.vendorStatus === 'pending'
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}>
                <p className="text-center capitalize">
                  {selectedVendor?.vendorStatus === 'active' ? 'Store Approved' : 
                   selectedVendor?.vendorStatus === 'pending' ? 'Pending Approval' :
                   selectedVendor?.vendorStatus || 'Unknown Status'}
                </p>
              </div>
            </div>
          </CardContent>

          <CardContent className="px-6">
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#1A1A1A]">
              {/* Row 1 */}
              <Info
                label="Store name"
                value={storeName}
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
                value={category}
                icon={<Tag className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center"
              />
              <Info
                label="Bank name"
                value={bankName}
                icon={<Banknote className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center"
              />
              <Info
                label="Account name"
                value={`${storeName} Inc.`}
                icon={<Building className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center"
              />

              {/* Row 3 */}
              <Info
                label="Email"
                value={email}
                icon={<Mail className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center"
              />
              <Info
                label="Country"
                value={country}
                icon={<Globe className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center"
              />
              <Info
                label="Account number"
                value={accountNumber}
                icon={<CreditCard className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-violet-100 text-violet-600 flex items-center justify-center"
              />

              {/* Row 4 */}
              <Info
                label="Phone"
                value={phone}
                icon={<Phone className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center"
              />
              <Info
                label="City"
                value={city}
                icon={<MapPin className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center"
              />
              <Info
                label="Swift code"
                value={swiftCode}
                icon={<Code className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center"
              />
            </div>
          </CardContent>
        </Card>

        {/* ================= STORE DESCRIPTION ================= */}
        <Card className="max-w-8xl mx-auto mt-8 mx-6 shadow-xs border bg-white ">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Store Description</h2>

            <div className="border rounded-sm p-3">
              <p className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            <h2 className="text-lg font-semibold mt-8 mb-4">Vendor Story</h2>

            {storyVideoUrl && (
              <div className="w-full overflow-hidden rounded-xl">
                <video
                  controls
                  className="w-full rounded-xl"
                  src={storyVideoUrl}
                  poster="/video-thumbnail.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {!storyVideoUrl && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500">No vendor story video uploaded yet</p>
                <Button className="mt-4 bg-[#CC5500] hover:bg-[#CC5500]/80 text-white">
                  Upload Story Video
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete your account */}
        <Card className="shadow-xs mt-8 py-6 mx-6">
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
                  : "bg-[#CCCCCC] hover:bg-[#CCCCCC]/60 cursor-not-allowed"
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