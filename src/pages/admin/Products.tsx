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
import type {
  Product,
  ProductStatus,
  ProductViewMode,
} from "@/types/product-dashboard";
import { useProducts } from "@/hooks/useProducts";

import {
  EyeIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  PenIcon,
  Plus,
  Package,
  CheckCircle,
  AlertTriangle,
  Archive,
} from "lucide-react";
import { DashboardProductCard } from "@/components/dashboard-product-card";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  archivedProducts: number;
  totalRevenue: number;
}

// Update DashboardProduct to match your existing ProductStatus
interface DashboardProduct {
  id: string;
  image: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  vendor: string;
  status: ProductStatus;
  stockQuantity: number;
  sales: number;
  createdAt: string;
  category?: string;
  revenue?: number;
}

type ProductTab = "all" | "active" | "draft" | "out-of-stock" | "archived";

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ProductViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ProductStatus[]>([]);
  const [activeTab, setActiveTab] = useState<ProductTab>("all");

  // Get both products and categories from the hook
  const { products, getCategoryById } = useProducts();

  // Calculate product statistics based on your actual ProductStatus
  const stats: ProductStats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === "active").length,
    draftProducts: products.filter(p => p.status === "draft").length,
    outOfStockProducts: products.filter(p => p.status === "out-of-stock").length,
    archivedProducts: products.filter(p => p.status === "archived").length,
    totalRevenue: products.reduce((sum, p) => sum + (p.sales || 0) * (p.price || 0), 0),
  };

  // Filter products based on active tab, search, and status filters
  const filteredProducts = products.filter((product) => {
    // Tab filtering
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "active" && product.status === "active") ||
      (activeTab === "draft" && product.status === "draft") ||
      (activeTab === "out-of-stock" && product.status === "out-of-stock") ||
      (activeTab === "archived" && product.status === "archived");

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(product.status);

    return matchesTab && matchesSearch && matchesStatus;
  });

  // Convert Product to DashboardProduct for the card component
  const convertToDashboardProduct = (product: Product): DashboardProduct => {
    const category = getCategoryById(product.categoryId);
    return {
      id: product.id,
      image: product.image,
      name: product.name,
      rating: product.rating,
      reviews: product.reviews,
      price: product.price,
      originalPrice: product.originalPrice,
      vendor: product.vendor,
      status: product.status,
      stockQuantity: product.stockQuantity,
      sales: product.sales,
      createdAt: product.createdAt,
      category: category?.name,
      revenue: (product.sales || 0) * (product.price || 0),
    };
  };

  // Available status options for filter - using your actual ProductStatus
  const statusOptions: { value: ProductStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "out-of-stock", label: "Out of Stock" },
    { value: "archived", label: "Archived" },
  ];

  const handleStatusFilterChange = (status: ProductStatus) => {
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

  // const formatMoneyShort = (amount: number): string => {
  //   if (amount >= 1_000_000) {
  //     return `$${(amount / 1_000_000).toFixed(
  //       amount % 1_000_000 === 0 ? 0 : 1
  //     )}M`;
  //   }
  //   if (amount >= 1_000) {
  //     return `$${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}K`;
  //   }
  //   return `$${amount.toLocaleString()}`;
  // };

  const formatNumberShort = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
  };

  // Updated product cards with your actual status types
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
    },
    {
      title: "Out of Stock",
      value: formatNumberShort(stats.outOfStockProducts),
      rightIcon: <AlertTriangle className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#FFE4C4]",
    },
    {
      title: "Archived Products",
      value: formatNumberShort(stats.archivedProducts),
      rightIcon: <Archive className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#FFC4C4]",
    },
  ];

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Updated function to get category name instead of ID
  const getCategoryDisplay = (product: Product): string => {
    const category = getCategoryById(product.categoryId);
    return category?.name || "Uncategorized";
  };

  // Update the handler functions to use DashboardProduct
  const handleViewProduct = (product: DashboardProduct) => {
    navigate(`/admin/products/${product.id}/view`);
  };

  const handleEditProduct = (product: DashboardProduct) => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleToggleStatus = (product: DashboardProduct) => {
    // Implement status toggle logic for admin
    console.log("Toggle status for:", product.id, product.status);
  };

  // Table fields for list view with requested columns
  const productFields: TableField<Product>[] = [
    {
      key: "image",
      header: "Product",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-24 w-24 rounded-sm">
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
      key: "categoryId",
      header: "Category",
      cell: (_, row) => (
        <span className="font-medium">{getCategoryDisplay(row)}</span>
      ),
      align: "right",
    },
    {
      key: "price",
      header: "Price",
      cell: (value) => (
        <span className="font-medium">{formatAmount(value as number)}</span>
      ),
      align: "right",
    },
    {
      key: "stockQuantity",
      header: "Stock Count",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "right",
    },
    {
      key: "revenue",
      header: "Revenue Generated",
      cell: (_, row) => {
        const revenue = (row.sales || 0) * (row.price || 0);
        return (
          <span className="font-medium text-green-600">
            {formatAmount(revenue)}
          </span>
        );
      },
      align: "right",
    },
    {
      key: "status",
      header: "Status",
      cell: (value) => {
        const statusConfig = {
          active: {
            label: "Active",
            dotColor: "bg-green-500",
            textColor: "text-green-700",
            bgColor: "bg-green-50",
          },
          draft: {
            label: "Draft",
            dotColor: "bg-yellow-500",
            textColor: "text-yellow-700",
            bgColor: "bg-yellow-50",
          },
          "out-of-stock": {
            label: "Out of Stock",
            dotColor: "bg-red-500",
            textColor: "text-red-700",
            bgColor: "bg-red-50",
          },
          archived: {
            label: "Archived",
            dotColor: "bg-gray-500",
            textColor: "text-gray-700",
            bgColor: "bg-gray-50",
          },
        };

        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.draft;

        return (
          <Badge
            variant="outline"
            className="flex flex-row items-center py-2 w-28 gap-2 bg-muted/50"
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

  const productActions: TableAction<Product>[] = [
    {
      type: "view",
      label: "View Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (product) => {
        navigate(`/admin/products/${product.id}/view`);
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

  return (
    <>
      <SiteHeader
        rightActions={
          <Button
            variant={"secondary"}
            className="bg-[#CC5500] text-white h-11 hover:bg-[#CC5500]/80"
            onClick={() => navigate("/admin/products/add-product")}
          >
            <Plus /> Add Product
          </Button>
        }
      />
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
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">
                        All Products
                        <Badge variant="secondary" className="ml-2">
                          {stats.totalProducts}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="active">
                        Active Products
                        <Badge variant="secondary" className="ml-2">
                          {stats.activeProducts}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="draft">
                        Draft Products
                        <Badge variant="secondary" className="ml-2">
                          {stats.draftProducts}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="out-of-stock">
                        Out of Stock
                        <Badge variant="secondary" className="ml-2">
                          {stats.outOfStockProducts}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="archived">
                        Archived Products
                        <Badge variant="secondary" className="ml-2">
                          {stats.archivedProducts}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Search and Filter Section */}
                <div className="px-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="w-full">
                    <Search
                      placeholder="Search products by name, vendor, or category..."
                      value={searchQuery}
                      onSearchChange={setSearchQuery}
                      className="rounded-full flex-1"
                    />
                  </div>

                  <div className="flex flex-row flex-1 items-center gap-4">
                    <div className="flex gap-2 items-center">
                      {/* Status Filter Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 h-10"
                          >
                            <FilterIcon className="w-4 h-4" />
                            Status
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

                    <div className="flex items-center gap-3">
                      {/* View Mode Toggle */}
                      <div className="flex rounded-lg p-1 gap-4">
                        <Button
                          variant={"outline"}
                          onClick={() => setViewMode("grid")}
                          className={cn(
                            "h-11",
                            viewMode === "grid"
                              ? "bg-[#CC5500] hover:bg-[#CC5500]/90 hover:text-white text-white"
                              : ""
                          )}
                        >
                          <GridIcon className="h-4 w-4" />
                          Grid
                        </Button>
                        <Button
                          variant={"outline"}
                          onClick={() => setViewMode("list")}
                          className={cn(
                            "h-11",
                            viewMode === "list"
                              ? "bg-[#CC5500] hover:bg-[#CC5500]/90 hover:text-white text-white"
                              : ""
                          )}
                        >
                          <ListIcon className="h-4 w-4" />
                          List
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Display */}
                <div className="px-6 mt-6">
                  {viewMode === "grid" ? (
                    // Grid View - Convert products to DashboardProduct
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((product) => (
                        <DashboardProductCard
                          key={product.id}
                          product={convertToDashboardProduct(product)}
                          onView={handleViewProduct}
                          onEdit={handleEditProduct}
                          onToggleStatus={handleToggleStatus}
                        />
                      ))}
                    </div>
                  ) : (
                    // List View (DataTable)
                    <DataTable<Product>
                      data={filteredProducts}
                      fields={productFields}
                      actions={productActions}
                      enableSelection={true}
                      enablePagination={true}
                      pageSize={10}
                    />
                  )}

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