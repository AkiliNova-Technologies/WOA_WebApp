import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ImageIcon,
  Info,
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

type FormData = {
  title: string;
  category: string;
  subCategory: string;
  subCategoryType: string;
  description: string;
  specifications: string;
  amount: string;
  quantity: string;
  lowStockCount: string;
  // Add these new fields
  country: string;
  productionMethod: string;
  sizes: string[];
  sizeInput: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  careInstructions: string;
};

const AddProductPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    subCategoryType: "",
    description: "",
    specifications: "",
    amount: "8",
    quantity: "",
    lowStockCount: "",
    // Add these new fields
    country: "",
    productionMethod: "",
    sizes: [] as string[],
    sizeInput: "", // Temporary input for size
    color1: "",
    color2: "",
    color3: "",
    color4: "",
    careInstructions: "",
  });

  // Add these helper functions
  const handleAddSize = () => {
    if (
      formData.sizeInput?.trim() &&
      !formData.sizes.includes(formData.sizeInput.trim().toUpperCase())
    ) {
      const newSize = formData.sizeInput.trim().toUpperCase();
      const newSizes = [...formData.sizes, newSize];
      setFormData((prev) => ({
        ...prev,
        sizes: newSizes,
        sizeInput: "", // Clear the input
      }));
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const newSizes = formData.sizes.filter((size) => size !== sizeToRemove);
    setFormData((prev) => ({
      ...prev,
      sizes: newSizes,
    }));
  };

  const handleProductPublish = () => {
    navigate(-1);
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCancel = () => {
    // Handle cancel logic
    console.log("Cancel clicked");
    navigate(-1);
  };

  const handleSaveAsDraft = () => {
    // Handle save as draft logic
    console.log("Save as draft clicked");
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
                className=" bg-white  hover:text-gray-900"
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
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsDraft}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
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
                      Maximum 30 characters. No HTML or emoji allowed
                    </span>
                  </div>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Input your text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    maxLength={30}
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
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger id="category" className="min-h-11">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
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
                      value={formData.subCategory}
                      onValueChange={(value) =>
                        handleInputChange("subCategory", value)
                      }
                    >
                      <SelectTrigger id="subCategory" className="min-h-11">
                        <SelectValue placeholder="Select a sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phones">Phones</SelectItem>
                        <SelectItem value="laptops">Laptops</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Product Sub Category Type Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="subCategory2"
                        className="text-sm font-medium"
                      >
                        Product Sub Category
                      </Label>
                    </div>
                    <Select
                      value={formData.subCategory}
                      onValueChange={(value) =>
                        handleInputChange("subCategory", value)
                      }
                    >
                      <SelectTrigger id="subCategory2" className="min-h-11">
                        <SelectValue placeholder="Select a sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">
                          Select a sub category
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="subCategoryType"
                        className="text-sm font-medium"
                      >
                        Product Sub Category type
                      </Label>
                    </div>
                    <Select
                      value={formData.subCategoryType}
                      onValueChange={(value) =>
                        handleInputChange("subCategoryType", value)
                      }
                    >
                      <SelectTrigger id="subCategoryType" className="min-h-11">
                        <SelectValue placeholder="Select a sub category type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="type">
                          Select a sub category type
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Label htmlFor="amount" className="text-sm font-medium">
                        Amount
                      </Label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="text"
                        value={formData.amount}
                        onChange={(e) =>
                          handleInputChange("amount", e.target.value)
                        }
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="quantity" className="text-sm font-medium">
                        Quantity
                      </Label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="quantity"
                      type="text"
                      placeholder="Value"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Low Stock Count */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="lowStockCount"
                      className="text-sm font-medium"
                    >
                      Low stock Count
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="lowStockCount"
                    type="text"
                    placeholder="Value"
                    value={formData.lowStockCount}
                    onChange={(e) =>
                      handleInputChange("lowStockCount", e.target.value)
                    }
                    className="h-11"
                  />
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

                {/* Main Image Upload */}
                <div className="mb-4">
                  <ImageUpload
                    onImageChange={(file) => {
                      console.log("Main image:", file);
                    }}
                    aspectRatio="video"
                    height="h-64"
                    maxHeight="max-h-64" // Added max height
                    maxSize={10}
                  />
                </div>

                {/* Additional Images Grid */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  {[1, 2, 3].map((index) => (
                    <ImageUpload
                      key={index}
                      onImageChange={(file) => {
                        console.log(`Additional image ${index}:`, file);
                      }}
                      aspectRatio="square"
                      height="h-48"
                      maxHeight="max-h-48" // Added max height
                      maxSize={10}
                    />
                  ))}
                </div>

                <p className="text-xs text-gray-500">
                  Recommended size: 1920×1080px · Format: JPEG or PNG · Max
                  size: 10MB
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
                  onVideoChange={(file) => {
                    console.log("Product story video:", file);
                  }}
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
                      placeholder="Add attribute values"
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
                    <div className="relative flex flex-wrap gap-2">
                      {formData.sizes.map((size) => (
                        <div className="relative">
                          <Badge
                            key={size}
                            variant="secondary"
                            className=" px-4 py-2 bg-muted text-foreground border-border rounded-md flex items-center gap-1 group"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 text-xs"
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
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Color</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="Value"
                      className="h-11"
                      value={formData.color1 || ""}
                      onChange={(e) =>
                        handleInputChange("color1", e.target.value)
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Value"
                      className="h-11"
                      value={formData.color2 || ""}
                      onChange={(e) =>
                        handleInputChange("color2", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="Value"
                      className="h-11"
                      value={formData.color3 || ""}
                      onChange={(e) =>
                        handleInputChange("color3", e.target.value)
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Value"
                      className="h-11"
                      value={formData.color4 || ""}
                      onChange={(e) =>
                        handleInputChange("color4", e.target.value)
                      }
                    />
                  </div>
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

                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-12 h-12 bg-muted rounded border border-border flex items-center justify-center"
                          >
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="icon"
                          className="w-12 h-12"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Main Image */}
                      <div className="w-80 h-96 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-20 h-20 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground text-sm">
                            Product Image
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-6">
                        <h3 className="text-2xl font-semibold">
                          African Made Sandals
                        </h3>
                        <Badge
                          variant="secondary"
                          className="px-3 py-1 bg-orange-50 text-[#CC5500] border border-orange-200"
                        >
                          • Pending
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4 border p-4 rounded-lg">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Category
                            </Label>
                            <p className="text-muted-foreground">Footwear</p>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Sub Category
                            </Label>
                            <p className="text-muted-foreground">
                              Ladies footwear
                            </p>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Sub Category type
                            </Label>
                            <p className="text-muted-foreground">Crafts</p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4 border p-4 rounded-lg">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Price
                            </Label>
                            <p className="text-muted-foreground">$ 20</p>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Available Stock
                            </Label>
                            <p className="text-muted-foreground">30</p>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground block mb-2">
                              Low Stock Unit
                            </Label>
                            <p className="text-muted-foreground">10</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="mt-8">
                <Tabs defaultValue="additional-info" className="w-full">
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
                      value="reviews"
                      className="px-6 py-3 h-16 data-[state=active]:text-foreground border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent"
                    >
                      Reviews
                    </TabsTrigger>
                    <TabsTrigger
                      value="messages"
                      className="px-6 py-3 h-16 data-[state=active]:text-foreground border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent"
                    >
                      Messages
                    </TabsTrigger>
                  </TabsList>

                  {/* Product Details Tab */}
                  <TabsContent
                    value="product-details"
                    className="space-y-8 m-0"
                  >
                    {/* Description Section */}
                    <div className="">
                      <h3 className="text-xl font-semibold mb-4">
                        Description
                      </h3>
                      <Card className="p-6 shadow-none">
                        <div
                          className="prose max-w-none text-foreground"
                          dangerouslySetInnerHTML={{
                            __html:
                              formData.description ||
                              `Whether you're navigating city streets or strolling through weekend markets, these handcrafted leather sandals offer breathable comfort and effortless style. Made by skilled African artisans using locally sourced materials, each pair reflects a deep respect for tradition and a commitment to quality.
                        
                        The minimalist design pairs beautifully with jeans, linen trousers, or vibrant kitenge prints—making them a versatile staple for sunny getaways, casual outings, or cultural celebrations. More than footwear, they're a wearable tribute to African craftsmanship and everyday elegance.`,
                          }}
                        />
                      </Card>
                    </div>

                    {/* Product Story Section */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Product Story
                      </h3>
                      <Card className="overflow-hidden">
                        <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              Product story video preview
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Specifications Section */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <Card className="p-6">
                          <div
                            className="prose max-w-none text-foreground"
                            dangerouslySetInnerHTML={{
                              __html:
                                formData.specifications ||
                                `• Handcrafted from genuine African leather<br/>
                           • Durable rubber sole (recycled or eco option available)<br/>
                           • Breathable open-toe design for all-day comfort<br/>
                           • Unisex sizing (EU 39–46 / US 6–12)<br/>
                           • Available in natural brown, black, and tan<br/>
                           • Slip-on style with optional adjustable strap<br/>
                           • Locally made by artisans in Uganda<br/>
                           • Lightweight and travel-friendly<br/>
                           • Ethically sourced and eco-conscious materials`,
                            }}
                          />
                        </Card>
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="font-semibold mb-2 block">
                                SKU
                              </Label>
                              <p className="text-foreground">
                                UG-SNDL-LTHR-BRN-42
                              </p>
                            </div>
                            <div>
                              <Label className="font-semibold mb-2 block">
                                Production Method
                              </Label>
                              <p className="text-foreground capitalize">
                                {formData.productionMethod || "Handmade"}
                              </p>
                            </div>
                            <div>
                              <Label className="font-semibold mb-2 block">
                                Country of Origin
                              </Label>
                              <p className="text-foreground">
                                {formData.country || "Uganda"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="additional-info">
                    {/* Care Instructions Card */}
                    <Card className="p-8 shadow-none border-none">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-2xl font-semibold">
                          Care Instructions
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="px-0">
                        <Card className="border-border p-6 space-y-3 shadow-none">
                          <div className="flex gap-2">
                            <span>•</span>
                            <p>
                              <strong>Keep dry when possible</strong> – If
                              sandals get wet, air-dry them in a shaded area.
                              Avoid direct sunlight or heat sources.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span>•</span>
                            <p>
                              <strong>Clean gently</strong> – Wipe with a soft,
                              damp cloth. Avoid soaking or using harsh
                              detergents.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span>•</span>
                            <p>
                              <strong>Condition occasionally</strong> – Use a
                              natural leather conditioner to maintain softness
                              and prevent cracking.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span>•</span>
                            <p>
                              <strong>Store thoughtfully</strong> – Keep in a
                              cool, dry place. Use a cloth bag or box to protect
                              from dust and moisture.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span>•</span>
                            <p>
                              <strong>Avoid prolonged sun exposure</strong> –
                              Extended sunlight can fade colors and dry out the
                              leather.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span>•</span>
                            <p>
                              <strong>Check soles regularly</strong> – For
                              long-term use, inspect for wear and consider
                              resoling if needed.
                            </p>
                          </div>
                        </Card>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Reviews Tab */}
                  <TabsContent value="reviews" className="m-0">
                    <div className="space-y-6">
                      {/* Search and Filter */}
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <Input
                            type="text"
                            placeholder="Search reviews"
                            className="pl-10"
                          />
                          <ImageIcon className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <span>Filter</span>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-6">
                        {/* Review 1 */}
                        <Card className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">Annette Black</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Apr 11 2025
                              </span>
                              <div className="flex text-yellow-400">
                                {[1, 2, 3, 4].map((i) => (
                                  <svg
                                    key={i}
                                    className="w-5 h-5 fill-current"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                  </svg>
                                ))}
                                <svg
                                  className="w-5 h-5 fill-current opacity-50"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              </div>
                              <span className="text-sm font-semibold">4.5</span>
                            </div>
                          </div>
                          <p className="text-foreground mb-4">
                            I bought these for a weekend trip and ended up
                            wearing them every day. The leather is soft but
                            sturdy, and the sole feels surprisingly durable. You
                            can tell they were made with care—every stitch is
                            clean. I love that they're locally made and support
                            Ugandan artisans. Will definitely be buying another
                            pair in a different color!
                          </p>
                          <div className="flex gap-4 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Like
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Reply
                            </Button>
                          </div>
                        </Card>

                        {/* Review 2 */}
                        <Card className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">James Doe</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Nov 11 2025
                              </span>
                              <div className="flex text-yellow-400">
                                {[1, 2, 3, 4].map((i) => (
                                  <svg
                                    key={i}
                                    className="w-5 h-5 fill-current"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                  </svg>
                                ))}
                                <svg className="w-5 h-5" viewBox="0 0 20 20">
                                  <path
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm font-semibold">4</span>
                            </div>
                          </div>
                          <p className="text-foreground mb-4">
                            These sandals are perfect for casual wear. I paired
                            them with my kitenge trousers and got so many
                            compliments. They're breathable and easy to slip on,
                            and the fit was just right. I appreciate the
                            eco-conscious materials too. Only wish they came in
                            more vibrant colors!
                          </p>
                          <div className="flex gap-4 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Like
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Reply
                            </Button>
                          </div>
                        </Card>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="outline" size="sm">
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-primary text-primary-foreground"
                        >
                          1
                        </Button>
                        <Button variant="outline" size="sm">
                          2
                        </Button>
                        <Button variant="outline" size="sm">
                          3
                        </Button>
                        <span className="px-2 text-muted-foreground">...</span>
                        <Button variant="outline" size="sm">
                          10
                        </Button>
                        <Button variant="outline" size="sm">
                          Next
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Messages Tab */}
                  <TabsContent value="messages" className="m-0">
                    <Card className="flex flex-col items-center justify-center py-16">
                      <CardContent className="text-center">
                        <div className="w-48 h-48 mb-6 mx-auto">
                          <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-muted-foreground" />
                          </div>
                        </div>
                        <p className="text-xl font-medium text-foreground mb-2">
                          No Messages
                        </p>
                        <p className="text-muted-foreground">
                          You don't have any messages yet. They will appear here
                          when customers contact you.
                        </p>
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
                  className="px-8 py-3 h-12 w-xs"
                >
                  Back
                </Button>
                <Button
                  className="px-8 py-3 h-12 bg-[#CC5500] hover:bg-[#B34D00] w-xs"
                  onClick={handleProductPublish}
                >
                  Publish product
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddProductPage;
