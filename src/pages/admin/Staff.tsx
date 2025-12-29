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
  Trash2,
  Plus,
  Loader2,
  Download,
  FilterIcon,
  Eye,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useReduxAdmin } from "@/hooks/useReduxAdmin";

import images from "@/assets/images";

// Staff type definition - Updated to match AdminUser
export type StaffStatus =
  | "active"
  | "suspended"
  | "pending_approval"
  | "onboarded"
  | "deactivated"
  | "deleted";

export type StaffRole =
  | "superadmin"
  | "admin"
  | "operations"
  | "marketing"
  | "logistics"
  | "helpdesk"
  | "support";
export type StaffDepartment =
  | "Management"
  | "Operations"
  | "Marketing"
  | "Logistics"
  | "Support"
  | "Administration";
type DateRange = "last-7-days" | "last-30-days" | "all-time";
type StaffTab =
  | "all"
  | "pending_approval"
  | "onboarded"
  | "active"
  | "deactivated"
  | "suspended"
  | "deleted";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: StaffDepartment;
  role: StaffRole;
  roleLabel: string;
  signedUpOn: string;
  status: StaffStatus;
  location: string;
  businessName: string;
  joinDate: string;
  permissions: string[];
  firstName: string;
  lastName: string;
  userType: string;
  accountStatus: StaffStatus;
  createdAt: string;
  updatedAt: string;
  roles?: Array<{
    id: string;
    name: string;
    description?: string;
    isSystem: boolean;
    permissions: Array<{
      id: string;
      key: string;
      name: string;
      description?: string;
      module: string;
    }>;
  }>;
  [key: string]: any;
}

interface StaffStats {
  totalStaff: number;
  pendingApprovals: number;
  activeStaff: number;
  deletedStaff: number;
}

export default function AdminStaffPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<StaffStatus[]>([]);
  const [activeTab, setActiveTab] = useState<StaffTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  // Use the admin hook
  const { admins, loading, createLoading, getAdmins, removeAdmin } =
    useReduxAdmin();

  // Fetch admins on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAdmins();
      } catch (error) {
        console.error("Failed to fetch admins:", error);
      }
    };

    fetchData();
  }, [getAdmins]);

  // Map AdminUser to StaffMember for compatibility
  const mapAdminToStaffMember = (admin: any): StaffMember => {
    // Determine role based on admin's role field (from API response)
    let role: StaffRole = "admin";
    let roleLabel = "Admin";
    let department: StaffDepartment = "Administration";

    // Map role to department and proper labels
    const roleMapping: Record<
      string,
      { role: StaffRole; roleLabel: string; department: StaffDepartment }
    > = {
      superadmin: {
        role: "superadmin",
        roleLabel: "Super Admin",
        department: "Management",
      },
      admin: {
        role: "admin",
        roleLabel: "Admin",
        department: "Administration",
      },
      operations: {
        role: "operations",
        roleLabel: "Operations",
        department: "Operations",
      },
      marketing: {
        role: "marketing",
        roleLabel: "Marketing",
        department: "Marketing",
      },
      logistics: {
        role: "logistics",
        roleLabel: "Logistics",
        department: "Logistics",
      },
      helpdesk: {
        role: "helpdesk",
        roleLabel: "Helpdesk",
        department: "Support",
      },
      support: { role: "support", roleLabel: "Support", department: "Support" },
    };

    // Use the role from API response (lowercase)
    const apiRole = admin.role?.toLowerCase() || "admin";
    const mapping = roleMapping[apiRole] || roleMapping.admin;

    role = mapping.role;
    roleLabel = mapping.roleLabel;
    department = mapping.department;

    // Map account status to match new design
    let status: StaffStatus = "active";
    if (admin.accountStatus === "suspended") {
      status = "suspended";
    } else if (admin.accountStatus === "pending_deletion") {
      status = "deleted";
    } else if (admin.accountStatus === "pending") {
      status = "pending_approval";
    } else if (admin.accountStatus === "active") {
      status = "active";
    }

    // Get permissions from roles
    const permissions = admin.roles?.flatMap((role: any) =>
      role.permissions?.map((permission: any) => permission.name)
    ) || ["Basic Access"];

    // Generate mock location and business name (you can replace with actual data)
    const locations = [
      "Kampala, Uganda",
      "Nairobi, Kenya",
      "Accra, Ghana",
      "Kigali, Rwanda",
      "Lagos, Nigeria",
      "Cairo, Egypt",
      "Dar es Salaam, Tanzania",
    ];
    const location = locations[parseInt(admin.id) % locations.length];
    const businessName = `${admin.firstName}'s ${department}`;

    return {
      id: admin.id.toString(),
      name: `${admin.firstName} ${admin.lastName}`,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phoneNumber || admin.phone || "Not provided",
      department,
      role,
      roleLabel,
      signedUpOn: admin.createdAt,
      status,
      location,
      businessName,
      joinDate: admin.createdAt,
      permissions: Array.from(new Set(permissions)),
      userType: admin.role || "admin",
      accountStatus: status,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      roles: admin.roles || [],
    };
  };

  // Calculate staff statistics from admins list
  const calculateStats = (staff: StaffMember[]): StaffStats => {
    const totalStaff = staff.length;
    const pendingApprovals = staff.filter(
      (s) => s.status === "pending_approval"
    ).length;
    const activeStaff = staff.filter((s) => s.status === "active").length;
    const deletedStaff = staff.filter((s) => s.status === "deleted").length;

    return {
      totalStaff,
      pendingApprovals,
      activeStaff,
      deletedStaff,
    };
  };

  // Map all admins to staff members and calculate stats
  const staffMembers = admins.map(mapAdminToStaffMember);
  const stats = calculateStats(staffMembers);

  // Filter staff based on active tab, search, and status filters
  const filteredStaff = staffMembers.filter((staff) => {
    // Tab filtering
    let matchesTab = true;
    if (activeTab !== "all") {
      matchesTab = activeTab === staff.status;
    }

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(staff.status);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: StaffStatus) => {
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

  const handleTabClick = (tab: StaffTab) => {
    setActiveTab(tab);
    // Clear status filters when switching tabs
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: StaffTab) => {
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

  // Format signed up date
  const formatSignedUpDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Staff cards matching the design
  const staffCards: CardData[] = [
    {
      title: "Total Staff",
      value: formatNumberShort(stats.totalStaff),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
    {
      title: "Pending Approvals",
      value: formatNumberShort(stats.pendingApprovals),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
    {
      title: "Active Staff",
      value: formatNumberShort(stats.activeStaff),
      change: {
        trend: "down",
        value: "5%",
        description: "",
      },
    },
    {
      title: "Deleted Staff",
      value: formatNumberShort(stats.deletedStaff),
      change: {
        trend: "up",
        value: "10%",
        description: "",
      },
    },
  ];

  // Status configuration matching the design
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-teal-50 text-teal-700 border-teal-200",
    },
    suspended: {
      label: "Suspended",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    pending_approval: {
      label: "Pending approval",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    onboarded: {
      label: "Onboarded",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    deactivated: {
      label: "Deactivated",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
    deleted: {
      label: "Deleted",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  } as const;

  // Available status options for filter
  const statusOptions: { value: StaffStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "onboarded", label: "Onboarded" },
    { value: "deactivated", label: "Deactivated" },
    { value: "deleted", label: "Deleted" },
  ];

  // Handle admin actions
  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await removeAdmin(adminId);
      // Refresh data
      await getAdmins();
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  // Table fields matching the design - simplified columns
  const staffFields: TableField<StaffMember>[] = [
    {
      key: "name",
      header: "Staff name",
      cell: (_, row) => <span className="font-medium">{row.name}</span>,
      align: "left",
    },
    {
      key: "signedUpOn",
      header: "Created on",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatSignedUpDate(row.signedUpOn)}
        </span>
      ),
      align: "left",
      enableSorting: true,
    },
    {
      key: "emailAddress",
      header: "Email Address",
      cell: (_, row) => <span className="font-medium">{row.email}</span>,
      align: "left",
    },
    {
      key: "location",
      header: "Location",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">{row.location}</span>
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

  const staffActions: TableAction<StaffMember>[] = [
    {
      type: "view",
      label: "View Staff Member",
      icon: <Eye className="size-5" />,
      onClick: (staff) => {
        navigate(`/admin/users/staff/${staff.id}/details`);
      },
    },
    {
      type: "delete",
      label: "Delete Staff Member",
      icon: <Trash2 className="size-5" />,
      onClick: (staff) => {
        if (confirm(`Are you sure you want to delete ${staff.name}?`)) {
          handleDeleteAdmin(staff.id);
        }
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader label="Staff Management" />
      <div className="p-6 space-y-6">
        <SectionCards cards={staffCards} layout="1x4" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  All Staff
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all staff on the platform
                </p>
              </div>
              <Button
                variant="default"
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={() => navigate("/admin/users/staff/create")}
                disabled={createLoading}
              >
                <Plus className="h-4 w-4 mr-2" /> Create Staff
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
                All Staff
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

          {/* Staff Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : staffMembers.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Staff Members Found
                </h3>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6" />
                <p className="text-muted-foreground">
                  {searchQuery ||
                  selectedStatuses.length > 0 ||
                  activeTab !== "all"
                    ? "No staff members found matching your criteria"
                    : "No staff members found"}
                </p>
              </div>
            ) : (
              <DataTable<StaffMember>
                data={filteredStaff}
                fields={staffFields}
                actions={staffActions}
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
