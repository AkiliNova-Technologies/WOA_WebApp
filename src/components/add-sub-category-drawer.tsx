import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";

interface AddSubCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubCategory: (subCategory: {
    name: string;
    description?: string;
    image: string[] | null;
  }) => void;
}

export function AddSubCategoryDrawer({
  isOpen,
  onClose,
  onAddSubCategory,
}: AddSubCategoryDrawerProps) {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleImageChange = (urls: string[]) => {
    setUploadedUrls(urls);
  };

  const handleAddSubCategory = () => {
    if (!subCategoryName.trim()) {
      alert("Please enter a sub-category name");
      return;
    }

    if (uploadedUrls.length === 0) {
      alert("Please upload an image for the sub-category");
      return;
    }

    onAddSubCategory({
      name: subCategoryName.trim(),
      image: uploadedUrls,
    });
    handleClose();
  };

  const handleClose = () => {
    setSubCategoryName("");
    setUploadedUrls([]);
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
            Create Sub category
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
          {/* Sub Category Name */}
          <div className="space-y-2">
            <Label
              htmlFor="subCategoryName"
              className="text-sm font-medium dark:text-white"
            >
              Name *
            </Label>
            <Input
              id="subCategoryName"
              type="text"
              placeholder="e.g. Women's fashion"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
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
              
              
              
              bucket="World_of_Africa"
              maxSize={10}
              className="w-full"
              initialUrls={uploadedUrls}
            />
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
            onClick={handleAddSubCategory}
            className="flex-1 h-11 bg-[#0A0A0A] hover:bg-[#262626] text-white"
            disabled={!subCategoryName.trim() || uploadedUrls.length === 0}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}