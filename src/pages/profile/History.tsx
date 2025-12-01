import { ActiveFilters } from "@/components/active-filters";
import { FilterSheet } from "@/components/filter-sheet";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import type { SortOption } from "@/types/product";

export default function HistoryPage() {
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
    <div className="min-h-screen ">
      {/* Header */}
      <div className=" p-6 rounded-md mb-6 bg-[#FFFFFF]">
        <h1 className="text-2xl text-center font-medium">
          Recently Viewed products
        </h1>
      </div>

      <div className="bg-[#FFFFFF] p-8 rounded-md space-y-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={parseInt(product.id)}
                name={product.name}
                rating={product.rating}
                reviews={product.reviews}
                price={product.price}
                vendor={product.vendor}
                image={product.image}
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
      </div>
    </div>
  );
}
