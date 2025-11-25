import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import images from "@/assets/images";
import { initialFollowers } from "@/data/Followers";
import { ChevronRight } from "lucide-react";


// Review Card Component
const FollowerCard = ({ seller }: { seller: any }) => {
  return (
    <Card className="w-full flex flex-row items-center rounded-xl p-4 shadow-none">
      {/* Avatar */}
      <img
        src={seller.avatar}
        alt={seller.name}
        className="w-26 h-26 rounded-full object-cover border"
      />

      {/* Info */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 ml-4">
          <div className="flex flex-1 flex-row items-center justify-between">
            <h3 className="font-semibold text-lg">{seller.name}</h3>
            {/* Right arrow */}
            <ChevronRight className="text-gray-400 w-5 h-5" />
          </div>
          <p className="text-sm text-gray-600 mb-2">{seller.store}</p>

          <div className="flex flex-col gap-2 text-sm">
            <p>
              <span className="font-semibold">{seller.sellerScore} %</span>{" "}
              <span className="text-gray-500">Seller score</span>
            </p>

            <p>
              <span className="font-semibold">{seller.itemsSold}</span>{" "}
              <span className="text-gray-500">items sold</span>
            </p>
          </div>

          <Button
            variant="default"
            className="bg-[#CC5500] hover:bg-[#b24900] text-white rounded-full mt-3 px-6"
          >
            Unfollow
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function FollowingPage() {
  const [followers] = useState(initialFollowers);

  if (!followers || followers.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="bg-white p-6 rounded-md mb-6">
          <h1 className="text-2xl font-medium">Following</h1>
        </div>

        {/* Tab List buttons */}
        <div className="bg-white p-6 rounded-md flex flex-1 flex-col justify-center items-center ">
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

  return (
    <div className="min-h-screen">
      <div className="bg-white p-6 rounded-md mb-6">
        <h1 className="text-2xl font-medium">Following</h1>
      </div>

      {/* Tab List buttons */}
      <div className="bg-white p-6 rounded-md">
        <div className="space-y-6">
          {followers.map((follower) => (
            <FollowerCard key={follower.id} seller={follower} />
          ))}
        </div>
      </div>
    </div>
  );
}
