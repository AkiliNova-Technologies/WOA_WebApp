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
} from "@/components/ui/dialog";
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

type PayoutStatus = "paid" | "pending" | "due-for-payment" | "processing" | "failed";
type RevenueTab = "all" | "pending" | "due-for-payment" | "processing" | "paid" | "failed";
type DateRange = "last-7-days" | "last-30-days" | "all-time";

interface RevenueData {
  id: string;
  orderId: string;
  receivedOn: string;
  grossRevenue: number;
  netRevenue: number;
  payoutStatus: PayoutStatus;
  sellerName?: string;
  sellerEmail?: string;
  sellerContact?: string;
  productName?: string;
  variant?: string;
  purchasedOn?: string;
  qtyOrdered?: number;
  pricePerUnit?: number;
  productSale?: number;
  tax?: number;
  shipping?: number;
  subTotal?: number;
  sellerPayout?: number;
  total?: number;
  issueDate?: string;
  dueDate?: string;
  lastUpdated?: string;
  [key: string]: any;
}

interface RevenueStats {
  grossRevenue: number;
  totalPayoutDue: number;
  netPlatformRevenue: number;
  avgPayoutTime: number;
  grossRevenueChange?: { trend: "up" | "down"; value: string };
  payoutDueChange?: { trend: "up" | "down"; value: string };
  netRevenueChange?: { trend: "up" | "down"; value: string };
  avgPayoutTimeChange?: { trend: "up" | "down"; value: string };
}

export default function AdminRevenuePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<PayoutStatus[]>([]);
  const [activeTab, setActiveTab] = useState<RevenueTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueData | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  // Mock revenue data
  const mockRevenue: RevenueData[] = [
    {
      id: "1",
      orderId: "#00001",
      receivedOn: "7 Jan 2025",
      grossRevenue: 600,
      netRevenue: 120,
      payoutStatus: "paid",
      sellerName: "Victor Wandulu",
      sellerEmail: "wandulu@tekjuice.co.uk",
      sellerContact: "+256743027395",
      productName: "African made sandals",
      variant: "XL, Red",
      purchasedOn: "7 Jan 2025",
      qtyOrdered: 2,
      pricePerUnit: 300,
      productSale: 400,
      tax: 120,
      shipping: 80,
      subTotal: 600,
      sellerPayout: 480,
      total: 120,
      issueDate: "7 Jan 2025",
      dueDate: "21 Jan 2025",
      lastUpdated: "20 Jan 2025",
    },
    {
      id: "2",
      orderId: "#00002",
      receivedOn: "14 Feb 2025",
      grossRevenue: 700,
      netRevenue: 140,
      payoutStatus: "pending",
      sellerName: "Jane Doe",
      sellerEmail: "jane@example.com",
      sellerContact: "+254712345678",
      productName: "Handwoven basket",
      variant: "Medium, Brown",
      purchasedOn: "14 Feb 2025",
      qtyOrdered: 1,
      pricePerUnit: 700,
      productSale: 500,
      tax: 100,
      shipping: 100,
      subTotal: 700,
      sellerPayout: 560,
      total: 140,
      issueDate: "14 Feb 2025",
      dueDate: "28 Feb 2025",
      lastUpdated: "25 Feb 2025",
    },
    {
      id: "3",
      orderId: "#00003",
      receivedOn: "21 Mar 2025",
      grossRevenue: 800,
      netRevenue: 160,
      payoutStatus: "pending",
      sellerName: "John Smith",
      sellerEmail: "john@example.com",
      sellerContact: "+27123456789",
      productName: "Traditional pottery",
      variant: "Large, Blue",
      purchasedOn: "21 Mar 2025",
      qtyOrdered: 1,
      pricePerUnit: 800,
      productSale: 600,
      tax: 100,
      shipping: 100,
      subTotal: 800,
      sellerPayout: 640,
      total: 160,
      issueDate: "21 Mar 2025",
      dueDate: "4 Apr 2025",
      lastUpdated: "1 Apr 2025",
    },
    {
      id: "4",
      orderId: "#00004",
      receivedOn: "28 Apr 2025",
      grossRevenue: 900,
      netRevenue: 180,
      payoutStatus: "due-for-payment",
      sellerName: "Ahmed Ali",
      sellerEmail: "ahmed@example.com",
      sellerContact: "+20123456789",
      productName: "Leather goods",
      variant: "Small, Black",
      purchasedOn: "28 Apr 2025",
      qtyOrdered: 3,
      pricePerUnit: 300,
      productSale: 700,
      tax: 100,
      shipping: 100,
      subTotal: 900,
      sellerPayout: 720,
      total: 180,
      issueDate: "28 Apr 2025",
      dueDate: "12 May 2025",
      lastUpdated: "10 May 2025",
    },
    {
      id: "5",
      orderId: "#00005",
      receivedOn: "5 May 2025",
      grossRevenue: 1000,
      netRevenue: 200,
      payoutStatus: "processing",
      sellerName: "Kwame Nkrumah",
      sellerEmail: "kwame@example.com",
      sellerContact: "+233123456789",
      productName: "Kente cloth",
      variant: "Large, Multicolor",
      purchasedOn: "5 May 2025",
      qtyOrdered: 2,
      pricePerUnit: 500,
      productSale: 800,
      tax: 100,
      shipping: 100,
      subTotal: 1000,
      sellerPayout: 800,
      total: 200,
      issueDate: "5 May 2025",
      dueDate: "19 May 2025",
      lastUpdated: "17 May 2025",
    },
    {
      id: "6",
      orderId: "#00006",
      receivedOn: "12 Jun 2025",
      grossRevenue: 1100,
      netRevenue: 220,
      payoutStatus: "failed",
      sellerName: "Haile Selassie",
      sellerEmail: "haile@example.com",
      sellerContact: "+251123456789",
      productName: "Coffee set",
      variant: "Standard",
      purchasedOn: "12 Jun 2025",
      qtyOrdered: 1,
      pricePerUnit: 1100,
      productSale: 900,
      tax: 100,
      shipping: 100,
      subTotal: 1100,
      sellerPayout: 880,
      total: 220,
      issueDate: "12 Jun 2025",
      dueDate: "26 Jun 2025",
      lastUpdated: "24 Jun 2025",
    },
  ];

  const [revenue] = useState<RevenueData[]>(mockRevenue);

  // Calculate statistics
  const calculateStats = (): RevenueStats => {
    const grossRevenue = revenue.reduce((sum, r) => sum + r.grossRevenue, 0);
    const totalPayoutDue = revenue
      .filter((r) => r.payoutStatus === "due-for-payment")
      .reduce((sum, r) => sum + (r.sellerPayout || 0), 0);
    const netPlatformRevenue = revenue.reduce((sum, r) => sum + r.netRevenue, 0);
    
    // Calculate average payout time (mock calculation)
    const avgPayoutTime = 3.5;

    return {
      grossRevenue,
      totalPayoutDue,
      netPlatformRevenue,
      avgPayoutTime,
      grossRevenueChange: { trend: "up", value: "10%" },
      payoutDueChange: { trend: "down", value: "10%" },
      netRevenueChange: { trend: "up", value: "5%" },
      avgPayoutTimeChange: { trend: "up", value: "10%" },
    };
  };

  const stats = calculateStats();

  // Filter revenue based on tab, search, and status filters
  const filteredRevenue = revenue.filter((item) => {
    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "paid" && item.payoutStatus === "paid") ||
      (activeTab === "pending" && item.payoutStatus === "pending") ||
      (activeTab === "due-for-payment" && item.payoutStatus === "due-for-payment") ||
      (activeTab === "processing" && item.payoutStatus === "processing") ||
      (activeTab === "failed" && item.payoutStatus === "failed");

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(item.payoutStatus);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: PayoutStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTabClick = (tab: RevenueTab) => {
    setActiveTab(tab);
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: RevenueTab) => {
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

  const handleViewInvoice = (revenueItem: RevenueData) => {
    setSelectedRevenue(revenueItem);
    setIsInvoiceDialogOpen(true);
  };

  const handleDownloadPDF = () => {
    // Implement PDF download logic
    console.log("Downloading PDF for", selectedRevenue?.orderId);
  };

  // Revenue cards
  const revenueCards: CardData[] = [
    {
      title: "Gross Revenue",
      value: stats.grossRevenue.toString(),
      change: stats.grossRevenueChange && {
        trend: stats.grossRevenueChange.trend,
        value: stats.grossRevenueChange.value,
        description: "",
      },
    },
    {
      title: "Total Payout Due",
      value: stats.totalPayoutDue.toString(),
      change: stats.payoutDueChange && {
        trend: stats.payoutDueChange.trend,
        value: stats.payoutDueChange.value,
        description: "",
      },
    },
    {
      title: "Net Platform Revenue",
      value: stats.netPlatformRevenue.toString(),
      change: stats.netRevenueChange && {
        trend: stats.netRevenueChange.trend,
        value: stats.netRevenueChange.value,
        description: "",
      },
    },
    {
      title: "Avg. Payout Time",
      value: `${stats.avgPayoutTime} days`,
      change: stats.avgPayoutTimeChange && {
        trend: stats.avgPayoutTimeChange.trend,
        value: stats.avgPayoutTimeChange.value,
        description: "",
      },
    },
  ];

  // Status options for filter
  const statusOptions: { value: PayoutStatus; label: string }[] = [
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "due-for-payment", label: "Due for payment" },
    { value: "processing", label: "Processing" },
    { value: "failed", label: "Failed" },
  ];

  // Status configuration
  const statusConfig = {
    paid: {
      label: "Paid",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    "due-for-payment": {
      label: "Due for payment",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    processing: {
      label: "Processing",
      className: "bg-purple-100 text-purple-700 border-purple-300",
    },
    failed: {
      label: "Failed",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  // Table fields
  const revenueFields: TableField<RevenueData>[] = [
    {
      key: "orderId",
      header: "Order ID",
      cell: (value) => <span className="font-semibold">{value as string}</span>,
    },
    {
      key: "receivedOn",
      header: "Received on",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "grossRevenue",
      header: "Gross Revenue (USD)",
      cell: (value) => <span>{value as number}</span>,
      align: "center",
    },
    {
      key: "netRevenue",
      header: "Net Revenue (USD)",
      cell: (value) => <span>{value as number}</span>,
      align: "center",
    },
    {
      key: "payoutStatus",
      header: "Payout status",
      cell: (_, row) => {
        const config = statusConfig[row.payoutStatus];
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

  const revenueActions: TableAction<RevenueData>[] = [
    {
      type: "custom",
      label: "Actions",
      icon: <MoreHorizontal className="size-5" />,
      onClick: (revenueItem) => {
        handleViewInvoice(revenueItem);
      },
    },
  ];

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No revenue" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Revenue</h3>
    </div>
  );

  // Invoice Dialog Component
  const InvoiceDialog = () => {
    if (!selectedRevenue) return null;

    return (
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Invoice Header with Orange Gradient */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 p-8 -m-6 mb-6 rounded-t-lg">
            <div className="flex items-center justify-center">
              <div className="text-white">
                <div className="text-center">
                  <div>
                    <img src={images.logoWhite} alt="" className="w-20"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="space-y-6">
            {/* Invoice Title and Status */}
            <div className="flex items-center justify-between">
              <div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">INVOICE</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 mt-1">{selectedRevenue.orderId}</p>
              </div>
              <Badge
                variant="outline"
                className={`${statusConfig[selectedRevenue.payoutStatus].className} font-medium`}
              >
                {statusConfig[selectedRevenue.payoutStatus].label}
              </Badge>
            </div>

            {/* Invoice and Seller Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoice Details */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-semibold">Invoice Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Issue date:</span>
                    <span className="font-medium">{selectedRevenue.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Due date:</span>
                    <span className="font-medium">{selectedRevenue.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                    <span className="font-medium">{selectedRevenue.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Seller Details */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="font-semibold">Seller Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Full name:</span>
                    <span className="font-medium">{selectedRevenue.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email Address:</span>
                    <span className="font-medium">{selectedRevenue.sellerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                    <span className="font-medium">{selectedRevenue.sellerContact}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Table */}
            <div>
              <h3 className="font-semibold mb-3">Product Details</h3>
              <div className="border rounded-none overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Product name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Variant</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Purchased on</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">QTY ordered</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Price (USD)</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Gross Revenue (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900">
                    <tr className="border-t">
                      <td className="px-4 py-3 text-sm">{selectedRevenue.productName}</td>
                      <td className="px-4 py-3 text-sm">{selectedRevenue.variant}</td>
                      <td className="px-4 py-3 text-sm">{selectedRevenue.purchasedOn}</td>
                      <td className="px-4 py-3 text-sm">{selectedRevenue.qtyOrdered}</td>
                      <td className="px-4 py-3 text-sm">{selectedRevenue.pricePerUnit}</td>
                      <td className="px-4 py-3 text-sm font-medium">{selectedRevenue.grossRevenue}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t pt-4">
              <div className="full ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Product sale:</span>
                  <span>{selectedRevenue.productSale}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <span>{selectedRevenue.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span>{selectedRevenue.shipping}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Sub Total:</span>
                  <span>USD {selectedRevenue.subTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Less seller payout (80%):</span>
                  <span>{selectedRevenue.sellerPayout}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t-2">
                  <span>Total:</span>
                  <span>USD {selectedRevenue.total}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsInvoiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-black text-white hover:bg-black/90"
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            <SectionCards cards={revenueCards} layout="1x4" />

            <div className="space-y-6">
              {/* Revenue Section */}
              <div className="rounded-lg border bg-white dark:bg-[#303030]">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">All Revenue</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Manage and monitor revenue and payouts on the platform.
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
                      All Revenue
                    </button>
                    <button
                      className={getTabButtonClass("pending")}
                      onClick={() => handleTabClick("pending")}
                    >
                      Pending
                    </button>
                    <button
                      className={getTabButtonClass("due-for-payment")}
                      onClick={() => handleTabClick("due-for-payment")}
                    >
                      Due for payment
                    </button>
                    <button
                      className={getTabButtonClass("processing")}
                      onClick={() => handleTabClick("processing")}
                    >
                      Processing
                    </button>
                    <button
                      className={getTabButtonClass("paid")}
                      onClick={() => handleTabClick("paid")}
                    >
                      Paid
                    </button>
                    <button
                      className={getTabButtonClass("failed")}
                      onClick={() => handleTabClick("failed")}
                    >
                      Failed
                    </button>
                  </div>
                </div>

                {/* Revenue Table/Empty State */}
                <div className="px-6 pb-6">
                  {filteredRevenue.length > 0 ? (
                    <DataTable<RevenueData>
                      data={filteredRevenue}
                      fields={revenueFields}
                      actions={revenueActions}
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

      {/* Invoice Dialog */}
      <InvoiceDialog />
    </>
  );
}