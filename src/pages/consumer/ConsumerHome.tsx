// pages/consumer/ConsumerHome.tsx
import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/productCard";
import { FilterSheet } from "@/components/filter-sheet";
import { ActiveFilters } from "@/components/active-filters";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import type { SortOption } from "@/types/product";
import { getProductImageUrl, normalizeVendor } from "@/utils/productHelpers";

export default function ConsumerHomePage() {
  const {
    products,
    categories,
    filters,
    sortOption,
    setSortOption,
    updateFilter,
    resetFilters,
    filteredProductsCount,
    allVendors,
    productionMethods,
  } = useProducts();

  // Create a wrapper function that converts string to SortOption
  const handleSetSortOption = (value: string) => {
    setSortOption(value as SortOption);
  };

  // Handler functions for active filters
  const handleClearCategory = (categoryId: string) => {
    const newCategories = filters.categories.filter(
      (id: string) => id !== categoryId
    );
    updateFilter("categories", newCategories);
  };

  const handleClearProductionMethod = (method: string) => {
    const newMethods = filters.productionMethods.filter(
      (m: string) => m !== method
    );
    updateFilter("productionMethods", newMethods);
  };

  const handleClearPriceRange = () => {
    updateFilter("priceRange", [0, 1000]);
  };

  const handleClearAll = () => {
    resetFilters();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#121212]">
      {/* Header Section */}
      <div className="mb-8 md:mb-12 bg-[#F7F7F7] flex flex-1 flex-col py-8 w-full">
        <h2 className="text-3xl md:text-4xl text-center mb-2 font-semibold text-[#1A1A1A]">
          Fashion & Apparel
        </h2>
        <p className="text-[#999999] text-center text-sm md:text-base">
          Textiles, Print, Fit - Clothing, Footwear, Headwraps, Kids' Apparel
        </p>
      </div>
      <div className="p-6 md:p-10 w-full max-w-7xl">
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
        <ActiveFilters
          filters={filters}
          categories={categories}
          onClearCategory={handleClearCategory}
          onClearProductionMethod={handleClearProductionMethod}
          onClearPriceRange={handleClearPriceRange}
          onClearAll={handleClearAll}
        />

        {/* Reusable Filter Sheet Component */}
        <FilterSheet
          categories={categories}
          allVendors={allVendors}
          productionMethods={productionMethods}
          products={products}
          filters={filters}
          sortOption={sortOption}
          filteredProductsCount={filteredProductsCount}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          setSortOption={handleSetSortOption} // Use the wrapper function
        />

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={parseInt(product.id)}
                name={product.name}
                price={product.price}
                vendor={normalizeVendor(product.seller) || "Unknown Vendor"}
                image={getProductImageUrl(product.images)}
                rating={product.averageRating}
                reviews={product.reviewCount || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#666] text-lg">
              No products found matching your criteria.
            </p>
            <Button variant="outline" onClick={handleClearAll} className="mt-4">
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
