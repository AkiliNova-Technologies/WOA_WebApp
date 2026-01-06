import {
  Menu,
  Heart,
  ShoppingCart,
  ArrowUpRight,
  X,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import images from "../assets/images";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReduxAuth } from "../hooks/useReduxAuth";
import { useReduxUsers } from "../hooks/useReduxUsers";
import { useReduxCart } from "../hooks/useReduxCart";
import { useReduxWishlist } from "../hooks/useReduxWishlists";
import { SearchInputHome, type Suggestion } from "./ui/search-input-home";
import { cn } from "../lib/utils";

interface Category {
  id: string;
  name: string;
}

export default function NavbarHomeSection() {
  const navigate = useNavigate();
  const { isAuthenticated, user, getAvatar, getFullName } = useReduxAuth();
  const { profile, getUserProfile } = useReduxUsers();
  const { itemCount: cartCount, getCart } = useReduxCart();
  const { getWishlistCount, getWishlist } = useReduxWishlist();
  
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch user profile and cart/wishlist counts when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && user) {
        try {
          await getUserProfile();
          await getCart();
          await getWishlist();
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, user, getUserProfile, getCart, getWishlist]);

  // Update wishlist count
  useEffect(() => {
    if (isAuthenticated) {
      setWishlistCount(getWishlistCount());
    } else {
      setWishlistCount(0);
    }
  }, [isAuthenticated, getWishlistCount]);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Categories data
  const categories: Category[] = [
    { id: "fashion", name: "Fashion & Apparel" },
    { id: "home", name: "Home & Living" },
    { id: "jewelry", name: "Jewelry & Accessories" },
    { id: "art", name: "Art & Crafts" },
    { id: "beauty", name: "Beauty & Wellness" },
    { id: "food", name: "Food & Beverages" },
    { id: "tourism", name: "Tourism & Experiences" },
  ];

  // Mock suggestions data
  const mockSuggestions: Suggestion[] = [
    {
      id: "1",
      text: "African Print Dresses",
      type: "product",
      category: "Fashion",
      count: 124,
    },
    {
      id: "2",
      text: "Handwoven Baskets",
      type: "product",
      category: "Home & Living",
      count: 89,
    },
    { id: "3", text: "Jewelry", type: "category" },
    { id: "4", text: "Ankara Fabrics", type: "brand", count: 67 },
    {
      id: "5",
      text: "Wooden Sculptures",
      type: "trending",
      category: "Art",
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node) &&
        menuButtonRef.current !== event.target &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsCategoriesOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    console.log("Searching for:", searchQuery);
    setIsCategoriesOpen(false);
    // Implement actual search logic
  };

  const handleChange = (value: string) => {
    setQuery(value);

    // Simulate API call for suggestions
    if (value.length > 2) {
      setIsLoading(true);
      setTimeout(() => {
        const filtered = mockSuggestions.filter((s) =>
          s.text.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setIsLoading(false);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const handleCategoryHover = (categoryId: string) => {
    if (!isMobile) {
      setActiveCategory(categoryId);
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (isMobile) {
      setActiveCategory(activeCategory === category.id ? null : category.id);
    } else {
      console.log("Navigating to category:", category.name);
      navigate(`/category/${category.id}`);
      setIsCategoriesOpen(false);
      setActiveCategory(null);
    }
  };

  // Check if email is verified from profile (most accurate)
  const isEmailVerified = () => {
    // First check profile data (most reliable)
    if (profile && profile.emailVerified !== undefined) {
      return profile.emailVerified === true;
    }
    
    // Fallback to auth user data
    if (user && user.emailVerified !== undefined) {
      return user.emailVerified === true;
    }
    
    return false;
  };

  // Get user avatar with profile priority
  const getUserAvatar = () => {
    if (profile?.avatarUrl) {
      return profile.avatarUrl;
    }
    if (user?.avatar) {
      return user.avatar;
    }
    return getAvatar();
  };

  // Get user name with profile priority
  const getUserDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`.trim();
    }
    return getFullName();
  };

  return (
    <nav className="max-w-8xl w-full flex flex-1 px-4 absolute py-2 top-0 z-50">
      <div className="text-white bg-white flex items-center justify-between w-full max-w-7xl mx-auto gap-4 px-4 sm:px-12 py-4 sticky top-0 z-50 shadow-lg rounded-xl">
        {/* Left section: Logo + Categories */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <img
              src={images.logo}
              alt="World of Afrika"
              className="h-10 sm:h-14 md:h-14 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Categories Menu Button */}
          <div className="relative">
            <div className="flex gap-2 items-center">
              <button
                ref={menuButtonRef}
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                onMouseEnter={() => !isMobile && setIsCategoriesOpen(true)}
                className="flex items-center gap-2 text-primary text-sm hover:text-[#C75A00] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-[#F7F7F7] group"
              >
                <Menu className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Categories</span>
              </button>
            </div>

            {/* Categories Dropdown */}
            {isCategoriesOpen && (
              <div
                ref={categoriesRef}
                className={`absolute top-full left-0 mt-8 bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 ${
                  isMobile ? "w-80" : "min-w-[300px]"
                }`}
                onMouseLeave={() => !isMobile && setIsCategoriesOpen(false)}
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      All Categories
                    </h3>
                    {isMobile && (
                      <button
                        onClick={() => setIsCategoriesOpen(false)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="py-2 max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="border-b border-gray-100 last:border-b-0"
                      onMouseEnter={() => handleCategoryHover(category.id)}
                    >
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 flex items-center justify-between group ${
                          activeCategory === category.id
                            ? "bg-[#FFF5E6] text-[#C75A00] font-medium"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span>{category.name}</span>
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 group-hover:text-[#C75A00] transition-colors ${
                            activeCategory === category.id ? "text-[#C75A00]" : ""
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <SearchInputHome
            value={query}
            onChange={handleChange}
            onSearch={handleSearch}
            suggestions={suggestions}
            isLoading={isLoading}
            placeholder="Search for anything"
            className="text-[#1A1A1A] min-h-10 max-h-12 bg-[#F7F7F7] rounded-lg"
          />
        </div>

        {/* Right: Icons + Sign In */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Wishlist Button with Badge */}
          <button
            className="relative p-2 hover:text-[#FFD700] transition-colors duration-200 group"
            onClick={() => navigate("/wishlist")}
          >
            <Heart className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            {wishlistCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-[#C75A00] text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center font-medium px-1.5 border-2 border-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </Badge>
            )}
          </button>

          {/* Cart Button with Badge */}
          <button
            className="relative p-2 hover:text-[#FFD700] transition-colors duration-200 group"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-[#C75A00] text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center font-medium px-1.5 border-2 border-white">
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </button>

          {/* User Profile or Sign In */}
          {isAuthenticated && isEmailVerified() ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 group relative"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 rounded-full cursor-pointer ring-2 ring-[#FFD700] hover:ring-[#C75A00] transition-all shadow-md">
                    <AvatarImage
                      src={getUserAvatar()}
                      alt={getUserDisplayName() || "User"}
                      onError={(e) => {
                        console.error(
                          "Avatar image failed to load:",
                          getUserAvatar()
                        );
                        // Hide the broken image
                        e.currentTarget.style.display = "none";
                      }}
                      className="object-cover"
                    />
                    <AvatarFallback className={cn(
                      "bg-gradient-to-br from-[#FFD700] to-[#C75A00] text-black font-semibold text-lg transition-all group-hover:scale-105"
                    )}>
                      {(() => {
                        const name = getUserDisplayName();
                        if (name) {
                          return name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);
                        }
                        return user?.email?.[0]?.toUpperCase() || "U";
                      })()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Show user name on larger screens */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    {getUserDisplayName() || user?.email?.split("@")[0] || "User"}
                    {isEmailVerified() && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500">View Profile</p>
                </div>
              </button>
            </div>
          ) : (
            <Button
              variant="secondary"
              className="rounded-full bg-[#F7F7F7] text-black hover:bg-gray-100 flex items-center gap-3 h-12 px-4 sm:px-5 transition-all duration-200 hover:shadow-md font-medium"
              onClick={() => navigate("/auth/signin")}
            >
              <span className="hidden sm:inline">Sign in</span>
              <div className="bg-black text-white rounded-full p-1">
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}