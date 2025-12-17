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
import images from "@/assets/images";

type WishlistStatus = "in-stock" | "limited-stock" | "out-of-stock" | "suspended";
type TabFilter = "all" | "in-stock" | "limited-stock" | "out-of-stock" | "suspended";

interface WishlistItemWithId {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    images: { url: string; isPrimary: boolean }[];
    vendor: { id: string; businessName: string };
    category?: string; // Added category property
  };
  addedAt: string;
  wishlists: number;
  status: WishlistStatus;
  [key: string]: any;
}

export default function AdminWishlistPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<WishlistStatus[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const {
    items,
    getWishlist,
  } = useReduxWishlist();

  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

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
  };

  // Transform wishlist items for table display
  const transformWishlistItemForTable = (item: any, index: number): WishlistItemWithId => ({
    id: item.id || `wishlist-${index}`,
    productId: item.productId || item.product?.id || `product-${index}`,
    product: {
      id: item.product?.id || `product-${index}`,
      name: item.product?.name || "Unknown Product",
      price: item.product?.price || 0,
      salePrice: item.product?.salePrice,
      images: item.product?.images || [],
      vendor: item.product?.vendor || { id: "unknown", businessName: "Unknown Vendor" },
      category: item.product?.category?.name || "Uncategorized", // Fixed category access
    },
    addedAt: item.addedAt || new Date().toISOString(),
    wishlists: 10, // Placeholder
    status: index === 0 ? "in-stock" : 
            index === 1 ? "limited-stock" : 
            index === 2 ? "out-of-stock" : 
            "suspended",
  });

  const tableWishlistItems: WishlistItemWithId[] = items.map(transformWishlistItemForTable);

  // Filter wishlist items
  const filteredWishlistItems = tableWishlistItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.product.category && item.product.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatusFilter =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(item.status);

    const matchesTabFilter = 
      activeTab === "all" ||
      activeTab === item.status;

    return matchesSearch && matchesStatusFilter && matchesTabFilter;
  });

  // Calculate statistics for cards
  const totalItems = items.length;
  const inStockItems = tableWishlistItems.filter(item => item.status === "in-stock").length;
  const limitedStockItems = tableWishlistItems.filter(item => item.status === "limited-stock").length;
  
  const wishlistToCartRate = totalItems > 0 
    ? Math.round((inStockItems / totalItems) * 100).toString()
    : "0";
    
  const wishlistAbandonmentRate = totalItems > 0 
    ? Math.round((limitedStockItems / totalItems) * 100).toString()
    : "0";

  const statsCards: CardData[] = [
    {
      title: "Total wishlisted products",
      value: totalItems.toString(),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Wishlist to Cart",
      value: `${wishlistToCartRate}%`,
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Wishlist Abandonment",
      value: `${wishlistAbandonmentRate}%`,
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
  ];

  const handleViewProduct = (productId: string) => {
    if (window.confirm("View product details?")) {
      navigate(`/admin/products/${productId}/details`);
    }
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
              src={row.product.images.find(img => img.isPrimary)?.url || row.product.images[0]?.url} 
              alt={row.product.name} 
              className="object-cover" 
            />
            <AvatarFallback className="bg-muted text-muted-foreground font-medium rounded-md">
              {getInitials(row.product.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium text-md">{row.product.name}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.product.vendor.businessName}
            </p>
          </div>
        </div>
      ),
      align: "left",
    },
    {
      key: "category",
      header: "Category",
      cell: (_, row) => <span className="font-medium">{row.product.category || "Uncategorized"}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "price",
      header: "Price (USD)",
      cell: (_, row) => (
        <div className="text-center">
          {row.product.salePrice ? (
            <>
              <span className="line-through text-gray-400">${row.product.price.toFixed(2)}</span>
              <span className="ml-2 font-medium text-green-600">${row.product.salePrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="font-medium">${row.product.price.toFixed(2)}</span>
          )}
        </div>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "wishlists",
      header: "Wishlists",
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

        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.suspended;

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader
        label="Wishlist Management"
      />
      <div className="p-6 space-y-6">
        <SectionCards cards={statsCards} layout="1x3" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Wishlists</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all wishlisted products on the platform
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-96">
                <Search
                  placeholder="Search"
                  value={searchQuery}
                  onSearchChange={setSearchQuery}
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
              <button 
                className={getTabButtonClass("suspended")}
                onClick={() => handleTabClick("suspended")}
              >
                Suspended
              </button>
            </div>
          </div>

          <div className="p-6">
            {filteredWishlistItems.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6"/>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Wishlist Items Found
                </h3>
                {items.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No products have been wishlisted yet.
                  </p>
                )}
              </div>
            ) : (
              <DataTable<WishlistItemWithId>
                data={filteredWishlistItems}
                fields={wishlistFields}
                actions={wishlistActions}
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