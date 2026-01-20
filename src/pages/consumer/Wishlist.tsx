// pages/consumer/Wishlist.tsx
import images from "@/assets/images";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useReduxWishlist } from "@/hooks/useReduxWishlists";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function WishListPage() {
  const navigate = useNavigate();
  
  // Use real Redux hooks
  const { 
    items: wishlistItems, 
    loading: wishlistLoading, 
    error: wishlistError,
    getWishlist,
    removeItem,
    getWishlistCount,
    clearAllItems
  } = useReduxWishlist();
  
  const { 
    recentlyViewedProducts,
    getRecentlyViewedProducts,
    getPublicProducts,
    loading: productsLoading
  } = useReduxProducts();

  // State for recommended products
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch wishlist
        await getWishlist();
        
        // Fetch recently viewed products
        await getRecentlyViewedProducts();
        
        // Fetch some public products for recommendations (first 8 products)
        const publicProductsData = await getPublicProducts({ limit: 8 });
        setRecommendedProducts(publicProductsData.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load wishlist data");
      }
    };
    
    fetchData();
  }, [getWishlist, getRecentlyViewedProducts, getPublicProducts]);

  // Handle wishlist item removal
  const handleRemoveFromWishlist = async (itemId: string, productName: string) => {
    try {
      await removeItem(itemId);
      toast.success(`Removed ${productName} from wishlist`);
    } catch (error) {
      toast.error("Failed to remove item from wishlist");
    }
  };

  // Calculate wishlist stats based on actual data structure
  const calculateWishlistStats = () => {
    const totalValue = wishlistItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price;
    }, 0);
    
    // Check if product is on sale - use salePrice if it exists and is less than price
    const onSaleCount = wishlistItems.filter(item => {
      const product = item.product;
      return product && product.salePrice && product.salePrice < product.price;
    }).length;
    
    // For average rating, default to 0 if not available
    const averageRating = 0;

    return {
      totalValue,
      onSaleCount,
      averageRating
    };
  };

  const wishlistStats = calculateWishlistStats();
  const isEmpty = wishlistItems.length === 0 && !wishlistLoading;
  const loading = wishlistLoading || productsLoading;

  // Show error state
  if (wishlistError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Heart className="h-12 w-12 text-red-500" />
          <p className="text-gray-600">Failed to load wishlist</p>
          <Button 
            onClick={() => getWishlist()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
                {recentlyViewedProducts.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                  />
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
                {recommendedProducts.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Convert wishlist item to product format for ProductCard
const convertWishlistItemToProduct = (item: any) => {
  const product = item.product || {};
  
  // Get primary image
  const primaryImage = product.images?.find((img: any) => img.isPrimary)?.url || 
                       product.images?.[0]?.url || 
                       "";
  
  // Create a simplified product object that matches what ProductCard expects
  const simplifiedProduct = {
    id: item.productId || product.id || "",
    name: product.name || "Unknown Product",
    price: product.price || 0,
    salePrice: product.salePrice,
    images: product.images || [],
    image: primaryImage,
    vendor: product.vendor || { 
      id: "", 
      businessName: product.vendor?.businessName || "Unknown Vendor",
      name: product.vendor?.businessName || "Unknown Vendor"
    },
    vendorName: product.vendor?.businessName || "Unknown Vendor",
    // Use the correct status type from Product type
    status: "active" as const,
    variants: [] as any[],
    categoryId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Optional fields
    description: "",
    averageRating: 0,
    reviewCount: 0,
    // Add compareAtPrice if needed
    compareAtPrice: product.salePrice
  };
  
  return simplifiedProduct;
};

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
                My Wishlist <span className="font-normal text-gray-600">({getWishlistCount()})</span>
              </h2>
              <p className="text-sm text-gray-600">
                Total value: ${wishlistStats.totalValue.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("Clear all items from wishlist?")) {
                    clearAllItems();
                    toast.success("Wishlist cleared");
                  }
                }}
              >
                Clear All
              </Button>
              <Button
                className="bg-[#CC5500] hover:bg-[#CC5500]/90"
                onClick={() => {
                  toast.info("Buy all functionality coming soon");
                }}
              >
                Buy All ({getWishlistCount()})
              </Button>
            </div>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const productData = convertWishlistItemToProduct(item);
            
            return (
              <div key={item.id} className="relative">
                <ProductCard 
                  product={productData}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white z-10 rounded-full shadow-sm"
                  onClick={() => handleRemoveFromWishlist(item.id, productData.name)}
                >
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                </Button>
              </div>
            );
          })}
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
              {recentlyViewedProducts.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
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
              {recommendedProducts.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}