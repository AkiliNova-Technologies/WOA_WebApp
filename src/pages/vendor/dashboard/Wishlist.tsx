import { useState, useEffect } from "react";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Search } from "@/components/ui/search";
import { ListFilter, Download, MoreHorizontal, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";
import { useReduxWishlist, type VendorWishlistProduct } from "@/hooks/useReduxWishlists";
import { useReduxAuth } from "@/hooks/useReduxAuth";

type WishlistStatus =
  | "in-stock"
  | "limited-stock"
  | "out-of-stock"
  | "suspended";
type WishlistTab =
  | "all"
  | "in-stock"
  | "limited-stock"
  | "out-of-stock"
  | "suspended";
type DateRange = "last-7-days" | "last-30-days" | "all-time";

// Display format for table
interface WishlistData {
  id: string;
  productName: string;
  category: string;
  basePrice: number;
  wishlists: number;
  status: WishlistStatus;
  image?: string;
  description?: string;
  totalViews?: number;
  conversionRate?: number;
  dateAdded?: string;
  [key: string]: any;
}

export default function VendorWishlistPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<WishlistStatus[]>([]);
  const [activeTab, setActiveTab] = useState<WishlistTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  
  const { user } = useReduxAuth();
  const vendorId = user?.id || "";

  // Redux hooks
  const {
    vendorStats,
    vendorProducts,
    vendorPagination,
    vendorLoading,
    vendorError,
    getVendorWishlist,
    clearVendorWishlistError,
  } = useReduxWishlist();

  // Fetch vendor wishlist on mount and when filters change
  useEffect(() => {
    if (vendorId) {
      const params: {
        search?: string;
        status?: WishlistStatus;
        startDate?: string;
        endDate?: string;
        page?: number;
      } = {};

      if (searchQuery) {
        params.search = searchQuery;
      }

      // Calculate date range
      if (dateRange !== "all-time") {
        const endDate = new Date();
        const startDate = new Date();
        if (dateRange === "last-7-days") {
          startDate.setDate(startDate.getDate() - 7);
        } else if (dateRange === "last-30-days") {
          startDate.setDate(startDate.getDate() - 30);
        }
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }

      getVendorWishlist(vendorId, params);
    }
  }, [vendorId, searchQuery, dateRange, getVendorWishlist]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      clearVendorWishlistError();
    };
  }, [clearVendorWishlistError]);

  // Transform vendor wishlist products to display format
  const transformedWishlists: WishlistData[] = vendorProducts.map((product: VendorWishlistProduct) => ({
    id: product.id,
    productName: product.productName,
    category: product.category,
    basePrice: product.basePrice,
    wishlists: product.wishlists,
    status: product.status,
    image: product.image,
    description: product.description,
    totalViews: product.totalViews,
    conversionRate: product.conversionRate,
    dateAdded: product.dateAdded
      ? new Date(product.dateAdded).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : undefined,
  }));

  // Filter wishlists based on tab and status filters (client-side filtering for tabs)
  const filteredWishlists = transformedWishlists.filter((item) => {
    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in-stock" && item.status === "in-stock") ||
      (activeTab === "limited-stock" && item.status === "limited-stock") ||
      (activeTab === "out-of-stock" && item.status === "out-of-stock") ||
      (activeTab === "suspended" && item.status === "suspended");

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    return matchesTab && matchesStatus;
  });

  const handleStatusFilterChange = (status: WishlistStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTabClick = (tab: WishlistTab) => {
    setActiveTab(tab);
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: WishlistTab) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";

    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  // Wishlist cards using vendorStats from API
  const wishlistCards: CardData[] = [
    {
      title: "Total wishlisted products",
      value: vendorStats?.totalWishlistedProducts?.toString() || "0",
      change: vendorStats?.totalWishlistedChange && {
        trend: vendorStats.totalWishlistedChange.trend,
        value: vendorStats.totalWishlistedChange.value,
        description: "",
      },
    },
    {
      title: "Wishlist to Cart",
      value: vendorStats?.wishlistToCartPct || "0%",
      change: vendorStats?.wishlistToCartChange && {
        trend: vendorStats.wishlistToCartChange.trend,
        value: vendorStats.wishlistToCartChange.value,
        description: "",
      },
    },
    {
      title: "Wishlist Abandonment",
      value: vendorStats?.wishlistAbandonmentPct || "0%",
      change: vendorStats?.wishlistAbandonmentChange && {
        trend: vendorStats.wishlistAbandonmentChange.trend,
        value: vendorStats.wishlistAbandonmentChange.value,
        description: "",
      },
    },
  ];

  // Status options for filter
  const statusOptions: { value: WishlistStatus; label: string }[] = [
    { value: "in-stock", label: "In stock" },
    { value: "limited-stock", label: "Limited stock" },
    { value: "out-of-stock", label: "Out of stock" },
    { value: "suspended", label: "Suspended" },
  ];

  // Status configuration
  const statusConfig = {
    "in-stock": {
      label: "In stock",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    "limited-stock": {
      label: "Limited stock",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    "out-of-stock": {
      label: "Out of stock",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    suspended: {
      label: "Suspended",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  // Table fields
  const wishlistFields: TableField<WishlistData>[] = [
    {
      key: "productName",
      header: "Product name",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            {row.image ? (
              <img
                src={row.image}
                alt={value as string}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <span className="font-semibold">{value as string}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (value) => <span>{value as string}</span>,
      align: "left",
    },
    {
      key: "basePrice",
      header: "Base Price (USD)",
      cell: (value) => <span>${(value as number).toFixed(2)}</span>,
      align: "center",
    },
    {
      key: "wishlists",
      header: "Wishlists",
      cell: (value) => <span>{value as number}</span>,
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status];
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

  const wishlistActions: TableAction<WishlistData>[] = [
    {
      type: "custom",
      label: "Actions",
      icon: <MoreHorizontal className="size-5" />,
      onClick: (wishlistItem) => {
        navigate(`/vendor/wishlist/${wishlistItem.id}/details`);
      },
    },
  ];

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No wishlists" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No wishlisted products</h3>
    </div>
  );

  // Loading state
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      <p className="mt-4 text-gray-500">Loading wishlists...</p>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="Error" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-red-600">
        Failed to load wishlists
      </h3>
      <p className="text-gray-500 mb-4">{vendorError}</p>
      <Button onClick={() => getVendorWishlist(vendorId)}>Retry</Button>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 px-6">
            <SectionCards cards={wishlistCards} layout="1x3" />

            <div className="space-y-6">
              {/* Wishlists Section */}
              <div className="rounded-lg border bg-white dark:bg-[#303030]">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">All Wishlists</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Manage and monitor all wishlisted products on the
                        platform
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="w-full sm:w-96">
                    <Search
                      placeholder="Search"
                      value={searchQuery}
                      onSearchChange={setSearchQuery}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex flex-row items-center gap-3">
                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#404040]">
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          dateRange === "last-7-days"
                            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                        } rounded-l-lg`}
                        onClick={() => setDateRange("last-7-days")}
                      >
                        Last 7 days
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          dateRange === "last-30-days"
                            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                        }`}
                        onClick={() => setDateRange("last-30-days")}
                      >
                        Last 30 days
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          dateRange === "all-time"
                            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                        } rounded-r-lg`}
                        onClick={() => setDateRange("all-time")}
                      >
                        All time
                      </button>
                    </div>

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <ListFilter className="w-4 h-4" />
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
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>

                    {/* Clear Filters */}
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

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-0 px-6 overflow-x-auto">
                    <button
                      className={getTabButtonClass("all")}
                      onClick={() => handleTabClick("all")}
                    >
                      All Wishlists
                    </button>
                    <button
                      className={getTabButtonClass("in-stock")}
                      onClick={() => handleTabClick("in-stock")}
                    >
                      In stock
                    </button>
                    <button
                      className={getTabButtonClass("limited-stock")}
                      onClick={() => handleTabClick("limited-stock")}
                    >
                      Limited stock
                    </button>
                    <button
                      className={getTabButtonClass("out-of-stock")}
                      onClick={() => handleTabClick("out-of-stock")}
                    >
                      Out of stock
                    </button>
                    <button
                      className={getTabButtonClass("suspended")}
                      onClick={() => handleTabClick("suspended")}
                    >
                      Suspended
                    </button>
                  </div>
                </div>

                {/* Wishlists Table/Loading/Error/Empty State */}
                <div className="px-6 pb-6">
                  {vendorLoading ? (
                    <LoadingState />
                  ) : vendorError ? (
                    <ErrorState />
                  ) : filteredWishlists.length > 0 ? (
                    <DataTable<WishlistData>
                      data={filteredWishlists}
                      fields={wishlistFields}
                      actions={wishlistActions}
                      enableSelection={true}
                      enablePagination={true}
                      pageSize={vendorPagination?.pageSize || 10}
                    />
                  ) : (
                    <EmptyState />
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