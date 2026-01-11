import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AdminNavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper function to check if an item has sub-items
  const hasSubItems = (item: { items?: any[] }): boolean => {
    return !!(item.items && item.items.length > 0);
  };

  // Function to check if a main item without sub-items is active
  const isMainItemActive = (item: {
    url: string;
    items?: { url: string }[];
  }) => {
    // If item has sub-items, main item should NEVER be active
    if (hasSubItems(item)) return false;

    // For main items without sub-items, check exact match or if current path starts with the item URL
    // But exclude cases where the path continues beyond the item URL with another segment
    if (currentPath === item.url) return true;
    
    // Special handling for dashboard - only match exactly
    if (item.url === "/admin" || item.url === "/vendor") {
      return currentPath === item.url;
    }
    
    // For other routes, match if path starts with URL and next char is / or end of string
    const urlPattern = new RegExp(`^${item.url.replace(/\//g, "\\/")}(\\/|$)`);
    return urlPattern.test(currentPath);
  };

  // Function to check if a sub-item is active
  const isSubItemActive = (subItem: { url: string }) => {
    // Check if current path starts with the sub-item URL
    // This will match both exact URLs and detail/nested pages
    if (currentPath === subItem.url) return true;
    
    // Check if current path starts with subItem.url followed by /
    // This catches detail pages like /admin/users/vendors/123/details
    const urlPattern = new RegExp(`^${subItem.url.replace(/\//g, "\\/")}(\\/|$)`);
    return urlPattern.test(currentPath);
  };

  // Function to check if any sub-item is active (for opening collapsible)
  const hasActiveSubItem = (item: { items?: { url: string }[] }) => {
    if (!hasSubItems(item)) return false;
    return item.items?.some((subItem) => isSubItemActive(subItem)) || false;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className={cn(state === "collapsed" ? "mt-13" : "mt-4")}>
          {items.map((item) => {
            const itemHasSubItems = hasSubItems(item);
            const mainItemActive = isMainItemActive(item);
            const subItemActive = hasActiveSubItem(item);

            if (state === "collapsed") {
              // Collapsed state - show only icons with tooltips
              return (
                <SidebarMenuItem key={item.title}>
                  {itemHasSubItems ? (
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "min-h-12 min-w-full text-center justify-center text-white transition-colors duration-200",
                        // Highlight if any sub-item is active
                        subItemActive
                          ? "bg-white/20 border-l-3 border-[#CC5500]"
                          : "hover:bg-white/10"
                      )}
                    >
                      {item.icon && <item.icon className="h-6" />}
                    </SidebarMenuButton>
                  ) : (
                    <Link to={item.url}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={cn(
                          "min-h-12 min-w-full text-center justify-center text-white transition-colors duration-200",
                          mainItemActive
                            ? "bg-white border-l-3 border-[#CC5500] text-[#303030]"
                            : "hover:bg-white/10"
                        )}
                      >
                        {item.icon && <item.icon className="h-6" />}
                      </SidebarMenuButton>
                    </Link>
                  )}
                </SidebarMenuItem>
              );
            }

            // Expanded state - show full menu with collapsible sub-items
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={subItemActive} // Open if any sub-item is active
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  {itemHasSubItems ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "h-12 text-white transition-colors duration-200",
                            // Highlight parent when sub-item is active
                            subItemActive
                              ? "bg-white/10 text-white font-medium"
                              : "hover:bg-white hover:text-[#303030]"
                          )}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pr-0">
                        <SidebarMenuSub className="pr-0">
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem
                              key={subItem.title}
                              className=""
                            >
                              <SidebarMenuSubButton
                                asChild
                                className="h-11 rounded-none pl-4"
                              >
                                <Link
                                  to={subItem.url}
                                  className={cn(
                                    "transition-colors duration-200",
                                    isSubItemActive(subItem)
                                      ? "font-medium bg-white text-[#121212] dark:text-[#121212] border-l-3 border-[#CC5500] hover:bg-white dark:hover:bg-white"
                                      : "text-white/80 hover:text-[#303030] dark:hover:text-[#303030] hover:bg-white dark:hover:bg-white"
                                  )}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : (
                    <Link to={item.url}>
                      <SidebarMenuButton
                        className={cn(
                          "h-12 text-white transition-colors duration-200",
                          mainItemActive
                            ? "bg-white border-l-3 border-[#CC5500] text-[#303030]"
                            : "hover:bg-white hover:text-[#303030]"
                        )}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}