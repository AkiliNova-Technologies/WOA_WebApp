import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Rate } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useReduxWishlist } from "@/hooks/useReduxWishlists";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product } from "@/redux/slices/productsSlice";

// Support both old and new prop formats for backward compatibility
interface OldProductCardProps {
  id: number | string;
  image: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  vendor: string | { name: string; businessName?: string };
  categoryId?: string;
}

interface NewProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: string, isInWishlist: boolean) => void;
}

type ProductCardProps = OldProductCardProps | NewProductCardProps;

// Type guard to check if props are in new format
function isNewFormat(props: ProductCardProps): props is NewProductCardProps {
  return 'product' in props;
}

export function ProductCard(props: ProductCardProps) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlistItem, adding, removing } = useReduxWishlist();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Extract product data based on prop format
  const productData = isNewFormat(props) 
    ? {
        id: props.product.id,
        name: props.product.name || "Unknown Product",
        price: props.product.price || 0,
        image: props.product.image || props.product.images?.[0]?.url || "",
        rating: props.product.averageRating || 0,
        reviews: props.product.reviewCount || 0,
        vendor: props.product.vendorName || props.product.sellerName || "Unknown Vendor",
        categoryId: props.product.categoryId || "",
      }
    : {
        id: props.id.toString(),
        name: props.name || "Unknown Product",
        price: props.price || 0,
        image: props.image || "",
        rating: props.rating || 0,
        reviews: props.reviews || 0,
        vendor: typeof props.vendor === 'string' 
          ? props.vendor 
          : (props.vendor?.businessName || props.vendor?.name || "Unknown Vendor"),
        categoryId: props.categoryId || "",
      };

  // Check if product is in wishlist on mount and when wishlist changes
  useEffect(() => {
    setInWishlist(isInWishlist(productData.id));
  }, [productData.id, isInWishlist]);

  const handleCardClick = () => {
    navigate(`/category/product/${productData.id}`);
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (isAnimating || adding || removing) return;

    setIsAnimating(true);

    try {
      const wasAdded = await toggleWishlistItem(productData.id);
      
      // Update local state
      setInWishlist(wasAdded);
      
      // Show toast notification
      if (wasAdded) {
        toast.success("Added to wishlist", {
          description: productData.name,
          duration: 2000,
        });
      } else {
        toast.info("Removed from wishlist", {
          description: productData.name,
          duration: 2000,
        });
      }

      // Callback to parent component if provided (new format only)
      if (isNewFormat(props)) {
        props.onWishlistToggle?.(productData.id, wasAdded);
      }

      // Reset animation after delay
      setTimeout(() => setIsAnimating(false), 600);
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error("Failed to update wishlist", {
        description: "Please try again",
        duration: 3000,
      });
      setIsAnimating(false);
    }
  };

  return (
    <Card
      className="relative w-3xs p-2 mx-auto shadow-none cursor-pointer border-none hover:shadow-lg transition-all duration-300 group dark:bg-[#303030] overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image container with scale effect */}
      <div className="relative rounded-sm overflow-hidden w-full mb-3">
        <div className="overflow-hidden rounded-sm">
          <img
            src={productData.image }
            alt={productData.name}
            className="object-cover object-top w-full h-50 rounded-sm transition-transform duration-500 ease-out group-hover:scale-105"
            // onError={(e) => {
            //   e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
            // }}
          />
        </div>
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm" />
      </div>

      {/* Animated Wishlist button */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
        <Button
          variant={"secondary"}
          className={cn(
            "h-9 w-9 p-0 backdrop-blur-sm rounded-full shadow-md border border-gray-200 relative overflow-hidden transition-all duration-300",
            inWishlist 
              ? "bg-red-50/90 hover:bg-red-100 border-red-300" 
              : "bg-white/90 hover:bg-white"
          )}
          onClick={handleWishlistClick}
          disabled={adding || removing}
        >
          {/* Heart icon with animations */}
          <div className="relative flex items-center justify-center">
            {/* Ping animation layer - only visible during animation */}
            {isAnimating && (
              <Heart
                className={cn(
                  "h-4 w-4 absolute animate-ping",
                  inWishlist ? "text-red-500 fill-red-500" : "text-[#303030]"
                )}
              />
            )}
            {/* Main heart icon */}
            <Heart
              className={cn(
                "h-4 w-4 transition-all duration-300 relative z-10",
                inWishlist ? "text-red-500 fill-red-500" : "text-[#303030]",
                isAnimating && "scale-125",
                isAnimating && inWishlist && "animate-bounce"
              )}
            />
          </div>

          {/* Ripple effect on click */}
          {isAnimating && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
              <span className="absolute inset-0 rounded-full bg-red-300 animate-pulse" />
            </>
          )}
        </Button>
      </div>

      {/* Product details */}
      <div className="px-2 space-y-2 -mt-4">
        <p className="line-clamp-1 text-md font-medium group-hover:text-primary transition-colors duration-300">
          {productData.name}
        </p>
        
        <div className="flex flex-row items-center gap-3">
          <Rate 
            allowHalf 
            disabled 
            value={productData.rating}
            className="text-sm"
          />
          <p className="text-sm text-muted-foreground">({productData.reviews})</p>
        </div>

        <p className="font-bold text-2xl group-hover:text-[#CC5500] transition-colors duration-300">
          ${productData.price.toFixed(2)}
        </p>

        <p className="text-[#8A8A8A] text-sm group-hover:text-foreground transition-colors duration-300">
          {productData.vendor}
        </p>
      </div>
    </Card>
  );
}