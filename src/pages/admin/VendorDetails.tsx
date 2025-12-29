import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import images from "@/assets/images";
import { DataTable } from "@/components/data-table";
import { ImageUpload } from "@/components/image-upload";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  Calendar,
  Building,
  User,
  Banknote,
  ListIcon,
  GridIcon,
  FilterIcon,
  EyeIcon,
  ShoppingBag,
  Mail,
  Globe,
  CreditCard,
  Phone,
  MapPin,
  Code,
  ExternalLink,
  ThumbsUp,
  Share2,
  Flag,
  Clock,
  Star,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useReduxVendors } from "@/hooks/useReduxVendors";

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
          <p className="font-medium dark:text-white">{value || "Not provided"}</p>
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
];

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    name: "Annette Black",
    date: "Apr 11 2025",
    rating: 4.5,
    comment:
      "Great store with quality products. Fast shipping and excellent customer service.",
    helpful: 12,
  },
  {
    id: "2",
    name: "Emma Stone",
    date: "Jul 22 2025",
    rating: 5.0,
    comment:
      "Absolutely love shopping here! Authentic products and very professional seller.",
    helpful: 15,
  },
];

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

export default function AdminVendorDetailPage() {
  const { id } = useParams<{ id: string }>();  // This is userId
  const navigate = useNavigate();
  const { getVendor, loading, error } = useReduxVendors();
  
  const [vendor, setVendor] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sellingPeriod, setSellingPeriod] = useState("12-months");
  const [revenuePeriod, setRevenuePeriod] = useState("12-months");

  // Fetch vendor data
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!id) return;
      
      try {
        console.log("🔍 Fetching vendor with userId:", id);
        const vendorData = await getVendor(id, false);
        console.log("📦 Received vendor data:", vendorData);
        setVendor(vendorData);
      } catch (err) {
        console.error("❌ Failed to fetch vendor:", err);
      }
    };

    fetchVendorData();
  }, [id, getVendor]);

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

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown";
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const getTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffHrs < 24) return `${diffHrs}hr ago`;
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return "Unknown";
    }
  };

  // Status configuration
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

  const vendorStatusConfig = {
    pending: {
      label: "Pending Approval",
      className: "bg-yellow-100 text-yellow-700",
    },
    active: {
      label: "Store Active",
      className: "bg-green-600 text-white",
    },
    suspended: {
      label: "Store Suspended",
      className: "bg-red-600 text-white",
    },
    deactivated: {
      label: "Store Deactivated",
      className: "bg-gray-600 text-white",
    },
    deleted: {
      label: "Store Deleted",
      className: "bg-red-800 text-white",
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
            className={`flex flex-row items-center py-1 px-3 gap-2 rounded-md ${config.bgColor} ${config.textColor}`}
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

  if (loading) {
    return (
      <>
        <SiteHeader label="Seller Management" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading vendor details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !vendor) {
    return (
      <>
        <SiteHeader label="Seller Management" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Vendor not found"}</p>
            <Button onClick={() => navigate("/admin/users/vendors")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Extract data safely from the API response
  const user = vendor.user || {};
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const email = user.email || '';
  const storeName = vendor.storeName || 'Unknown Store';
  const city = vendor.city || 'Unknown';
  const country = vendor.country || 'Unknown';
  const avatarColor = generateAvatarColor(email || vendor.id);
  const isVerified = vendor.kycStatus === 'approved';
  const vendorStatus = (vendor.vendorStatus || 'pending') as keyof typeof vendorStatusConfig;
  const vendorStatusDisplay = vendorStatusConfig[vendorStatus] || vendorStatusConfig.pending;
  
  // Safe initials generation
  const getInitials = () => {
    const firstInitial = firstName.charAt(0).toUpperCase() || '?';
    const lastInitial = lastName.charAt(0).toUpperCase() || '?';
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <>
      <SiteHeader label="Seller Management" />
      <div className="min-h-screen">
        <div className="p-6 mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/users/vendors")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>

          {/* ================= COVER IMAGE ================= */}
          <div className="relative w-full h-[380px] overflow-hidden rounded-2xl">
            <img
              src={vendor.businessBanner || images.Placeholder}
              alt="Cover"
              className="object-cover w-full h-full"
            />

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
              
            </div>
          </div>

          {/* ================= STORE SUMMARY ================= */}
          <div className="relative mx-6 -mt-12 shadow-none border-none">
            <Card className="flex flex-col md:flex-row md:items-center gap-6 border mx-6 p-6 shadow-none rounded-b-none border-none">
              <div
                className="w-30 h-30 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {getInitials()}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-semibold">{storeName}</h1>
                  {isVerified && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-[#6F6F6F]">
                  {country} • {city}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Joined {formatDate(vendor.createdAt)}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-6 text-md">
                <div className={`h-11 rounded-md px-6 flex flex-col justify-center items-center ${vendorStatusDisplay.className} text-md`}>
                  <p className="text-center">{vendorStatusDisplay.label}</p>
                </div>
              </div>
            </Card>

            <div>
              <div className="mx-auto mx-6 px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList
                    defaultValue={"overview"}
                    className="p-4 w-full h-16 bg-[#F2F2F2] dark:bg-[#1A1A1A] rounded-md border dark:border-[#333333] border-none mx-6 mx-auto flex rounded-t-none"
                  >
                    <TabsTrigger
                      value="overview"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="shop-details"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Shop Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="product-listings"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Product Listings
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Orders
                    </TabsTrigger>
                    <TabsTrigger
                      value="wishlists"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Wishlists
                    </TabsTrigger>
                    <TabsTrigger
                      value="compliance"
                      className="h-11 rounded-sm shadow-none border-none data-[state=active]:bg-white dark:data-[state=active]:bg-[#303030] data-[state=active]:text-[#CC5500] dark:data-[state=active]:text-[#CC5500] data-[state=active]:font-medium data-[state=active]:shadow-none"
                    >
                      Compliance
                    </TabsTrigger>
                  </TabsList>

                  {/* ================= OVERVIEW TAB ================= */}
                  <TabsContent value="overview" className="space-y-8">
                    <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                      <CardContent className="px-6 py-8">
                        <h2 className="text-2xl font-semibold mb-8">Shop Rating</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Store Rating */}
                          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-semibold">Store Rating</h3>
                              <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-5 h-5 ${
                                      i < 4
                                        ? "fill-orange-400 text-orange-400"
                                        : "fill-orange-300 text-orange-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 font-bold">0.0</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-sm font-medium mb-2">Rating overview</p>
                              {[
                                { stars: 5, percent: 0 },
                                { stars: 4, percent: 0 },
                                { stars: 3, percent: 0 },
                                { stars: 2, percent: 0 },
                                { stars: 1, percent: 0 },
                              ].map((item) => (
                                <div key={item.stars} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 min-w-[80px]">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < item.stars
                                            ? "fill-gray-900 text-gray-900"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gray-900"
                                      style={{ width: `${item.percent}%` }}
                                    />
                                  </div>
                                  <span className="text-sm min-w-[45px] text-right">
                                    {item.percent}%
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm text-gray-600">
                                Total Reviews: <span className="font-semibold">0</span>
                              </p>
                            </div>
                          </div>

                          {/* Reviews and ratings */}
                          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-6">
                              Reviews and ratings
                            </h3>

                            <div className="space-y-6">
                              {mockReviews.map((review) => (
                                <div key={review.id} className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback>
                                          {review.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{review.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {review.date}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < Math.floor(review.rating)
                                              ? "fill-orange-400 text-orange-400"
                                              : "fill-orange-300 text-orange-300"
                                          }`}
                                        />
                                      ))}
                                      <span className="ml-1 text-sm font-medium">
                                        {review.rating}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {review.comment}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm">
                                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                                      <ThumbsUp className="w-4 h-4" />
                                      Helpful ({review.helpful})
                                    </button>
                                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                                      <Share2 className="w-4 h-4" />
                                      Share
                                    </button>
                                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                                      <Flag className="w-4 h-4" />
                                      Report
                                    </button>
                                  </div>
                                </div>
                              ))}

                              <button className="w-full text-center text-sm text-[#CC5500] hover:underline">
                                Read more reviews
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Revenue Section */}
                    <Card className="max-w-8xl mx-auto shadow-none border-none bg-white">
                      <CardContent className="px-6 py-8">
                        <div className="mb-8">
                          <h2 className="text-2xl font-semibold mb-2">Revenue</h2>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-500">
                              Total Revenue contributed
                            </p>
                            <p className="text-2xl font-bold text-teal-600">
                              USD 0.00
                            </p>
                          </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Top Selling Product */}
                          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-semibold">
                                Top Selling Product
                              </h3>
                              <Select
                                value={sellingPeriod}
                                onValueChange={setSellingPeriod}
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

                            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <p className="text-gray-400">No data available</p>
                            </div>
                          </div>

                          {/* Revenue Trend */}
                          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-semibold">
                                Revenue Trend
                              </h3>
                              <Select
                                value={revenuePeriod}
                                onValueChange={setRevenuePeriod}
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

                  {/* ================= SHOP DETAILS TAB ================= */}
                  <TabsContent value="shop-details" className="space-y-8">
                    <div>
                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardContent className="px-6">
                          <h2 className="text-lg font-semibold mb-3">
                            Basic Information
                          </h2>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-[#1A1A1A]">
                            {/* Row 1 */}
                            <Info
                              label="Full Name"
                              value={`${firstName} ${lastName}`}
                              icon={<User className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center"
                            />
                            <Info
                              label="Joined On"
                              value={formatDate(vendor.createdAt)}
                              icon={<Calendar className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center"
                            />
                            <Info
                              label="Account Name"
                              value={storeName}
                              icon={<Building className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-teal-100 text-teal-600 flex items-center justify-center"
                            />
                            <Info
                              label="Bank Name"
                              value={vendor.bankName || "Not provided"}
                              icon={<Banknote className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center"
                            />

                            {/* Row 2 */}
                            <Info
                              label="Store Name"
                              value={storeName}
                              icon={<Store className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center"
                            />
                            <Info
                              label="Last Active"
                              value={getTimeAgo(vendor.createdAt)}
                              icon={<Clock className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center"
                            />
                            <Info
                              label="Account Number"
                              value={vendor.accNumber || "Not provided"}
                              icon={<CreditCard className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center"
                            />
                            <Info
                              label="Swift Code"
                              value={vendor.swiftCode || "Not provided"}
                              icon={<Code className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center"
                            />

                            {/* Row 3 */}
                            <Info
                              label="Email Address"
                              value={email}
                              icon={<Mail className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center"
                            />
                            <Info
                              label="Country"
                              value={country}
                              icon={<Globe className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center"
                            />
                            <Info
                              label="Phone Number"
                              value={vendor.phoneNumber || "Not provided"}
                              icon={<Phone className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center"
                            />
                            <Info
                              label="City"
                              value={city}
                              icon={<MapPin className="h-5 w-5" />}
                              iconContainerClassName="w-8 h-8 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Store Description */}
                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardContent className="p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Store description
                          </h2>

                          <div className="border rounded-sm p-3">
                            <p className="text-sm text-[#3A3A3A] leading-relaxed dark:text-white">
                              {vendor.description || "No description provided"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Seller story */}
                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardContent className="p-6">
                          <h2 className="text-lg font-semibold mb-4">Seller story</h2>
                          <div className="w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 h-[450px] flex items-center justify-center">
                            <p className="text-gray-400">No video available</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Identity Verification */}
                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardContent className="p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Identity verification
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ImageUpload onImageChange={() => {}} />
                            <ImageUpload onImageChange={() => {}} />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Location of shop */}
                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardContent>
                          <div className="flex flex-row flex-1 justify-between items-center">
                            <div className="space-y-2">
                              <h3 className="text-lg">Location of shop</h3>
                              <p className="text-sm text-gray-600">{`${city}, ${country}`}</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Onboarded by */}
                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardContent>
                          <div className="flex flex-row flex-1 justify-between items-center">
                            <div className="space-y-2">
                              <h3 className="text-lg">Onboarded by</h3>
                            </div>
                            <Badge
                              variant={"outline"}
                              className="h-11 rounded-md text-sm px-4"
                            >
                              Self Onboarded
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Store Status */}
                      <Card className="max-w-8xl mx-auto mt-8 shadow-none border-none bg-white">
                        <CardHeader>
                          <h2 className="text-lg font-semibold">Store Status</h2>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-row flex-1 justify-between items-center">
                            <div className="space-y-2">
                              <p className="text-md">Change seller store status</p>
                              <p className="text-sm text-gray-600">
                                Current status: <span className="font-semibold">{vendorStatusDisplay.label}</span>
                              </p>
                            </div>
                            <Button
                              variant={"secondary"}
                              className="text-[#E51C00] h-11"
                            >
                              Change Status
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* ================= ORDERS TAB ================= */}
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

                              <div className="flex items-center gap-3">
                                <div className="flex rounded-lg p-1 gap-4">
                                  <Button
                                    variant={"outline"}
                                    onClick={() => setViewMode("grid")}
                                    className={`h-11 ${
                                      viewMode === "grid"
                                        ? "bg-[#CC5500] hover:bg-[#CC5500]/90 hover:text-white text-white"
                                        : ""
                                    }`}
                                  >
                                    <GridIcon className="h-4 w-4" />
                                    Grid
                                  </Button>
                                  <Button
                                    variant={"outline"}
                                    onClick={() => setViewMode("list")}
                                    className={`h-11 ${
                                      viewMode === "list"
                                        ? "bg-[#CC5500] hover:bg-[#CC5500]/90 hover:text-white text-white"
                                        : ""
                                    }`}
                                  >
                                    <ListIcon className="h-4 w-4" />
                                    List
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Orders Display */}
                          <div className="">
                            {viewMode === "list" ? (
                              <DataTable<Order>
                                data={filteredOrders}
                                fields={orderFields}
                                actions={orderActions}
                                enableSelection={true}
                                enablePagination={true}
                                pageSize={10}
                              />
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredOrders.map((order) => (
                                  <Card key={order.id} className="border">
                                    <CardContent className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                          <span className="font-medium">
                                            {order.orderNumber}
                                          </span>
                                          <Badge
                                            className={`${
                                              statusConfig[order.status].bgColor
                                            } ${
                                              statusConfig[order.status]
                                                .textColor
                                            }`}
                                          >
                                            {statusConfig[order.status].label}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {order.date}
                                        </p>
                                        <p className="font-medium">
                                          {order.productName}
                                        </p>
                                        <div className="flex justify-between text-sm">
                                          <span>Qty: {order.quantity}</span>
                                          <span className="font-medium">
                                            {formatAmount(order.totalAmount)}
                                          </span>
                                        </div>
                                        <p className="text-sm">
                                          Payment: {order.paymentMethod}
                                        </p>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full mt-2"
                                          onClick={() =>
                                            navigate(`/admin/orders/${order.id}`)
                                          }
                                        >
                                          <EyeIcon className="h-4 w-4 mr-2" />
                                          View Details
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
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

                  {/* Product Listings, Wishlists, Compliance Tabs - Placeholder */}
                  {(activeTab === "product-listings" ||
                    activeTab === "wishlists" ||
                    activeTab === "compliance") && (
                    <TabsContent value={activeTab} className="mt-8">
                      <Card className="max-w-8xl mx-auto shadow-none border-none bg-white">
                        <CardContent className="px-6 py-12 text-center">
                          <p className="text-gray-500">
                            {activeTab.charAt(0).toUpperCase() +
                              activeTab.slice(1).replace("-", " ")}{" "}
                            content coming soon...
                          </p>
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