import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import images from "@/assets/images";
import icons from "@/assets/icons";
import { FeaturedStories } from "@/components/FeaturedStories";
import { ClippedButton } from "@/components/clipped-button";
import { HomeCategoryCard } from "@/components/home-category-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

// Use Redux hooks for real data
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { useReduxCategories } from "@/hooks/useReduxCategories";

export default function HomePage() {
  // Use Redux hooks for real data
  const {
    publicProducts,
    loading: productsLoading,
    getPublicProducts,
  } = useReduxProducts();

  const {
    categories,
    loading: categoriesLoading,
    getCategories,
  } = useReduxCategories();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<string>("all");
  const [reviewSort, setReviewSort] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Fetch real data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getPublicProducts();
        await getCategories();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [getPublicProducts, getCategories]);

  // Mock data for featured stories (kept as is since this might be static content)
  const featuredStories = [
    {
      id: "1",
      name: "Peter Toore",
      location: "A Story from Niger",
      image: images.Seller1 || "/stories/peter.jpg",
      isVideo: false,
    },
    {
      id: "2",
      name: "Dinna Daniel",
      location: "A Story from Tanzania",
      image: images.Seller2 || "/stories/dinna.jpg",
      isVideo: false,
    },
    {
      id: "3",
      name: "Irene Ntende",
      location: "A Story from Uganda",
      image: images.Seller3 || "/stories/irene.jpg",
      isVideo: true, // Featured video story
    },
    {
      id: "4",
      name: "Timothy Sentamu",
      location: "A Story from Ghana",
      image: images.Seller4 || "/stories/timothy.jpg",
      isVideo: false,
    },
    {
      id: "5",
      name: "Amina Ade",
      location: "A Story from Kenya",
      image: images.Seller5 || "/stories/amina.jpg",
      isVideo: false,
    },
  ];

  // Filter and sort products based on selected filters
  const displayProducts = (() => {
    let filteredProducts = [...publicProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }

    // Sort by price
    if (priceSort === "low-to-high") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (priceSort === "high-to-low") {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    // Sort by review rating - using averageRating instead of rating
    if (reviewSort === "highest-rated") {
      filteredProducts.sort(
        (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
      );
    } else if (reviewSort === "most-reviews") {
      // Use reviewCount instead of reviews
      filteredProducts.sort(
        (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0),
      );
    }

    // Sort by newest/popular
    if (sortBy === "newest") {
      filteredProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === "popular") {
      // Popular sort - use viewCount if available, otherwise use averageRating
      filteredProducts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }

    return filteredProducts.slice(0, 10);
  })();

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log(`Category selected: ${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      {/* Hero Section with Overlapping Trust Badges */}
      <section className="relative mb-8">
        {/* Hero Image */}
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
          <img
            src={images.HeroImage || "/hero-marketplace.jpg"}
            alt="African Marketplace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        </div>

        {/* Trust Badges - Overlapping Hero */}
        <div className="relative -mt-14 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 shadow-md rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <TrustBadge
                  icon={icons.Shipping}
                  title="Free Shipping"
                  subtitle="Free shipping on all your order"
                />
                <TrustBadge
                  icon={icons.Available}
                  title="Customer Support 24/7"
                  subtitle="Instant access to Support"
                />
                <TrustBadge
                  icon={icons.Secure}
                  title="100% Secure Payment"
                  subtitle="We ensure your credit info is safe"
                />
                <TrustBadge
                  icon={icons.Box}
                  title="Money-Back Guarantee"
                  subtitle="30 Days Money-Back Guarantee"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <h2 className="text-2xl md:text-3xl text-center font-semibold text-[#1A1A1A] dark:text-white">
              Shop by Category
            </h2>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#CC5500]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.slice(0, 5).map((category) => (
                <HomeCategoryCard
                  key={category.id}
                  id={parseInt(category.id)}
                  name={category.name}
                  image={
                    // Use a default image or category.icon if available
                    category.icon ||
                    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"
                  }
                />
              ))}
              <div className="flex flex-col items-center justify-center">
                <Button
                  variant="secondary"
                  className="h-20 w-20 text-[#3A3A3A] bg-[#F5F6FA] hover:scale-105 transition-all hover:shadow-xs duration-300 hover:bg-[#F5F6FA]/90 flex items-center rounded-full justify-center p-0"
                >
                  <ArrowRight className="size-8" />
                </Button>
                <p className="mt-6 text-sm text-center">View All</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Stories */}
      <FeaturedStories stories={featuredStories} />

      {/* All Products */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-start justify-between mb-8 space-y-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1A1A] dark:text-white">
              All Products
            </h2>
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex gap-4">
                {/* Category Select */}
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategorySelect}
                >
                  <SelectTrigger className="px-4 py-2 bg-[#CC5500] text-white border-none rounded-lg text-sm dark:bg-[#CC5500] dark:text-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Price Select */}
                <Select value={priceSort} onValueChange={setPriceSort}>
                  <SelectTrigger className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none dark:bg-[#2D2D2D] dark:border-gray-700">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Price</SelectItem>
                    <SelectItem value="low-to-high">Low to High</SelectItem>
                    <SelectItem value="high-to-low">High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* Review Select */}
                <Select value={reviewSort} onValueChange={setReviewSort}>
                  <SelectTrigger className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none dark:bg-[#2D2D2D] dark:border-gray-700">
                    <SelectValue placeholder="Review" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Review</SelectItem>
                    <SelectItem value="highest-rated">Highest Rated</SelectItem>
                    <SelectItem value="most-reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="px-4 py-2 w-40 border border-gray-200 rounded-lg text-sm focus:outline-none dark:bg-[#2D2D2D] dark:border-gray-700">
                  <SelectValue placeholder="Sort by:" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-[#CC5500]" />
            </div>
          ) : displayProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="flex justify-center mt-12">
                <Button
                  variant="secondary"
                  className="rounded-full px-8 py-6 w-3xs text-base hover:bg-gray-50 dark:hover:bg-[#2D2D2D] hover:scale-105 transition-all duration-300"
                >
                  View more
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No products available in this category.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSelectedCategory("all")}
              >
                View All Products
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-20 bg-[#F5F7FA] dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto bg-white dark:bg-[#2D2D2D] p-8 md:p-12 rounded-[40px] shadow-sm">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="relative h-[500px]">
                  <img
                    src={images.AboutUsImage || "/about-us-artisan.jpg"}
                    alt="African Woman Art"
                    className="w-full h-[500px] object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white">
                About Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Born from a love of African craftsmanship and community, we
                created this platform to connect local creators with global
                customers. We believe every product carries a story, and every
                story deserves to be shared.
              </p>

              <ClippedButton onClick={() => console.log("clicked")}>
                LEARN MORE
              </ClippedButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Trust Badge Component
function TrustBadge({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <img src={icon} alt={title} className="" />
      <div>
        <h3 className="font-semibold text-[#1A1A1A] dark:text-white text-sm mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}
