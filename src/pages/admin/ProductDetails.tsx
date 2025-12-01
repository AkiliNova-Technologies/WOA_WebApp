import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "@/components/ui/search";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  ListFilter,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import images from "@/assets/images";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/types/product";
import { SiteHeader } from "@/components/site-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Extended status type for the drawer
type ExtendedProductStatus =
  | "active"
  | "suspended"
  | "deactivated"
  | "deleted"
  | "draft"
  | "out-of-stock"
  | "archived";

// Function to convert extended status to ProductStatus
const convertToProductStatus = (
  status: ExtendedProductStatus
): ProductStatus => {
  switch (status) {
    case "active":
      return "active";
    case "suspended":
      return "draft"; // Map suspended to draft
    case "deactivated":
      return "archived"; // Map deactivated to archived
    case "deleted":
      return "out-of-stock"; // Map deleted to out-of-stock
    case "draft":
      return "draft";
    case "out-of-stock":
      return "out-of-stock";
    case "archived":
      return "archived";
    default:
      return "active";
  }
};

// Function to convert ProductStatus to extended status for display
const convertToExtendedStatus = (
  status: ProductStatus
): ExtendedProductStatus => {
  switch (status) {
    case "active":
      return "active";
    case "draft":
      return "suspended"; // Map draft to suspended for display
    case "archived":
      return "deactivated"; // Map archived to deactivated for display
    case "out-of-stock":
      return "deleted"; // Map out-of-stock to deleted for display
    default:
      return "active";
  }
};

// Mock data for size variants and colors
const sizeVariants = [
  {
    size: "S",
    price: 45.99,
    availableStock: 25,
    colors: [
      { color: "Red", quantity: 10 },
      { color: "Blue", quantity: 8 },
      { color: "Green", quantity: 7 },
    ],
  },
  {
    size: "M",
    price: 45.99,
    availableStock: 30,
    colors: [
      { color: "Red", quantity: 12 },
      { color: "Blue", quantity: 10 },
      { color: "Green", quantity: 8 },
    ],
  },
  {
    size: "L",
    price: 49.99,
    availableStock: 20,
    colors: [
      { color: "Red", quantity: 8 },
      { color: "Blue", quantity: 7 },
      { color: "Green", quantity: 5 },
    ],
  },
  {
    size: "XL",
    price: 52.99,
    availableStock: 15,
    colors: [
      { color: "Red", quantity: 6 },
      { color: "Blue", quantity: 5 },
      { color: "Green", quantity: 4 },
    ],
  },
];

function StatusChangeDrawer({
  isOpen,
  onClose,
  product,
  onStatusChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onStatusChange: (newStatus: ProductStatus) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<ExtendedProductStatus>(
    convertToExtendedStatus(product.status)
  );

  const statusOptions: {
    value: ExtendedProductStatus;
    label: string;
    description: string;
  }[] = [
    {
      value: "active",
      label: "Active",
      description: "Product is visible and available for purchase",
    },
    {
      value: "suspended",
      label: "Suspended",
      description: "Temporarily hide product from customers",
    },
    {
      value: "deactivated",
      label: "Deactivated",
      description: "Permanently remove product from store",
    },
    {
      value: "deleted",
      label: "Deleted",
      description: "Remove product completely from system",
    },
    {
      value: "draft",
      label: "Draft",
      description: "Product is not yet published",
    },
    {
      value: "out-of-stock",
      label: "Out of Stock",
      description: "Product is temporarily unavailable",
    },
    {
      value: "archived",
      label: "Archived",
      description: "Product is stored for future reference",
    },
  ];

  const handleSubmit = () => {
    const currentExtendedStatus = convertToExtendedStatus(product.status);
    if (selectedStatus !== currentExtendedStatus) {
      onStatusChange(convertToProductStatus(selectedStatus));
    }
    onClose();
  };

  const getStatusColor = (status: ExtendedProductStatus) => {
    const colors = {
      active: " px-3 rounded-sm",
      suspended: " px-3 rounded-sm",
      deactivated: " px-3 rounded-sm",
      deleted: " px-3 rounded-sm",
      draft: " px-3 rounded-sm",
      "out-of-stock": "px-3 rounded-sm",
      archived: " text-purple-800 border-purple-200 rounded-sm",
    };
    return colors[status] || colors.draft;
  };

  if (!isOpen) return null;

  const currentExtendedStatus = convertToExtendedStatus(product.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#303030] rounded-lg shadow-lg w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold">Edit Product Status</h2>
            <p>Update Product Information</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="flex flex-row items-center gap-3 mb-4">
            <Label className="text-sm font-medium block">Current Status</Label>
            <Badge
              variant="outline"
              className={getStatusColor(currentExtendedStatus)}
            >
              {statusOptions.find((opt) => opt.value === currentExtendedStatus)
                ?.label || currentExtendedStatus}
            </Badge>
          </div>

          {/* New Status Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select New Status
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStatus === option.value
                      ? "border-[#CC5500] bg-orange-50 dark:bg-orange-950/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedStatus === option.value
                            ? "bg-[#CC5500]"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className=" h-11 flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className=" h-11 flex-1 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white"
            disabled={selectedStatus === currentExtendedStatus}
          >
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}

// Color Table Component
function ColorQuantityTable({
  colors,
}: {
  colors: { color: string; quantity: number }[];
}) {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow className="dark:bg-[#00000040]">
          <TableHead className="w-1/2 font-semibold text-center p-4">
            Color
          </TableHead>
          <TableHead className="w-1/2 font-semibold text-center p-4">
            Quantity
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {colors.map((colorItem, index) => (
          <TableRow key={index} className="p-4">
            <TableCell className="font-medium p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {colorItem.color}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <span className="font-medium text-md">
                {colorItem.quantity} units
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Size Variant Component
function SizeVariantSection({
  variant,
}: {
  variant: (typeof sizeVariants)[0];
}) {
  return (
    <Card className="space-y-6 px-8 border-b pb-6 shadow-none">
      <h2 className="text-xl font-semibold">Size - {variant.size}</h2>
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 shadow-none border">
          <div className="space-y-4">
            <div>
              <Label className="font-semibold text-md mb-2 block">Price</Label>
              <p className="text-foreground text-lg font-semibold">
                ${variant.price}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-none border">
          <div className="space-y-4">
            <div>
              <Label className="font-semibold text-md mb-2 block">
                Available Stock
              </Label>
              <p className="text-foreground text-lg font-semibold">
                {variant.availableStock} units
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Color Table Section */}
      <div>
        <Card className="p-6 shadow-none border">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Colors Available</h3>
            <ColorQuantityTable colors={variant.colors} />
          </div>
        </Card>
      </div>
    </Card>
  );
}

export default function AdminProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProductById, updateProduct } = useProducts();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleStatusChange = (newStatus: ProductStatus) => {
    if (product) {
      updateProduct(product.id, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      // You might want to add a toast notification here
      console.log(`Product status changed to: ${newStatus}`);
    }
  };

  const product = getProductById(productId!);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate("/admin/products")}>
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  // Get display status for UI
  const getDisplayStatus = (status: ProductStatus): ExtendedProductStatus => {
    return convertToExtendedStatus(status);
  };

  const getStatusColor = (status: ProductStatus) => {
    const displayStatus = getDisplayStatus(status);
    const colors = {
      active: "rounded-sm px-4 py-1",
      suspended: "rounded-sm px-4 py-1",
      deactivated: "rounded-sm px-4 py-1",
      deleted: "rounded-sm px-4 py-1",
      draft: "rounded-sm px-4 py-1",
      "out-of-stock": "rounded-sm px-4 py-1",
      archived: "rounded-sm px-4 py-1",
    };
    return colors[displayStatus] || colors.active;
  };

  const getDotColor = (status: ProductStatus) => {
    const displayStatus = getDisplayStatus(status);
    const colors = {
      active: "bg-green-500",
      suspended: "bg-yellow-500",
      deactivated: "bg-gray-500",
      deleted: "bg-red-500",
      draft: "bg-blue-500",
      "out-of-stock": "bg-orange-500",
      archived: "bg-purple-500",
    };
    return colors[displayStatus] || colors.active;
  };

  const getStatusLabel = (status: ProductStatus): string => {
    const displayStatus = getDisplayStatus(status);
    const statusLabels = {
      active: "Active",
      suspended: "Suspended",
      deactivated: "Deactivated",
      deleted: "Deleted",
      draft: "Draft",
      "out-of-stock": "Out of Stock",
      archived: "Archived",
    };
    return statusLabels[displayStatus] || "Active";
  };

  // Mock form data for the product details
  const formData = {
    description: product.description,
    specifications: `
      • Material: ${product.specifications?.material || "Not specified"}<br/>
      • Care: ${product.specifications?.care || "Not specified"}<br/>
      • Origin: ${product.specifications?.origin || "Not specified"}<br/>
      • Production Method: ${product.productionMethod}<br/>
      • In Stock: ${product.inStock ? "Yes" : "No"}<br/>
      • Stock Quantity: ${product.stockQuantity}<br/>
      • Category: ${product.categoryId}<br/>
      • Vendor: ${product.vendor}
    `,
    productionMethod: product.productionMethod,
    country: product.specifications?.origin || "Not specified",
  };

  return (
    <div>
      <SiteHeader label="Product Management" />

      <div className="min-h-screen p-6">
        <div className="mx-auto space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between bg-white dark:bg-[#303030] p-6 rounded-md">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Back to Products Display</h1>
            </div>
            <Button
              variant={"secondary"}
              className="h-11 bg-[#CC5500] font-semibold hover:bg-[#CC5500]/90 text-white"
              onClick={() => setIsDrawerOpen(true)}
            >
              Change Product Status
            </Button>
          </div>

          {/* Status Change Drawer */}
          <StatusChangeDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            product={product}
            onStatusChange={handleStatusChange}
          />

          {/* Product Information Card */}
          <Card className="p-8 shadow-none border">
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
                    <Button variant="outline" size="icon" className="w-12 h-12">
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

                    <Button variant="outline" size="icon" className="w-12 h-12">
                      <ChevronDown className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Main Image */}
                  {product.image ? (
                    <div className="relative w-80 h-96 bg-muted rounded-lg flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="rounded-md h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="w-80 h-96 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-20 h-20 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-sm">
                          Product Image
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-2xl font-semibold">{product.name}</h3>
                    {/* Display current status badge */}
                    <Badge
                      variant="outline"
                      className={getStatusColor(product.status)}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full mr-1",
                          getDotColor(product.status)
                        )}
                      ></div>
                      {getStatusLabel(product.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Left Column */}
                    <div className="flex flex-row justify-between border p-4 rounded-lg">
                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Category
                        </Label>
                        <p className="text-muted-foreground">
                          {product.categoryId}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Sub Category
                        </Label>
                        <p className="text-muted-foreground">
                          {product.subCategoryId || "Not specified"}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Sub Category type
                        </Label>
                        <p className="text-muted-foreground">
                          {product.subCategoryTypeId || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-row justify-between border p-4 rounded-lg">
                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Available Stock
                        </Label>
                        <p className="text-muted-foreground">
                          {product.stockQuantity}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
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
            <Tabs defaultValue="product-details" className="w-full">
              <TabsList className="w-full justify-start rounded-lg p-4 min-h-16 h-auto bg-white mt-6 mb-6 dark:bg-[#303030]">
                <TabsTrigger
                  value="product-details"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Product Details
                </TabsTrigger>
                <TabsTrigger
                  value="available-stock"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Available Stock
                </TabsTrigger>
                <TabsTrigger
                  value="additional-info"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Additional Information
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="product-logs"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Product Logs
                </TabsTrigger>
              </TabsList>

              {/* Product Details Tab */}
              <TabsContent value="product-details" className="space-y-8 m-0">
                <Card className="shadow-none py-8 px-6 border">
                  <CardContent className="space-y-6">
                    {/* Description Section */}
                    <div className="">
                      <h3 className="text-xl font-semibold mb-4">
                        Description
                      </h3>
                      <Card className="p-6 shadow-none border">
                        <div
                          className="prose max-w-none text-foreground"
                          dangerouslySetInnerHTML={{
                            __html: formData.description,
                          }}
                        />
                      </Card>
                    </div>

                    {/* Product Story Section */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Product Story
                      </h3>
                      <Card className="overflow-hidden shadow-none border p-0">
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
                        <Card className="p-6 shadow-none border">
                          <div
                            className="prose max-w-none text-foreground"
                            dangerouslySetInnerHTML={{
                              __html: formData.specifications,
                            }}
                          />
                        </Card>
                        <Card className="p-6 shadow-none border">
                          <div className="space-y-4">
                            <div>
                              <Label className="font-semibold mb-2 block">
                                SKU
                              </Label>
                              <p className="text-foreground">{product.id}</p>
                            </div>
                            <div>
                              <Label className="font-semibold mb-2 block">
                                Production Method
                              </Label>
                              <p className="text-foreground capitalize">
                                {formData.productionMethod}
                              </p>
                            </div>
                            <div>
                              <Label className="font-semibold mb-2 block">
                                Country of Origin
                              </Label>
                              <p className="text-foreground">
                                {formData.country}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Available Stock Tab */}
              <TabsContent value="available-stock" className="space-y-8 m-0">
                <div className="shadow-none">
                  <div className="space-y-6">
                    {sizeVariants.map((variant, index) => (
                      <SizeVariantSection key={index} variant={variant} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Additional Info */}
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
                          <strong>Keep dry when possible</strong> – If sandals
                          get wet, air-dry them in a shaded area. Avoid direct
                          sunlight or heat sources.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span>•</span>
                        <p>
                          <strong>Clean gently</strong> – Wipe with a soft, damp
                          cloth. Avoid soaking or using harsh detergents.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span>•</span>
                        <p>
                          <strong>Condition occasionally</strong> – Use a
                          natural leather conditioner to maintain softness and
                          prevent cracking.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span>•</span>
                        <p>
                          <strong>Store thoughtfully</strong> – Keep in a cool,
                          dry place. Use a cloth bag or box to protect from dust
                          and moisture.
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
                          <strong>Check soles regularly</strong> – For long-term
                          use, inspect for wear and consider resoling if needed.
                        </p>
                      </div>
                    </Card>
                  </CardContent>
                </Card>

                <Card className="shadow-none mt-8 border-none p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    <Card className="shadow-none rounded-md px-6">
                      <div className="space-y-4">
                        <Label className="font-semibold text-xl">
                          Country of Origin
                        </Label>
                        <p>Ghana</p>
                      </div>
                    </Card>
                    <Card className="shadow-none rounded-md px-6">
                      <div className="space-y-4">
                        <Label className="font-semibold text-xl">
                          Production method
                        </Label>
                        <p>Hand made</p>
                      </div>
                    </Card>
                  </div>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="m-0">
                <Card className="shadow-none border py-8 px-6">
                  <CardContent>
                    <div className="space-y-6">
                      {/* Search and Filter */}
                      <div className="flex gap-4">
                        <Search />
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 h-11 px-8"
                        >
                          <span>Filter</span>
                          <ListFilter className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Reviews content would go here */}

                      <Card className="flex flex-col items-center justify-center py-16 shadow-none border-none">
                        <CardContent className="text-center">
                          <div className="w-md mb-6 mx-auto">
                            <div className="w-full h-full flex items-center justify-center">
                              <img
                                src={images.EmptyReviews}
                                alt="Empty Message Fallback image"
                                className=""
                              />
                            </div>
                          </div>
                          <h1 className="text-lg">No Reviews</h1>
                        </CardContent>
                      </Card>

                      {/* Pagination */}
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="outline" size="sm">
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#CC5500] text-primary-foreground"
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Product Logs Tab */}
              <TabsContent value="product-logs" className="m-0">
                <Card className="flex flex-col items-center justify-center py-16 shadow-none border-none">
                  <CardContent className="text-center">
                    <div className="w-md mb-6 mx-auto">
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={images.EmptyMessages}
                          alt="Empty Message Fallback image"
                          className=""
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
