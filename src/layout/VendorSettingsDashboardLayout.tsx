import { SiteHeader } from "@/components/site-header";
import SettingsMiniSidebarDrawer from "@/components/ui/settings-mini-sidebar";
import { Outlet } from "react-router-dom";

export default function VendorSettingsDashboardLayout() {
  return (
    <>
      <SiteHeader />

      <div className="min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Sidebar - Fixed width on larger screens, full width on mobile */}
            <div className="w-full lg:w-80 shrink-0">
              <SettingsMiniSidebarDrawer />
            </div>

            {/* Main Content - Takes remaining space */}
            <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
