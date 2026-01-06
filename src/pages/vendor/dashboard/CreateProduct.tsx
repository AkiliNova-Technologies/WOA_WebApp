import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Steps, type StepItem } from "@/components/steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextEditor } from "@/components/text-editor";
import { ImageUpload } from "@/components/image-upload";
import { VideoUpload } from "@/components/video-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, X, MoreVertical, Pencil, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { useReduxProducts } from "@/hooks/useReduxProducts";

interface ProductFormData {
  // Basic Information
  name: string;
  category: string;
  subCategory: string;
  subCategoryType: string;
  description: string;

  // Product Upload - Now using URLs instead of Files
  imageUrls: string[];
  storyOption: "image-text" | "video";
  storyText: string;
  storyImageUrl?: string;
  storyVideoUrl?: string;

  // Additional Details
  specifications: string;
  careInstructions: string;

  // Variants
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  attributeName: string;
  size: string;
  options: VariantOption[];
  lowStockUnit: number;
}

interface VariantOption {
  id: string;
  color: string;
  quantity: number;
  price: string;
}

const categories = [
  { value: "fashion-apparel", label: "Fashion & Apparel" },
  { value: "home-living", label: "Home & Living" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "jewelry", label: "Jewelry & Accessories" },
];

const subCategories = {
  "fashion-apparel": [
    { value: "womens-fashion", label: "Women's Fashion" },
    { value: "mens-fashion", label: "Men's Fashion" },
    { value: "kids-fashion", label: "Kids Fashion" },
  ],
};

const subCategoryTypes = {
  "womens-fashion": [
    { value: "sandals", label: "Sandals" },
    { value: "dresses", label: "Dresses" },
    { value: "tops", label: "Tops" },
  ],
};

export default function ProductAddPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );

  const { createLoading } = useReduxProducts();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    subCategory: "",
    subCategoryType: "",
    description: "",
    imageUrls: [],
    storyOption: "image-text",
    storyText: "",
    storyImageUrl: undefined,
    storyVideoUrl: undefined,
    specifications: "",
    careInstructions: "",
    variants: [],
  });

  const [tempVariant, setTempVariant] = useState<ProductVariant>({
    id: "",
    attributeName: "",
    size: "",
    options: [],
    lowStockUnit: 10,
  });

  const [tempOption, setTempOption] = useState<VariantOption>({
    id: "",
    color: "",
    quantity: 0,
    price: "",
  });

  const steps: StepItem[] = [
    { title: "Basic Information" },
    { title: "Product Upload" },
    { title: "Additional Details" },
    { title: "Add Variants" },
    { title: "Preview and submit" },
  ];

  const addOptionToVariant = () => {
    if (tempOption.color && tempOption.quantity && tempOption.price) {
      setTempVariant((prev) => ({
        ...prev,
        options: [
          ...prev.options,
          { ...tempOption, id: Date.now().toString() },
        ],
      }));
      setTempOption({ id: "", color: "", quantity: 0, price: "" });
    }
  };

  const removeOptionFromVariant = (optionId: string) => {
    setTempVariant((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== optionId),
    }));
  };

  const saveVariant = () => {
    if (
      tempVariant.attributeName &&
      tempVariant.size &&
      tempVariant.options.length > 0
    ) {
      if (editingVariant) {
        setFormData((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v.id === editingVariant.id ? tempVariant : v
          ),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          variants: [
            ...prev.variants,
            { ...tempVariant, id: Date.now().toString() },
          ],
        }));
      }
      setShowVariantDialog(false);
      setEditingVariant(null);
      setTempVariant({
        id: "",
        attributeName: "",
        size: "",
        options: [],
        lowStockUnit: 10,
      });
    }
  };

  const editVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setTempVariant(variant);
    setShowVariantDialog(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as draft:", formData);
    // API call would go here with formData containing URLs
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = () => {
    console.log("Submitting product:", formData);
    // All URLs are ready to send to backend
    // formData.imageUrls contains array of Supabase URLs
    // formData.storyVideoUrl contains Supabase URL
    navigate("/vendor/products");
  };

  return (
    <>
      <SiteHeader label="Product Management" />

      <div className="min-h-screen px-6">
        <div className="flex">
          {/* Sidebar with Steps */}
          <div className="w-60 max-w-60 shrink-0">
            <div className="sticky top-8 bg-white rounded-lg p-6 dark:bg-[#303030]">
              <Steps
                current={currentStep}
                items={steps}
                direction="vertical"
                onChange={setCurrentStep}
                completedSteps={Array.from(
                  { length: currentStep },
                  (_, i) => i
                )}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-6 space-y-6 pb-6">
            {/* Header */}
            <div className="bg-white rounded-md mb-6 dark:bg-[#303030]">
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
                    Back to Categories
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant={"outline"}
                    onClick={handleCancel}
                    className="px-6 py-2 border-none shadow-none rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAsDraft}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    disabled={createLoading}
                  >
                    {createLoading ? "Saving..." : "Save as draft"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <div className="max-w-8xl mx-auto space-y-6">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      Product name
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Enter a clear, simple name customers will recognize your
                      product by.
                    </p>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="product-name">
                            Product name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="product-name"
                            placeholder="e.g. African made sandals"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="h-11 mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue placeholder="Select the category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="sub-category">
                            Sub Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.subCategory}
                            onValueChange={(value) =>
                              setFormData({ ...formData, subCategory: value })
                            }
                            disabled={!formData.category}
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue placeholder="Select the sub category" />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.category &&
                                subCategories[
                                  formData.category as keyof typeof subCategories
                                ]?.map((sub) => (
                                  <SelectItem key={sub.value} value={sub.value}>
                                    {sub.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sub-category-type">
                            Sub Category type{" "}
                            <span className="text-sm text-gray-500">
                              (optional)
                            </span>
                          </Label>
                          <Select
                            value={formData.subCategoryType}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                subCategoryType: value,
                              })
                            }
                            disabled={!formData.subCategory}
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue placeholder="Select the sub category type" />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.subCategory &&
                                subCategoryTypes[
                                  formData.subCategory as keyof typeof subCategoryTypes
                                ]?.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">
                      Product Description{" "}
                      <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Add a short, engaging description that highlights key
                      details and what makes it unique.
                    </p>
                    <TextEditor
                      value={formData.description}
                      onChange={(value) =>
                        setFormData({ ...formData, description: value })
                      }
                      placeholder="Start typing your content here..."
                    />
                  </div>
                </Card>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleNext} className="text-white w-xs h-11">
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Product Upload */}
            {currentStep === 1 && (
              <div className="max-w-8xl mx-auto space-y-6">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      Product Images <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Good images help customers trust and choose your product.
                    </p>

                    <ImageUpload
                      onImageChange={(urls) => {
                        setFormData((prev) => ({ ...prev, imageUrls: urls }));
                        console.log("Product images uploaded:", urls);
                      }}
                      initialUrls={formData.imageUrls}
                      maxSize={10}
                      folder="products"
                      footer={true}
                    />
                  </div>
                </Card>

                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      Product Story <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      We'd love to hear your story this helps buyers connect
                      with the real person behind the products.
                    </p>

                    <div className="mb-6">
                      <p className="font-medium mb-4">Option A: Image + Text</p>
                      <TextEditor
                        value={formData.storyText}
                        onChange={(value) =>
                          setFormData({ ...formData, storyText: value })
                        }
                        placeholder="Tell your story..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Max of 500 characters
                      </p>
                    </div>

                    <div>
                      <p className="font-medium mb-4">Option B: Video</p>
                      <VideoUpload
                        onVideoChange={(url) => {
                          setFormData((prev) => ({
                            ...prev,
                            storyVideoUrl: url || undefined,
                          }));
                          console.log("Story video uploaded:", url);
                        }}
                        initialUrl={formData.storyVideoUrl}
                        maxSize={50}
                        folder="videos/stories"
                        description="Recommended size: 5Mbs · Max duration: 30secs"
                        footer={true}
                      />
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleNext} className="text-white w-xs h-11">
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Additional Details */}
            {currentStep === 2 && (
              <div className="max-w-8xl mx-auto space-y-6">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      Product Specifications{" "}
                      <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Provide the key details that define your product—such as
                      size, material, weight, and other specific attributes.
                    </p>

                    <TextEditor
                      value={formData.specifications}
                      onChange={(value) =>
                        setFormData({ ...formData, specifications: value })
                      }
                      placeholder="Enter product specifications..."
                    />
                  </div>
                </Card>

                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div>
                    <h2 className="text-2xl font-semibold mb-6">
                      Care Instructions <span className="text-red-500">*</span>
                    </h2>

                    <TextEditor
                      value={formData.careInstructions}
                      onChange={(value) =>
                        setFormData({ ...formData, careInstructions: value })
                      }
                      placeholder="Enter care instructions..."
                    />
                  </div>
                </Card>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleNext} className="text-white w-xs h-11">
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Add Variants */}
            {currentStep === 3 && (
              <div className="max-w-8xl mx-auto">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Add Variants</h2>
                    <Button onClick={() => setShowVariantDialog(true)}>
                      <Plus /> Add variant
                    </Button>
                  </div>

                  {formData.variants.length === 0 ? (
                    <></>
                  ) : (
                    <div className="space-y-6">
                      {formData.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              Size {variant.size}
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editVariant(variant)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit variant
                            </Button>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                    Color
                                  </th>
                                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                                    Qty Available
                                  </th>
                                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                                    Price (USD)
                                  </th>
                                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {variant.options.map((option) => (
                                  <tr
                                    key={option.id}
                                    className="border-b border-gray-100 dark:border-gray-800"
                                  >
                                    <td className="py-3 px-4">
                                      {option.color}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      {option.quantity}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      {option.price}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <button className="text-gray-500 hover:text-gray-700">
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="grid grid-cols-2 gap-8 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Total available stock
                              </p>
                              <p className="text-lg font-semibold">
                                {variant.options.reduce(
                                  (sum, opt) => sum + opt.quantity,
                                  0
                                )}{" "}
                                units
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Low stock unit
                              </p>
                              <p className="text-lg font-semibold">
                                {variant.lowStockUnit}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleNext} className="text-white w-xs h-11">
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Preview and Submit */}
            {currentStep === 4 && (
              <div className="max-w-8xl mx-auto space-y-6">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Basic Information</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(0)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Product name</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="font-medium">
                          {
                            categories.find(
                              (c) => c.value === formData.category
                            )?.label
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Sub category
                        </p>
                        <p className="font-medium">
                          {formData.subCategory &&
                            subCategories[
                              formData.category as keyof typeof subCategories
                            ]?.find((s) => s.value === formData.subCategory)
                              ?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Sub category type
                        </p>
                        <p className="font-medium">
                          {formData.subCategoryType &&
                            subCategoryTypes[
                              formData.subCategory as keyof typeof subCategoryTypes
                            ]?.find((t) => t.value === formData.subCategoryType)
                              ?.label}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Product description
                      </p>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formData.description,
                        }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Product Images</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  {formData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.storyVideoUrl && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 mb-3">Story Video</p>
                      <video
                        src={formData.storyVideoUrl}
                        controls
                        className="w-full max-h-64 rounded-lg"
                      />
                    </div>
                  )}
                </Card>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    className="text-white"
                    disabled={createLoading}
                  >
                    {createLoading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Variant Dialog */}
<Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Variant</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label htmlFor="attribute-name">
          Attribute name <span className="text-red-500">*</span>
        </Label>
        <Select
          value={tempVariant.attributeName}
          onValueChange={(value) =>
            setTempVariant({ ...tempVariant, attributeName: value })
          }
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select the attribute" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="size">Size</SelectItem>
            <SelectItem value="color">Color</SelectItem>
            <SelectItem value="material">Material</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tempVariant.attributeName && (
        <div>
          <Label htmlFor="define-size">
            Define {tempVariant.attributeName}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="define-size"
            placeholder="e.g. L"
            value={tempVariant.size}
            onChange={(e) =>
              setTempVariant({ ...tempVariant, size: e.target.value })
            }
            className="mt-2"
          />
        </div>
      )}

      <div>
        <Label>
          Sub categories it applies to{" "}
          <span className="text-red-500">*</span>
        </Label>
        
        {/* Current input row for adding new option */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <Input
            placeholder="Color"
            value={tempOption.color}
            onChange={(e) =>
              setTempOption({ ...tempOption, color: e.target.value })
            }
          />
          <Input
            placeholder="Qty"
            type="number"
            value={tempOption.quantity || ""}
            onChange={(e) =>
              setTempOption({
                ...tempOption,
                quantity: parseInt(e.target.value) || 0,
              })
            }
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              placeholder="Price"
              value={tempOption.price}
              onChange={(e) =>
                setTempOption({ ...tempOption, price: e.target.value })
              }
              className="pl-7"
            />
          </div>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={addOptionToVariant}
          className="mt-3"
        >
          + Add row
        </Button>

        {/* Display existing options */}
        {tempVariant.options.length > 0 && (
          <div className="mt-4 space-y-2">
            {tempVariant.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div className="flex gap-4">
                  <span>{option.color}</span>
                  <span>{option.quantity} units</span>
                  <span>${option.price}</span>
                </div>
                <button
                  onClick={() => removeOptionFromVariant(option.id)}
                  className="text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="low-stock">
          Define the low stock unit{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="low-stock"
          placeholder="e.g. 10"
          type="number"
          value={tempVariant.lowStockUnit}
          onChange={(e) =>
            setTempVariant({
              ...tempVariant,
              lowStockUnit: parseInt(e.target.value) || 0,
            })
          }
          className="mt-2"
        />
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowVariantDialog(false)}
      >
        Cancel
      </Button>
      <Button onClick={saveVariant}>Add</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>
    </>
  );
}
