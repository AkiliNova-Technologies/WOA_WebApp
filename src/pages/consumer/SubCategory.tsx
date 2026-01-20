import { useParams } from "react-router-dom";
// Comment out Redux hook
// import { useReduxProducts } from "@/hooks/useReduxProducts";

// Import mock data hooks
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductCard } from "@/components/productCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";

// Helper function to get vendor name
const getVendorName = (vendor: string | { id?: string; name?: string } | undefined): string => {
  if (!vendor) return "Unknown Vendor";
  if (typeof vendor === 'string') return vendor;
  return vendor.name || "Unknown Vendor";
};

export default function SubCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { setCategoryBreadcrumbs } = useCategories();
  
  // Use mock data hook instead of Redux
  // const {
  //   publicProducts,
  //   loading,
  //   getPublicProducts,
  //   getProductsByCategory,
  // } = useReduxProducts();

  const { 
    // products: publicProducts,
    getProductsByCategory,
    getCategoryById,
    // getSubCategoryById
  } = useProducts();

  // Mock loading state
  const loading = false;

  // Get category from mock data
  const category = useMemo(() => {
    if (!categoryId) return null;
    
    const categoryData = getCategoryById(categoryId);
    if (!categoryData) return null;

    // Get subcategories from the category data
    const subCategories = categoryData.subCategories.map(subCat => ({
      id: subCat.id,
      name: subCat.name,
      image: subCat.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
    }));

    return {
      id: categoryId,
      name: categoryData.name,
      subCategories: subCategories,
    };
  }, [categoryId, getCategoryById]);

  // Get products for this category
  const products = useMemo(() => {
    if (!categoryId) return [];
    return getProductsByCategory(categoryId);
  }, [categoryId, getProductsByCategory]);

  // Update breadcrumbs
  useEffect(() => {
    if (categoryId) {
      setCategoryBreadcrumbs(categoryId);
    }
  }, [categoryId, setCategoryBreadcrumbs]);

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
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
                          }}
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
                  const vendorName = getVendorName(product.vendor);
                  const productImage = product.images && product.images.length > 0 
                    ? product.images[0]
                    : product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
                  
                  return (
                    <ProductCard
                      key={product.id}
                      id={parseInt(product.id)}
                      name={product.name}
                      rating={product.rating || 0}
                      reviews={product.reviews || 0}
                      price={product.price}
                      vendor={vendorName}
                      image={productImage}
                      categoryId={categoryId}
                      // originalPrice={product.originalPrice}
                      // isOnSale={product.isOnSale}
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