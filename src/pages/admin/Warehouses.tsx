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
import { ListFilter, Download, Plus, MoreHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";

type WarehouseStatus = "active" | "inactive" | "closed" | "draft";
type WarehouseTab = "all" | "active" | "inactive" | "closed" | "draft";
type DateRange = "last-7-days" | "last-30-days" | "all-time";

interface WarehouseData {
  id: string;
  warehouseId: string;
  country: string;
  city: string;
  currentVolume: number;
  capacityUsage: number;
  status: WarehouseStatus;
  createdOn: string;
  manager: string;
  [key: string]: any;
}

interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  inactiveWarehouses: number;
  closedWarehouses: number;
  totalChange?: { trend: "up" | "down"; value: string };
  activeChange?: { trend: "up" | "down"; value: string };
  inactiveChange?: { trend: "up" | "down"; value: string };
  closedChange?: { trend: "up" | "down"; value: string };
}

export default function AdminWarehousesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<WarehouseStatus[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<WarehouseTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  // Mock warehouse data
  const mockWarehouses: WarehouseData[] = [
    {
      id: "1",
      warehouseId: "WOA-001",
      country: "Nigeria",
      city: "Lagos",
      currentVolume: 10,
      capacityUsage: 5,
      status: "active",
      createdOn: "2024-01-15",
      manager: "Victor Wandulu",
    },
    {
      id: "2",
      warehouseId: "WOA-002",
      country: "Kenya",
      city: "Nairobi",
      currentVolume: 0,
      capacityUsage: 10,
      status: "inactive",
      createdOn: "2024-02-10",
      manager: "Jane Doe",
    },
    {
      id: "3",
      warehouseId: "WOA-003",
      country: "South Africa",
      city: "Cape town",
      currentVolume: 0,
      capacityUsage: 15,
      status: "inactive",
      createdOn: "2024-03-05",
      manager: "John Smith",
    },
    {
      id: "4",
      warehouseId: "WOA-004",
      country: "Egypt",
      city: "Cairo",
      currentVolume: 0,
      capacityUsage: 20,
      status: "inactive",
      createdOn: "2024-04-20",
      manager: "Ahmed Ali",
    },
    {
      id: "5",
      warehouseId: "WOA-005",
      country: "Ghana",
      city: "Accra",
      currentVolume: 50,
      capacityUsage: 25,
      status: "active",
      createdOn: "2024-05-12",
      manager: "Kwame Nkrumah",
    },
    {
      id: "6",
      warehouseId: "WOA-006",
      country: "Ethiopia",
      city: "Adis Ababa",
      currentVolume: 60,
      capacityUsage: 10,
      status: "active",
      createdOn: "2024-06-08",
      manager: "Haile Selassie",
    },
  ];

  const [warehouses] = useState<WarehouseData[]>(mockWarehouses);

  // Calculate statistics
  const calculateStats = (): WarehouseStats => {
    const totalWarehouses = warehouses.length;
    const activeWarehouses = warehouses.filter(
      (w) => w.status === "active"
    ).length;
    const inactiveWarehouses = warehouses.filter(
      (w) => w.status === "inactive"
    ).length;
    const closedWarehouses = warehouses.filter(
      (w) => w.status === "closed"
    ).length;

    return {
      totalWarehouses,
      activeWarehouses,
      inactiveWarehouses,
      closedWarehouses,
      totalChange: { trend: "up", value: "10%" },
      activeChange: { trend: "down", value: "10%" },
      inactiveChange: { trend: "up", value: "5%" },
      closedChange: { trend: "up", value: "10%" },
    };
  };

  const stats = calculateStats();

  // Filter warehouses based on tab, search, and status filters
  const filteredWarehouses = warehouses.filter((warehouse) => {
    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && warehouse.status === "active") ||
      (activeTab === "inactive" && warehouse.status === "inactive") ||
      (activeTab === "closed" && warehouse.status === "closed") ||
      (activeTab === "draft" && warehouse.status === "draft");

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      warehouse.warehouseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.city.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(warehouse.status);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: WarehouseStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTabClick = (tab: WarehouseTab) => {
    setActiveTab(tab);
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: WarehouseTab) => {
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

  // Warehouse cards
  const warehouseCards: CardData[] = [
    {
      title: "Total warehouses",
      value: stats.totalWarehouses.toString(),
      change: stats.totalChange && {
        trend: stats.totalChange.trend,
        value: stats.totalChange.value,
        description: "",
      },
    },
    {
      title: "Active warehouses",
      value: stats.activeWarehouses.toString(),
      change: stats.activeChange && {
        trend: stats.activeChange.trend,
        value: stats.activeChange.value,
        description: "",
      },
    },
    {
      title: "Inactive warehouses",
      value: stats.inactiveWarehouses.toString(),
      change: stats.inactiveChange && {
        trend: stats.inactiveChange.trend,
        value: stats.inactiveChange.value,
        description: "",
      },
    },
    {
      title: "Closed warehouses",
      value: stats.closedWarehouses.toString(),
      change: stats.closedChange && {
        trend: stats.closedChange.trend,
        value: stats.closedChange.value,
        description: "",
      },
    },
  ];

  // Status options for filter
  const statusOptions: { value: WarehouseStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "closed", label: "Closed" },
    { value: "draft", label: "Draft" },
  ];

  // Status configuration
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    inactive: {
      label: "Inactive",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    draft: {
      label: "Draft",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
  } as const;

  // Table fields
  const warehouseFields: TableField<WarehouseData>[] = [
    {
      key: "warehouseId",
      header: "Warehouse ID",
      cell: (value) => <span className="font-semibold">{value as string}</span>,
    },
    {
      key: "country",
      header: "Country",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "city",
      header: "City",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "currentVolume",
      header: "Current volume",
      cell: (value) => <span>{value as number}</span>,
      align: "center",
    },
    {
      key: "capacityUsage",
      header: "Capacity usage (%)",
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

  const warehouseActions: TableAction<WarehouseData>[] = [
    {
      type: "custom",
      label: "Actions",
      icon: <MoreHorizontal className="size-5" />,
      onClick: (warehouse) => {
        navigate(`/admin/logistics/${warehouse.id}/warehouse-details`);
      },
    },
  ];

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No warehouses" className="w-80 " />
      </div>
      <h3 className="text-xl font-semibold mb-2">No warehouses</h3>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            <SectionCards cards={warehouseCards} layout="1x4" />

            <div className="space-y-6">
              {/* Warehouses Section */}
              <div className="rounded-lg border bg-white dark:bg-[#303030]">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">All Warehouses</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Manage and monitor all warehouses.
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        navigate("/admin/logistics/create-warehouse")
                      }
                      className="bg-black text-white hover:bg-black/90 rounded-md"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Warehouse
                    </Button>
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

                {/* Tab Navigation - Updated to match design */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-0 px-6 overflow-x-auto">
                    <button
                      className={getTabButtonClass("all")}
                      onClick={() => handleTabClick("all")}
                    >
                      All Sellers
                    </button>
                    <button
                      className={getTabButtonClass("active")}
                      onClick={() => handleTabClick("active")}
                    >
                      Active
                    </button>
                    <button
                      className={getTabButtonClass("inactive")}
                      onClick={() => handleTabClick("inactive")}
                    >
                      Inactive
                    </button>
                    <button
                      className={getTabButtonClass("closed")}
                      onClick={() => handleTabClick("closed")}
                    >
                      Closed
                    </button>
                    <button
                      className={getTabButtonClass("draft")}
                      onClick={() => handleTabClick("draft")}
                    >
                      Draft
                    </button>
                  </div>
                </div>

                {/* Warehouses Table/Empty State */}
                <div className="px-6 pb-6">
                  {filteredWarehouses.length > 0 ? (
                    <DataTable<WarehouseData>
                      data={filteredWarehouses}
                      fields={warehouseFields}
                      actions={warehouseActions}
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
