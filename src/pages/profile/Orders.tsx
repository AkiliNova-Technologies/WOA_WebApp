import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialOrders } from "@/data/Orders";
import images from "@/assets/images";

const EmptyOrderState = ({ status }: { status: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg
        className="w-12 h-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No {status} orders
    </h3>
    <p className="text-gray-500 max-w-sm mb-6">
      {status === "ongoing" &&
        "You don't have any ongoing orders at the moment."}
      {status === "cancelled" && "You haven't cancelled any orders yet."}
      {status === "delivered" && "No delivered orders found in your history."}
      {status === "returned" && "You haven't returned any orders so far."}
    </p>
    <Button className="bg-[#CC5500] hover:bg-[#CC5500]/90">
      Start Shopping
    </Button>
  </div>
);

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
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

// Order Card Component
const OrderCard = ({
  order,
  formatDate,
}: {
  order: any;
  formatDate: (date: string) => string;
}) => {
  const navigate = useNavigate();

  return (
    <Card className="p-4 shadow-none">
      <div className="flex gap-4">
        <img
          src={order.image}
          alt={order.name}
          className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1">
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-row items-center gap-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {order.name}
                  </h3>
                  <p className="text-sm text-black/60">
                    On {formatDate(order.date)}
                  </p>
                </div>
                <Button
                  variant={"link"}
                  className="text-[#CC5500] p-0 bg-transparent hover:bg-transparent"
                  onClick={() =>
                    navigate(`/profile/orders/details/${order.id}`)
                  }
                >
                  View Details
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>Size: {order.size}</span>
                <span>Order ID: {order.orderId}</span>
                <span>Qty: {order.quantity}</span>
              </div>

              <StatusBadge status={order.status} />

              <p className="text-xl font-bold text-[#303030]">${order.price}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function OrderHistoryPage() {
  const [orders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("ongoing");

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => order.status === activeTab);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  if (!orders) {
    return (
      <div className="min-h-screen">
        <div className="bg-white p-6 rounded-md mb-6">
          <h1 className="text-2xl font-medium">My Orders</h1>
        </div>

        {/* Tab List buttons */}
        <div className="bg-white p-6 rounded-md flex flex-1 flex-col justify-center items-center ">
          <img
            src={images.EmptyOrder}
            alt="Empty Orders Image"
            className="h-3xs w-3xs mb-6"
          />
          <h1 className="text-[#111111] text-xl">
            You haven’t made any orders
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white p-6 rounded-md mb-6">
        <h1 className="text-2xl font-medium">My Orders</h1>
      </div>

      {/* Tab List buttons */}
      <div className="bg-white p-6 rounded-md">
        <Tabs
          defaultValue="ongoing"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full justify-start h-14 bg-transparent p-0">
            <TabsTrigger
              value="ongoing"
              className="flex-1 max-w-32 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-11"
            >
              Ongoing
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="flex-1 max-w-32 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-11"
            >
              Cancelled
            </TabsTrigger>
            <TabsTrigger
              value="delivered"
              className="flex-1 max-w-32 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-11"
            >
              Delivered
            </TabsTrigger>
            <TabsTrigger
              value="returned"
              className="flex-1 max-w-32 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-11"
            >
              Returned
            </TabsTrigger>
          </TabsList>

          {/* Ongoing Orders */}
          <TabsContent value="ongoing" className="mt-8">
            {filteredOrders.length === 0 ? (
              <EmptyOrderState status="ongoing" />
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cancelled Orders */}
          <TabsContent value="cancelled" className="mt-8">
            {filteredOrders.length === 0 ? (
              <EmptyOrderState status="cancelled" />
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Delivered Orders */}
          <TabsContent value="delivered" className="mt-8">
            {filteredOrders.length === 0 ? (
              <EmptyOrderState status="delivered" />
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Returned Orders */}
          <TabsContent value="returned" className="mt-8">
            {filteredOrders.length === 0 ? (
              <EmptyOrderState status="returned" />
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
