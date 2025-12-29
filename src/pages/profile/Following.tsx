import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import images from "@/assets/images";
import { ChevronRight, Loader2 } from "lucide-react";

import type { Vendor } from "@/redux/slices/vendorFollowsSlice";
import { useVendorFollows } from "@/hooks/useReduxVendorfollows";

// Follower Card Component
const FollowerCard = ({ vendor }: { vendor: Vendor }) => {
  const { unfollow, isFollowingLoading } = useVendorFollows();
  const isLoading = isFollowingLoading(vendor.id);

  const handleUnfollow = async () => {
    try {
      await unfollow(vendor.id);
    } catch (error) {
      console.error("Failed to unfollow vendor:", error);
    }
  };

  return (
    <Card className="w-full flex flex-row items-center rounded-xl p-4 shadow-none">
      {/* Avatar */}
      <img
        src={vendor.avatar}
        alt={vendor.name}
        className="w-26 h-26 rounded-full object-cover border"
      />
      {/* Info */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 ml-4">
          <div className="flex flex-1 flex-row items-center justify-between">
            <h3 className="font-semibold text-lg">{vendor.name}</h3>
            {/* Right arrow */}
            <ChevronRight className="text-gray-400 w-5 h-5" />
          </div>
          <p className="text-sm text-gray-600 mb-2">{vendor.store}</p>
          <div className="flex flex-col gap-2 text-sm">
            <p>
              <span className="font-semibold">{vendor.vendorScore} %</span>{" "}
              <span className="text-gray-500">Vendor score</span>
            </p>
            <p>
              <span className="font-semibold">{vendor.itemsSold}</span>{" "}
              <span className="text-gray-500">items sold</span>
            </p>
          </div>
          <Button
            variant="default"
            className="bg-[#CC5500] hover:bg-[#b24900] text-white rounded-full mt-3 px-6"
            onClick={handleUnfollow}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unfollowing...
              </>
            ) : (
              "Unfollow"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function FollowingPage() {
  const {
    followingVendors,
    loading,
    error,
    getFollowingVendors,
    hasFollowingVendors,
  } = useVendorFollows();

  // Fetch following vendors on mount
  useEffect(() => {
    getFollowingVendors();
  }, []);

  // Show loading state
  if (loading && !hasFollowingVendors) {
    return (
      <div className="min-h-screen">
        <div className="bg-white p-6 rounded-md mb-6">
          <h1 className="text-2xl font-medium">Following</h1>
        </div>
        <div className="bg-white p-6 rounded-md flex flex-1 flex-col justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#CC5500]" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen">
        <div className="bg-white p-6 rounded-md mb-6">
          <h1 className="text-2xl font-medium">Following</h1>
        </div>
        <div className="bg-white p-6 rounded-md flex flex-1 flex-col justify-center items-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => getFollowingVendors()}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!hasFollowingVendors) {
    return (
      <div className="min-h-screen">
        <div className="bg-white p-6 rounded-md mb-6">
          <h1 className="text-2xl font-medium">Following</h1>
        </div>
        {/* Tab List buttons */}
        <div className="bg-white p-6 rounded-md flex flex-1 flex-col justify-center items-center">
          <img
            src={images.EmptyReviews}
            alt="Empty Orders Image"
            className="h-3xs w-3xs mb-6"
          />
          <h1 className="text-[#111111] text-xl">Nothing to see here</h1>
        </div>
      </div>
    );
  }

  // Show following vendors list
  return (
    <div className="min-h-screen">
      <div className="bg-white p-6 rounded-md mb-6">
        <h1 className="text-2xl font-medium">Following</h1>
      </div>
      {/* Tab List buttons */}
      <div className="bg-white p-6 rounded-md">
        <div className="space-y-6">
          {followingVendors.map((vendor) => (
            <FollowerCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>
    </div>
  );
}