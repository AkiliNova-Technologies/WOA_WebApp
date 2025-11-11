import { 
  User, 
  ShoppingCart, 
  Heart, 
  History, 
  Star, 
  Mail, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

function MiniSidebarDrawer() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: User, label: "My Account", href: "/profile" },
    { icon: ShoppingCart, label: "Shopping Cart", href: "/cart", badge: 3 },
    { icon: Heart, label: "Wishlist", href: "/wishlist", badge: 12 },
    { icon: History, label: "Order History", href: "/orders" },
    { icon: Star, label: "Reviews and Ratings", href: "/reviews" },
    { icon: Mail, label: "Inbox", href: "/inbox", badge: 5 },
    { icon: Users, label: "Following", href: "/following" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: LogOut, label: "Log-out", href: "/logout", isDestructive: true },
  ];

  // Function to check if a menu item is active
  const isActive = (href: string) => {
    // Exact match for root paths
    if (href === "/profile" && currentPath === "/profile") return true;
    
    // For nested routes, check if current path starts with the href
    return currentPath.startsWith(href) && href !== "/";
  };

  return (
    <>
      {/* Sidebar */}
      <div className={cn(
        "relative rounded-sm top-0 left-0 h-full w-80 bg-[#303030] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
      )}>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={index}>
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 group",
                      item.isDestructive
                        ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                        : active
                        ? "bg-white border-l-3 border-[#FFB800] text-gray-900 shadow-sm" // Active state
                        : "text-white hover:bg-gray-100 hover:text-gray-900" // Default state
                    )}
                    onClick={(e) => {
                      if (item.isDestructive) {
                        e.preventDefault();
                        console.log("Logout clicked");
                        // Add logout logic here
                      }
                    }}
                  >
                    <div className={cn(
                      "flex items-center gap-3",
                      item.isDestructive 
                        ? "" 
                        : active 
                        ? "text-gray-900" 
                        : "group-hover:text-gray-900"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        item.isDestructive 
                          ? "text-red-500" 
                          : active 
                          ? "text-gray-900" 
                          : "text-white"
                      )} />
                      {item.label}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full font-medium",
                          item.isDestructive 
                            ? "bg-red-100 text-red-700" 
                            : active
                            ? "bg-[#FFB800] text-[#1A1A1A]" 
                            : "bg-[#FFB800] text-[#1A1A1A]"
                        )}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-colors",
                        item.isDestructive 
                          ? "text-red-400" 
                          : active
                          ? "text-gray-600" 
                          : "text-gray-400 group-hover:text-gray-600"
                      )} />
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}

export default MiniSidebarDrawer;