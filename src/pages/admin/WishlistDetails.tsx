import { useParams, useNavigate } from "react-router-dom";
import { useReduxProducts } from "@/hooks/useReduxProducts"; // Change this import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImageIcon,
  ListFilter,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
// import type { Product as ReduxProduct } from "@/redux/slices/productsSlice";
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
import { Search } from "@/components/ui/search";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PieDonutChartComponent } from "@/components/charts/pie-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react"; // Added useEffect

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
const mapReduxStatusToExtendedStatus = (status: string): ExtendedProductStatus => {
  switch (status) {
    case "published": return "active";
    case "draft": return "suspended";
    case "pending_review": return "suspended";
    case "approved": return "active";
    case "rejected": return "deactivated";
    case "archived": return "deactivated";
    default: return "active";
  }
};

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

// Mock data for size variants
const sizeVariants = [
  {
    size: "S",
    price: 45.99,
    availableStock: 25,
    colors: [
      {
        color: "Red",
        savesCount: 10,
        availableQty: 8,
        stockStatus: "In stock",
      },
      {
        color: "Blue",
        savesCount: 8,
        availableQty: 6,
        stockStatus: "Limited stock",
      },
      {
        color: "Green",
        savesCount: 7,
        availableQty: 5,
        stockStatus: "Out of stock",
      },
    ],
  },
  {
    size: "M",
    price: 45.99,
    availableStock: 30,
    colors: [
      {
        color: "Red",
        savesCount: 12,
        availableQty: 10,
        stockStatus: "In stock",
      },
      {
        color: "Blue",
        savesCount: 10,
        availableQty: 8,
        stockStatus: "In stock",
      },
      {
        color: "Green",
        savesCount: 8,
        availableQty: 6,
        stockStatus: "Limited stock",
      },
    ],
  },
  {
    size: "L",
    price: 49.99,
    availableStock: 20,
    colors: [
      {
        color: "Red",
        savesCount: 8,
        availableQty: 6,
        stockStatus: "Limited stock",
      },
      {
        color: "Blue",
        savesCount: 7,
        availableQty: 5,
        stockStatus: "Out of stock",
      },
      {
        color: "Green",
        savesCount: 5,
        availableQty: 3,
        stockStatus: "Out of stock",
      },
    ],
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

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Calculate total saves for a variant
const calculateTotalSaves = (colors: (typeof sizeVariants)[0]["colors"]) => {
  return colors.reduce((total, color) => total + color.savesCount, 0);
};

// Color Table Component (unchanged)
function ColorQuantityTable({
  colors,
}: {
  colors: {
    color: string;
    savesCount: number;
    availableQty: number;
    stockStatus: string;
  }[];
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in stock":
        return "bg-green-500";
      case "limited stock":
        return "bg-yellow-500";
      case "out of stock":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in stock":
        return "text-green-700";
      case "limited stock":
        return "text-yellow-700";
      case "out of stock":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <Table className="border">
      <TableHeader>
        <TableRow className="dark:bg-[#00000040]">
          <TableHead className="font-semibold text-center p-4">Color</TableHead>
          <TableHead className="font-semibold text-center p-4">
            Saves Count
          </TableHead>
          <TableHead className="font-semibold text-center p-4">
            Available Qty
          </TableHead>
          <TableHead className="font-semibold text-center p-4">
            Stock Status
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
                {colorItem.savesCount}
              </span>
            </TableCell>
            <TableCell className="font-medium p-4 text-center">
              <span className="font-medium text-md">
                {colorItem.availableQty}
              </span>
            </TableCell>
            <TableCell className="flex text-center justify-center">
              <Badge
                variant="outline"
                className={`flex flex-row items-center py-1 px-3 gap-2 bg-transparent rounded-md ${getStatusTextColor(
                  colorItem.stockStatus
                )}`}
              >
                <div
                  className={`size-2 rounded-full ${getStatusColor(
                    colorItem.stockStatus
                  )}`}
                />
                {colorItem.stockStatus}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Size Variant Component (unchanged)
function SizeVariantSection({
  variant,
}: {
  variant: (typeof sizeVariants)[0];
}) {
  const totalSaves = calculateTotalSaves(variant.colors);

  return (
    <Card className="space-y-1 px-8 border-b pb-6 shadow-none">
      <h2 className="text-xl font-semibold">Size - {variant.size}</h2>
      <div className="grid grid-cols-2 gap-6">
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

        <Card className="p-6 shadow-none border">
          <div className="space-y-4">
            <div>
              <Label className="font-semibold text-md mb-2 block">
                Total Saves
              </Label>
              <p className="text-foreground text-lg font-semibold">
                {totalSaves}
              </p>
            </div>
          </div>
        </Card>
      </div>

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

export default function AdminWishlistDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { 
    product, 
    loading, 
    error,
    getProduct 
  } = useReduxProducts(); // Use Redux products hook
  const [timeRange, setTimeRange] = useState("90d");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch product details when component mounts
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      getProduct(productId)
        .finally(() => setIsLoading(false));
    }
  }, [productId, getProduct]);

  // Helper to get primary image
  const getPrimaryImage = () => {
    if (!product?.images || product.images.length === 0) return "";
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.url || product.images[0]?.url || "";
  };

  // Helper to get category name
  const getCategoryName = () => {
    return product?.category?.name || "Uncategorized";
  };

  // Helper to get vendor name
  const getVendorName = () => {
    return product?.vendor?.businessName || "Unknown Vendor";
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
          <Button onClick={() => navigate("/admin/wishlist")}>
            Return to Wishlist
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
          <Button onClick={() => navigate("/admin/wishlist")}>
            Return to Wishlist
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

  // Calculate total saves (mock data - you might want to fetch real wishlist data)
  const totalSaves = mockBuyers.reduce(
    (sum, buyer) => sum + buyer.quantitySaved,
    0
  );

  const primaryImage = getPrimaryImage();

  // Table fields for buyers
  const buyerFields: TableField<(typeof mockBuyers)[0]>[] = [
    {
      key: "name",
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
      key: "productSaved",
      header: "Product Saved",
      cell: (_, row) => <span className="font-medium">{row.productSaved}</span>,
      align: "center",
    },
    {
      key: "quantitySaved",
      header: "Qty Saved",
      cell: (_, row) => (
        <span className="font-medium">{row.quantitySaved}</span>
      ),
      align: "center",
    },
    {
      key: "stockCount",
      header: "Stock Count",
      cell: (_, row) => <span className="font-medium">{row.stockCount}</span>,
      align: "center",
    },
    {
      key: "addedOn",
      header: "Added on",
      cell: (_, row) => (
        <span className="font-medium">{formatDate(row.addedOn)}</span>
      ),
      align: "center",
    },
    {
      key: "daysOnWishlist",
      header: "Days spent on wishlist",
      cell: (_, row) => (
        <span className="font-medium">{row.daysOnWishlist} days</span>
      ),
      align: "center",
    },
    {
      key: "firstPurchase",
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

  return (
    <div>
      <SiteHeader label="Wishlist Product Details" />

      <div className="min-h-screen p-6">
        <div className="mx-auto space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between bg-white dark:bg-[#303030] p-6 rounded-md">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Back to wishlist management</h1>
            </div>
          </div>

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

                    {product.images && product.images.slice(0, 4).map((img, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 bg-muted rounded border border-border flex items-center justify-center overflow-hidden"
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

                    <Button variant="outline" size="icon" className="w-12 h-12">
                      <ChevronDown className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Main Image */}
                  {primaryImage ? (
                    <div className="relative w-80 h-96 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="rounded-md h-full w-full object-cover"
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

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">${product.price}</span>
                      {product.salePrice && (
                        <>
                          <span className="text-lg text-muted-foreground line-through">
                            ${product.salePrice}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            Sale
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Category Information */}
                    <div className="flex flex-row justify-between border p-4 rounded-lg">
                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Category
                        </Label>
                        <p className="text-muted-foreground">
                          {getCategoryName()}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Sub Category
                        </Label>
                        <p className="text-muted-foreground">
                          {product.subcategory?.name || "Not specified"}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Vendor
                        </Label>
                        <p className="text-muted-foreground">
                          {getVendorName()}
                        </p>
                      </div>
                    </div>

                    {/* Stock Information */}
                    <div className="flex flex-row justify-between border p-4 rounded-lg">
                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          Available Stock
                        </Label>
                        <p className="text-muted-foreground">
                          {product.stock} units
                        </p>
                      </div>

                      <div className="p-4 rounded-lg">
                        <Label className="text-md font-medium text-primary block mb-2 dark:text-white">
                          SKU
                        </Label>
                        <p className="text-muted-foreground">
                          {product.sku}
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
                <TabsTrigger
                  value="sizes-saved"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Sizes Saved
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
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="font-semibold text-xl">
                          Saves Overview
                        </h2>
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

                <Card className="shadow-none border">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="font-semibold text-xl">
                          Saves by Country
                        </h2>
                        <Select value={timeRange} onValueChange={setTimeRange}>
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

              {/* Sizes Saved Tab */}
              <TabsContent value="sizes-saved" className="space-y-8 m-0">
                <div className="">
                  <div className="space-y-6">
                    {sizeVariants.map((variant, index) => (
                      <SizeVariantSection key={index} variant={variant} />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}