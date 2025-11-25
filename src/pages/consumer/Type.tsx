import { useParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/productCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useCategories } from "@/hooks/useCategories";
import { useEffect, useCallback, useMemo } from "react";

export default function TypePage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const {
    getCategoryById,
    getProductsByType,
    getTypesByCategory,
  } = useProducts();
  const { setCategoryBreadcrumbs } = useCategories();

  const category = getCategoryById(categoryId!);
  const types = getTypesByCategory(categoryId!);

  // Extract generic type names by removing brand-specific words
  const genericTypes = useMemo(() => {
    return types.map(type => ({
      ...type,
      genericName: extractGenericTypeName(type.name)
    }));
  }, [types]);

  // Get products for display
  const products = useMemo(() => {
    if (types.length > 0) {
      // Combine products from all types in this category
      const allTypeProducts = types.flatMap(type => getProductsByType(type.id));
      // Remove duplicates by product ID
      return [...new Map(allTypeProducts.map(product => [product.id, product])).values()];
    } else {
      return getProductsByType(categoryId!);
    }
  }, [types, getProductsByType, categoryId]);

  const updateBreadcrumbs = useCallback(() => {
    if (categoryId) {
      setCategoryBreadcrumbs(categoryId);
    }
  }, [categoryId, setCategoryBreadcrumbs]);

  useEffect(() => {
    updateBreadcrumbs();
  }, [updateBreadcrumbs]);

  if (!category) {
    return <div>Category not found</div>;
  }

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
        return mostCommonType || `${category.name}`;
      }
    } else {
      return `${category.name}`;
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
                    categoryId={categoryId}
                  />
                ))}
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