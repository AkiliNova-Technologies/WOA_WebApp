import { useParams } from "react-router-dom";
// Comment out Redux hook
// import { useReduxProducts } from "@/hooks/useReduxProducts";

// Import mock hooks
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductCard } from "@/components/productCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useEffect, useCallback, useMemo } from "react";

// Helper function to get vendor name
const getVendorName = (vendor: string | { id?: string; name?: string } | undefined): string => {
  if (!vendor) return "Unknown Vendor";
  if (typeof vendor === 'string') return vendor;
  return vendor.name || "Unknown Vendor";
};

export default function TypePage() {
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
    getTypesByCategory
  } = useProducts();

  // Mock loading state
  const loading = false;

  // Get category from mock data
  const category = useMemo(() => {
    if (!categoryId) return null;
    
    const categoryData = getCategoryById(categoryId);
    if (!categoryData) return null;

    return {
      id: categoryId,
      name: categoryData.name,
    };
  }, [categoryId, getCategoryById]);

  // Get products for this category
  const products = useMemo(() => {
    if (!categoryId) return [];
    return getProductsByCategory(categoryId);
  }, [categoryId, getProductsByCategory]);

  // Get types for this category from mock data
  const types = useMemo(() => {
    if (!categoryId) return [];
    return getTypesByCategory(categoryId);
  }, [categoryId, getTypesByCategory]);

  // Extract generic type names by removing brand-specific words
  const genericTypes = useMemo(() => {
    return types.map(type => ({
      ...type,
      genericName: extractGenericTypeName(type.name)
    }));
  }, [types]);

  const updateBreadcrumbs = useCallback(() => {
    if (categoryId) {
      setCategoryBreadcrumbs(categoryId);
    }
  }, [categoryId, setCategoryBreadcrumbs]);

  useEffect(() => {
    updateBreadcrumbs();
  }, [updateBreadcrumbs]);

  // Function to extract generic type names
  function extractGenericTypeName(typeName: string): string {
    // Remove common brand-specific prefixes and suffixes
    const genericName = typeName
      .replace(/\b(Kente|Ankara|African|Traditional|Modern|Casual|Formal|Designer|Premium)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // If we ended up with an empty string, return the original
    return genericName || typeName;
  }

  // Determine the header title based on generic type names
  const getHeaderTitle = () => {
    if (genericTypes.length > 0) {
      const uniqueGenericNames = [...new Set(genericTypes.map(type => type.genericName))];
      
      if (uniqueGenericNames.length === 1) {
        return uniqueGenericNames[0]; // Single generic type: "Dresses"
      } else {
        // For multiple types, show the most common one or a general title
        const mostCommonType = getMostCommonGenericType(genericTypes);
        return mostCommonType || `${category?.name || ''}`;
      }
    } else {
      return `${category?.name || ''}`;
    }
  };

  // Helper function to find the most common generic type
  function getMostCommonGenericType(types: Array<{ genericName: string }>): string {
    const frequency: Record<string, number> = {};
    
    types.forEach(type => {
      frequency[type.genericName] = (frequency[type.genericName] || 0) + 1;
    });

    let mostCommon = '';
    let maxCount = 0;

    Object.entries(frequency).forEach(([name, count]) => {
      if (count > maxCount) {
        mostCommon = name;
        maxCount = count;
      }
    });

    return mostCommon;
  }

  const headerTitle = getHeaderTitle();

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
        <div className="flex justify-center">
          <Breadcrumb />
        </div>
        <h1 className="text-3xl font-bold mb-2">{headerTitle}</h1>
      </div>

      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Products Section */}
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  const vendorName = getVendorName(product.vendor);
                  const productImage = product.images && product.images.length > 0 
                    ? product.images[0]
                    : product.image || '';
                  
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
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No products found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}