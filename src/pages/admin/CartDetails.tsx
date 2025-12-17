import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Search } from "@/components/ui/search";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImageIcon,
  ListFilter,
  // ListFilter,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
// import images from "@/assets/images";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ProductStatus, Vendor } from "@/types/product";
import { SiteHeader } from "@/components/site-header";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { Search } from "@/components/ui/search";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { PieDonutChartComponent } from "@/components/charts/pie-chart";
import type { ChartConfig } from "@/components/ui/chart";
// import { BarChartComponent } from "@/components/charts/bar-chart";

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

// Add this somewhere to test

// Mock buyers data
const mockBuyers = [
  {
    id: "1",
    name: "Kwame Mensah",
    email: "kwame.mensah@email.com",
    productSaved: "Colorful Bolga Shirt",
    quantitySaved: 1,
    stockCount: 50,
    addedOn: "2024-03-01T10:30:00.000Z",
    daysOnWishlist: 5,
    firstPurchase: "Yes",
    revenue: 350,
  },
  {
    id: "2",
    name: "Amina Okafor",
    email: "amina.okafor@email.com",
    productSaved: "Traditional Ankara Dress",
    quantitySaved: 2,
    stockCount: 30,
    addedOn: "2024-02-28T14:15:00.000Z",
    daysOnWishlist: 7,
    firstPurchase: "No",
    revenue: 450,
  },
  {
    id: "3",
    name: "David Kimani",
    email: "david.kimani@email.com",
    productSaved: "Handmade Leather Sandals",
    quantitySaved: 1,
    stockCount: 35,
    addedOn: "2024-02-25T09:45:00.000Z",
    daysOnWishlist: 10,
    firstPurchase: "Yes",
    revenue: 550,
  },
  {
    id: "4",
    name: "Fatima Hassan",
    email: "fatima.hassan@email.com",
    productSaved: "Traditional Headwrap",
    quantitySaved: 3,
    stockCount: 50,
    addedOn: "2024-02-20T16:20:00.000Z",
    daysOnWishlist: 15,
    firstPurchase: "No",
    revenue: 600,
  },
  {
    id: "5",
    name: "Thabo Moloi",
    email: "thabo.moloi@email.com",
    productSaved: "Men's Kente Shirt",
    quantitySaved: 1,
    stockCount: 0,
    addedOn: "2024-02-15T11:10:00.000Z",
    daysOnWishlist: 20,
    firstPurchase: "Yes",
    revenue: 400,
  },
];

// Helper function to get initials
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const getVendorDisplayName = (vendor: string | Vendor | undefined): string => {
  if (!vendor) return "Unknown Vendor";
  if (typeof vendor === "string") return vendor;
  return vendor.name || "Unknown Vendor";
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

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

export default function AdminCartDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProductById, updateProduct } = useProducts();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("90d");

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

  // Get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const categories: { [key: string]: string } = {
      "1": "Clothing",
      "2": "Men's Fashion",
      "3": "Women's Fashion",
      "4": "Accessories",
      "5": "Headwear",
    };
    return categories[categoryId] || "Uncategorized";
  };

  // Get subcategory name
  const getSubCategoryName = (subCategoryId: string): string => {
    const subCategories: { [key: string]: string } = {
      "1-1": "Traditional Wear",
      "1-2": "Modern Wear",
      "2-1": "Men's Shirts",
      "1-1-1": "Kente",
      "1-1-2": "Ankara",
    };
    return subCategories[subCategoryId] || "General";
  };

  // Calculate total saves
  const totalSaves = mockBuyers.reduce(
    (sum, buyer) => sum + buyer.quantitySaved,
    0
  );

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

  const buyerFields: TableField<(typeof mockBuyers)[0]>[] = [
    {
      key: "name", // Changed from "buyer" to "name"
      header: "Name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-md">{row.name}</span>
            <span className="text-sm text-muted-foreground">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "productSaved", // Changed from "product"
      header: "Product Saved",
      cell: (_, row) => <span className="font-medium">{row.productSaved}</span>,
      align: "center",
    },
    {
      key: "quantitySaved", // Changed from "quantity"
      header: "Qty Saved",
      cell: (_, row) => (
        <span className="font-medium">{row.quantitySaved}</span>
      ),
      align: "center",
    },
    {
      key: "stockCount", // Changed from "stockQuantity"
      header: "Stock Count",
      cell: (_, row) => <span className="font-medium">{row.stockCount}</span>,
      align: "center",
    },
    {
      key: "addedOn", // Changed from "added"
      header: "Added on",
      cell: (_, row) => (
        <span className="font-medium">{formatDate(row.addedOn)}</span>
      ),
      align: "center",
    },
    {
      key: "daysOnWishlist", // Changed from "added"
      header: "Days spent on wishlist",
      cell: (_, row) => (
        <span className="font-medium">{row.daysOnWishlist} days</span>
      ),
      align: "center",
    },
    {
      key: "firstPurchase", // Changed from "status"
      header: "First Purchase",
      cell: (_, row) => (
        <Badge
          variant="outline"
          className={`flex flex-row items-center py-1 px-3 gap-2 rounded-md ${
            row.firstPurchase === "Yes"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <div
            className={`size-2 rounded-full ${
              row.firstPurchase === "Yes" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {row.firstPurchase}
        </Badge>
      ),
      align: "center",
    },
  ];

  const buyerActions: TableAction<(typeof mockBuyers)[0]>[] = [
    {
      type: "view",
      label: "View Customer Details",
      icon: <ExternalLink className="size-5" />,
      onClick: (buyer) => {
        navigate(`/admin/users/customers/${buyer.id}`);
      },
    },
  ];

  const savesOverTimeData = [
    { month: "January", saves: 186, purchases: 80 },
    { month: "February", saves: 305, purchases: 200 },
    { month: "March", saves: 237, purchases: 120 },
    { month: "April", saves: 73, purchases: 190 },
    { month: "May", saves: 209, purchases: 130 },
    { month: "June", saves: 214, purchases: 140 },
    { month: "July", saves: 186, purchases: 80 },
    { month: "August", saves: 305, purchases: 200 },
    { month: "September", saves: 237, purchases: 120 },
    { month: "October", saves: 73, purchases: 190 },
    { month: "November", saves: 209, purchases: 130 },
    { month: "December", saves: 214, purchases: 140 },
  ];

  const savesOverTimeConfig = {
    saves: {
      label: "Saves",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const savesByCountryData = [
    { name: "Ghana", value: 275, fill: "var(--color-ghana)" },
    { name: "Nigeria", value: 200, fill: "var(--color-nigeria)" },
    { name: "Kenya", value: 187, fill: "var(--color-kenya)" },
    { name: "South Africa", value: 173, fill: "var(--color-south-africa)" },
    { name: "Other", value: 90, fill: "var(--color-other)" },
  ];

  const savesByCountryConfig = {
    value: {
      label: "Saves",
    },
    ghana: {
      label: "Ghana",
      color: "var(--chart-1)",
    },
    nigeria: {
      label: "Nigeria",
      color: "var(--chart-2)",
    },
    kenya: {
      label: "Kenya",
      color: "var(--chart-3)",
    },
    "south-africa": {
      label: "South Africa",
      color: "var(--chart-4)",
    },
    other: {
      label: "Other",
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig;

  // Update your cartStatusData in CartDetails.tsx
  const cartStatusData = [
    { category: "Active", value: 140 },
    { category: "Abandoned", value: 75 },
    { category: "Checkout Failure", value: 100 },
    { category: "Purchased", value: 200 },
    { category: "Recovered", value: 20 },
  ];

  const cartStatusConfig = {
    value: {
      label: "Cart Count",
      color: "#4CAF50",
    },
  } satisfies ChartConfig;

  console.log("Data passed to chart:", cartStatusData);
  console.log("Config passed to chart:", cartStatusConfig);

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
              <h1 className="text-xl font-bold">Back to cart management</h1>
            </div>
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
                <div className="flex-1 flex-col">
                  <div className="flex items-start flex-col justify-between mb-6">
                    <h3 className="text-2xl font-semibold">{product.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Left Column */}
                    <div className="flex flex-row justify-between border p-4 rounded-lg">
                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Category
                        </Label>
                        <p className="text-muted-foreground">
                          {getCategoryName(product.categoryId)}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Sub Category
                        </Label>
                        <p className="text-muted-foreground">
                          {getSubCategoryName(product.subCategoryId || "")}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Vendor
                        </Label>
                        <p className="text-muted-foreground">
                          {getVendorDisplayName(product.vendor)}
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
                          Total Saves
                        </Label>
                        <p className="text-muted-foreground font-semibold">
                          {totalSaves}
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
            <Tabs defaultValue="product-metrics" className="w-full">
              <TabsList className="w-full justify-start rounded-lg p-4 min-h-16 h-auto bg-white mt-6 mb-6 dark:bg-[#303030]">
                <TabsTrigger
                  value="product-metrics"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Product Metrics
                </TabsTrigger>
                <TabsTrigger
                  value="buyer-information"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Buyer Information
                </TabsTrigger>
              </TabsList>

              {/* Product Metrics Tab */}
              <TabsContent value="product-metrics" className="space-y-8 m-0">
                <Card className="shadow-none border">
                  <CardContent className="">
                    <div className="flex flex-row justify-between items-center">
                      <h2 className="text-xl font-semibold">
                        Product Overview
                      </h2>
                      <Button variant={"secondary"}>
                        <ExternalLink className="" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-none border">
                  <CardContent className="">
                    <div className="flex flex-row justify-between items-center">
                      <h2 className="text-xl font-semibold">Vendor Overview</h2>
                      <Button variant={"secondary"}>
                        <ExternalLink className="" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-none border">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="font-semibold text-xl">Cart Overview</h2>
                        <div className="flex items-center gap-2">
                          <Select
                            value={timeRange}
                            onValueChange={setTimeRange}
                          >
                            <SelectTrigger
                              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                              aria-label="Select a value"
                            >
                              <SelectValue placeholder="Last 3 months" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                              </SelectItem>
                              <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                              </SelectItem>
                              <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            All regions
                          </Button>
                        </div>
                      </div>
                      <div className="w-full">
                        <AreaChartComponent
                          data={savesOverTimeData}
                          config={savesOverTimeConfig}
                          chartHeight="350px"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 space-x-8">
                  <Card className="shadow-none border">
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-row items-center justify-between">
                          <h2 className="font-semibold text-xl">
                            Cart by Country
                          </h2>
                          <Select
                            value={timeRange}
                            onValueChange={setTimeRange}
                          >
                            <SelectTrigger
                              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                              aria-label="Select a value"
                            >
                              <SelectValue placeholder="Last 3 months" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                              </SelectItem>
                              <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                              </SelectItem>
                              <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full">
                          <PieDonutChartComponent
                            data={savesByCountryData}
                            config={savesByCountryConfig}
                            chartHeight="350px"
                            showKey={true}
                            keyPosition="right"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border">
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-row items-center justify-between">
                          <h2 className="font-semibold text-xl">
                            Drop off stage
                          </h2>
                          <Select
                            value={timeRange}
                            onValueChange={setTimeRange}
                          >
                            <SelectTrigger
                              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                              aria-label="Select a value"
                            >
                              <SelectValue placeholder="Last 3 months" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                              </SelectItem>
                              <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                              </SelectItem>
                              <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full h-[350px]">
                          {/* <BarChartComponent
                            data={cartStatusData}
                            config={cartStatusConfig}
                            chartHeight="350px"
                            orientation="vertical"
                            categoryKey="category" // FIXED
                            valueKeys={["value"]} // FIXED
                            showLabels={true}
                            showValueLabel={true}
                            hideYAxis={false}
                            hideXAxis={true}
                            yAxisWidth={150}
                            barRadius={8}
                            className="shadow-none border-none"
                          /> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Buyer Information Tab */}
              <TabsContent value="buyer-information" className="space-y-8 m-0">
                <Card className="shadow-none border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Search and Filter */}
                      <div className="flex gap-4">
                        <Search placeholder="Search buyers by name or email..." />
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 h-11 px-8"
                        >
                          <span>Filter</span>
                          <ListFilter className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Buyers Table */}
                      <div className="">
                        <DataTable
                          data={mockBuyers}
                          fields={buyerFields}
                          actions={buyerActions}
                          enableSelection={true}
                          enablePagination={true}
                          pageSize={10}
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
