import { useState } from "react";
import { X } from "lucide-react";
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

interface SubCategoryType {
  id: string;
  name: string;
  appliesTo: string[];
}

interface AddAttributeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAttribute: (attribute: {
    name: string;
    description?: string;
    inputType: "dropdown" | "multiselect" | "boolean" | "text" | "number" | "textarea";
    purpose: "filter" | "specification" | "both";
    values: string[];
    isRequired: boolean;
    filterStatus: "active" | "inactive";
    order: number;
    appliesTo: string[];
    additionalDetails?: string;
  }) => void;
  subCategoryTypes: SubCategoryType[];
}

export function AddAttributeDrawer({
  isOpen,
  onClose,
  onAddAttribute,
  subCategoryTypes,
}: AddAttributeDrawerProps) {
  const [attributeName, setAttributeName] = useState("");
  const [inputType, setInputType] = useState<
    "dropdown" | "multiselect" | "boolean" | "text" | "number" | "textarea"
  >("text");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleAddAttribute = () => {
    if (!attributeName.trim()) {
      alert("Please enter an attribute name");
      return;
    }

    if (selectedTypes.length === 0) {
      alert("Please select at least one sub category type");
      return;
    }

    const attributeData = {
      name: attributeName.trim(),
      inputType,
      purpose: "both" as const,
      values: [],
      isRequired: false,
      filterStatus: "active" as const,
      order: 0,
      appliesTo: selectedTypes,
    };

    onAddAttribute(attributeData);
    handleClose();
  };

  const handleClose = () => {
    setAttributeName("");
    setInputType("text");
    setSelectedTypes([]);
    onClose();
  };

  if (!isOpen) return null;

  const dataTypeLabels = {
    text: "Text",
    number: "Number",
    dropdown: "Dropdown",
    multiselect: "Multi-select",
    boolean: "Boolean",
    textarea: "Textarea",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Content */}
      <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto dark:bg-[#1A1A1A]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-[#333333]">
          <h2 className="text-xl font-semibold dark:text-white">
            Add attribute
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-[#333333]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Attribute Name */}
          <div className="space-y-2">
            <Label
              htmlFor="attributeName"
              className="text-sm font-medium dark:text-white"
            >
              Name *
            </Label>
            <Input
              id="attributeName"
              type="text"
              placeholder="e.g. T-shirts"
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
              className="h-11 dark:bg-[#303030] dark:border-[#444444] dark:text-white"
              required
            />
          </div>

          {/* Data Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium dark:text-white">
              Data type *
            </Label>
            <Select
              value={inputType}
              onValueChange={(value: any) => setInputType(value)}
            >
              <SelectTrigger className="h-11 dark:bg-[#303030] dark:border-[#444444] dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(dataTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub Category Types Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium dark:text-white">
              Sub category/type it applies to *
            </Label>
            {subCategoryTypes.length === 0 ? (
              <p className="text-sm text-gray-500">
                No sub category types available. Please create sub category types first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {subCategoryTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => handleTypeToggle(type.id)}
                    />
                    <label
                      htmlFor={`type-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t dark:border-[#333333]">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11 dark:bg-[#303030] dark:border-[#444444] dark:text-white dark:hover:bg-[#404040]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddAttribute}
            className="flex-1 h-11 bg-[#0A0A0A] hover:bg-[#262626] text-white"
            disabled={
              !attributeName.trim() ||
              selectedTypes.length === 0 ||
              subCategoryTypes.length === 0
            }
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}