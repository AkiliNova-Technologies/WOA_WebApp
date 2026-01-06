import { useParams } from "react-router-dom";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { ProductCard } from "@/components/productCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useCategories } from "@/hooks/useCategories";
import { useEffect, useCallback, useMemo } from "react";
import { normalizeVendor } from "@/utils/productHelpers";

export default function TypePage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { setCategoryBreadcrumbs } = useCategories();
  
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

  // Get category and products
  const category = useMemo(() => {
    if (!categoryId) return null;
    
    const categoryProducts = publicProducts.filter(
      p => p.categoryId === categoryId
    );
    
    if (categoryProducts.length === 0) return null;
    
    return {
      id: categoryId,
      name: categoryProducts[0].category?.name || 'Unknown Category',
    };
  }, [categoryId, publicProducts]);

  const products = useMemo(() => {
    if (!categoryId) return [];
    return getProductsByCategory(categoryId);
  }, [categoryId, getProductsByCategory]);

  // Extract types from products
  const types = useMemo(() => {
    const typesMap = new Map();
    
    products.forEach(product => {
      if (product.productTypeId && product.productType) {
        typesMap.set(product.productTypeId, {
          id: product.productTypeId,
          name: product.productType.name,
        });
      }
    });
    
    return Array.from(typesMap.values());
  }, [products]);

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
                No products found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}