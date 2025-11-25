import {
  History,
  Star,
  Mail,
  Users,
  Settings,
  LogOut,
  House,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

function MiniSidebarDrawer() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: House, label: "My Account", href: "/profile" },
    { icon: History, label: "Order History", href: "/profile/orders" },
    { icon: Mail, label: "Inbox", href: "/profile/inbox", badge: 5 },
    { icon: Star, label: "Reviews and Ratings", href: "/profile/reviews" },
    { icon: History, label: "History", href: "/profile/history" },
    { icon: Users, label: "Following", href: "/profile/following" },
    { icon: Settings, label: "Settings", href: "/profile/settings" },
    { icon: LogOut, label: "Log-out", href: "/logout", isDestructive: true },
  ];

  // Fixed isActive function
  const isActive = (href: string) => {
    // For the root profile path, only match exactly
    if (href === "/profile") {
      return currentPath === "/profile";
    }

    // For nested routes, check if current path starts with the href + "/"
    // or matches exactly, but ensure we don't match parent routes incorrectly
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "relative rounded-sm top-0 left-0 h-full w-80 bg-[#303030] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
        )}
      >
        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 group",
                      item.isDestructive
                        ? "text-white hover:bg-red-50 hover:text-gray-900"
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
                    <div
                      className={cn(
                        "flex items-center gap-3",
                        item.isDestructive
                          ? ""
                          : active
                          ? "text-gray-900"
                          : "group-hover:text-gray-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 hover:text-gray-900",
                          item.isDestructive
                            ? "text-white"
                            : active
                            ? "text-gray-900"
                            : "text-white"
                        )}
                      />
                      {item.label}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span
                          className={cn(
                            "px-2 py-1 text-xs rounded-full font-medium",
                            item.isDestructive
                              ? "bg-[#FFB800] text-white"
                              : active
                              ? "bg-[#FFB800] text-[#1A1A1A]"
                              : "bg-[#FFB800] text-[#1A1A1A]"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
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
