import { useParams } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { ProductCard } from "@/components/productCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { useReduxCategories } from "@/hooks/useReduxCategories";
import { Loader2 } from "lucide-react";

// Helper function to get vendor name from product
const getVendorName = (product: any): string => {
  if (!product) return "Unknown Vendor";
  
  // Check in order of preference
  return product.vendorName || 
         product.sellerName || 
         product.seller?.businessName || 
         (product.seller?.firstName && product.seller?.lastName 
           ? `${product.seller.firstName} ${product.seller.lastName}` 
           : "Unknown Vendor");
};

// Helper function to get product image
const getProductImage = (product: any): string => {
  if (product.image) return product.image;
  
  // Try to get from images array
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find((img: any) => img.isPrimary);
    if (primaryImage?.url) return primaryImage.url;
    if (product.images[0]?.url) return product.images[0].url;
  }
  
  return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
};

// Create a simplified product object for ProductCard
const createProductCardData = (product: any) => {
  const vendorName = getVendorName(product);
  const productImage = getProductImage(product);
  
  return {
    id: product.id,
    name: product.name || "Unknown Product",
    price: product.price || 0,
    compareAtPrice: product.compareAtPrice,
    description: product.description || "",
    averageRating: product.averageRating || 0,
    reviewCount: product.reviewCount || 0,
    images: product.images || [],
    image: productImage,
    categoryId: product.categoryId || "",
    vendorName: vendorName,
    sellerName: vendorName,
    vendor: {
      id: product.vendorId || product.sellerId || "",
      name: vendorName,
      businessName: vendorName
    },
    seller: product.seller,
    // Add required Product type properties
    status: product.status || "active",
    variants: product.variants || [],
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
};

export default function SubCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { setCategoryBreadcrumbs } = useCategories();
  
  // Use Redux hooks for data
  const {
    loading: productsLoading,
    getPublicProducts,
    getProductsByCategory,
  } = useReduxProducts();

  const {
    categories,
    subcategories,
    getCategory,
    getSubcategoriesByCategory,
    loading: categoriesLoading,
    getCategoryName,
  } = useReduxCategories();

  const loading = productsLoading || categoriesLoading;

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (categoryId) {
          // Fetch category data
          await getCategory(categoryId);
          await getSubcategoriesByCategory(categoryId);
          
          // Fetch products for this category
          await getPublicProducts({ 
            categoryId: categoryId,
            limit: 20 
          });
          
          // Set breadcrumbs
          setCategoryBreadcrumbs(categoryId);
        }
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      }
    };
    
    fetchData();
  }, [categoryId, getCategory, getSubcategoriesByCategory, getPublicProducts, setCategoryBreadcrumbs]);

  // Get category from categories data
  const category = useMemo(() => {
    if (!categoryId) return null;
    
    // Find category in categories list
    const categoryData = categories.find(cat => cat.id === categoryId);
    if (!categoryData) return null;

    // Get subcategories for this category
    const categorySubcategories = subcategories.filter(
      (subcat) => subcat.categoryId === categoryId
    );

    return {
      id: categoryId,
      name: categoryData.name || getCategoryName(categoryId),
      description: categoryData.description,
      subCategories: categorySubcategories.map((subCat) => ({
        id: subCat.id,
        name: subCat.name,
        image: subCat.coverImageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
      })),
    };
  }, [categoryId, categories, subcategories, getCategoryName]);

  // Get products for this category
  const products = useMemo(() => {
    if (!categoryId) return [];
    return getProductsByCategory(categoryId);
  }, [categoryId, getProductsByCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#CC5500]" />
        <span className="ml-2">Loading category...</span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Category not found</h2>
        <p className="text-gray-600 mb-6">The category you're looking for doesn't exist or has been removed.</p>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      {/* Category Header */}
      <div className="mb-8 text-center max-w-7xl mx-auto px-6">
        {/* Bread Crumb Section */}
        <div className="flex justify-center mb-4">
          <Breadcrumb />
        </div>
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
        )}
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
                    onClick={() => {
                      // Navigate to subcategory page or filter products
                      console.log(`Navigate to subcategory: ${subCategory.id}`);
                    }}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                      <img
                        src={subCategory.image}
                        alt={subCategory.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
                        }}
                      />
                    </div>
                    <h3 className="text-sm font-medium text-center">
                      {subCategory.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show more button for subcategories (if more than 8) */}
          {category.subCategories.length > 8 && (
            <div className="flex flex-1 items-center justify-center mb-8">
              <Button
                variant={"secondary"}
                className="h-11 rounded-full w-2xs bg-[#F7F7F7] hover:bg-[#F7F7F7]/80 text-[#303030]"
              >
                Show more ({category.subCategories.length - 8})
              </Button>
            </div>
          )}

          {/* Products Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Products</h2>
              <span className="text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </span>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={createProductCardData(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">No products found in this category</p>
                <p className="text-gray-400 text-sm">
                  Check back later or browse other categories
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}