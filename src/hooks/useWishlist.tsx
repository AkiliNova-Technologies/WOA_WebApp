import { useState, useMemo } from "react";
import type { Product } from "@/types/product";
import images from "@/assets/images";

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
  [key: string]: any;
}

// Mock products data for the wishlist
const mockProducts: Product[] = [
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
    categoryId: "1",
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
    status: "active",
    sales: 25,
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
    categoryId: "1",
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
    status: "active",
    sales: 32,
  },
  {
    id: "7",
    name: "Handmade Leather Sandals",
    description:
      "Comfortable handmade leather sandals with traditional patterns",
    price: 55,
    originalPrice: 65,
    rating: 4.4,
    reviews: 16,
    vendor: "African Crafts",
    image: images.Product7,
    images: [images.Product7],
    categoryId: "4",
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
    status: "active",
    sales: 28,
  },
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
    categoryId: "5",
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
    status: "active",
    sales: 15,
  },
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
    categoryId: "2",
    subCategoryId: "2-1",
    subCategoryTypeId: undefined,
    tags: ["men", "kente", "traditional", "shirt"],
    inStock: false, // This one is out of stock for demo
    stockQuantity: 0,
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
    status: "active",
    sales: 22,
  },
];

// Mock wishlist items with different added dates
const mockWishlistItems: WishlistItem[] = [
  {
    productId: "1",
    product: mockProducts[0],
    addedAt: "2024-03-01T10:30:00.000Z", // Most recent
  },
  {
    productId: "3",
    product: mockProducts[1],
    addedAt: "2024-02-28T14:15:00.000Z",
  },
  {
    productId: "7",
    product: mockProducts[2],
    addedAt: "2024-02-25T09:45:00.000Z",
  },
  {
    productId: "8",
    product: mockProducts[3],
    addedAt: "2024-02-20T16:20:00.000Z",
  },
  {
    productId: "4",
    product: mockProducts[4],
    addedAt: "2024-02-15T11:10:00.000Z", // Oldest
  },
];

export function useWishlist() {
  // State for wishlist items - initialized with mock data
  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>(mockWishlistItems);

  // Add item to wishlist
  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      // Check if product is already in wishlist
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        return prev; // Already in wishlist, do nothing
      }

      // Add new item to wishlist
      const newItem: WishlistItem = {
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
      };
      return [...prev, newItem];
    });
  };

  const getVendorName = (product: Product): string => {
    if (!product.vendor) return "";
    if (typeof product.vendor === "string") return product.vendor;
    // Use 'name' property from Vendor type
    return product.vendor.name || "";
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  // Get wishlist item count
  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  // Get wishlist items sorted by date added (newest first)
  const getSortedWishlistItems = useMemo(() => {
    return [...wishlistItems].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, [wishlistItems]);

  // Get wishlist items by category
  const getWishlistItemsByCategory = (categoryId: string): WishlistItem[] => {
    return wishlistItems.filter(
      (item) => item.product.categoryId === categoryId
    );
  };

  // Get wishlist items that are on sale
  const getOnSaleWishlistItems = (): WishlistItem[] => {
    return wishlistItems.filter((item) => item.product.isOnSale);
  };

  // Get wishlist items that are in stock
  const getInStockWishlistItems = (): WishlistItem[] => {
    return wishlistItems.filter((item) => item.product.inStock);
  };

  // Get wishlist items that are out of stock
  const getOutOfStockWishlistItems = (): WishlistItem[] => {
    return wishlistItems.filter((item) => !item.product.inStock);
  };

  // Toggle wishlist item (add if not present, remove if present)
  const toggleWishlistItem = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Move item to cart (remove from wishlist and potentially add to cart)
  const moveToCart = (productId: string) => {
    const itemToMove = wishlistItems.find(
      (item) => item.productId === productId
    );
    if (itemToMove) {
      removeFromWishlist(productId);
      return itemToMove.product;
    }
    return undefined;
  };

  // Move all in-stock items to cart
  const moveAllToCart = () => {
    const inStockItems = getInStockWishlistItems();
    const movedProducts = inStockItems.map((item) => item.product);

    // Remove all in-stock items from wishlist
    setWishlistItems((prev) => prev.filter((item) => !item.product.inStock));

    return movedProducts;
  };

  // Get wishlist statistics
  const getWishlistStats = () => {
    const totalItems = wishlistItems.length;
    const totalValue = wishlistItems.reduce(
      (sum, item) => sum + item.product.price,
      0
    );
    const onSaleCount = getOnSaleWishlistItems().length;
    const outOfStockCount = getOutOfStockWishlistItems().length;
    const categoriesCount = new Set(
      wishlistItems.map((item) => item.product.categoryId)
    ).size;

    return {
      totalItems,
      totalValue,
      onSaleCount,
      outOfStockCount,
      categoriesCount,
      averageRating:
        totalItems > 0
          ? wishlistItems.reduce((sum, item) => sum + item.product.rating, 0) /
            totalItems
          : 0,
    };
  };

  // Search wishlist items
  const searchWishlist = (query: string): WishlistItem[] => {
    if (!query) return wishlistItems;

    const lowercaseQuery = query.toLowerCase();
    return wishlistItems.filter(
      (item) =>
        item.product.name.toLowerCase().includes(lowercaseQuery) ||
        item.product.description.toLowerCase().includes(lowercaseQuery) ||
        item.product.tags.some((tag) =>
          tag.toLowerCase().includes(lowercaseQuery)
        ) ||
        (getVendorName(item.product).toLowerCase().includes(lowercaseQuery) ??
          false)
    );
  };

  // Filter wishlist by price range
  const filterWishlistByPrice = (
    minPrice: number,
    maxPrice: number
  ): WishlistItem[] => {
    return wishlistItems.filter(
      (item) => item.product.price >= minPrice && item.product.price <= maxPrice
    );
  };

  // Filter wishlist by rating
  const filterWishlistByRating = (minRating: number): WishlistItem[] => {
    return wishlistItems.filter((item) => item.product.rating >= minRating);
  };

  // Get unique categories in wishlist
  const getWishlistCategories = (): string[] => {
    const categoryIds = wishlistItems.map((item) => item.product.categoryId);
    return Array.from(new Set(categoryIds));
  };

  // Get wishlist items added in the last X days
  const getRecentWishlistItems = (days: number = 7): WishlistItem[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return wishlistItems.filter((item) => new Date(item.addedAt) >= cutoffDate);
  };

  // Get most expensive item in wishlist
  const getMostExpensiveItem = (): WishlistItem | undefined => {
    if (wishlistItems.length === 0) return undefined;
    return wishlistItems.reduce((max, item) =>
      item.product.price > max.product.price ? item : max
    );
  };

  // Get cheapest item in wishlist
  const getCheapestItem = (): WishlistItem | undefined => {
    if (wishlistItems.length === 0) return undefined;
    return wishlistItems.reduce((min, item) =>
      item.product.price < min.product.price ? item : min
    );
  };

  // Get items by vendor
  const getItemsByVendor = (vendor: string): WishlistItem[] => {
    const lowercaseVendor = vendor.toLowerCase();
    return wishlistItems.filter((item) =>
      typeof item.product.vendor === "string"
        ? item.product.vendor.toLowerCase().includes(lowercaseVendor)
        : item.product.vendor?.name?.toLowerCase().includes(lowercaseVendor) ||
          false
    );
  };

  return {
    // Data
    wishlistItems: getSortedWishlistItems,
    wishlistCount: getWishlistCount(),

    // Actions
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    toggleWishlistItem,
    moveToCart,
    moveAllToCart,

    // Queries
    isInWishlist,
    getWishlistItemsByCategory,
    getOnSaleWishlistItems,
    getInStockWishlistItems,
    getOutOfStockWishlistItems,
    searchWishlist,
    filterWishlistByPrice,
    filterWishlistByRating,
    getWishlistCategories,
    getRecentWishlistItems,
    getMostExpensiveItem,
    getCheapestItem,
    getItemsByVendor,

    // Statistics
    wishlistStats: getWishlistStats(),

    // Helper values
    isEmpty: wishlistItems.length === 0,
    hasOutOfStockItems: wishlistItems.some((item) => !item.product.inStock),
    hasOnSaleItems: wishlistItems.some((item) => item.product.isOnSale),
  };
}

// Persistent wishlist hook using localStorage
export function usePersistentWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    // Initialize from localStorage or use mock data if empty
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wishlist");
      return saved ? JSON.parse(saved) : mockWishlistItems;
    }
    return mockWishlistItems;
  });

  // Helper function to update both state and localStorage
  const updateWishlist = (newWishlist: WishlistItem[]) => {
    setWishlistItems(newWishlist);
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    }
  };

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev: WishlistItem[]) => {
      // Check if product is already in wishlist
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        return prev; // Already in wishlist, do nothing
      }

      // Add new item to wishlist
      const newItem: WishlistItem = {
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
      };
      const newWishlist = [...prev, newItem];

      // Update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      }

      return newWishlist;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev: WishlistItem[]) => {
      const newWishlist = prev.filter((item) => item.productId !== productId);

      // Update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      }

      return newWishlist;
    });
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify([]));
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  // Get wishlist item count
  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  // Get wishlist items sorted by date added (newest first)
  const getSortedWishlistItems = useMemo(() => {
    return [...wishlistItems].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, [wishlistItems]);

  return {
    // Data
    wishlistItems: getSortedWishlistItems,
    wishlistCount: getWishlistCount(),

    // Actions
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    updateWishlist,

    // Queries
    isInWishlist,

    // Helper values
    isEmpty: wishlistItems.length === 0,
  };
}
