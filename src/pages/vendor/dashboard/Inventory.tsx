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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListFilter, Download, MoreHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";

type StockStatus = "in-stock" | "limited-stock" | "out-of-stock";
type ProductTab = "all" | "in-stock" | "limited-stock" | "out-of-stock";
type DateRange = "last-7-days" | "last-30-days" | "all-time";

interface ProductVariant {
  size: string;
  color: string;
  qtyAvailable: number;
  lowStockUnit: number;
  priceUSD: number;
}

interface ProductData {
  id: string;
  productName: string;
  variant: string;
  priceUSD: number;
  availableStock: number;
  status: StockStatus;
  addedOn?: string;
  lastRestock?: string;
  variants?: ProductVariant[];
  [key: string]: any;
}

interface InventoryStats {
  totalActiveProducts: number;
  inStockProducts: number;
  limitedStockProducts: number;
  outOfStockProducts: number;
  totalActiveChange?: { trend: "up" | "down"; value: string };
  inStockChange?: { trend: "up" | "down"; value: string };
  limitedStockChange?: { trend: "up" | "down"; value: string };
  outOfStockChange?: { trend: "up" | "down"; value: string };
}

export default function InventoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<StockStatus[]>([]);
  const [activeTab, setActiveTab] = useState<ProductTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");
  
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    addStock: "",
    lowStockUnit: "",
  });
  

  // Mock product data
  const mockProducts: ProductData[] = [
    {
      id: "1",
      productName: "African made sandals",
      variant: "XL, Red",
      priceUSD: 10,
      availableStock: 1,
      status: "limited-stock",
      addedOn: "11/12/2025",
      lastRestock: "21/12/2025",
      variants: [
        { size: "XL", color: "Red", qtyAvailable: 1, lowStockUnit: 2, priceUSD: 20 }
      ],
    },
    {
      id: "2",
      productName: "Handcrafted leather bags",
      variant: "M, Blue",
      priceUSD: 14,
      availableStock: 2,
      status: "limited-stock",
      addedOn: "10/12/2025",
      lastRestock: "20/12/2025",
      variants: [
        { size: "M", color: "Blue", qtyAvailable: 2, lowStockUnit: 3, priceUSD: 14 }
      ],
    },
    {
      id: "3",
      productName: "Beaded jewelry from Kenya",
      variant: "M, Red",
      priceUSD: 16,
      availableStock: 3,
      status: "limited-stock",
      addedOn: "09/12/2025",
      lastRestock: "19/12/2025",
      variants: [
        { size: "M", color: "Red", qtyAvailable: 3, lowStockUnit: 4, priceUSD: 16 }
      ],
    },
    {
      id: "4",
      productName: "Traditional woven baskets",
      variant: "Large",
      priceUSD: 20,
      availableStock: 4,
      status: "limited-stock",
      addedOn: "08/12/2025",
      lastRestock: "18/12/2025",
      variants: [
        { size: "Large", color: "", qtyAvailable: 4, lowStockUnit: 5, priceUSD: 20 }
      ],
    },
    {
      id: "5",
      productName: "Mud cloth wall hangings",
      variant: "Large",
      priceUSD: 10,
      availableStock: 5,
      status: "in-stock",
      addedOn: "07/12/2025",
      lastRestock: "17/12/2025",
      variants: [
        { size: "Large", color: "", qtyAvailable: 5, lowStockUnit: 3, priceUSD: 10 }
      ],
    },
    {
      id: "6",
      productName: "Carved wooden masks",
      variant: "Handmade",
      priceUSD: 100,
      availableStock: 6,
      status: "in-stock",
      addedOn: "06/12/2025",
      lastRestock: "16/12/2025",
      variants: [
        { size: "Handmade", color: "", qtyAvailable: 6, lowStockUnit: 4, priceUSD: 100 }
      ],
    },
    {
      id: "7",
      productName: "Kente cloth scarves",
      variant: "Medium",
      priceUSD: 25,
      availableStock: 8,
      status: "in-stock",
      addedOn: "05/12/2025",
      lastRestock: "15/12/2025",
      variants: [
        { size: "Medium", color: "", qtyAvailable: 8, lowStockUnit: 4, priceUSD: 25 }
      ],
    },
    {
      id: "8",
      productName: "Batik fabric",
      variant: "Large",
      priceUSD: 30,
      availableStock: 10,
      status: "in-stock",
      addedOn: "04/12/2025",
      lastRestock: "14/12/2025",
      variants: [
        { size: "Large", color: "", qtyAvailable: 10, lowStockUnit: 5, priceUSD: 30 }
      ],
    },
    {
      id: "9",
      productName: "Shea butter products",
      variant: "100g",
      priceUSD: 8,
      availableStock: 0,
      status: "out-of-stock",
      addedOn: "03/12/2025",
      lastRestock: "13/12/2025",
      variants: [
        { size: "100g", color: "", qtyAvailable: 0, lowStockUnit: 5, priceUSD: 8 }
      ],
    },
  ];

  const [products] = useState<ProductData[]>(mockProducts);

  // Calculate statistics
  const calculateStats = (): InventoryStats => {
    const totalActiveProducts = products.length;
    const inStockProducts = products.filter(p => p.status === "in-stock").length;
    const limitedStockProducts = products.filter(p => p.status === "limited-stock").length;
    const outOfStockProducts = products.filter(p => p.status === "out-of-stock").length;

    return {
      totalActiveProducts,
      inStockProducts,
      limitedStockProducts,
      outOfStockProducts,
      totalActiveChange: { trend: "up", value: "10%" },
      inStockChange: { trend: "up", value: "10%" },
      limitedStockChange: { trend: "up", value: "5%" },
      outOfStockChange: { trend: "up", value: "10%" },
    };
  };

  const stats = calculateStats();

  // Filter products based on tab, search, and status filters
  const filteredProducts = products.filter((item) => {
    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in-stock" && item.status === "in-stock") ||
      (activeTab === "limited-stock" && item.status === "limited-stock") ||
      (activeTab === "out-of-stock" && item.status === "out-of-stock");

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variant.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(item.status);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: StockStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTabClick = (tab: ProductTab) => {
    setActiveTab(tab);
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: ProductTab) => {
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


  const handleSaveEdit = () => {
    console.log("Saving stock update:", editFormData);
    setIsEditDialogOpen(false);
  };

  // Inventory cards
  const inventoryCards: CardData[] = [
    {
      title: "Total active products",
      value: stats.totalActiveProducts.toString(),
      change: stats.totalActiveChange && {
        trend: stats.totalActiveChange.trend,
        value: stats.totalActiveChange.value,
        description: "",
      },
    },
    {
      title: "In stock products",
      value: stats.inStockProducts.toString(),
      change: stats.inStockChange && {
        trend: stats.inStockChange.trend,
        value: stats.inStockChange.value,
        description: "",
      },
    },
    {
      title: "Limited stock products",
      value: stats.limitedStockProducts.toString(),
      change: stats.limitedStockChange && {
        trend: stats.limitedStockChange.trend,
        value: stats.limitedStockChange.value,
        description: "",
      },
    },
    {
      title: "Out of stock products",
      value: stats.outOfStockProducts.toString(),
      change: stats.outOfStockChange && {
        trend: stats.outOfStockChange.trend,
        value: stats.outOfStockChange.value,
        description: "",
      },
    },
  ];

  // Status options for filter
  const statusOptions: { value: StockStatus; label: string }[] = [
    { value: "in-stock", label: "In stock" },
    { value: "limited-stock", label: "Limited stock" },
    { value: "out-of-stock", label: "Out of stock" },
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
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  // Table fields
  const productFields: TableField<ProductData>[] = [
    {
      key: "productName",
      header: "Product name",
      cell: (value) => <span className="font-semibold">{value as string}</span>,
    },
    {
      key: "variant",
      header: "Variant",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "priceUSD",
      header: "Price (USD)",
      cell: (value) => <span>{value as number}</span>,
      align: "center",
    },
    {
      key: "availableStock",
      header: "Available stock",
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

  const productActions: TableAction<ProductData>[] = [
    {
      type: "custom",
      label: "Actions",
      icon: <MoreHorizontal className="size-5" />,
      onClick: (product) => {
        
        navigate(`/vendor/inventory/${product.id}/details`);
      },
    },
  ];

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No products" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No products</h3>
    </div>
  );


  // Edit Stock Dialog
  const EditStockDialog = () => {
    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Variant details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="add-stock" className="text-sm font-medium mb-2 block">
                Add stock
              </Label>
              <Input
                id="add-stock"
                type="number"
                value={editFormData.addStock}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, addStock: e.target.value })
                }
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="low-stock-unit" className="text-sm font-medium mb-2 block">
                Define the low stock unit
              </Label>
              <Input
                id="low-stock-unit"
                type="number"
                value={editFormData.lowStockUnit}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, lowStockUnit: e.target.value })
                }
                placeholder="2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 px-6">
            <SectionCards cards={inventoryCards} layout="1x4" />

            <div className="space-y-6">
              {/* Products Section */}
              <div className="rounded-lg border bg-white dark:bg-[#303030]">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">All Active Products</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Manage and monitor all active products on the platform
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
                      All Products
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
                  </div>
                </div>

                {/* Products Table/Empty State */}
                <div className="px-6 pb-6">
                  {filteredProducts.length > 0 ? (
                    <DataTable<ProductData>
                      data={filteredProducts}
                      fields={productFields}
                      actions={productActions}
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

      {/* Edit Stock Dialog */}
      <EditStockDialog />
    </>
  );
}