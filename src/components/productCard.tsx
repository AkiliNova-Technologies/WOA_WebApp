// components/productCard.tsx
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Rate } from "antd";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

interface Product {
  id: number | string;
  image: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  vendor: string;
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
  return (
    <Card
      className="relative w-3xs p-2 mx-auto shadow-none cursor-pointer border-none hover:shadow-lg transition-shadow dark:bg-[#303030]"
      onClick={handleCardClick}
    >
      <div className="relative rounded-sm overflow-hidden w-full">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover object-top w-full h-50 rounded-sm"
        />
      </div>

      <div className="absolute top-3 right-3">
        <Button
          variant={"secondary"}
          className="h-8 w-8 p-0 bg-transparent hover:bg-white rounded-full"
          onClick={handleWishlistClick}
        >
          <Heart className="size-2 h-4 w-4 text-[#303030]" />
        </Button>
      </div>

      <div className="px-2 space-y-2">
        <p className="line-clamp-1 text-md">{product.name}</p>

        <div className="flex flex-row items-center gap-4">
          <Rate allowHalf disabled defaultValue={product.rating} />
          <p>({product.reviews})</p>
        </div>

        <p className="font-bold text-2xl">${product.price}</p>

        <p className="text-[#8A8A8A] text-sm">{product.vendor}</p>
      </div>
    </Card>
  );
}
