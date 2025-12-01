import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface AddSubCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubCategory: (subCategory: SubCategory) => void;
}

export function AddSubCategoryDrawer({
  isOpen,
  onClose,
  onAddSubCategory,
}: AddSubCategoryDrawerProps) {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (file: File | null) => {
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview("");
    }
  };

  const handleAddSubCategory = () => {
    if (!subCategoryName.trim()) {
      alert("Please enter a sub-category name");
      return;
    }

    const newSubCategory: SubCategory = {
      id: Date.now().toString(),
      name: subCategoryName.trim(),
      image: imagePreview || "/placeholder-image.jpg",
    };

    onAddSubCategory(newSubCategory);
    handleClose();
  };

  const handleClose = () => {
    setSubCategoryName("");
    setImagePreview("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:bg-black/50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Content */}
      <div className="relative bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold">Add Sub Category</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Sub Category Name */}
          <div className="space-y-2">
            <Label htmlFor="subCategoryName" className="text-sm font-medium">
              Sub Category Name
            </Label>
            <Input
              id="subCategoryName"
              type="text"
              placeholder="Enter sub category name"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="subCategoryImage" className="text-sm font-medium">
              Sub Category Image
            </Label>
            <ImageUpload
              onImageChange={handleImageChange}
              aspectRatio="square"
              height="h-48"
              maxHeight="max-h-48"
              maxSize={10}
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddSubCategory}
            className="flex-1 h-11 bg-[#CC5500] hover:bg-[#B34D00]"
            disabled={!subCategoryName.trim()}
          >
            Add Sub Category
          </Button>
        </div>
      </div>
    </div>
  );
}