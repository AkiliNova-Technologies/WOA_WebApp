import { useParams } from "react-router-dom";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { ProductCard } from "@/components/productCard";
// import { SubCategoryCard } from "@/components/sub-category-card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useCategories } from "@/hooks/useCategories";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { normalizeVendor } from "@/utils/productHelpers";

export default function SubCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { setCategoryBreadcrumbs } = useCategories();
  
  // Use Redux hook
  const {
    publicProducts,
    loading,
    getPublicProducts,
    getProductsByCategory,
  } = useReduxProducts();

  // Fetch products on mount
  useEffect(() => {
    getPublicProducts();
  }, [getPublicProducts]);

  // Update breadcrumbs
  useEffect(() => {
    if (categoryId) {
      setCategoryBreadcrumbs(categoryId);
    }
  }, [categoryId, setCategoryBreadcrumbs]);

  // Get category data from products
  const category = useMemo(() => {
    if (!categoryId) return null;
    
    const categoryProducts = publicProducts.filter(
      p => p.categoryId === categoryId
    );
    
    if (categoryProducts.length === 0) return null;

    const firstProduct = categoryProducts[0];
    
    // Extract unique subcategories
    const subCategoriesMap = new Map();
    categoryProducts.forEach(product => {
      if (product.subcategoryId && product.subcategory) {
        subCategoriesMap.set(product.subcategoryId, {
          id: product.subcategoryId,
          name: product.subcategory.name,
          image: product.images?.[0]?.url || '',
        });
      }
    });

    return {
      id: categoryId,
      name: firstProduct.category?.name || 'Unknown Category',
      subCategories: Array.from(subCategoriesMap.values()),
    };
  }, [categoryId, publicProducts]);

  // Get products for this category
  const products = useMemo(() => {
    if (!categoryId) return [];
    return getProductsByCategory(categoryId);
  }, [categoryId, getProductsByCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Category not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      {/* Category Header */}
      <div className="mb-8 text-center max-w-7xl mx-auto px-6">
        {/* Bread Crumb Section */}
        <div className="flex justify-center">
          <Breadcrumb />
        </div>
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      </div>

      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Subcategories */}
          {category.subCategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category.subCategories.map((subCategory) => (
                  <div
                    key={subCategory.id}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                      {subCategory.image ? (
                        <img
                          src={subCategory.image}
                          alt={subCategory.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-center">
                      {subCategory.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-1 items-center justify-center mb-8">
            <Button
              variant={"secondary"}
              className="h-11 rounded-full w-2xs bg-[#F7F7F7] hover:bg-[#F7F7F7]/80 text-[#303030]"
            >
              Show more (2)
            </Button>
          </div>

          {/* Products */}
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
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
                      categoryId={categoryId}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No products found in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}