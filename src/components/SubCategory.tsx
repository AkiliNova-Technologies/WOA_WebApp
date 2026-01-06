// pages/consumer/SubCategory.tsx
import { useParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/productCard";
import { CategoryCard } from "@/components/category-card";
import { normalizeVendor } from "@/utils/productHelpers";

export default function SubCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getCategoryById, getProductsByCategory } = useProducts();

  const category = getCategoryById(categoryId!);
  const products = getProductsByCategory(categoryId!);

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          <p className="text-gray-600">{category.description}</p>
        </div>

        {/* Subcategories */}
        {category.subCategories.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {category.subCategories.map((subCategory) => (
                <CategoryCard
                  key={subCategory.id}
                  id={parseInt(subCategory.id)}
                  name={subCategory.name}
                  image={subCategory.image}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Products</h2>
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
                  vendor={normalizeVendor(product.seller) || "Unknown Vendor"}
                  image={product.image}
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
  );
}
