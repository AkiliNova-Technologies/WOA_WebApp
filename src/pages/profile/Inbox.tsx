import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import images from "@/assets/images";

const initialPromotions = [
  {
    id: 1,
    title: "Bundle Deals",
    description: "Buy 2 handmade sandals, get 1 at half price.",
    imageUrl: images.Banner1,
    timeLabel: "Wednesday 5:40 PM",
    dateLabel: "02-11-2025",
  },
  {
    id: 2,
    title: "Seasonal Deal",
    description: "Enjoy 50% off on selected items.",
    imageUrl: images.Banner2,
    timeLabel: "Yesterday 5:40 PM",
    dateLabel: "01-11-2025",
  },
  {
    id: 3,
    title: "Member Exclusive",
    description: "Extra perks for our loyalty members.",
    imageUrl: images.Banner1,
    timeLabel: "Yesterday 10:05 AM",
    dateLabel: "01-11-2025",
  },
];

const initialOrderMessages = [
  {
    id: 1,
    title: "In-Transit Updates",
    description:
      "Your order is on the way! Estimated delivery: 3–5 business days.",

    timeLabel: "Wednesday 5:40 PM",
  },
  {
    id: 2,
    title: "Order Confirmation & Dispatch",
    description:
      "Your order has been confirmed! Our artisans are preparing it for dispatch.",

    timeLabel: "5:40 PM",
  },
  {
    id: 3,
    title: "Updated Privacy Policy",
    description:
      "We want to let you know that, as part of our ongoing efforts to improve your experience, we are updating our Privacy policy.",

    timeLabel: "6:40 PM",
  },
];

// --- Promotion Card ---
function PromotionCard({ promo }: { promo: any }) {
  return (
    <>
      <div className="text-center text-sm text-gray-600 mb-4">
        {promo.timeLabel}
      </div>
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* top meta row: title | centered time | right date */}
        <div className="grid grid-cols-2 items-center px-4 py-3 bg-white">
          <div className="text-left">
            <h4 className="font-semibold text-md">{promo.title}</h4>
            <p className="text-sm text-gray-500">{promo.description}</p>
          </div>

          <div className="text-right text-sm text-gray-400">
            {promo.dateLabel}
          </div>
        </div>

        {/* banner image */}
        <div className="p-4">
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="w-full h-full md:h-58 object-cover rounded-md border"
          />
        </div>
      </div>
    </>
  );
}

function OrderShippingCard({ order }: { order: any }) {
  return (
    <>
      <div className="bg-white p-6 mb-4">
        <div className="text-center text-sm text-gray-600 mb-4">
          {order.timeLabel}
        </div>
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-2 items-center px-4 py-3 bg-white">
            <div className="text-left">
              <h4 className="font-semibold text-md mb-3">{order.title}</h4>
              <p className="text-sm text-gray-500">{order.description}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Inbox Page ---
export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<"promotions" | "orders">(
    "promotions"
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-md mb-6">
        <h1 className="text-2xl font-medium">Inbox</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white p-0 rounded-md mb-4">
        <Tabs
          defaultValue="promotions"
          onValueChange={(val) => setActiveTab(val as any)}
        >
          <TabsList className="flex w-full justify-evenly p-10 bg-white shadow-none">
            <TabsTrigger
              value="promotions"
              className="flex-1 max-w-62 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-11"
            >
              Promotions
            </TabsTrigger>

            <TabsTrigger
              value="orders"
              className="flex-1 max-w-62 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-11"
            >
              Orders & Shipping
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content area */}
      <div className="space-y-6">
        {/* For Promotions tab */}
        {activeTab === "promotions" && (
          <div className="space-y-6">
            {/* Scam warning banner */}
            <div className="w-full bg-[#00A550] text-white text-sm py-3 px-4 rounded-md mb-6 text-center">
              Be wary of scams and messages imitating World of Afrika. We don’t
              ask customers for extra fees via SMS or email.
            </div>

            {initialPromotions.map((promo) => (
              <div key={promo.id} className="mx-auto bg-white p-8">
                <PromotionCard promo={promo} />
              </div>
            ))}
          </div>
        )}

        {/* Orders & Shipping placeholder */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="mx-auto">
              {initialOrderMessages.map((order) => (
                <div key={order.id} className="mx-auto">
                  <OrderShippingCard order={order} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
