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

interface OrderStats {
  totalOrders: number;
  ongoingOrders: number;
  completedOrders: number;
  returns: number;
  totalOrdersChange?: { trend: "up" | "down"; value: string };
  ongoingOrdersChange?: { trend: "up" | "down"; value: string };
  completedOrdersChange?: { trend: "up" | "down"; value: string };
  returnsChange?: { trend: "up" | "down"; value: string };
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  // Mock order data
  const mockOrders: OrderData[] = [
    {
      id: "1",
      orderId: "#000001",
      productOrdered: "African made sandals",
      variant: "XL, Red",
      orderedOn: "7 Jan 2025",
      noOfItems: 1,
      status: "pending",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+256700000001",
      shippingAddress: "123 Main St, Kampala, Uganda",
      orderTotal: 50,
      paymentMethod: "Credit Card",
      trackingNumber: "TRK001",
    },
    {
      id: "2",
      orderId: "#000002",
      productOrdered: "Handcrafted leather bags",
      variant: "M, Blue",
      orderedOn: "14 Feb 2025",
      noOfItems: 2,
      status: "ongoing",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      customerPhone: "+256700000002",
      shippingAddress: "456 Oak Ave, Kampala, Uganda",
      orderTotal: 120,
      paymentMethod: "Mobile Money",
      trackingNumber: "TRK002",
    },
    {
      id: "3",
      orderId: "#000003",
      productOrdered: "Beaded jewelry from Kenya",
      variant: "M, Red",
      orderedOn: "21 Mar 2025",
      noOfItems: 3,
      status: "ongoing",
      customerName: "Alice Johnson",
      customerEmail: "alice@example.com",
      customerPhone: "+256700000003",
      shippingAddress: "789 Elm St, Kampala, Uganda",
      orderTotal: 180,
      paymentMethod: "PayPal",
      trackingNumber: "TRK003",
    },
    {
      id: "4",
      orderId: "#000004",
      productOrdered: "Traditional woven baskets",
      variant: "Large",
      orderedOn: "28 Apr 2025",
      noOfItems: 4,
      status: "ongoing",
      customerName: "Bob Wilson",
      customerEmail: "bob@example.com",
      customerPhone: "+256700000004",
      shippingAddress: "321 Pine Rd, Kampala, Uganda",
      orderTotal: 240,
      paymentMethod: "Credit Card",
      trackingNumber: "TRK004",
    },
    {
      id: "5",
      orderId: "#000005",
      productOrdered: "Mud cloth wall hangings",
      variant: "Large",
      orderedOn: "5 May 2025",
      noOfItems: 5,
      status: "completed",
      customerName: "Carol Brown",
      customerEmail: "carol@example.com",
      customerPhone: "+256700000005",
      shippingAddress: "654 Maple Dr, Kampala, Uganda",
      orderTotal: 300,
      paymentMethod: "Mobile Money",
      trackingNumber: "TRK005",
    },
    {
      id: "6",
      orderId: "#000006",
      productOrdered: "Carved wooden masks",
      variant: "Handmade",
      orderedOn: "12 Jun 2025",
      noOfItems: 6,
      status: "completed",
      customerName: "David Lee",
      customerEmail: "david@example.com",
      customerPhone: "+256700000006",
      shippingAddress: "987 Cedar Ln, Kampala, Uganda",
      orderTotal: 360,
      paymentMethod: "Bank Transfer",
      trackingNumber: "TRK006",
    },
    {
      id: "7",
      orderId: "#000007",
      productOrdered: "Kente cloth scarves",
      variant: "Medium",
      orderedOn: "19 Jul 2025",
      noOfItems: 7,
      status: "returned",
      customerName: "Emma Davis",
      customerEmail: "emma@example.com",
      customerPhone: "+256700000007",
      shippingAddress: "147 Birch Way, Kampala, Uganda",
      orderTotal: 420,
      paymentMethod: "Credit Card",
      trackingNumber: "TRK007",
    },
    {
      id: "8",
      orderId: "#000008",
      productOrdered: "Batik fabric",
      variant: "Large",
      orderedOn: "26 Aug 2025",
      noOfItems: 8,
      status: "unfulfilled",
      customerName: "Frank Miller",
      customerEmail: "frank@example.com",
      customerPhone: "+256700000008",
      shippingAddress: "258 Willow Ct, Kampala, Uganda",
      orderTotal: 480,
      paymentMethod: "Mobile Money",
      trackingNumber: "TRK008",
    },
    {
      id: "9",
      orderId: "#000009",
      productOrdered: "Shea butter products",
      variant: "100g",
      orderedOn: "2 Sep 2025",
      noOfItems: 9,
      status: "failed",
      customerName: "Grace Taylor",
      customerEmail: "grace@example.com",
      customerPhone: "+256700000009",
      shippingAddress: "369 Spruce Pl, Kampala, Uganda",
      orderTotal: 540,
      paymentMethod: "PayPal",
      trackingNumber: "TRK009",
    },
  ];

  const [orders] = useState<OrderData[]>(mockOrders);

  // Calculate statistics
  const calculateStats = (): OrderStats => {
    const totalOrders = orders.length;
    const ongoingOrders = orders.filter((o) => o.status === "ongoing").length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed"
    ).length;
    const returns = orders.filter((o) => o.status === "returned").length;

    return {
      totalOrders,
      ongoingOrders,
      completedOrders,
      returns,
      totalOrdersChange: { trend: "up", value: "10%" },
      ongoingOrdersChange: { trend: "up", value: "10%" },
      completedOrdersChange: { trend: "up", value: "5%" },
      returnsChange: { trend: "up", value: "10%" },
    };
  };

  const stats = calculateStats();

  // Filter orders based on tab, search, and status filters
  const filteredOrders = orders.filter((item) => {
    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending-confirmation" && item.status === "pending") ||
      (activeTab === "ongoing" && item.status === "ongoing") ||
      (activeTab === "completed" && item.status === "completed") ||
      (activeTab === "returned" && item.status === "returned") ||
      (activeTab === "unfulfilled-failed" &&
        (item.status === "unfulfilled" || item.status === "failed"));

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productOrdered.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: OrderStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTabClick = (tab: OrderTab) => {
    setActiveTab(tab);
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

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  // Order cards
  const orderCards: CardData[] = [
    {
      title: "Total orders",
      value: stats.totalOrders.toString(),
      change: stats.totalOrdersChange && {
        trend: stats.totalOrdersChange.trend,
        value: stats.totalOrdersChange.value,
        description: "",
      },
    },
    {
      title: "Ongoing orders",
      value: stats.ongoingOrders.toString(),
      change: stats.ongoingOrdersChange && {
        trend: stats.ongoingOrdersChange.trend,
        value: stats.ongoingOrdersChange.value,
        description: "",
      },
    },
    {
      title: "Completed orders",
      value: stats.completedOrders.toString(),
      change: stats.completedOrdersChange && {
        trend: stats.completedOrdersChange.trend,
        value: stats.completedOrdersChange.value,
        description: "",
      },
    },
    {
      title: "Returns",
      value: stats.returns.toString(),
      change: stats.returnsChange && {
        trend: stats.returnsChange.trend,
        value: stats.returnsChange.value,
        description: "",
      },
    },
  ];

  // Status options for filter
  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "returned", label: "Returned" },
    { value: "unfulfilled", label: "Unfulfilled" },
    { value: "failed", label: "Failed" },
  ];

  // Status configuration
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    ongoing: {
      label: "Ongoing",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    returned: {
      label: "Returned",
      className: "bg-purple-100 text-purple-700 border-purple-300",
    },
    unfulfilled: {
      label: "Unfulfilled",
      className: "bg-orange-100 text-orange-700 border-orange-300",
    },
    failed: {
      label: "Failed",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  // Table fields
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

  const orderActions: TableAction<OrderData>[] = [
    {
      type: "custom",
      label: "Actions",
      icon: <MoreHorizontal className="size-5" />,
      onClick: (order) => {
        navigate(`/vendor/orders/${order.id}/details`);
      },
    },
  ];

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No orders" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No orders</h3>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 px-6">
            <SectionCards cards={orderCards} layout="1x4" />

            <div className="space-y-6">
              {/* Orders Section */}
              <div className="rounded-lg border bg-white dark:bg-[#303030]">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">All Orders</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Manage and monitor all orders on the platform
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
                      All Orders
                    </button>
                    <button
                      className={getTabButtonClass("pending-confirmation")}
                      onClick={() => handleTabClick("pending-confirmation")}
                    >
                      Pending confirmation
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
                      className={getTabButtonClass("unfulfilled-failed")}
                      onClick={() => handleTabClick("unfulfilled-failed")}
                    >
                      Unfulfilled/Failed
                    </button>
                  </div>
                </div>

                {/* Orders Table/Empty State */}
                <div className="px-6 pb-6">
                  {filteredOrders.length > 0 ? (
                    <DataTable<OrderData>
                      data={filteredOrders}
                      fields={orderFields}
                      actions={orderActions}
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
