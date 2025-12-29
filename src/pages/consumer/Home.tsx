// pages/consumer/HomePage.tsx
import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import images from "@/assets/images";
import icons from "@/assets/icons";
import { FeaturedStories } from "@/components/FeaturedStories";

import { useProducts } from "@/hooks/useProducts";
import { ClippedButton } from "@/components/clipped-button";

export default function HomePage() {
  const { products, categories } = useProducts();

  // Mock data for featured stories
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1A1A] dark:text-white">
              Shop by Category
            </h2>
            <Button
              variant="ghost"
              className="text-[#C75A00] hover:text-[#C75A00]/80 flex items-center gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={parseInt(category.id)}
                name={category.name}
                image={category.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <FeaturedStories stories={featuredStories} />

      {/* All Products */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1A1A] dark:text-white">
              All Products
            </h2>
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C75A00] dark:bg-[#2D2D2D] dark:border-gray-700">
                <option>All Categories</option>
                <option>Fashion</option>
                <option>Art & Craft</option>
              </select>
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C75A00] dark:bg-[#2D2D2D] dark:border-gray-700">
                <option>Price</option>
                <option>Low to High</option>
                <option>High to Low</option>
              </select>
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C75A00] dark:bg-[#2D2D2D] dark:border-gray-700">
                <option>Review</option>
                <option>Highest Rated</option>
                <option>Most Reviews</option>
              </select>
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C75A00] dark:bg-[#2D2D2D] dark:border-gray-700">
                <option>Sort by:</option>
                <option>Newest</option>
                <option>Popular</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={parseInt(product.id)}
                name={product.name}
                rating={product.rating}
                reviews={product.reviews}
                price={product.price}
                vendor={product.vendor}
                image={product.image}
              />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              className="rounded-full px-8 py-6 text-base hover:bg-gray-50 dark:hover:bg-[#2D2D2D]"
            >
              View more
            </Button>
          </div>
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
              {/* <Button className="bg-[#C75A00] hover:bg-[#C75A00]/90 text-white w-2xs rounded-sm px-8 py-6 text-base flex items-center gap-2">
                LEARN MORE
                <ArrowRight className="h-5 w-5" />
              </Button> */}

              <ClippedButton  onClick={() => console.log("clicked")}>
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
