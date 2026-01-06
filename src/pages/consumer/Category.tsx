import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { normalizeVendor } from "@/utils/productHelpers";
import { useState, useEffect } from "react";

export default function CategoryPage() {
  // Use Redux hook instead of useProducts
  const {
    publicProducts,
    loading,
    getPublicProducts,
  } = useReduxProducts();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>("most-recent");
  const [filters, setFilters] = useState({
    categories: [] as string[],
    subCategories: [] as string[],
    types: [] as string[],
    priceRange: [0, 1000] as [number, number],
    productionMethods: [] as string[],
    vendors: [] as string[],
    inStock: false,
    onSale: false,
    minRating: 0,
  });
  const [priceInput, setPriceInput] = useState({
    min: 0,
    max: 1000,
  });

  // Fetch products on mount
  useEffect(() => {
    getPublicProducts();
  }, [getPublicProducts]);

  // Extract unique categories from products with null checks
  const categories = Array.from(
    new Set(
      publicProducts
        .filter(p => p.categoryId)
        .map(p => JSON.stringify({
          id: p.categoryId || '',
          name: p.category?.name || 'Unknown',
          image: p.images?.[0]?.url || '',
        }))
    )
  ).map(str => JSON.parse(str));

  // Extract unique vendors with null checks
  const allVendors = Array.from(
    new Set(
      publicProducts
        .filter(p => p.seller?.firstName && p.seller?.lastName)
        .map(p => {
          const seller = p.seller!;
          return seller.businessName || `${seller.firstName} ${seller.lastName}`.trim();
        })
    )
  );

  // Extract unique production methods (if available in your product data)
  const productionMethods = ["handmade", "machine-made", "sustainable"]; // Placeholder

  // Apply filters to products
  const filteredProducts = publicProducts.filter((product) => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.categoryId || '')) {
      return false;
    }

    // Subcategory filter
    if (filters.subCategories.length > 0 && !filters.subCategories.includes(product.subcategoryId || '')) {
      return false;
    }

    // Price filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }

    // Vendor filter
    if (filters.vendors.length > 0) {
      const seller = product.seller;
      if (!seller) return false;
      
      const sellerName = seller.businessName || `${seller.firstName} ${seller.lastName}`.trim();
      if (!filters.vendors.includes(sellerName)) {
        return false;
      }
    }

    // Stock filter
    if (filters.inStock && !product.variants.some(v => v.isActive && v.stockQuantity > 0)) {
      return false;
    }

    // Rating filter
    if (filters.minRating > 0 && product.averageRating < filters.minRating) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "rating":
        return b.averageRating - a.averageRating;
      case "popularity":
        // Since reviews property doesn't exist, use viewCount or default to 0
        return (b.viewCount || 0) - (a.viewCount || 0);
      case "newest-arrivals":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "most-recent":
      default:
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    }
  });

  const sortOptions = [
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

  const getSortLabel = (value: string) => {
    return (
      sortOptions.find((option) => option.value === value)?.label ||
      "Most Recent"
    );
  };

  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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

  const resetFilters = () => {
    setFilters({
      categories: [],
      subCategories: [],
      types: [],
      priceRange: [0, 1000],
      productionMethods: [],
      vendors: [],
      inStock: false,
      onSale: false,
      minRating: 0,
    });
    setPriceInput({ min: 0, max: 1000 });
  };

  const clearAllFilters = () => {
    resetFilters();
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center">
      <div className="p-6 md:p-10 w-full max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl text-center mb-2 font-semibold text-[#1A1A1A]">
            Fashion & Apparel
          </h2>
          <p className="text-[#999999] text-center text-sm md:text-base">
            Textiles, Print, Fit - Clothing, Footwear, Headwraps, Kids' Apparel
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={parseInt(category.id)}
              name={category.name}
              image={category.image}
            />
          ))}
        </div>

        <div className="flex flex-1 items-center justify-center mb-8">
          <Button
            variant={"secondary"}
            className="h-11 rounded-full w-2xs bg-[#F7F7F7] hover:bg-[#F7F7F7]/80 text-[#303030]"
          >
            Show more (2)
          </Button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-[#666]">Active filters:</span>
            {filters.categories.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId);
              return category ? (
                <div
                  key={categoryId}
                  className="bg-[#CC5500] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {category.name}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleCategoryToggle(categoryId)}
                  />
                </div>
              ) : null;
            })}
            {filters.productionMethods.map((method) => (
              <div
                key={method}
                className="bg-[#CC5500] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {method}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleProductionMethodToggle(method)}
                />
              </div>
            ))}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
              <div className="bg-[#CC5500] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    updateFilter("priceRange", [0, 1000]);
                    setPriceInput({ min: 0, max: 1000 });
                  }}
                />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-[#CC5500] hover:text-[#CC5500]/80 hover:bg-transparent"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Filters and Sort Section */}
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
                <h2 className="text-xl font-semibold">Filter Options</h2>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <p className="text-[#303030] text-sm">
              Showing 1 - {sortedProducts.length} of{" "}
              <span className="font-bold">{filteredProducts.length} results</span>
            </p>

            {/* Sort Dropdown */}
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
                  onValueChange={(value) => setSortOption(value)}
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
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product) => {
              // Normalize vendor with proper null checks
              const normalizedVendor = normalizeVendor(product.seller);
              
              return (
                <ProductCard
                  key={product.id}
                  id={parseInt(product.id)}
                  name={product.name}
                  rating={product.averageRating}
                  reviews={product.reviewCount || 0}
                  price={product.price}
                  vendor={normalizedVendor || 'Unknown Vendor'}
                  image={product.images?.[0]?.url || ''}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#666] text-lg">
              No products found matching your criteria.
            </p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="mt-4"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination section */}
        <div className="flex justify-center mt-8 md:mt-12">
          {/* Pagination component can be added here */}
        </div>
      </div>
    </div>
  );
}