import * as React from "react";
import {
  BadgePercent,
  Home,
  ScrollText,
  SettingsIcon,
  Store,
  Tag,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import images from "@/assets/images";
import { NavTheme } from "./nav-theme";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/seller",
      icon: Home,
    },
    {
      title: "Products",
      url: "/seller/products",
      icon: Tag,
    },
    {
      title: "Revenue",
      url: "/seller/revenue",
      icon: ScrollText,
    },
    {
      title: "Inventory",
      url: "/seller/inventory",
      icon: BadgePercent,
    },
    {
      title: "Orders",
      url: "/seller/orders",
      icon: Store,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/seller/settings",
      icon: SettingsIcon,
    },
  ],
};

export function SellerAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props} className="bg-[#303030]">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-row w-full justify-center items-center">
              {state === "expanded" ? (
                // Full logo when expanded
                <img src={images.logo} alt="Company Logo" className="h-12" />
              ) : (
                // Icon-only version when collapsed
                <div className="flex items-center justify-center">
                  {/* You can use a smaller version of your logo or an icon */}
                  {/* <img 
                    src={images.logo} 
                    alt="Logo" 
                    className="h-8 w-8 object-contain" 
                  /> */}
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavTheme />
      </SidebarFooter>
    </Sidebar>
  );
}