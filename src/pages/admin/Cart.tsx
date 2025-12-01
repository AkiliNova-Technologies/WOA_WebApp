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
import {
  EyeIcon,
  Heart,
  ShoppingCart,
  Package,
  ListFilter,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/hooks/useCart";

type CartStatus = "all" | "in-stock" | "out-of-stock" | "on-sale";

interface CartStats {
  totalItems: number;
  itemsInStock: number;
  itemsOutOfStock: number;
  itemsOnSale: number;
  totalValue: number;
  categoriesCount: number;
}

interface CartItemWithId {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  addedAt: string;
  [key: string]: any;
}

export default function AdminCartPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CartStatus[]>([]);

  // Change to useCart hook
  const {
    cartItems,
    cartCount,
    cartStats,
    getInStockCartItems,
    getOutOfStockCartItems,
    getOnSaleCartItems,
  } = useCart();

  // Transform cart items to include id for DataTable
  const cartItemsWithId: CartItemWithId[] = cartItems.map((item) => ({
    ...item,
    id: item.productId,
  }));

  // Calculate cart statistics
  const stats: CartStats = {
    totalItems: cartCount,
    itemsInStock: getInStockCartItems().length,
    itemsOutOfStock: getOutOfStockCartItems().length,
    itemsOnSale: getOnSaleCartItems().length,
    totalValue: cartStats.total,
    categoriesCount: cartStats.categoriesCount,
  };

  // Filter cart items based on search and status filters
  const filteredCartItems = cartItemsWithId.filter((item) => {
    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  const cartCards: CardData[] = [
    {
      title: "Total Products",
      value: formatNumberShort(stats.totalItems),
      rightIcon: <ShoppingCart className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#FFE4E4]",
      change: {
        trend: "up",
        value: "8%",
        description: "from last month",
      },
    },
    {
      title: "Cart abandonment rate",
      value: "12%", // You might want to calculate this based on your business logic
      rightIcon: <Package className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#C4E8D1]",
      change: {
        trend: "down",
        value: "5%",
        description: "from last month",
      },
    },
    {
      title: "Cart to Wishlist",
      value: formatNumberShort(stats.itemsOnSale), // Using on-sale items as an example
      rightIcon: <Heart className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#C4E8D1]",
      change: {
        trend: "up",
        value: "15%",
        description: "from last month",
      },
    },
    {
      title: "Revenue lost",
      value: formatAmount(cartStats.totalDiscount || 0), // Using discount as lost revenue example
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


  // Available status options for filter
  const statusOptions: { value: CartStatus; label: string }[] = [
    { value: "in-stock", label: "In Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
    { value: "on-sale", label: "On Sale" },
  ];

  const getCountryOfOrigin = (product: any): string => {
    return product.specifications?.origin || "Unknown";
  };

  // Table fields for wishlist view - CORRECTED VERSION
 const cartFields: TableField<CartItemWithId>[] = [
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
      key: "country",
      header: "Country of origin",
      cell: (_, row) => (
        <span className="font-medium">
          {getCountryOfOrigin(row.product)}
        </span>
      ),
      align: "center",
    },
    {
      key: "price",
      header: "Price",
      cell: (_, row) => (
        <span className="font-medium">
          {formatAmount(row.product.price)}
        </span>
      ),
      align: "center",
    },
    {
      key: "cartCount",
      header: "Cart count",
      cell: (_, row) => (
        <div className="flex flex-col items-center">
          <span className="font-medium text-lg">{row.product.sales || 0}</span>
        </div>
      ),
      align: "center",
    },
    {
      key: "quantity",
      header: "QTY on cart",
      cell: (_, row) => (
        <div className="flex flex-col items-center">
          <span className="font-medium text-lg">{row.quantity}</span>
        </div>
      ),
      align: "center",
    },
    {
      key: "amount",
      header: "Amount on cart",
      cell: (_, row) => (
        <div className="flex flex-col items-center">
          <span className="font-medium text-lg">
            {formatAmount(row.product.price * row.quantity)}
          </span>
        </div>
      ),
      align: "center",
    },
  ];

  const cartActions: TableAction<CartItemWithId>[] = [
    {
      type: "view",
      label: "View Product Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (item) => {
        navigate(`/admin/products/cart/${item.productId}/details`);
      },
    },
  ];

  return (
    <>
      <SiteHeader label="Cart Management" />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            <SectionCards cards={cartCards} layout="1x4" />

            <div className="space-y-6">
              {/* Wishlist Section */}
              <div className="rounded-lg border bg-card py-6 mb-6 dark:bg-[#303030]">
                {/* Search and Filter Section */}
                {cartCount > 0 && (
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
                  {cartCount === 0 ? (
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
                  ) : filteredCartItems.length === 0 ? (
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
                      <DataTable<CartItemWithId> 
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
        </main>
      </div>
    </>
  );
}
