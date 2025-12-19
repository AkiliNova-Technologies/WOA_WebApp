import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TextEditor } from "@/components/text-editor";

interface WarehouseFormData {
  country: string;
  city: string;
  maxPackageCapacity: string;
  assignedManager: string;
  daysOfOperation: string[];
  openingTime: string;
  closingTime: string;
  locationPin: string;
  additionalDetails: string;
}

export default function AdminCreateWarehouse() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WarehouseFormData>({
    country: "",
    city: "",
    maxPackageCapacity: "",
    assignedManager: "",
    daysOfOperation: [],
    openingTime: "",
    closingTime: "",
    locationPin: "",
    additionalDetails: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleInputChange = (field: keyof WarehouseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      daysOfOperation: prev.daysOfOperation.includes(day)
        ? prev.daysOfOperation.filter((d) => d !== day)
        : [...prev.daysOfOperation, day],
    }));
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as draft:", formData);
    // Add your draft save logic here
  };

  const handleCreateWarehouse = () => {
    console.log("Creating warehouse:", formData);
    // Add your warehouse creation logic here
    navigate("/admin/warehouses");
  };

  const handleConfirmPin = () => {
    console.log("Confirming location pin");
    // Add your pin confirmation logic here (e.g., open map modal)
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen py-6">
        {/* Header */}
        <div className="bg-white rounded-md mb-6 mx-6 dark:bg-[#303030]">
          <div className="mx-auto px-10 py-4 flex items-center justify-between">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={"secondary"}
                className="bg-white hover:text-gray-900 dark:bg-[#303030]"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Back
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveAsDraft}
                className="rounded-md"
              >
                Save as draft
              </Button>
              <Button
                onClick={handleCreateWarehouse}
                className="bg-black text-white hover:bg-black/90 rounded-md"
              >
                Create Warehouse
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-8xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg border p-6 mb-6">
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Create new warehouse</h1>
              <p className="text-gray-600">
                Add a new warehouse to manage storage and shipments.
              </p>
            </div>

            {/* Basic Information */}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger id="country" className="mt-1.5 min-h-11">
                    <SelectValue placeholder="Select the country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nigeria">Nigeria</SelectItem>
                    <SelectItem value="kenya">Kenya</SelectItem>
                    <SelectItem value="south-africa">South Africa</SelectItem>
                    <SelectItem value="egypt">Egypt</SelectItem>
                    <SelectItem value="ghana">Ghana</SelectItem>
                    <SelectItem value="uganda">Uganda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                >
                  <SelectTrigger id="city" className="mt-1.5 min-h-11">
                    <SelectValue placeholder="Select the city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lagos">Lagos</SelectItem>
                    <SelectItem value="nairobi">Nairobi</SelectItem>
                    <SelectItem value="cape-town">Cape Town</SelectItem>
                    <SelectItem value="cairo">Cairo</SelectItem>
                    <SelectItem value="accra">Accra</SelectItem>
                    <SelectItem value="kampala">Kampala</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxCapacity">
                  Maximum package capacity{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxCapacity"
                  placeholder="e.g. 200"
                  value={formData.maxPackageCapacity}
                  onChange={(e) =>
                    handleInputChange("maxPackageCapacity", e.target.value)
                  }
                  className="mt-1.5 h-11"
                />
              </div>

              <div>
                <Label htmlFor="manager">
                  Assign a manager <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.assignedManager}
                  onValueChange={(value) =>
                    handleInputChange("assignedManager", value)
                  }
                >
                  <SelectTrigger id="manager" className="mt-1.5 min-h-11">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="victor">Victor Wandulu</SelectItem>
                    <SelectItem value="jane">Jane Doe</SelectItem>
                    <SelectItem value="john">John Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6">Operating Hours</h2>

            <div className="mb-8">
              <Label className="mb-3 block">
                Days of operation <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-4 gap-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.daysOfOperation.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                      className="h-6 w-6"
                    />
                    <label
                      htmlFor={day}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="openingTime">
                  Opening time <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.openingTime}
                  onValueChange={(value) =>
                    handleInputChange("openingTime", value)
                  }
                >
                  <SelectTrigger id="openingTime" className="mt-1.5 min-h-11">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">06:00 AM</SelectItem>
                    <SelectItem value="07:00">07:00 AM</SelectItem>
                    <SelectItem value="08:00">08:00 AM</SelectItem>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="closingTime">
                  Closing time <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.closingTime}
                  onValueChange={(value) =>
                    handleInputChange("closingTime", value)
                  }
                >
                  <SelectTrigger id="closingTime" className="mt-1.5 min-h-11">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:00">04:00 PM</SelectItem>
                    <SelectItem value="17:00">05:00 PM</SelectItem>
                    <SelectItem value="18:00">06:00 PM</SelectItem>
                    <SelectItem value="19:00">07:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Physical Location */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-6">Physical location</h2>

            <div className="flex items-center justify-between">
              <Label>Confirm location with a pin</Label>
              <Button
                onClick={handleConfirmPin}
                className="bg-black text-white hover:bg-black/90 rounded-md"
              >
                Confirm pin
              </Button>
            </div>

            <div className="mt-6">
              <Label htmlFor="additionalDetails">Additional details</Label>
              <div className="mt-2">
                <TextEditor
                  value={formData.additionalDetails}
                  onChange={(value) =>
                    handleInputChange("additionalDetails", value)
                  }
                  className="min-h-32 rounded-t-none resize-none mt-5"
                  placeholder="Add any additional information about the warehouse location..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
