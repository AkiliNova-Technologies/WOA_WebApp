import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  }[];
}) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Function to check if a menu item is active
  const isActive = (url: string) => {
    // Exact match
    if (currentPath === url) return true;
    
    // For nested routes, check if current path starts with the url
    // if (url !== "/" && currentPath.startsWith(url)) return true;
    
    return false;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className={cn(state == "collapsed" ? "mt-13" : "mt-4")}>
          {items.map((item) => {
            const active = isActive(item.url);
            
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
                  <Link to={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "h-12 text-white transition-colors duration-200",
                        active 
                          ? "bg-white border-l-2 border-[#FFB800] text-[#303030]" 
                          : "hover:bg-white"
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}