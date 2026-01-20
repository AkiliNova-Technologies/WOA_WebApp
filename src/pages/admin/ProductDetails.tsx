import { useParams, useNavigate } from "react-router-dom";
import { useReduxProducts } from "@/hooks/useReduxProducts";
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
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import type { Product as ReduxProduct } from "@/redux/slices/productsSlice";
import { SiteHeader } from "@/components/site-header";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
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

// Helper to map Redux status to extended status
const mapReduxStatusToExtendedStatus = (status: ReduxProduct["status"]): ExtendedProductStatus => {
  switch (status) {
    case "published":
    case "approved":
      return "active";
    case "draft":
    case "pending_approval":
      return "draft";
    case "RE_EVALUATION":
      return "draft";
    case "rejected":
      return "suspended";
    case "archived":
      return "deactivated";
    default:
      return "active";
  }
};

// Helper to map extended status to Redux status
const mapExtendedStatusToReduxStatus = (status: ExtendedProductStatus): ReduxProduct['status'] => {
  switch (status) {
    case "active": return "published";
    case "suspended": return "draft";
    case "deactivated": return "archived";
    case "deleted": return "archived";
    case "draft": return "draft";
    case "out-of-stock": return "published"; 
    case "archived": return "archived";
    default: return "published";
  }
};

function StatusChangeDrawer({
  isOpen,
  onClose,
  product,
  onStatusChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ReduxProduct | null;
  onStatusChange: (newStatus: ReduxProduct['status']) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<ExtendedProductStatus>(
    product ? mapReduxStatusToExtendedStatus(product.status) : "active"
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
    if (product) {
      const currentExtendedStatus = mapReduxStatusToExtendedStatus(product.status);
      if (selectedStatus !== currentExtendedStatus) {
        onStatusChange(mapExtendedStatusToReduxStatus(selectedStatus));
      }
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

  if (!isOpen || !product) return null;

  const currentExtendedStatus = mapReduxStatusToExtendedStatus(product.status);

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
// function ColorQuantityTable({
//   colors,
// }: {
//   colors: { color: string; quantity: number }[];
// }) {
//   return (
//     <Table className="border">
//       <TableHeader>
//         <TableRow className="dark:bg-[#00000040]">
//           <TableHead className="w-1/2 font-semibold text-center p-4">
//             Color
//           </TableHead>
//           <TableHead className="w-1/2 font-semibold text-center p-4">
//             Quantity
//           </TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {colors.map((colorItem, index) => (
//           <TableRow key={index} className="p-4">
//             <TableCell className="font-medium p-4 text-center">
//               <div className="flex items-center justify-center gap-2">
//                 {colorItem.color}
//               </div>
//             </TableCell>
//             <TableCell className="text-center">
//               <span className="font-medium text-md">
//                 {colorItem.quantity} units
//               </span>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );
// }

// ✅ Size Variant Component - Now uses actual product variants
function SizeVariantSection({
  variant,
}: {
  variant: ReduxProduct["variants"][0];
}) {
  return (
    <Card className="space-y-6 px-8 border-b pb-6 shadow-none">
      <h2 className="text-xl font-semibold">
        Variant - {variant.name || variant.sku}
      </h2>
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 shadow-none border">
          <div className="space-y-4">
            <div>
              <Label className="font-semibold text-md mb-2 block">Price</Label>
              <p className="text-foreground text-lg font-semibold">
                ${variant.price?.toFixed(2) || "0.00"}
              </p>
              {variant.compareAtPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  Was: ${variant.compareAtPrice.toFixed(2)}
                </p>
              )}
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
                {variant.stockQuantity} units
              </p>
              <p className="text-sm text-muted-foreground">
                SKU: {variant.sku}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attributes Display */}
      {variant.attributes && Object.keys(variant.attributes).length > 0 && (
        <div>
          <Card className="p-6 shadow-none border">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variant Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(variant.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium capitalize">{key}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}

export default function AdminProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { 
    product, 
    loading, 
    error,
    getPublicProduct, // ✅ Changed from getProduct
    updateExistingProduct 
  } = useReduxProducts();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch product details when component mounts or productId changes
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      getPublicProduct(productId) // ✅ Use getPublicProduct
        .finally(() => setIsLoading(false));
    }
  }, [productId, getPublicProduct]);

  const handleStatusChange = async (newStatus: ReduxProduct['status']) => {
    if (product && productId) {
      try {
        const updateData = {
          status: newStatus,
        } as any;
        
        await updateExistingProduct(productId, updateData);
        console.log(`Product status changed to: ${newStatus}`);
      } catch (error) {
        console.error('Failed to update product status:', error);
      }
    }
  };

  // ✅ Helper to get primary image - FIXED
  const getPrimaryImage = () => {
    if (!product?.images || product.images.length === 0) return "";
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.url || product.images[0]?.url || product.image || "";
  };

  // ✅ Helper to get category name - FIXED
  const getCategoryName = () => {
    return product?.category?.name || "Uncategorized";
  };

  // ✅ Helper to get subcategory name - FIXED
  const getSubcategoryName = () => {
    return product?.subcategory?.name || "Not specified";
  };

  // ✅ Helper to get vendor name - FIXED
  const getVendorName = () => {
    return product?.vendorName || product?.sellerName || "Unknown Vendor";
  };

  // ✅ Helper to get total stock from variants - FIXED
  const getTotalStock = () => {
    if (!product?.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  };

  // ✅ Helper to get first variant SKU - FIXED
  const getFirstVariantSKU = () => {
    if (!product?.variants || product.variants.length === 0) return "N/A";
    return product.variants[0]?.sku || "N/A";
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-4">Error Loading Product</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => navigate("/admin/products")}>
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/admin/products")}>
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  // Get display status for UI
  const getDisplayStatus = (): ExtendedProductStatus => {
    return mapReduxStatusToExtendedStatus(product.status);
  };

  const getStatusColor = () => {
    const displayStatus = getDisplayStatus();
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

  const getDotColor = () => {
    const displayStatus = getDisplayStatus();
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

  const getStatusLabel = (): string => {
    const displayStatus = getDisplayStatus();
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

  // ✅ Prepare form data from product - FIXED
  const totalStock = getTotalStock();
  const firstVariantSKU = getFirstVariantSKU();
  
  const formData = {
    description: product.description || "No description available",
    specifications: `
      • Material: ${product.attributes?.material || "Not specified"}<br/>
      • SKU: ${firstVariantSKU}<br/>
      • Total Stock: ${totalStock} units<br/>
      • Category: ${getCategoryName()}<br/>
      • Vendor: ${getVendorName()}<br/>
      • Created: ${new Date(product.createdAt).toLocaleDateString()}<br/>
      • Updated: ${new Date(product.updatedAt).toLocaleDateString()}
    `,
    productionMethod: product.attributes?.productionMethod || "Not specified",
    country: product.attributes?.countryOfOrigin || "Not specified",
  };

  const primaryImage = getPrimaryImage();

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

          {/* Product Information Card - UPDATED LAYOUT */}
          <Card className="p-8 shadow-none border">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl font-semibold mb-6">
                Product Information
              </CardTitle>
            </CardHeader>

            <CardContent className="px-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image Gallery */}
                <div className="flex gap-4">
                  {/* Thumbnail Navigation */}
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" size="icon" className="w-12 h-12 rounded-full">
                      <ChevronUp className="w-5 h-5" />
                    </Button>

                    {product.images && product.images.slice(0, 4).map((img, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 bg-muted rounded border-2 border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#CC5500] transition-colors"
                      >
                        {img.url ? (
                          <img 
                            src={img.url} 
                            alt={`Product thumbnail ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    ))}

                    <Button variant="outline" size="icon" className="w-12 h-12 rounded-full">
                      <ChevronDown className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Main Image */}
                  {primaryImage ? (
                    <div className="relative flex-1 aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="rounded-md h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-20 h-20 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-sm">
                          Product Image
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Product Details */}
                <div className="flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-semibold flex-1">{product.name}</h3>
                    {/* Display current status badge */}
                    <Badge
                      variant="outline"
                      className={getStatusColor()}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full mr-1",
                          getDotColor()
                        )}
                      ></div>
                      {getStatusLabel()}
                    </Badge>
                  </div>

                  {/* ✅ SKU and Stock Info - FIXED */}
                  <div className="mb-4 text-sm text-muted-foreground">
                    <p>SKU: {firstVariantSKU}</p>
                    <p className="mt-1">
                      <span className="font-medium text-foreground">Stock:</span>{" "}
                      {totalStock > 0 ? (
                        <span className="text-green-600">In Stock ({totalStock} units)</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </p>
                  </div>

                  {/* ✅ Price - FIXED */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <>
                          <span className="text-xl text-muted-foreground line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                          <Badge variant="destructive" className="ml-2">
                            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Category Information - Compact */}
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="text-sm font-medium">{getCategoryName()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sub Category:</span>
                      <span className="text-sm font-medium">{getSubcategoryName()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Vendor:</span>
                      <span className="text-sm font-medium">{getVendorName()}</span>
                    </div>
                  </div>

                  {/* Additional Product Info */}
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Product Type: </span>
                      <span className="text-muted-foreground">
                        {product.productType?.name || product.productTypeId || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Available Units: </span>
                      <span className="text-muted-foreground">
                        {totalStock} units
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Variants: </span>
                      <span className="text-muted-foreground">
                        {product.variants?.length || 0} variant(s)
                      </span>
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
                        <div className="prose max-w-none text-foreground">
                          {formData.description}
                        </div>
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
                              <p className="text-foreground">{firstVariantSKU}</p>
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

              {/* ✅ Available Stock Tab - Now uses real variants */}
              <TabsContent value="available-stock" className="space-y-8 m-0">
                <div className="shadow-none">
                  <div className="space-y-6">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.map((variant, index) => (
                        <SizeVariantSection key={variant.id || index} variant={variant} />
                      ))
                    ) : (
                      <Card className="p-8 text-center">
                        <p className="text-muted-foreground">No variants available</p>
                      </Card>
                    )}
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
                        <p>{formData.country}</p>
                      </div>
                    </Card>
                    <Card className="shadow-none rounded-md px-6">
                      <div className="space-y-4">
                        <Label className="font-semibold text-xl">
                          Production method
                        </Label>
                        <p>{formData.productionMethod}</p>
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
                          <p className="text-muted-foreground mt-2">
                            Average Rating: {product.averageRating?.toFixed(1)} ★ ({product.reviewCount} reviews)
                          </p>
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