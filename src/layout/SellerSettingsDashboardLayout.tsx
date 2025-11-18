import SettingsMiniSidebarDrawer from "@/components/ui/settings-mini-sidebar";
import { Outlet } from "react-router-dom";

export default function SellerSettingsDashboardLayout() {
  return (
    <div className="min-h-screen">
      <div className="flex flex-1 flex-col p-0 h-full">
        <div className="flex flex-row flex-wrap gap-4 md:gap-6 top-0 relative min-h-screen p-4">
          <SettingsMiniSidebarDrawer />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
