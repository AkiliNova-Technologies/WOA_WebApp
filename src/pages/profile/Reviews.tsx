import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import images from "@/assets/images";
import { initialReviews } from "@/data/Reviews";

// Updated StatusBadge with dynamic delivery date
const StatusBadge = ({ status, deliveryDate }: { status: string; deliveryDate?: string }) => {
  const formatDeliveryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const statusConfig = {
    ongoing: { label: "Ongoing", className: "bg-[#CC5500] text-white" },
    delivered: { 
      label: deliveryDate ? `Delivered on ${formatDeliveryDate(deliveryDate)}` : "Delivered", 
      className: "bg-[#00A550] text-white" 
    },
    cancelled: { label: "Cancelled", className: "bg-[#E51C00] text-white" },
    returned: { label: "Returned", className: "bg-[#000000]/50 text-white" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ongoing;

  return (
    <Badge className={`p-2 px-4 mb-2 rounded-lg ${config.className}`}>
      {config.label}
    </Badge>
  );
};

// Review Card Component
const ReviewCard = ({
  review,
  formatDate,
}: {
  review: any;
  formatDate: (date: string) => string;
}) => {
  const navigate = useNavigate();

  return (
    <Card className="p-4 shadow-none">
      <div className="flex gap-4">
        <img
          src={review.image}
          alt={review.name}
          className="w-42 h-42 md:w-42 md:h-42 object-cover rounded-lg shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1">
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-row items-center gap-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {review.name}
                  </h3>
                  <p className="text-sm text-black/60">
                    on {formatDate(review.date)}
                  </p>
                </div>
                <Button
                  variant={"link"}
                  className="text-[#CC5500] p-0 bg-transparent hover:bg-transparent"
                  onClick={() =>
                    navigate(`/profile/orders/details/${review.id}`)
                  }
                >
                  Review this Product
                </Button>
              </div>

              <div className="flex flex-col gap-2 text-sm text-gray-600 mb-2">
                <span>Size: {review.size}</span>
                <span>Qty: {review.quantity}</span>
              </div>

              <p className="text-xl font-bold text-[#303030] mb-2">
                ${review.price}
              </p>

              <StatusBadge 
                status={review.status} 
                deliveryDate={review.deliveryDate || review.deliveredDate} 
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function ReviewsPage() {
  const [reviews] = useState(initialReviews);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="bg-white p-6 rounded-md mb-6">
          <h1 className="text-2xl font-medium">Reviews and Ratings</h1>
        </div>

        {/* Tab List buttons */}
        <div className="bg-white p-6 rounded-md flex flex-1 flex-col justify-center items-center ">
          <img
            src={images.EmptyReviews}
            alt="Empty Orders Image"
            className="h-3xs w-3xs mb-6"
          />
          <h1 className="text-[#111111] text-xl">
            Nothing to see here
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white p-6 rounded-md mb-6">
        <h1 className="text-2xl font-medium">Reviews and Ratings</h1>
      </div>

      {/* Tab List buttons */}
      <div className="bg-white p-6 rounded-md">
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}