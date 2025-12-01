import MiniSidebarDrawer from "@/components/ui/mini-sidebar";
// import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
  return (
    <div className="flex flex-1 flex-col p-0 h-full items-center w-full  max-w-7xl mx-auto">
      <div className="flex flex-row flex-1 flex-wrap gap-4 md:gap-6 top-0 relative w-full min-h-screen p-10">
        <MiniSidebarDrawer />
        <div className="flex-1 flex flex-col">
        <Outlet />
        </div>
      </div>
    </div>
  );
}
