import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterState {
  categories: string[];
  subCategories: string[];
  types: string[];
  priceRange: [number, number];
  productionMethods: string[];
  vendors: string[];
  inStock: boolean;
  onSale: boolean;
  minRating: number;
}

interface FilterSheetProps {
  // Data
  categories: Array<{ id: string; name: string }>;
  allVendors: string[];
  productionMethods: string[];
  products: any[];
  
  // State
  filters: FilterState;
  sortOption: string;
  filteredProductsCount: number;
  
  // Actions
  updateFilter: (key: keyof FilterState, value: any) => void;
  resetFilters: () => void;
  setSortOption: (value: string) => void;
  
  // Sort options
  sortOptions?: Array<{ value: string; label: string }>;
  
  // Customization
  title?: string;
  showResultsCount?: boolean;
  showSortDropdown?: boolean;
}

const defaultSortOptions = [
  { value: "most-recent", label: "Most Recent" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
  { value: "newest-arrivals", label: "Newest Arrivals" },
  { value: "rating", label: "Rating" },
];

const priceRanges = [
  { label: "All Price", range: [0, 1000] as [number, number] },
  { label: "Under $20", range: [0, 20] as [number, number] },
  { label: "$25 to $100", range: [25, 100] as [number, number] },
  { label: "$100 to $300", range: [100, 300] as [number, number] },
  { label: "$300 to $500", range: [300, 500] as [number, number] },
  { label: "$500 to $1,000", range: [500, 1000] as [number, number] },
  { label: "$1,000 to $10,000", range: [1000, 10000] as [number, number] },
];

export function FilterSheet({
  categories,
  allVendors,
  productionMethods,
  products,
  filters,
  sortOption,
  filteredProductsCount,
  updateFilter,
  resetFilters,
  setSortOption,
  sortOptions = defaultSortOptions,
  title = "Filter Options",
  showResultsCount = true,
  showSortDropdown = true,
}: FilterSheetProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceInput, setPriceInput] = useState({
    min: filters.priceRange[0],
    max: filters.priceRange[1],
  });

  const handlePriceRangeChange = (value: number[]) => {
    const priceRange: [number, number] = [value[0] || 0, value[1] || 1000];
    updateFilter("priceRange", priceRange);
    setPriceInput({ min: priceRange[0], max: priceRange[1] });
  };

  const handlePriceInputChange = (type: "min" | "max", value: string) => {
    const numValue = parseInt(value) || 0;
    setPriceInput((prev) => ({ ...prev, [type]: numValue }));

    const newRange: [number, number] =
      type === "min" ? [numValue, priceInput.max] : [priceInput.min, numValue];

    updateFilter("priceRange", newRange);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categories;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    updateFilter("categories", newCategories);
  };

  const handleProductionMethodToggle = (method: string) => {
    const currentMethods = filters.productionMethods;
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter((m) => m !== method)
      : [...currentMethods, method];

    updateFilter("productionMethods", newMethods);
  };

  const handleVendorToggle = (vendor: string) => {
    const currentVendors = filters.vendors;
    const newVendors = currentVendors.includes(vendor)
      ? currentVendors.filter((v) => v !== vendor)
      : [...currentVendors, vendor];

    updateFilter("vendors", newVendors);
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    resetFilters();
    setPriceInput({ min: 0, max: 1000 });
  };

  const getSortLabel = (value: string) => {
    return sortOptions.find((option) => option.value === value)?.label || "Most Recent";
  };


  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Filter Button with Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="shadow-none border hover:bg-transparent flex items-center gap-2"
          >
            All filters
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-full sm:max-w-sm p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-[#CC5500] hover:text-[#CC5500]/80"
              >
                Clear all
              </Button>
              <SheetTrigger asChild>
                <button className="text-xl">×</button>
              </SheetTrigger>
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
              Filter by Category
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-[#CC5500] focus:ring-[#CC5500]"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <hr className="my-2" />

          {/* PRICE */}
          <div className="mt-6 mb-8">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
              Filter by Price
            </h3>

            {/* Range Slider */}
            <div className="w-full mb-6">
              <Slider
                value={[filters.priceRange[0], filters.priceRange[1]]}
                onValueChange={handlePriceRangeChange}
                min={0}
                max={1000}
                step={1}
                className="rounded-full"
              />
            </div>

            {/* Min-Max Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Input
                type="number"
                placeholder="Min price"
                value={priceInput.min}
                onChange={(e) =>
                  handlePriceInputChange("min", e.target.value)
                }
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <Input
                type="number"
                placeholder="Max price"
                value={priceInput.max}
                onChange={(e) =>
                  handlePriceInputChange("max", e.target.value)
                }
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Price Ranges */}
            <div className="space-y-3 text-sm">
              {priceRanges.map((range, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="priceGroup"
                    checked={
                      filters.priceRange[0] === range.range[0] &&
                      filters.priceRange[1] === range.range[1]
                    }
                    onChange={() => {
                      updateFilter("priceRange", range.range);
                      setPriceInput({
                        min: range.range[0],
                        max: range.range[1],
                      });
                    }}
                    className="w-4 h-4 text-[#CC5500] focus:ring-[#CC5500]"
                  />
                  {range.label}
                </label>
              ))}
            </div>
          </div>

          <hr className="my-2" />

          {/* PRODUCTION METHOD */}
          <div className="mt-6 mb-8">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
              Filter by Production Method
            </h3>

            <div className="space-y-3 text-sm">
              {productionMethods.map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.productionMethods.includes(method)}
                    onChange={() => handleProductionMethodToggle(method)}
                    className="w-4 h-4 text-[#CC5500] focus:ring-[#CC5500]"
                  />
                  {method.charAt(0).toUpperCase() +
                    method.slice(1).replace("-", " ")}
                </label>
              ))}
            </div>
          </div>

          <hr className="my-2" />

          {/* VENDORS */}
          {allVendors.length > 0 && (
            <div className="mt-6 mb-8">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
                Filter by Vendor
              </h3>

              <div className="space-y-3 text-sm">
                {allVendors.map((vendor) => (
                  <label
                    key={vendor}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.vendors.includes(vendor)}
                      onChange={() => handleVendorToggle(vendor)}
                      className="w-4 h-4 text-[#CC5500] focus:ring-[#CC5500]"
                    />
                    {vendor}
                  </label>
                ))}
              </div>
            </div>
          )}

          <hr className="my-2" />

          {/* ADDITIONAL FILTERS */}
          <div className="mt-6 mb-8">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
              Additional Filters
            </h3>

            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) =>
                    updateFilter("inStock", e.target.checked)
                  }
                  className="w-4 h-4 text-[#CC5500] focus:ring-[#CC5500]"
                />
                In Stock Only
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onSale}
                  onChange={(e) => updateFilter("onSale", e.target.checked)}
                  className="w-4 h-4 text-[#CC5500] focus:ring-[#CC5500]"
                />
                On Sale
              </label>
            </div>
          </div>

          {/* RATING FILTER */}
          <div className="mt-6 mb-8">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
              Minimum Rating
            </h3>

            <div className="space-y-3 text-sm">
              {[4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="ratingGroup"
                    checked={filters.minRating === rating}
                    onChange={() => updateFilter("minRating", rating)}
                    className="w-4 h-4 text-[#CC5500] focus:ring-[#CC5500]"
                  />
                  {rating}+ Stars
                </label>
              ))}
            </div>
          </div>

          {/* APPLY BUTTON */}
          <Button
            className="w-full bg-[#CC5500] hover:bg-[#CC5500]/90 text-white py-3 rounded-lg"
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </SheetContent>
      </Sheet>

      {/* Results Count and Sort Dropdown */}
      {(showResultsCount || showSortDropdown) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
          {showResultsCount && (
            <p className="text-[#303030] text-sm">
              Showing 1 - {products.length} of{" "}
              <span className="font-bold">{filteredProductsCount} results</span>
            </p>
          )}

          {/* Sort Dropdown */}
          {showSortDropdown && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {getSortLabel(sortOption)}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup
                  value={sortOption}
                  onValueChange={setSortOption}
                >
                  {sortOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}