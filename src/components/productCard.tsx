// components/productCard.tsx
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Rate } from "antd";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import type { Vendor } from "@/types/product";




interface Product {
  id: number | string;
  image: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  vendor: string | Vendor | undefined; // CHANGED FROM 'string' to 'string | Vendor | undefined'
  categoryId?: string;
}

export function ProductCard(product: Product) {
  const navigate = useNavigate();
  const { setCategoryBreadcrumbs } = useCategories();

  const handleCardClick = () => {
    if (product.categoryId) {
      setCategoryBreadcrumbs(product.categoryId);
    }
    navigate(`/category/product/${product.id}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Add to wishlist:", product.id);
  };

  // Helper function to get vendor name safely
  const getVendorName = (): string => {
    if (!product.vendor) return "Unknown Vendor";
    if (typeof product.vendor === 'string') return product.vendor;
    return product.vendor.name || "Unknown Vendor";
  };

  const vendorName = getVendorName();

  return (
    <Card
      className="relative w-3xs p-2 mx-auto shadow-none cursor-pointer border-none hover:shadow-lg transition-all duration-300 group dark:bg-[#303030] overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image container with scale effect */}
      <div className="relative rounded-sm overflow-hidden w-full mb-3">
        <div className="overflow-hidden rounded-sm">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover object-top w-full h-50 rounded-sm transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
        
        {/* Optional gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm" />
      </div>

      {/* Wishlist button - appears on hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
        <Button
          variant={"secondary"}
          className="h-9 w-9 p-0 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-md border border-gray-200"
          onClick={handleWishlistClick}
        >
          <Heart className="h-4 w-4 text-[#303030] hover:text-red-500 transition-colors" />
        </Button>
      </div>

      {/* Product details */}
      <div className="px-2 space-y-2 -mt-4">
        <p className="line-clamp-1 text-md font-medium group-hover:text-primary transition-colors duration-300">
          {product.name}
        </p>

        <div className="flex flex-row items-center gap-3">
          <Rate 
            allowHalf 
            disabled 
            defaultValue={product.rating} 
            className="text-sm"
          />
          <p className="text-sm text-muted-foreground">({product.reviews})</p>
        </div>

        <p className="font-bold text-2xl group-hover:text-[#CC5500] transition-colors duration-300">
          ${product.price}
        </p>

        <p className="text-[#8A8A8A] text-sm group-hover:text-foreground transition-colors duration-300">
          {vendorName} {/* CHANGED FROM product.vendor to vendorName */}
        </p>
      </div>
    </Card>
  );
}