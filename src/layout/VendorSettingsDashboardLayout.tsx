import { SiteHeader } from "@/components/site-header";
import SettingsMiniSidebarDrawer from "@/components/ui/settings-mini-sidebar";
import { Outlet } from "react-router-dom";

export default function VendorSettingsDashboardLayout() {
  return (
    <>
      <SiteHeader />
      <div className="min-h-screen dark:bg-[#111111]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:pb-8">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-2rem)]">
              <SettingsMiniSidebarDrawer />
            </aside>

            <main className="flex-1 min-w-0 w-full">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
