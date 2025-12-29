import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";

interface AddSubCategoryTypeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubCategoryType: (subCategoryType: { name: string; image: File | null }) => void;
}

export function AddSubCategoryTypeDrawer({
  isOpen,
  onClose,
  onAddSubCategoryType,
}: AddSubCategoryTypeDrawerProps) {
  const [subCategoryTypeName, setSubCategoryTypeName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // ✅ Changed to accept string[] (URLs) instead of UploadDocument[]
  const handleImageChange = (urls: string[]) => {
    if (urls.length > 0) {
      // Store the URL
      setUploadedUrls(urls);
      setImagePreview(urls[0]);
      
      // Note: Since ImageUpload now returns URLs from Supabase,
      // you'll need to handle file conversion differently or
      // modify your onAddSubCategoryType to accept URL instead of File
      
      // For now, we'll keep the URL in state
      // You may need to update the parent component to accept URL instead
    } else {
      setSelectedImage(null);
      setImagePreview("");
      setUploadedUrls([]);
    }
  };

  const handleAddSubCategoryType = () => {
    if (!subCategoryTypeName.trim()) {
      alert("Please enter a sub-category type name");
      return;
    }

    if (uploadedUrls.length === 0 && !selectedImage) {
      alert("Please select an image for the sub-category type");
      return;
    }

    // Call the parent function with the data
    // Note: You may need to update this based on whether parent expects File or URL
    onAddSubCategoryType({
      name: subCategoryTypeName.trim(),
      image: selectedImage // or pass uploadedUrls[0] if parent accepts URL
    });
    
    handleClose();
  };

  const handleClose = () => {
    setSubCategoryTypeName("");
    setSelectedImage(null);
    setImagePreview("");
    setUploadedUrls([]);
    
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
          <h2 className="text-xl font-semibold dark:text-white">Add Sub Category Type</h2>
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
            <Label htmlFor="subCategoryTypeName" className="text-sm font-medium dark:text-white">
              Sub Category Type Name *
            </Label>
            <Input
              id="subCategoryTypeName"
              type="text"
              placeholder="Enter sub category type name"
              value={subCategoryTypeName}
              onChange={(e) => setSubCategoryTypeName(e.target.value)}
              className="h-11 dark:bg-[#303030] dark:border-[#444444] dark:text-white"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="subCategoryTypeImage" className="text-sm font-medium dark:text-white">
              Sub Category Type Image *
            </Label>
            <ImageUpload
              onImageChange={handleImageChange}
              aspectRatio="square"
              height="h-48"
              maxHeight="max-h-48"
              maxSize={10}
              className="w-full"
              initialUrls={uploadedUrls}
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
            onClick={handleAddSubCategoryType}
            className="flex-1 h-11 bg-[#CC5500] hover:bg-[#B34D00] text-white"
            disabled={!subCategoryTypeName.trim() || (uploadedUrls.length === 0 && !selectedImage)}
          >
            Add Sub Category Type
          </Button>
        </div>
      </div>
    </div>
  );
}