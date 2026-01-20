import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  ThumbsUp,
  Share,
  Plus,
  Minus,
  ShoppingCart,
  User,
  Loader2,
} from "lucide-react";
// Comment out Redux hooks
// import { useReduxProducts } from "@/hooks/useReduxProducts";
// import { useReduxCart } from "@/hooks/useReduxCart";
// import { useReduxWishlist } from "@/hooks/useReduxWishlists";

// Import mock data hooks
import { useProducts } from "@/hooks/useProducts";
// Mock cart and wishlist functions
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rate } from "antd";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Import the Vendor type from your types if available
interface VendorInfo {
  id: string;
  name: string;
  title?: string;
  rating?: number;
  reviews?: number;
  itemsSold?: number;
  memberMonths?: number;
  avatar?: string;
}

// Helper function to get vendor name from product vendor field
const getVendorName = (vendor: string | { id?: string; name?: string } | undefined): string => {
  if (!vendor) return "Unknown Vendor";
  if (typeof vendor === 'string') return vendor;
  return vendor.name || "Unknown Vendor";
};

// Helper function to get vendor ID from product vendor field
const getVendorId = (vendor: string | { id?: string; name?: string } | undefined): string => {
  if (!vendor) return "unknown";
  if (typeof vendor === 'string') return vendor;
  return vendor.id || vendor.name || "unknown";
};

// Mock cart functions
const useMockCart = () => {
  const addItem = async (productId: string, quantity: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Added ${quantity} of product ${productId} to cart`);
    return { success: true };
  };

  return { addItem, updating: false };
};

// Mock wishlist functions
const useMockWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const isInWishlist = (productId: string) => wishlistItems.includes(productId);

  const toggleWishlistItem = async (productId: string) => {
    setAdding(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let wasAdded = false;
    setWishlistItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        wasAdded = true;
        return [...prev, productId];
      }
    });
    
    setAdding(false);
    return wasAdded;
  };

  return { isInWishlist, toggleWishlistItem, adding };
};

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  // Use mock data hooks instead
  const { 
    getProductById,
    getProductsByCategory,
  } = useProducts();
  
  // Use mock cart and wishlist
  const { addItem: addToCart, updating: addingToCart } = useMockCart();
  const { isInWishlist, toggleWishlistItem, adding: addingToWishlist } = useMockWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [showProductDetails, setShowProductDetails] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [showShipping, setShowShipping] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get product from mock data
  const product = productId ? getProductById(productId) : null;
  
  // Get related products (products from same category)
  const relatedProducts = product 
    ? getProductsByCategory(product.categoryId).filter(p => p.id !== productId).slice(0, 4)
    : [];

  // Mock track view
  const trackView = async (id: string) => {
    console.log(`Tracked view for product: ${id}`);
  };

  // Fetch product data on mount
  useEffect(() => {
    const fetchProductData = async () => {
      if (productId) {
        setLoading(true);
        try {
          // With mock data, we don't need async fetching, but we simulate it
          await new Promise(resolve => setTimeout(resolve, 500));
          await trackView(productId);
        } catch (error) {
          console.error("Failed to fetch product:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProductData();
  }, [productId]);

  // Update wishlist status
  useEffect(() => {
    if (productId) {
      setInWishlist(isInWishlist(productId));
    }
  }, [productId, isInWishlist]);

  // Loading state
  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#CC5500]" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  // Handle vendor data safely using helper functions
  const getVendorInfo = (): VendorInfo => {
    const vendorName = getVendorName(product.vendor);
    const vendorId = getVendorId(product.vendor);
    
    return {
      id: vendorId,
      name: vendorName,
      title: vendorName !== "Unknown Vendor" ? `Owner of ${vendorName}` : "Vendor",
      rating: 4.5,
      reviews: 12,
      itemsSold: product.sales || 16,
      memberMonths: 8,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    };
  };

  const vendor = getVendorInfo();

  // Get product images
  const productImages = product.images && product.images.length > 0 
    ? product.images
    : product.image 
    ? [product.image]
    : ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"];

  // Mock reviews (replace with real reviews when available)
  const reviews = [
    {
      id: "1",
      author: "Annette Black",
      date: "Apr 11 2025",
      rating: 4.1,
      text: "Great product! High quality and exactly as described.",
      helpful: 125,
      verified: true,
    },
    {
      id: "2",
      author: "Emma Stone",
      date: "Jul 3 2025",
      rating: 5.0,
      text: "Absolutely love this! Exceeded my expectations.",
      helpful: 98,
      verified: true,
    },
  ];

  const ratingDistribution = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 14 },
    { stars: 3, percentage: 0 },
    { stars: 2, percentage: 11 },
    { stars: 1, percentage: 0 },
  ];

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      toast.success("Added to cart", {
        description: `${quantity} × ${product.name}`,
      });
    } catch (error) {
      toast.error("Failed to add to cart", {
        description: "Please try again",
      });
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    try {
      const wasAdded = await toggleWishlistItem(product.id);
      setInWishlist(wasAdded);
      
      if (wasAdded) {
        toast.success("Added to wishlist", {
          description: product.name,
        });
      } else {
        toast.info("Removed from wishlist", {
          description: product.name,
        });
      }
    } catch (error) {
      toast.error("Failed to update wishlist", {
        description: "Please try again",
      });
    }
  };

  // Get available stock
  const availableStock = product.variants && product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + (v.inStock ? v.stockQuantity : 0), 0)
    : product.stockQuantity || 100;

  // Mock category data for breadcrumb
  const categoryName = product.categoryId === "1" ? "Women's Fashion" :
                      product.categoryId === "2" ? "Men's Fashion" :
                      product.categoryId === "3" ? "Kid's Fashion" :
                      product.categoryId === "4" ? "Footwear" :
                      product.categoryId === "5" ? "Headwear & Wraps" : "Products";

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center gap-2 text-md text-[#999999]">
            <span>{categoryName}</span>
            <span>/</span>
            <span>{product.subCategoryId || "Category"}</span>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div>
            <div className="relative bg-white rounded-lg overflow-hidden mb-4">
              <button 
                onClick={handleWishlistToggle}
                disabled={addingToWishlist}
                className={cn(
                  "absolute top-4 right-4 z-10 p-2 rounded-full shadow-md transition-all",
                  inWishlist 
                    ? "bg-red-50 hover:bg-red-100" 
                    : "bg-white hover:bg-gray-100"
                )}
              >
                <Heart 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    inWishlist ? "text-red-500 fill-red-500" : "text-gray-700"
                  )}
                />
              </button>
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
                }}
              />
            </div>

            {/* Thumbnail Navigation */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                  className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50"
                  disabled={selectedImage === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2 overflow-x-auto flex-1">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx
                          ? "border-orange-500"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
                        }}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setSelectedImage(
                      Math.min(productImages.length - 1, selectedImage + 1)
                    )
                  }
                  className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50"
                  disabled={selectedImage === productImages.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Product Reviews Section */}
            <Card className="p-6 mb-12 shadow-none border-none mt-6">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="flex items-center justify-between w-full mb-6"
              >
                <h2 className="text-2xl font-bold">Product Reviews</h2>
                <ChevronRight
                  className={`w-6 h-6 transform transition-transform ${
                    showReviews ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showReviews && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">
                        {product.rating?.toFixed(1) || "4.5"}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {product.reviews || 15} reviews
                      </p>
                    </div>

                    <div className="col-span-5 space-y-2">
                      {ratingDistribution.map((item) => (
                        <div
                          key={item.stars}
                          className="flex items-center gap-1"
                        >
                          <div className="flex items-center gap-1 w-38">
                            <Rate
                              disabled
                              defaultValue={item.stars}
                              className="text-yellow-400 text-xl"
                            />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
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
                          <button className="flex items-center gap-1 hover:text-orange-500">
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful})
                          </button>
                          <button className="flex items-center gap-1 hover:text-orange-500">
                            <Share className="w-4 h-4" />
                            Share
                          </button>
                          {review.verified && (
                            <span className="text-green-600">
                              ✓ Verified purchase
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-6">
                    Read all reviews
                  </Button>
                </>
              )}
            </Card>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Rating and Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rate
                  disabled
                  value={product.rating || 4.5}
                  className="text-yellow-400"
                />
                <span className="text-sm font-semibold">
                  {(product.rating || 4.5).toFixed(1)} Star Rating
                </span>
                <span className="text-sm text-gray-600">
                  ({product.reviews || 15} User feedback)
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  product.status === "active" 
                    ? "bg-green-100 text-green-800"
                    : product.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : product.status === "archived"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
                )}>
                  {product.status || "active"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Category: {categoryName}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Variant Selection (if applicable) */}
            {product.variants && product.variants.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Option</label>
                  <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                    <SelectTrigger className="w-full min-h-11">
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants
                        .filter(v => v.inStock && v.stockQuantity > 0)
                        .map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.name} - ${variant.price.toFixed(2)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex gap-4">
              <div className="flex items-center border border-gray-200 rounded-full p-1">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 hover:bg-gray-100 bg-[#F2F2F2] rounded-full text-[#303030]"
                >
                  <Minus />
                </Button>
                <Input
                  type="text"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(availableStock, parseInt(e.target.value) || 1)))
                  }
                  className="w-12 text-center border-none py-2 rounded-none"
                />
                <Button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="h-10 w-10 hover:bg-gray-100 bg-[#F2F2F2] rounded-full text-[#303030]"
                  disabled={quantity >= availableStock}
                >
                  <Plus />
                </Button>
              </div>
              <Button 
                className="flex-1 h-12 bg-[#CC5500] rounded-full text-white py-3 font-semibold hover:bg-[#CC5500]/80 flex items-center justify-center gap-2"
                onClick={handleAddToCart}
                disabled={addingToCart || availableStock === 0}
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add to Cart
                    <ShoppingCart className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            {availableStock < 10 && availableStock > 0 && (
              <p className="text-sm text-orange-600">
                Only {availableStock} left in stock!
              </p>
            )}

            {availableStock === 0 && (
              <p className="text-sm text-red-600 font-medium">
                Out of stock
              </p>
            )}

            {/* Share Options */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Share product:</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowProductDetails(!showProductDetails)}
                className="flex items-center justify-between w-full font-semibold"
              >
                <span>Product Details</span>
                <ChevronRight
                  className={`w-5 h-5 transform transition-transform ${
                    showProductDetails ? "rotate-90" : ""
                  }`}
                />
              </button>
              {showProductDetails && product.specifications && (
                <div className="mt-3 space-y-2 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="col-span-2">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping and Returns */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowShipping(!showShipping)}
                className="flex items-center justify-between w-full font-semibold"
              >
                <span>Shipping and Returns</span>
                <ChevronRight
                  className={`w-5 h-5 transform transition-transform ${
                    showShipping ? "rotate-90" : ""
                  }`}
                />
              </button>
              {showShipping && (
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Standard shipping available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Ships from vendor location
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Meet Your Vendor */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Meet your vendor</h3>
                <button
                  className="text-orange-500 text-sm hover:underline"
                  onClick={() => navigate(`/category/vendor-profile/${vendor.id}`)}
                >
                  Check out the store
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                {vendor.avatar ? (
                  <img
                    src={vendor.avatar}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{vendor.name}</h4>
                  <p className="text-sm text-gray-600">{vendor.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Rate
                        disabled
                        defaultValue={vendor.rating || 4.5}
                        className="text-yellow-400 text-xs"
                      />
                      <span>({vendor.reviews || 0})</span>
                    </div>
                    <span>• {vendor.itemsSold || 0} Items sold</span>
                  </div>
                </div>
              </div>
              <Button className="w-full h-11 bg-[#CC5500] text-white py-2 rounded-full font-medium hover:bg-[#CC5500]/80">
                Follow
              </Button>
            </div>
          </div>
        </div>

        {/* More like this */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">More like this</h2>
              <button className="text-orange-500 hover:underline">
                View more
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}