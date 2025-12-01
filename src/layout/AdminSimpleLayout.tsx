import { Outlet } from "react-router-dom";

export default function AdminSimpleLayout() {
  return (
    <div className="min-h-screen dark:bg-[#121212]">
      <div className="flex-1 dark:bg-[#121212]">
        <Outlet />
      </div>
    </div>
  );
}