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
import { useWishlist } from "@/hooks/useWishlist";
import {
  EyeIcon,
  Heart,
  ShoppingCart,
  Package,
  ListFilter,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

type WishlistStatus = "all" | "in-stock" | "out-of-stock" | "on-sale";

interface WishlistStats {
  totalItems: number;
  itemsInStock: number;
  itemsOutOfStock: number;
  itemsOnSale: number;
  totalValue: number;
  categoriesCount: number;
}

interface WishlistItemWithId {
  id: string;
  productId: string;
  product: any;
  addedAt: string;
  [key: string]: any;
}

export default function AdminWishlistPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<WishlistStatus[]>(
    []
  );

  // Use the wishlist hook
  const {
    wishlistItems,
    wishlistCount,

    wishlistStats,
    getInStockWishlistItems,
    getOutOfStockWishlistItems,
    getOnSaleWishlistItems,
  } = useWishlist();

  // Transform wishlist items to include id for DataTable
  const wishlistItemsWithId: WishlistItemWithId[] = wishlistItems.map(
    (item) => ({
      ...item,
      id: item.productId, // Use productId as the id for the table
    })
  );

  // Calculate wishlist statistics
  const stats: WishlistStats = {
    totalItems: wishlistCount,
    itemsInStock: getInStockWishlistItems().length,
    itemsOutOfStock: getOutOfStockWishlistItems().length,
    itemsOnSale: getOnSaleWishlistItems().length,
    totalValue: wishlistStats.totalValue,
    categoriesCount: wishlistStats.categoriesCount,
  };

  // Filter wishlist items based on search and status filters
  const filteredWishlistItems = wishlistItemsWithId.filter((item) => {
    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.product.tags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Status filtering
    const matchesStatus =
      selectedStatuses.length === 0 ||
      (selectedStatuses.includes("in-stock") && item.product.inStock) ||
      (selectedStatuses.includes("out-of-stock") && !item.product.inStock) ||
      (selectedStatuses.includes("on-sale") && item.product.isOnSale);

    return matchesSearch && matchesStatus;
  });

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
  };

  const formatNumberShort = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Wishlist cards with relevant metrics
  const wishlistCards: CardData[] = [
    {
      title: "Total Products",
      value: formatNumberShort(stats.totalItems),
      rightIcon: <Heart className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#FFE4E4]",
      change: {
        trend: "up",
        value: "8%",
        description: "from last month",
      },
    },
    {
      title: "Wishlist to Cart",
      value: formatNumberShort(stats.itemsInStock),
      rightIcon: <ShoppingCart className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#C4E8D1]",
      change: {
        trend: "up",
        value: "15%",
        description: "items available",
      },
    },
    {
      title: "Out of stock Products",
      value: formatAmount(stats.totalValue),
      rightIcon: <Package className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#D7FFC3]",
      change: {
        trend: "up",
        value: "12%",
        description: "from last month",
      },
    },
  ];

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // Helper function to get category name (you might need to adjust this based on your data structure)
  const getCategoryName = (categoryId: string): string => {
    const categories: { [key: string]: string } = {
      "1": "Clothing",
      "2": "Men's Fashion",
      "3": "Women's Fashion",
      "4": "Accessories",
      "5": "Headwear"
    };
    return categories[categoryId] || "Uncategorized";
  };

  // Helper function to get subcategory name
  const getSubCategoryName = (subCategoryId: string): string => {
    const subCategories: { [key: string]: string } = {
      "1-1": "Traditional Wear",
      "1-2": "Modern Wear",
      "2-1": "Men's Shirts",
      "1-1-1": "Kente",
      "1-1-2": "Ankara"
    };
    return subCategories[subCategoryId] || "General";
  };

  // Available status options for filter
  const statusOptions: { value: WishlistStatus; label: string }[] = [
    { value: "in-stock", label: "In Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
    { value: "on-sale", label: "On Sale" },
  ];

  // Status configuration
  const statusConfig = {
    "in-stock": {
      label: "In Stock",
      dotColor: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    "out-of-stock": {
      label: "Out of Stock",
      dotColor: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
    },
    "on-sale": {
      label: "On Sale",
      dotColor: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
    },
  } as const;

  // Table fields for wishlist view - CORRECTED VERSION
  const wishlistFields: TableField<WishlistItemWithId>[] = [
    {
      key: "image",
      header: "Product",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 rounded-sm">
            <AvatarImage src={row.product.image} alt={row.product.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(row.product.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-md">{row.product.name}</span>
            <span className="text-sm text-muted-foreground">
              {row.product.vendor}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (_, row) => (
        <span className="font-medium">
          {getCategoryName(row.product.categoryId)}
        </span>
      ),
      align: "center",
    },
    {
      key: "subCategory",
      header: "Sub Category",
      cell: (_, row) => (
        <span className="font-medium">
          {getSubCategoryName(row.product.subCategoryId || "")}
        </span>
      ),
      align: "center",
    },
    {
      key: "wishlistCount",
      header: "Wishlist Count",
      cell: (_, row) => (
        <div className="flex flex-col items-center">
          <span className="font-medium text-lg">{row.product.sales || 0}</span>
        </div>
      ),
      align: "center",
    },
    {
      key: "stock",
      header: "Stock Status",
      cell: (_, row) => {
        const config = row.product.inStock
          ? statusConfig["in-stock"]
          : statusConfig["out-of-stock"];

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
    },
  ];

  const wishlistActions: TableAction<WishlistItemWithId>[] = [
    {
      type: "view",
      label: "View Product Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (item) => {
        navigate(`/admin/products/wishlist/${item.productId}/details`);
      },
    },
  ];

  return (
    <>
      <SiteHeader label="Wishlist Management" />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            <SectionCards cards={wishlistCards} layout="1x3" />

            <div className="space-y-6">
              {/* Wishlist Section */}
              <div className="rounded-lg border bg-card py-6 mb-6 dark:bg-[#303030]">
                {/* Search and Filter Section */}
                {wishlistCount > 0 && (
                  <div className="px-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="w-full sm:w-auto flex flex-1">
                      <Search
                        placeholder="Search your wishlist by name, brand, or description..."
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
                                checked={selectedStatuses.includes(
                                  status.value
                                )}
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
                )}

                {/* Wishlist Items Display */}
                <div className="px-6">
                  {wishlistCount === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold">
                        Your wishlist is empty
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Start building your collection! Click the heart icon on
                        any product to save it here for later. Perfect for items
                        you're considering, waiting to go on sale, or just can't
                        stop thinking about.
                      </p>
                      <Button onClick={() => navigate("/products")}>
                        Start Shopping
                      </Button>
                    </div>
                  ) : filteredWishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No items found matching your search criteria.
                      </p>
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="mt-4"
                      >
                        Clear Filters
                      </Button>
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
        </main>
      </div>
    </>
  );
}