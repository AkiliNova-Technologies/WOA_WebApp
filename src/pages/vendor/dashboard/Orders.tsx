import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <Card className="space-y-1 p-10">
          <h1 className="text-3xl">Orders Page</h1>
          <p>Welcome to Vendor Dashboard, Page coming soon.</p>
        </Card>
      </div>
    </>
  );
}
