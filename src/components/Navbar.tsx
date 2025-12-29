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
import images from "../assets/images";
import { SearchInput, type Suggestion } from "./ui/search-input";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReduxAuth } from "../hooks/useReduxAuth";
import { useReduxUsers } from "../hooks/useReduxUsers";
import { cn } from "../lib/utils";

interface Category {
  id: string;
  name: string;
}

export default function NavbarSection() {
  const navigate = useNavigate();
  const { isAuthenticated, user, getAvatar, getFullName, isUserVerified } = useReduxAuth();
  const { profile, getUserProfile } = useReduxUsers();
  
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Debug logging
  useEffect(() => {
    console.log("=== NAVBAR AUTH DEBUG ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user object:", user);
    console.log("profile object:", profile);
    console.log("isUserVerified():", isUserVerified());
    console.log("getAvatar() result:", getAvatar());
    console.log("getFullName() result:", getFullName());
    console.log("=== END DEBUG ===");
  }, [isAuthenticated, user, profile, isUserVerified, getAvatar, getFullName]);

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user) {
        try {
          await getUserProfile();
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, getUserProfile]);

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
    {
      id: "fashion",
      name: "Fashion & Apparel",
    },
    {
      id: "home",
      name: "Home & Living",
    },
    {
      id: "jewelry",
      name: "Jewelry & Accessories",
    },
    {
      id: "art",
      name: "Art & Crafts",
    },
    {
      id: "beauty",
      name: "Beauty & Wellness",
    },
    {
      id: "food",
      name: "Food & Beverages",
    },
    {
      id: "tourism",
      name: "Tourism & Experiences",
    },
  ];

  // Mock suggestions data
  const mockSuggestions: Suggestion[] = [
    {
      id: "1",
      text: "Wireless Headphones",
      type: "product",
      category: "Electronics",
      count: 124,
    },
    {
      id: "2",
      text: "Running Shoes",
      type: "product",
      category: "Sports",
      count: 89,
    },
    { id: "3", text: "Electronics", type: "category" },
    { id: "4", text: "Nike", type: "brand", count: 67 },
    {
      id: "5",
      text: "iPhone Cases",
      type: "trending",
      category: "Accessories",
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
      // On mobile, toggle subcategories instead of navigating
      setActiveCategory(activeCategory === category.id ? null : category.id);
    } else {
      // On desktop, navigate and close menu
      console.log("Navigating to category:", category.name);
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
    <>

      {/* Main Navbar */}
      <nav className="w-full bg-[#2D2D2D] px-4 sm:px-12 py-4 relative">
        <div className="text-white flex items-center justify-between max-w-7xl mx-auto gap-4">
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
                  className="flex items-center gap-2 text-sm hover:text-yellow-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-700 group"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <span className="hidden sm:inline">Categories</span>
              </div>

              {/* Categories Dropdown */}
              {isCategoriesOpen && (
                <div
                  ref={categoriesRef}
                  className={`absolute top-full left-0 mt-4 bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 ${
                    isMobile ? "w-80" : "min-w-[300px]"
                  }`}
                  onMouseLeave={() => !isMobile && setActiveCategory(null)}
                >
                  {/* Desktop Layout - Side by Side */}
                  {!isMobile && (
                    <div className="flex">
                      {/* Main Categories List */}
                      <div className="flex-1 border-r border-gray-100 max-h-96 overflow-y-auto rounded-lg">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <h3 className="font-semibold text-gray-900">
                            All Categories
                          </h3>
                        </div>
                        <div className="py-2">
                          {categories.map((category) => (
                            <div
                              key={category.id}
                              className="relative"
                              onMouseEnter={() =>
                                handleCategoryHover(category.id)
                              }
                            >
                              <button
                                onClick={() => handleCategoryClick(category)}
                                className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 flex items-center justify-between group ${
                                  activeCategory === category.id
                                    ? "bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <span className="font-medium">
                                  {category.name}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Layout - Stacked */}
                  {isMobile && (
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            All Categories
                          </h3>
                          <button
                            onClick={() => setIsCategoriesOpen(false)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="py-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <button
                              onClick={() => handleCategoryClick(category)}
                              className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 flex items-center justify-between group ${
                                activeCategory === category.id
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <span className="font-medium">{category.name}</span>
                              <div className="flex items-center gap-2">
                                <ChevronRight
                                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                    activeCategory === category.id
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <SearchInput
              value={query}
              onChange={handleChange}
              onSearch={handleSearch}
              suggestions={suggestions}
              isLoading={isLoading}
              placeholder="Search for products, brands, and categories..."
              className="text-[#1A1A1A] min-h-10 max-h-12 bg-white"
            />
          </div>

          {/* Right: Icons + Sign In */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              className="relative p-2 hover:text-yellow-400 transition-colors duration-200 group"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                3
              </span>
            </button>

            <button
              className="relative p-2 hover:text-yellow-400 transition-colors duration-200 group"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                2
              </span>
            </button>

            {isAuthenticated && isEmailVerified  ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 group relative"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 rounded-full cursor-pointer ring-2 ring-yellow-400 hover:ring-yellow-300 transition-all shadow-md">
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
                        "bg-gradient-to-br from-yellow-400 to-orange-500 text-black font-semibold text-lg transition-all group-hover:scale-105",
                        isEmailVerified() ? "from-green-400 to-green-600" : ""
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

                    {/* Authentication status indicator */}
                    {/* {isAuthenticated && (
                      <>
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-[#2D2D2D] animate-ping"></span>
                        {isEmailVerified() && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-[#2D2D2D]">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        )}
                      </>
                    )} */}
                  </div>

                  {/* Show user name on larger screens */}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white flex items-center gap-1">
                      {getUserDisplayName() || user?.email?.split("@")[0] || "User"}
                      {isEmailVerified() && (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      )}
                    </p>
                    <p className="text-xs text-gray-300">View Profile</p>
                  </div>
                </button>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="rounded-full bg-white text-black hover:bg-gray-100 flex items-center gap-3 h-12 px-4 sm:px-5 transition-all duration-200 hover:shadow-md"
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
    </>
  );
}