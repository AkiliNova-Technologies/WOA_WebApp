import { Outlet } from "react-router-dom";
import NavbarSection from "../components/Navbar";
import FooterSection from "../components/Footer";

export default function WebsiteLayout() {
  return (
    <div className="flex flex-1 flex-col p-0 h-full">
      <NavbarSection />

      <div className="flex flex-col gap-4 md:gap-6 top-0 relative min-h-screen">
        <Outlet />
      </div>

      <FooterSection />
    </div>
  );
}
