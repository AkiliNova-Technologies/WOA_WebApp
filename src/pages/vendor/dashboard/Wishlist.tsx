import { useState } from "react";
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
import { ListFilter, Download, MoreHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";

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

interface WishlistStats {
  totalWishlistedProducts: number;
  wishlistToCart: string;
  wishlistAbandonment: string;
  totalWishlistedChange?: { trend: "up" | "down"; value: string };
  wishlistToCartChange?: { trend: "up" | "down"; value: string };
  wishlistAbandonmentChange?: { trend: "up" | "down"; value: string };
}

export default function VendorWishlistPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<WishlistStatus[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<WishlistTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  // Mock wishlist data
  const mockWishlists: WishlistData[] = [
    {
      id: "1",
      productName: "African made sandals",
      category: "Fashion & Apparel",
      basePrice: 20,
      wishlists: 10,
      status: "in-stock",
      image: "/products/sandals.jpg",
      description: "Handcrafted African sandals made with premium materials",
      totalViews: 150,
      conversionRate: 12,
      dateAdded: "7 Jan 2025",
    },
    {
      id: "2",
      productName: "Hand-crafted leather bag",
      category: "Fashion & Apparel",
      basePrice: 45,
      wishlists: 10,
      status: "limited-stock",
      image: "/products/leather-bag.jpg",
      description: "Premium handcrafted leather bag with elegant design",
      totalViews: 200,
      conversionRate: 15,
      dateAdded: "14 Feb 2025",
    },
    {
      id: "3",
      productName: "Eco-friendly Jewerly",
      category: "Home Decor",
      basePrice: 13,
      wishlists: 10,
      status: "out-of-stock",
      image: "/products/jewelry.jpg",
      description: "Sustainable and eco-friendly jewelry collection",
      totalViews: 120,
      conversionRate: 8,
      dateAdded: "21 Mar 2025",
    },
    {
      id: "4",
      productName: "Artisan beaded necklace",
      category: "Jewelry & Accessories",
      basePrice: 400,
      wishlists: 10,
      status: "suspended",
      image: "/products/necklace.jpg",
      description: "Artisan crafted beaded necklace with traditional patterns",
      totalViews: 90,
      conversionRate: 5,
      dateAdded: "28 Apr 2025",
    },
    {
      id: "5",
      productName: "Traditional woven baskets",
      category: "Home Decor",
      basePrice: 25,
      wishlists: 8,
      status: "in-stock",
      image: "/products/baskets.jpg",
      description: "Handwoven traditional baskets for storage and decoration",
      totalViews: 180,
      conversionRate: 10,
      dateAdded: "5 May 2025",
    },
    {
      id: "6",
      productName: "Kente cloth scarves",
      category: "Fashion & Apparel",
      basePrice: 30,
      wishlists: 12,
      status: "in-stock",
      image: "/products/kente.jpg",
      description: "Authentic Kente cloth scarves with vibrant colors",
      totalViews: 220,
      conversionRate: 18,
      dateAdded: "12 Jun 2025",
    },
    {
      id: "7",
      productName: "Carved wooden masks",
      category: "Home Decor",
      basePrice: 100,
      wishlists: 6,
      status: "limited-stock",
      image: "/products/masks.jpg",
      description: "Hand-carved wooden masks with cultural significance",
      totalViews: 95,
      conversionRate: 6,
      dateAdded: "19 Jul 2025",
    },
    {
      id: "8",
      productName: "Batik fabric",
      category: "Fashion & Apparel",
      basePrice: 35,
      wishlists: 9,
      status: "in-stock",
      image: "/products/batik.jpg",
      description: "Beautiful batik fabric with intricate patterns",
      totalViews: 165,
      conversionRate: 14,
      dateAdded: "26 Aug 2025",
    },
  ];

  const [wishlists] = useState<WishlistData[]>(mockWishlists);

  // Calculate statistics
  const calculateStats = (): WishlistStats => {
    const totalWishlistedProducts = wishlists.length;
    const wishlistToCart = "12%";
    const wishlistAbandonment = "27%";

    return {
      totalWishlistedProducts,
      wishlistToCart,
      wishlistAbandonment,
      totalWishlistedChange: { trend: "up", value: "10%" },
      wishlistToCartChange: { trend: "up", value: "10%" },
      wishlistAbandonmentChange: { trend: "up", value: "5%" },
    };
  };

  const stats = calculateStats();

  // Filter wishlists based on tab, search, and status filters
  const filteredWishlists = wishlists.filter((item) => {
    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in-stock" && item.status === "in-stock") ||
      (activeTab === "limited-stock" && item.status === "limited-stock") ||
      (activeTab === "out-of-stock" && item.status === "out-of-stock") ||
      (activeTab === "suspended" && item.status === "suspended");

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    return matchesTab && matchesSearch && matchesStatus;
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

  // Wishlist cards
  const wishlistCards: CardData[] = [
    {
      title: "Total wishlisted products",
      value: stats.totalWishlistedProducts.toString(),
      change: stats.totalWishlistedChange && {
        trend: stats.totalWishlistedChange.trend,
        value: stats.totalWishlistedChange.value,
        description: "",
      },
    },
    {
      title: "Wishlist to Cart",
      value: stats.wishlistToCart,
      change: stats.wishlistToCartChange && {
        trend: stats.wishlistToCartChange.trend,
        value: stats.wishlistToCartChange.value,
        description: "",
      },
    },
    {
      title: "Wishlist Abandonment",
      value: stats.wishlistAbandonment,
      change: stats.wishlistAbandonmentChange && {
        trend: stats.wishlistAbandonmentChange.trend,
        value: stats.wishlistAbandonmentChange.value,
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
      cell: (value) => <span>{value as number}</span>,
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

                {/* Wishlists Table/Empty State */}
                <div className="px-6 pb-6">
                  {filteredWishlists.length > 0 ? (
                    <DataTable<WishlistData>
                      data={filteredWishlists}
                      fields={wishlistFields}
                      actions={wishlistActions}
                      enableSelection={true}
                      enablePagination={true}
                      pageSize={10}
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
