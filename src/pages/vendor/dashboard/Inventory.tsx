import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";

export default function InventoryPage() {
  return (
    <>
      <SiteHeader />
      <div className="min-h-screen p-6">
        <Card className="space-y-1 p-10">
          <h1 className="text-3xl">Inventory Page</h1>
          <p>Welcome to Vendor Dashboard, Page coming soon.</p>
        </Card>
      </div>
    </>
  );
}
