import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Eye, Download, SlidersHorizontal, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useReduxOrders } from "@/hooks/useReduxOrders";
import type { AdminOrderLineItem } from "@/redux/slices/ordersSlice";
import images from "@/assets/images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type OrderTab =
  | "all"
  | "paid"
  | "pending"
  | "shipped"
  | "delivered"
  | "cancelled";
type OrderStatus = AdminOrderLineItem["status"];

interface OrderLineItemWithId extends AdminOrderLineItem {
  id: string;
  [key: string]: any;
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    adminStats,
    adminLineItems,
    adminPagination,
    adminLoading,
    getAdminOrders,
  } = useReduxOrders();

  useEffect(() => {
    const params = {
      search: searchQuery || undefined,
      page: currentPage,
    };
    getAdminOrders(params);
  }, [searchQuery, currentPage, getAdminOrders]);

  const handleStatusFilterChange = (status: OrderStatus) => {
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

  const handleTabClick = (tab: OrderTab) => {
    setActiveTab(tab);
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  // Transform line items to include id
  const transformLineItem = (
    item: AdminOrderLineItem
  ): OrderLineItemWithId => ({
    ...item,
    id: item.subOrderId,
  });

  const tableLineItems: OrderLineItemWithId[] =
    adminLineItems.map(transformLineItem);

  // Filter line items
  const filteredLineItems = tableLineItems.filter((item) => {
    const matchesStatusFilter =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    const matchesTabFilter = activeTab === "all" || activeTab === item.status;

    return matchesStatusFilter && matchesTabFilter;
  });

  const getTabButtonClass = (tab: OrderTab) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";

    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
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

  const formatAmount = (amount: number, currency: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Order cards with admin stats
  const orderCards: CardData[] = [
    {
      title: "Total Items Ordered",
      value: formatNumberShort(adminStats?.totalItemsOrdered || 0),
      change: {
        trend: (adminStats?.itemsChangePct || 0) >= 0 ? "up" : "down",
        value: `${Math.abs(adminStats?.itemsChangePct || 0).toFixed(1)}%`,
        description: "vs last month",
      },
    },
    {
      title: "Pending Orders",
      value: formatNumberShort(adminStats?.pendingOrders || 0),
      change: {
        value: `${adminStats?.pendingItems || 0} items`,
        trend: undefined,
        description: "",
      },
    },
    {
      title: "This Month",
      value: formatNumberShort(adminStats?.thisMonth.items || 0),
      change: {
        value: `vs ${adminStats?.previousMonth.items || 0} last month`,
        trend: undefined,
        description: "",
      },
    },
    {
      title: "Pending Revenue",
      value: formatAmount(adminStats?.pendingRevenue || 0),
      change: {
        trend: "up",
        value: "Awaiting fulfillment",
        description: "",
      },
    },
  ];

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  const statusConfig = {
    paid: {
      label: "Paid",
      textColor: "text-green-700",
      bgColor: "bg-green-100",
      borderColor: "border-green-200",
      dotColor: "bg-green-500",
    },
    pending: {
      label: "Pending",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-200",
      dotColor: "bg-yellow-500",
    },
    shipped: {
      label: "Shipped",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200",
      dotColor: "bg-blue-500",
    },
    delivered: {
      label: "Delivered",
      textColor: "text-teal-700",
      bgColor: "bg-teal-100",
      borderColor: "border-teal-200",
      dotColor: "bg-teal-500",
    },
    cancelled: {
      label: "Cancelled",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      dotColor: "bg-red-500",
    },
    refunded: {
      label: "Refunded",
      textColor: "text-purple-700",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200",
      dotColor: "bg-purple-500",
    },
  } as const;

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const orderFields: TableField<OrderLineItemWithId>[] = [
    {
      key: "name",
      header: "Product Name",
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
      key: "orderDate",
      header: "Order Date",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(row.orderDate)}
        </span>
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
      key: "lineTotal",
      header: "Line Total (USD)",
      cell: (_, row) => (
        <span className="font-medium">{formatAmount(row.lineTotal)}</span>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "orderTotal",
      header: "Order Total (USD)",
      cell: (_, row) => (
        <span className="font-medium">{formatAmount(row.orderTotal)}</span>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status] || statusConfig.pending;
        return (
          <Badge
            variant="outline"
            className={`flex flex-row items-center py-2 px-3 gap-2 rounded-md ${config.bgColor} ${config.borderColor}`}
          >
            <div className={`size-2 rounded-full ${config.dotColor}`} />
            <span className={config.textColor}>{config.label}</span>
          </Badge>
        );
      },
      align: "center",
      enableSorting: true,
    },
    {
      key: "shipBy",
      header: "Ship By",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.shipBy ? formatDate(row.shipBy) : "—"}
        </span>
      ),
      align: "center",
    },
  ];

  const orderActions: TableAction<OrderLineItemWithId>[] = [
    {
      type: "view",
      label: "View Order Details",
      icon: <Eye className="size-4" />,
      onClick: (item) => {
        navigate(`/admin/products/orders/${item.subOrderId}`);
      },
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader label="Orders" />
      <div className="p-6 space-y-6">
        <SectionCards cards={orderCards} layout="1x4" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  All Orders
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all order line items on the platform
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
                  disabled={adminLoading}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Time Period Buttons */}
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

                {/* Filter Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-10"
                      disabled={adminLoading}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
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
                <Button variant="outline" className="gap-2 h-10">
                  <Download className="w-4 h-4" />
                  Export
                </Button>

                {/* Clear Filters Button */}
                {(selectedStatuses.length > 0 ||
                  searchQuery ||
                  activeTab !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-sm h-10"
                    disabled={adminLoading}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 px-6 overflow-x-auto">
              <button
                className={getTabButtonClass("all")}
                onClick={() => handleTabClick("all")}
              >
                All Orders
              </button>
              <button
                className={getTabButtonClass("paid")}
                onClick={() => handleTabClick("paid")}
              >
                Paid
              </button>
              <button
                className={getTabButtonClass("pending")}
                onClick={() => handleTabClick("pending")}
              >
                Pending
              </button>
              <button
                className={getTabButtonClass("shipped")}
                onClick={() => handleTabClick("shipped")}
              >
                Shipped
              </button>
              <button
                className={getTabButtonClass("delivered")}
                onClick={() => handleTabClick("delivered")}
              >
                Delivered
              </button>
              <button
                className={getTabButtonClass("cancelled")}
                onClick={() => handleTabClick("cancelled")}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="p-6">
            {adminLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Loading orders...
                  </p>
                </div>
              </div>
            ) : filteredLineItems.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Orders Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ||
                  selectedStatuses.length > 0 ||
                  activeTab !== "all"
                    ? "Try adjusting your filters"
                    : "No orders have been placed yet."}
                </p>
              </div>
            ) : (
              <DataTable<OrderLineItemWithId>
                data={filteredLineItems}
                fields={orderFields}
                actions={orderActions}
                enableSelection={true}
                enablePagination={true}
                pageSize={adminPagination?.pageSize || 25}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
