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
import {
  Eye,
  Download,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useReduxOrders } from "@/hooks/useReduxOrders";
import images from "@/assets/images";

type OrderTab =
  | "all"
  | "open"
  | "ongoing"
  | "completed"
  | "returned"
  | "unfulfilled";
type OrderStatus =
  | "open"
  | "ongoing"
  | "completed"
  | "returned"
  | "unfulfilled";

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [timePeriod, setTimePeriod] = useState<"7days" | "30days" | "alltime">(
    "7days"
  );

  const { orders, loading, getOrders } = useReduxOrders();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getOrders();
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchData();
  }, [getOrders]);

  // Map Redux order status to UI status
  const mapOrderStatus = (status: string): OrderStatus => {
    const statusMap: Record<string, OrderStatus> = {
      pending: "open",
      confirmed: "open",
      processing: "ongoing",
      shipped: "ongoing",
      delivered: "completed",
      cancelled: "returned",
      refunded: "returned",
    };
    return statusMap[status] || "unfulfilled";
  };

  // Calculate order statistics - with null/undefined checks
  const calculateOrderStats = () => {
    // Ensure orders is an array
    const ordersArray = Array.isArray(orders) ? orders : [];
    const totalOrders = ordersArray.length;
    
    if (totalOrders === 0) {
      return {
        totalOrders: 0,
        openOrders: 0,
        ongoingOrders: 0,
        completedOrders: 0,
        returnedOrders: 0,
        unfulfilledOrders: 0,
        totalRevenue: 0,
        processingOrders: 0,
        deliveredOrders: 0,
      };
    }
    
    // Count orders by mapped status
    const statusCounts = ordersArray.reduce((acc, order) => {
      if (!order || !order.status) return acc;
      
      const status = mapOrderStatus(order.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    const totalRevenue = ordersArray.reduce((sum, order) => {
      return sum + (order?.total || 0);
    }, 0);

    return {
      totalOrders,
      openOrders: statusCounts.open || 0,
      ongoingOrders: statusCounts.ongoing || 0,
      completedOrders: statusCounts.completed || 0,
      returnedOrders: statusCounts.returned || 0,
      unfulfilledOrders: statusCounts.unfulfilled || 0,
      totalRevenue,
      processingOrders: statusCounts.ongoing || 0, // For backward compatibility
      deliveredOrders: statusCounts.completed || 0, // For backward compatibility
    };
  };

  const orderStats = calculateOrderStats();

  // Ensure orders is an array before filtering
  const ordersArray = Array.isArray(orders) ? orders : [];
  
  const filteredOrders = ordersArray.filter((order) => {
    if (!order || !order.status) return false;
    
    const orderStatus = mapOrderStatus(order.status);

    const matchesTab = activeTab === "all" || orderStatus === activeTab;

    const matchesSearch =
      searchQuery === "" ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer?.firstName && order.customer.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer?.lastName && order.customer.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer?.email && order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(orderStatus);

    return matchesTab && matchesSearch && matchesStatus;
  });

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
  };

  const handleTabClick = (tab: OrderTab) => {
    setActiveTab(tab);
    // Clear status filters when switching tabs (optional)
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

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

  // Order cards with correct values matching titles
  const orderCards: CardData[] = [
    {
      title: "Total Orders",
      value: formatNumberShort(orderStats.totalOrders),
      change: {
        trend: "up",
        value: "12%",
        description: "",
      },
    },
    {
      title: "Ongoing Orders",
      value: formatNumberShort(orderStats.ongoingOrders),
      change: {
        trend: "up",
        value: "18%",
        description: "",
      },
    },
    {
      title: "Completed Orders",
      value: formatNumberShort(orderStats.completedOrders),
      change: {
        trend: "up",
        value: "8%",
        description: "",
      },
    },
    {
      title: "Returns",
      value: formatNumberShort(orderStats.returnedOrders),
      change: {
        trend: "up",
        value: "15%",
        description: "",
      },
    },
  ];

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "returned", label: "Returned" },
    { value: "unfulfilled", label: "Unfulfilled" },
  ];

  const statusConfig = {
    open: {
      label: "Open",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200",
      dotColor: "bg-blue-500",
    },
    ongoing: {
      label: "Ongoing",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-200",
      dotColor: "bg-yellow-500",
    },
    completed: {
      label: "Completed",
      textColor: "text-green-700",
      bgColor: "bg-green-100",
      borderColor: "border-green-200",
      dotColor: "bg-green-500",
    },
    returned: {
      label: "Returned",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      dotColor: "bg-red-500",
    },
    unfulfilled: {
      label: "Unfulfilled",
      textColor: "text-gray-700",
      bgColor: "bg-gray-100",
      borderColor: "border-gray-200",
      dotColor: "bg-gray-500",
    },
  } as const;

  const orderFields: TableField<any>[] = [
    {
      key: "orderNumber",
      header: "Order ID",
      cell: (_, row) => (
        <span className="font-medium text-md">
          #{row?.orderNumber || "N/A"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Ordered on",
      cell: (_, row) => (
        <span className="text-gray-600">
          {row?.createdAt ? formatDate(row.createdAt) : "N/A"}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer name",
      cell: (_, row) => (
        <span className="font-medium">
          {row?.customer?.firstName || ""} {row?.customer?.lastName || ""}
        </span>
      ),
    },
    {
      key: "items",
      header: "No of items",
      cell: (_, row) => (
        <span className="font-medium">
          {Array.isArray(row?.items) ? row.items.length : 0}
        </span>
      ),
      align: "center",
    },
    {
      key: "total",
      header: "Order Value (USD)",
      cell: (_, row) => (
        <span className="font-medium">
          {formatAmount(row?.total || 0, row?.currency)}
        </span>
      ),
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        if (!row?.status) {
          return (
            <Badge
              variant="outline"
              className="flex flex-row items-center py-2 px-3 gap-2 rounded-md bg-gray-100 border-gray-200"
            >
              <div className="size-2 rounded-full bg-gray-500" />
              <span className="text-gray-700">Unknown</span>
            </Badge>
          );
        }
        
        const orderStatus = mapOrderStatus(row.status);
        const config = statusConfig[orderStatus] || statusConfig.unfulfilled;
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
      key: "actions",
      header: "Actions",
      cell: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/orders/${row.id}`)}
          className="h-8"
          disabled={!row?.id}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      align: "center",
    },
  ];

  const orderActions: TableAction<any>[] = [
    {
      type: "view",
      label: "View Order Details",
      icon: <Eye className="size-4" />,
      onClick: (order) => {
        if (order?.id) {
          navigate(`/admin/orders/${order.id}`);
        }
      },
    },
  ];

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
                  Manage and monitor all orders on the platform
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
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Time Period Buttons - Updated to match cart page style */}
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#404040]">
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      timePeriod === "7days"
                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                    } rounded-l-lg`}
                    onClick={() => setTimePeriod("7days")}
                  >
                    Last 7 days
                  </button>
                  <button
                    className={`px-4 py-2 text-sm ${
                      timePeriod === "30days"
                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                    }`}
                    onClick={() => setTimePeriod("30days")}
                  >
                    Last 30 days
                  </button>
                  <button
                    className={`px-4 py-2 text-sm ${
                      timePeriod === "alltime"
                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                    } rounded-r-lg`}
                    onClick={() => setTimePeriod("alltime")}
                  >
                    All time
                  </button>
                </div>

                {/* Filter Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-10"
                      disabled={loading}
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
                    disabled={loading}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation - Updated to use buttons like cart page */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 px-6 overflow-x-auto">
              <button
                className={getTabButtonClass("all")}
                onClick={() => handleTabClick("all")}
              >
                All Orders
              </button>
              <button
                className={getTabButtonClass("open")}
                onClick={() => handleTabClick("open")}
              >
                Open
              </button>
              <button
                className={getTabButtonClass("ongoing")}
                onClick={() => handleTabClick("ongoing")}
              >
                Ongoing
              </button>
              <button
                className={getTabButtonClass("completed")}
                onClick={() => handleTabClick("completed")}
              >
                Completed
              </button>
              <button
                className={getTabButtonClass("returned")}
                onClick={() => handleTabClick("returned")}
              >
                Returned
              </button>
              <button
                className={getTabButtonClass("unfulfilled")}
                onClick={() => handleTabClick("unfulfilled")}
              >
                Unfulfilled
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <p className="text-muted-foreground">
                  {searchQuery ||
                  selectedStatuses.length > 0 ||
                  activeTab !== "all"
                    ? "No orders found matching your criteria"
                    : "No orders yet"}
                </p>
              </div>
            ) : (
              <DataTable
                data={filteredOrders}
                fields={orderFields}
                actions={orderActions}
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
