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
import React from "react";

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
          <p className="font-medium">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [selectedSubReason, setSelectedSubReason] = React.useState<string>("");
  const [additionalFeedback, setAdditionalFeedback] = React.useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

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

  return (
    <>
      <div className="min-h-screen">
        {/* ================= COVER IMAGE ================= */}
        <div className="relative w-full h-[360px] overflow-hidden rounded-2xl">
          <img
            src={images.Placeholder}
            alt="Cover"
            //   fill
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
            <h2 className="text-white text-3xl font-semibold">
              Replace cover image
            </h2>
            <p className="text-white/80 text-sm">
              Optimal dimension 1100×400 px
            </p>

            <div className="flex gap-4 mt-2">
              <Button className="bg-white text-black h-9 rounded-full px-6">
                Remove
              </Button>
              <Button className="bg-white text-black h-9 rounded-full px-6">
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* ================= STORE SUMMARY ================= */}
        <Card className=" relative mx-auto  -mt-12 mx-6 shadow-xs border bg-white py-6">
          <CardContent className="px-6 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-30 h-30 rounded-full bg-[#EFEFEF] flex items-center justify-center text-4xl font-bold text-[#5B5B5B]">
              3
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-semibold">Theatrix</h1>
              <p className="text-[#6F6F6F]">Kenya • Nairobi</p>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-6 text-md">
              <div className="flex flex-row gap-8 text-md">
                <div>
                  <p className="font-semibold">Followers:</p>
                  <p>15</p>
                </div>
                <div>
                  <p className="font-semibold">Rating:</p>
                  <p>4.5</p>
                </div>
                <div>
                  <p className="font-semibold">Total Products:</p>
                  <p>120</p>
                </div>
              </div>
              <div className="h-11 rounded-md flex flex-col justify-center items-center bg-green-600 text-white text-md">
                <p className="text-center">Store Approved</p>
              </div>
            </div>
          </CardContent>

          <CardContent className="px-6">
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#1A1A1A]">
              {/* Row 1 */}
              <Info
                label="Store name"
                value="Theatrix"
                icon={<Store className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center"
              />
              <Info
                label="Joined"
                value="2024-01-15"
                icon={<Calendar className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center"
              />
              <Info
                label="Account name"
                value="Theatrix Inc."
                icon={<Building className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center"
              />

              {/* Row 2 */}
              <Info
                label="Manager's name"
                value="John"
                icon={<User className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center"
              />
              <Info
                label="Category"
                value="Fashion & Apparel"
                icon={<Tag className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center"
              />
              <Info
                label="Bank name"
                value="DTB Bank"
                icon={<Banknote className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center"
              />

              {/* Row 3 */}
              <Info
                label="Email"
                value="john@nightlifecentral.com"
                icon={<Mail className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center"
              />
              <Info
                label="Country"
                value="Kenya"
                icon={<Globe className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center"
              />
              <Info
                label="Account number"
                value="1268290000282629"
                icon={<CreditCard className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-violet-100 text-violet-600 flex items-center justify-center"
              />

              {/* Row 4 */}
              <Info
                label="Phone"
                value="+1 (555) 123-4567"
                icon={<Phone className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center"
              />
              <Info
                label="City"
                value="Nairobi"
                icon={<MapPin className="h-5 w-5" />}
                iconContainerClassName="w-8 h-8 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center"
              />
              <Info
                label="Swift code"
                value="0000"
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
              <p className="text-sm text-[#3A3A3A] leading-relaxed">
                Namugenyii Sarah is a passionate entrepreneur based in Kampala,
                specializing in authentic Ugandan fashion and handmade
                accessories. With over 5 years of experience in local retail,
                she brings a vibrant mix of tradition and modern style to her
                storefront. Her products are ethically sourced, quality-checked,
                and crafted to celebrate East African culture.
              </p>

              <p className="text-sm text-[#3A3A3A] leading-relaxed">
                Sarah is known for her responsive customer service, fast order
                fulfillment, and commitment to sustainable packaging. Whether
                you're shopping for a bold kitenge outfit or a unique gift, her
                store offers a curated experience that blends creativity,
                reliability, and heart.
              </p>
            </div>

            <h2 className="text-lg font-semibold mt-8 mb-4">Vendor Story</h2>

            <div className="w-full overflow-hidden rounded-xl">
              <video
                controls
                className="w-full rounded-xl"
                src="/sample-video.mp4"
              />
            </div>
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
    </>
  );
}
