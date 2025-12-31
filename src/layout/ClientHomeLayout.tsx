import { Outlet } from "react-router-dom";
import FooterSection from "../components/Footer";
import NavbarHomeSection from "@/components/NavbarHome";

export default function ClientWebsiteLayout() {
  return (
    <div className="flex flex-1 flex-col p-0 h-full">
      <NavbarHomeSection />

      <div className="flex flex-col gap-4 md:gap-6 top-0 relative min-h-screen dark:bg-[#121212]">
        <Outlet />
      </div>

      <FooterSection />
    </div>
  );
}
