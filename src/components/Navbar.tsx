import {
  Menu,
  Heart,
  ShoppingCart,
  ArrowUpRight,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import images from "../assets/images";
import { SearchInput, type Suggestion } from "./ui/search-input";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  subcategories?: string[];
  featured?: boolean;
}

export default function NavbarSection() {
    const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
      subcategories: [
        "Men's Clothing",
        "Women's Clothing",
        "Children's Wear",
        "Traditional Attire",
        "Shoes & Footwear",
      ],
      featured: true,
    },
    {
      id: "home",
      name: "Home & Living",
      subcategories: [
        "Home Decor",
        "Furniture",
        "Kitchenware",
        "Bedding",
        "Lighting",
      ],
      featured: true,
    },
    {
      id: "jewelry",
      name: "Jewelry & Accessories",
      subcategories: [
        "Necklaces",
        "Bracelets",
        "Earrings",
        "Rings",
        "Traditional Jewelry",
      ],
    },
    {
      id: "art",
      name: "Art & Crafts",
      subcategories: [
        "Paintings",
        "Sculptures",
        "Pottery",
        "Textile Art",
        "Wood Carvings",
      ],
    },
    {
      id: "beauty",
      name: "Beauty & Wellness",
      subcategories: [
        "Skincare",
        "Hair Care",
        "Body Care",
        "Natural Oils",
        "Wellness Products",
      ],
    },
    {
      id: "food",
      name: "Food & Beverages",
      subcategories: [
        "Spices",
        "Coffee & Tea",
        "Traditional Foods",
        "Organic Products",
        "Beverages",
      ],
    },
    {
      id: "tourism",
      name: "Tourism & Experiences",
      subcategories: [
        "Tour Packages",
        "Cultural Experiences",
        "Adventure Tours",
        "Safari Packages",
      ],
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

  const handleSubcategoryClick = (subcategory: string) => {
    console.log("Navigating to subcategory:", subcategory);
    setIsCategoriesOpen(false);
    setActiveCategory(null);
  };

  return (
    <nav className="w-full bg-[#2D2D2D] px-4 sm:px-12 py-4 relative">
      <div className="text-white flex items-center justify-between max-w-8xl mx-auto gap-4">
        {/* Left section: Logo + Categories */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <img
              src={images.logo}
              alt="World of Afrika"
              className="h-10 sm:h-14 md:h-14"
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
                              {category.featured && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  Popular
                                </span>
                              )}
                              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subcategories Panel - Absolute positioned */}
                    {activeCategory && (
                      <div className="absolute left-full top-0 ml-px w-64 bg-gray-50 rounded-r-lg border border-gray-200 shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900">
                            {
                              categories.find((c) => c.id === activeCategory)
                                ?.name
                            }
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            {categories
                              .find((c) => c.id === activeCategory)
                              ?.subcategories?.map((subcategory, index) => (
                                <button
                                  key={index}
                                  onClick={() =>
                                    handleSubcategoryClick(subcategory)
                                  }
                                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-all duration-200 group"
                                >
                                  <span className="group-hover:underline">
                                    {subcategory}
                                  </span>
                                </button>
                              ))}
                          </div>

                          {/* Featured Categories Quick Links */}
                          {categories.find((c) => c.id === activeCategory)
                            ?.featured && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                Quick Links
                              </h4>
                              <div className="space-y-1">
                                <button className="text-xs text-yellow-600 hover:text-yellow-700 transition-colors">
                                  Shop All{" "}
                                  {
                                    categories.find(
                                      (c) => c.id === activeCategory
                                    )?.name
                                  }
                                </button>
                                <button className="block text-xs text-yellow-600 hover:text-yellow-700 transition-colors">
                                  New Arrivals
                                </button>
                                <button className="block text-xs text-yellow-600 hover:text-yellow-700 transition-colors">
                                  Best Sellers
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                              {category.featured && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  Popular
                                </span>
                              )}
                              <ChevronDown
                                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                  activeCategory === category.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </div>
                          </button>

                          {/* Mobile Subcategories - Expandable */}
                          {activeCategory === category.id &&
                            category.subcategories && (
                              <div className="pl-6 pr-4 pb-3 bg-gray-50 border-t border-gray-100">
                                <div className="space-y-2 pt-2">
                                  {category.subcategories.map(
                                    (subcategory, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          handleSubcategoryClick(subcategory)
                                        }
                                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-all duration-200 group"
                                      >
                                        <span className="group-hover:underline">
                                          {subcategory}
                                        </span>
                                      </button>
                                    )
                                  )}
                                </div>

                                {/* Mobile Quick Links */}
                                {category.featured && (
                                  <div className="mt-4 pt-3 border-t border-gray-200">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                      Quick Links
                                    </h4>
                                    <div className="space-y-1">
                                      <button className="text-xs text-yellow-600 hover:text-yellow-700 transition-colors">
                                        Shop All {category.name}
                                      </button>
                                      <button className="block text-xs text-yellow-600 hover:text-yellow-700 transition-colors">
                                        New Arrivals
                                      </button>
                                      <button className="block text-xs text-yellow-600 hover:text-yellow-700 transition-colors">
                                        Best Sellers
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors flex items-center gap-1">
                    View All Categories
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
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
          <button className="relative p-2 hover:text-yellow-400 transition-colors duration-200 group">
            <Heart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
              3
            </span>
          </button>

          <button className="relative p-2 hover:text-yellow-400 transition-colors duration-200 group">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
              2
            </span>
          </button>

          <Button
            variant="secondary"
            className="rounded-full bg-white text-black hover:bg-gray-100 flex items-center gap-3 h-12 px-4 sm:px-5 transition-all duration-200 hover:shadow-md"
            onClick={()=> navigate("/auth/signin")}
          >
            <span className="hidden sm:inline">Sign in</span>
            <div className="bg-black text-white rounded-full p-1">
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </Button>
        </div>
      </div>
    </nav>
  );
}
