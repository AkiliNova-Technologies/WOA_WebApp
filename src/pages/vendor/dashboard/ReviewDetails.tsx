import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  ChevronUp,
  ChevronDown,
  Reply,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Label } from "@/components/ui/label";
import images from "@/assets/images";

type ReviewStatus = "open" | "cleared" | "flagged" | "closed";

interface ReviewDetailData {
  id: string;
  productName: string;
  variant: string;
  orderId: string;
  orderDate: string;
  receivedOn: string;
  reviewedOn: string;
  reviewText: string;
  productRating: number;
  status: ReviewStatus;
  productImage: string;
  productSpecs: string[];
  buyerFullName: string;
  buyerEmail: string;
  buyerPhone: string;
  sellerFullName: string;
  sellerShopName: string;
  sellerLocation: string;
  sellerEmail: string;
  replies: number;
}

// Status change drawer component
function StatusChangeDrawer({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: ReviewStatus;
  onStatusChange: (newStatus: ReviewStatus) => void;
}) {
  const [selectedStatus, setSelectedStatus] =
    useState<ReviewStatus>(currentStatus);

  const statusOptions: {
    value: ReviewStatus;
    label: string;
    description: string;
  }[] = [
    {
      value: "open",
      label: "Open",
      description: "Review is pending moderation",
    },
    {
      value: "cleared",
      label: "Cleared",
      description: "Review has been approved and published",
    },
    {
      value: "flagged",
      label: "Flagged",
      description: "Review requires attention or investigation",
    },
    {
      value: "closed",
      label: "Closed",
      description: "Review has been resolved and closed",
    },
  ];

  const handleSubmit = () => {
    if (selectedStatus !== currentStatus) {
      onStatusChange(selectedStatus);
    }
    onClose();
  };

  const getStatusColor = (status: ReviewStatus) => {
    const colors = {
      open: "px-3 rounded-sm",
      cleared: "px-3 rounded-sm",
      flagged: "px-3 rounded-sm",
      closed: "px-3 rounded-sm",
    };
    return colors[status] || colors.open;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#303030] rounded-lg shadow-lg w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold">Update Review Status</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Change the status of this review
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="flex flex-row items-center gap-3 mb-4">
            <Label className="text-sm font-medium block">Current Status</Label>
            <Badge variant="outline" className={getStatusColor(currentStatus)}>
              {statusOptions.find((opt) => opt.value === currentStatus)
                ?.label || currentStatus}
            </Badge>
          </div>

          {/* New Status Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select New Status
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStatus === option.value
                      ? "border-[#CC5500] bg-orange-50 dark:bg-orange-950/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedStatus === option.value
                            ? "bg-[#CC5500]"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="h-11 flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="h-11 flex-1 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white"
            disabled={selectedStatus === currentStatus}
          >
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VendorReviewDetailPage() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mock review data - in real app, fetch based on reviewId
  const reviewData: ReviewDetailData = {
    id: reviewId || "1",
    productName: "African Made Sandals",
    variant: "L • Red",
    orderId: "#000001",
    orderDate: "11/12/2025",
    receivedOn: "15/12/2025",
    reviewedOn: "21/12/2025",
    reviewText:
      "Absolutely love these! Extremely comfortable right out of the box. Perfect for both casual and formal occasions.",
    productRating: 5.0,
    status: "cleared",
    productImage: "/product-images/sandals.jpg",
    productSpecs: [
      "Handcrafted from genuine African leather",
      "Durable rubber sole (recycled tire option available)",
      "Breathable open-toe design for all-day comfort",
      "Unisex sizing (EU 39-46 / US 6-12)",
      "Available in natural brown, black, and tan",
      "Slip-on style with optional adjustable strap",
      "Locally made by artisans in Uganda",
      "Lightweight and travel-friendly",
      "Ethically sourced and eco-conscious materials",
    ],
    buyerFullName: "Alice Johnson",
    buyerEmail: "alice.johnson@email.com",
    buyerPhone: "+447911123456",
    sellerFullName: "Joe Doe",
    sellerShopName: "Theatrix Shop",
    sellerLocation: "Nairobi, Kenya",
    sellerEmail: "j.doe@gmail.com",
    replies: 0,
  };

  const [currentStatus, setCurrentStatus] = useState<ReviewStatus>(
    reviewData.status
  );

  const handleStatusChange = (newStatus: ReviewStatus) => {
    setCurrentStatus(newStatus);
    console.log(`Review status changed to: ${newStatus}`);
    // In real app, make API call to update status
  };

  const statusConfig = {
    open: {
      label: "Open",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    cleared: {
      label: "Review is cleared",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    flagged: {
      label: "Flagged",
      className: "bg-red-100 text-red-700 border-red-300",
    },
    closed: {
      label: "Closed",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
  } as const;

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-none text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 font-semibold text-lg">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#303030] rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <span className="font-semibold text-lg">Back</span>
                </div>
                <Badge
                  variant="outline"
                  className={`${statusConfig[currentStatus].className} font-medium`}
                >
                  {statusConfig[currentStatus].label}
                </Badge>
              </div>
            </div>

            {/* Hero Section with Product Info */}

            {/* ================= COVER IMAGE ================= */}
            <div className="relative w-full h-[380px] overflow-hidden rounded-2xl">
              <img
                src={images.Placeholder}
                alt="Cover"
                className="object-cover w-full h-full"
              />

              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3"></div>
            </div>

            <div className="relative mx-6 space-y-6 z-10">
              {/* Intro Section */}
              <Card className="-mt-24">
                <div className="bg-white rounded-2xl p-8">
                  <h1 className="text-4xl font-bold mb-3">
                    {reviewData.productName}
                  </h1>
                  <p className="text-xl t mb-4">
                    Size: {reviewData.variant.split("•")[0].trim()} • Color:{" "}
                    {reviewData.variant.split("•")[1]?.trim()}
                  </p>
                  <div className="grid grid-cols-5 gap-6 text-sm">
                    <div>
                      <p className="">Order ID</p>
                      <p className="font-semibold">{reviewData.orderId}</p>
                    </div>
                    <div>
                      <p className="">Order date</p>
                      <p className="font-semibold">{reviewData.orderDate}</p>
                    </div>
                    <div>
                      <p className="">Received on</p>
                      <p className="font-semibold">{reviewData.receivedOn}</p>
                    </div>
                    <div>
                      <p className="">Reviewed On</p>
                      <p className="font-semibold">{reviewData.reviewedOn}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="mt-4 hover:text-white hover:bg-white/20"
                      size="sm"
                    >
                      More about the order
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Product Details Section */}
              <Card className="border shadow-none">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">
                    Product details
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image Gallery */}
                    <div className="flex gap-4">
                      {/* Thumbnail Navigation */}
                      <div className="flex flex-col gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-12 h-12 rounded-full"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </Button>

                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded border-2 border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#CC5500] transition-colors"
                          >
                            <span className="text-xs text-gray-400">IMG</span>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="icon"
                          className="w-12 h-12 rounded-full"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Main Image */}
                      <div className="flex-1 aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-400">Product Image</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Product name
                        </Label>
                        <p className="text-lg font-semibold">
                          {reviewData.productName}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Variant Ordered
                        </Label>
                        <p className="text-lg font-semibold">
                          {reviewData.variant}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                          Product Specifications
                        </Label>
                        <div className="space-y-2">
                          {reviewData.productSpecs.map((spec, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-sm">•</span>
                              <p className="text-sm">{spec}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                        size="lg"
                      >
                        More about the product
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Buyer and Seller Details */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Buyer Details */}
                <Card className="border shadow-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Buyer details</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex justify-between">
                          <Label className="text-sm text-gray-600 dark:text-gray-400">
                            Returning Customer
                          </Label>
                          <Badge variant={"outline"} className="px-4">Yes</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Review Posted */}
              <Card className="border shadow-none">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">Review Posted</h2>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-lg font-semibold">
                        {reviewData.buyerFullName.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {reviewData.buyerFullName}
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {reviewData.reviewedOn}
                          </span>
                          {renderStars(reviewData.productRating)}
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {reviewData.reviewText}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Reply className="h-4 w-4" />
                        <span>Reply ({reviewData.replies})</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Status Change Drawer */}
      <StatusChangeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
