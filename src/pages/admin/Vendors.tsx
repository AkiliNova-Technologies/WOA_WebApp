import { useState, useEffect, useRef, useMemo } from "react";
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
import { EyeIcon, Plus, Loader2, Download, FilterIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReduxVendors, type CombinedVendor } from "@/hooks/useReduxVendors";
import images from "@/assets/images";

// Types - Add rejected to VendorStatus
type VendorStatus = 
  | "pending"
  | "active" 
  | "suspended"
  | "deactivated"
  | "rejected" 
  | "deleted";
type DateRange = "last-7-days" | "last-30-days" | "all-time";
type VendorTab =
  | "all"
  | "pending"
  | "active"
  | "suspended"
  | "deactivated"
  | "rejected"
  | "deleted";

// Status configuration - Add rejected status
const statusConfig = {
  pending: {
    label: "Pending Approval",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  },
  active: {
    label: "Active",
    className:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
  },
  suspended: {
    label: "Suspended",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  },
  deactivated: {
    label: "Deactivated",
    className:
      "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  },
  deleted: {
    label: "Deleted",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  },
} as const;

// Helper function to generate avatar color
const generateAvatarColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2',
    '#EF476F', '#073B4C', '#7209B7', '#3A86FF', '#FB5607'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Transform API vendor data to CombinedVendor format
const transformVendorData = (apiVendor: any): CombinedVendor => {
  const user = apiVendor.user || {};
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const email = user.email || '';
  const storeName = apiVendor.storeName || 'No Business Name';
  const city = apiVendor.city || '';
  const country = apiVendor.country || '';
  
  return {
    // IDs - IMPORTANT: Keep both vendor id and userId
    id: apiVendor.id,
    userId: apiVendor.userId,  // This is what we need for the API
    vendorId: apiVendor.id,
    
    // User data
    firstName,
    lastName,
    email,
    phoneNumber: apiVendor.phoneNumber || '',
    accountStatus: user.accountStatus || 'active',
    userRole: user.role || 'vendor',
    
    // Business/Vendor data
    businessName: storeName,
    storeName,
    businessDescription: apiVendor.description || '',
    description: apiVendor.description || '',
    businessEmail: email,
    managerEmail: email,
    businessPhone: apiVendor.phoneNumber || '',
    phone: apiVendor.phoneNumber || '',
    businessAddress: `${city}${city && country ? ', ' : ''}${country}`.trim() || 'Not specified',
    
    // Location
    city,
    country,
    location: `${city}${city && country ? ', ' : ''}${country}`.trim() || 'Not specified',
    storeLocation: `${city}${city && country ? ', ' : ''}${country}`.trim() || 'Not specified',
    
    // Status
    vendorStatus: apiVendor.vendorStatus as VendorStatus,
    status: apiVendor.vendorStatus as VendorStatus,
    isVerified: apiVendor.kycStatus === 'approved',
    
    // Dates
    createdAt: apiVendor.createdAt,
    signedUpOn: apiVendor.createdAt,
    joinedAt: apiVendor.createdAt,
    joinDate: apiVendor.createdAt,
    updatedAt: apiVendor.createdAt,
    lastActiveAt: apiVendor.createdAt,
    lastActive: apiVendor.createdAt,
    
    // Stats (default values)
    rating: 0,
    reviewCount: 0,
    followerCount: 0,
    productCount: 0,
    totalProducts: 0,
    totalSales: 0,
    
    // UI/Display
    avatarColor: generateAvatarColor(email || apiVendor.id),
    tier: apiVendor.kycStatus === 'approved' ? 'premium' : 'basic',
    isVendor: true,
    hasVendorProfile: true,
  };
};

// Filter vendors function
const filterVendors = (
  vendors: CombinedVendor[],
  searchQuery: string,
  selectedStatuses: VendorStatus[],
  activeTab: VendorTab
): CombinedVendor[] => {
  if (!vendors || vendors.length === 0) return [];

  let filtered = [...vendors];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((vendor) => {
      return (
        vendor.firstName?.toLowerCase().includes(query) ||
        vendor.lastName?.toLowerCase().includes(query) ||
        vendor.businessName?.toLowerCase().includes(query) ||
        vendor.email?.toLowerCase().includes(query) ||
        vendor.location?.toLowerCase().includes(query) ||
        `${vendor.firstName} ${vendor.lastName}`.toLowerCase().includes(query)
      );
    });
  }

  // Apply tab filter
  if (activeTab !== "all") {
    filtered = filtered.filter((vendor) => vendor.status === activeTab);
  }

  // Apply status filter (overrides tab filter if statuses are selected)
  if (selectedStatuses.length > 0) {
    filtered = filtered.filter((vendor) =>
      selectedStatuses.includes(vendor.status)
    );
  }

  return filtered;
};


export default function AdminVendorsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<VendorStatus[]>([]);
  const [activeTab, setActiveTab] = useState<VendorTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");
  const [combinedVendors, setCombinedVendors] = useState<CombinedVendor[]>([]);

  const isFetchingRef = useRef(false);
  
  const {
    getAllVendors,
    calculateCombinedStats,
    loading,
    error,
  } = useReduxVendors();

  // Fetch combined vendors on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        console.log("🚀 Starting to fetch vendors...");

        const apiResponse = await getAllVendors();
        console.log("📦 Raw API response:", apiResponse);

        const vendorsData = apiResponse?.data || [];
        console.log("📊 Number of vendors from API:", vendorsData.length);

        const transformedVendors: CombinedVendor[] = vendorsData.map(transformVendorData);
        console.log("✅ Transformed vendors:", transformedVendors);
        
        setCombinedVendors(transformedVendors);
        console.log("✅ State updated with", transformedVendors.length, "vendors");
      } catch (error) {
        console.error("❌ Failed to fetch vendors:", error);
      } finally {
        isFetchingRef.current = false;
        console.log("✅ Fetch attempt finished");
      }
    };

    fetchData();
  }, [getAllVendors]);

  // Calculate vendor statistics using transformed data
  const vendorStats = useMemo(() => {
    return calculateCombinedStats(combinedVendors);
  }, [combinedVendors, calculateCombinedStats]);

  // Calculate rejected vendors count
  const rejectedVendorsCount = useMemo(() => {
    return combinedVendors.filter(v => v.status === 'rejected').length;
  }, [combinedVendors]);

  // Filter vendors based on tab, search and status filters using useMemo for optimization
  const filteredVendors = useMemo(() => {
    return filterVendors(combinedVendors, searchQuery, selectedStatuses, activeTab);
  }, [combinedVendors, searchQuery, selectedStatuses, activeTab]);

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
      value: formatNumberShort(vendorStats.totalVendors),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Pending Approvals",
      value: formatNumberShort(vendorStats.pendingApprovals),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Active Sellers",
      value: formatNumberShort(vendorStats.activeVendors),
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Suspended Sellers",
      value: formatNumberShort(vendorStats.suspendedVendors),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
  ];

  // Available status options for filter - Add rejected
  const statusOptions: { value: VendorStatus; label: string }[] = [
    { value: "pending", label: "Pending Approval" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "deactivated", label: "Deactivated" },
    { value: "rejected", label: "Rejected" },
    { value: "deleted", label: "Deleted" },
  ];

  // Table fields matching the design - simplified columns
  const vendorFields: TableField<CombinedVendor>[] = [
    {
      key: "name",
      header: "Seller name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <span className="font-medium">
            {row.firstName} {row.lastName}
          </span>
        </div>
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
        <div>
          <span className="font-medium">{row.businessName}</span>
          {row.isVerified && (
            <Badge
              variant="outline"
              className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs"
            >
              Verified
            </Badge>
          )}
        </div>
      ),
      align: "left",
    },
    {
      key: "location",
      header: "Location",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.location}
        </span>
      ),
      align: "left",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status] || statusConfig.pending;

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
    {
      key: "rating",
      header: "Rating",
      cell: (_, row) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{row.rating.toFixed(1)}</span>
          <span className="text-gray-400">★</span>
          <span className="text-gray-500 text-sm">({row.reviewCount})</span>
        </div>
      ),
      align: "left",
    },
  ];

  const vendorActions: TableAction<CombinedVendor>[] = [
    {
      type: "view",
      label: "View Seller Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (vendor) => {
        console.log("🔍 Navigating to vendor:", { id: vendor.id, userId: vendor.userId });
        navigate(`/admin/users/vendors/${vendor.userId}/details`);
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
                  placeholder="Search by name, business, email, or location"
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                        disabled={loading}
                      >
                        {status.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export Button */}
                <Button
                  variant="outline"
                  className="gap-2 h-10"
                  disabled={loading}
                >
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

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Error: {error}
                </p>
              </div>
            )}
          </div>

          {/* Tab Navigation - Add rejected tab */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 px-6 overflow-x-auto">
              <button
                className={getTabButtonClass("all")}
                onClick={() => handleTabClick("all")}
                disabled={loading}
              >
                All Sellers ({combinedVendors.length})
              </button>
              <button
                className={getTabButtonClass("pending")}
                onClick={() => handleTabClick("pending")}
                disabled={loading}
              >
                Pending Approval ({vendorStats.pendingApprovals})
              </button>
              <button
                className={getTabButtonClass("active")}
                onClick={() => handleTabClick("active")}
                disabled={loading}
              >
                Active ({vendorStats.activeVendors})
              </button>
              <button
                className={getTabButtonClass("suspended")}
                onClick={() => handleTabClick("suspended")}
                disabled={loading}
              >
                Suspended ({vendorStats.suspendedVendors})
              </button>
              <button
                className={getTabButtonClass("rejected")}
                onClick={() => handleTabClick("rejected")}
                disabled={loading}
              >
                Rejected ({rejectedVendorsCount})
              </button>
              <button
                className={getTabButtonClass("deactivated")}
                onClick={() => handleTabClick("deactivated")}
                disabled={loading}
              >
                Deactivated ({vendorStats.deactivatedVendors})
              </button>
              <button
                className={getTabButtonClass("deleted")}
                onClick={() => handleTabClick("deleted")}
                disabled={loading}
              >
                Deleted ({vendorStats.deletedVendors})
              </button>
            </div>
          </div>

          {/* Vendors Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Loading sellers...
                </span>
              </div>
            ) : combinedVendors.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Sellers Found
                </h3>
                <p className="text-muted-foreground">
                  No sellers have signed up yet. When sellers register, they
                  will appear here.
                </p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery ||
                  selectedStatuses.length > 0 ||
                  activeTab !== "all"
                    ? "No sellers found matching your criteria"
                    : "No sellers found"}
                </p>
                {(searchQuery ||
                  selectedStatuses.length > 0 ||
                  activeTab !== "all") && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <DataTable<CombinedVendor>
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