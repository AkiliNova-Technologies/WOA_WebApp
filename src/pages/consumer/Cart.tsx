import { useState, useEffect } from "react";
import { Minus, Plus, Heart, Trash2, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/productCard";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";
// Use Redux hooks
import { useReduxCart } from "@/hooks/useReduxCart";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { toast } from "sonner";
import type { CartItem } from "@/redux/slices/cartSlice";

const shippingOptions = [
  {
    id: "standard",
    name: "Standard Shipping",
    price: 6.0,
    description: "Estimated delivery: 3-5 business days",
  },
  {
    id: "express",
    name: "DHL EXPRESS",
    price: 40.0,
    description: "Estimated delivery: 1-2 business days",
  },
];

export default function CartPage() {
  const navigate = useNavigate();

  const {
    items: cartItems,
    loading,
    getCart,
    updateItem,
    removeItem,
    moveItemToWishlist,
    calculateSubtotal,
    itemCount: totalItems,
  } = useReduxCart();

  const { recentlyViewedProducts, getRecentlyViewedProducts } =
    useReduxProducts();

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Fetch cart and recently viewed data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCart();
        await getRecentlyViewedProducts();
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    fetchData();
  }, [getCart, getRecentlyViewedProducts]);

  const handleUpdateQuantity = async (
    itemId: string,
    delta: number,
    currentQuantity: number,
  ) => {
    const newQuantity = Math.max(1, currentQuantity + delta);

    setIsUpdating(itemId);
    try {
      await updateItem(itemId, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity", {
        description: "Please try again",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string, productName: string) => {
    try {
      await removeItem(itemId);
      toast.success("Item removed from cart", {
        description: productName,
      });
    } catch (error) {
      toast.error("Failed to remove item", {
        description: "Please try again",
      });
    }
  };

  const handleSaveForLater = async (itemId: string, productName: string) => {
    try {
      await moveItemToWishlist(itemId);
      toast.success("Moved to wishlist", {
        description: productName,
      });
    } catch (error) {
      toast.error("Failed to move to wishlist", {
        description: "Please try again",
      });
    }
  };

  const subtotal = calculateSubtotal();
  const selectedShippingOption = shippingOptions.find(
    (opt) => opt.id === selectedShipping,
  );
  const shipping = selectedShippingOption?.price || 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#CC5500]" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-center">Your Cart</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white flex flex-col justify-center items-center">
            <img
              src={images.EmptyCart}
              alt="Empty Cart Image"
              className="h-full w-full max-h-sm max-w-sm"
            />
            <h2 className="text-xl font-semibold mb-2">Empty Cart</h2>
            <p className="text-gray-600 mb-6">You have nothing in your cart</p>
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
                <h2 className="text-2xl font-bold">Recently viewed</h2>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-center">Your Cart</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Cart{" "}
                <span className="font-normal text-gray-600">
                  ({totalItems} items)
                </span>
              </h2>
            </div>

            <div className="space-y-4">
              {cartItems.map((item: CartItem) => {
                const product = item.product;

                // Get the first image URL from the images array
                const imageUrl =
                  product.images?.find((img) => img.isPrimary)?.url ||
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";

                // Get stock from product.stock
                const stockQuantity = product.stock || 0;

                // Use item.price or item.salePrice instead of product.price
                const displayPrice = item.salePrice || item.price;
                const comparePrice = item.salePrice ? item.price : undefined;

                // Calculate item total
                const itemTotal = displayPrice * item.quantity;

                // Calculate savings if there's a sale price
                const savings = comparePrice
                  ? (comparePrice - displayPrice) * item.quantity
                  : 0;

                return (
                  <Card key={item.id} className="p-4 shadow-none">
                    <div className="flex gap-4">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-24 h-24 md:w-38 md:h-44 lg:w-48 lg:h-58 object-cover rounded-lg shrink-0"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Vendor info */}
                            {product.vendor?.businessName && (
                              <p className="text-sm text-gray-500 mb-2">
                                Sold by{" "}
                                <span className="font-medium text-gray-700">
                                  {product.vendor.businessName}
                                </span>
                              </p>
                            )}

                            {/* SKU */}
                            {product.sku && (
                              <p className="text-xs text-gray-400 mb-2">
                                SKU: {product.sku}
                              </p>
                            )}

                            {/* Stock indicator */}
                            <div className="flex items-center gap-2 mb-2">
                              {stockQuantity > 0 && stockQuantity < 5 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-50 border-orange-200 text-orange-800 text-xs"
                                >
                                  <Package className="h-3 w-3 mr-1" />
                                  Only {stockQuantity} left
                                </Badge>
                              )}

                              {stockQuantity === 0 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-red-50 border-red-200 text-red-600 text-xs"
                                >
                                  Out of stock
                                </Badge>
                              )}

                              {stockQuantity >= 5 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-50 border-green-200 text-green-700 text-xs"
                                >
                                  In Stock
                                </Badge>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-[#303030]">
                                  ${displayPrice.toFixed(2)}
                                </p>
                                {comparePrice && comparePrice > displayPrice && (
                                  <span className="text-sm text-gray-400 line-through">
                                    ${comparePrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {/* Savings badge */}
                              {savings > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-50 border-green-200 text-green-700 text-xs w-fit"
                                >
                                  Save ${savings.toFixed(2)}
                                </Badge>
                              )}

                              {/* Item subtotal */}
                              {item.quantity > 1 && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Subtotal:{" "}
                                  <span className="font-semibold text-gray-900">
                                    ${itemTotal.toFixed(2)}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-row justify-between items-center mt-4">
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-gray-600 hover:text-gray-900"
                              onClick={() =>
                                handleRemoveItem(item.id, product.name)
                              }
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-gray-600 hover:text-gray-900"
                              onClick={() =>
                                handleSaveForLater(item.id, product.name)
                              }
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              Save for later
                            </Button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 border border-gray-300 rounded-full p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    -1,
                                    item.quantity,
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 || isUpdating === item.id
                                }
                              >
                                {isUpdating === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full bg-[#CC5500] text-white hover:bg-[#CC5500]/80 hover:text-white"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    1,
                                    item.quantity,
                                  )
                                }
                                disabled={
                                  isUpdating === item.id ||
                                  (stockQuantity > 0 &&
                                    item.quantity >= stockQuantity)
                                }
                              >
                                {isUpdating === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column - Shipping & Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 shadow-none border-none rounded-lg">
              {/* Shipping Options */}
              <h3 className="font-semibold mb-4">Shipping Options</h3>

              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedShipping === option.id
                        ? "border-[#CC5500] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedShipping(option.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            selectedShipping === option.id
                              ? "border-[#CC5500]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedShipping === option.id && (
                            <div className="w-3 h-3 bg-[#CC5500] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {option.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm">
                        USD {option.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <h3 className="font-semibold mb-4">
                Items{" "}
                <span className="font-normal text-gray-600">
                  ({totalItems} items)
                </span>{" "}
                total
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">USD {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shop discount</span>
                  <span className="font-medium">
                    -USD {discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">USD {shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">
                    Estimated total ({totalItems} items)
                  </span>
                  <span className="font-semibold text-[#303030]">
                    USD {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-11 bg-[#CC5500] hover:bg-[#CC5500]/90 rounded-full text-white font-semibold mt-6"
                onClick={() => navigate("/cart/checkout")}
              >
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recently viewed</h2>
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
      </div>
    </div>
  );
}