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
import { Filter, Download, Eye, Pencil } from "lucide-react";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import type { Product as ReduxProduct } from "@/redux/slices/productsSlice";
import images from "@/assets/images";

type ExtendedProductStatus =
  | "active"
  | "suspended"
  | "deactivated"
  | "deleted"
  | "draft"
  | "out-of-stock"
  | "archived";

type TabFilter = "all" | "pending_approval" | "active" | "unpublished" | "suspended";

// interface ProductStats {
//   totalProducts: number;
//   activeProducts: number;
//   pendingApproval: number;
//   suspendedProducts: number;
// }

const mapReduxStatusToExtendedStatus = (
  status: string
): ExtendedProductStatus => {
  switch (status) {
    case "published":
      return "active";
    case "draft":
      return "draft";
    case "pending_review":
      return "draft";
    case "approved":
      return "active";
    case "rejected":
      return "suspended";
    case "archived":
      return "deactivated";
    default:
      return "active";
  }
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

type TableProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  vendor: string;
  image: string;
  categoryId: string;
  status:
    | "draft"
    | "pending_review"
    | "approved"
    | "rejected"
    | "published"
    | "archived";
  stockQuantity: number;
  sales: number;
  category: string;
};

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ExtendedProductStatus[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const {
    products,
    getAdminProducts,
    getPublishedProducts,
    getPendingReviewProducts,
  } = useReduxProducts();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await getAdminProducts({
          status:
            activeTab === "active"
              ? "published"
              : activeTab === "pending_approval"
              ? "pending_review"
              : activeTab === "suspended"
              ? "rejected"
              : undefined,
        });
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();
  }, [getAdminProducts, activeTab]);

  const statusOptions: { value: ExtendedProductStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Pending approval" },
    { value: "deactivated", label: "Unpublished" },
    { value: "suspended", label: "Suspended" },
  ];

  const handleStatusFilterChange = (status: ExtendedProductStatus) => {
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

  const transformProductForTable = (
    reduxProduct: ReduxProduct
  ): TableProduct => ({
    id: reduxProduct.id,
    name: reduxProduct.name,
    description: reduxProduct.description,
    price: reduxProduct.price,
    salePrice: reduxProduct.salePrice,
    vendor: reduxProduct.vendor?.businessName || "Unknown Vendor",
    image:
      reduxProduct.images?.find((img) => img.isPrimary)?.url ||
      reduxProduct.images?.[0]?.url ||
      "",
    categoryId: reduxProduct.categoryId,
    status: reduxProduct.status,
    stockQuantity: reduxProduct.stock,
    sales: 10, // Placeholder
    category: reduxProduct.category?.name || "Uncategorized",
  });

  const tableProducts: TableProduct[] = products.map(transformProductForTable);

  // Filter products
  const filteredProducts = tableProducts.filter((product) => {
    const extendedStatus = mapReduxStatusToExtendedStatus(product.status);

    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatusFilter =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(extendedStatus);

    const matchesTabFilter = 
      activeTab === "all" ||
      (activeTab === "active" && extendedStatus === "active") ||
      (activeTab === "pending_approval" && extendedStatus === "draft") ||
      (activeTab === "unpublished" && extendedStatus === "deactivated") ||
      (activeTab === "suspended" && extendedStatus === "suspended");

    return matchesSearch && matchesStatusFilter && matchesTabFilter;
  });

  // Calculate statistics for cards
  const totalProducts = products.length;
  const activeProducts = getPublishedProducts().length;
  const pendingApproval = getPendingReviewProducts().length;
  const suspendedProducts = products.filter(
    (p) => p.status === "rejected"
  ).length;

  const statsCards: CardData[] = [
    {
      title: "Total products",
      value: totalProducts.toString(),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Pending approval",
      value: pendingApproval.toString(),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Active products",
      value: activeProducts.toString(),
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Suspended products",
      value: suspendedProducts.toString(),
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
  ];

  // const handleDeleteProduct = async (productId: string) => {
  //   if (window.confirm("Are you sure you want to delete this product?")) {
  //     try {
  //       console.log("Product deleted:", productId);
  //     } catch (error) {
  //       console.error("Failed to delete product:", error);
  //     }
  //   }
  // };

  const productFields: TableField<TableProduct>[] = [
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.vendor}
            </p>
          </div>
        </div>
      ),
      align: "left",
    },
    {
      key: "category",
      header: "Category",
      cell: (value) => <span className="font-medium">{value as string}</span>,
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
      key: "sales",
      header: "Orders",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const extendedStatus = mapReduxStatusToExtendedStatus(row.status);
        const statusConfig = {
          active: {
            label: "Active",
            className: "bg-teal-50 text-teal-700 border-teal-200",
          },
          suspended: {
            label: "Suspended",
            className: "bg-red-50 text-red-700 border-red-200",
          },
          deactivated: {
            label: "Unpublished",
            className: "bg-blue-50 text-blue-700 border-blue-200",
          },
          deleted: {
            label: "Deleted",
            className: "bg-gray-100 text-gray-700 border-gray-300",
          },
          draft: {
            label: "Pending approval",
            className: "bg-yellow-50 text-yellow-700 border-yellow-200",
          },
          "out-of-stock": {
            label: "Out of Stock",
            className: "bg-orange-50 text-orange-700 border-orange-200",
          },
          archived: {
            label: "Archived",
            className: "bg-purple-50 text-purple-700 border-purple-200",
          },
        };

        const config = statusConfig[extendedStatus] || statusConfig.active;

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

  const productActions: TableAction<TableProduct>[] = [
    {
      type: "view",
      label: "View Details",
      icon: <Eye className="size-5" />,
      onClick: (product) => {
        navigate(`/admin/products/${product.id}/details`);
      },
    },
    {
      type: "edit",
      label: "Edit Product",
      icon: <Pencil className="size-5" />,
      onClick: (product) => {
        navigate(`/admin/products/${product.id}/edit`);
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
        label="Product Management"
      />
      <div className="p-6 space-y-6">
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
                All Products
              </button>
              <button 
                className={getTabButtonClass("pending_approval")}
                onClick={() => handleTabClick("pending_approval")}
              >
                Pending Approval
              </button>
              <button 
                className={getTabButtonClass("active")}
                onClick={() => handleTabClick("active")}
              >
                Active
              </button>
              <button 
                className={getTabButtonClass("unpublished")}
                onClick={() => handleTabClick("unpublished")}
              >
                Unpublished
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
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6"/>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Products Found
                </h3>
              </div>
            ) : (
              <DataTable<TableProduct>
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