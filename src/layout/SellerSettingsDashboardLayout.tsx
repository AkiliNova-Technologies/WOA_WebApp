import { SiteHeader } from "@/components/site-header";
import SettingsMiniSidebarDrawer from "@/components/ui/settings-mini-sidebar";
import { Outlet } from "react-router-dom";

export default function SellerSettingsDashboardLayout() {
  return (
    <>
      <SiteHeader />

      <div className="min-h-screen">
        <div className="flex flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-80 shrink-0">
                <SettingsMiniSidebarDrawer />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
