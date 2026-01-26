import { useState, useEffect, useCallback } from "react";
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
import { useReduxOrders, type VendorOrderItem } from "@/hooks/useReduxOrders";
import { useReduxAuth } from "@/hooks/useReduxAuth";

type OrderStatus =
  | "pending"
  | "ongoing"
  | "completed"
  | "returned"
  | "unfulfilled"
  | "failed";

type OrderTab =
  | "all"
  | "pending-confirmation"
  | "ongoing"
  | "completed"
  | "returned"
  | "unfulfilled-failed";

type DateRange = "last-7-days" | "last-30-days" | "all-time";

interface OrderData {
  id: string;
  orderId: string;
  productOrdered: string;
  variant: string;
  orderedOn: string;
  noOfItems: number;
  status: OrderStatus;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderTotal?: number;
  paymentMethod?: string;
  trackingNumber?: string;
  [key: string]: any;
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all-time");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { user } = useReduxAuth();
  const vendorId = user?.id || "";

  const {
    vendorStats,
    vendorOrders,
    vendorPagination,
    vendorLoading,
    vendorError,
    getVendorOrders,
    clearVendorOrdersError,
  } = useReduxOrders();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!vendorId) return;

    const params: Record<string, any> = {};
    if (debouncedSearch) params.search = debouncedSearch;

    if (dateRange !== "all-time") {
      const endDate = new Date();
      const startDate = new Date();
      if (dateRange === "last-7-days") startDate.setDate(startDate.getDate() - 7);
      else if (dateRange === "last-30-days") startDate.setDate(startDate.getDate() - 30);
      params.startDate = startDate.toISOString();
      params.endDate = endDate.toISOString();
    }

    try {
      await getVendorOrders(vendorId, params);
    } finally {
      setIsInitialLoad(false);
    }
  }, [vendorId, debouncedSearch, dateRange, getVendorOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    return () => clearVendorOrdersError();
  }, [clearVendorOrdersError]);

  // Transform orders
  const transformedOrders: OrderData[] = (vendorOrders || []).map((order: VendorOrderItem) => ({
    id: order.id,
    orderId: order.orderNumber || order.orderId || order.id,
    productOrdered: order.productName || "Unknown Product",
    variant: order.variant || "-",
    orderedOn: order.orderedOn
      ? new Date(order.orderedOn).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-",
    noOfItems: order.quantity || 0,
    status: order.status || "pending",
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    orderTotal: order.total,
    paymentMethod: order.paymentMethod,
    trackingNumber: order.trackingNumber,
  }));

  // Filter orders
  const filteredOrders = transformedOrders.filter((item) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending-confirmation" && item.status === "pending") ||
      (activeTab === "ongoing" && item.status === "ongoing") ||
      (activeTab === "completed" && item.status === "completed") ||
      (activeTab === "returned" && item.status === "returned") ||
      (activeTab === "unfulfilled-failed" &&
        (item.status === "unfulfilled" || item.status === "failed"));

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    return matchesTab && matchesStatus;
  });

  const handleStatusFilterChange = (status: OrderStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleTabClick = (tab: OrderTab) => {
    setActiveTab(tab);
    if (tab !== "all") setSelectedStatuses([]);
  };

  const getTabButtonClass = (tab: OrderTab) => {
    const base = "px-4 py-4 text-sm font-medium whitespace-nowrap";
    return activeTab === tab
      ? `${base} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`
      : `${base} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  // Stats cards
  const orderCards: CardData[] = [
    {
      title: "Total orders",
      value: vendorStats?.totalOrders?.toString() || "0",
      change: vendorStats?.totalOrdersChange && {
        trend: vendorStats.totalOrdersChange.trend,
        value: vendorStats.totalOrdersChange.value,
        description: "",
      },
    },
    {
      title: "Ongoing orders",
      value: vendorStats?.ongoingOrders?.toString() || "0",
      change: vendorStats?.ongoingOrdersChange && {
        trend: vendorStats.ongoingOrdersChange.trend,
        value: vendorStats.ongoingOrdersChange.value,
        description: "",
      },
    },
    {
      title: "Completed orders",
      value: vendorStats?.completedOrders?.toString() || "0",
      change: vendorStats?.completedOrdersChange && {
        trend: vendorStats.completedOrdersChange.trend,
        value: vendorStats.completedOrdersChange.value,
        description: "",
      },
    },
    {
      title: "Returns",
      value: vendorStats?.returns?.toString() || "0",
      change: vendorStats?.returnsChange && {
        trend: vendorStats.returnsChange.trend,
        value: vendorStats.returnsChange.value,
        description: "",
      },
    },
  ];

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "returned", label: "Returned" },
    { value: "unfulfilled", label: "Unfulfilled" },
    { value: "failed", label: "Failed" },
  ];

  const statusConfig = {
    pending: { label: "Pending", className: "bg-blue-100 text-blue-700 border-blue-300" },
    ongoing: { label: "Ongoing", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-300" },
    returned: { label: "Returned", className: "bg-purple-100 text-purple-700 border-purple-300" },
    unfulfilled: { label: "Unfulfilled", className: "bg-orange-100 text-orange-700 border-orange-300" },
    failed: { label: "Failed", className: "bg-red-100 text-red-700 border-red-300" },
  } as const;

  const orderFields: TableField<OrderData>[] = [
    {
      key: "orderId",
      header: "Order ID",
      cell: (value) => <span className="font-semibold">{value as string}</span>,
    },
    {
      key: "productOrdered",
      header: "Product ordered",
      cell: (value) => <span>{value as string}</span>,
    },
    {
      key: "variant",
      header: "Variant",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "orderedOn",
      header: "Ordered on",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "noOfItems",
      header: "No. of items",
      cell: (value) => <span>{value as number}</span>,
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status] || statusConfig.pending;
        return (
          <Badge variant="outline" className={`${config.className} font-medium`}>
            {config.label}
          </Badge>
        );
      },
      align: "center",
      enableSorting: true,
    },
  ];

  const orderActions: TableAction<OrderData>[] = [
    {
      type: "custom",
      label: "Actions",
      icon: <MoreHorizontal className="size-5" />,
      onClick: (order) => navigate(`/vendor/orders/${order.id}/details`),
    },
  ];

  const EmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No orders" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
      <p className="text-gray-500">Orders will appear here once customers purchase your products.</p>
    </div>
  );

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      <p className="mt-4 text-gray-500">Loading orders...</p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="Error" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-red-600">Failed to load orders</h3>
      <p className="text-gray-500 mb-4">{vendorError}</p>
      <Button onClick={fetchOrders}>Retry</Button>
    </div>
  );

  // Determine what to render
  const renderContent = () => {
    if (vendorLoading && isInitialLoad) return <LoadingState />;
    if (vendorError) return <ErrorState />;
    if (filteredOrders.length > 0) {
      return (
        <DataTable<OrderData>
          data={filteredOrders}
          fields={orderFields}
          actions={orderActions}
          enableSelection={true}
          enablePagination={true}
          pageSize={vendorPagination?.pageSize || 10}
        />
      );
    }
    return <EmptyState />;
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 px-6">
            <SectionCards cards={orderCards} layout="1x4" />


            <div className="space-y-6">
              <div className="rounded-lg border bg-white dark:bg-[#303030]">
                {/* Header */}
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold">All Orders</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Manage and monitor all orders on the platform
                  </p>
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
                      {(["last-7-days", "last-30-days", "all-time"] as DateRange[]).map((range, idx) => (
                        <button
                          key={range}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            dateRange === range
                              ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                          } ${idx === 0 ? "rounded-l-lg" : ""} ${idx === 2 ? "rounded-r-lg" : ""}`}
                          onClick={() => setDateRange(range)}
                        >
                          {range === "last-7-days" ? "Last 7 days" : range === "last-30-days" ? "Last 30 days" : "All time"}
                        </button>
                      ))}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <ListFilter className="w-4 h-4" />
                          Filter
                          {selectedStatuses.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{selectedStatuses.length}</Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {statusOptions.map((status) => (
                          <DropdownMenuCheckboxItem
                            key={status.value}
                            checked={selectedStatuses.includes(status.value)}
                            onCheckedChange={() => handleStatusFilterChange(status.value)}
                          >
                            {status.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>

                    {(selectedStatuses.length > 0 || searchQuery) && (
                      <Button variant="ghost" onClick={clearAllFilters} className="text-sm">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-0 px-6 overflow-x-auto">
                    {([
                      { key: "all", label: "All Orders" },
                      { key: "pending-confirmation", label: "Pending confirmation" },
                      { key: "ongoing", label: "Ongoing" },
                      { key: "completed", label: "Completed" },
                      { key: "returned", label: "Returned" },
                      { key: "unfulfilled-failed", label: "Unfulfilled/Failed" },
                    ] as { key: OrderTab; label: string }[]).map((tab) => (
                      <button
                        key={tab.key}
                        className={getTabButtonClass(tab.key)}
                        onClick={() => handleTabClick(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">{renderContent()}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}