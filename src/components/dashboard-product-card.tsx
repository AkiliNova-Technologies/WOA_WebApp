import { Edit, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Rate } from "antd";
import { Badge } from "./ui/badge";
import type { ProductStatus } from "@/types/product";
// import { useNavigate } from "react-router-dom";

interface DashboardProduct {
  id: string;
  image: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  vendor: string;
  status: ProductStatus;
  stockQuantity: number;
  sales: number;
  revenue: number; // Make sure this is required
  createdAt: string;
  category?: string;
  sku?: string;
}

interface DashboardProductCardProps {
  product: DashboardProduct;
  onView?: (product: DashboardProduct) => void;
  onEdit?: (product: DashboardProduct) => void;
  onDelete?: (product: DashboardProduct) => void;
  onToggleStatus?: (product: DashboardProduct) => void;
}

export function DashboardProductCard({
  product,
  onView,
  onEdit,
  onToggleStatus,
}: DashboardProductCardProps) {
  // const navigate = useNavigate();

  const statusConfig = {
    active: {
      label: "Active",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    draft: {
      label: "Draft",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
    },
    "out-of-stock": {
      label: "Out of Stock",
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
    },
    archived: {
      label: "Archived",
      color: "bg-gray-500",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
    },
  };

  const config = statusConfig[product.status] || statusConfig.draft;

  const handleCardClick = () => {
    onView?.(product);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(product);
  };

  const handleQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus?.(product);
  };

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <Card
      className="relative p-2 cursor-pointer border hover:shadow-md transition-all duration-200"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative rounded-lg overflow-hidden w-full">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-48 rounded-lg"
        />
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
            -
            {Math.round(
              ((product.originalPrice! - product.price) /
                product.originalPrice!) *
                100
            )}
            %
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge
            variant="secondary"
            className={`flex items-center gap-1 ${config.bgColor} ${config.textColor} border-0`}
          >
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            {config.label}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleQuickAction}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3 px-2">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{product.vendor}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Rate
            allowHalf
            disabled
            defaultValue={product.rating}
            className="text-sm"
          />
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl">${product.price}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
          <span>Stock: {product.stockQuantity}</span>
          <span>Sales: {product.sales}</span>
        </div>

      </div>
    </Card>
  );
}
