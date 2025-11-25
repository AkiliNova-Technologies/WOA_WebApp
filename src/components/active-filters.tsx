import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveFiltersProps {
  filters: any;
  categories: Array<{ id: string; name: string }>;
  onClearCategory: (categoryId: string) => void;
  onClearProductionMethod: (method: string) => void;
  onClearPriceRange: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  categories,
  onClearCategory,
  onClearProductionMethod,
  onClearPriceRange,
  onClearAll,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.subCategories.length > 0 ||
    filters.types.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    filters.productionMethods.length > 0 ||
    filters.vendors.length > 0 ||
    filters.inStock ||
    filters.onSale ||
    filters.minRating > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center">
      <span className="text-sm text-[#666]">Active filters:</span>
      {filters.categories.map((categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? (
          <div
            key={categoryId}
            className="bg-[#CC5500] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {category.name}
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={() => onClearCategory(categoryId)}
            />
          </div>
        ) : null;
      })}
      {filters.productionMethods.map((method: string) => (
        <div
          key={method}
          className="bg-[#CC5500] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
        >
          {method}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onClearProductionMethod(method)}
          />
        </div>
      ))}
      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
        <div className="bg-[#CC5500] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
          ${filters.priceRange[0]} - ${filters.priceRange[1]}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={onClearPriceRange}
          />
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-[#CC5500] hover:text-[#CC5500]/80 hover:bg-transparent"
      >
        Clear all
      </Button>
    </div>
  );
}