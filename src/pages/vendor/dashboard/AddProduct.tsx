import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ImageIcon,
  Info,
  Loader2,
  X,
} from "lucide-react";
import Steps from "@/components/steps";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextEditor } from "@/components/text-editor";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountrySelect } from "@/components/country-select";
import { useNavigate } from "react-router-dom";
import { ImageUpload } from "@/components/image-upload";
import { VideoUpload } from "@/components/video-upload";
import { useReduxCategories } from "@/hooks/useReduxCategories";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { toast } from "sonner";

type FormData = {
  title: string;
  categoryId: string;
  subcategoryId: string;
  productTypeId: string;
  description: string;
  specifications: string;
  basePrice: string;
  baseCompareAtPrice: string;
  quantity: string;
  lowStockCount: string;
  country: string;
  productionMethod: string;
  sizes: string[];
  sizeInput: string;
  colors: string[];
  colorInput: string;
  careInstructions: string;
  // Media
  productImages: string[];
  productVideo: string;
};

const AddProductPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redux hooks
  const {
    categories,
    subcategories,
    productTypes,
    loading: categoriesLoading,
    getCategories,
    getSubcategoriesByCategory,
    getProductTypesBySubcategory,
  } = useReduxCategories();

  const {
    createNewProduct,
    createLoading,
    createError,
  } = useReduxProducts();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    categoryId: "",
    subcategoryId: "",
    productTypeId: "",
    description: "",
    specifications: "",
    basePrice: "",
    baseCompareAtPrice: "",
    quantity: "",
    lowStockCount: "",
    country: "",
    productionMethod: "",
    sizes: [],
    sizeInput: "",
    colors: [],
    colorInput: "",
    careInstructions: "",
    productImages: [],
    productVideo: "",
  });

  // Fetch categories on mount
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      getSubcategoriesByCategory(formData.categoryId);
      // Reset subcategory and product type when category changes
      setFormData(prev => ({
        ...prev,
        subcategoryId: "",
        productTypeId: "",
      }));
    }
  }, [formData.categoryId, getSubcategoriesByCategory]);

  // Fetch product types when subcategory changes
  useEffect(() => {
    if (formData.subcategoryId) {
      getProductTypesBySubcategory(formData.subcategoryId);
      // Reset product type when subcategory changes
      setFormData(prev => ({
        ...prev,
        productTypeId: "",
      }));
    }
  }, [formData.subcategoryId, getProductTypesBySubcategory]);

  // Filter subcategories for selected category
  const filteredSubcategories = useMemo(() => {
    if (!formData.categoryId) return [];
    return subcategories.filter(sub => sub.categoryId === formData.categoryId);
  }, [subcategories, formData.categoryId]);

  // Filter product types for selected subcategory
  const filteredProductTypes = useMemo(() => {
    if (!formData.subcategoryId) return [];
    return productTypes.filter(pt => pt.subcategoryId === formData.subcategoryId);
  }, [productTypes, formData.subcategoryId]);

  // Get selected names for preview
  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === formData.categoryId),
    [categories, formData.categoryId]
  );

  const selectedSubcategory = useMemo(() => 
    subcategories.find(s => s.id === formData.subcategoryId),
    [subcategories, formData.subcategoryId]
  );

  const selectedProductType = useMemo(() => 
    productTypes.find(pt => pt.id === formData.productTypeId),
    [productTypes, formData.productTypeId]
  );

  // Handle adding size
  const handleAddSize = () => {
    if (
      formData.sizeInput?.trim() &&
      !formData.sizes.includes(formData.sizeInput.trim().toUpperCase())
    ) {
      const newSize = formData.sizeInput.trim().toUpperCase();
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, newSize],
        sizeInput: "",
      }));
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
    }));
  };

  // Handle adding color
  const handleAddColor = () => {
    if (
      formData.colorInput?.trim() &&
      !formData.colors.includes(formData.colorInput.trim())
    ) {
      const newColor = formData.colorInput.trim();
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
        colorInput: "",
      }));
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  // Handle image upload
  const handleProductImagesChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      productImages: urls,
    }));
  };

  // Handle video upload
  const handleProductVideoChange = (url: string | null) => {
    setFormData(prev => ({
      ...prev,
      productVideo: url || "",
    }));
  };

  // Handle product creation
  const handleProductPublish = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Please enter a product title");
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
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build attributes object from form data
      const attributes: Record<string, string> = {};
      
      // Add sizes as comma-separated string if present
      if (formData.sizes.length > 0) {
        attributes.size = formData.sizes.join(",");
      }
      
      // Add colors as comma-separated string if present
      if (formData.colors.length > 0) {
        attributes.color = formData.colors.join(",");
      }
      
      // Add other attributes
      if (formData.country) {
        attributes.countryOfOrigin = formData.country;
      }
      if (formData.productionMethod) {
        attributes.productionMethod = formData.productionMethod;
      }
      if (formData.careInstructions) {
        attributes.careInstructions = formData.careInstructions;
      }
      if (formData.specifications) {
        attributes.specifications = formData.specifications;
      }

      // Create product payload matching API expectations
      const productData = {
        name: formData.title.trim(),
        description: formData.description || undefined,
        basePrice: parseFloat(formData.basePrice),
        baseCompareAtPrice: formData.baseCompareAtPrice 
          ? parseFloat(formData.baseCompareAtPrice) 
          : undefined,
        attributes,
        images: formData.productImages.length > 0 ? formData.productImages : undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        productTypeId: formData.productTypeId,
      };

      await createNewProduct(productData);
      
      toast.success("Product created successfully!");
      
      // Navigate to products list or product detail
      navigate("/vendor/products");
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(error?.message || "Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save as draft
  const handleSaveAsDraft = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter at least a product title to save as draft");
      return;
    }

    setIsSubmitting(true);

    try {
      const attributes: Record<string, string> = {};
      
      if (formData.sizes.length > 0) {
        attributes.size = formData.sizes.join(",");
      }
      if (formData.colors.length > 0) {
        attributes.color = formData.colors.join(",");
      }

      const productData = {
        name: formData.title.trim(),
        description: formData.description || undefined,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : 0,
        baseCompareAtPrice: formData.baseCompareAtPrice 
          ? parseFloat(formData.baseCompareAtPrice) 
          : undefined,
        attributes,
        images: formData.productImages.length > 0 ? formData.productImages : undefined,
        categoryId: formData.categoryId || undefined,
        subcategoryId: formData.subcategoryId || undefined,
        productTypeId: formData.productTypeId || undefined,
      };

      // Note: You might need a separate "save as draft" endpoint
      // For now, we'll use the same create endpoint
      await createNewProduct(productData as any);
      
      toast.success("Product saved as draft!");
      navigate("/vendor/products");
    } catch (error: any) {
      console.error("Failed to save draft:", error);
      toast.error(error?.message || "Failed to save draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "Name and description" },
    { title: "Product upload" },
    { title: "Additional details" },
    { title: "Product preview" },
  ];

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      if (!formData.title.trim()) {
        toast.error("Please enter a product title");
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
      if (!formData.basePrice) {
        toast.error("Please enter a price");
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <SiteHeader />

      <div className="min-h-screen">
        {/* Header */}
        <div className="">
          <div className="mx-auto px-10 py-4 flex items-center justify-between">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={"secondary"}
                className="bg-white hover:text-gray-900"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="font-medium text-gray-700">
                Back to Products display
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsDraft}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save as draft
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto px-10 py-8">
          {/* Steps Component */}
          <div className="mb-12 bg-white py-8 rounded-lg">
            <Steps
              current={currentStep}
              items={steps}
              onChange={setCurrentStep}
            />
          </div>

          {/* Form Content */}
          {currentStep === 0 && (
            <Card className="p-8 shadow-none border-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-semibold">
                  Name & description
                </CardTitle>
              </CardHeader>

              <CardContent className="px-0 space-y-6">
                {/* Product Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Product title
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Maximum 100 characters. No HTML or emoji allowed
                    </span>
                  </div>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter product title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    maxLength={100}
                    className="h-11"
                  />
                </div>

                {/* Product Category Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="category" className="text-sm font-medium">
                        Product Category
                      </Label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        handleInputChange("categoryId", value)
                      }
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger id="category" className="min-h-11">
                        <SelectValue placeholder={
                          categoriesLoading ? "Loading categories..." : "Select a category"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="subCategory"
                        className="text-sm font-medium"
                      >
                        Product Sub Category
                      </Label>
                    </div>
                    <Select
                      value={formData.subcategoryId}
                      onValueChange={(value) =>
                        handleInputChange("subcategoryId", value)
                      }
                      disabled={!formData.categoryId || categoriesLoading}
                    >
                      <SelectTrigger id="subCategory" className="min-h-11">
                        <SelectValue placeholder={
                          !formData.categoryId 
                            ? "Select a category first" 
                            : "Select a sub category"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Product Type Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="productType"
                        className="text-sm font-medium"
                      >
                        Product Type
                      </Label>
                    </div>
                    <Select
                      value={formData.productTypeId}
                      onValueChange={(value) =>
                        handleInputChange("productTypeId", value)
                      }
                      disabled={!formData.subcategoryId || categoriesLoading}
                    >
                      <SelectTrigger id="productType" className="min-h-11">
                        <SelectValue placeholder={
                          !formData.subcategoryId 
                            ? "Select a subcategory first" 
                            : "Select a product type"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProductTypes.map((productType) => (
                          <SelectItem key={productType.id} value={productType.id}>
                            {productType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {/* Empty column for alignment or add another field */}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <TextEditor
                    value={formData.description}
                    onChange={(value) =>
                      handleInputChange("description", value)
                    }
                    placeholder="Enter product description..."
                    className="min-h-[200px]"
                  />
                </div>

                {/* Product Specifications */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="specifications"
                      className="text-sm font-medium"
                    >
                      Product Specifications
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <TextEditor
                    value={formData.specifications}
                    onChange={(value) =>
                      handleInputChange("specifications", value)
                    }
                    placeholder="Enter product specifications..."
                    className="min-h-[200px]"
                  />
                </div>

                {/* Price Section */}
                <CardHeader className="px-0 pt-6">
                  <CardTitle className="text-2xl font-semibold">
                    Price
                  </CardTitle>
                </CardHeader>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="basePrice" className="text-sm font-medium">
                        Base Price
                      </Label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.basePrice}
                        onChange={(e) =>
                          handleInputChange("basePrice", e.target.value)
                        }
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="baseCompareAtPrice" className="text-sm font-medium">
                        Compare at Price (Optional)
                      </Label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="baseCompareAtPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.baseCompareAtPrice}
                        onChange={(e) =>
                          handleInputChange("baseCompareAtPrice", e.target.value)
                        }
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="quantity" className="text-sm font-medium">
                        Initial Quantity
                      </Label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="lowStockCount"
                        className="text-sm font-medium"
                      >
                        Low Stock Alert
                      </Label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="lowStockCount"
                      type="number"
                      min="0"
                      placeholder="Alert when stock is below"
                      value={formData.lowStockCount}
                      onChange={(e) =>
                        handleInputChange("lowStockCount", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>

              {/* Next Button */}
              <CardFooter className="px-0 pb-0 justify-end">
                <Button
                  onClick={handleNext}
                  className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12"
                >
                  Next
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Product Upload */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-8">Product Images</h2>

              {/* Product Images Section */}
              <div className="mb-8">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Product images
                  </label>
                  <Info className="w-4 h-4 ml-2 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload clear photos that highlight the front, back, sides, and
                  any important details. This helps buyers feel confident and
                  reduces returns.
                </p>

                {/* Image Upload Component */}
                <ImageUpload
                  onImageChange={handleProductImagesChange}
                  maxSize={10}
                  maxImages={5}
                  initialUrls={formData.productImages}
                  folder="products"
                />

                <p className="text-xs text-gray-500 mt-3">
                  Recommended size: 1920×1080px · Format: JPEG or PNG · Max
                  size: 10MB · Max 5 images
                </p>
              </div>

              {/* Share Your Product Story Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Share Your Product Story
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  We'd love to hear your story. Record a short video introducing
                  yourself and your business—this helps buyers connect with the
                  real person behind the products.
                </p>

                <VideoUpload
                  onVideoChange={handleProductVideoChange}
                  maxSize={60}
                  className="mb-3"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-8 py-3 border bg-white border-gray-300 rounded-lg text-[#303030] hover:bg-gray-50 w-xs h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="px-8 py-3 bg-[#CC5500] text-white rounded-lg hover:bg-[#B34D00] w-xs h-12"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {currentStep === 2 && (
            <Card className="p-8 shadow-none border-none">
              <CardContent className="px-0 space-y-6">
                {/* Country of Origin */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country of Origin
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CountrySelect
                    value={formData.country}
                    onValueChange={(value) =>
                      handleInputChange("country", value)
                    }
                  />
                </div>

                {/* Production Method */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="production-method"
                      className="text-sm font-medium"
                    >
                      Production method
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={formData.productionMethod}
                    onValueChange={(value) =>
                      handleInputChange("productionMethod", value)
                    }
                  >
                    <SelectTrigger id="production-method" className="min-h-11">
                      <SelectValue placeholder="Select the production method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="handmade">Handmade</SelectItem>
                      <SelectItem value="machine">Machine Made</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Size</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add size (e.g., S, M, L, XL, 42)"
                      className="flex-1 h-11"
                      value={formData.sizeInput || ""}
                      onChange={(e) =>
                        handleInputChange("sizeInput", e.target.value)
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSize();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddSize}
                      disabled={!formData.sizeInput?.trim()}
                      className="bg-[#CC5500] hover:bg-[#B34D00] h-11 px-8"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Display added sizes */}
                  {formData.sizes && formData.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.sizes.map((size) => (
                        <div key={size} className="relative group">
                          <Badge
                            variant="secondary"
                            className="px-4 py-2 bg-muted text-foreground border-border rounded-md flex items-center gap-1"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add color (e.g., Red, Blue, Natural Brown)"
                      className="flex-1 h-11"
                      value={formData.colorInput || ""}
                      onChange={(e) =>
                        handleInputChange("colorInput", e.target.value)
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddColor();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddColor}
                      disabled={!formData.colorInput?.trim()}
                      className="bg-[#CC5500] hover:bg-[#B34D00] h-11 px-8"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Display added colors */}
                  {formData.colors && formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map((color) => (
                        <div key={color} className="relative group">
                          <Badge
                            variant="secondary"
                            className="px-4 py-2 bg-muted text-foreground border-border rounded-md flex items-center gap-1"
                          >
                            {color}
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(color)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Information Section */}
                <CardHeader className="px-0 pt-6">
                  <CardTitle className="text-2xl font-semibold">
                    Additional Information
                  </CardTitle>
                </CardHeader>

                {/* Care Instructions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="care-instructions"
                      className="text-sm font-medium"
                    >
                      Care Instructions
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <TextEditor
                    value={formData.careInstructions || ""}
                    onChange={(value) =>
                      handleInputChange("careInstructions", value)
                    }
                    placeholder="Enter care instructions..."
                    className="min-h-[150px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-8 py-3 w-xs h-12"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Product Preview */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Product Information Card */}
              <Card className="p-8 shadow-none border-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-semibold mb-6">
                    Product Information
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-0">
                  <div className="flex gap-8">
                    {/* Image Gallery */}
                    <div className="flex gap-4">
                      {/* Thumbnail Navigation */}
                      <div className="flex flex-col gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-12 h-12"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </Button>

                        {formData.productImages.length > 0 ? (
                          formData.productImages.slice(0, 4).map((url, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 bg-muted rounded border border-border overflow-hidden"
                            >
                              <img
                                src={url}
                                alt={`Thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))
                        ) : (
                          [1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-12 h-12 bg-muted rounded border border-border flex items-center justify-center"
                            >
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          ))
                        )}

                        <Button
                          variant="outline"
                          size="icon"
                          className="w-12 h-12"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Main Image */}
                      <div className="w-80 h-96 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {formData.productImages.length > 0 ? (
                          <img
                            src={formData.productImages[0]}
                            alt="Main product"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-20 h-20 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground text-sm">
                              No images uploaded
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-6">
                        <h3 className="text-2xl font-semibold">
                          {formData.title || "Product Title"}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="px-3 py-1 bg-orange-50 text-[#CC5500] border border-orange-200"
                        >
                          • Draft
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4 border p-4 rounded-lg">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Category
                            </Label>
                            <p className="text-foreground">
                              {selectedCategory?.name || "Not selected"}
                            </p>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Sub Category
                            </Label>
                            <p className="text-foreground">
                              {selectedSubcategory?.name || "Not selected"}
                            </p>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Product Type
                            </Label>
                            <p className="text-foreground">
                              {selectedProductType?.name || "Not selected"}
                            </p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4 border p-4 rounded-lg">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Price
                            </Label>
                            <p className="text-foreground">
                              ${formData.basePrice || "0.00"}
                              {formData.baseCompareAtPrice && (
                                <span className="ml-2 line-through text-muted-foreground">
                                  ${formData.baseCompareAtPrice}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Initial Stock
                            </Label>
                            <p className="text-foreground">
                              {formData.quantity || "Not set"}
                            </p>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Low Stock Alert
                            </Label>
                            <p className="text-foreground">
                              {formData.lowStockCount || "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="mt-8">
                <Tabs defaultValue="product-details" className="w-full">
                  <TabsList className="w-full justify-start rounded-lg p-4 min-h-16 h-auto bg-white mt-6 mb-6">
                    <TabsTrigger
                      value="product-details"
                      className="px-6 py-3 h-16 data-[state=active]:text-foreground border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent"
                    >
                      Product Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="additional-info"
                      className="px-6 py-3 h-16 data-[state=active]:text-foreground border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent"
                    >
                      Additional Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="attributes"
                      className="px-6 py-3 h-16 data-[state=active]:text-foreground border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent"
                    >
                      Attributes
                    </TabsTrigger>
                  </TabsList>

                  {/* Product Details Tab */}
                  <TabsContent value="product-details" className="space-y-8 m-0">
                    <Card className="shadow-none py-8 px-6 border-none">
                      <CardContent className="space-y-6">
                        {/* Description Section */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">
                            Description
                          </h3>
                          <Card className="p-6 shadow-none">
                            <div
                              className="prose max-w-none text-foreground"
                              dangerouslySetInnerHTML={{
                                __html: formData.description || "No description provided.",
                              }}
                            />
                          </Card>
                        </div>

                        {/* Product Story Section */}
                        {formData.productVideo && (
                          <div>
                            <h3 className="text-xl font-semibold mb-4">
                              Product Story
                            </h3>
                            <Card className="overflow-hidden shadow-none p-0">
                              <video
                                src={formData.productVideo}
                                controls
                                className="w-full h-64 object-contain bg-black"
                              />
                            </Card>
                          </div>
                        )}

                        {/* Specifications Section */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">
                            Specifications
                          </h3>
                          <div className="grid grid-cols-2 gap-6">
                            <Card className="p-6 shadow-none">
                              <div
                                className="prose max-w-none text-foreground"
                                dangerouslySetInnerHTML={{
                                  __html: formData.specifications || "No specifications provided.",
                                }}
                              />
                            </Card>
                            <Card className="p-6 shadow-none">
                              <div className="space-y-4">
                                <div>
                                  <Label className="font-semibold mb-2 block">
                                    Production Method
                                  </Label>
                                  <p className="text-foreground capitalize">
                                    {formData.productionMethod || "Not specified"}
                                  </p>
                                </div>
                                <div>
                                  <Label className="font-semibold mb-2 block">
                                    Country of Origin
                                  </Label>
                                  <p className="text-foreground">
                                    {formData.country || "Not specified"}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Additional Info Tab */}
                  <TabsContent value="additional-info">
                    <Card className="p-8 shadow-none border-none">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-2xl font-semibold">
                          Care Instructions
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="px-0">
                        <Card className="border-border p-6 shadow-none">
                          {formData.careInstructions ? (
                            <div
                              className="prose max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: formData.careInstructions,
                              }}
                            />
                          ) : (
                            <p className="text-muted-foreground">
                              No care instructions provided.
                            </p>
                          )}
                        </Card>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Attributes Tab */}
                  <TabsContent value="attributes">
                    <Card className="p-8 shadow-none border-none">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-2xl font-semibold">
                          Product Attributes
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="px-0 space-y-6">
                        {/* Sizes */}
                        <div>
                          <Label className="font-semibold mb-3 block">
                            Available Sizes
                          </Label>
                          {formData.sizes.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {formData.sizes.map((size) => (
                                <Badge
                                  key={size}
                                  variant="secondary"
                                  className="px-4 py-2"
                                >
                                  {size}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No sizes specified</p>
                          )}
                        </div>

                        {/* Colors */}
                        <div>
                          <Label className="font-semibold mb-3 block">
                            Available Colors
                          </Label>
                          {formData.colors.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {formData.colors.map((color) => (
                                <Badge
                                  key={color}
                                  variant="secondary"
                                  className="px-4 py-2"
                                >
                                  {color}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No colors specified</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isSubmitting}
                  className="px-8 py-3 h-12 w-xs"
                >
                  Back
                </Button>
                <Button
                  className="px-8 py-3 h-12 bg-[#CC5500] hover:bg-[#B34D00] w-xs flex items-center gap-2"
                  onClick={handleProductPublish}
                  disabled={isSubmitting || createLoading}
                >
                  {(isSubmitting || createLoading) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Publish product
                </Button>
              </div>

              {createError && (
                <p className="text-red-500 text-center mt-4">{createError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddProductPage;