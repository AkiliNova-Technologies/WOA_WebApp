import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";

function SettingsMiniSidebarDrawer() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigate = useNavigate();

  const menuItems = [
    { label: "My Account", href: "/seller/settings" },
    { label: "Edit Store Information", href: "/seller/settings/edit-store" },
    { label: "Change Password", href: "/seller/settings/change-password" },
    { label: "Log-out", href: "/logout" },
  ];

  // Function to check if a menu item is active
  const isActive = (href: string) => {
    // For exact matches
    if (currentPath === href) return true;
    return false;
  };

  // Handle logout separately
  const handleLogout = (e: React.MouseEvent, href: string) => {
    if (href === "/logout") {
      e.preventDefault();
      // Add your logout logic here
      console.log("Logout clicked");
      navigate("/auth/signin")
      // Example: clear storage, redirect to login, etc.
    }
    // For all other links, let the Link component handle navigation
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
                    onClick={(e) => handleLogout(e, item.href)}
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
          </ul>
        </nav>
      </div>
    </>
  );
}

export default SettingsMiniSidebarDrawer;