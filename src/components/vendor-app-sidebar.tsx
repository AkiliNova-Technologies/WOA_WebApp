import * as React from "react";
import {
  BadgePercent,
  Heart,
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
      url: "/vendor",
      icon: Home,
    },
    {
      title: "Products",
      url: "/vendor/products",
      icon: Tag,
    },
    {
      title: "Inventory",
      url: "/vendor/inventory",
      icon: BadgePercent,
    },
    {
      title: "Wishlist",
      url: "/vendor/wishlist",
      icon: Heart,
    },
    {
      title: "Orders",
      url: "/vendor/orders",
      icon: Store,
    },
    {
      title: "Revenue",
      url: "/vendor/revenue",
      icon: ScrollText,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/vendor/settings",
      icon: SettingsIcon,
    },
  ],
};

export function VendorAppSidebar({
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
