// components/Footer.tsx
import images from "../assets/images";
import { NewsletterEmail } from "./newsletter-email";
import icons from "@/assets/icons";
import { useNavigate } from "react-router-dom";

export default function FooterSection() {
  const navigate = useNavigate();

  const accountLinks = [
    { name: "My Account", path: "/account" },
    { name: "Order History", path: "/orders" },
    { name: "Shopping Cart", path: "/cart" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Become a Vendor", path: "/kyc" },
    { name: "Vendor Hub", path: "/vendor/auth/signin" },
  ];

  const helpLinks = [
    { name: "About", path: "/about" },
    { name: "Contact Us", path: "/contact" },
    { name: "FAQs", path: "/faqs" },
    { name: "Terms & Conditions", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy" },
  ];

  const categoryLinks = [
    { name: "Fashion & Apparel", path: "/category/fashion" },
    { name: "Home Decor & Lifestyle", path: "/category/home" },
    { name: "Jewelry & Accessories", path: "/category/jewelry" },
    { name: "Gourmet & Specialty Foods", path: "/category/food" },
    { name: "Health & Beauty", path: "/category/beauty" },
    { name: "Tourism", path: "/category/tourism" },
  ];

  const socialLinks = [
    { icon: icons.Facebook, name: "Facebook", url: "#" },
    { icon: icons.Twitter, name: "Twitter", url: "#" },
    { icon: icons.Pinterest, name: "Pinterest", url: "#" },
    { icon: icons.Instagram, name: "Instagram", url: "#" },
  ];

  return (
    <footer className="w-full text-gray-300 bg-[#1E1E1E]">
      {/* Newsletter Section */}
      <div className="bg-[#F7F7F7] py-8 md:py-12 px-4 sm:px-6 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
            {/* Text Content */}
            <div className="text-center lg:text-left max-w-md">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                Subscribe our Newsletter
              </h2>
              <p className="text-sm text-gray-500">
                Send me tips, trends, updates & offers.
              </p>
            </div>

            {/* Newsletter Form */}
            <div className="w-full flex-1 lg:flex-1 max-w-lg">
              <NewsletterEmail
                showIcon={false}
                inputSize="md"
                onSubmit={async (email) => {
                  console.log("Footer subscription:", email);
                }}
                placeholder="Email address"
                className="h-12 bg-white border-gray-200 flex-1"
              />
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-6 text-gray-600">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity duration-200 transform hover:scale-110"
                >
                  <img
                    src={social.icon}
                    alt={`${social.name} icon`}
                    className="h-5 w-5 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="px-4 sm:px-6 lg:px-20 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row gap-8 lg:gap-12 xl:gap-16 border-b border-gray-700 pb-8 md:pb-12">
            {/* Logo and Info */}
            <div className="flex-1 max-w-md">
              <img
                src={images.logo}
                alt="World of Afrika"
                className="h-10 sm:h-14 mb-4 cursor-pointer"
                onClick={() => navigate("/")}
              />
              <p className="text-sm leading-relaxed text-gray-400 mb-6">
                We are a digital marketplace platform designed to connect local
                creators, designers, and small businesses (especially in fashion
                and crafts) with local and international customers.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-[#FFE7D6] hover:bg-[#FFE7D6]/90 flex flex-1 justify-center items-center h-16 gap-3 px-4 rounded-lg transition-all duration-200 hover:scale-105">
                  <img
                    src={icons.Apple}
                    alt="Apple Logo"
                    className="h-6 w-6"
                  />
                  <div className="flex flex-col items-start">
                    <p className="text-[#303030] text-xs">Get it now</p>
                    <h1 className="font-bold text-base text-[#303030]">
                      Apple Store
                    </h1>
                  </div>
                </button>
                <button className="bg-[#FFE7D6] hover:bg-[#FFE7D6]/90 flex flex-1 justify-center items-center h-16 gap-3 px-4 rounded-lg transition-all duration-200 hover:scale-105">
                  <img
                    src={icons.PlayStore}
                    alt="Google Play Logo"
                    className="h-6 w-6"
                  />
                  <div className="flex flex-col items-start">
                    <p className="text-[#303030] text-xs">Get it now</p>
                    <h1 className="font-bold text-base text-[#303030]">
                      Google Play
                    </h1>
                  </div>
                </button>
              </div>
            </div>

            {/* Links Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {/* My Account */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">
                  My Account
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-sm text-gray-400">
                  {accountLinks.map((link) => (
                    <li
                      key={link.name}
                      onClick={() => navigate(link.path)}
                      className="cursor-pointer hover:text-[#C75A00] transition-all duration-200 transform hover:translate-x-1"
                    >
                      {link.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Help */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">
                  Help
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-sm text-gray-400">
                  {helpLinks.map((link) => (
                    <li
                      key={link.name}
                      onClick={() => navigate(link.path)}
                      className="cursor-pointer hover:text-[#C75A00] transition-all duration-200 transform hover:translate-x-1"
                    >
                      {link.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">
                  Categories
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-sm text-gray-400">
                  {categoryLinks.map((link) => (
                    <li
                      key={link.name}
                      onClick={() => navigate(link.path)}
                      className="cursor-pointer hover:text-[#C75A00] transition-all duration-200 transform hover:translate-x-1"
                    >
                      {link.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 md:pt-8 gap-4 md:gap-6">
            {/* Copyright */}
            <p className="text-sm text-gray-500 text-center md:text-left order-2 md:order-1">
              Tek Juice © 2025. All Rights Reserved
            </p>

            {/* Payment Methods */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 order-1 md:order-2 flex-wrap">
              {[
                images.ApplePay,
                images.Visa,
                images.Discover,
                images.MasterCard,
                images.Cart,
              ].map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Payment method ${index + 1}`}
                  className="h-6 sm:h-7 md:h-8 opacity-80 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}