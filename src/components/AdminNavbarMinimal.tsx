import images from "../assets/images";
import { Link } from "react-router-dom";

interface NavbarMinProps {
  isKYC?: boolean;
}

export default function AdminNavbarMinimalSection({ isKYC }: NavbarMinProps) {
  return (
    <nav className="w-full bg-[#2D2D2D] px-4 sm:px-12 py-4 relative">
      <div className="text-white flex items-center justify-between max-w-8xl mx-auto gap-4 w-full">
        {/* Left section: Logo + Categories */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <img
              src={images.logo}
              alt="World of Afrika"
              className="h-10 sm:h-14 md:h-14"
            />
          </div>
        </div>
        {/* Right: Icons + Sign In */}
        {isKYC ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-sm">Need help?</p>
            <Link to={"/auth/signup"}>
              <span className="text-sm font-semibold">Contact Support</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-sm">Dont have an account?</p>
            <Link to={"/auth/signup"}>
              <span className="text-sm font-semibold">Become a vendor</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
