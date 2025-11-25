import { useParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/productCard";
import { SubCategoryCard } from "@/components/sub-category-card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useCategories } from "@/hooks/useCategories";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SubCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getCategoryById, getProductsByCategory } = useProducts();
  const { setCategoryBreadcrumbs } = useCategories();

  const category = getCategoryById(categoryId!);
  const products = getProductsByCategory(categoryId!);

  useEffect(() => {
    if (categoryId) {
      setCategoryBreadcrumbs(categoryId);
    }
  }, [categoryId, setCategoryBreadcrumbs]);

  if (!category) {
    return <div>Category not found</div>;
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category.subCategories.map((subCategory) => (
                  <SubCategoryCard
                    key={subCategory.id}
                    id={parseInt(subCategory.id)}
                    name={subCategory.name}
                    image={subCategory.image}
                  />
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
                No products found in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
