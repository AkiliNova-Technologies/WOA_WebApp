import { useState, useMemo } from "react";
import type {
  Product,
  Category,
  SubCategory,
  FilterState,
  SortOption,
  ProductionMethod,
  SubCategoryType,
  ProductStatus,
  Vendor,
} from "@/types/product";
import images from "@/assets/images";

const getVendorName = (vendor: string | Vendor | undefined): string => {
  if (!vendor) return "";
  if (typeof vendor === 'string') return vendor;
  // Use 'name' property from Vendor type
  return vendor.name || "";
};

export function useProducts() {
  // State for all data
  const [products, setProducts] = useState<Product[]>([
    // Women's Fashion products
    {
      id: "1",
      name: "Colorful Bolga Shirt",
      description:
        "Perfect for complete traditional outfits with vibrant colors and patterns",
      price: 35,
      originalPrice: 45,
      rating: 4.5,
      reviews: 15,
      vendor: "Kente Galleria",
      image: images.Product1,
      images: [images.Product1, images.Product2],
      categoryId: "1", // Women's Fashion
      subCategoryId: "1-1",
      subCategoryTypeId: "1-1-1",
      tags: ["traditional", "colorful", "handwoven"],
      inStock: true,
      stockQuantity: 50,
      isFeatured: true,
      isOnSale: true,
      createdAt: "2024-01-15T14:30:00.000Z",
      updatedAt: "2024-01-15T14:30:00.000Z",
      specifications: {
        material: "Cotton",
        care: "Hand wash cold",
        origin: "Ghana",
      },
      productionMethod: "handwoven",
      status: "active" as ProductStatus,
      sales: 25,
      variants: [
        {
          id: "1-1",
          name: "Medium - Red",
          price: 35,
          inStock: true,
          stockQuantity: 20,
          attributes: { size: "M", color: "Red" },
        },
        {
          id: "1-2",
          name: "Large - Blue",
          price: 35,
          inStock: true,
          stockQuantity: 30,
          attributes: { size: "L", color: "Blue" },
        },
      ],
    },
    {
      id: "2",
      name: "Handwoven Tshirt",
      description: "Perfect for casual occasions with traditional patterns",
      price: 25,
      rating: 4.0,
      reviews: 12,
      vendor: "Zawadi Imports",
      image: images.Product2,
      images: [images.Product2],
      categoryId: "1", // Women's Fashion
      subCategoryId: "1-1",
      subCategoryTypeId: "1-1-2",
      tags: ["casual", "handwoven", "traditional"],
      inStock: true,
      stockQuantity: 75,
      isFeatured: false,
      isOnSale: false,
      createdAt: "2024-01-10T09:15:00.000Z",
      updatedAt: "2024-01-10T09:15:00.000Z",
      specifications: {
        material: "Cotton blend",
        care: "Machine wash cold",
        origin: "Kenya",
      },
      productionMethod: "handwoven",
      status: "active" as ProductStatus,
      sales: 18,
    },
    {
      id: "3",
      name: "Traditional Ankara Dress",
      description: "Beautiful traditional dress with Ankara patterns",
      price: 45,
      originalPrice: 55,
      rating: 4.8,
      reviews: 20,
      vendor: "African Elegance",
      image: images.Product3,
      images: [images.Product3],
      categoryId: "1", // Women's Fashion
      subCategoryId: "1-1",
      subCategoryTypeId: "1-1-2",
      tags: ["dress", "ankara", "traditional"],
      inStock: true,
      stockQuantity: 30,
      isFeatured: true,
      isOnSale: true,
      createdAt: "2024-01-20T10:00:00.000Z",
      updatedAt: "2024-01-20T10:00:00.000Z",
      specifications: {
        material: "Ankara fabric",
        care: "Hand wash cold",
        origin: "Nigeria",
      },
      productionMethod: "custom-tailored",
      status: "active" as ProductStatus,
      sales: 32,
    },

    // Men's Fashion products
    {
      id: "4",
      name: "Men's Kente Shirt",
      description: "Elegant traditional shirt for men with Kente patterns",
      price: 40,
      originalPrice: 50,
      rating: 4.6,
      reviews: 18,
      vendor: "Kente Galleria",
      image: images.Product4,
      images: [images.Product4],
      categoryId: "2", // Men's Fashion
      subCategoryId: "2-1",
      subCategoryTypeId: undefined,
      tags: ["men", "kente", "traditional", "shirt"],
      inStock: true,
      stockQuantity: 40,
      isFeatured: true,
      isOnSale: false,
      createdAt: "2024-01-12T14:30:00.000Z",
      updatedAt: "2024-01-12T14:30:00.000Z",
      specifications: {
        material: "Cotton",
        care: "Machine wash cold",
        origin: "Ghana",
      },
      productionMethod: "handwoven",
      status: "active" as ProductStatus,
      sales: 22,
    },
    {
      id: "5",
      name: "African Print Men's Shirt",
      description: "Casual shirt with vibrant African prints",
      price: 35,
      rating: 4.3,
      reviews: 14,
      vendor: "Zawadi Imports",
      image: images.Product5,
      images: [images.Product5],
      categoryId: "2", // Men's Fashion
      subCategoryId: "2-1",
      subCategoryTypeId: undefined,
      tags: ["men", "casual", "african print"],
      inStock: true,
      stockQuantity: 60,
      isFeatured: false,
      isOnSale: false,
      createdAt: "2024-01-08T09:15:00.000Z",
      updatedAt: "2024-01-08T09:15:00.000Z",
      specifications: {
        material: "Cotton blend",
        care: "Machine wash cold",
        origin: "Kenya",
      },
      productionMethod: "handwoven",
      status: "draft" as ProductStatus,
      sales: 0,
    },

    // Kid's Fashion products
    {
      id: "6",
      name: "Children's Traditional Outfit",
      description: "Adorable traditional outfit for children",
      price: 25,
      originalPrice: 30,
      rating: 4.7,
      reviews: 12,
      vendor: "Little Africa",
      image: images.Product6,
      images: [images.Product6],
      categoryId: "3", // Kid's Fashion
      subCategoryId: "",
      subCategoryTypeId: undefined,
      tags: ["children", "traditional", "outfit"],
      inStock: true,
      stockQuantity: 25,
      isFeatured: true,
      isOnSale: true,
      createdAt: "2024-01-18T11:30:00.000Z",
      updatedAt: "2024-01-18T11:30:00.000Z",
      specifications: {
        material: "Cotton",
        care: "Machine wash gentle",
        origin: "Ghana",
      },
      productionMethod: "custom-tailored",
      status: "active" as ProductStatus,
      sales: 15,
    },

    // Footwear products
    {
      id: "7",
      name: "Handmade Leather Sandals",
      description: "Comfortable handmade leather sandals with traditional patterns",
      price: 55,
      originalPrice: 65,
      rating: 4.4,
      reviews: 16,
      vendor: "African Crafts",
      image: images.Product7,
      images: [images.Product7],
      categoryId: "4", // Footwear
      subCategoryId: "",
      subCategoryTypeId: undefined,
      tags: ["footwear", "sandals", "leather", "handmade"],
      inStock: true,
      stockQuantity: 35,
      isFeatured: false,
      isOnSale: true,
      createdAt: "2024-01-14T13:45:00.000Z",
      updatedAt: "2024-01-14T13:45:00.000Z",
      specifications: {
        material: "Genuine leather",
        care: "Wipe clean",
        origin: "Ethiopia",
      },
      productionMethod: "hand-carved",
      status: "active" as ProductStatus,
      sales: 28,
    },

    // Headwear & Wraps products
    {
      id: "8",
      name: "Traditional Headwrap",
      description: "Beautiful traditional headwrap with vibrant colors",
      price: 20,
      rating: 4.9,
      reviews: 25,
      vendor: "African Elegance",
      image: images.Product8,
      images: [images.Product8],
      categoryId: "5", // Headwear & Wraps
      subCategoryId: "",
      subCategoryTypeId: undefined,
      tags: ["headwear", "wrap", "traditional", "colorful"],
      inStock: true,
      stockQuantity: 50,
      isFeatured: true,
      isOnSale: false,
      createdAt: "2024-01-16T16:20:00.000Z",
      updatedAt: "2024-01-16T16:20:00.000Z",
      specifications: {
        material: "Cotton",
        care: "Hand wash cold",
        origin: "Nigeria",
      },
      productionMethod: "handwoven",
      status: "archived" as ProductStatus,
      sales: 15,
    },
  ]);

  const [categories] = useState<Category[]>([
    {
      id: "1",
      name: "Women's Fashion",
      description: "Traditional and contemporary women's clothing",
      image: images.SubCategory3,
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      subCategories: [
        {
          id: "1-1",
          name: "Dresses",
          description: "Traditional and modern dresses",
          image: images.SubCategory3,
          categoryId: "1",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          types: [
            {
              id: "1-1-1",
              name: "Kente Dresses",
              description: "Traditional Kente cloth dresses",
              subCategoryId: "1-1",
              isActive: true,
              createdAt: "2024-01-01T00:00:00.000Z",
            },
            {
              id: "1-1-2",
              name: "Ankara Dresses",
              description: "Modern Ankara fabric dresses",
              subCategoryId: "1-1",
              isActive: true,
              createdAt: "2024-01-01T00:00:00.000Z",
            },
          ],
        },
        {
          id: "1-2",
          name: "Tops & Blouses",
          description: "Traditional tops and blouses",
          image: images.SubCategory3,
          categoryId: "1",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          types: [],
        },
      ],
    },
    {
      id: "2",
      name: "Men's Fashion",
      description: "Traditional and contemporary men's clothing",
      image: images.SubCategory2,
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      subCategories: [
        {
          id: "2-1",
          name: "Shirts",
          description: "Traditional men's shirts",
          image: images.SubCategory2,
          categoryId: "2",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          types: [],
        },
      ],
    },
    {
      id: "3",
      name: "Kid's Fashion",
      description: "Traditional clothing for children",
      image: images.SubCategory5,
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      subCategories: [],
    },
    {
      id: "4",
      name: "Footwear",
      description: "Traditional and contemporary footwear",
      image: images.SubCategory1,
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      subCategories: [],
    },
    {
      id: "5",
      name: "Headwear & Wraps",
      description: "Traditional headwear and wraps",
      image: images.SubCategory4,
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      subCategories: [],
    },
  ]);

  /**
   * Get types by category ID
   */
  const getTypesByCategory = (categoryId: string): SubCategoryType[] => {
    const category = getCategoryById(categoryId);
    if (!category) return [];

    // Flatten all types from all subcategories in this category
    const allTypes: SubCategoryType[] = [];
    category.subCategories.forEach((subCategory) => {
      if (subCategory.types && subCategory.types.length > 0) {
        allTypes.push(...subCategory.types);
      }
    });

    return allTypes;
  };

  /**
   * Get types by subcategory ID
   */
  const getTypesBySubCategory = (subCategoryId: string): SubCategoryType[] => {
    const subCategory = getSubCategoryById(subCategoryId);
    return subCategory?.types || [];
  };

  /**
   * Get type by ID
   */
  const getTypeById = (typeId: string): SubCategoryType | undefined => {
    for (const category of categories) {
      for (const subCategory of category.subCategories) {
        const type = subCategory.types?.find((t) => t.id === typeId);
        if (type) return type;
      }
    }
    return undefined;
  };

  /**
   * Get products by type ID
   */
  const getProductsByType = (typeId: string): Product[] => {
    return products.filter((product) => product.subCategoryTypeId === typeId);
  };

  /**
   * Get products by category ID with optional type filtering
   */
  const getProductsByCategoryWithTypes = (
    categoryId: string,
    typeIds?: string[]
  ): Product[] => {
    let categoryProducts = getProductsByCategory(categoryId);

    if (typeIds && typeIds.length > 0) {
      categoryProducts = categoryProducts.filter(
        (product) =>
          product.subCategoryTypeId &&
          typeIds.includes(product.subCategoryTypeId)
      );
    }

    return categoryProducts;
  };

  /**
   * Get all available types across all categories (for filtering)
   */
  const getAllTypes = (): SubCategoryType[] => {
    const allTypes: SubCategoryType[] = [];

    categories.forEach((category) => {
      category.subCategories.forEach((subCategory) => {
        if (subCategory.types && subCategory.types.length > 0) {
          allTypes.push(...subCategory.types);
        }
      });
    });

    return allTypes;
  };

  /**
   * Get category hierarchy for a given type
   */
  const getCategoryHierarchyForType = (
    typeId: string
  ): {
    category: Category;
    subCategory: SubCategory;
    type: SubCategoryType;
  } | null => {
    for (const category of categories) {
      for (const subCategory of category.subCategories) {
        const type = subCategory.types?.find((t) => t.id === typeId);
        if (type) {
          return { category, subCategory, type };
        }
      }
    }
    return null;
  };

  /**
   * Get popular types (types with most products)
   */
  const getPopularTypes = (
    limit: number = 10
  ): Array<SubCategoryType & { productCount: number }> => {
    const allTypes = getAllTypes();

    const typesWithCounts = allTypes.map((type) => ({
      ...type,
      productCount: getProductsByType(type.id).length,
    }));

    return typesWithCounts
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, limit);
  };

  /**
   * Get types with product counts for a specific category
   */
  const getTypesWithProductCounts = (
    categoryId: string
  ): Array<SubCategoryType & { productCount: number }> => {
    const types = getTypesByCategory(categoryId);

    return types.map((type) => ({
      ...type,
      productCount: getProductsByType(type.id).length,
    }));
  };

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subCategories: [],
    types: [],
    priceRange: [0, 1000],
    productionMethods: [],
    vendors: [],
    inStock: false,
    onSale: false,
    minRating: 0,
  });

  const [sortOption, setSortOption] = useState<SortOption>("most-recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Derived data and computed values
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.categoryId)
      );
    }

    // Subcategory filter
    if (filters.subCategories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.subCategories.includes(product.subCategoryId)
      );
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.subCategoryTypeId &&
          filters.types.includes(product.subCategoryTypeId)
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Production method filter
    if (filters.productionMethods.length > 0) {
      filtered = filtered.filter((product) =>
        filters.productionMethods.includes(product.productionMethod)
      );
    }

    // Vendor filter - FIXED LINE 621
    if (filters.vendors.length > 0) {
      filtered = filtered.filter((product) =>
        filters.vendors.includes(getVendorName(product.vendor))
      );
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter((product) => product.inStock);
    }

    // On sale filter
    if (filters.onSale) {
      filtered = filtered.filter((product) => product.isOnSale);
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(
        (product) => product.rating >= filters.minRating
      );
    }

    return filtered;
  }, [products, filters, searchQuery]);

  const sortedProducts = useMemo(() => {
    const productsToSort = [...filteredProducts];

    switch (sortOption) {
      case "price-low-high":
        return productsToSort.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return productsToSort.sort((a, b) => b.price - a.price);
      case "popularity":
        return productsToSort.sort((a, b) => b.reviews - a.reviews);
      case "rating":
        return productsToSort.sort((a, b) => b.rating - a.rating);
      case "newest-arrivals":
        return productsToSort.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "most-recent":
      default:
        return productsToSort.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  }, [filteredProducts, sortOption]);

  // Helper methods
  const getProductById = (productId: string): Product | undefined => {
    return products.find((product) => product.id === productId);
  };

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find((category) => category.id === categoryId);
  };

  const getSubCategoryById = (
    subCategoryId: string
  ): SubCategory | undefined => {
    for (const category of categories) {
      const subCategory = category.subCategories.find(
        (sc) => sc.id === subCategoryId
      );
      if (subCategory) return subCategory;
    }
    return undefined;
  };

  const getProductsByCategory = (categoryId: string): Product[] => {
    return products.filter((product) => product.categoryId === categoryId);
  };

  const getProductsBySubCategory = (subCategoryId: string): Product[] => {
    return products.filter(
      (product) => product.subCategoryId === subCategoryId
    );
  };

  const getFeaturedProducts = (): Product[] => {
    return products.filter((product) => product.isFeatured);
  };

  const getOnSaleProducts = (): Product[] => {
    return products.filter((product) => product.isOnSale);
  };

  const getVendors = (): string[] => {
    const vendorNames = products.map((product) => getVendorName(product.vendor));
    return Array.from(new Set(vendorNames.filter(name => name !== "")));
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, ...updates } : product
      )
    );
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              stockQuantity: newStock,
              inStock: newStock > 0,
            }
          : product
      )
    );
  };

  const addProduct = (
    newProduct: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    const product: Product = {
      ...newProduct,
      id: `product-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: "",
      description: "",
      price: 0,
      rating: 0,
      reviews: 0,
      vendor: "",
      image: "",
      images: [],
      categoryId: "",
      subCategoryId: "",
      tags: [],
      inStock: false,
      stockQuantity: 0,
      isFeatured: false,
      isOnSale: false,
      specifications: {},
      productionMethod: "handwoven",
      status: "active",
      sales: 0
    };
    setProducts((prev) => [...prev, product]);
  };

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  // Filter management
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      subCategories: [],
      types: [],
      priceRange: [0, 1000],
      productionMethods: [],
      vendors: [],
      inStock: false,
      onSale: false,
      minRating: 0,
    });
  };

  return {
    // Data
    products: sortedProducts,
    categories,

    // State
    filters,
    sortOption,
    searchQuery,

    // Actions
    setSortOption,
    setSearchQuery,
    updateFilter,
    resetFilters,

    // Product management
    getProductById,
    updateProduct,
    updateProductStock,
    addProduct,
    removeProduct,

    // Category management
    getCategoryById,
    getSubCategoryById,
    getProductsByCategory,
    getProductsBySubCategory,

    // Special collections
    getFeaturedProducts,
    getOnSaleProducts,
    getVendors,

    // Statistics
    totalProducts: products.length,
    filteredProductsCount: filteredProducts.length,

    // Add these new type-related functions:
    getTypesByCategory,
    getTypesBySubCategory,
    getTypeById,
    getProductsByType,
    getProductsByCategoryWithTypes,
    getAllTypes,
    getCategoryHierarchyForType,
    getPopularTypes,
    getTypesWithProductCounts,

    // You might also want to add these computed values:
    allTypes: getAllTypes(),

    // Helper values
    allVendors: getVendors(),
    productionMethods: [
      "handwoven",
      "hand-carved",
      "custom-tailored",
      "patchwork",
      "metalwork",
      "macrame",
    ] as ProductionMethod[],
  };
}