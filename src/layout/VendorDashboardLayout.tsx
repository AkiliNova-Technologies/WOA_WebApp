import { VendorAppSidebar } from "@/components/vendor-app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
export default function VendorDashboardLayout() {
  return (
    <div className="flex flex-1 flex-col p-0 h-full">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <VendorAppSidebar variant="sidebar" />
        <SidebarInset>
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 md:gap-6 top-0 relative bg-[#F4F5F9] dark:bg-background">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
