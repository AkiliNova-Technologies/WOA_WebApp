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
import { Search } from "@/components/ui/search";
import {
  EyeIcon,
  Plus,
  Loader2,
  Download,
  FilterIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReduxUsers } from "@/hooks/useReduxUsers";
import type { UserProfile } from "@/redux/slices/usersSlice";
import images from "@/assets/images";

// Vendor/Seller type definition
type VendorStatus =
  | "pending_approval"
  | "onboarded"
  | "active"
  | "deactivated"
  | "suspended"
  | "deleted";
type VendorTier = "basic" | "premium" | "enterprise";
type DateRange = "last-7-days" | "last-30-days" | "all-time";
type VendorTab =
  | "all"
  | "pending_approval"
  | "onboarded"
  | "active"
  | "deactivated"
  | "suspended"
  | "deleted";

interface Vendor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  storeName: string;
  businessName: string;
  managerEmail: string;
  phone: string;
  country: string;
  city: string;
  storeLocation: string;
  joinDate: string;
  signedUpOn: string;
  lastActive: string;
  status: VendorStatus;
  totalProducts: number;
  totalSales: number;
  tier: VendorTier;
  avatarColor: string;
  avatar?: string;
  isVerified: boolean;
  vendorStatus?: VendorStatus;
  accountStatus?: "active" | "suspended" | "pending_deletion";
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface VendorStats {
  totalVendors: number;
  pendingApprovals: number;
  activeVendors: number;
  deletedVendors: number;
  totalProducts: number;
  totalRevenue: number;
  averageRating: number;
}

export default function AdminVendorsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<VendorStatus[]>([]);
  const [activeTab, setActiveTab] = useState<VendorTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  // Use the users hook
  const { usersList, loading, getUsers } = useReduxUsers();

  // Fetch vendors (users with vendor role) on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching vendors...");
        await getUsers({
          role: "vendor",
          limit: 50,
          page: 1,
        });
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };

    fetchData();
  }, [getUsers]);

  // Helper function to safely get users array from usersList
  const getUsersArray = (): any[] => {
    if (Array.isArray(usersList)) {
      return usersList;
    }

    const list = usersList as any;

    if (!list || typeof list !== "object") {
      return [];
    }

    if (list.data && Array.isArray(list.data)) {
      return list.data;
    }
    if (list.results && Array.isArray(list.results)) {
      return list.results;
    }
    if (list.items && Array.isArray(list.items)) {
      return list.items;
    }
    if (list.users && Array.isArray(list.users)) {
      return list.users;
    }

    const keys = Object.keys(list);
    if (keys.length > 0 && !isNaN(parseInt(keys[0]))) {
      return Object.values(list);
    }

    if (list.id || list.email || list.firstName) {
      return [list];
    }

    return [];
  };

  // Map UserProfile to Vendor for compatibility
  const mapUserToVendor = (user: UserProfile | any): Vendor | null => {
    if (!user || typeof user !== "object") {
      console.warn("Invalid user object:", user);
      return null;
    }

    try {
      const userId = user.id || user._id || user.userId || "0";

      // Determine status based on vendorStatus or accountStatus
      let status: VendorStatus = "active";
      
      // Map various statuses to match the design
      if (user.vendorStatus === "pending" || user.accountStatus === "pending") {
        status = "pending_approval";
      } else if (user.vendorStatus === "approved" || user.accountStatus === "approved") {
        status = "active";
      } else if (user.vendorStatus === "rejected" || user.accountStatus === "rejected") {
        status = "deleted";
      } else if (user.accountStatus === "suspended") {
        status = "suspended";
      } else if (user.accountStatus === "deactivated") {
        status = "deactivated";
      } else if (user.accountStatus === "onboarded") {
        status = "onboarded";
      } else if (user.accountStatus === "active") {
        status = "active";
      } else if (user.accountStatus === "deleted" || user.accountStatus === "pending_deletion") {
        status = "deleted";
      }

      // Determine tier based on user type or other metric
      let tier: VendorTier = "basic";
      if (user.userType === "premium" || user.tier === "premium") {
        tier = "premium";
      } else if (user.userType === "enterprise" || user.tier === "enterprise") {
        tier = "enterprise";
      }

      // Generate store name
      const storeName =
        user.businessName ||
        user.storeName ||
        `${user.firstName || "Vendor"}'s Store`;

      // Get user details with fallbacks
      const firstName = user.firstName || user.name?.split(" ")[0] || "Unknown";
      const lastName =
        user.lastName || user.name?.split(" ").slice(1).join(" ") || "";
      const email = user.email || "No email";
      const phoneNumber =
        user.phoneNumber || user.phone || "Not provided";
      const country = user.country || "Unknown";
      const city = user.city || "Unknown";
      const createdAt = user.createdAt || new Date().toISOString();
      const updatedAt = user.updatedAt || createdAt;

      // For demo purposes - in production, fetch actual vendor stats
      const totalProducts =
        user.totalProducts ||
        user.productsCount ||
        user.productCount ||
        Math.floor(Math.random() * 100);
      const totalSales =
        user.totalSales ||
        user.salesCount ||
        user.revenue ||
        Math.floor(Math.random() * 10000);

      return {
        id: userId.toString(),
        email,
        firstName,
        lastName,
        phoneNumber,
        storeName,
        businessName: storeName,
        managerEmail: email,
        phone: phoneNumber,
        country,
        city,
        storeLocation:
          user.businessAddress || user.address || `${city}, ${country}`,
        joinDate: createdAt,
        signedUpOn: createdAt,
        lastActive: updatedAt,
        status,
        totalProducts,
        totalSales,
        tier,
        avatarColor: "",
        avatar: user.avatar || user.profileImage,
        isVerified: user.emailVerified || user.verified || false,
        vendorStatus: status,
        accountStatus: user.accountStatus,
        createdAt,
        updatedAt,
      };
    } catch (error) {
      console.error("Error mapping user to seller:", error, user);
      return null;
    }
  };

  // Calculate vendor statistics from users list
  const calculateStats = (vendors: Vendor[]): VendorStats => {
    const totalVendors = vendors.length;
    const pendingApprovals = vendors.filter(
      (s) => s.status === "pending_approval"
    ).length;
    const activeVendors = vendors.filter(
      (s) => s.status === "active"
    ).length;
    const deletedVendors = vendors.filter(
      (s) => s.status === "deleted"
    ).length;
    const totalProducts = vendors.reduce(
      (sum, s) => sum + (s.totalProducts || 0),
      0
    );
    const totalRevenue = vendors.reduce(
      (sum, s) => sum + (s.totalSales || 0),
      0
    );

    return {
      totalVendors,
      pendingApprovals,
      activeVendors,
      deletedVendors,
      totalProducts,
      totalRevenue,
      averageRating: 4.5,
    };
  };

  // Safely get users array and map to vendors
  const usersArray = getUsersArray();
  const vendors = usersArray
    .map(mapUserToVendor)
    .filter((vendor): vendor is Vendor => vendor !== null);

  const stats = calculateStats(vendors);

  // Filter vendors based on tab, search and status filters
  const filteredVendors = vendors.filter((vendor) => {
    // Tab filtering
    let matchesTab = true;
    if (activeTab !== "all") {
      matchesTab = activeTab === vendor.status;
    }

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      (vendor.storeName &&
        vendor.storeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      `${vendor.firstName} ${vendor.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.country &&
        vendor.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vendor.city &&
        vendor.city.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(vendor.status);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: VendorStatus) => {
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

  const handleTabClick = (tab: VendorTab) => {
    setActiveTab(tab);
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: VendorTab) => {
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

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown";
      }
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  // Vendor cards matching the design
  const vendorCards: CardData[] = [
    {
      title: "Total Sellers",
      value: formatNumberShort(stats.totalVendors),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Pending Approvals",
      value: formatNumberShort(stats.pendingApprovals),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Active Sellers",
      value: formatNumberShort(stats.activeVendors),
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Deleted Sellers",
      value: formatNumberShort(stats.deletedVendors),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
  ];

  // Status configuration matching the design
  const statusConfig = {
    pending_approval: {
      label: "Pending approval",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    onboarded: {
      label: "Onboarded",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    active: {
      label: "Active",
      className: "bg-teal-50 text-teal-700 border-teal-200",
    },
    deactivated: {
      label: "Deactivated",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
    suspended: {
      label: "Suspended",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    deleted: {
      label: "Deleted",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  } as const;

  // Available status options for filter
  const statusOptions: { value: VendorStatus; label: string }[] = [
    { value: "pending_approval", label: "Pending Approval" },
    { value: "onboarded", label: "Onboarded" },
    { value: "active", label: "Active" },
    { value: "deactivated", label: "Deactivated" },
    { value: "suspended", label: "Suspended" },
    { value: "deleted", label: "Deleted" },
  ];

  // Table fields matching the design - simplified columns
  const vendorFields: TableField<Vendor>[] = [
    {
      key: "name",
      header: "Seller name",
      cell: (_, row) => (
        <span className="font-medium">
          {row.firstName} {row.lastName}
        </span>
      ),
      align: "left",
    },
    {
      key: "signedUpOn",
      header: "Signed up on",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(row.signedUpOn)}
        </span>
      ),
      align: "left",
      enableSorting: true,
    },
    {
      key: "businessName",
      header: "Business name",
      cell: (_, row) => (
        <span className="font-medium">{row.businessName}</span>
      ),
      align: "left",
    },
    {
      key: "location",
      header: "Location",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.city}, {row.country}
        </span>
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

  const vendorActions: TableAction<Vendor>[] = [
    {
      type: "view",
      label: "View Seller Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (vendor) => {
        navigate(`/admin/users/vendors/${vendor.id}/details`);
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader label="Seller Management" />
      <div className="p-6 space-y-6">
        <SectionCards cards={vendorCards} layout="1x4" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  All Sellers
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all sellers on the platform
                </p>
              </div>
              <Button
                variant="default"
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={() => navigate("/admin/users/vendors/create")}
              >
                <Plus className="h-4 w-4 mr-2" /> Create Seller
              </Button>
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
                className={getTabButtonClass("pending_approval")}
                onClick={() => handleTabClick("pending_approval")}
              >
                Pending Approval
              </button>
              <button
                className={getTabButtonClass("onboarded")}
                onClick={() => handleTabClick("onboarded")}
              >
                Onboarded
              </button>
              <button
                className={getTabButtonClass("active")}
                onClick={() => handleTabClick("active")}
              >
                Active
              </button>
              <button
                className={getTabButtonClass("deactivated")}
                onClick={() => handleTabClick("deactivated")}
              >
                Deactivated
              </button>
              <button
                className={getTabButtonClass("suspended")}
                onClick={() => handleTabClick("suspended")}
              >
                Suspended
              </button>
              <button
                className={getTabButtonClass("deleted")}
                onClick={() => handleTabClick("deleted")}
              >
                Deleted
              </button>
            </div>
          </div>

          {/* Vendors Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : vendors.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Sellers Found
                </h3>
                <p className="text-muted-foreground">
                  No sellers have signed up yet.
                </p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <p className="text-muted-foreground">
                  {searchQuery ||
                  selectedStatuses.length > 0 ||
                  activeTab !== "all"
                    ? "No sellers found matching your criteria"
                    : "No sellers found"}
                </p>
              </div>
            ) : (
              <DataTable<Vendor>
                data={filteredVendors}
                fields={vendorFields}
                actions={vendorActions}
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