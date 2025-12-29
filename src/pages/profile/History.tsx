import { useEffect } from "react";
import { ActiveFilters } from "@/components/active-filters";
import { FilterSheet } from "@/components/filter-sheet";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import type { SortOption } from "@/types/product";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function HistoryPage() {
  const {
    categories,
    filters,
    sortOption,
    setSortOption,
    updateFilter,
    resetFilters,
    allVendors,
    productionMethods,
  } = useProducts();

  const {
    recentlyViewedProducts,
    recentlyViewedLoading,
    getRecentlyViewedProducts,
    removeFromHistory,
    clearHistory,
  } = useReduxProducts();

  // Fetch recently viewed products on mount
  useEffect(() => {
    getRecentlyViewedProducts();
  }, []);

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

  // Handle removing a single product from history
  const handleRemoveProduct = async (productId: string) => {
    try {
      await removeFromHistory(productId);
      toast.success("Product removed from history");
    } catch (error) {
      toast.error("Failed to remove product from history");
    }
  };

  // Handle clearing all history
  const handleClearHistory = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear your entire viewing history?"
      )
    ) {
      try {
        clearHistory();
        toast.success("History cleared successfully");
      } catch (error) {
        toast.error("Failed to clear history");
      }
    }
  };

  // Apply filters to recently viewed products
  const filteredProducts = recentlyViewedProducts.filter((product) => {
    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.categoryId)
    ) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }
    }

    // Production method filter (if applicable)
    if (filters.productionMethods && filters.productionMethods.length > 0) {
      const productMethod = product.attributes?.productionMethod as
        | string
        | undefined;
      if (
        !productMethod ||
        !filters.productionMethods.includes(productMethod as any)
      ) {
        return false;
      }
    }

    return true;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "most-recent":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="p-6 rounded-md mb-6 bg-[#FFFFFF]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl text-center font-medium flex-1">
            Recently Viewed Products
          </h1>
          {recentlyViewedProducts.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearHistory}
              className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>
        {recentlyViewedProducts.length > 0 && (
          <p className="text-sm text-gray-500 text-center mt-2">
            {recentlyViewedProducts.length}{" "}
            {recentlyViewedProducts.length === 1 ? "product" : "products"} in
            your history
          </p>
        )}
      </div>

      <div className="bg-[#FFFFFF] p-8 rounded-md space-y-6">
        {/* Loading State */}
        {recentlyViewedLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#CC5500] mb-4" />
            <p className="text-gray-500">Loading your viewing history...</p>
          </div>
        ) : recentlyViewedProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No viewing history yet
            </h3>
            <p className="text-gray-500 mb-6">
              Products you view will appear here for easy access later.
            </p>
            <Button
              onClick={() => (window.location.href = "/products")}
              className="bg-[#CC5500] hover:bg-[#b24900]"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <>
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
              products={recentlyViewedProducts}
              filters={filters}
              sortOption={sortOption}
              filteredProductsCount={sortedProducts.length}
              updateFilter={updateFilter}
              resetFilters={resetFilters}
              setSortOption={handleSetSortOption}
            />

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                {sortedProducts.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard
                      id={parseInt(product.id)}
                      name={product.name}
                      rating={Number(product.averageRating) || 0}
                      reviews={Number(product.reviewCount) || 0}
                      price={product.price}
                      vendor={
                        product.vendorName || product.sellerName || "Unknown"
                      }
                      image={product.images?.[0]?.url || ""}
                    />
                    {/* Remove Button Overlay */}
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 z-10"
                      title="Remove from history"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#666] text-lg mb-4">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
