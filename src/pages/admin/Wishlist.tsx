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
import { Filter, Download } from "lucide-react";
import { Eye } from "lucide-react";
import { useReduxWishlist } from "@/hooks/useReduxWishlists";
import type { AdminWishlistProduct } from "@/redux/slices/wishlistSlice";
import images from "@/assets/images";

type WishlistStatus =
  | "in-stock"
  | "limited-stock"
  | "out-of-stock"
  | "suspended";
type TabFilter =
  | "all"
  | "in-stock"
  | "limited-stock"
  | "out-of-stock"
  | "suspended";

interface WishlistItemWithId extends AdminWishlistProduct {
  id: string;
  status: WishlistStatus;
  [key: string]: any;
}

export default function AdminWishlistPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<WishlistStatus[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    adminStats,
    adminProducts,
    adminPagination,
    adminLoading,
    getAdminWishlist,
  } = useReduxWishlist();

  useEffect(() => {
    const params = {
      search: searchQuery || undefined,
      page: currentPage,
    };
    getAdminWishlist(params);
  }, [searchQuery, currentPage, getAdminWishlist]);

  const statusOptions: { value: WishlistStatus; label: string }[] = [
    { value: "in-stock", label: "In stock" },
    { value: "limited-stock", label: "Limited stock" },
    { value: "out-of-stock", label: "Out of stock" },
    { value: "suspended", label: "Suspended" },
  ];

  const handleStatusFilterChange = (status: WishlistStatus) => {
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
    setCurrentPage(1);
  };

  // Transform admin products to include status based on stock
  const transformAdminProduct = (
    product: AdminWishlistProduct
  ): WishlistItemWithId => {
    let status: WishlistStatus;

    if (product.stock === 0) {
      status = "out-of-stock";
    } else if (product.stock <= 10) {
      status = "limited-stock";
    } else {
      status = "in-stock";
    }

    return {
      ...product,
      id: product.productId,
      status,
    };
  };

  const tableWishlistItems: WishlistItemWithId[] = adminProducts.map(
    transformAdminProduct
  );

  // Filter wishlist items
  const filteredWishlistItems = tableWishlistItems.filter((item) => {
    const matchesStatusFilter =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    const matchesTabFilter = activeTab === "all" || activeTab === item.status;

    return matchesStatusFilter && matchesTabFilter;
  });

  // Calculate statistics for cards using admin stats
  const statsCards: CardData[] = [
    {
      title: "Total wishlisted products",
      value: adminStats?.totalWishlistItems.toString() || "0",
      change: {
        value: `${adminStats?.wishlistChangePct.toFixed(1) || 0}%`,
        trend: (adminStats?.wishlistChangePct || 0) >= 0 ? "up" : "down",
        description: "vs last month",
      },
    },
    {
      title: "Wishlist to Cart",
      value: adminStats?.totalConversions.toString() || "0",
      change: {
        value: `${Math.abs(adminStats?.conversionsChangePct || 0).toFixed(1)}%`,
        trend: (adminStats?.conversionsChangePct || 0) >= 0 ? "up" : "down",
        description: "vs last month",
      },
    },
    {
      title: "This Month",
      value: adminStats?.thisMonth.wishlistAdds.toString() || "0",
      change: {
        value: `${adminStats?.thisMonth.conversions || 0} conversions`,
        trend: undefined,
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

  const wishlistFields: TableField<WishlistItemWithId>[] = [
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
      cell: (_, row) => (
        <div>
          <span className="font-medium block">{row.category.name}</span>
          {/* {row.subcategory && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {row.subcategory.name}
            </span>
          )} */}
        </div>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "wishlistCount",
      header: "Wishlists",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "stock",
      header: "Stock",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
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
          suspended: {
            label: "Suspended",
            className: "bg-gray-100 text-gray-700 border-gray-300",
          },
        };

        const config = statusConfig[row.status] || statusConfig.suspended;

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
    {
      key: "lastWishlistedAt",
      header: "Last Wishlisted",
      cell: (value) => {
        const date = new Date(value as string);
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
      align: "center",
      enableSorting: true,
    },
  ];

  const wishlistActions: TableAction<WishlistItemWithId>[] = [
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader label="Wishlist Management" />
      <div className="p-6 space-y-6">
        <SectionCards cards={statsCards} layout="1x3" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  All Wishlists
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all wishlisted products on the platform
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-96">
                <Search
                  placeholder="Search by product name"
                  value={searchQuery}
                  onSearchChange={handleSearchChange}
                  className="h-10"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#404040]">
                  <button className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050] rounded-l-lg">
                    Last 7 days
                  </button>
                  <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]">
                    Last 30 days
                  </button>
                  <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848] rounded-r-lg">
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

                <Button variant="outline" className="gap-2 h-10">
                  <Download className="w-4 h-4" />
                  Export
                </Button>

                {(selectedStatuses.length > 0 ||
                  searchQuery ||
                  activeTab !== "all") && (
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
                All Wishlists
              </button>
              <button
                className={getTabButtonClass("in-stock")}
                onClick={() => handleTabClick("in-stock")}
              >
                In Stock
              </button>
              <button
                className={getTabButtonClass("limited-stock")}
                onClick={() => handleTabClick("limited-stock")}
              >
                Limited Stock
              </button>
              <button
                className={getTabButtonClass("out-of-stock")}
                onClick={() => handleTabClick("out-of-stock")}
              >
                Out of Stock
              </button>
            </div>
          </div>

          <div className="p-6">
            {adminLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Loading wishlist data...
                  </p>
                </div>
              </div>
            ) : filteredWishlistItems.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Wishlist Items Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ||
                  selectedStatuses.length > 0 ||
                  activeTab !== "all"
                    ? "Try adjusting your filters"
                    : "No products have been wishlisted yet."}
                </p>
              </div>
            ) : (
              <DataTable<WishlistItemWithId>
                data={filteredWishlistItems}
                fields={wishlistFields}
                actions={wishlistActions}
                enableSelection={true}
                enablePagination={true}
                pageSize={adminPagination?.pageSize || 25}
              />
            )}
          </div>

          {/* {adminPagination && adminPagination.total > 1 && (
            <div className="px-6 pb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing page {adminPagination.page} of {adminPagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= adminPagination.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
