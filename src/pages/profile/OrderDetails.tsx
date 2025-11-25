import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, History } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { initialOrders } from "@/data/Orders";
import { Separator } from "@/components/ui/separator";

// Status badge component for the header
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    delivered: {
      label: "Delivered - Transaction completed",
      className: "bg-[#00A550] text-white",
    },
    ongoing: {
      label: "ONGOING - Transaction ongoing",
      className: "bg-[#CC5500] text-white",
    },
    cancelled: {
      label: "CANCELLED - Transaction cancelled",
      className: "bg-[#E51C00] text-white",
    },
    returned: {
      label: "RETURNED - Transaction returned",
      className: "bg-black/50 text-white",
    },
  };
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.ongoing;

  return (
    <div
      className={`w-full text-left px-3 py-3 text-md font-semibold rounded-t-lg ${config.className}`}
    >
      {config.label}
    </div>
  );
};

// Status badge component for cards (smaller version)
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    ongoing: { label: "Ongoing", className: "bg-[#CC5500] text-white" },
    delivered: { label: "Delivered", className: "bg-[#00A550] text-white" },
    cancelled: { label: "Cancelled", className: "bg-[#E51C00] text-white" },
    returned: { label: "Returned", className: "bg-[#000000]/50 text-white" },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.ongoing;

  return (
    <Badge className={`p-2 px-4 mb-2 rounded-lg ${config.className}`}>
      {config.label}
    </Badge>
  );
};

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const orderId = parseInt(id || "0", 10);
  const order = initialOrders.find((o) => o.id === orderId);

  // Debug: Add this to see what's happening
  console.log("URL ID:", id, "Parsed ID:", orderId, "Found order:", order);

  if (!order) {
    return (
      <div className="min-h-screen">
        <div className="bg-white p-6 flex items-center gap-3 rounded-lg mb-6">
          <Button
            className="bg-white hover:bg-gray-100 text-[#303030] h-8 w-8 p-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Order Details</h1>
        </div>
        <div className="p-6 text-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-500 mb-4">
            The order you're looking for doesn't exist.
          </p>
          <Button
            className="bg-[#CC5500] hover:bg-[#CC5500]/90"
            onClick={() => navigate("/profile/orders")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header with Back Button */}
      <div className="bg-white p-6 flex items-center gap-3 border-b mb-6 rounded-lg">
        <Button
          className="bg-white hover:bg-gray-100 text-[#303030] h-8 w-8 p-0"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Order Details</h1>
      </div>

      {/* Status Banner */}
      <StatusBadge status={order.status} />
      {/* Order Content */}
      <div className="space-y-4">
        {/* Order Item Card */}
        <div className="p-4 px-8 bg-white">
          <Card className="p-4 space-y-4 shadow-none">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <img
                  src={order.image}
                  alt={order.name}
                  className="w-32 h-32 rounded object-cover"
                />
                <div>
                  <h2 className="font-semibold text-lg">{order.name}</h2>
                  <p className="text-sm text-gray-500">Size: {order.size}</p>
                  <p className="text-sm text-gray-500 mb-2">QTY: {order.quantity}</p>
                  <OrderStatusBadge status={order.status} />
                  <p className="text-lg font-bold">${order.price}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-[#CC5500] text-[#CC5500] hover:bg-[#CC5500]/10"
              >
                Track Order
              </Button>
            </div>
          </Card>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-4 px-8">
          <Card className="p-4 shadow-none space-y-0">
            <h3 className="font-semibold text-lg">Payment Method</h3>
            <p>Cash on Delivery</p>

            <Separator />

            <div className="text-md space-y-2">
              <p className="flex justify-between">
                <span>Order ID</span>
                <span>#{order.orderId}</span>
              </p>
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>USD {(order.price * order.quantity).toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span>Shop discount</span>
                <span>USD 0</span>
              </p>
              <p className="flex justify-between font-semibold text-lg">
                <span>Order total:</span>
                <span>USD {(order.price * order.quantity).toFixed(2)}</span>
              </p>
            </div>

            <Separator />

            <div className="flex flex-row items-center gap-2">
              <p className="text-xs text-gray-500 flex flex-row items-center gap-2">
                <History className="h-4 w-4" />
                {order.status === "delivered" &&
                  "Product no longer eligible for return."}
                {order.status === "ongoing" &&
                  "Product eligible for return within 30 days of delivery."}
                {order.status === "cancelled" &&
                  "This order has been cancelled."}
                {order.status === "returned" &&
                  "This product has been returned."}
              </p>
              <Link to="#" className="text-[#699CFF] text-xs">
                Access our Return Policy
              </Link>
            </div>
          </Card>
        </div>

        <div className="bg-white p-4 px-8">
          {/* Billing Address */}
          <Card className="p-4 space-y-0 shadow-none">
            <h3 className="font-semibold text-lg">Billing Address</h3>
            <p className="text-md">Name: Wandulu Victor</p>
            <p className="text-md">Contact: +256 743 027397</p>
            <p className="text-md">Email: wandulu@tekjuice.co.uk</p>
            <p className="text-md">Address: Plot 19 Binayomba Road</p>

            <Separator />

            {/* Delivery Address */}

            <h3 className="font-semibold text-lg">Delivery Address</h3>
            <p className="text-md">Name: Wandulu Victor</p>
            <p className="text-md">Street: Plot 19 Binayomba Road</p>
            <p className="text-md">City: Bugolobi</p>
            <p className="text-md">
              Closest Landmark: Ambrosoli International School
            </p>
            <p className="text-md">Instructions: None</p>

            <Separator />

            {/* Delivery Option */}

            <h3 className="font-semibold text-lg">Delivery Option</h3>
            <p className="text-md">Door delivery</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
