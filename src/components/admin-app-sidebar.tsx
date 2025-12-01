import * as React from "react";
import {
  Home,
  SettingsIcon,
  Users,
  Package,
  Truck,
  DollarSign,
  FolderTree,
} from "lucide-react";

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
import { AdminNavMain } from "./admin-nav-main";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: Users,
      items: [
        {
          title: "admins",
          url: "/admin/users",
        },
        {
          title: "Customers",
          url: "/admin/users/customers",
        },
        {
          title: "Staff",
          url: "/admin/users/admins",
        },
      ],
    },
    {
      title: "Category Management",
      url: "/admin/categories",
      icon: FolderTree,
    },
    {
      title: "Product Management",
      url: "/admin/products",
      icon: Package,
      items: [
        {
          title: "Approvals",
          url: "/admin/products/approvals",
        },
        {
          title: "Wishlist",
          url: "/admin/products/wishlist",
        },
        {
          title: "Cart",
          url: "/admin/products/cart",
        },
        {
          title: "Orders",
          url: "/admin/products/orders",
        },
      ],
    },
    {
      title: "Logistics Studio",
      url: "/admin/logistics",
      icon: Truck,
    },
    {
      title: "Revenue",
      url: "/admin/revenue",
      icon: DollarSign,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: SettingsIcon,
    },
  ],
};

export function AdminAppSidebar({
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
        <AdminNavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavTheme />
      </SidebarFooter>
    </Sidebar>
  );
}
