import images from "@/assets/images";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReduxWishlist } from "@/hooks/useReduxWishlists";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { Loader2 } from "lucide-react";
import type { Product } from "@/redux/slices/productsSlice";

export default function WishListPage() {
  const navigate = useNavigate();
  const { items: wishlistItems, loading, getWishlist } = useReduxWishlist();
  const { recentlyViewedProducts, getRecentlyViewedProducts, publicProducts, getPublicProducts } = useReduxProducts();

  // Fetch wishlist and recommendations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getWishlist();
        await getRecentlyViewedProducts({ limit: 4 });
        // Fetch some products for recommendations if none recently viewed
        if (recentlyViewedProducts.length === 0) {
          await getPublicProducts({ limit: 4 });
        }
      } catch (error) {
        console.error("Failed to fetch wishlist data:", error);
      }
    };

    fetchData();
  }, [getWishlist, getRecentlyViewedProducts, getPublicProducts]);

  // Convert WishlistItem to Product type for ProductCard
  const convertWishlistItemToProduct = (item: typeof wishlistItems[0]): Product => {
    // Safely extract vendor information with fallbacks
    const vendorId = item.product.vendor?.id || "unknown";
    const vendorName = item.product.vendor?.businessName || "Unknown Vendor";
    
    return {
      id: item.product.id,
      name: item.product.name,
      description: "",
      
      // Base pricing
      basePrice: item.product.price,
      baseCompareAtPrice: item.product.salePrice,
      
      // Display pricing
      price: item.product.salePrice || item.product.price,
      compareAtPrice: item.product.price > (item.product.salePrice || 0) ? item.product.price : undefined,
      
      // Status
      status: "published" as const,
      
      // Attributes and variants
      attributes: {},
      variants: [],
      
      // Relations
      sellerId: vendorId,
      seller: {
        id: vendorId,
        firstName: "",
        lastName: "",
        businessName: vendorName,
      },
      categoryId: "",
      subcategoryId: "",
      
      // Media - safely handle missing images
      image: item.product.images?.[0]?.url || "",
      images: (item.product.images || []).map((img, index) => ({
        id: `${item.id}-${index}`,
        url: img.url,
        isPrimary: img.isPrimary,
        order: index,
      })),
      gallery: (item.product.images || []).map(img => img.url),
      
      // Ratings & Reviews
      averageRating: 0,
      reviewCount: 0,
      
      // Wishlist status
      isInWishlist: true,
      
      // Vendor info
      vendorId: vendorId,
      vendorName: vendorName,
      sellerName: vendorName,
      
      // Timestamps
      createdAt: item.addedAt,
      updatedAt: item.addedAt,
    };
  };

  // Get products for "Recommended for you" section
  const recommendedProducts = publicProducts.slice(0, 4);

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
  if (wishlistItems.length === 0) {
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            My Wishlist <span className="font-normal text-gray-600">({wishlistItems.length})</span>
          </h2>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <ProductCard 
              key={item.id} 
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