import { Outlet } from "react-router-dom";
import AdminNavbarMinimalSection from "@/components/AdminNavbarMinimal";

export default function VendorAuthLayout() {
  return (
    <div className="flex flex-1 flex-col p-0 h-full">
      <div className="fixed z-1000 w-full">
        <AdminNavbarMinimalSection isKYC />
      </div>

      <div className="flex flex-col gap-4 md:gap-6 top-0 relative min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
