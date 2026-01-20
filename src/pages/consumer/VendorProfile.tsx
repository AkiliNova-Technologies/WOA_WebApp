import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Facebook,
  Twitter,
  ThumbsUp,
  Share,
  Flag,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rate } from "antd";
import { ProductCard } from "@/components/productCard";
import { ActiveFilters } from "@/components/active-filters";
import { FilterSheet } from "@/components/filter-sheet";
// Import mock hooks
import { useProducts } from "@/hooks/useProducts";
import type { SortOption } from "@/types/product";
import { useNavigate, useParams } from "react-router-dom";

const vendorData = {
  name: "Victor Wandulu",
  title: "Owner of Theatrix",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  rating: 4.5,
  reviewCount: 12,
  itemsSold: 16,
  memberMonths: 8,
  shopDescription: `Our fashion & apparel shop curates clothing that celebrates individuality, comfort, and culture. From everyday essentials to statement pieces, each item is thoughtfully selected to help you feel confident, empowered, and effortlessly you.

We offer a vibrant mix of local and global trends—featuring ethically sourced fabrics, inclusive sizing, and designs that move with you. Whether you're dressing for work, play, or celebration, our collections are made to inspire and elevate your wardrobe.`,
};

const reviews = [
  {
    id: 1,
    author: "Annette Black",
    date: "Apr 11 2025",
    rating: 4.5,
    text: "I wore these every day on a trip. The leather is soft and durable, and the sole is sturdy. The stitching is also very clean.",
    helpful: 12,
  },
  {
    id: 2,
    author: "Emma Stone",
    date: "Jul 22 2025",
    rating: 5.0,
    text: "Absolutely love these! Extremely comfortable right out of the box. Perfect for both casual and formal occasions.",
    helpful: 15,
  },
  {
    id: 3,
    author: "Sophie Lee",
    date: "Sep 5 2025",
    rating: 4.8,
    text: "Stylish and versatile! I've worn them on multiple occasions and they always attract compliments. Highly recommend!",
    helpful: 20,
  },
];

const ratingDist = [
  { stars: 5, percentage: 92.6 },
  { stars: 4, percentage: 5 },
  { stars: 3, percentage: 0 },
  { stars: 2, percentage: 1.1 },
  { stars: 1, percentage: 1.3 },
];

// Helper function to get vendor name
const getVendorName = (vendor: string | { id?: string; name?: string } | undefined): string => {
  if (!vendor) return "Unknown Vendor";
  if (typeof vendor === 'string') return vendor;
  return vendor.name || "Unknown Vendor";
};

export default function VendorProfilePage() {
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId?: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sortBy, setSortBy] = useState("price-low-high");

  // Use mock data hook instead of Redux
  const { 
    products: publicProducts,
    getVendors,
    productionMethods,
  } = useProducts();

  // Mock loading state
  const loading = false;

  // Filter products by vendor if vendorId is provided
  // Get vendor name from vendorId to filter products
  const vendorProducts = (() => {
    if (!vendorId) return publicProducts;
    
    // Find vendor name from vendorId
    const allVendors = getVendors();
    const vendorName = allVendors.find(vendor => 
      vendor.toLowerCase().includes(vendorId.toLowerCase()) || 
      vendorId.toLowerCase().includes(vendor.toLowerCase())
    );
    
    if (!vendorName) return publicProducts;
    
    // Filter products by vendor name
    return publicProducts.filter(product => 
      getVendorName(product.vendor) === vendorName
    );
  })();

  // Use vendor data from the first product or fallback
  const vendorInfo = vendorProducts.length > 0 ? {
    name: getVendorName(vendorProducts[0].vendor),
    title: `Owner of ${getVendorName(vendorProducts[0].vendor)}`,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    rating: 4.5,
    reviewCount: 12,
    itemsSold: vendorProducts.reduce((sum, p) => sum + (p.sales || 0), 0),
    memberMonths: 8,
    shopDescription: vendorData.shopDescription,
  } : vendorData;

  // Extract unique categories from vendor products
  const categories = Array.from(
    new Set(vendorProducts.map(p => p.categoryId).filter(Boolean))
  ).map(categoryId => {
    const categoryName = categoryId === "1" ? "Women's Fashion" :
                        categoryId === "2" ? "Men's Fashion" :
                        categoryId === "3" ? "Kid's Fashion" :
                        categoryId === "4" ? "Footwear" :
                        categoryId === "5" ? "Headwear & Wraps" : "Other";
    
    return {
      id: categoryId,
      name: categoryName,
      image: vendorProducts.find(p => p.categoryId === categoryId)?.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
    };
  });

  // Extract unique vendors
  const allVendors = Array.from(
    new Set(vendorProducts.map(p => getVendorName(p.vendor)).filter(Boolean))
  );

  // Local state for filters
  const [filters, setFilters] = useState({
    categories: [] as string[],
    subCategories: [] as string[],
    types: [] as string[],
    priceRange: [0, 1000] as [number, number],
    productionMethods: [] as string[],
    vendors: [] as string[],
    inStock: false,
    onSale: false,
    minRating: 0,
  });

  const [sortOption, setSortOption] = useState<string>("most-recent");

  // Apply filters
  const filteredProducts = vendorProducts.filter((product) => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.categoryId || '')) {
      return false;
    }
    
    // Price filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    // Vendor filter
    if (filters.vendors.length > 0) {
      const vendorName = getVendorName(product.vendor);
      if (!filters.vendors.includes(vendorName)) {
        return false;
      }
    }
    
    // Stock filter
    if (filters.inStock && !product.inStock) {
      return false;
    }
    
    // On Sale filter
    if (filters.onSale && !product.isOnSale) {
      return false;
    }
    
    // Rating filter
    if (filters.minRating > 0 && (product.rating || 0) < filters.minRating) {
      return false;
    }
    
    // Production method filter
    if (filters.productionMethods.length > 0) {
      if (!product.productionMethod || !filters.productionMethods.includes(product.productionMethod)) {
        return false;
      }
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "popularity":
        // Use sales or reviews for popularity
        return (b.sales || 0) - (a.sales || 0);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      subCategories: [],
      types: [],
      priceRange: [0, 1000],
      productionMethods: [],
      vendors: [],
      inStock: false,
      onSale: false,
      minRating: 0,
    });
  };

  const handleSetSortOption = (value: string) => {
    setSortOption(value as SortOption);
  };

  const handleClearCategory = (categoryId: string) => {
    const newCategories = filters.categories.filter(
      (id: string) => id !== categoryId
    );
    updateFilter("categories", newCategories);
  };

  const handleClearProductionMethod = (method: string) => {
    const newMethods = filters.productionMethods.filter(
      (m: string) => m !== method
    );
    updateFilter("productionMethods", newMethods);
  };

  const handleClearPriceRange = () => {
    updateFilter("priceRange", [0, 1000]);
  };

  const handleClearAll = () => {
    resetFilters();
  };

  const filteredProductsCount = filteredProducts.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading vendor profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      {/* Header */}
      <div className="bg-[#F7F7F7] sticky py-3 top-0 z-10 dark:bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Vendor Profile</h1>
          </div>
          <Button className="bg-[#CC5500] rounded-full hover:bg-[#CC5500]/90 text-white px-8 py-2 font-semibold">
            Follow
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start h-14 bg-transparent p-0">
              <TabsTrigger
                value="about"
                className="flex-1 max-w-32 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-14"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="flex-1 max-w-32 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-14"
              >
                Items
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="flex-1 max-w-32 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-14"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="m-0">
              <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Vendor Info Card */}
                <Card className="py-8 mb-8 shadow-none border-none">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-6">
                      <img
                        src={vendorInfo.avatar}
                        alt={vendorInfo.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          {vendorInfo.name}
                        </h2>
                        <p className="text-gray-600 mb-3">{vendorInfo.title}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Rate
                              disabled
                              defaultValue={vendorInfo.rating}
                              className="text-yellow-400 text-sm"
                            />
                            <span className="font-semibold">
                              ({vendorInfo.reviewCount})
                            </span>
                          </div>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">
                            {vendorInfo.itemsSold} items sold
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">
                            Member for {vendorInfo.memberMonths} months
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        Share profile:
                      </span>
                      {[Copy, Facebook, Twitter].map((Icon, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        Shop Description
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {vendorInfo.shopDescription}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        Vendor story
                      </h3>
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800"
                          alt="Vendor story"
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <Button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
                            size="icon"
                          >
                            {isPlaying ? (
                              <Pause className="w-6 h-6 text-gray-900" />
                            ) : (
                              <div className="w-0 h-0 border-l-16 border-l-gray-900 border-y-10 border-y-transparent ml-1" />
                            )}
                          </Button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
                          <Play className="w-5 h-5 text-white" />
                          <Pause className="w-5 h-5 text-white" />
                          <Volume2 className="w-5 h-5 text-white" />
                          <div className="flex-1 bg-white bg-opacity-30 h-1 rounded-full">
                            <div className="bg-white h-1 rounded-full w-1/3"></div>
                          </div>
                          <span className="text-white text-xs">
                            1:45 / 3:22
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Products Section */}
                <Card className="py-6 mb-8 shadow-none border-none">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Featured Products</h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-low-high">
                          Price: Low to high
                        </SelectItem>
                        <SelectItem value="price-high-low">
                          Price: High to low
                        </SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sortedProducts.slice(0, 8).map((product) => {
                      const vendorName = getVendorName(product.vendor);
                      const productImage = product.images && product.images.length > 0 
                        ? product.images[0]
                        : product.image || '';
                      
                      return (
                        <ProductCard
                          key={product.id}
                          id={parseInt(product.id)}
                          name={product.name}
                          rating={product.rating || 0}
                          reviews={product.reviews || 0}
                          price={product.price}
                          vendor={vendorName}
                          image={productImage}
                        />
                      );
                    })}
                  </div>
                </Card>

                {/* Reviews Section */}
                <Card className="py-6 shadow-none border-none">
                  <h2 className="text-2xl font-bold mb-8">Reviews</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2">4.9</div>
                      <Rate
                        disabled
                        defaultValue={4.9}
                        className="text-yellow-400 text-lg"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        {vendorInfo.reviewCount} reviews
                      </p>
                    </div>
                    <div className="col-span-2 space-y-2">
                      {ratingDist.map((item) => (
                        <div
                          key={item.stars}
                          className="flex items-center gap-3"
                        >
                          <div className="flex items-center gap-1 min-w-38">
                            <Rate
                              disabled
                              defaultValue={item.stars}
                              className="text-yellow-400 text-sm"
                            />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-800 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-t pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full" />
                            <div>
                              <h4 className="font-semibold">{review.author}</h4>
                              <p className="text-sm text-gray-600">
                                {review.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Rate
                              disabled
                              defaultValue={review.rating}
                              className="text-yellow-400"
                            />
                            <span className="text-sm font-semibold">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.text}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful})
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                          >
                            <Share className="w-4 h-4" />
                            Share
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                          >
                            <Flag className="w-4 h-4" />
                            Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-8">
                    Read more reviews
                  </Button>
                </Card>
              </div>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items" className="m-0">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <Card className="py-6 border-none shadow-none">
                  {/* Active Filters Display */}
                  <ActiveFilters
                    filters={filters}
                    categories={categories}
                    onClearCategory={handleClearCategory}
                    onClearProductionMethod={handleClearProductionMethod}
                    onClearPriceRange={handleClearPriceRange}
                    onClearAll={handleClearAll}
                  />

                  {/* Reusable Filter Sheet Component */}
                  <FilterSheet
                    categories={categories}
                    allVendors={allVendors}
                    productionMethods={productionMethods || []}
                    products={sortedProducts}
                    filters={filters}
                    sortOption={sortOption}
                    filteredProductsCount={filteredProductsCount}
                    updateFilter={updateFilter}
                    resetFilters={resetFilters}
                    setSortOption={handleSetSortOption}
                  />

                  {/* Products Grid */}
                  {sortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {sortedProducts.map((product) => {
                        const vendorName = getVendorName(product.vendor);
                        const productImage = product.images && product.images.length > 0 
                          ? product.images[0]
                          : product.image || '';
                        
                        return (
                          <ProductCard
                            key={product.id}
                            id={parseInt(product.id)}
                            name={product.name}
                            rating={product.rating || 0}
                            reviews={product.reviews || 0}
                            price={product.price}
                            vendor={vendorName}
                            image={productImage}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-[#666] text-lg">
                        No products found matching your criteria.
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleClearAll}
                        className="mt-4"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="m-0">
              <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Reviews Section */}
                <Card className="py-6 shadow-none border-none">
                  <h2 className="text-2xl font-bold mb-8">Reviews</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2">4.9</div>
                      <Rate
                        disabled
                        defaultValue={4.9}
                        className="text-yellow-400 text-lg"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        {vendorInfo.reviewCount} reviews
                      </p>
                    </div>
                    <div className="col-span-2 space-y-2">
                      {ratingDist.map((item) => (
                        <div
                          key={item.stars}
                          className="flex items-center gap-3"
                        >
                          <div className="flex items-center gap-1 min-w-38">
                            <Rate
                              disabled
                              defaultValue={item.stars}
                              className="text-yellow-400 text-sm"
                            />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-800 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-t pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full" />
                            <div>
                              <h4 className="font-semibold">{review.author}</h4>
                              <p className="text-sm text-gray-600">
                                {review.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Rate
                              disabled
                              defaultValue={review.rating}
                              className="text-yellow-400"
                            />
                            <span className="text-sm font-semibold">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.text}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful})
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                          >
                            <Share className="w-4 h-4" />
                            Share
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                          >
                            <Flag className="w-4 h-4" />
                            Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-8">
                    Read more reviews
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}