import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";

type DetailsTab = "overview" | "order-details";
type OrderStatus =
  | "pending"
  | "ongoing"
  | "completed"
  | "returned"
  | "unfulfilled"
  | "failed";

interface OrderDetails {
  id: string;
  orderId: string;
  orderDate: string;
  expectedDelivery: string;
  dropOffBy: string;
  dropOffZone: string;
  dropOffZoneMessage: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  paymentMethod: string;
  orderTotal: number;
  subTotal: number;
  shipping: number;
  tax: number;
  trackingNumber?: string;
}

interface VariantDetail {
  id: string;
  size: string;
  color: string;
  qty: number;
  priceUSD: number;
  totalUSD: number;
  stockStatus: "in-stock" | "limited-stock" | "out-of-stock";
}

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  variants: VariantDetail[];
}

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailsTab>("order-details");

  // Mock order data
  const orderDetails: OrderDetails = {
    id: id || "1",
    orderId: "WOA-001",
    orderDate: "11/12/2025",
    expectedDelivery: "21/12/2025",
    dropOffBy: "13/12/2025",
    dropOffZone:
      "You can drop the product off at any one of our drop off zones.",
    dropOffZoneMessage: "See available drop off zones",
    status: "pending",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    customerPhone: "+256 700 000 001",
    shippingAddress: "123 Main Street, Apartment 4B",
    shippingCity: "Kampala",
    shippingCountry: "Uganda",
    paymentMethod: "Credit Card",
    orderTotal: 120.0,
    subTotal: 100.0,
    shipping: 15.0,
    tax: 5.0,
    trackingNumber: "TRK123456789",
  };

  // Mock order items
  const orderItems: OrderItem[] = [
    {
      id: "1",
      productName: "African made sandals",
      productImage: "/products/sandals.jpg",
      variants: [
        {
          id: "1",
          size: "XL",
          color: "Red",
          qty: 1,
          priceUSD: 20,
          totalUSD: 20,
          stockStatus: "limited-stock",
        },
      ],
    },
  ];

  const handleTabClick = (tab: DetailsTab) => {
    setActiveTab(tab);
  };

  const getTabButtonClass = (tab: DetailsTab) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";

    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  // Status configuration
  const statusConfig = {
    pending: {
      label: "Pending confirmation",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    ongoing: {
      label: "Ongoing",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    returned: {
      label: "Returned",
      className: "bg-purple-100 text-purple-700 border-purple-300",
    },
    unfulfilled: {
      label: "Unfulfilled",
      className: "bg-orange-100 text-orange-700 border-orange-300",
    },
    failed: {
      label: "Failed",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  // Stock status configuration
  const stockStatusConfig = {
    "in-stock": {
      label: "In stock",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    "limited-stock": {
      label: "Limited stock",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    "out-of-stock": {
      label: "Out of stock",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  return (
    <>
      <SiteHeader label="Order Management" />
      <div className="min-h-screen px-6 ">
        {/* Header */}
        <div className="bg-white rounded-md mb-6 dark:bg-[#303030]">
          <div className="mx-auto px-10 py-4 flex items-center justify-between">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={"ghost"}
                className="p-0 hover:bg-transparent"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Back
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={statusConfig[orderDetails.status].className}
              >
                {statusConfig[orderDetails.status].label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Hero Section with Cover Image */}
        <div className="relative w-full h-[380px] overflow-hidden rounded-2xl mb-6">
          <img
            src={images.Placeholder}
            alt="Cover"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Content */}
        <div className="max-w-8xl -mt-32 mx-6 relative">
          <Card className="p-0 rounded-b-none border-b-0">
            <div className="p-6 rounded-lg rounded-b-none border-b-0">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  {orderDetails.orderId}
                </h1>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6">
                <div className="flex gap-0 overflow-x-auto">
                  <button
                    className={getTabButtonClass("overview")}
                    onClick={() => handleTabClick("overview")}
                  >
                    Overview
                  </button>
                  <button
                    className={getTabButtonClass("order-details")}
                    onClick={() => handleTabClick("order-details")}
                  >
                    Order Details
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Tab Content */}
          <div className="p-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <Card className="px-6 pb-6 rounded-t-none border-t-0">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Item - 1</h2>
                  {/* Add overview content here */}
                </div>
              </Card>
            )}

            {/* Order Details Tab */}
            {activeTab === "order-details" && (
              <div className="space-y-6 mb-8">
                {/* Order Details Section */}
                <Card className="px-6 pb-6 rounded-t-none border-t-0">
                  <h2 className="text-2xl font-semibold mb-6">Order details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Order date
                      </p>
                      <p className="text-lg font-semibold">
                        {orderDetails.orderDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Expected delivery
                      </p>
                      <p className="text-lg font-semibold">
                        {orderDetails.expectedDelivery}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Drop Off Section */}
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Drop off</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Drop off by
                      </p>
                      <p className="text-lg font-semibold">
                        {orderDetails.dropOffBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Drop off zone
                      </p>
                      <div className="flex justify-between">
                        <p className="mb-2">{orderDetails.dropOffZone}</p>
                        <Button
                          variant="outline"
                          className="px-6 rounded-full h-auto bg-blue-100 text-blue-700 border-blue-300"
                        >
                          {orderDetails.dropOffZoneMessage}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Variant Details Section */}
                <Card className=" p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Variant details
                  </h2>

                  {orderItems.map((item) => (
                    <div key={item.id} className="mb-8">
                      {/* Product Info */}
                      {/* <div className="flex items-center gap-4 mb-6">
                        
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.productName}
                          </h3>
                        </div>
                      </div> */}

                      {/* Variant Table */}
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-[#303030]">
                            <tr>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                Size
                              </th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                Color
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                QTY
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                Price (USD)
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total (USD)
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                Stock status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-[#303030] divide-y divide-gray-200 dark:divide-gray-100">
                            {item.variants.map((variant) => (
                              <tr key={variant.id}>
                                <td className="px-6 py-4 text-sm">
                                  {variant.size}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  {variant.color}
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  {variant.qty}
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  {variant.priceUSD}
                                </td>
                                <td className="px-6 py-4 text-sm text-center font-semibold">
                                  {variant.totalUSD}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      stockStatusConfig[variant.stockStatus]
                                        .className
                                    } text-xs`}
                                  >
                                    {
                                      stockStatusConfig[variant.stockStatus]
                                        .label
                                    }
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  {/* More about the product link */}
                  <div className="flex justify-between">
                    <span>More about the product</span>
                    <Button
                      variant="secondary"
                      className="text-base p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
