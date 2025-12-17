import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload, type UploadDocument } from "@/components/image-upload";

// interface SubCategory {
//   id: string;
//   name: string;
//   image: string; 
// }

interface AddSubCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubCategory: (subCategory: { name: string; image: File | null }) => void;
}

export function AddSubCategoryDrawer({
  isOpen,
  onClose,
  onAddSubCategory,
}: AddSubCategoryDrawerProps) {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [documents, setDocuments] = useState<UploadDocument[]>([]);

  const handleImageChange = (files: UploadDocument[]) => {
    if (files.length > 0 && files[0].file) {
      // Use the first file if available
      const file = files[0].file;
      setSelectedImage(file);
      setImagePreview(files[0].previewUrl);
      
      // Also update the documents state for the ImageUpload component
      setDocuments(files);
    } else {
      setSelectedImage(null);
      setImagePreview("");
      setDocuments([]);
    }
  };

  const handleAddSubCategory = () => {
    if (!subCategoryName.trim()) {
      alert("Please enter a sub-category name");
      return;
    }

    if (!selectedImage) {
      alert("Please select an image for the sub-category");
      return;
    }

    // Call the parent function with the data
    onAddSubCategory({
      name: subCategoryName.trim(),
      image: selectedImage
    });
    
    handleClose();
  };

  const handleClose = () => {
    setSubCategoryName("");
    setSelectedImage(null);
    setImagePreview("");
    setDocuments([]);
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
      <div className="relative bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto dark:bg-[#1A1A1A]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-[#333333]">
          <h2 className="text-xl font-semibold dark:text-white">Add Sub Category</h2>
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
            <Label htmlFor="subCategoryName" className="text-sm font-medium dark:text-white">
              Sub Category Name *
            </Label>
            <Input
              id="subCategoryName"
              type="text"
              placeholder="Enter sub category name"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              className="h-11 dark:bg-[#303030] dark:border-[#444444] dark:text-white"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="subCategoryImage" className="text-sm font-medium dark:text-white">
              Sub Category Image *
            </Label>
            <ImageUpload
              onImageChange={handleImageChange}
              aspectRatio="square"
              height="h-48"
              maxHeight="max-h-48"
              maxSize={10}
              className="w-full"
              initialDocuments={documents}
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="mt-1 w-24 h-24 object-cover rounded-md border dark:border-[#444444]"
                />
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
            onClick={handleAddSubCategory}
            className="flex-1 h-11 bg-[#CC5500] hover:bg-[#B34D00] text-white"
            disabled={!subCategoryName.trim() || !selectedImage}
          >
            Add Sub Category
          </Button>
        </div>
      </div>
    </div>
  );
}