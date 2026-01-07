"use client";

import { ShoppingCartIcon } from "lucide-react";
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
import { EmptyStateIllustration } from "@/components/empty-state-illustration";

interface SellerData {
  id: string;
  name: string;
  signedUpOn: string;
  businessName: string;
  [key: string]: any;
}

interface ProductData {
  id: string;
  name: string;
  category: string;
  image?: string;
  [key: string]: any;
}

interface OrderData {
  id: string;
  orderId: string;
  orderedOn: string;
  numberOfItems: number;
  orderValue: number;
  [key: string]: any;
}

interface ReviewData {
  id: string;
  reviewerName: string;
  date: string;
  rating: number;
  comment: string;
  replies: number;
}

export default function AdminDashboardPage() {
  // Summary cards data
  const summaryCards: CardData[] = [
    {
      title: "Customers",
      value: "0",
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Sellers",
      value: "0",
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
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
      title: "Orders",
      value: "0",
      change: {
        value: "10%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Net Revenue",
      value: "0",
      change: {
        value: "10%",
        trend: "down",
        description: "",
      },
    },
  ];

  // Customers Overview Chart Data
  const customersChartData = [
    { month: "Jan", customers: 65 },
    { month: "Feb", customers: 45 },
    { month: "Mar", customers: 35 },
    { month: "Apr", customers: 52 },
    { month: "May", customers: 40 },
    { month: "Jun", customers: 25 },
    { month: "Jul", customers: 75 },
    { month: "Aug", customers: 55 },
    { month: "Sep", customers: 45 },
    { month: "Oct", customers: 65 },
    { month: "Nov", customers: 40 },
    { month: "Dec", customers: 25 },
  ];

  const customersChartConfig = {
    customers: {
      label: "Customers",
      color: "#1B84FF",
    },
  } satisfies ChartConfig;

  // Revenue Stats Pie Chart Data
  const revenueStatsData = [
    { name: "Pending", value: 25, fill: "#F6B100" },
    { name: "Processing", value: 35, fill: "#FF6F1E" },
    { name: "Paid", value: 20, fill: "#17C653" },
    { name: "Due for payment", value: 20, fill: "#7239EA" },
  ];

  const revenueStatsConfig = {
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

  // Seller Stats Pie Chart Data
  const sellerStatsData = [
    { name: "Pending", value: 10, fill: "#916F1F" },
    { name: "Onboarded", value: 8, fill: "#1A74A8" },
    { name: "Active", value: 50, fill: "#067A57" },
    { name: "Deactivated", value: 60, fill: "#000626E5" },
  ];

  const sellerStatsConfig = {
    pending: {
      label: "Pending",
      color: "#916F1F",
    },
    onboarded: {
      label: "Onboarded",
      color: "#1A74A8",
    },
    active: {
      label: "Active",
      color: "#067A57",
    },
    deactivated: {
      label: "Deactivated",
      color: "#000626E5",
    },
  } satisfies ChartConfig;

  // Sellers pending approval data
  const sellersPendingData: SellerData[] = [
    {
      id: "1",
      name: "Chike Okafor",
      signedUpOn: "7 Jan 2025",
      businessName: "Ubuntu Creations",
    },
    {
      id: "2",
      name: "Amina Adetokunbo",
      signedUpOn: "14 Feb 2025",
      businessName: "Soulful Stitches",
    },
    {
      id: "3",
      name: "Kwame Nkrumah",
      signedUpOn: "21 Mar 2025",
      businessName: "Style Junction",
    },
    {
      id: "4",
      name: "Zuri Mwangi",
      signedUpOn: "28 Apr 2025",
      businessName: "The Collective Market",
    },
    {
      id: "5",
      name: "Bola Oladipo",
      signedUpOn: "5 May 2025",
      businessName: "Future Designs",
    },
    {
      id: "6",
      name: "Sefu Ndidi",
      signedUpOn: "12 Jun 2025",
      businessName: "Nova Threads",
    },
  ];

  const sellerFields: TableField<SellerData>[] = [
    { key: "name", header: "Seller name", enableSorting: true },
    { key: "signedUpOn", header: "Signed up on", enableSorting: true },
    { key: "businessName", header: "Business name", enableSorting: true },
  ];

  const sellerActions: TableAction<SellerData>[] = [
    {
      type: "view",
      label: "View seller",
      onClick: (row) => console.log("View seller:", row),
    },
  ];

  // Products pending approval data
  const productsPendingData: ProductData[] = [
    {
      id: "1",
      name: "African made sandals",
      category: "Fashion & Apparel",
    },
    {
      id: "2",
      name: "Hand-crafted leather bag",
      category: "Fashion & Apparel",
    },
    {
      id: "3",
      name: "Eco-friendly Jewerly",
      category: "Fashion & Apparel",
    },
    {
      id: "4",
      name: "Artisan beaded necklace",
      category: "Fashion & Apparel",
    },
  ];

  const productFields: TableField<ProductData>[] = [
    {
      key: "name",
      header: "Product name",
      enableSorting: true,
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          {row.image && (
            <img
              src={row.image}
              alt={String(value)}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <span>{String(value)}</span>
        </div>
      ),
    },
    { key: "category", header: "Category", enableSorting: true },
  ];

  const productActions: TableAction<ProductData>[] = [
    {
      type: "view",
      label: "View product",
      onClick: (row) => console.log("View product:", row),
    },
  ];

  // New Orders data
  const newOrdersData: OrderData[] = [
    {
      id: "1",
      orderId: "#000001",
      orderedOn: "7 Jan 2025",
      numberOfItems: 1,
      orderValue: 10.0,
    },
    {
      id: "2",
      orderId: "#000002",
      orderedOn: "14 Feb 2025",
      numberOfItems: 2,
      orderValue: 20.0,
    },
    {
      id: "3",
      orderId: "#000003",
      orderedOn: "21 Mar 2025",
      numberOfItems: 3,
      orderValue: 30.0,
    },
    {
      id: "4",
      orderId: "#000004",
      orderedOn: "28 Apr 2025",
      numberOfItems: 4,
      orderValue: 40.0,
    },
    {
      id: "5",
      orderId: "#000005",
      orderedOn: "5 May 2025",
      numberOfItems: 5,
      orderValue: 50.0,
    },
  ];

  const orderFields: TableField<OrderData>[] = [
    { key: "orderId", header: "Order ID", enableSorting: true },
    { key: "orderedOn", header: "Ordered on", enableSorting: true },
    {
      key: "numberOfItems",
      header: "No of Items",
      enableSorting: true,
      align: "center",
    },
    {
      key: "orderValue",
      header: "Order Value (USD)",
      enableSorting: true,
      align: "right",
      cell: (value) => `${Number(value).toFixed(2)}`,
    },
  ];

  const orderActions: TableAction<OrderData>[] = [
    {
      type: "view",
      label: "View order",
      onClick: (row) => console.log("View order:", row),
    },
  ];

  // Reviews data
  const reviewsData: ReviewData[] = [
    {
      id: "1",
      reviewerName: "Emma Stone",
      date: "Jul 22 2025",
      rating: 5.0,
      comment:
        "Absolutely love these! Extremely comfortable right out of the box. Perfect for both casual and formal occasions.",
      replies: 1,
    },
    {
      id: "2",
      reviewerName: "Ryan Gosling",
      date: "Sep 15 2025",
      rating: 4.8,
      comment:
        "Great product! Stylish and versatile, but the sizing runs a bit small.",
      replies: 1,
    },
    {
      id: "3",
      reviewerName: "Jennifer Lawrence",
      date: "Oct 10 2025",
      rating: 4.5,
      comment:
        "Very good quality. They look amazing, although I wish there were more color options!",
      replies: 1,
    },
  ];

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <div className="@container/main p-6 space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome, Victor
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening on the platform today.
            </p>
          </div>

          {/* Summary Cards */}
          <SectionCards cards={summaryCards} layout="1x5" />

          {/* Main Layout */}
          <div className="grid grid-cols-1 @4xl/main:grid-cols-3 gap-6">
            <div className="space-y-8 col-span-2">
              {/* Customers Overview */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <AreaChartComponent
                  data={customersChartData}
                  config={customersChartConfig}
                  title="Customers Overview"
                  chartHeight="300px"
                  showYAxis={true}
                  yAxisWidth={50}
                  yAxisTickCount={5}
                />
              </div>

              {/* Sellers Pending Approval */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    Sellers pending approval
                  </h2>
                  <div className="flex items-center gap-3">
                    <select className="border rounded-lg px-3 py-2 text-sm">
                      <option>All time</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                    <Button>View all sellers</Button>
                  </div>
                </div>

                {sellersPendingData.length > 0 ? (
                  <DataTable
                    data={sellersPendingData}
                    fields={sellerFields}
                    actions={sellerActions}
                    enableSelection={false}
                    enablePagination={true}
                    pageSize={5}
                  />
                ) : (
                  <div className="text-center py-16">
                    <EmptyStateIllustration className="w-48 h-48 mx-auto mb-4" />
                    <p className="text-lg font-medium">No Sellers</p>
                  </div>
                )}
              </div>

              {/* Products Pending Approval */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    Products pending approval
                  </h2>
                  <div className="flex items-center gap-3">
                    <select className="border rounded-lg px-3 py-2 text-sm">
                      <option>All time</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                    <Button>View all products</Button>
                  </div>
                </div>

                {productsPendingData.length > 0 ? (
                  <DataTable
                    data={productsPendingData}
                    fields={productFields}
                    actions={productActions}
                    enableSelection={false}
                    enablePagination={true}
                    pageSize={5}
                  />
                ) : (
                  <div className="text-center py-16">
                    <EmptyStateIllustration className="w-48 h-48 mx-auto mb-4" />
                    <p className="text-lg font-medium">No Products</p>
                  </div>
                )}
              </div>

              {/* New Orders */}
              <div className="bg-white dark:bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">New Orders</h2>
                  <div className="flex items-center gap-3">
                    <select className="border rounded-lg px-3 py-2 text-sm">
                      <option>All time</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                    <Button>View all orders</Button>
                  </div>
                </div>

                {newOrdersData.length > 0 ? (
                  <DataTable
                    data={newOrdersData}
                    fields={orderFields}
                    actions={orderActions}
                    enableSelection={false}
                    enablePagination={true}
                    pageSize={5}
                  />
                ) : (
                  <div className="text-center py-16">
                    <EmptyStateIllustration className="w-48 h-48 mx-auto mb-4" />
                    <p className="text-lg font-medium">No Orders</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* Revenue and Seller Stats */}
              <div className="space-y-6">
                {/* Revenue Stats */}
                <div className="bg-white dark:bg-card rounded-lg border p-6">
                  <PieDonutChartComponent
                    data={revenueStatsData}
                    config={revenueStatsConfig}
                    title="Revenue Stats"
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

                {/* Seller Stats */}
                <div className="bg-white dark:bg-card rounded-lg border p-6">
                  <PieDonutChartComponent
                    data={sellerStatsData}
                    config={sellerStatsConfig}
                    title="Seller stats"
                    chartHeight="300px"
                    showKey={true}
                    keyPosition="bottom"
                    keyOrientation="horizontal"
                    keyAlignment="center"
                    innerRadius="70%"
                    outerRadius="100%"
                    className="p-0"
                    chartPadding={{ top: 0, right: 20, bottom: 20, left: 20 }}
                    keyItemGap={20}
                  />
                </div>
              </div>

              {/* Review and Ratings + Return Requests Row */}
              <div className="grid grid-cols-1 @4xl/main:grid-cols-1 gap-6">
                {/* Review and Ratings */}
                <div className="bg-white dark:bg-card rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      Review and ratings
                    </h2>
                    <select className="border rounded-lg px-3 py-2 text-sm">
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
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {review.reviewerName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {review.reviewerName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {review.date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                              <span className="text-sm font-medium ml-1">
                                {review.rating}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm mb-3 ml-13">{review.comment}</p>
                          <div className="flex items-center gap-4 ml-13 text-sm text-muted-foreground">
                            <button className="flex items-center gap-1 hover:text-foreground">
                              <span>↩</span>
                              <span>Reply ({review.replies})</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-foreground">
                              <span>⚠</span>
                              <span>Report</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <Button variant="outline">View all reviews</Button>
                  </div>
                </div>

                {/* Return Requests */}
                <div className="bg-white dark:bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-6">
                    Return requests
                  </h2>
                  <div className="text-center py-12">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <ShoppingCartIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <p className="text-sm mb-1">
                      You have <strong>52 open refund requests</strong> to
                      action.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      This includes <strong>8 new requests</strong>. 👀
                    </p>
                    <Button variant="outline">Review return requests</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
