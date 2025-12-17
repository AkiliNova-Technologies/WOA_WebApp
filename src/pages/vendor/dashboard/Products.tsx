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
import {
  EyeIcon,
  FilterIcon,
  PenIcon,
  Plus,
  Trash2Icon,
  
  Loader2,
  Download,

} from "lucide-react";

import { SiteHeader } from "@/components/site-header";

import { useReduxVendors } from "@/hooks/useReduxVendors";
import images from "@/assets/images";

// Product type definition for vendor dashboard
interface VendorProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  categoryId: string;
  categoryName?: string;
  vendorId: string;
  vendorName: string;
  rating: number;
  reviews: number;
  status: "active" | "draft" | "out-of-stock" | "archived" | "pending" | "rejected" | "unpublished";
  stockQuantity: number;
  sales: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  orders?: number;
  [key: string]: any;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  pendingApproval: number;
  unpublishedProducts: number;
  totalSales: number;
  averageRating: number;
  totalRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

type ProductStatus = "all" | "active" | "pending" | "draft" | "unpublished" | "rejected";
type DateRange = "last-7-days" | "last-30-days" | "all-time";

export default function VendorProductsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ProductStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  // Use the vendors hook to get vendor-specific data
  const {
    selectedVendor,
    loading,
    getVendor,
  } = useReduxVendors();

  // State for vendor products
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);

  // Fetch vendor data and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getVendor("current", false);
        
        // Mock products data with various statuses
        const mockProducts: VendorProduct[] = [
          {
            id: "1",
            name: "African made sandals",
            description: "Traditional handcrafted sandals",
            price: 20,
            image: "/placeholder-product.jpg",
            categoryId: "1",
            categoryName: "Fashion & Apparel",
            vendorId: selectedVendor?.id || "vendor1",
            vendorName: selectedVendor?.businessName || "Kente Galleria",
            rating: 4.5,
            reviews: 128,
            status: "active",
            stockQuantity: 45,
            sales: 245,
            revenue: 12250.55,
            orders: 10,
            createdAt: "2024-01-15T00:00:00.000Z",
            updatedAt: "2024-03-15T00:00:00.000Z",
            sku: "AFR-001",
          },
          {
            id: "2",
            name: "Hand-crafted leather bag",
            description: "Premium leather handbag",
            price: 45,
            image: "/placeholder-product.jpg",
            categoryId: "1",
            categoryName: "Fashion & Apparel",
            vendorId: selectedVendor?.id || "vendor1",
            vendorName: selectedVendor?.businessName || "Kente Galleria",
            rating: 4.8,
            reviews: 89,
            status: "pending",
            stockQuantity: 32,
            sales: 120,
            revenue: 10798.80,
            orders: 10,
            createdAt: "2024-02-10T00:00:00.000Z",
            updatedAt: "2024-03-10T00:00:00.000Z",
            sku: "AFR-002",
          },
          {
            id: "3",
            name: "Eco-friendly Jewerly",
            description: "Sustainable jewelry pieces",
            price: 13,
            image: "/placeholder-product.jpg",
            categoryId: "1",
            categoryName: "Fashion & Apparel",
            vendorId: selectedVendor?.id || "vendor1",
            vendorName: selectedVendor?.businessName || "Kente Galleria",
            rating: 4.2,
            reviews: 56,
            status: "unpublished",
            stockQuantity: 67,
            sales: 189,
            revenue: 2455.11,
            orders: 10,
            createdAt: "2024-02-28T00:00:00.000Z",
            updatedAt: "2024-03-01T00:00:00.000Z",
            sku: "AFR-003",
          },
          {
            id: "4",
            name: "Artisan beaded necklace",
            description: "Traditional beaded necklace",
            price: 400,
            image: "/placeholder-product.jpg",
            categoryId: "1",
            categoryName: "Fashion & Apparel",
            vendorId: selectedVendor?.id || "vendor1",
            vendorName: selectedVendor?.businessName || "Kente Galleria",
            rating: 4.9,
            reviews: 34,
            status: "unpublished",
            stockQuantity: 15,
            sales: 0,
            revenue: 0,
            orders: 10,
            createdAt: "2024-03-01T00:00:00.000Z",
            updatedAt: "2024-03-01T00:00:00.000Z",
            sku: "AFR-004",
          },
          {
            id: "5",
            name: "Kente Cloth Scarf",
            description: "Handwoven Kente pattern scarf",
            price: 34.99,
            originalPrice: 39.99,
            image: "/placeholder-product.jpg",
            categoryId: "1",
            categoryName: "Clothing",
            vendorId: selectedVendor?.id || "vendor1",
            vendorName: selectedVendor?.businessName || "Kente Galleria",
            rating: 4.6,
            reviews: 78,
            status: "draft",
            stockQuantity: 0,
            sales: 210,
            revenue: 7347.90,
            orders: 12,
            createdAt: "2024-01-05T00:00:00.000Z",
            updatedAt: "2024-03-05T00:00:00.000Z",
            sku: "AFR-005",
          },
          {
            id: "6",
            name: "Copper Bangle Set",
            description: "Set of traditional copper bangles",
            price: 29.99,
            image: "/placeholder-product.jpg",
            categoryId: "5",
            categoryName: "Jewelry",
            vendorId: selectedVendor?.id || "vendor1",
            vendorName: selectedVendor?.businessName || "Kente Galleria",
            rating: 4.3,
            reviews: 45,
            status: "rejected",
            stockQuantity: 8,
            sales: 95,
            revenue: 2849.05,
            orders: 8,
            createdAt: "2023-12-15T00:00:00.000Z",
            updatedAt: "2024-01-15T00:00:00.000Z",
            sku: "AFR-006",
          },
        ];

        setVendorProducts(mockProducts);
      } catch (error) {
        console.error("Failed to fetch vendor data:", error);
      }
    };

    fetchData();
  }, [getVendor, selectedVendor?.id]);

  // Calculate vendor-specific stats
  const stats: ProductStats = {
    totalProducts: vendorProducts.length,
    activeProducts: vendorProducts.filter(p => p.status === "active").length,
    pendingApproval: vendorProducts.filter(p => p.status === "pending").length,
    unpublishedProducts: vendorProducts.filter(p => p.status === "unpublished").length,
    totalSales: vendorProducts.reduce((sum, p) => sum + p.sales, 0),
    averageRating: vendorProducts.length > 0
      ? Number((vendorProducts.reduce((sum, p) => sum + p.rating, 0) / vendorProducts.length).toFixed(1))
      : 0,
    totalRevenue: vendorProducts.reduce((sum, p) => sum + p.revenue, 0),
    lowStockProducts: vendorProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length,
    outOfStockProducts: vendorProducts.filter(p => p.stockQuantity === 0).length,
  };

  // Create stats cards in the same format as admin
  const statsCards: CardData[] = [
    {
      title: "Total products",
      value: stats.totalProducts.toString(),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
    {
      title: "Pending approval",
      value: stats.pendingApproval.toString(),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
    {
      title: "Active products",
      value: stats.activeProducts.toString(),
      change: {
        trend: "down",
        value: "5%",
        description: "",
      },
    },
    {
      title: "Unpublished",
      value: stats.unpublishedProducts.toString(),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
  ];

  // Status options for filter dropdown
  const statusOptions: { value: string; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending approval" },
    { value: "unpublished", label: "Unpublished" },
    { value: "draft", label: "Draft" },
    { value: "rejected", label: "Rejected" },
  ];

  const handleStatusFilterChange = (status: string) => {
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

  // Filter products based on search, tab, and status filters
  const filteredProducts = vendorProducts.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && product.status === "pending") ||
      (activeTab === "active" && product.status === "active") ||
      (activeTab === "draft" && product.status === "draft") ||
      (activeTab === "unpublished" && product.status === "unpublished") ||
      (activeTab === "rejected" && product.status === "rejected");

    const matchesStatusFilter =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(product.status);

    return matchesSearch && matchesTab && matchesStatusFilter;
  });

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // const formatAmount = (amount: number): string => {
  //   return `$${amount.toFixed(2)}`;
  // };

  const handleDeleteProduct = (product: VendorProduct) => {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      console.log("Delete product:", product.id);
      setVendorProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  // Table fields matching admin layout
  const productFields: TableField<VendorProduct>[] = [
    {
      key: "image",
      header: "Product name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-md">
            <AvatarImage src={row.image} alt={row.name} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground font-medium rounded-md">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium text-md">{row.name}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.sku || "N/A"}
            </p>
          </div>
        </div>
      ),
      align: "left",
    },
    {
      key: "categoryName",
      header: "Category",
      cell: (value) => (
        <span className="font-medium">{value as string}</span>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "price",
      header: "Price (USD)",
      cell: (_, row) => (
        <div className="text-center">
          {row.originalPrice ? (
            <>
              <span className="line-through text-gray-400">${row.originalPrice.toFixed(2)}</span>
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
      key: "orders",
      header: "Orders",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (value) => {
        const statusConfig: Record<string, {
          label: string;
          className: string;
        }> = {
          active: {
            label: "Active",
            className: "bg-teal-50 text-teal-700 border-teal-200",
          },
          pending: {
            label: "Pending approval",
            className: "bg-yellow-50 text-yellow-700 border-yellow-200",
          },
          unpublished: {
            label: "Unpublished",
            className: "bg-blue-50 text-blue-700 border-blue-200",
          },
          draft: {
            label: "Draft",
            className: "bg-gray-50 text-gray-700 border-gray-200",
          },
          rejected: {
            label: "Rejected",
            className: "bg-red-50 text-red-700 border-red-200",
          },
        };

        const config = statusConfig[value as string] || statusConfig.draft;

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

  const productActions: TableAction<VendorProduct>[] = [
    {
      type: "view",
      label: "View Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (product) => {
        navigate(`/vendor/products/${product.id}/view`);
      },
    },
    {
      type: "edit",
      label: "Edit Product",
      icon: <PenIcon className="size-5" />,
      onClick: (product) => {
        navigate(`/vendor/products/${product.id}/edit`);
      },
    },
    {
      type: "delete",
      label: "Delete Product",
      icon: <Trash2Icon className="size-5" />,
      onClick: (product) => {
        handleDeleteProduct(product);
      },
    },
  ];

  const handleTabClick = (tab: ProductStatus) => {
    setActiveTab(tab);
    // Clear status filters when switching tabs
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: ProductStatus) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";
    
    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }
    
    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader
        label="Products"
       />
      <div className="p-6 space-y-6">
    

        {/* Stats Cards */}
        <SectionCards cards={statsCards} layout="1x4" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all products on the platform
                </p>
              </div>
              <Button
                  variant="default"
                  className="text-white"
                  onClick={() => navigate("/vendor/products/add")}
                >
                  <Plus className="h-4 w-4 mr-2" /> Upload a Product
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-96">
                <Search
                  placeholder="Search"
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
                    className={`px-4 py-2 text-sm font-medium ${dateRange === "last-7-days" ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"} rounded-l-lg`}
                    onClick={() => setDateRange("last-7-days")}
                  >
                    Last 7 days
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm ${dateRange === "last-30-days" ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"}`}
                    onClick={() => setDateRange("last-30-days")}
                  >
                    Last 30 days
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm ${dateRange === "all-time" ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"} rounded-r-lg`}
                    onClick={() => setDateRange("all-time")}
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
                      <FilterIcon className="w-4 h-4" />
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
                      >
                        {status.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export Button */}
                <Button variant="outline" className="gap-2 h-10">
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
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 px-6 overflow-x-auto">
              <button 
                className={getTabButtonClass("all")}
                onClick={() => handleTabClick("all")}
              >
                All Products
              </button>
              <button 
                className={getTabButtonClass("active")}
                onClick={() => handleTabClick("active")}
              >
                Active
              </button>
              <button 
                className={getTabButtonClass("pending")}
                onClick={() => handleTabClick("pending")}
              >
                Pending approval
              </button>
              <button 
                className={getTabButtonClass("draft")}
                onClick={() => handleTabClick("draft")}
              >
                Drafts
              </button>
              <button 
                className={getTabButtonClass("unpublished")}
                onClick={() => handleTabClick("unpublished")}
              >
                Unpublished
              </button>
              <button 
                className={getTabButtonClass("rejected")}
                onClick={() => handleTabClick("rejected")}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6"/>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Products Found
                </h3>
                
              </div>
            ) : (
              <DataTable<VendorProduct>
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