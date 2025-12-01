import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function CategoryLayout() {
  const { resetBreadcrumbs } = useBreadcrumb();
  const location = useLocation();
  const hasReset = useRef(false);

  useEffect(() => {
    // Only reset breadcrumbs once when entering the category section
    // or when navigating from outside the category section
    const isEnteringCategory = location.pathname.startsWith('/category') && !hasReset.current;
    
    if (isEnteringCategory) {
      resetBreadcrumbs();
      hasReset.current = true;
    }

    // Reset the flag when leaving the category section
    return () => {
      if (!location.pathname.startsWith('/category')) {
        hasReset.current = false;
      }
    };
  }, [location.pathname, resetBreadcrumbs]);

  return (
    <div className="flex flex-1 flex-col p-0 h-full">
      <div className="flex flex-col gap-4 md:gap-6 top-0 relative min-h-screen dark:bg-[#121212]">
        <Outlet />
      </div>
    </div>
  );
}