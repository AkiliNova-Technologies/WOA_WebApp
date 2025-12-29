import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";

export default function VendorWishlistPage() {
  return (
    <>
      <SiteHeader />
      <div className="min-h-screen p-6">
        <Card className="space-y-1 p-10">
          <h1 className="text-3xl">Wishlist Page</h1>
          <p>Welcome to Vendor Dashboard, Page coming soon.</p>
        </Card>
      </div>
    </>
  );
}
