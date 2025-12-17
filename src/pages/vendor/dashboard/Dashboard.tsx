import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <Card className="space-y-1 p-10">
          <h1 className="text-3xl">Dashboard Page</h1>
          <p>Welcome to Vendor Dashboard, Page coming soon.</p>
        </Card>
      </div>
    </>
  );
}
