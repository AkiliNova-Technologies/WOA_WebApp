import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import {
  ArrowLeft,
  Pen,
  Calendar,
  Mail,
  Phone,
  Package,
  Clock,
  MapPin,
  ExternalLink,
  ListFilter,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

type DateRange = "last-7-days" | "last-30-days" | "all-time";
type DetailsTab = "overview" | "details" | "products";
type ProductTab =
  | "all"
  | "received"
  | "in-preparation"
  | "ready"
  | "shipped"
  | "rejected";

interface WarehouseDetails {
  id: string;
  warehouseId: string;
  city: string;
  country: string;
  createdOn: string;
  lastActivity: string;
  manager: string;
  managerEmail: string;
  managerPhone: string;
  maxCapacity: number;
  daysOfOperation: string;
  operatingHours: string;
  location: string;
  locationPin: string;
  additionalInfo: string;
  status: "active" | "inactive" | "closed";
}

interface ProductData {
  id: string;
  orderId: string;
  productName: string;
  receivedOn: string;
  qtyOrdered: number;
  status: "received" | "preparing" | "ready" | "shipped" | "rejected";
  [key: string]: any;
}

export default function AdminWarehouseDetails() {
  const navigate = useNavigate();
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const [activeTab, setActiveTab] = useState<DetailsTab>("details");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");
  const [productTab, setProductTab] = useState<ProductTab>("all");

  // Mock warehouse data
  const warehouseDetails: WarehouseDetails = {
    id: warehouseId || "1",
    warehouseId: "WOA-001",
    city: "Kampala",
    country: "Uganda",
    createdOn: "2024-01-15",
    lastActivity: "21hr ago",
    manager: "Victor Wandulu",
    managerEmail: "victor@example.com",
    managerPhone: "(256) 430 27395",
    maxCapacity: 2000,
    daysOfOperation: "Mon, Tue, Wed, Thu, Fri, Sat",
    operatingHours: "8AM - 5PM",
    location: "Kampala, Uganda",
    locationPin: "Plot 19, Binayomba road",
    additionalInfo: "Next to Ambrossoli International School",
    status: "active",
  };

  // Mock products data
  const mockProducts: ProductData[] = [
    {
      id: "1",
      orderId: "#000001",
      productName: "African made sandals",
      receivedOn: "7 Jan 2025",
      qtyOrdered: 1,
      status: "received",
    },
    {
      id: "2",
      orderId: "#000002",
      productName: "Hand-crafted leather bag",
      receivedOn: "14 Feb 2025",
      qtyOrdered: 3,
      status: "preparing",
    },
    {
      id: "3",
      orderId: "#000003",
      productName: "Eco-friendly Jewerly",
      receivedOn: "21 Mar 2025",
      qtyOrdered: 1,
      status: "preparing",
    },
  ];

  const [products] = useState<ProductData[]>(mockProducts);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      productTab === "all" ||
      (productTab === "received" && product.status === "received") ||
      (productTab === "in-preparation" && product.status === "preparing") ||
      (productTab === "ready" && product.status === "ready") ||
      (productTab === "shipped" && product.status === "shipped") ||
      (productTab === "rejected" && product.status === "rejected");

    return matchesSearch && matchesTab;
  });

  const handleTabClick = (tab: DetailsTab) => {
    setActiveTab(tab);
  };

  const handleProductTabClick = (tab: ProductTab) => {
    setProductTab(tab);
  };

  const getTabButtonClass = (tab: DetailsTab) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";

    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  const getProductTabButtonClass = (tab: ProductTab) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowra";

    if (productTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  // Status configuration
  const statusConfig = {
    received: {
      label: "Received",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    preparing: {
      label: "Preparing",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    ready: {
      label: "Ready for shipment",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    shipped: {
      label: "Shipped",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  // Product table fields
  const productFields: TableField<ProductData>[] = [
    {
      key: "orderId",
      header: "Order ID",
      cell: (value) => <span className="font-semibold">{value as string}</span>,
    },
    {
      key: "productName",
      header: "Product name",
      cell: (value) => <span>{value as string}</span>,
    },
    {
      key: "receivedOn",
      header: "Received on",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "qtyOrdered",
      header: "QTY ordered",
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
    },
  ];

  const productActions: TableAction<ProductData>[] = [
    {
      type: "custom",
      label: "Actions",
      icon: <MoreHorizontal className="size-5" />,
      onClick: (product) => {
        console.log("Product action:", product);
      },
    },
  ];

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen py-6">
        {/* Header */}
        <div className="bg-white rounded-md mb-6 mx-6 dark:bg-[#303030]">
          <div className="mx-auto px-10 py-4 flex items-center justify-between">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={"secondary"}
                className="bg-white hover:text-gray-900 dark:bg-[#303030]"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Back
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-700 border-green-300"
              >
                Warehouse is {warehouseDetails.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative h-32 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Content */}
        <div className="max-w-8xl mx-auto px-6 -mt-16 relative">
          <Card className="p-0 mb-6 shadow-none bg-transparent border-none dark:bg-trandparent">
            <div className="bg-white p-6 rounded-lg rounded-b-none border border-b-0 dark:bg-[#303030]">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  {warehouseDetails.warehouseId}
                </h1>
                <p className="text-gray-600">
                  {warehouseDetails.city} • {warehouseDetails.country}
                </p>
              </div>

              {/* Tab Navigation - Custom Implementation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-0 px-6 overflow-x-auto">
                  <button
                    className={getTabButtonClass("overview")}
                    onClick={() => handleTabClick("overview")}
                  >
                    Overview
                  </button>
                  <button
                    className={getTabButtonClass("details")}
                    onClick={() => handleTabClick("details")}
                  >
                    Warehouse details
                  </button>
                  <button
                    className={getTabButtonClass("products")}
                    onClick={() => handleTabClick("products")}
                  >
                    Products
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6 -mt-6">
                  <Card className="px-6 shadow-none rounded-t-none border-t-0">
                    <div className="text-center py-12 text-gray-500">
                      Overview content goes here
                    </div>
                  </Card>
                </div>
              )}

              {/* Warehouse Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-6 -mt-6">
                  {/* Basic Information */}
                  <Card className="px-6 shadow-none rounded-t-none border-t-0">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        Basic Information
                      </h2>
                      <Button variant="default" size="sm" className="gap-2">
                        <Pen className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Package className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Warehouse ID
                            </p>
                            <p className="font-semibold">
                              {warehouseDetails.warehouseId}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Created On
                            </p>
                            <p className="font-semibold">
                              {warehouseDetails.createdOn}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Warehouse manager
                            </p>
                            <p className="font-semibold">
                              {warehouseDetails.manager}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Package className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Maximum package capacity
                            </p>
                            <p className="font-semibold">
                              {warehouseDetails.maxCapacity} packages
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Clock className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Last activity
                            </p>
                            <p className="font-semibold">
                              {warehouseDetails.lastActivity}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Phone Number
                            </p>
                            <p className="font-semibold">
                              {warehouseDetails.managerPhone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Operating Hours */}
                  <Card className="px-6 shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Operating hours</h2>
                      <Button variant="default" size="sm" className="gap-2">
                        <Pen className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Days of operation
                            </p>
                            <p className="font-semibold">
                              {warehouseDetails.daysOfOperation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Times</p>
                            <p className="font-semibold">
                              {warehouseDetails.operatingHours}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Location */}
                  <Card className="px-6 shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Location</h2>
                      <Button variant="default" size="sm" className="gap-2">
                        <Pen className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Location
                            </p>
                            <p className="font-semibold">
                              {warehouseDetails.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                Location pin
                              </p>
                              <p className="font-semibold">
                                {warehouseDetails.locationPin}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Additional Information
                      </p>
                      <p className="font-semibold">
                        {warehouseDetails.additionalInfo}
                      </p>
                    </div>
                  </Card>

                  {/* Warehouse Status */}
                  <Card className="px-6 shadow-none">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold mb-1">
                          Warehouse Status
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Update warehouse status
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 border border-red-600/30 rounded-full bg-red-600/10"
                      >
                        Change Status
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  <div className="bg-white border border-t-0 p-6 pt-0 rounded-lg rounded-t-none -mt-6 dark:bg-[#303030]">
                    <div>
                      <h2 className="text-xl font-bold mb-2">All products</h2>
                      <p className="text-sm text-gray-600 mb-6">
                        Manage and monitor all product in the warehouse
                      </p>

                      {/* Search and Filters */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                        <div className="w-full sm:w-96">
                          <Search
                            placeholder="Search"
                            value={searchQuery}
                            onSearchChange={setSearchQuery}
                            className="rounded-md"
                          />
                        </div>

                        <div className="flex flex-row items-center gap-3">
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

                          {/* Filter and Export Buttons */}
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <ListFilter className="w-4 h-4" />
                            Filter
                          </Button>

                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                      </div>

                      {/* Product Tabs Navigation - Custom Implementation */}
                      <div className="border-b border-gray-200">
                        <div className="flex gap-0 overflow-x-auto">
                          <button
                            className={getProductTabButtonClass("all")}
                            onClick={() => handleProductTabClick("all")}
                          >
                            All Products
                          </button>
                          <button
                            className={getProductTabButtonClass("received")}
                            onClick={() => handleProductTabClick("received")}
                          >
                            Received
                          </button>
                          <button
                            className={getProductTabButtonClass(
                              "in-preparation"
                            )}
                            onClick={() =>
                              handleProductTabClick("in-preparation")
                            }
                          >
                            In preparation
                          </button>
                          <button
                            className={getProductTabButtonClass("ready")}
                            onClick={() => handleProductTabClick("ready")}
                          >
                            Ready for shipment
                          </button>
                          <button
                            className={getProductTabButtonClass("shipped")}
                            onClick={() => handleProductTabClick("shipped")}
                          >
                            Shipped
                          </button>
                          <button
                            className={getProductTabButtonClass("rejected")}
                            onClick={() => handleProductTabClick("rejected")}
                          >
                            Rejected
                          </button>
                        </div>
                      </div>

                      {/* Products Table */}
                      <div className="mt-6">
                        <DataTable<ProductData>
                          data={filteredProducts}
                          fields={productFields}
                          actions={productActions}
                          enableSelection={true}
                          enablePagination={true}
                          pageSize={10}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
