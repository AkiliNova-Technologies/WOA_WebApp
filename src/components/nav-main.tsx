import { type LucideIcon, ChevronDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // State to track which menu items are open
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Function to check if a menu item or any of its children are active
  const isActive = (url: string, subItems?: { url: string }[]) => {
    if (currentPath === url) return true;
    if (subItems) {
      return subItems.some(item => currentPath === item.url);
    }
    return false;
  };

  // Function to check if a sub-item is active
  const isSubItemActive = (url: string) => {
    return currentPath === url;
  };

  // Toggle dropdown
  const toggleItem = (title: string) => {
    setOpenItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className={cn(state === "collapsed" ? "mt-13" : "mt-4")}>
          {items.map((item) => {
            const active = isActive(item.url, item.items);
            const hasSubItems = item.items && item.items.length > 0;
            const isOpen = openItems[item.title];

            return (
              <SidebarMenuItem key={item.title}>
                {state === "collapsed" ? (
                  <Link to={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "min-h-12 min-w-full text-center justify-center text-white transition-colors duration-200",
                        active
                          ? "bg-white border-l-2 border-[#FFB800] text-[#303030]"
                          : "hover:bg-white/10"
                      )}
                    >
                      {item.icon && <item.icon className="h-6" />}
                    </SidebarMenuButton>
                  </Link>
                ) : (
                  <>
                    {hasSubItems ? (
                      <SidebarMenuButton
                        onClick={() => toggleItem(item.title)}
                        className={cn(
                          "h-12 text-white transition-colors duration-200 cursor-pointer",
                          active
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/10"
                        )}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      </SidebarMenuButton>
                    ) : (
                      <Link to={item.url}>
                        <SidebarMenuButton
                          className={cn(
                            "h-12 text-white transition-colors duration-200",
                            active
                              ? "bg-white border-l-2 border-[#FFB800] text-[#303030]"
                              : "hover:bg-white/10"
                          )}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    )}

                    {hasSubItems && isOpen && (
                      <SidebarMenuSub className="border-l-0 mx-0 px-0 py-1">
                        {item.items!.map((subItem) => {
                          const subActive = isSubItemActive(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <Link to={subItem.url} className="w-full">
                                <SidebarMenuSubButton
                                  className={cn(
                                    "text-white/70 hover:text-white hover:bg-white/5 h-10 pl-12 relative transition-colors duration-200",
                                    subActive && "text-white font-medium"
                                  )}
                                >
                                  {subActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFB800]" />
                                  )}
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </Link>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}