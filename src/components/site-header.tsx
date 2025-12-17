import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {  Settings } from "lucide-react";
import { Search, type SearchResult } from "./ui/search";
import { useState, type ReactNode } from "react";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { NotificationsPopover } from "./notifications-popover";

interface SiteHeaderProps {
  rightActions?: ReactNode;
  label?: string;
}

export function SiteHeader({ rightActions, label }: SiteHeaderProps) {
  const location = useLocation();

  const navigate = useNavigate();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useReduxAuth();

  const getPageTitle = (pathname: string) => {
    const pathWithoutAdmin = pathname.replace(/^\/admin\/?/, "");

    if (!pathWithoutAdmin) return "Dashboard";

    if (
      pathname === "/admin" ||
      pathname === "/admin/" ||
      pathname === "/vendor" ||
      pathname === "/vendor/"
    )
      return "Dashboard";

    // Split the path and get the last non-empty segment
    const segments = pathname
      .split("/")
      .filter((segment) => segment.trim() !== "");
    const lastSegment = segments[segments.length - 1];

    // Format the last segment as title
    const words = lastSegment.split("-");
    const formattedTitle = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return formattedTitle;
  };

  const pageTitle = getPageTitle(location.pathname);

  const handleSearchChange = async (value: string) => {
    if (value.length > 2) {
      setIsLoading(true);
      // Simulate API call
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "User Documentation",
          description: "Complete guide for users",
          url: "/docs/user",
          type: "documentation",
        },
        {
          id: "2",
          title: "API Reference",
          description: "Technical API documentation",
          url: "/docs/api",
          type: "api",
        },
      ];

      setTimeout(() => {
        setResults(mockResults);
        setIsLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    // Navigate to the result URL
    window.location.href = result.url;
  };

  const getInitials = (): string => {
    // Use first and last name initials if available
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0).toUpperCase()}${user.lastName
        .charAt(0)
        .toUpperCase()}`;
    }

    // Fallback to first name only
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }

    // Fallback to last name only
    if (user?.lastName) {
      return user.lastName.charAt(0).toUpperCase();
    }

    // Fallback to username if no names available
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }

    // Final fallback
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 flex h-18 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 group-has-data-[collapsible=icon]/sidebar-wrapper:h-18 dark:bg-[#121212]">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        {/* Left side - Page title and sidebar trigger */}
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-10 bg-[#303030] border border-white text-white p-4 hover:bg-[#303030] dark:hover:bg-[#303030] hover:text-white" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-2xl font-medium">{label ? label : pageTitle}</h1>
        </div>

        {/* Middle - Search input */}
        <div className="flex-1 max-w-md mx-4">
          <Search
            results={results}
            isLoading={isLoading}
            onSearchChange={handleSearchChange}
            onResultSelect={handleResultSelect}
            placeholder="Search or type a command"
            maxResults={5}
            className="rounded-md"
          />
        </div>

        {/* Right side - Notifications, theme, custom actions, and user avatar */}
        <div className="flex items-center gap-2">
          {/* Custom right actions */}
          {rightActions && (
            <>
              {rightActions}
              <Separator orientation="vertical" className="h-6 mx-1" />
            </>
          )}

          {/* Notifications button */}
          <NotificationsPopover />

          {/* Settings button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="h-6 w-6" />
          </Button>

          {/* User avatar with name */}
          <div className="flex items-center gap-2 ml-2">
            <Avatar className="h-12 w-12 rounded-full">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <p>
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
