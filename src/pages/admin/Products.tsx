import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Search } from "@/components/ui/search";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import type { Product as ReduxProduct } from "@/redux/slices/productsSlice";

import {
  EyeIcon,
  PenIcon,
  Package,
  CheckCircle,
  Trash2Icon,
  Ban,
  ListFilter,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

// Extended ProductStatus to include the requested statuses
type ExtendedProductStatus = 
  | "active" 
  | "suspended" 
  | "deactivated" 
  | "deleted"
  | "draft" 
  | "out-of-stock" 
  | "archived";

type ProductTab = "all" | "active" | "suspended" | "deactivated" | "deleted";

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  suspendedProducts: number;
  deactivatedProducts: number;
  deletedProducts: number;
  totalRevenue: number;
}

// Helper function to map Redux status to your extended status
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

// Helper to get initials for avatar
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

// Helper to format currency
const formatAmount = (amount: number): string => {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format numbers
const formatNumberShort = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
  }
  return num.toString();
};

// Define the transformed product type for the table
type TableProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  vendor: string;
  image: string;
  categoryId: string;
  status: "draft" | "pending_review" | "approved" | "rejected" | "published" | "archived";
  stockQuantity: number;
  sales: number;
  category: string;
};

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ExtendedProductStatus[]>([]);
  const [activeTab, setActiveTab] = useState<ProductTab>("all");

  // Use the Redux products hook
  const { 
    products, 
    loading, 
    error,
    getPublishedProducts,
    getPendingReviewProducts 
  } = useReduxProducts();

  // Transform Redux products to match your table format
  const transformProductForTable = (reduxProduct: ReduxProduct): TableProduct => ({
    id: reduxProduct.id,
    name: reduxProduct.name,
    description: reduxProduct.description,
    price: reduxProduct.price,
    salePrice: reduxProduct.salePrice,
    vendor: reduxProduct.vendor?.businessName || "Unknown Vendor",
    image: reduxProduct.images?.find(img => img.isPrimary)?.url || reduxProduct.images?.[0]?.url || "",
    categoryId: reduxProduct.categoryId,
    status: reduxProduct.status,
    stockQuantity: reduxProduct.stock,
    sales: 0, // You might need to add this field to your Redux product or fetch separately
    category: reduxProduct.category?.name || "Uncategorized",
  });

  const tableProducts = products.map(transformProductForTable);

  // Calculate product statistics based on extended statuses
  const calculateStats = (): ProductStats => {
    const totalProducts = products.length;
    const activeProducts = getPublishedProducts().length;
    const suspendedProducts = getPendingReviewProducts().length;
    const deactivatedProducts = products.filter(p => p.status === "archived" || p.status === "rejected").length;
    const deletedProducts = 0; // You might need to track deleted products separately

    return {
      totalProducts,
      activeProducts,
      suspendedProducts,
      deactivatedProducts,
      deletedProducts,
      totalRevenue: products.reduce((sum, p) => sum + (p.price * 0), 0), // Replace 0 with actual sales data if available
    };
  };

  const stats = calculateStats();

  // Filter products based on active tab, search, and status filters
  const filteredProducts = tableProducts.filter((product) => {
    const extendedStatus = mapReduxStatusToExtendedStatus(product.status);

    // Tab filtering
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "active" && extendedStatus === "active") ||
      (activeTab === "suspended" && extendedStatus === "suspended") ||
      (activeTab === "deactivated" && extendedStatus === "deactivated") ||
      (activeTab === "deleted" && extendedStatus === "deleted");

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(extendedStatus);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: ExtendedProductStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  // Product cards with requested metrics
  const productCards: CardData[] = [
    {
      title: "Total Products",
      value: formatNumberShort(stats.totalProducts),
      rightIcon: <Package className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#D7FFC3]",
    },
    {
      title: "Active Products",
      value: formatNumberShort(stats.activeProducts),
      rightIcon: <CheckCircle className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#C4E8D1]",
      change: {
        trend: "down",
        value: "10%",
        description: "from last month"
      }
    },
    {
      title: "Suspended Products",
      value: formatNumberShort(stats.suspendedProducts),
      rightIcon: <Ban className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#FFE4C4]",
      change: {
        trend: "up",
        value: "20%",
        description: "from last month"
      }
    },
    {
      title: "Deleted Products",
      value: formatNumberShort(stats.deletedProducts),
      rightIcon: <Trash2Icon className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#FFC4C4]",
      change: {
        trend: "down",
        value: "5%",
        description: "from last month"
      }
    },
  ];

  // Available status options for filter
  const statusOptions: { value: ExtendedProductStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "deactivated", label: "Deactivated" },
    { value: "deleted", label: "Deleted" },
  ];

  // Status configuration with proper typing
  const statusConfig = {
    active: {
      label: "Active",
      dotColor: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    suspended: {
      label: "Suspended",
      dotColor: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
    },
    deactivated: {
      label: "Deactivated",
      dotColor: "bg-gray-500",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
    },
    deleted: {
      label: "Deleted",
      dotColor: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
    },
    draft: {
      label: "Draft",
      dotColor: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
    },
    "out-of-stock": {
      label: "Out of Stock",
      dotColor: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
    },
    archived: {
      label: "Archived",
      dotColor: "bg-purple-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
    },
  } as const;

  // Table fields for list view with requested columns
  const productFields: TableField<TableProduct>[] = [
    {
      key: "image",
      header: "Product",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 rounded-sm">
            <AvatarImage src={row.image} alt={row.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-md">{row.name}</span>
            <span className="text-sm text-muted-foreground">{row.vendor}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (value) => (
        <span className="font-medium">{value as string}</span>
      ),
      align: "center",
    },
    {
      key: "price",
      header: "Price",
      cell: (value) => (
        <span className="font-medium">{formatAmount(value as number)}</span>
      ),
      align: "center",
    },
    {
      key: "stockQuantity",
      header: "Stock Count",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
    },
    {
      key: "sales", // Changed from "revenue" to "sales" since that's what exists
      header: "Revenue Generated",
      cell: (value) => {
        // Calculate revenue based on sales and price (you might need to adjust this logic)
        const sales = value as number;
        return (
          <span className="font-medium">
            {formatAmount(sales * 100)} {/* Adjust calculation as needed */}
          </span>
        );
      },
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const extendedStatus = mapReduxStatusToExtendedStatus(row.status);
        const config = statusConfig[extendedStatus] || statusConfig.active;

        return (
          <Badge
            variant="outline"
            className="flex flex-row items-center py-2 w-28 gap-2 bg-transparent rounded-md"
          >
            <div className={`size-2 rounded-full ${config.dotColor}`} />
            {config.label}
          </Badge>
        );
      },
      align: "center",
      enableSorting: true,
    },
  ];

  const productActions: TableAction<TableProduct>[] = [
    {
      type: "view",
      label: "View Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (product) => {
        navigate(`/admin/products/${product.id}/details`);
      },
    },
    {
      type: "edit",
      label: "Edit Product",
      icon: <PenIcon className="size-5" />,
      onClick: (product) => {
        navigate(`/admin/products/${product.id}/edit`);
      },
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading products: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SiteHeader/>
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            <SectionCards cards={productCards} layout="1x4" />

            <div className="space-y-6">
              {/* Products Section */}
              <div className="rounded-lg border bg-card py-6 mb-6 dark:bg-[#303030]">
                
                {/* Tab Navigation */}
                <div className="px-6 mb-6">
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductTab)}>
                    <TabsList className="grid w-full grid-cols-5 h-12 bg-transparent border-b p-0">
                      <TabsTrigger 
                        value="all" 
                        className="shadow-none border-0 border-b rounded-none data-[state=active]:text-[#CC5500] data-[state=active]:border-b data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] dark:data-[state=active]:text-[#CC5500] dark:data-[state=active]:bg-transparent data-[state=active]:border-[#CC5500]"
                      >
                        All Products
                        <Badge variant="secondary" className="ml-2 dark:text-white dark:bg-[#121212]">
                          {stats.totalProducts}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="active" 
                        className="shadow-none border-0 border-b rounded-none data-[state=active]:text-[#CC5500] data-[state=active]:border-b data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] dark:data-[state=active]:text-[#CC5500] dark:data-[state=active]:bg-transparent data-[state=active]:border-[#CC5500]"
                      >
                        Active Products
                        <Badge variant="secondary" className="ml-2 dark:text-white dark:bg-[#121212]">
                          {stats.activeProducts}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="suspended" 
                        className="shadow-none border-0 border-b rounded-none data-[state=active]:text-[#CC5500] data-[state=active]:border-b data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] dark:data-[state=active]:text-[#CC5500] dark:data-[state=active]:bg-transparent data-[state=active]:border-[#CC5500]"
                      >
                        Suspended Products
                        <Badge variant="secondary" className="ml-2 dark:text-white dark:bg-[#121212]">
                          {stats.suspendedProducts}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="deactivated" 
                        className="shadow-none border-0 border-b rounded-none data-[state=active]:text-[#CC5500] data-[state=active]:border-b data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] dark:data-[state=active]:text-[#CC5500] dark:data-[state=active]:bg-transparent data-[state=active]:border-[#CC5500]"
                      >
                        Deactivated Products
                        <Badge variant="secondary" className="ml-2 dark:text-white dark:bg-[#121212]">
                          {stats.deactivatedProducts}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="deleted" 
                        className="shadow-none border-0 border-b rounded-none data-[state=active]:text-[#CC5500] data-[state=active]:border-b data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] dark:data-[state=active]:text-[#CC5500] dark:data-[state=active]:bg-transparent data-[state=active]:border-[#CC5500]"
                      >
                        Deleted Products
                        <Badge variant="secondary" className="ml-2 dark:text-white dark:bg-[#121212]">
                          {stats.deletedProducts}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Search and Filter Section */}
                <div className="px-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="w-full sm:w-auto flex flex-1">
                    <Search
                      placeholder="Search products by name, vendor, or category..."
                      value={searchQuery}
                      onSearchChange={setSearchQuery}
                      className="rounded-full flex-1 w-full"
                    />
                  </div>

                  <div className="flex flex-row items-center gap-4">
                    <div className="flex gap-2 items-center">
                      {/* Status Filter Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 h-10"
                          >
                            Filter
                            <ListFilter className="w-4 h-4" />
                            {selectedStatuses.length > 0 && (
                              <Badge variant="secondary" className="ml-1">
                                {selectedStatuses.length}
                              </Badge>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {statusOptions.map((status) => (
                            <DropdownMenuCheckboxItem
                              key={status.value}
                              checked={selectedStatuses.includes(status.value)}
                              onCheckedChange={() =>
                                handleStatusFilterChange(status.value)
                              }
                            >
                              {status.label}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Clear Filters Button */}
                      {(selectedStatuses.length > 0 || searchQuery) && (
                        <Button
                          variant="ghost"
                          onClick={clearAllFilters}
                          className="text-sm"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products Display - Only Table View */}
                <div className="px-6">
                  <DataTable<TableProduct>
                    data={filteredProducts}
                    fields={productFields}
                    actions={productActions}
                    enableSelection={true}
                    enablePagination={true}
                    pageSize={10}
                  />

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No products found matching your criteria.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}