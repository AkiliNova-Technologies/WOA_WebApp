"use client";

import {
  Bell,
  Camera,
  ClipboardList,
  FileText,
  Mail,
  Pencil,
  ShoppingCartIcon,
  type LucideIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { PieDonutChartComponent } from "@/components/charts/pie-chart";
import {
  DataTable,
  type TableField,
  type TableAction,
} from "@/components/data-table";
import type { ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import images from "@/assets/images";

interface OrderData {
  id: string;
  productOrdered: string;
  noOfItems: number;
  orderedOn: string;
  [key: string]: any;
}

interface PopularProduct {
  id: string;
  name: string;
  image: string;
  earning: number;
  status: "active" | "pending" | "suspended";
}

interface ReviewData {
  id: string;
  customerName: string;
  date: string;
  rating: number;
  comment: string;
  replies: number;
}

interface ProTip {
  id: string;
  title: string;
  status: string;
  date: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

export default function DashboardPage() {
  // Summary cards data
  const summaryCards: CardData[] = [
    {
      title: "Active products",
      value: "0",
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Pending balance",
      value: "0",
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "New Orders",
      value: "0",
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Low stock products",
      value: "0",
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
  ];

  // Sales Performance Chart Data
  const salesChartData = [
    { month: "Jan 11", sales: 65 },
    { month: "Feb 11", sales: 45 },
    { month: "Mar 11", sales: 52 },
    { month: "Apr 11", sales: 25 },
    { month: "May 11", sales: 75 },
    { month: "Jun", sales: 55 },
    { month: "Jul", sales: 45 },
    { month: "Aug", sales: 65 },
    { month: "Sep", sales: 40 },
    { month: "Oct", sales: 35 },
    { month: "Nov", sales: 20 },
    { month: "Dec", sales: 55 },
  ];

  const salesChartConfig = {
    sales: {
      label: "Sales",
      color: "#1B84FF",
    },
  } satisfies ChartConfig;

  // Revenue Distribution Pie Chart Data
  const revenueDistributionData = [
    { name: "Pending", value: 25, fill: "#F6B100" },
    { name: "Processing", value: 25, fill: "#FF6F1E" },
    { name: "Paid", value: 25, fill: "#17C653" },
    { name: "Due for payment", value: 25, fill: "#7239EA" },
  ];

  const revenueDistributionConfig = {
    pending: {
      label: "Pending",
      color: "#F6B100",
    },
    processing: {
      label: "Processing",
      color: "#FF6F1E",
    },
    paid: {
      label: "Paid",
      color: "#17C653",
    },
    "due-for-payment": {
      label: "Due for payment",
      color: "#7239EA",
    },
  } satisfies ChartConfig;

  // Order Stats data
  const orderStatsData: OrderData[] = [
    {
      id: "1",
      productOrdered: "African made sandals",
      noOfItems: 1,
      orderedOn: "7 Jan 2025",
    },
    {
      id: "2",
      productOrdered: "Handcrafted leather bags",
      noOfItems: 2,
      orderedOn: "14 Feb 2025",
    },
    {
      id: "3",
      productOrdered: "Beaded jewelry from Kenya",
      noOfItems: 3,
      orderedOn: "21 Mar 2025",
    },
    {
      id: "4",
      productOrdered: "Traditional woven baskets",
      noOfItems: 4,
      orderedOn: "28 Apr 2025",
    },
    {
      id: "5",
      productOrdered: "Mud cloth wall hangings",
      noOfItems: 5,
      orderedOn: "5 May 2025",
    },
  ];

  const orderFields: TableField<OrderData>[] = [
    {
      key: "productOrdered",
      header: "Product ordered",
      enableSorting: true,
    },
    {
      key: "noOfItems",
      header: "No. of items",
      enableSorting: true,
      align: "center",
    },
    {
      key: "orderedOn",
      header: "Ordered on",
      enableSorting: true,
      align: "center",
    },
  ];

  const orderActions: TableAction<OrderData>[] = [
    {
      type: "view",
      label: "View order",
      onClick: (row) => console.log("View order:", row),
    },
  ];

  // Popular Products data
  const popularProducts: PopularProduct[] = [
    {
      id: "1",
      name: "Handcrafted leather sandals",
      image: "/products/leather-sandals.jpg",
      earning: 7750.88,
      status: "active",
    },
    {
      id: "2",
      name: "Bespoke slip-on loafers",
      image: "/products/loafers.jpg",
      earning: 3250.13,
      status: "active",
    },
    {
      id: "3",
      name: "Stylish ankle sandals",
      image: "/products/ankle-sandals.jpg",
      earning: 4750.17,
      status: "pending",
    },
    {
      id: "4",
      name: "Eco-friendly canvas Sandals",
      image: "/products/canvas-sandals.jpg",
      earning: 2000.47,
      status: "suspended",
    },
  ];

  // Reviews data
  const reviewsData: ReviewData[] = [
    {
      id: "1",
      customerName: "Customer 1",
      date: "Jul 22 2025",
      rating: 5.0,
      comment:
        "Absolutely love these! Extremely comfortable right out of the box. Perfect for both casual and formal occasions.",
      replies: 1,
    },
    {
      id: "2",
      customerName: "Customer 2",
      date: "Sep 15 2025",
      rating: 4.8,
      comment:
        "Great product! Stylish and versatile, but the sizing runs a bit small.",
      replies: 0,
    },
    {
      id: "3",
      customerName: "Customer 3",
      date: "Oct 10 2025",
      rating: 4.5,
      comment:
        "Very good quality. They look amazing, although I wish there were more color options!",
      replies: 2,
    },
  ];

  // Pro Tips data
  const proTips: ProTip[] = [
    {
      id: "1",
      title: "Early access",
      status: "New",
      date: "Aug 15",
      icon: Pencil,
      badge: "New",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "2",
      title: "Asset use guidelines",
      status: "The most",
      date: "Mar 5",
      icon: Mail,
      badge: "The most",
      badgeColor: "bg-orange-100 text-orange-700",
    },
    {
      id: "3",
      title: "Exclusive downloads",
      status: "",
      date: "Jun 23",
      icon: ClipboardList,
    },
    {
      id: "4",
      title: "Behind the scenes",
      status: "Hot",
      date: "Sep 4",
      icon: Camera,
      badge: "Hot",
      badgeColor: "bg-red-100 text-red-700",
    },
    {
      id: "5",
      title: "Asset use guidelines",
      status: "Popular",
      date: "Dec 30",
      icon: FileText,
      badge: "Popular",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      id: "6",
      title: "Life & work updates",
      status: "",
      date: "Nov 10",
      icon: Bell,
    },
  ];

  // Status configuration for products
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    suspended: {
      label: "Suspended",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  // Empty state for order stats
  const OrderStatsEmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No orders" className="w-64" />
      </div>
      <h3 className="text-lg font-semibold">No Orders</h3>
    </div>
  );

  // Empty state for reviews
  const ReviewsEmptyState = () => (
    <div className="text-center py-12">
      <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen ">
        <div className="@container/main px-6 space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome, Victor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Summary Cards */}
          <SectionCards cards={summaryCards} layout="1x4" />

          {/* Main Layout */}
          <div className="grid grid-cols-1 @4xl/main:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="space-y-6 @4xl/main:col-span-2">
              {/* Order Stats */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Order stats</h2>
                  <div className="flex items-center gap-3">
                    <select className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                      <option>All time</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                    <Button className="bg-black text-white hover:bg-black/90">
                      View all orders
                    </Button>
                  </div>
                </div>

                {orderStatsData.length > 0 ? (
                  <DataTable
                    data={orderStatsData}
                    fields={orderFields}
                    actions={orderActions}
                    enableSelection={false}
                    enablePagination={true}
                    pageSize={5}
                  />
                ) : (
                  <OrderStatsEmptyState />
                )}
              </div>

              {/* Sales Performance */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Sales performance</h2>
                  <select className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                    <option>All time</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <AreaChartComponent
                  data={salesChartData}
                  config={salesChartConfig}
                  title=""
                  chartHeight="300px"
                  showYAxis={true}
                  yAxisWidth={50}
                  yAxisTickCount={5}
                />
              </div>

              {/* Pro Tips */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Pro tips</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Need some ideas for the next product?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proTips.map((tip) => {
                    const Icon = tip.icon;
                    return (
                      <div
                        key={tip.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {tip.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {tip.badge && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${tip.badgeColor}`}
                              >
                                {tip.badge}
                              </span>
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <img
                                src="/avatar-placeholder.jpg"
                                alt=""
                                className="w-4 h-4 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                              {tip.date}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Revenue Distribution */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    Revenue distribution
                  </h2>
                  <select className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                    <option>All time</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <PieDonutChartComponent
                  data={revenueDistributionData}
                  config={revenueDistributionConfig}
                  title=""
                  chartHeight="300px"
                  showKey={true}
                  keyPosition="bottom"
                  keyOrientation="horizontal"
                  keyAlignment="center"
                  innerRadius="70%"
                  outerRadius="100%"
                  className="p-0"
                  chartPadding={{ top: 0, right: 0, bottom: 20, left: 0 }}
                  keyItemGap={20}
                />
              </div>

              {/* Popular Products */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Popular products</h2>

                {popularProducts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span>Products</span>
                      <span>Earning</span>
                    </div>
                    {popularProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 pb-4 border-b last:border-b-0"
                      >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {product.name}
                          </p>
                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className={`${
                                statusConfig[product.status].className
                              } text-xs`}
                            >
                              {statusConfig[product.status].label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            ${product.earning.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Your most wished products will appear here
                    </p>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Button variant="outline" className="w-full">
                    View all products
                  </Button>
                </div>
              </div>

              {/* Review and Ratings */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Review and ratings</h2>
                  <select className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                    <option>All time</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>

                {reviewsData.length > 0 ? (
                  <div className="space-y-6">
                    {reviewsData.map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-6 last:border-b-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {review.customerName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {review.customerName}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {review.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(review.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-xs font-medium ml-1">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {review.comment}
                        </p>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Replies ({review.replies})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ReviewsEmptyState />
                )}

                <div className="mt-6 text-center">
                  <Button variant="outline" className="w-full">
                    View all reviews
                  </Button>
                </div>
              </div>

              {/* Return Requests */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-6">Return requests</h2>
                <div className="text-center py-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <ShoppingCartIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <p className="text-sm mb-1">
                    You have <strong>52 open refund requests</strong> to action.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    This includes <strong>8 new requests</strong>. 👀
                  </p>
                  <Button variant="outline" className="w-full">
                    Review return requests
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
