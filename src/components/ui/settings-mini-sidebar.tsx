import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button"; 

function SettingsMiniSidebarDrawer() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  
  // Use the auth hook
  const { signout, loading: authLoading } = useReduxAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { label: "My Account", href: "/vendor/settings", icon: null },
    { label: "Edit Store Information", href: "/vendor/settings/edit-store", icon: null },
    { label: "Change Password", href: "/vendor/settings/change-password", icon: null },
  ];

  // Function to check if a menu item is active
  const isActive = (href: string) => {
    // For exact matches
    if (currentPath === href) return true;
    return false;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signout();
      navigate("/vendor/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      // Error is already handled by the signout function
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "rounded-sm bg-[#303030] shadow-2xl flex flex-col h-fit" // Changed h-full to h-fit
        )}
      >
        {/* Menu Items */}
        <nav className="py-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);

              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 group",
                      active
                        ? "bg-white border-l-3 border-[#FFB800] text-gray-900 shadow-sm" 
                        : "text-white hover:bg-gray-100 hover:text-gray-900" 
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3",
                        active ? "text-gray-900" : "group-hover:text-gray-900"
                      )}
                    >
                      {item.label}
                    </div>
                  </Link>
                </li>
              );
            })}
            
            {/* Logout Button - Separate from other menu items */}
            <li>
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut || authLoading}
                className={cn(
                  "w-full h-11 rounded-none flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 group",
                  "text-white hover:bg-red-500 hover:text-white bg-transparent hover:border-red-500",
                  (isLoggingOut || authLoading) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <span>Log-out</span>
                </div>
                {(isLoggingOut || authLoading) && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default SettingsMiniSidebarDrawer;