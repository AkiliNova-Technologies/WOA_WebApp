import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Filter, Download, Eye, Loader2 } from "lucide-react";
import { useReduxCart } from "@/hooks/useReduxCart";
import images from "@/assets/images";
import { toast } from "sonner";

type CartStatus = "in-stock" | "limited-stock" | "out-of-stock" | "suspended";
type TabFilter = "all" | "in-stock" | "limited-stock" | "out-of-stock" | "suspended";

// Extended interface for table display
interface CartItemForTable {
  id: string; // Required for DataTable - will use cartItemId
  cartItemId: string;
  cartId: string;
  clientId: string | null;
  vendorId: string;
  productId: string;
  quantity: number;
  price: number;
  salePrice?: number;
  addedAt: string;
  productName: string;
  variantName: string | null;
  sku: string;
  stock: number;
  status: CartStatus;
  cartsCount: number;
  [key: string]: any;
}

// Helper to determine stock status
const getStockStatus = (stock: number): CartStatus => {
  if (stock === 0) return "out-of-stock";
  if (stock <= 5) return "limited-stock";
  return "in-stock";
};

export default function AdminCartPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CartStatus[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [dateFilter, setDateFilter] = useState<"7days" | "30days" | "all">("7days");

  const {
    adminCartItems,
    adminLoading,
    adminError,
    getAllAdminCartItems,
  } = useReduxCart();

  // Fetch admin cart items on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllAdminCartItems();
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
        toast.error("Failed to load cart items");
      }
    };
    
    fetchData();
  }, [getAllAdminCartItems]);

  const statusOptions: { value: CartStatus; label: string }[] = [
    { value: "in-stock", label: "In stock" },
    { value: "limited-stock", label: "Limited stock" },
    { value: "out-of-stock", label: "Out of stock" },
    { value: "suspended", label: "Suspended" },
  ];

  const handleStatusFilterChange = (status: CartStatus) => {
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

  // Transform admin cart items for table display
  const tableCartItems: CartItemForTable[] = useMemo(() => {
    return adminCartItems.map((item: any) => {
      // Get stock from variant or default to 0
      const stock = item.variant?.stockQuantity ?? 0;
      
      // Get price - use priceAtAdd, variant price, or product basePrice
      const price = item.priceAtAdd ?? item.variant?.price ?? item.product?.basePrice ?? 0;
      const comparePrice = item.compareAtPriceAtAdd ?? item.variant?.compareAtPrice ?? item.product?.baseCompareAtPrice;
      
      // If there's a compare price that's higher than price, it's on sale
      const salePrice = comparePrice && comparePrice > price ? price : undefined;
      const displayPrice = comparePrice && comparePrice > price ? comparePrice : price;
      
      return {
        id: item.cartItemId, // Use cartItemId as the unique id for DataTable
        cartItemId: item.cartItemId,
        cartId: item.cartId,
        clientId: item.clientId,
        vendorId: item.vendorId,
        productId: item.product?.id || '',
        quantity: item.quantity,
        price: displayPrice,
        salePrice: salePrice,
        addedAt: item.createdAt,
        productName: item.productNameSnapshot || item.product?.name || 'Unknown Product',
        variantName: item.variantNameSnapshot || item.variant?.name || null,
        sku: item.variant?.sku || 'N/A',
        stock: stock,
        status: getStockStatus(stock),
        cartsCount: 1, // This would come from API aggregation ideally
      };
    });
  }, [adminCartItems]);

  // Filter cart items
  const filteredCartItems = useMemo(() => {
    return tableCartItems.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.variantName && item.variantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatusFilter =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(item.status);

      const matchesTabFilter = 
        activeTab === "all" ||
        activeTab === item.status;

      // Date filter
      let matchesDateFilter = true;
      if (dateFilter !== "all" && item.addedAt) {
        const itemDate = new Date(item.addedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === "7days") {
          matchesDateFilter = daysDiff <= 7;
        } else if (dateFilter === "30days") {
          matchesDateFilter = daysDiff <= 30;
        }
      }

      return matchesSearch && matchesStatusFilter && matchesTabFilter && matchesDateFilter;
    });
  }, [tableCartItems, searchQuery, selectedStatuses, activeTab, dateFilter]);

  // Calculate statistics for cards
  const stats = useMemo(() => {
    const totalItems = tableCartItems.length;
    const inStockItems = tableCartItems.filter(item => item.status === "in-stock").length;
    const limitedStockItems = tableCartItems.filter(item => item.status === "limited-stock").length;
    const outOfStockItems = tableCartItems.filter(item => item.status === "out-of-stock").length;
    
    // Calculate gross revenue from table items
    const grossRevenue = tableCartItems.reduce((sum, item) => {
      const price = item.salePrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
    
    const cartToPurchaseRate = totalItems > 0 
      ? Math.round((inStockItems / totalItems) * 100)
      : 0;
      
    const cartAbandonmentRate = totalItems > 0 
      ? Math.round(((limitedStockItems + outOfStockItems) / totalItems) * 100)
      : 0;

    return {
      totalItems,
      inStockItems,
      limitedStockItems,
      outOfStockItems,
      grossRevenue,
      cartToPurchaseRate,
      cartAbandonmentRate,
    };
  }, [tableCartItems]);

  const formatNumberShort = (num: number): string => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}k`;
    }
    return `$${num.toFixed(2)}`;
  };

  const statsCards: CardData[] = [
    {
      title: "Total products on cart",
      value: stats.totalItems.toString(),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Cart to purchase",
      value: `${stats.cartToPurchaseRate}%`,
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Cart Abandonment",
      value: `${stats.cartAbandonmentRate}%`,
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Gross Revenue on cart",
      value: formatNumberShort(stats.grossRevenue),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
  ];

  const handleViewProduct = (productId: string) => {
    navigate(`/admin/products/${productId}/details`);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const cartFields: TableField<CartItemForTable>[] = [
    {
      key: "productName",
      header: "Product name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-md">
            <AvatarFallback className="bg-muted text-muted-foreground font-medium rounded-md">
              {getInitials(row.productName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium text-md">{row.productName}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              SKU: {row.sku} {row.variantName && `• ${row.variantName}`}
            </p>
          </div>
        </div>
      ),
      align: "left",
    },
    {
      key: "stock",
      header: "Stock",
      cell: (value) => (
        <span className="font-medium">{value as number}</span>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "price",
      header: "Price (USD)",
      cell: (_, row) => (
        <div className="text-center">
          {row.salePrice ? (
            <>
              <span className="line-through text-gray-400">${row.price.toFixed(2)}</span>
              <span className="ml-2 font-medium text-green-600">${row.salePrice.toFixed(2)}</span>
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
      key: "quantity",
      header: "Quantity",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "cartsCount",
      header: "Carts",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (value) => {
        const statusConfig = {
          "in-stock": {
            label: "In stock",
            className: "bg-teal-50 text-teal-700 border-teal-200",
          },
          "limited-stock": {
            label: "Limited stock",
            className: "bg-yellow-50 text-yellow-700 border-yellow-200",
          },
          "out-of-stock": {
            label: "Out of stock",
            className: "bg-red-50 text-red-700 border-red-200",
          },
          "suspended": {
            label: "Suspended",
            className: "bg-gray-100 text-gray-700 border-gray-300",
          },
        };

        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig["out-of-stock"];

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

  const cartActions: TableAction<CartItemForTable>[] = [
    {
      type: "view",
      label: "View Product",
      icon: <Eye className="size-5" />,
      onClick: (item) => {
        handleViewProduct(item.productId);
      },
    },
  ];

  const handleTabClick = (tab: TabFilter) => {
    setActiveTab(tab);
    // Clear status filters when switching tabs (optional)
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

  const getTabCount = (tab: TabFilter): number => {
    if (tab === "all") return tableCartItems.length;
    return tableCartItems.filter(item => item.status === tab).length;
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality coming soon");
  };

  // Show error state
  if (adminError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
        <SiteHeader label="Cart Management" />
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">Error loading cart items: {adminError}</p>
            <Button onClick={() => getAllAdminCartItems()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader label="Cart Management" />
      <div className="p-6 space-y-6">
        <SectionCards cards={statsCards} layout="1x4" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Carts</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all products on cart on the platform
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-96">
                <Search
                  placeholder="Search by product, vendor, or category..."
                  value={searchQuery}
                  onSearchChange={setSearchQuery}
                  className="h-10"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#404040]">
                  <button 
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                      dateFilter === "7days" 
                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                    }`}
                    onClick={() => setDateFilter("7days")}
                  >
                    Last 7 days
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm ${
                      dateFilter === "30days" 
                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                    }`}
                    onClick={() => setDateFilter("30days")}
                  >
                    Last 30 days
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm rounded-r-lg ${
                      dateFilter === "all" 
                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                    }`}
                    onClick={() => setDateFilter("all")}
                  >
                    All time
                  </button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-10"
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
                      >
                        {status.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" className="gap-2 h-10" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                  Export
                </Button>

                {(selectedStatuses.length > 0 || searchQuery || activeTab !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-sm h-10"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 px-6 overflow-x-auto">
              <button 
                className={getTabButtonClass("all")}
                onClick={() => handleTabClick("all")}
              >
                All Carts ({getTabCount("all")})
              </button>
              <button 
                className={getTabButtonClass("in-stock")}
                onClick={() => handleTabClick("in-stock")}
              >
                In Stock ({getTabCount("in-stock")})
              </button>
              <button 
                className={getTabButtonClass("limited-stock")}
                onClick={() => handleTabClick("limited-stock")}
              >
                Limited Stock ({getTabCount("limited-stock")})
              </button>
              <button 
                className={getTabButtonClass("out-of-stock")}
                onClick={() => handleTabClick("out-of-stock")}
              >
                Out of Stock ({getTabCount("out-of-stock")})
              </button>
              <button 
                className={getTabButtonClass("suspended")}
                onClick={() => handleTabClick("suspended")}
              >
                Suspended ({getTabCount("suspended")})
              </button>
            </div>
          </div>

          <div className="p-6">
            {adminLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-3 text-gray-600">Loading cart items...</span>
              </div>
            ) : filteredCartItems.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6"/>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Cart Items Found
                </h3>
                {tableCartItems.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No products have been added to cart yet.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No items match your current filters. Try adjusting your search or filters.
                  </p>
                )}
              </div>
            ) : (
              <DataTable<CartItemForTable>
                data={filteredCartItems}
                fields={cartFields}
                actions={cartActions}
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