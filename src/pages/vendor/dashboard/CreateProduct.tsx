import { useState, useEffect, useMemo } from "react";
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
import {
  ArrowLeft,
  X,
  MoreVertical,
  Pencil,
  Plus,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { useReduxCategories } from "@/hooks/useReduxCategories";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  categoryId: string;
  subcategoryId: string;
  productTypeId: string;
  description: string;
  imageUrls: string[];
  material: string;
  basePrice: string;
  baseCompareAtPrice: string;
  storyText: string;
  storyVideoUrl: string;
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
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

export default function ProductAddPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createNewProduct, createLoading, createError } = useReduxProducts();

  const {
    categories,
    subcategories,
    productTypes,
    loading: categoriesLoading,
    getPublicCategories,
    getPublicSubcategoriesByCategory,
    getPublicProductTypesBySubcategory,
  } = useReduxCategories();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    categoryId: "",
    subcategoryId: "",
    productTypeId: "",
    description: "",
    imageUrls: [],
    material: "",
    basePrice: "",
    baseCompareAtPrice: "",
    storyText: "",
    storyVideoUrl: "",
    variants: [],
  });

  const [tempVariant, setTempVariant] = useState<ProductVariant>({
    id: "",
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

  // Fetch categories on mount using public endpoint
  useEffect(() => {
    getPublicCategories();
  }, [getPublicCategories]);

  // Fetch subcategories when category changes using public endpoint
  useEffect(() => {
    if (formData.categoryId) {
      getPublicSubcategoriesByCategory(formData.categoryId);
      setFormData((prev) => ({
        ...prev,
        subcategoryId: "",
        productTypeId: "",
      }));
    }
  }, [formData.categoryId, getPublicSubcategoriesByCategory]);

  // Fetch product types when subcategory changes using public endpoint
  useEffect(() => {
    if (formData.subcategoryId) {
      getPublicProductTypesBySubcategory(formData.subcategoryId);
      setFormData((prev) => ({
        ...prev,
        productTypeId: "",
      }));
    }
  }, [formData.subcategoryId, getPublicProductTypesBySubcategory]);

  const filteredSubcategories = useMemo(() => {
    if (!formData.categoryId) return [];
    // Handle both categoryId and parentCategoryId (public API uses parentCategoryId)
    return subcategories.filter(
      (sub) =>
        sub.categoryId === formData.categoryId ||
        (sub as any).parentCategoryId === formData.categoryId,
    );
  }, [subcategories, formData.categoryId]);

  const filteredProductTypes = useMemo(() => {
    if (!formData.subcategoryId) return [];
    return productTypes.filter(
      (pt) => pt.subcategoryId === formData.subcategoryId,
    );
  }, [productTypes, formData.subcategoryId]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === formData.categoryId),
    [categories, formData.categoryId],
  );

  const selectedSubcategory = useMemo(
    () => subcategories.find((s) => s.id === formData.subcategoryId),
    [subcategories, formData.subcategoryId],
  );

  const selectedProductType = useMemo(
    () => productTypes.find((pt) => pt.id === formData.productTypeId),
    [productTypes, formData.productTypeId],
  );

  const steps: StepItem[] = [
    { title: "Basic Information" },
    { title: "Product Upload" },
    { title: "Product Story" },
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
    if (tempVariant.size && tempVariant.options.length > 0) {
      if (editingVariant) {
        setFormData((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v.id === editingVariant.id ? tempVariant : v,
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
      setTempVariant({ id: "", size: "", options: [], lowStockUnit: 10 });
    }
  };

  const editVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setTempVariant(variant);
    setShowVariantDialog(true);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.name.trim()) {
        toast.error("Please enter a product name");
        return;
      }
      if (!formData.categoryId) {
        toast.error("Please select a category");
        return;
      }
      if (!formData.subcategoryId) {
        toast.error("Please select a subcategory");
        return;
      }
      if (!formData.description.trim()) {
        toast.error("Please enter a product description");
        return;
      }
      if (!formData.material.trim()) {
        toast.error("Please enter material");
        return;
      }
    }
    if (currentStep === 1) {
      if (formData.imageUrls.length === 0) {
        toast.error("Please upload at least one product image");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.storyText.trim() && !formData.storyVideoUrl.trim()) {
        toast.error("Please add either a story text or video");
        return;
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter at least a product name to save as draft");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build attributes in the expected format
      const attributes: Record<string, string> = {};

      // Always include material since it's required
      attributes.material = formData.material || "";

      // Include story text/video if provided
      if (formData.storyText) {
        attributes.storyText = formData.storyText;
      }
      if (formData.storyVideoUrl) {
        attributes.storyVideoUrl = formData.storyVideoUrl;
      }

      // Collect size and color from variants
      const sizes = [...new Set(formData.variants.map((v) => v.size))];
      const colors = [
        ...new Set(
          formData.variants.flatMap((v) => v.options.map((o) => o.color)),
        ),
      ];

      if (sizes.length > 0) {
        attributes.size = sizes.join(",");
      }
      if (colors.length > 0) {
        attributes.color = colors.join(",");
      }

      // Prepare product data - ensure all required fields are provided with default values
      const productData = {
        name: formData.name.trim() || "Untitled Product",
        description: formData.description || "",
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : 0,
        baseCompareAtPrice: formData.baseCompareAtPrice
          ? parseFloat(formData.baseCompareAtPrice)
          : 0,
        attributes,
        images: formData.imageUrls.length > 0 ? formData.imageUrls : [],
        categoryId: formData.categoryId || "",
        subcategoryId: formData.subcategoryId || "",
        productTypeId: formData.productTypeId || "",
      };

      console.log("Sending product data:", productData); // Debug log

      await createNewProduct(productData);
      toast.success("Product saved as draft!");
      navigate("/vendor/products");
    } catch (error: any) {
      console.error("Failed to save draft:", error);
      toast.error(error?.message || "Failed to save draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.subcategoryId) {
      toast.error("Please select a subcategory");
      return;
    }
    if (!formData.productTypeId) {
      toast.error("Please select a product type");
      return;
    }
    if (formData.imageUrls.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    if (!formData.material.trim()) {
      toast.error("Please enter material");
      return;
    }
    if (!formData.storyText.trim() && !formData.storyVideoUrl.trim()) {
      toast.error("Please add either a story text or video");
      return;
    }

    let basePrice = formData.basePrice ? parseFloat(formData.basePrice) : 0;
    if (!basePrice && formData.variants.length > 0) {
      const allPrices = formData.variants
        .flatMap((v) => v.options.map((o) => parseFloat(o.price) || 0))
        .filter((p) => p > 0);
      if (allPrices.length > 0) basePrice = Math.min(...allPrices);
    }
    if (basePrice <= 0) {
      toast.error("Please set a valid price for your product");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build attributes in the expected format
      const attributes: Record<string, string> = {};

      // Always include material since it's required
      attributes.material = formData.material || "";

      // Include story text/video
      if (formData.storyText) {
        attributes.storyText = formData.storyText;
      }
      if (formData.storyVideoUrl) {
        attributes.storyVideoUrl = formData.storyVideoUrl;
      }

      // Collect size and color from variants
      const sizes = [...new Set(formData.variants.map((v) => v.size))];
      const colors = [
        ...new Set(
          formData.variants.flatMap((v) => v.options.map((o) => o.color)),
        ),
      ];

      if (sizes.length > 0) {
        attributes.size = sizes.join(",");
      } else {
        attributes.size = "medium"; // Default size if no variants
      }

      if (colors.length > 0) {
        attributes.color = colors.join(",");
      } else {
        attributes.color = "multi"; // Default color if no variants
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description,
        basePrice: basePrice,
        baseCompareAtPrice: formData.baseCompareAtPrice
          ? parseFloat(formData.baseCompareAtPrice)
          : 0,
        attributes,
        images: formData.imageUrls,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        productTypeId: formData.productTypeId,
      };

      console.log("Submitting product data:", productData); // Debug log

      await createNewProduct(productData);
      toast.success("Product created successfully!");
      navigate("/vendor/products");
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(
        error?.message || "Failed to create product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalStock = useMemo(() => {
    return formData.variants.reduce((total, variant) => {
      return (
        total + variant.options.reduce((sum, opt) => sum + opt.quantity, 0)
      );
    }, 0);
  }, [formData.variants]);

  const priceRange = useMemo(() => {
    const allPrices = formData.variants
      .flatMap((v) => v.options.map((o) => parseFloat(o.price) || 0))
      .filter((p) => p > 0);
    if (allPrices.length === 0)
      return formData.basePrice ? `$${formData.basePrice}` : "Not set";
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    if (min === max) return `$${min.toFixed(2)}`;
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }, [formData.variants, formData.basePrice]);

  return (
    <>
      <SiteHeader label="Product Management" />
      <div className="min-h-screen px-6">
        <div className="flex">
          <div className="w-60 max-w-60 shrink-0">
            <div className="sticky top-8 bg-white rounded-lg p-6 dark:bg-[#303030]">
              <Steps
                current={currentStep}
                items={steps}
                direction="vertical"
                onChange={setCurrentStep}
                completedSteps={Array.from(
                  { length: currentStep },
                  (_, i) => i,
                )}
              />
            </div>
          </div>
          <div className="flex-1 px-6 space-y-6 pb-6">
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
                    Back to Products
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant={"outline"}
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-6 py-2 border-none shadow-none rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAsDraft}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    disabled={isSubmitting || createLoading}
                  >
                    {(isSubmitting || createLoading) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save as draft
                  </Button>
                </div>
              </div>
            </div>

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
                            value={formData.categoryId}
                            onValueChange={(value) =>
                              setFormData({ ...formData, categoryId: value })
                            }
                            disabled={categoriesLoading}
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue
                                placeholder={
                                  categoriesLoading
                                    ? "Loading categories..."
                                    : "Select the category"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {!categoriesLoading && categories.length === 0 ? (
                                <SelectItem
                                  value="__empty__"
                                  disabled
                                  className="text-gray-500 italic"
                                >
                                  No categories available
                                </SelectItem>
                              ) : (
                                categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))
                              )}
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
                            value={formData.subcategoryId}
                            onValueChange={(value) =>
                              setFormData({ ...formData, subcategoryId: value })
                            }
                            disabled={!formData.categoryId || categoriesLoading}
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue
                                placeholder={
                                  !formData.categoryId
                                    ? "Select a category first"
                                    : categoriesLoading
                                      ? "Loading subcategories..."
                                      : "Select the sub category"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.categoryId &&
                              !categoriesLoading &&
                              filteredSubcategories.length === 0 ? (
                                <SelectItem
                                  value="__empty__"
                                  disabled
                                  className="text-gray-500"
                                >
                                  No subcategories available
                                </SelectItem>
                              ) : (
                                filteredSubcategories.map((sub) => (
                                  <SelectItem key={sub.id} value={sub.id}>
                                    {sub.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sub-category-type">
                            Product Type{" "}
                            <span className="text-sm text-gray-500">
                              (optional)
                            </span>
                          </Label>
                          <Select
                            value={formData.productTypeId}
                            onValueChange={(value) =>
                              setFormData({ ...formData, productTypeId: value })
                            }
                            disabled={
                              !formData.subcategoryId || categoriesLoading
                            }
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue
                                placeholder={
                                  !formData.subcategoryId
                                    ? "Select a subcategory first"
                                    : categoriesLoading
                                      ? "Loading product types..."
                                      : "Select the product type"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.subcategoryId &&
                              !categoriesLoading &&
                              filteredProductTypes.length === 0 ? (
                                <SelectItem
                                  value="__empty__"
                                  disabled
                                  className="text-gray-500"
                                >
                                  No product types available
                                </SelectItem>
                              ) : (
                                filteredProductTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="base-price">
                            Base Price (USD){" "}
                            <span className="text-sm text-gray-500">
                              (optional if using variants)
                            </span>
                          </Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              id="base-price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={formData.basePrice}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  basePrice: e.target.value,
                                })
                              }
                              className="h-11 pl-7"
                            />
                          </div>
                        </div>
                      
                        <div>
                          <Label htmlFor="compare-price">
                            Compare at Price (USD){" "}
                            <span className="text-sm text-gray-500">
                              (optional)
                            </span>
                          </Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              id="compare-price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={formData.baseCompareAtPrice}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  baseCompareAtPrice: e.target.value,
                                })
                              }
                              className="h-11 pl-7"
                            />
                          </div>
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
                      }}
                      initialUrls={formData.imageUrls}
                      maxSize={10}
                      maxImages={5}
                      folder="products"
                      footer={true}
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

            {currentStep === 2 && (
              <div className="max-w-8xl mx-auto space-y-6">
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
                      <p className="font-medium mb-4">Option A: Text</p>
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
                            storyVideoUrl: url || "",
                          }));
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

            {currentStep === 3 && (
              <div className="max-w-8xl mx-auto">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold">Add Variants</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add different sizes, colors, and prices for your product
                        variants.
                      </p>
                    </div>
                    <Button onClick={() => setShowVariantDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Add variant
                    </Button>
                  </div>
                  {formData.variants.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No variants added yet.</p>
                      <p className="text-sm mt-2">
                        Click "Add variant" to create size and color options
                        with pricing.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {formData.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              Size: {variant.size}
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
                                      ${option.price}
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
                                  0,
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
                      <p className="font-medium">
                        {formData.name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Material</p>
                      <p className="font-medium">
                        {formData.material || "Not set"}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="font-medium">
                          {selectedCategory?.name || "Not selected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Sub category
                        </p>
                        <p className="font-medium">
                          {selectedSubcategory?.name || "Not selected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Product type
                        </p>
                        <p className="font-medium">
                          {selectedProductType?.name || "Not selected"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Price Range
                        </p>
                        <p className="font-medium">{priceRange}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Total Stock
                        </p>
                        <p className="font-medium">
                          {totalStock > 0 ? `${totalStock} units` : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Variants</p>
                        <p className="font-medium">
                          {formData.variants.length} variant(s)
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Product description
                      </p>
                      <div
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html:
                            formData.description || "No description provided",
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
                  {formData.imageUrls.length > 0 ? (
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
                  ) : (
                    <p className="text-gray-500">No images uploaded</p>
                  )}
                </Card>
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Product Story</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  {formData.storyText && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-3">Story Text</p>
                      <div
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: formData.storyText }}
                      />
                    </div>
                  )}
                  {formData.storyVideoUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Story Video</p>
                      <video
                        src={formData.storyVideoUrl}
                        controls
                        className="w-full max-h-64 rounded-lg"
                      />
                    </div>
                  )}
                  {!formData.storyText && !formData.storyVideoUrl && (
                    <p className="text-gray-500">No story added</p>
                  )}
                </Card>
                {formData.variants.length > 0 && (
                  <Card className="p-6 dark:bg-[#303030] shadow-none">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">Variants</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {formData.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <p className="font-medium mb-2">
                            Size: {variant.size}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {variant.options.map((option) => (
                              <span
                                key={option.id}
                                className="px-3 py-1 bg-white dark:bg-gray-700 rounded text-sm"
                              >
                                {option.color} - {option.quantity} units @ $
                                {option.price}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {createError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {createError}
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    className="text-white"
                    disabled={isSubmitting || createLoading}
                  >
                    {(isSubmitting || createLoading) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Submit Product
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? "Edit Variant" : "Add Variant"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="define-size">
                  Size <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={tempVariant.size}
                  onValueChange={(value) =>
                    setTempVariant({ ...tempVariant, size: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select the size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                    <SelectItem value="3XL">3XL</SelectItem>
                    <SelectItem value="One Size">One Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="material">
                  Material <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="material"
                  placeholder="e.g. Kente, Leather, Cotton"
                  value={formData.material}
                  onChange={(e) =>
                    setFormData({ ...formData, material: e.target.value })
                  }
                  className="h-11 mt-2"
                />
              </div>
              <div>
                <Label>
                  Color Options (Color, Quantity, Price){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <Input
                    placeholder="Color name"
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
                  disabled={
                    !tempOption.color ||
                    !tempOption.quantity ||
                    !tempOption.price
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> Add option
                </Button>
                {tempVariant.options.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {tempVariant.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div className="flex gap-4">
                          <span className="font-medium">{option.color}</span>
                          <span>{option.quantity} units</span>
                          <span>${option.price}</span>
                        </div>
                        <button
                          onClick={() => removeOptionFromVariant(option.id)}
                          className="text-red-500 hover:text-red-600"
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
                  Low stock alert threshold{" "}
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
                onClick={() => {
                  setShowVariantDialog(false);
                  setEditingVariant(null);
                  setTempVariant({
                    id: "",
                    size: "",
                    options: [],
                    lowStockUnit: 10,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveVariant}
                disabled={!tempVariant.size || tempVariant.options.length === 0}
              >
                {editingVariant ? "Update" : "Add"} Variant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
