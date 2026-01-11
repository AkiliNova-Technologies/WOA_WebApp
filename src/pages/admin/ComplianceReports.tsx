import { useState } from "react";
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
import { ListFilter, Download, Eye } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";

type CaseStatus = "open" | "in-progress" | "resolved" | "closed";
type CaseTab = "all" | "open" | "in-progress" | "resolved" | "closed";
type DateRange = "last-7-days" | "last-30-days" | "all-time";
type ReportType = "product" | "review" | "seller" | "other";

interface ComplianceReportData {
  id: string;
  reportId: string;
  dateReported: string;
  reportedBy: string;
  reportType: ReportType;
  status: CaseStatus;
  issueType?: string;
  description?: string;
  reporterFullName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  reportedItemName?: string;
  reportedItemEmail?: string;
  reportedItemPhone?: string;
  [key: string]: any;
}

interface ComplianceStats {
  reportedCases: number;
  openCases: number;
  inProgressCases: number;
  closedCases: number;
  reportedChange?: { trend: "up" | "down"; value: string };
  openChange?: { trend: "up" | "down"; value: string };
  inProgressChange?: { trend: "up" | "down"; value: string };
  closedChange?: { trend: "up" | "down"; value: string };
}

export default function AdminComplianceReportsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CaseStatus[]>([]);
  const [activeTab, setActiveTab] = useState<CaseTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  // Mock compliance reports data
  const mockReports: ComplianceReportData[] = [
    {
      id: "1",
      reportId: "RPT-120625-001",
      dateReported: "7 Jan 2025",
      reportedBy: "Alice Johnson",
      reportType: "product",
      status: "open",
      issueType: "Review contains nudity or erotic messages",
      description:
        "The review posted includes sexually explicit language and references that are not related to the product. It violates community guidelines and makes the platform unsafe for other users.",
      reporterFullName: "Alice Johnson",
      reporterEmail: "alice.johnson@email.com",
      reporterPhone: "+447911123456",
      reportedItemName: "Joe Doe",
      reportedItemEmail: "j.doe@gmail.com",
      reportedItemPhone: "+447911123456",
    },
    {
      id: "2",
      reportId: "RPT-041023-001",
      dateReported: "14 Feb 2025",
      reportedBy: "Robert Smith",
      reportType: "product",
      status: "resolved",
      issueType: "Counterfeit product",
      description: "Product appears to be a counterfeit item.",
      reporterFullName: "Robert Smith",
      reporterEmail: "robert.smith@email.com",
      reporterPhone: "+447911123457",
      reportedItemName: "Seller XYZ",
      reportedItemEmail: "seller@xyz.com",
      reportedItemPhone: "+447911123457",
    },
    {
      id: "3",
      reportId: "RPT-041023-002",
      dateReported: "21 Mar 2025",
      reportedBy: "Maria Garcia",
      reportType: "review",
      status: "in-progress",
      issueType: "Fake review",
      description: "This review appears to be fake and misleading.",
      reporterFullName: "Maria Garcia",
      reporterEmail: "maria.garcia@email.com",
      reporterPhone: "+447911123458",
      reportedItemName: "Product ABC",
      reportedItemEmail: "product@abc.com",
      reportedItemPhone: "+447911123458",
    },
    {
      id: "4",
      reportId: "RPT-041023-003",
      dateReported: "28 Apr 2025",
      reportedBy: "David Lee",
      reportType: "review",
      status: "in-progress",
      issueType: "Spam content",
      description: "Review contains spam and promotional links.",
      reporterFullName: "David Lee",
      reporterEmail: "david.lee@email.com",
      reporterPhone: "+447911123459",
      reportedItemName: "Review Author",
      reportedItemEmail: "author@email.com",
      reportedItemPhone: "+447911123459",
    },
    {
      id: "5",
      reportId: "RPT-041023-004",
      dateReported: "5 May 2025",
      reportedBy: "Jessica Wong",
      reportType: "product",
      status: "closed",
      issueType: "Misleading description",
      description: "Product description is misleading and inaccurate.",
      reporterFullName: "Jessica Wong",
      reporterEmail: "jessica.wong@email.com",
      reporterPhone: "+447911123460",
      reportedItemName: "Product Seller",
      reportedItemEmail: "seller@product.com",
      reportedItemPhone: "+447911123460",
    },
    {
      id: "6",
      reportId: "RPT-041023-005",
      dateReported: "12 Jun 2025",
      reportedBy: "Michael Brown",
      reportType: "review",
      status: "open",
      issueType: "Offensive language",
      description: "Review contains offensive and inappropriate language.",
      reporterFullName: "Michael Brown",
      reporterEmail: "michael.brown@email.com",
      reporterPhone: "+447911123461",
      reportedItemName: "Reviewer",
      reportedItemEmail: "reviewer@email.com",
      reportedItemPhone: "+447911123461",
    },
  ];

  const [reports] = useState<ComplianceReportData[]>(mockReports);

  // Calculate statistics
  const calculateStats = (): ComplianceStats => {
    const reportedCases = reports.length;
    const openCases = reports.filter((r) => r.status === "open").length;
    const inProgressCases = reports.filter((r) => r.status === "in-progress").length;
    const closedCases = reports.filter((r) => r.status === "closed").length;

    return {
      reportedCases,
      openCases,
      inProgressCases,
      closedCases,
      reportedChange: { trend: "up", value: "10%" },
      openChange: { trend: "down", value: "10%" },
      inProgressChange: { trend: "up", value: "5%" },
      closedChange: { trend: "up", value: "10%" },
    };
  };

  const stats = calculateStats();

  // Filter reports based on tab, search, and status filters
  const filteredReports = reports.filter((report) => {
    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "open" && report.status === "open") ||
      (activeTab === "in-progress" && report.status === "in-progress") ||
      (activeTab === "resolved" && report.status === "resolved") ||
      (activeTab === "closed" && report.status === "closed");

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      report.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(report.status);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: CaseStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleTabClick = (tab: CaseTab) => {
    setActiveTab(tab);
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: CaseTab) => {
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

  // Compliance cards
  const complianceCards: CardData[] = [
    {
      title: "Reported Cases",
      value: stats.reportedCases.toString(),
      change: stats.reportedChange && {
        trend: stats.reportedChange.trend,
        value: stats.reportedChange.value,
        description: "",
      },
    },
    {
      title: "Open Cases",
      value: stats.openCases.toString(),
      change: stats.openChange && {
        trend: stats.openChange.trend,
        value: stats.openChange.value,
        description: "",
      },
    },
    {
      title: "In Progress Cases",
      value: stats.inProgressCases.toString(),
      change: stats.inProgressChange && {
        trend: stats.inProgressChange.trend,
        value: stats.inProgressChange.value,
        description: "",
      },
    },
    {
      title: "Closed Cases",
      value: stats.closedCases.toString(),
      change: stats.closedChange && {
        trend: stats.closedChange.trend,
        value: stats.closedChange.value,
        description: "",
      },
    },
  ];

  // Status options for filter
  const statusOptions: { value: CaseStatus; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  // Status configuration
  const statusConfig = {
    open: {
      label: "Open",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    "in-progress": {
      label: "In progress",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    resolved: {
      label: "Resolved",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
  } as const;

  // Table fields
  const reportFields: TableField<ComplianceReportData>[] = [
    {
      key: "reportId",
      header: "Report ID",
      cell: (value) => <span className="font-semibold">{value as string}</span>,
    },
    {
      key: "dateReported",
      header: "Date reported",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "reportedBy",
      header: "Reported by",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "reportType",
      header: "Report type",
      cell: (value) => <span className="capitalize">{value as string}</span>,
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status];
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

  const reportActions: TableAction<ComplianceReportData>[] = [
    {
      type: "custom",
      label: "View Details",
      icon: <Eye className="size-5" />,
      onClick: (report) => {
        navigate(`/admin/support/compliance-reports/${report.id}/details`);
      },
    },
  ];

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No cases" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Cases</h3>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            <SectionCards cards={complianceCards} layout="1x4" />

            <div className="space-y-6">
              {/* Compliance Reports Section */}
              <div className="rounded-lg border bg-white dark:bg-[#303030]">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">All compliance reports</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Manage and monitor compliance reports on the platform.
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
                        <Button variant="outline" className="flex items-center gap-2">
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
                            onCheckedChange={() => handleStatusFilterChange(status.value)}
                          >
                            {status.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Export Button */}
                    <Button variant="outline" className="flex items-center gap-2">
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
                      All cases
                    </button>
                    <button
                      className={getTabButtonClass("open")}
                      onClick={() => handleTabClick("open")}
                    >
                      Open
                    </button>
                    <button
                      className={getTabButtonClass("in-progress")}
                      onClick={() => handleTabClick("in-progress")}
                    >
                      In progress
                    </button>
                    <button
                      className={getTabButtonClass("resolved")}
                      onClick={() => handleTabClick("resolved")}
                    >
                      Resolved
                    </button>
                    <button
                      className={getTabButtonClass("closed")}
                      onClick={() => handleTabClick("closed")}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                {/* Reports Table/Empty State */}
                <div className="px-6 pb-6">
                  {filteredReports.length > 0 ? (
                    <DataTable<ComplianceReportData>
                      data={filteredReports}
                      fields={reportFields}
                      actions={reportActions}
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