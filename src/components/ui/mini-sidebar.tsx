import React, { useState } from "react";
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import ConfirmDialog from "@/components/confirm-dialog";

function MiniSidebarDrawer() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  // Use the auth hook
  const { signout, user } = useReduxAuth();

  // State for dialog
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { icon: House, label: "My Account", href: "/profile" },
    { icon: History, label: "Order History", href: "/profile/orders" },
    { icon: Mail, label: "Inbox", href: "/profile/inbox", badge: 5 },
    { icon: Star, label: "Reviews and Ratings", href: "/profile/reviews" },
    { icon: History, label: "History", href: "/profile/history" },
    { icon: Users, label: "Following", href: "/profile/following" },
    { icon: Settings, label: "Settings", href: "/profile/settings" },
    {
      icon: LogOut,
      label: "Log-out",
      href: "#",
      isDestructive: true,
    },
  ];

  // Fixed isActive function
  const isActive = (href: string) => {
    if (href === "/profile") {
      return currentPath === "/profile";
    }
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  // Handle logout button click
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutDialog(true);
  };

  // Handle logout confirmation
  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signout();
      navigate("/auth");
      
    } catch (error) {
      console.error("Logout failed:", error);
      // Show error message (you could add error state here)
      alert("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    if (!isLoggingOut) {
      setShowLogoutDialog(false);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.email) return user.email.split("@")[0];
    return "User";
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
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="px-2">
            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={index}>
                    {item.isDestructive ? (
                      // Logout button
                      <button
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className={cn(
                          "flex items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-200 group w-full text-left rounded-none",
                          "text-white hover:bg-red-600 hover:text-white cursor-pointer",
                          "hover:shadow-md hover:shadow-red-900/20",
                          isLoggingOut && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </div>
                        {isLoggingOut && (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </button>
                    ) : (
                      // Regular menu item
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-200 group w-full rounded-none",
                          "hover:shadow-md hover:shadow-white/10",
                          active
                            ? "bg-white border-l-3 border-[#CC5500] text-gray-900 shadow-sm"
                            : "text-white hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3",
                            active
                              ? "text-gray-900"
                              : "group-hover:text-gray-900"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              active
                                ? "text-gray-900"
                                : "text-white group-hover:text-gray-900"
                            )}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={cn(
                              "px-2 py-1 text-xs rounded-full font-medium min-w-6 text-center",
                              active
                                ? "bg-[#FFB800] text-[#1A1A1A]"
                                : "bg-[#FFB800] text-[#1A1A1A]"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message={`Are you sure you want to logout? ${
          user ? `You are currently logged in as ${getUserDisplayName()}.` : ""
        }`}
        type="danger"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        isLoading={isLoggingOut}
        // showCloseButton={!isLoggingOut}
        showCloseButton={false}
      />
    </>
  );
}

export default MiniSidebarDrawer;
