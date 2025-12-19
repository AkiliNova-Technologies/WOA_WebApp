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

export function NavMain({
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

    // Only check for exact match for main items without sub-items
    return currentPath === item.url;
  };

  // Function to check if a sub-item is active
  const isSubItemActive = (subItem: { url: string }) => {
    return currentPath === subItem.url;
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
                        // Main items with sub-items NEVER get active state in collapsed mode
                        subItemActive
                          ? "hover:bg-white/10" // Just show hover, no active state
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
                            // Main items with sub-items NEVER get active state
                            subItemActive
                              ? "hover:bg-white hover:text-[#303030]" // Just hover when sub-item is active
                              : "hover:bg-white hover:text-[#303030]" // Regular hover
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
