import { Outlet } from "react-router-dom";
export default function DashboardLayout() {
  return (
    <div className="flex flex-1 flex-col p-0 h-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6 top-0 relative bg-[#F4F5F9] dark:bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
