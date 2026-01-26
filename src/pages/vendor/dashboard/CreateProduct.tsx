import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  Pencil,
  Plus,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { useReduxCategories, type Attribute } from "@/hooks/useReduxCategories";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductFormData {
  name: string;
  categoryId: string;
  subcategoryId: string;
  productTypeId: string;
  description: string;
  imageUrls: string[];
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
  sku?: string;
}

// Color mapping constant to avoid repetition
const COLOR_MAP: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  yellow: "#fbbf24",
  purple: "#8b5cf6",
  pink: "#ec4899",
  brown: "#92400e",
  gray: "#6b7280",
};

const getColorHex = (colorName: string): string => {
  return COLOR_MAP[colorName.toLowerCase()] || "#ffffff";
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "One Size"];

const STEPS: StepItem[] = [
  { title: "Basic Information" },
  { title: "Product Upload" },
  { title: "Product Story" },
  { title: "Add Variants" },
  { title: "Preview and submit" },
];

const INITIAL_FORM_DATA: ProductFormData = {
  name: "",
  categoryId: "",
  subcategoryId: "",
  productTypeId: "",
  description: "",
  imageUrls: [],
  basePrice: "",
  baseCompareAtPrice: "",
  storyText: "",
  storyVideoUrl: "",
  variants: [],
};

const INITIAL_VARIANT: ProductVariant = {
  id: "",
  size: "",
  options: [],
  lowStockUnit: 10,
};

const INITIAL_OPTION: VariantOption = {
  id: "",
  color: "",
  quantity: 0,
  price: "",
  sku: "",
};

export default function ProductAddPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  // Separate loading states for each dropdown
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);

  const { createNewProduct, createLoading } = useReduxProducts();

  const {
    categories,
    subcategories,
    productTypes,
    loading: categoriesLoading,
    getPublicCategories,
    getPublicSubcategoriesByCategory,
    getPublicProductTypesBySubcategory,
    getAttributesForCategory,
  } = useReduxCategories();

  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [tempVariant, setTempVariant] = useState<ProductVariant>(INITIAL_VARIANT);
  const [tempOption, setTempOption] = useState<VariantOption>(INITIAL_OPTION);

  const prevCategoryId = useRef<string | null>(null);
  const prevSubcategoryId = useRef<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    getPublicCategories();
  }, [getPublicCategories]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.categoryId && prevCategoryId.current !== formData.categoryId) {
      setLoadingSubcategories(true);
      
      getPublicSubcategoriesByCategory(formData.categoryId)
        .finally(() => setLoadingSubcategories(false));

      setFormData((prev) => ({
        ...prev,
        subcategoryId: "",
        productTypeId: "",
      }));

      setAttributes([]);
      setAttributeValues({});
      prevCategoryId.current = formData.categoryId;
    }
  }, [formData.categoryId, getPublicSubcategoriesByCategory]);

  // Fetch product types when subcategory changes
  useEffect(() => {
    if (formData.subcategoryId && prevSubcategoryId.current !== formData.subcategoryId) {
      setLoadingProductTypes(true);
      
      getPublicProductTypesBySubcategory(formData.subcategoryId)
        .finally(() => setLoadingProductTypes(false));

      setFormData((prev) => ({
        ...prev,
        productTypeId: "",
      }));

      prevSubcategoryId.current = formData.subcategoryId;
    }
  }, [formData.subcategoryId, getPublicProductTypesBySubcategory]);

  // Fetch attributes when subcategory changes
  useEffect(() => {
    if (formData.subcategoryId) {
      fetchAttributesForSubcategory(formData.subcategoryId);
    } else {
      setAttributes([]);
      setAttributeValues({});
    }
  }, [formData.subcategoryId]);

  const fetchAttributesForSubcategory = useCallback(async (subcategoryId: string) => {
    setLoadingAttributes(true);
    try {
      let attrs: Attribute[] = [];

      if (typeof getAttributesForCategory === "function") {
        attrs = await getAttributesForCategory(subcategoryId);
      } else {
        console.warn("getAttributesForCategory not available in hook");
        toast.warning("Attributes feature not fully implemented");
      }

      setAttributes(attrs);

      const initialValues: Record<string, string> = {};
      attrs.forEach((attr) => {
        if (attr.isRequired) {
          initialValues[attr.name] = "";
        }
      });
      setAttributeValues(initialValues);
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
      toast.error("Failed to load product attributes");
      setAttributes([]);
    } finally {
      setLoadingAttributes(false);
    }
  }, [getAttributesForCategory]);

  const filteredSubcategories = useMemo(() => {
    if (!formData.categoryId) return [];
    return subcategories.filter(
      (sub) =>
        sub.categoryId === formData.categoryId ||
        (sub as any).parentCategoryId === formData.categoryId
    );
  }, [subcategories, formData.categoryId]);

  const filteredProductTypes = useMemo(() => {
    if (!formData.subcategoryId) return [];
    return productTypes.filter((pt) => pt.subcategoryId === formData.subcategoryId);
  }, [productTypes, formData.subcategoryId]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === formData.categoryId),
    [categories, formData.categoryId]
  );

  const selectedSubcategory = useMemo(
    () => subcategories.find((s) => s.id === formData.subcategoryId),
    [subcategories, formData.subcategoryId]
  );

  const selectedProductType = useMemo(
    () => productTypes.find((pt) => pt.id === formData.productTypeId),
    [productTypes, formData.productTypeId]
  );

  const totalStock = useMemo(() => {
    return formData.variants.reduce(
      (total, variant) =>
        total + variant.options.reduce((sum, opt) => sum + opt.quantity, 0),
      0
    );
  }, [formData.variants]);

  const priceRange = useMemo(() => {
    const allPrices = formData.variants
      .flatMap((v) => v.options.map((o) => parseFloat(o.price) || 0))
      .filter((p) => p > 0);

    if (allPrices.length === 0) {
      return formData.basePrice
        ? `$${parseFloat(formData.basePrice).toFixed(2)}`
        : "Not set";
    }

    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }, [formData.variants, formData.basePrice]);

  const requiredAttributesFilled = useMemo(() => {
    return attributes
      .filter((attr) => attr.isRequired)
      .every((attr) => attributeValues[attr.name]?.trim());
  }, [attributes, attributeValues]);

  // Helper functions
  const generateSKU = useCallback((size: string, color: string): string => {
    const prefix = selectedCategory?.name.substring(0, 3).toUpperCase() || "PRD";
    const sizeCode = size.substring(0, 2).toUpperCase();
    const colorCode = color.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}-${sizeCode}-${colorCode}-${random}`;
  }, [selectedCategory?.name]);

  const addOptionToVariant = useCallback(() => {
    if (tempOption.color && tempOption.quantity && tempOption.price) {
      const sku = tempOption.sku || generateSKU(tempVariant.size, tempOption.color);
      setTempVariant((prev) => ({
        ...prev,
        options: [
          ...prev.options,
          {
            ...tempOption,
            id: Date.now().toString(),
            sku,
            price: parseFloat(tempOption.price).toFixed(2),
          },
        ],
      }));
      setTempOption(INITIAL_OPTION);
    }
  }, [tempOption, tempVariant.size, generateSKU]);

  const removeOptionFromVariant = useCallback((optionId: string) => {
    setTempVariant((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== optionId),
    }));
  }, []);

  const saveVariant = useCallback(() => {
    if (tempVariant.size && tempVariant.options.length > 0) {
      if (editingVariant) {
        setFormData((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v.id === editingVariant.id ? { ...tempVariant, id: v.id } : v
          ),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          variants: [...prev.variants, { ...tempVariant, id: Date.now().toString() }],
        }));
      }
      setShowVariantDialog(false);
      setEditingVariant(null);
      setTempVariant(INITIAL_VARIANT);
      setTempOption(INITIAL_OPTION);
    }
  }, [tempVariant, editingVariant]);

  const editVariant = useCallback((variant: ProductVariant) => {
    setEditingVariant(variant);
    setTempVariant(variant);
    setShowVariantDialog(true);
  }, []);

  const deleteVariant = useCallback((variantId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== variantId),
    }));
    toast.success("Variant deleted");
  }, []);

  const validateAttributes = useCallback((): boolean => {
    const missingAttributes = attributes
      .filter((attr) => attr.isRequired && !attributeValues[attr.name]?.trim())
      .map((attr) => attr.name);

    if (missingAttributes.length > 0) {
      toast.error(`Please fill in required attributes: ${missingAttributes.join(", ")}`);
      return false;
    }
    return true;
  }, [attributes, attributeValues]);

  const buildAttributes = useCallback(() => {
    const attributesToSend: Record<string, string> = {};

    attributes.forEach((attr) => {
      const value = attributeValues[attr.name]?.trim();
      if (value) {
        attributesToSend[attr.name] = value;
      }
    });

    return Object.keys(attributesToSend).length > 0 ? attributesToSend : undefined;
  }, [attributes, attributeValues]);

  const handleNext = useCallback(() => {
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
      if (!validateAttributes()) {
        return;
      }
    }
    if (currentStep === 1 && formData.imageUrls.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    if (currentStep === 2 && !formData.storyText.trim() && !formData.storyVideoUrl.trim()) {
      toast.error("Please add either a story text or video");
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, formData, validateAttributes]);

  const handleSaveAsDraft = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!validateAttributes()) return;

    setIsSubmitting(true);

    try {
      const attributesToSend = buildAttributes();

      const productData = {
        name: formData.name.trim(),
        description: formData.description || "",
        storyText: formData.storyText || "",
        storyVideoUrl: formData.storyVideoUrl || "",
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : 0,
        baseCompareAtPrice: formData.baseCompareAtPrice
          ? parseFloat(formData.baseCompareAtPrice)
          : 0,
        images: formData.imageUrls,
        categoryId: formData.categoryId || "",
        subcategoryId: formData.subcategoryId || "",
        productTypeId: formData.productTypeId || "",
        ...(attributesToSend && { attributes: attributesToSend }),
      };

      console.log("Saving draft:", productData);

      await createNewProduct(productData);
      toast.success("Product saved as draft!");
      navigate("/vendor/products");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateAttributes, buildAttributes, createNewProduct, navigate]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!formData.categoryId || !formData.subcategoryId) {
      toast.error("Please select a category and subcategory");
      return;
    }

    if (formData.imageUrls.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    if (!formData.storyText.trim() && !formData.storyVideoUrl.trim()) {
      toast.error("Please add either a story text or video");
      return;
    }

    if (!validateAttributes()) return;

    let basePrice = formData.basePrice ? parseFloat(formData.basePrice) : 0;

    if (!basePrice && formData.variants.length > 0) {
      const prices = formData.variants
        .flatMap((v) => v.options.map((o) => parseFloat(o.price) || 0))
        .filter((p) => p > 0);

      if (prices.length) basePrice = Math.min(...prices);
    }

    if (basePrice <= 0) {
      toast.error("Please set a valid price");
      return;
    }

    setIsSubmitting(true);

    try {
      const attributesToSend = buildAttributes();

      const productData = {
        name: formData.name.trim(),
        description: formData.description || "",
        storyText: formData.storyText || "",
        storyVideoUrl: formData.storyVideoUrl || "",
        basePrice,
        baseCompareAtPrice: formData.baseCompareAtPrice
          ? parseFloat(formData.baseCompareAtPrice)
          : 0,
        images: formData.imageUrls,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        productTypeId: formData.productTypeId || "",
        ...(attributesToSend && { attributes: attributesToSend }),
      };

      console.log("Submitting product:", productData);

      await createNewProduct(productData);
      toast.success("Product created successfully!");
      navigate("/vendor/products");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateAttributes, buildAttributes, createNewProduct, navigate]);

  const handleFormChange = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
      subcategoryId: "",
      productTypeId: "",
    }));
  }, []);

  const handleSubcategoryChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      subcategoryId: value,
      productTypeId: "",
    }));
  }, []);

  const handleProductTypeChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      productTypeId: value,
    }));
  }, []);

  const handleAttributeChange = useCallback((attrName: string, value: string) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attrName]: value,
    }));
  }, []);

  const closeVariantDialog = useCallback(() => {
    setShowVariantDialog(false);
    setEditingVariant(null);
    setTempVariant(INITIAL_VARIANT);
    setTempOption(INITIAL_OPTION);
  }, []);

  // Get placeholder text for dropdowns
  const getCategoryPlaceholder = () => {
    if (categoriesLoading) return "Loading categories...";
    return "Select category";
  };

  const getSubcategoryPlaceholder = () => {
    if (!formData.categoryId) return "Select category first";
    if (loadingSubcategories) return "Loading subcategories...";
    return "Select subcategory";
  };

  const getProductTypePlaceholder = () => {
    if (!formData.subcategoryId) return "Select subcategory first";
    if (loadingProductTypes) return "Loading product types...";
    return "Select product type";
  };

  return (
    <>
      <SiteHeader label="Product Management" />
      <div className="min-h-screen px-6">
        <div className="flex">
          <div className="w-60 max-w-60 shrink-0">
            <div className="sticky top-8 bg-white rounded-lg p-6 dark:bg-[#303030]">
              <Steps
                current={currentStep}
                items={STEPS}
                direction="vertical"
                onChange={setCurrentStep}
                completedSteps={Array.from({ length: currentStep }, (_, i) => i)}
              />
            </div>
          </div>
          <div className="flex-1 px-6 space-y-6 pb-6">
            {/* Header */}
            <div className="bg-white rounded-md mb-6 dark:bg-[#303030]">
              <div className="mx-auto px-10 py-4 flex items-center justify-between">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="secondary"
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
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-6 py-2 border-none shadow-none rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAsDraft}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    disabled={isSubmitting || createLoading || !formData.name.trim()}
                  >
                    {(isSubmitting || createLoading) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save as draft
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className="max-w-8xl mx-auto space-y-6">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      Product Information
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Fill in the basic details about your product.
                    </p>
                    <div className="space-y-6">
                      {/* Product Name & Category */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="product-name">
                            Product name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="product-name"
                            placeholder="e.g. African made sandals"
                            value={formData.name}
                            onChange={(e) => handleFormChange("name", e.target.value)}
                            className="h-11 mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.categoryId}
                            onValueChange={handleCategoryChange}
                            disabled={categoriesLoading}
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue placeholder={getCategoryPlaceholder()} />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriesLoading ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                  </div>
                                </SelectItem>
                              ) : categories.length === 0 ? (
                                <SelectItem value="empty" disabled>
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

                      {/* Subcategory & Product Type */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="sub-category">
                            Sub Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.subcategoryId}
                            onValueChange={handleSubcategoryChange}
                            disabled={!formData.categoryId || loadingSubcategories}
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue placeholder={getSubcategoryPlaceholder()} />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingSubcategories ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                  </div>
                                </SelectItem>
                              ) : formData.categoryId && filteredSubcategories.length === 0 ? (
                                <SelectItem value="empty" disabled>
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
                          <Label htmlFor="product-type">
                            Product Type
                            <span className="text-sm text-gray-500 ml-2">
                              (optional)
                            </span>
                          </Label>
                          <Select
                            value={formData.productTypeId}
                            onValueChange={handleProductTypeChange}
                            disabled={!formData.subcategoryId || loadingProductTypes}
                          >
                            <SelectTrigger className="min-h-11 mt-2">
                              <SelectValue placeholder={getProductTypePlaceholder()} />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingProductTypes ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                  </div>
                                </SelectItem>
                              ) : formData.subcategoryId && filteredProductTypes.length === 0 ? (
                                <SelectItem value="empty" disabled>
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

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="base-price">
                            Base Price (USD)
                            <span className="text-sm text-gray-500 ml-2">
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
                              onChange={(e) => handleFormChange("basePrice", e.target.value)}
                              className="h-11 pl-7"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="compare-price">
                            Compare at Price (USD)
                            <span className="text-sm text-gray-500 ml-2">
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
                              onChange={(e) => handleFormChange("baseCompareAtPrice", e.target.value)}
                              className="h-11 pl-7"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Attributes Section */}
                      {formData.subcategoryId && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-xl font-semibold">
                                Product Attributes
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Required attributes for {selectedSubcategory?.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  requiredAttributesFilled ? "bg-green-500" : "bg-yellow-500"
                                )}
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {requiredAttributesFilled
                                  ? "All required attributes filled"
                                  : "Required attributes pending"}
                              </span>
                            </div>
                          </div>

                          {loadingAttributes ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                              <span className="ml-2 text-gray-600">
                                Loading attributes...
                              </span>
                            </div>
                          ) : attributes.length > 0 ? (
                            <div className="grid grid-cols-2 gap-6">
                              {attributes.map((attr) => (
                                <div key={attr.id} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`attr-${attr.id}`} className="font-medium">
                                      {attr.name}
                                      {attr.isRequired && (
                                        <span className="text-red-500 ml-1">*</span>
                                      )}
                                    </Label>
                                    {!attr.isRequired && (
                                      <span className="text-xs text-gray-500">(optional)</span>
                                    )}
                                  </div>
                                  <Input
                                    id={`attr-${attr.id}`}
                                    placeholder={`Enter ${attr.name.toLowerCase()}`}
                                    value={attributeValues[attr.name] || ""}
                                    onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                                    className="h-11"
                                    required={attr.isRequired}
                                  />
                                  {attr.isRequired && !attributeValues[attr.name] && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      This field is required
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                              <p className="text-gray-600 dark:text-gray-400">
                                No specific attributes required for this category
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                You can add variants in the next steps
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Description Card */}
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">
                      Product Description <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Add a detailed description that highlights key features and benefits.
                    </p>
                    <TextEditor
                      value={formData.description}
                      onChange={(value) => handleFormChange("description", value)}
                      placeholder="Describe your product in detail..."
                    />
                  </div>
                </Card>

                {/* Next Button */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleNext}
                    className="text-white w-xs h-11"
                    disabled={
                      !formData.name.trim() ||
                      !formData.categoryId ||
                      !formData.subcategoryId ||
                      !formData.description.trim() ||
                      !requiredAttributesFilled
                    }
                  >
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Product Images */}
            {currentStep === 1 && (
              <div className="max-w-8xl mx-auto space-y-6">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      Product Images <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Upload clear, high-quality images of your product from different angles.
                    </p>
                    <ImageUpload
                      onImageChange={(urls) => handleFormChange("imageUrls", urls)}
                      initialUrls={formData.imageUrls}
                      maxSize={10}
                      maxImages={8}
                      folder="products"
                      footer={true}
                    />
                    <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-2">Image Guidelines:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Upload at least 3 images</li>
                        <li>Use high-resolution images (min 1000x1000px)</li>
                        <li>Show product from different angles</li>
                        <li>Include close-ups of important details</li>
                        <li>Use natural lighting when possible</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                <div className="flex justify-between float-right mt-6">
                  <Button
                    onClick={handleNext}
                    className="text-white w-xs h-11"
                    disabled={formData.imageUrls.length === 0}
                  >
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Product Story */}
            {currentStep === 2 && (
              <div className="max-w-8xl mx-auto space-y-6">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Product Story</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Share the story behind your product. This helps customers connect with your brand.
                    </p>

                    <div className="space-y-8">
                      {/* Text Story */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Story Text</h3>
                          <span className="text-sm text-gray-500">
                            {formData.storyText.replace(/<[^>]*>/g, "").length}/500 characters
                          </span>
                        </div>
                        <TextEditor
                          value={formData.storyText}
                          onChange={(value) => handleFormChange("storyText", value)}
                          placeholder="Tell your story... (Max 500 characters)"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Share the inspiration, craftsmanship, or unique aspects of your product
                        </p>
                      </div>

                      {/* Video Story */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Story Video (Optional)</h3>
                        <VideoUpload
                          onVideoChange={(url) => handleFormChange("storyVideoUrl", url || "")}
                          initialUrl={formData.storyVideoUrl}
                          maxSize={50}
                          folder="videos/stories"
                          description="Max file size: 50MB · Max duration: 2 minutes"
                          footer={true}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Showcase your product in action or share your creative process
                        </p>
                      </div>

                      {/* Story Tips */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Story Tips
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                          <li>• Mention the materials used and their source</li>
                          <li>• Share the craftsmanship involved</li>
                          <li>• Explain what makes your product unique</li>
                          <li>• Talk about the inspiration behind the design</li>
                          <li>• Mention any cultural or traditional significance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
                <div className="flex justify-between float-right mt-6">
                  <Button
                    onClick={handleNext}
                    className="text-white w-xs h-11"
                    disabled={!formData.storyText.trim() && !formData.storyVideoUrl.trim()}
                  >
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Variants */}
            {currentStep === 3 && (
              <div className="max-w-8xl mx-auto">
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold">Product Variants</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add different sizes, colors, and prices for your product.
                      </p>
                    </div>
                    <Button onClick={() => setShowVariantDialog(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Variant
                    </Button>
                  </div>

                  {/* Variants Summary */}
                  {formData.variants.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Variants</p>
                          <p className="text-lg font-semibold">{formData.variants.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Stock</p>
                          <p className="text-lg font-semibold">{totalStock} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Price Range</p>
                          <p className="text-lg font-semibold">{priceRange}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Color Options</p>
                          <p className="text-lg font-semibold">
                            {
                              [...new Set(formData.variants.flatMap((v) => v.options.map((o) => o.color)))]
                                .length
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Variants List */}
                  {formData.variants.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        No variants added yet
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Add variants to offer different sizes and colors for your product
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          {/* Variant Header */}
                          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <h3 className="text-lg font-semibold">
                                Size:{" "}
                                <span className="text-blue-600 dark:text-blue-400">
                                  {variant.size}
                                </span>
                              </h3>
                              <span className="text-sm text-gray-500">
                                {variant.options.length} color option
                                {variant.options.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editVariant(variant)}
                                className="gap-1"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteVariant(variant.id)}
                                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                                Delete
                              </Button>
                            </div>
                          </div>

                          {/* Variant Options */}
                          <div className="px-6 py-4">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                      Color
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                      SKU
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                      Quantity
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                      Price
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                      Total Value
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {variant.options.map((option) => (
                                    <tr
                                      key={option.id}
                                      className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                                    >
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                          <div
                                            className="w-6 h-6 rounded-full border border-gray-300"
                                            style={{ backgroundColor: getColorHex(option.color) }}
                                          />
                                          <span className="font-medium">{option.color}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                          {option.sku || "N/A"}
                                        </code>
                                      </td>
                                      <td className="py-3 px-4">{option.quantity}</td>
                                      <td className="py-3 px-4 font-medium">
                                        ${parseFloat(option.price).toFixed(2)}
                                      </td>
                                      <td className="py-3 px-4 font-medium">
                                        ${(option.quantity * parseFloat(option.price)).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Variant Footer */}
                            <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Total Stock</p>
                                <p className="text-lg font-semibold">
                                  {variant.options.reduce((sum, opt) => sum + opt.quantity, 0)} units
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Low Stock Alert</p>
                                <p className="text-lg font-semibold">{variant.lowStockUnit} units</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Total Value</p>
                                <p className="text-lg font-semibold">
                                  $
                                  {variant.options
                                    .reduce(
                                      (sum, opt) => sum + opt.quantity * parseFloat(opt.price),
                                      0
                                    )
                                    .toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Navigation */}
                <div className="flex justify-between float-right mt-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowVariantDialog(true)}
                      disabled={formData.variants.length === 0}
                      className="h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Variant
                    </Button>
                    <Button onClick={handleNext} className="text-white h-11 px-8">
                      Continue to Preview
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Preview */}
            {currentStep === 4 && (
              <div className="max-w-8xl mx-auto space-y-6">
                {/* Preview Header */}
                <div className="bg-white dark:bg-[#303030] rounded-lg p-6 shadow-none">
                  <h2 className="text-2xl font-semibold mb-2">Preview & Submit</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review all information before submitting your product.
                  </p>
                </div>

                {/* Basic Information Preview */}
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Basic Information</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(0)}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Product Name</p>
                        <p className="font-medium">{formData.name || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Base Price</p>
                        <p className="font-medium">
                          {formData.basePrice
                            ? `$${parseFloat(formData.basePrice).toFixed(2)}`
                            : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Compare At Price</p>
                        <p className="font-medium">
                          {formData.baseCompareAtPrice
                            ? `$${parseFloat(formData.baseCompareAtPrice).toFixed(2)}`
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="font-medium">{selectedCategory?.name || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Subcategory</p>
                        <p className="font-medium">{selectedSubcategory?.name || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Product Type</p>
                        <p className="font-medium">{selectedProductType?.name || "Not selected"}</p>
                      </div>
                    </div>

                    {/* Attributes Preview */}
                    {attributes.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 mb-3">Attributes</p>
                        <div className="flex flex-wrap gap-2">
                          {attributes
                            .filter((attr) => attributeValues[attr.name])
                            .map((attr) => (
                              <div
                                key={attr.id}
                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm"
                              >
                                <span className="font-medium">{attr.name}:</span>{" "}
                                {attributeValues[attr.name]}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Description Preview */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 mb-3">Description</p>
                      <div
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html:
                            formData.description ||
                            "<p class='text-gray-500 italic'>No description provided</p>",
                        }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Images Preview */}
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Product Images</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                  {formData.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-4 gap-4">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {index === 0 ? "Main" : index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No images uploaded</p>
                  )}
                </Card>

                {/* Story Preview */}
                <Card className="p-6 dark:bg-[#303030] shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Product Story</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                  {formData.storyText && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-3">Story Text</p>
                      <div
                        className="prose max-w-none dark:prose-invert bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
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
                    <p className="text-gray-500 italic">No story added</p>
                  )}
                </Card>

                {/* Variants Preview */}
                {formData.variants.length > 0 && (
                  <Card className="p-6 dark:bg-[#303030] shadow-none">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Product Variants</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                        className="gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Total Variants</p>
                          <p className="text-2xl font-semibold">{formData.variants.length}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Total Stock</p>
                          <p className="text-2xl font-semibold">{totalStock} units</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Price Range</p>
                          <p className="text-2xl font-semibold">{priceRange}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {formData.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Size: {variant.size}</h4>
                              <span className="text-sm text-gray-500">
                                {variant.options.length} color option
                                {variant.options.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {variant.options.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: getColorHex(option.color) }}
                                    />
                                    <span>{option.color}</span>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <span>{option.quantity} units</span>
                                    <span className="font-medium">
                                      ${parseFloat(option.price).toFixed(2)}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      ${(option.quantity * parseFloat(option.price)).toFixed(2)} total
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Submit Section */}
                <div className="flex justify-between items-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Ready to submit your product?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Your product will be reviewed before being published.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      size="lg"
                      className="h-11 px-8"
                      disabled={isSubmitting || createLoading}
                    >
                      {isSubmitting || createLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Submit Product
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Variant Dialog */}
        <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingVariant ? "Edit Variant" : "Add New Variant"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Size Selection */}
              <div>
                <Label className="text-base mb-3 block">
                  Size <span className="text-red-500">*</span>
                </Label>

                <Select
                  value={tempVariant.size}
                  onValueChange={(size) => setTempVariant({ ...tempVariant, size })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>

                  <SelectContent>
                    {SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Options */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">
                    Color Options <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-sm text-gray-500">
                    {tempVariant.options.length} option
                    {tempVariant.options.length !== 1 ? "s" : ""} added
                  </span>
                </div>

                {/* Add Color Form */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="color" className="text-sm mb-1 block">
                        Color Name
                      </Label>
                      <Input
                        id="color"
                        placeholder="e.g. Red, Black, Blue"
                        value={tempOption.color}
                        onChange={(e) =>
                          setTempOption({ ...tempOption, color: e.target.value })
                        }
                        className="h-10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity" className="text-sm mb-1 block">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={tempOption.quantity || ""}
                        onChange={(e) =>
                          setTempOption({
                            ...tempOption,
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-sm mb-1 block">
                        Price (USD) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={tempOption.price}
                          onChange={(e) =>
                            setTempOption({ ...tempOption, price: e.target.value })
                          }
                          className="h-10 pl-7"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addOptionToVariant}
                    className="w-full"
                    disabled={
                      !tempOption.color ||
                      !tempOption.quantity ||
                      !tempOption.price ||
                      parseFloat(tempOption.price) <= 0
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Color Option
                  </Button>
                </div>

                {/* Options List */}
                {tempVariant.options.length > 0 ? (
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    {tempVariant.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                              style={{ backgroundColor: getColorHex(option.color) }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{option.color}</p>
                              <p className="text-xs text-gray-500 truncate">{option.sku}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 ml-auto">
                            <div className="text-right">
                              <p className="font-medium">
                                ${parseFloat(option.price).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">{option.quantity} units</p>
                            </div>
                            <button
                              onClick={() => removeOptionFromVariant(option.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg mt-4">
                    <p>No color options added yet</p>
                    <p className="text-sm mt-1">Add color options using the form above</p>
                  </div>
                )}
              </div>

              {/* Low Stock Alert */}
              <div>
                <Label htmlFor="low-stock" className="text-base mb-3 block">
                  Low Stock Alert
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    Get notified when stock reaches this level
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="low-stock"
                    type="number"
                    min="1"
                    value={tempVariant.lowStockUnit}
                    onChange={(e) =>
                      setTempVariant({
                        ...tempVariant,
                        lowStockUnit: parseInt(e.target.value) || 1,
                      })
                    }
                    className="h-11 pl-4 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    units
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You will receive a notification when stock for any color option reaches this
                  level
                </p>
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={closeVariantDialog}>
                Cancel
              </Button>
              <Button
                onClick={saveVariant}
                disabled={!tempVariant.size || tempVariant.options.length === 0}
                className="min-w-32"
              >
                {editingVariant ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Update Variant
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}