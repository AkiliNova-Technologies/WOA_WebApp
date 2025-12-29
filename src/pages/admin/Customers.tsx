import { useState, useEffect, useMemo } from "react";
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
import { EyeIcon, FilterIcon, Download, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useReduxUsers } from "@/hooks/useReduxUsers";
import images from "@/assets/images";

// Customer type definition
export type CustomerStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_deletion"
  | "disabled"
  | "deleted"
  | "deactivated"
  | "pending_approval";

  
type CustomerTier = "bronze" | "silver" | "gold" | "platinum";
type DateRange = "last-7-days" | "last-30-days" | "all-time";
type CustomerTab = "all" | "active" | "suspended" | "deactivated" | "deleted";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  country: string;
  city: string;
  address: string;
  joinDate: string;
  lastActive: string;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  tier: CustomerTier;
  avatarColor: string;
  isActive: boolean;
  accountStatus?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  signedUpOn?: string;
  [key: string]: any;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  suspendedCustomers: number;
  deletedCustomers: number;
  newSignups: number;
  suspendedAccounts: number;
  totalOrders: number;
  totalRevenue: number;
}

export const mapUserToCustomer = (user: any): Customer => {
  // Generate avatar color based on user ID for consistency
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-orange-100 text-orange-600",
    "bg-teal-100 text-teal-600",
    "bg-yellow-100 text-yellow-600",
    "bg-indigo-100 text-indigo-600",
    "bg-red-100 text-red-600",
    "bg-violet-100 text-violet-600",
  ];
  const colorIndex = (parseInt(user.id || "0", 10) || 0) % colors.length;

  // Map accountStatus to CustomerStatus
  let status: CustomerStatus = "active";

  const accountStatus = user.accountStatus?.toLowerCase();

  if (accountStatus === "active") {
    status = "active";
  } else if (accountStatus === "suspended") {
    status = "suspended";
  } else if (accountStatus === "pending_deletion") {
    status = "pending_deletion";
  } else if (accountStatus === "pending_approval") {
    status = "pending_approval";
  } else if (
    accountStatus === "disabled" ||
    accountStatus === "pending_deletion"
  ) {
    status = "disabled";
  } else if (accountStatus === "deleted") {
    status = "deleted";
  } else if (accountStatus === "deactivated") {
    status = "deactivated";
  } else if (!user.isActive) {
    status = "inactive";
  }

  let tier: CustomerTier = "bronze";

  const totalOrders = user.totalOrders || Math.floor(Math.random() * 30);
  const totalSpent = user.totalSpent || Math.floor(Math.random() * 5000);

  const country = user.country || "Unknown";
  const city = user.city || "Unknown";
  const address = user.address || `${city}, ${country}`;

  return {
    id: user.id?.toString() || "",
    name:
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Unknown Customer",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "Not provided",
    country,
    city,
    address,
    joinDate: user.createdAt,
    signedUpOn: user.createdAt,
    lastActive: user.updatedAt || user.createdAt,
    status,
    totalOrders,
    totalSpent,
    tier,
    avatarColor: colors[colorIndex],
    isActive: user.accountStatus === "active",
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    avatar: user.avatar,
  };
};

export default function AdminCustomersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CustomerStatus[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<CustomerTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  const { usersList, loading, getUsers } = useReduxUsers();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getUsers({ role: "client" });
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };

    fetchData();
  }, [getUsers]);

  const customers = useMemo(() => {
    if (!Array.isArray(usersList)) {
      console.warn("usersList is not an array:", usersList);
      return [];
    }
    return usersList.map(mapUserToCustomer);
  }, [usersList]);

  const stats = useMemo(() => calculateStats(customers), [customers]);

  function calculateStats(customers: Customer[]): CustomerStats {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(
      (c) => c.status === "active"
    ).length;
    const suspendedCustomers = customers.filter(
      (c) => c.status === "suspended"
    ).length;
    const deletedCustomers = customers.filter(
      (c) => c.status === "deleted"
    ).length;

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newSignups = customers.filter((c) => {
      try {
        const joinDate = new Date(c.createdAt);
        return joinDate > monthAgo;
      } catch (error) {
        return false;
      }
    }).length;

    const suspendedAccounts = customers.filter(
      (c) => c.status === "suspended"
    ).length;
    const totalOrders = customers.reduce(
      (sum, c) => sum + (c.totalOrders || 0),
      0
    );
    const totalRevenue = customers.reduce(
      (sum, c) => sum + (c.totalSpent || 0),
      0
    );

    return {
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      deletedCustomers,
      newSignups,
      suspendedAccounts,
      totalOrders,
      totalRevenue,
    };
  }

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer: Customer) => {
        const matchesSearch =
          searchQuery === "" ||
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.city.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatusFilter =
          selectedStatuses.length === 0 ||
          selectedStatuses.includes(customer.status);

        const matchesTab =
          activeTab === "all" ||
          (activeTab === "active" && customer.status === "active") ||
          (activeTab === "suspended" && customer.status === "suspended") ||
          (activeTab === "deactivated" &&
            (customer.status === "deactivated" ||
              customer.status === "disabled" ||
              customer.status === "pending_deletion")) ||
          (activeTab === "deleted" && customer.status === "deleted");

        return matchesSearch && matchesStatusFilter && matchesTab;
      }),
    [customers, searchQuery, selectedStatuses, activeTab]
  );

  const formatNumberShort = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Status options for filter dropdown
  const statusOptions: { value: CustomerStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "deactivated", label: "Deactivated" },
    { value: "deleted", label: "Deleted" },
    { value: "disabled", label: "Disabled" },
    { value: "pending_deletion", label: "Pending Deletion" },
  ];

  const handleStatusFilterChange = (status: CustomerStatus) => {
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

  const handleTabClick = (tab: CustomerTab) => {
    setActiveTab(tab);
    // Clear status filters when switching tabs
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: CustomerTab) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";

    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-teal-50 text-teal-700 border-teal-200",
    },
    inactive: {
      label: "Inactive",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    },
    suspended: {
      label: "Suspended",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    deactivated: {
      label: "Deactivated",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
    pending_deletion: {
      label: "Pending Deletion",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    pending_approval: {
      label: "Pending Approval",
      className: "bg-mint-50 text-mint-700 border-mint-200",
    },
    disabled: {
      label: "Disabled",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    deleted: {
      label: "Deleted",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  } as const;

  // Stats cards in the same format as other pages
  const statsCards: CardData[] = [
    {
      title: "Total Customers",
      value: formatNumberShort(stats.totalCustomers),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
    {
      title: "Active Customers",
      value: formatNumberShort(stats.activeCustomers),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
    {
      title: "Suspended Customers",
      value: formatNumberShort(stats.suspendedCustomers),
      change: {
        trend: "down",
        value: "5%",
        description: "",
      },
    },
    {
      title: "Deleted Customers",
      value: formatNumberShort(stats.deletedCustomers),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
  ];

  // Updated table fields to match the design - simplified columns without avatars
  const customerFields: TableField<Customer>[] = [
    {
      key: "name",
      header: "Customer name",
      cell: (_, row) => <span className="font-medium">{row.name}</span>,
      align: "left",
    },
    {
      key: "signedUpOn",
      header: "Signed up on",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(row.signedUpOn || row.createdAt)}
        </span>
      ),
      align: "left",
      enableSorting: true,
    },
    {
      key: "email",
      header: "Email Address",
      cell: (_, row) => <span className="font-medium">{row.email}</span>,
      align: "left",
    },
    {
      key: "address",
      header: "Location",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">{`${row.city}, ${row.country}`}</span>
      ),
      align: "left",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status] || statusConfig.active;

        return (
          <Badge
            variant="outline"
            className={`${config.className} font-medium`}
          >
            {config.label}
          </Badge>
        );
      },
      align: "left",
      enableSorting: true,
    },
  ];

  const customerActions: TableAction<Customer>[] = [
    {
      type: "view",
      label: "View Customer Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (customer: Customer) => {
        navigate(`/admin/users/customers/${customer.id}/details`);
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader label="Customer Management" />
      <div className="p-6 space-y-6">
        <SectionCards cards={statsCards} layout="1x4" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  All Customers
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all customers on the platform
                </p>
              </div>
            </div>

            {/* Search and Filters */}
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
                {/* Time Period Buttons */}
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

                {/* Filter Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-10"
                      disabled={loading}
                    >
                      <FilterIcon className="w-4 h-4" />
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

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 px-6 overflow-x-auto">
              <button
                className={getTabButtonClass("all")}
                onClick={() => handleTabClick("all")}
              >
                All Customers
              </button>
              <button
                className={getTabButtonClass("active")}
                onClick={() => handleTabClick("active")}
              >
                Active
              </button>
              <button
                className={getTabButtonClass("suspended")}
                onClick={() => handleTabClick("suspended")}
              >
                Suspended
              </button>
              <button
                className={getTabButtonClass("deactivated")}
                onClick={() => handleTabClick("deactivated")}
              >
                Deactivated
              </button>
              <button
                className={getTabButtonClass("deleted")}
                onClick={() => handleTabClick("deleted")}
              >
                Deleted
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Customers Found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  No customers have signed up yet.
                </p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <p className="text-muted-foreground">
                  {searchQuery ||
                  selectedStatuses.length > 0 ||
                  activeTab !== "all"
                    ? "No customers found matching your criteria"
                    : "No customers found"}
                </p>
              </div>
            ) : (
              <DataTable<Customer>
                data={filteredCustomers}
                fields={customerFields}
                actions={customerActions}
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
