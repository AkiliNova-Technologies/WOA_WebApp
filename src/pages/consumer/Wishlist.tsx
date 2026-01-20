import images from "@/assets/images";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// Comment out Redux hooks
// import { useReduxWishlist } from "@/hooks/useReduxWishlists";
// import { useReduxProducts } from "@/hooks/useReduxProducts";

// Import mock hooks
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types/product";

export default function WishListPage() {
  const navigate = useNavigate();
  
  // Use mock data hooks instead of Redux
  // const { items: wishlistItems, loading, getWishlist } = useReduxWishlist();
  // const { recentlyViewedProducts, getRecentlyViewedProducts, publicProducts, getPublicProducts } = useReduxProducts();

  const { 
    wishlistItems,
    wishlistCount,
    isEmpty,
    
    wishlistStats
  } = useWishlist();

  const { 
    products: publicProducts,
    getFeaturedProducts,
 
  } = useProducts();

  // Mock recently viewed products (use featured products)
  const recentlyViewedProducts = getFeaturedProducts().slice(0, 4);
  
  // Mock loading state
  const loading = false;

  // Get products for "Recommended for you" section
  const recommendedProducts = publicProducts.slice(0, 4);

  // Helper function to get vendor name from product
  const getVendorName = (product: Product): string => {
    if (!product.vendor) return "Unknown Vendor";
    if (typeof product.vendor === 'string') return product.vendor;
    return product.vendor.name || "Unknown Vendor";
  };

  // Convert WishlistItem to Product type for ProductCard
  const convertWishlistItemToProduct = (item: typeof wishlistItems[0]): Product => {
    const vendorName = getVendorName(item.product);
    
    return {
      ...item.product,
      // Ensure all required ProductCard props are present
      vendorName: vendorName,
      sellerName: vendorName,
      // Ensure image is always a string
      image: item.product.image || item.product.images?.[0] || "",
    };
  };

  // Loading state
  if (loading && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#CC5500]" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Empty wishlist state
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-center">Wishlist</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white flex flex-col justify-center items-center">
            <img
              src={images.EmptyWishlist}
              alt="Empty Wishlist Image"
              className="h-full w-full max-h-sm max-w-sm"
            />
            <h2 className="text-xl font-semibold mb-2">Empty Wishlist</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Found something you like? Tap on the heart shaped icon next to the
              item to add it to your wishlist!
            </p>
            <Button
              className="h-11 min-w-2xs bg-[#CC5500] rounded-full hover:bg-[#CC5500]/90"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </Button>
          </div>

          {/* Recently Viewed */}
          {recentlyViewedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recently Viewed</h2>
                <Button
                  variant="ghost"
                  className="text-[#CC5500] hover:text-[#CC5500]/80"
                  onClick={() => navigate("/products")}
                >
                  View more
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyViewedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Recommended for you */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recommended for you</h2>
                <Button
                  variant="ghost"
                  className="text-[#CC5500] hover:text-[#CC5500]/80"
                  onClick={() => navigate("/products")}
                >
                  View more
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-center">Wishlist</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Wishlist Stats */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                My Wishlist <span className="font-normal text-gray-600">({wishlistCount})</span>
              </h2>
              <p className="text-sm text-gray-600">
                Total value: ${wishlistStats.totalValue.toFixed(2)}
              </p>
            </div>
            {/* <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{wishlistStats.onSaleCount} on sale</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>{wishlistStats.outOfStockCount} out of stock</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Avg rating: {wishlistStats.averageRating.toFixed(1)}</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <ProductCard 
              key={item.productId} 
              product={convertWishlistItemToProduct(item)} 
            />
          ))}
        </div>

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recently Viewed</h2>
              <Button
                variant="ghost"
                className="text-[#CC5500] hover:text-[#CC5500]/80"
                onClick={() => navigate("/products")}
              >
                View more
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended for you */}
        {recommendedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recommended for you</h2>
              <Button
                variant="ghost"
                className="text-[#CC5500] hover:text-[#CC5500]/80"
                onClick={() => navigate("/products")}
              >
                View more
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}