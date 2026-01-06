import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/image-upload";

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface AddSubCategoryTypeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubCategoryType: (subCategoryType: {
    name: string;
    description?: string;
    image: string[] | null;
    appliesTo: string[];
  }) => void;
  subCategories: SubCategory[];
}

export function AddSubCategoryTypeDrawer({
  isOpen,
  onClose,
  onAddSubCategoryType,
  subCategories,
}: AddSubCategoryTypeDrawerProps) {
  const [subCategoryTypeName, setSubCategoryTypeName] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    []
  );

  const handleImageChange = (urls: string[]) => {
    setUploadedUrls(urls);
  };

  const handleSubCategoryToggle = (subCategoryId: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategoryId)
        ? prev.filter((id) => id !== subCategoryId)
        : [...prev, subCategoryId]
    );
  };

  const handleAddSubCategoryType = () => {
    if (!subCategoryTypeName.trim()) {
      alert("Please enter a sub-category type name");
      return;
    }

    if (uploadedUrls.length === 0) {
      alert("Please select an image for the sub-category type");
      return;
    }

    if (selectedSubCategories.length === 0) {
      alert("Please select at least one sub category");
      return;
    }

    onAddSubCategoryType({
      name: subCategoryTypeName.trim(),
      image: uploadedUrls,
      appliesTo: selectedSubCategories,
    });
    handleClose();
  };

  const handleClose = () => {
    setSubCategoryTypeName("");
    setUploadedUrls([]);
    setSelectedSubCategories([]);
    onClose();
  };

  if (!isOpen) return null;

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
            Add Sub category type
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
          {/* Sub Category Type Name */}
          <div className="space-y-2">
            <Label
              htmlFor="subCategoryTypeName"
              className="text-sm font-medium dark:text-white"
            >
              Name *
            </Label>
            <Input
              id="subCategoryTypeName"
              type="text"
              placeholder="e.g. T-shirts"
              value={subCategoryTypeName}
              onChange={(e) => setSubCategoryTypeName(e.target.value)}
              className="h-11 dark:bg-[#303030] dark:border-[#444444] dark:text-white"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium dark:text-white">
              Upload cover image *
            </Label>
            <ImageUpload
              onImageChange={handleImageChange}
              maxSize={10}
              bucket="World_of_Africa"
              className="w-full"
              initialUrls={uploadedUrls}
            />
          </div>

          {/* Sub Categories Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium dark:text-white">
              Sub categories it applies to *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {subCategories.map((subCategory) => (
                <div
                  key={subCategory.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`sub-cat-${subCategory.id}`}
                    checked={selectedSubCategories.includes(subCategory.id)}
                    onCheckedChange={() =>
                      handleSubCategoryToggle(subCategory.id)
                    }
                  />
                  <label
                    htmlFor={`sub-cat-${subCategory.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {subCategory.name}
                  </label>
                </div>
              ))}
            </div>
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
            onClick={handleAddSubCategoryType}
            className="flex-1 h-11 bg-[#0A0A0A] hover:bg-[#262626] text-white"
            disabled={
              !subCategoryTypeName.trim() ||
              uploadedUrls.length === 0 ||
              selectedSubCategories.length === 0
            }
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
