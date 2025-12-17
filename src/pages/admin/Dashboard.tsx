import { SiteHeader } from "@/components/site-header";

export default function AdminDashboardPage() {
  return (
    <>
      <SiteHeader />

      <div className="min-h-screen">
        <div className="p-6">
          <h1>Admin Dashboard</h1>
          <p>All information of admin dashboard here</p>
        </div>
      </div>
    </>
  );
}
