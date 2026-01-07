// customer-detail-page.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReduxUsers } from "@/hooks/useReduxUsers";
import { useReduxAddresses } from "@/hooks/useReduxAddresses";
import type { Address } from "@/redux/slices/addressesSlice";
import { type Customer } from "./Customers";
import images from "@/assets/images";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search } from "@/components/ui/search";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  User,
  FilterIcon,
  EyeIcon,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StatusUpdateModal,
  type BackendStatus,
} from "@/components/status-update-modal";
import api from "@/utils/api";
import { toast } from "sonner";

interface InfoProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconContainerStyle?: React.CSSProperties;
  iconContainerClassName?: string;
}

function Info({
  label,
  value,
  icon,
  iconContainerStyle,
  iconContainerClassName = "w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center",
}: InfoProps) {
  return (
    <div>
      <div className="flex flex-row items-center gap-3">
        {icon && (
          <div className={iconContainerClassName} style={iconContainerStyle}>
            {icon}
          </div>
        )}
        <div className="flex flex-col space-y-1">
          <p className="text-[#666666] text-sm">{label}</p>
          <p className="font-medium dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Mock order data
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  [key: string]: any;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    date: "2024-03-15",
    productName: "Traditional Kente Cloth",
    quantity: 2,
    totalAmount: 450.0,
    status: "delivered",
    paymentMethod: "Credit Card",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    date: "2024-03-14",
    productName: "Handmade Leather Sandals",
    quantity: 1,
    totalAmount: 85.5,
    status: "shipped",
    paymentMethod: "PayPal",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    date: "2024-03-12",
    productName: "African Print Dress",
    quantity: 1,
    totalAmount: 120.0,
    status: "processing",
    paymentMethod: "Credit Card",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    date: "2024-03-10",
    productName: "Wooden Carved Mask",
    quantity: 3,
    totalAmount: 210.0,
    status: "pending",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    date: "2024-03-08",
    productName: "Beaded Necklace Set",
    quantity: 1,
    totalAmount: 65.0,
    status: "cancelled",
    paymentMethod: "Credit Card",
  },
];

// Function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

// Helper function to map CustomerStatus to BackendStatus
const mapCustomerStatusToBackend = (status: string): BackendStatus => {
  const statusMap: Record<string, BackendStatus> = {
    "active": "active",
    "suspended": "suspended",
    "pending_deletion": "deactivated",
    "disabled": "deactivated",
    "deleted": "deactivated",
    "inactive": "deactivated",
  };
  
  return statusMap[status] || "active";
};

// Helper function to map BackendStatus to CustomerStatus
const mapBackendToCustomerStatus = (status: BackendStatus): string => {
  const statusMap: Record<BackendStatus, string> = {
    "active": "active",
    "suspended": "suspended",
    "rejected": "deleted",
    "deactivated": "deactivated",
    "pending": "active", 
    "deleted": "deleted",
  };
  
  return statusMap[status] || "active";
};

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usersList, getUsers } = useReduxUsers();
  const { 
    addresses: allAddresses, 
    getAddresses,
    getAddressById,
  } = useReduxAddresses();
  
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [purchasePeriod, setPurchasePeriod] = useState("12-months");
  const [trendPeriod, setTrendPeriod] = useState("12-months");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        await getUsers({ role: "client" });
      } catch (error) {
        console.error("Failed to fetch customer data:", error);
      }
    };

    if (id) {
      fetchCustomerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch addresses for this specific user
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!id) return;

      setLoadingAddresses(true);
      setAddressError(null);
      
      try {
        await getAddresses();
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        setAddressError("Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchUserAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Filter addresses for the current user
  useEffect(() => {
    if (id && allAddresses && Array.isArray(allAddresses)) {
      const filteredAddresses = allAddresses.filter(
        (addr) => addr.userId === id
      );
      setUserAddresses(filteredAddresses);
    }
  }, [id, allAddresses]);

  useEffect(() => {
    if (Array.isArray(usersList) && id) {
      const user = usersList.find((user) => user.id?.toString() === id);
      if (user) {
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

        let status: string = "active";
        const accountStatus = user.accountStatus?.toLowerCase();

        if (accountStatus === "active") {
          status = "active";
        } else if (accountStatus === "suspended") {
          status = "suspended";
        } else if (accountStatus === "pending_deletion") {
          status = "pending_deletion";
        } else if (accountStatus === "disabled") {
          status = "disabled";
        } else if (accountStatus === "deleted") {
          status = "deleted";
        } else if (!user.isActive) {
          status = "inactive";
        }

        const totalOrders = user.totalOrders || Math.floor(Math.random() * 30);
        const totalSpent = user.totalSpent || Math.floor(Math.random() * 5000);
        const country = user.country || "Unknown";
        const city = user.city || "Unknown";
        const address = user.address || `${city}, ${country}`;

        const customer: Customer = {
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
          lastActive: user.updatedAt || user.createdAt,
          status: status as any, // Cast to any to bypass type issues
          totalOrders,
          totalSpent,
          tier: "bronze",
          avatarColor: colors[colorIndex],
          isActive: user.accountStatus === "active",
          accountStatus: user.accountStatus,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          avatar: user.avatar,
        };

        setCustomerData(customer);
      }
    }
  }, [usersList, id]);

  // Refresh addresses
  const handleRefreshAddresses = async () => {
    if (!id) return;
    
    setLoadingAddresses(true);
    setAddressError(null);
    
    try {
      await getAddresses();
      toast.success("Addresses refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh addresses:", error);
      setAddressError("Failed to refresh addresses");
      toast.error("Failed to refresh addresses");
    } finally {
      setLoadingAddresses(false);
    }
  };

  // View specific address in detail
  const handleViewAddressDetails = async (addressId: string) => {
    try {
      await getAddressById(addressId);
      toast.success("Address details loaded");
    } catch (error) {
      console.error("Failed to load address details:", error);
      toast.error("Failed to load address details");
    }
  };

  // Filter orders based on search and status filters
  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(order.status);

    return matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  // Format last active time
  const formatLastActive = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Never";
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    } catch (error) {
      return "Never";
    }
  };

  // Status configuration for orders
  const statusConfig = {
    pending: {
      label: "Pending",
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    processing: {
      label: "Processing",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    shipped: {
      label: "Shipped",
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    delivered: {
      label: "Delivered",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Table fields for orders
  const orderFields = [
    {
      key: "orderNumber",
      header: "Order ID",
      cell: (value: string) => <span className="font-medium">{value}</span>,
      align: "left" as const,
    },
    {
      key: "date",
      header: "Date",
      cell: (value: string) => <span className="font-medium">{value}</span>,
      align: "center" as const,
    },
    {
      key: "productName",
      header: "Product",
      cell: (value: string) => <span className="font-medium">{value}</span>,
      align: "center" as const,
    },
    {
      key: "quantity",
      header: "Qty",
      cell: (value: number) => <span className="font-medium">{value}</span>,
      align: "center" as const,
    },
    {
      key: "totalAmount",
      header: "Total",
      cell: (value: number) => (
        <span className="font-medium">{formatAmount(value)}</span>
      ),
      align: "center" as const,
    },
    {
      key: "status",
      header: "Status",
      cell: (value: keyof typeof statusConfig) => {
        const config = statusConfig[value] || statusConfig.pending;
        return (
          <Badge
            variant="outline"
            className={`flex flex-row items-center py-1 px-3 gap-2 rounded-md `}
          >
            <div className={`size-2 rounded-full ${config.color}`} />
            {config.label}
          </Badge>
        );
      },
      align: "center" as const,
    },
    {
      key: "paymentMethod",
      header: "Payment",
      cell: (value: string) => <span className="font-medium">{value}</span>,
      align: "center" as const,
    },
  ];

  const orderActions = [
    {
      type: "view" as const,
      label: "View Order Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (order: Order) => {
        navigate(`/admin/orders/${order.id}`);
      },
    },
  ];

  const handleStatusUpdate = async (newStatus: BackendStatus, reason?: string) => {
    if (!customerData || !id) return;

    setStatusUpdateLoading(true);

    try {
      let endpoint = "";
      let method: "post" | "put" = "post";

      // Map BackendStatus to API endpoints
      switch (newStatus) {
        case "active":
          // For customers, reactivate if they were suspended or deactivated
          if (customerData.status === "suspended" || 
              customerData.status === "deactivated" || 
              customerData.status === "pending_deletion") {
            endpoint = `/api/v1/clients/admin/reactivate/${id}`;
          } else {
            // If already active, just return success
            toast.info("Customer is already active");
            return;
          }
          break;

        case "suspended":
          endpoint = `/api/v1/clients/admin/suspend/${id}`;
          break;

        case "deactivated":
          // For customers, deactivate means mark for deletion
          endpoint = `/api/v1/clients/admin/deactivate/${id}`;
          break;

        case "rejected":
          // Customers don't have "rejected" status, treat as deactivation
          endpoint = `/api/v1/clients/admin/deactivate/${id}`;
          break;

        default:
          console.warn(`No API endpoint defined for status: ${newStatus}`);
          toast.error(`Cannot change to ${newStatus} status`);
          return;
      }

      if (endpoint) {
        const requestBody: any = { userId: id };
        
        // Add reason if provided
        if (reason && (newStatus === "suspended" || newStatus === "deactivated" || newStatus === "rejected")) {
          requestBody.reason = reason;
        }

        await api[method](endpoint, requestBody);

        // Update local state with mapped status
        const newCustomerStatus = mapBackendToCustomerStatus(newStatus);
        setCustomerData((prev) =>
          prev ? { ...prev, status: newCustomerStatus as any } : null
        );

        toast.success(`Customer status updated to ${newStatus}`);
        
        // Refresh customer data
        await getUsers({ role: "client" });
      }
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update customer status"
      );
    } finally {
      setStatusUpdateLoading(false);
      setIsStatusModalOpen(false);
    }
  };

  if (!customerData) {
    return (
      <>
        <SiteHeader label="Customer Management" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
            <Button onClick={() => navigate("/admin/users/customers")}>
              Back to Customers
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader label="Customer Management" />
      <div className="min-h-screen">
        <div className="p-6 mx-auto space-y-6">
          <Card className="shadow-none border-none">
            <div className="flex flex-row flex-1 gap-3 items-center justify-between px-6">
              <div className="flex flex-row items-center gap-6">
                <Button
                  variant={"secondary"}
                  className="dark:bg-[#12121240]"
                  onClick={() => navigate("/admin/users/customers")}
                >
                  <ArrowLeft />
                </Button>
                <p className="text-md">Back to customers</p>
              </div>

              <div
                className={`h-11 rounded-full flex flex-col w-xs justify-center items-center ${
                  customerData.status === "active"
                    ? "bg-green-600/10 text-green-600 border-green-600 border"
                    : "bg-gray-300 text-gray-700"
                } text-md`}
              >
                <p className="text-center">
                  {customerData.status === "active"
                    ? "Customer is Active"
                    : "Customer is " + customerData.status}
                </p>
              </div>
            </div>
          </Card>
          {/* ================= COVER IMAGE ================= */}
          <div className="relative w-full h-[380px] overflow-hidden rounded-2xl">
            <img
              src={images.Placeholder}
              alt="Cover"
              className="object-cover w-full h-full"
            />

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3"></div>
          </div>

          {/* ================= CUSTOMER SUMMARY ================= */}
          <div className="relative -mt-32 mx-6">
            <Card className="flex flex-col md:flex-row md:items-center gap-6 p-6 mx-6 shadow-none border-none rounded-b-none">
              <div
                className={`w-30 h-30 rounded-full ${customerData.avatarColor} flex items-center justify-center text-4xl font-bold`}
              >
                {getInitials(customerData.name)}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-semibold">{customerData.name}</h1>
                <p className="text-[#6F6F6F]">{customerData.email}</p>
              </div>
            </Card>

            <div>
              <div className="px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="p-4 w-full h-16 bg-[#F2F2F2] dark:bg-[#1A1A1A] rounded-md border dark:border-[#333333] border-none flex rounded-t-none">
                    <TabsTrigger
                      value="overview"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="customer-details"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Customer Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="wishlist"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Wishlist
                    </TabsTrigger>
                    <TabsTrigger
                      value="cart"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Cart
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Orders
                    </TabsTrigger>
                    <TabsTrigger
                      value="compliance"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Compliance
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-8">
                    <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                      <CardContent className="px-6 py-8">
                        <div className="mb-8">
                          <h2 className="text-2xl font-semibold mb-2">
                            Purchases
                          </h2>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-500">
                              Total Revenue from purchases
                            </p>
                            <p className="text-2xl font-bold text-teal-600">
                              USD 0
                            </p>
                          </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Top Purchased Product */}
                          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-semibold">
                                Top Purchased Product
                              </h3>
                              <Select
                                value={purchasePeriod}
                                onValueChange={setPurchasePeriod}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="12-months">
                                    12 months
                                  </SelectItem>
                                  <SelectItem value="6-months">
                                    6 months
                                  </SelectItem>
                                  <SelectItem value="3-months">
                                    3 months
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Placeholder for chart */}
                            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <p className="text-gray-400">No data available</p>
                            </div>
                          </div>

                          {/* Purchase Trend */}
                          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-semibold">
                                Purchase Trend
                              </h3>
                              <Select
                                value={trendPeriod}
                                onValueChange={setTrendPeriod}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="12-months">
                                    12 months
                                  </SelectItem>
                                  <SelectItem value="6-months">
                                    6 months
                                  </SelectItem>
                                  <SelectItem value="3-months">
                                    3 months
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Chart with Y-axis labels */}
                            <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 relative">
                              <div className="flex h-full">
                                <div className="flex flex-col justify-between text-xs text-gray-500 mr-4">
                                  <span>400</span>
                                  <span>300</span>
                                  <span>200</span>
                                  <span>100</span>
                                  <span>0</span>
                                </div>
                                <div className="flex-1 relative">
                                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                                    {[
                                      "Jan",
                                      "Feb",
                                      "Mar",
                                      "Apr",
                                      "Jun",
                                      "Jul",
                                      "Aug",
                                      "Sep",
                                      "Oct",
                                      "Nov",
                                      "Dec",
                                    ].map((month) => (
                                      <span key={month}>{month}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Customer Details Tab */}
                  <TabsContent value="customer-details" className="space-y-8">
                    {/* Contact Info Details */}
                    <div>
                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardContent className="px-6">
                          <h2 className="text-lg font-semibold mb-3">
                            Basic Information
                          </h2>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#1A1A1A]">
                            {/* Row 1 */}
                            <Info
                              label="Full name"
                              value={customerData.name}
                              icon={<User className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center"
                            />
                            <Info
                              label="Joined On"
                              value={new Date(
                                customerData.joinDate
                              ).toLocaleDateString()}
                              icon={<Calendar className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center"
                            />
                            <Info
                              label="Phone Number"
                              value={customerData.phoneNumber ?? "Not provided"}
                              icon={<Phone className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-teal-100 text-teal-600 flex items-center justify-center"
                            />

                            {/* Row 2 */}
                            <Info
                              label="Email Address"
                              value={customerData.email}
                              icon={<Mail className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center"
                            />
                            <Info
                              label="Last Active"
                              value={formatLastActive(customerData.lastActive)}
                              icon={<Clock className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center"
                            />
                            <Info
                              label="Country"
                              value={`${customerData.city}, ${customerData.country}`}
                              icon={<MapPin className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <h2 className="text-lg font-semibold">Addresses</h2>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshAddresses}
                            disabled={loadingAddresses}
                            className="gap-2"
                          >
                            <RefreshCw className={`h-4 w-4 ${loadingAddresses ? 'animate-spin' : ''}`} />
                            Refresh
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {loadingAddresses ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="flex flex-col items-center gap-3">
                                <RefreshCw className="h-8 w-8 animate-spin text-[#CC5500]" />
                                <p className="text-gray-500">Loading addresses...</p>
                              </div>
                            </div>
                          ) : addressError ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              <p className="text-red-500 mb-4">{addressError}</p>
                              <Button
                                variant="outline"
                                onClick={handleRefreshAddresses}
                              >
                                Try Again
                              </Button>
                            </div>
                          ) : userAddresses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              <img
                                src={images.EmptyFallback}
                                alt="No addresses"
                                className="h-40 mb-4"
                              />
                              <p className="text-gray-500">No addresses found for this customer</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {userAddresses.map((addr, index) => {
                                const recipientName = addr.recipient || `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || customerData.name;
                                
                                return (
                                  <div key={addr.id || index} className="border-b pb-6 last:border-b-0">
                                    <div className="flex items-center justify-between mb-3">
                                      {addr.isDefault && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                          Default Address
                                        </Badge>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewAddressDetails(addr.id)}
                                        className="ml-auto text-[#CC5500] hover:text-[#CC5500]/90"
                                      >
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        View Details
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                                      <Info
                                        label="Full Name"
                                        value={recipientName}
                                        icon={<User className="h-5 w-5" />}
                                        iconContainerClassName="w-8 h-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center"
                                      />
                                      <Info
                                        label="Email Address"
                                        value={addr.email || customerData.email}
                                        icon={<Mail className="h-5 w-5" />}
                                        iconContainerClassName="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center"
                                      />
                                      <Info
                                        label="Phone Number"
                                        value={addr.phoneNumber || customerData.phoneNumber || "Not provided"}
                                        icon={<Phone className="h-5 w-5" />}
                                        iconContainerClassName="w-8 h-8 rounded-md bg-teal-100 text-teal-600 flex items-center justify-center"
                                      />
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                          <MapPin className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                          <p className="text-[#666666] text-sm">Address</p>
                                          <div className="flex flex-col gap-1">
                                            {addr.addLine1 && (
                                              <p className="font-medium">{addr.addLine1}</p>
                                            )}
                                            {addr.addLine2 && (
                                              <p className="text-gray-600">{addr.addLine2}</p>
                                            )}
                                            {addr.addLine3 && (
                                              <p className="text-gray-600">{addr.addLine3}</p>
                                            )}
                                            {addr.city && (
                                              <p className="text-gray-600">{addr.city}</p>
                                            )}
                                            <p className="text-gray-600">
                                              {addr.postCode && `${addr.postCode}, `}
                                              {addr.country}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardHeader>
                          <h2 className="text-lg font-semibold">
                            Customer Status
                          </h2>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-row flex-1 justify-between items-center">
                            <div className="space-y-2">
                              <h3 className="text-md">
                                Change customer status
                              </h3>
                              <p className="text-sm text-gray-500">
                                Current status:{" "}
                                <span className="font-medium capitalize">
                                  {customerData.status.replace("_", " ")}
                                </span>
                              </p>
                            </div>
                            <Button
                              variant={"outline"}
                              className="h-11 text-[#E51C00] hover:text-[#E51C00]/90 border-[#E51C00]"
                              onClick={() => setIsStatusModalOpen(true)}
                            >
                              Change Status
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <StatusUpdateModal
                        isOpen={isStatusModalOpen}
                        onClose={() => setIsStatusModalOpen(false)}
                        onConfirm={handleStatusUpdate}
                        currentStatus={mapCustomerStatusToBackend(customerData.status)}
                        userType="client"
                        title="Update Customer Status"
                        description="Select a new status for this customer"
                        loading={statusUpdateLoading}
                      />
                    </div>
                  </TabsContent>

                  {/* Orders Tab */}
                  <TabsContent value="orders" className="space-y-8 mt-6">
                    <Card className="shadow-none border-none">
                      <CardContent className="px-6">
                        <div className="rounded-lg">
                          {/* Search and Filter Section */}
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="w-full">
                              <Search
                                placeholder="Search orders by order number, product, or payment method..."
                                value={searchQuery}
                                onSearchChange={setSearchQuery}
                                className="rounded-full flex-1"
                              />
                            </div>

                            <div className="flex flex-row flex-1 items-center gap-4">
                              <div className="flex gap-2 items-center">
                                {/* Status Filter Dropdown */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="flex items-center gap-2 h-10"
                                    >
                                      <FilterIcon className="w-4 h-4" />
                                      Status
                                      {selectedStatuses.length > 0 && (
                                        <Badge
                                          variant="secondary"
                                          className="ml-1"
                                        >
                                          {selectedStatuses.length}
                                        </Badge>
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    {statusOptions.map((status) => (
                                      <DropdownMenuCheckboxItem
                                        key={status.value}
                                        checked={selectedStatuses.includes(
                                          status.value
                                        )}
                                        onCheckedChange={() =>
                                          handleStatusFilterChange(status.value)
                                        }
                                      >
                                        {status.label}
                                      </DropdownMenuCheckboxItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Clear Filters Button */}
                                {(selectedStatuses.length > 0 ||
                                  searchQuery) && (
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
                          </div>

                          {/* Orders Display */}
                          <div className="">
                            {filteredOrders.length === 0 ? (
                              <div className="flex flex-col items-center text-center py-12">
                                <img
                                  src={images.EmptyFallback}
                                  alt=""
                                  className="h-60 mb-6"
                                />
                                <p className="text-muted-foreground">
                                  {searchQuery ||
                                  selectedStatuses.length > 0 ||
                                  activeTab !== "all"
                                    ? "No orders found matching your criteria"
                                    : "No orders found"}
                                </p>
                              </div>
                            ) : (
                              <DataTable<Order>
                                data={filteredOrders}
                                fields={orderFields}
                                actions={orderActions}
                                enableSelection={true}
                                enablePagination={true}
                                pageSize={10}
                              />
                            )}

                            {filteredOrders.length === 0 && (
                              <div className="text-center py-12">
                                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                                <p className="text-muted-foreground">
                                  No orders found matching your criteria.
                                </p>
                                <Button
                                  variant="outline"
                                  onClick={clearAllFilters}
                                  className="mt-4"
                                >
                                  Clear Filters
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Wishlist, Cart, Compliance Tabs - Placeholder */}
                  {(activeTab === "wishlist" ||
                    activeTab === "cart" ||
                    activeTab === "compliance") && (
                    <TabsContent value={activeTab} className="mt-8">
                      <Card className="max-w-8xl mx-auto shadow-none border-none bg-white">
                        <CardContent className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center text-center py-3">
                            <img
                              src={images.EmptyFallback}
                              alt=""
                              className="h-60 mb-6"
                            />
                            <p className="text-gray-500">
                              No{" "}
                              {activeTab.charAt(0).toUpperCase() +
                                activeTab.slice(1)}{" "}
                              content available
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}