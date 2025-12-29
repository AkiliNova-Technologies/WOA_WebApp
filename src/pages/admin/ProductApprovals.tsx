import { useState, useEffect } from "react";
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
import { SiteHeader } from "@/components/site-header";
import { Filter, Download, Eye, Pencil, Loader2 } from "lucide-react";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import type { Product } from "@/redux/slices/productsSlice";
import images from "@/assets/images";

// Extended status for UI display
type ExtendedProductStatus =
  | "active"
  | "suspended"
  | "deactivated"
  | "deleted"
  | "draft"
  | "out-of-stock"
  | "archived";

type TabFilter = "all" | "pending_approval" | "active" | "unpublished" | "suspended";

// Map Redux product status to extended UI status
const mapReduxStatusToExtendedStatus = (
  status: Product["status"]
): ExtendedProductStatus => {
  switch (status) {
    case "published":
    case "approved":
      return "active";
    case "draft":
    case "pending_approval":
      return "draft";
    case "rejected":
      return "suspended";
    case "archived":
      return "deactivated";
    case "RE_EVALUATION":
      return "draft"; // Treat as pending approval
    default:
      return "active";
  }
};

// Map tab filter to API status
const mapTabToApiStatus = (tab: TabFilter): Product["status"] | undefined => {
  switch (tab) {
    case "active":
      return "approved";
    case "pending_approval":
      return "pending_approval";
    case "suspended":
      return "rejected";
    case "unpublished":
      return "archived";
    default:
      return undefined; // "all" - no filter
  }
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

// Table product type
type TableProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  vendor: string;
  vendorId: string;
  image: string;
  categoryId: string;
  status: Product["status"];
  stockQuantity: number;
  sales: number;
  category: string;
  averageRating: number;
  reviewCount: number;
};

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ExtendedProductStatus[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const {
    publicProducts, // ✅ Use publicProducts instead of products
    loading,
    error,
    getPublicProducts,
    getProductsByStatus,
  } = useReduxProducts();

  // Debug logging
  console.log("🔍 AdminProductsPage state:", {
    publicProducts,
    publicProductsLength: publicProducts.length,
    loading,
    error,
  });

  // Fetch products on mount and when tab changes
  useEffect(() => {
    const loadProducts = async () => {
      try {
        mapTabToApiStatus(activeTab);
        console.log("📥 Loading products...");
        await getPublicProducts({
          page: 1,
          limit: 100,
        });
        console.log("✅ Products loaded");
      } catch (error) {
        console.error("❌ Failed to load products:", error);
      }
    };

    loadProducts();
  }, [getPublicProducts, activeTab]);

  const statusOptions: { value: ExtendedProductStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Pending approval" },
    { value: "deactivated", label: "Unpublished" },
    { value: "suspended", label: "Suspended" },
  ];

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
    setActiveTab("all");
  };

  // Transform Redux product to table product
  const transformProductForTable = (product: Product): TableProduct => {
    // Calculate total stock from all variants
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0;
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price, // Already from first active variant
      compareAtPrice: product.compareAtPrice,
      vendor: product.vendorName || "Unknown Vendor", // Use enriched vendorName
      vendorId: product.sellerId,
      image: product.image || "", // Already enriched
      categoryId: product.categoryId,
      status: product.status,
      stockQuantity: totalStock,
      sales: 0, // TODO: Get from orders API
      category: product.category?.name || "Uncategorized",
      averageRating: product.averageRating || 0,
      reviewCount: product.reviewCount || 0,
    };
  };

  const tableProducts: TableProduct[] = publicProducts.map(transformProductForTable);
  
  console.log("📊 Table products:", {
    tableProductsLength: tableProducts.length,
    firstProduct: tableProducts[0],
  });

  // Filter products based on search, status filters, and tabs
  const filteredProducts = tableProducts.filter((product) => {
    const extendedStatus = mapReduxStatusToExtendedStatus(product.status);

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter (dropdown)
    const matchesStatusFilter =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(extendedStatus);

    // Tab filter
    const matchesTabFilter = 
      activeTab === "all" ||
      (activeTab === "active" && extendedStatus === "active") ||
      (activeTab === "pending_approval" && extendedStatus === "draft") ||
      (activeTab === "unpublished" && extendedStatus === "deactivated") ||
      (activeTab === "suspended" && extendedStatus === "suspended");

    return matchesSearch && matchesStatusFilter && matchesTabFilter;
  });
  
  console.log("🔎 Filtered products:", {
    filteredLength: filteredProducts.length,
    totalLength: tableProducts.length,
    activeTab,
    searchQuery,
    selectedStatuses,
  });

  // Calculate statistics for cards
  const totalProducts = publicProducts.length;
  const activeProducts = getProductsByStatus("approved").length + getProductsByStatus("published").length;
  const pendingApproval = getProductsByStatus("pending_approval").length + getProductsByStatus("draft").length + getProductsByStatus("RE_EVALUATION").length;
  const suspendedProducts = getProductsByStatus("rejected").length;

  const statsCards: CardData[] = [
    {
      title: "Total products",
      value: totalProducts.toString(),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Pending approval",
      value: pendingApproval.toString(),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Active products",
      value: activeProducts.toString(),
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Suspended products",
      value: suspendedProducts.toString(),
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
  ];

  // Table fields configuration
  const productFields: TableField<TableProduct>[] = [
    {
      key: "name",
      header: "Product name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-md">
            <AvatarImage
              src={row.image}
              alt={row.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-muted text-muted-foreground font-medium rounded-md">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium text-md">{row.name}</span>
          </div>
        </div>
      ),
      align: "left",
    },
    {
      key: "category",
      header: "Category",
      cell: (value) => <span className="font-medium">{value as string}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "price",
      header: "Base Price (USD)",
      cell: (_, row) => (
        <div className="text-center">
          {row.compareAtPrice ? (
            <>
              <span className="line-through text-gray-400">${row.compareAtPrice.toFixed(2)}</span>
              <span className="ml-2 font-medium text-green-600">${row.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="font-medium">${row.price.toFixed(2)}</span>
          )}
        </div>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "stockQuantity",
      header: "Stock",
      cell: (value) => {
        const stock = value as number;
        return (
          <div className="text-center">
            <span className={`font-medium ${stock === 0 ? 'text-red-600' : stock < 10 ? 'text-orange-600' : ''}`}>
              {stock}
            </span>
          </div>
        );
      },
      align: "center",
      enableSorting: true,
    },
    {
      key: "averageRating",
      header: "Rating",
      cell: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <span className="font-medium">{row.averageRating.toFixed(1)}</span>
          <span className="text-yellow-500">★</span>
          <span className="text-gray-500 text-sm">({row.reviewCount})</span>
        </div>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const extendedStatus = mapReduxStatusToExtendedStatus(row.status);
        const statusConfig = {
          active: {
            label: "Active",
            className: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
          },
          suspended: {
            label: "Suspended",
            className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
          },
          deactivated: {
            label: "Unpublished",
            className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
          },
          deleted: {
            label: "Deleted",
            className: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
          },
          draft: {
            label: "Pending approval",
            className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
          },
          "out-of-stock": {
            label: "Out of Stock",
            className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
          },
          archived: {
            label: "Archived",
            className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
          },
        };

        const config = statusConfig[extendedStatus] || statusConfig.active;

        return (
          <Badge
            variant="outline"
            className={`${config.className} font-medium`}
          >
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
      icon: <Eye className="size-5" />,
      onClick: (product) => {
        navigate(`/admin/products/${product.id}/details`);
      },
    },
    {
      type: "edit",
      label: "Edit Product",
      icon: <Pencil className="size-5" />,
      onClick: (product) => {
        navigate(`/admin/products/${product.id}/edit`);
      },
    },
  ];

  const handleTabClick = (tab: TabFilter) => {
    setActiveTab(tab);
    // Clear status filters when switching tabs
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: TabFilter) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";
    
    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }
    
    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader label="Product Management" />
      <div className="p-6 space-y-6">
        <SectionCards cards={statsCards} layout="1x4" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  All Products
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all products on the platform
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-96">
                <Search
                  placeholder="Search by name, vendor, or category"
                  value={searchQuery}
                  onSearchChange={setSearchQuery}
                  className="h-10"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Time Period Buttons */}
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#404040]">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050] rounded-l-lg"
                    disabled={loading}
                  >
                    Last 7 days
                  </button>
                  <button 
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                    disabled={loading}
                  >
                    Last 30 days
                  </button>
                  <button 
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848] rounded-r-lg"
                    disabled={loading}
                  >
                    All time
                  </button>
                </div>

                {/* Filter Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-10"
                      disabled={loading}
                    >
                      <Filter className="w-4 h-4" />
                      Filter
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
                        disabled={loading}
                      >
                        {status.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export Button */}
                <Button 
                  variant="outline" 
                  className="gap-2 h-10"
                  disabled={loading}
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>

                {/* Clear Filters Button */}
                {(selectedStatuses.length > 0 || searchQuery || activeTab !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-sm h-10"
                    disabled={loading}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Error: {error}
                </p>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 px-6 overflow-x-auto">
              <button 
                className={getTabButtonClass("all")}
                onClick={() => handleTabClick("all")}
                disabled={loading}
              >
                All Products ({totalProducts})
              </button>
              <button 
                className={getTabButtonClass("pending_approval")}
                onClick={() => handleTabClick("pending_approval")}
                disabled={loading}
              >
                Pending Approval ({pendingApproval})
              </button>
              <button 
                className={getTabButtonClass("active")}
                onClick={() => handleTabClick("active")}
                disabled={loading}
              >
                Active ({activeProducts})
              </button>
              <button 
                className={getTabButtonClass("unpublished")}
                onClick={() => handleTabClick("unpublished")}
                disabled={loading}
              >
                Unpublished ({getProductsByStatus("archived").length})
              </button>
              <button 
                className={getTabButtonClass("suspended")}
                onClick={() => handleTabClick("suspended")}
                disabled={loading}
              >
                Suspended ({suspendedProducts})
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Loading products...
                </span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6"/>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Products Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedStatuses.length > 0 || activeTab !== "all"
                    ? "No products found matching your criteria"
                    : "No products have been added yet"}
                </p>
                {(searchQuery || selectedStatuses.length > 0 || activeTab !== "all") && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <DataTable<TableProduct>
                data={filteredProducts}
                fields={productFields}
                actions={productActions}
                enableSelection={true}
                enablePagination={true}
                pageSize={10}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}