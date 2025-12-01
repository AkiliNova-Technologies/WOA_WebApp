import { useState, useMemo } from "react";
import type { Product } from "@/types/product";
import images from "@/assets/images";

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: string;
  [key: string]: any;
}

// Mock products data for the cart
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Colorful Bolga Shirt",
    description: "Perfect for complete traditional outfits with vibrant colors and patterns",
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
    description: "Comfortable handmade leather sandals with traditional patterns",
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
  }
];

// Mock cart items with different quantities and dates
const mockCartItems: CartItem[] = [
  {
    productId: "1",
    product: mockProducts[0],
    quantity: 2,
    addedAt: "2024-03-01T10:30:00.000Z", // Most recent
  },
  {
    productId: "3",
    product: mockProducts[1],
    quantity: 1,
    addedAt: "2024-02-28T14:15:00.000Z",
  },
  {
    productId: "7",
    product: mockProducts[2],
    quantity: 1,
    addedAt: "2024-02-25T09:45:00.000Z",
  },
  {
    productId: "8",
    product: mockProducts[3],
    quantity: 3,
    addedAt: "2024-02-20T16:20:00.000Z",
  },
  {
    productId: "4",
    product: mockProducts[4],
    quantity: 1,
    addedAt: "2024-02-15T11:10:00.000Z", // Oldest
  },
];

export function useCart() {
  // State for cart items - initialized with mock data
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);

  // Add item to cart
  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      // Check if product is already in cart
      const existingItemIndex = prev.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity if product already exists
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      }

      // Add new item to cart
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity,
        addedAt: new Date().toISOString(),
      };
      return [...prev, newItem];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCartItems((prev) => 
      prev.filter(item => item.productId !== productId)
    );
  };

  // Update item quantity in cart
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    return cartItems.some(item => item.productId === productId);
  };

  // Get cart item count (total quantity of all items)
  const getCartCount = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get unique product count (number of distinct products)
  const getUniqueProductCount = (): number => {
    return cartItems.length;
  };

  // Get cart items sorted by date added (newest first)
  const getSortedCartItems = useMemo(() => {
    return [...cartItems].sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, [cartItems]);

  // Get cart items by category
  const getCartItemsByCategory = (categoryId: string): CartItem[] => {
    return cartItems.filter(item => item.product.categoryId === categoryId);
  };

  // Get cart items that are on sale
  const getOnSaleCartItems = (): CartItem[] => {
    return cartItems.filter(item => item.product.isOnSale);
  };

  // Get cart items that are in stock
  const getInStockCartItems = (): CartItem[] => {
    return cartItems.filter(item => item.product.inStock);
  };

  // Get cart items that are out of stock
  const getOutOfStockCartItems = (): CartItem[] => {
    return cartItems.filter(item => !item.product.inStock);
  };

  // Move item to wishlist (remove from cart and potentially add to wishlist)
  const moveToWishlist = (productId: string) => {
    const itemToMove = cartItems.find(item => item.productId === productId);
    if (itemToMove) {
      removeFromCart(productId);
      return itemToMove.product;
    }
    return undefined;
  };

  // Move all items to wishlist
  const moveAllToWishlist = () => {
    const movedProducts = cartItems.map(item => item.product);
    clearCart();
    return movedProducts;
  };

  // Get cart statistics
  const getCartStats = () => {
    const totalItems = getCartCount();
    const uniqueProducts = getUniqueProductCount();
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalDiscount = cartItems.reduce((sum, item) => {
      const discount = item.product.originalPrice ? (item.product.originalPrice - item.product.price) : 0;
      return sum + (discount * item.quantity);
    }, 0);
    const onSaleCount = getOnSaleCartItems().length;
    const outOfStockCount = getOutOfStockCartItems().length;
    const categoriesCount = new Set(cartItems.map(item => item.product.categoryId)).size;

    // Calculate estimated shipping (free over $50, otherwise $5)
    const shipping = subtotal >= 50 ? 0 : 5;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    return {
      totalItems,
      uniqueProducts,
      subtotal,
      totalDiscount,
      shipping,
      tax,
      total,
      onSaleCount,
      outOfStockCount,
      categoriesCount,
      averageRating: cartItems.length > 0 
        ? cartItems.reduce((sum, item) => sum + item.product.rating, 0) / cartItems.length 
        : 0,
    };
  };

  // Search cart items
  const searchCart = (query: string): CartItem[] => {
    if (!query) return cartItems;
    
    const lowercaseQuery = query.toLowerCase();
    return cartItems.filter(item =>
      item.product.name.toLowerCase().includes(lowercaseQuery) ||
      item.product.description.toLowerCase().includes(lowercaseQuery) ||
      item.product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      item.product.vendor.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Filter cart by price range
  const filterCartByPrice = (minPrice: number, maxPrice: number): CartItem[] => {
    return cartItems.filter(item =>
      item.product.price >= minPrice && item.product.price <= maxPrice
    );
  };

  // Filter cart by rating
  const filterCartByRating = (minRating: number): CartItem[] => {
    return cartItems.filter(item => item.product.rating >= minRating);
  };

  // Get unique categories in cart
  const getCartCategories = (): string[] => {
    const categoryIds = cartItems.map(item => item.product.categoryId);
    return Array.from(new Set(categoryIds));
  };

  // Get cart items added in the last X days
  const getRecentCartItems = (days: number = 7): CartItem[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return cartItems.filter(item => 
      new Date(item.addedAt) >= cutoffDate
    );
  };

  // Get most expensive item in cart
  const getMostExpensiveItem = (): CartItem | undefined => {
    if (cartItems.length === 0) return undefined;
    return cartItems.reduce((max, item) => 
      item.product.price > max.product.price ? item : max
    );
  };

  // Get cheapest item in cart
  const getCheapestItem = (): CartItem | undefined => {
    if (cartItems.length === 0) return undefined;
    return cartItems.reduce((min, item) => 
      item.product.price < min.product.price ? item : min
    );
  };

  // Get items by vendor
  const getItemsByVendor = (vendor: string): CartItem[] => {
    return cartItems.filter(item => 
      item.product.vendor.toLowerCase().includes(vendor.toLowerCase())
    );
  };

  // Get total quantity for a specific product
  const getProductQuantity = (productId: string): number => {
    const item = cartItems.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // Check if cart has items with insufficient stock
  const hasInsufficientStock = (): boolean => {
    return cartItems.some(item => item.quantity > item.product.stockQuantity);
  };

  // Get items with insufficient stock
  const getInsufficientStockItems = (): CartItem[] => {
    return cartItems.filter(item => item.quantity > item.product.stockQuantity);
  };

  // Apply coupon code (mock implementation)
  const applyCoupon = (code: string): { success: boolean; message: string; discount?: number } => {
    const couponCodes: { [key: string]: number } = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'SUMMER15': 15,
    };

    const discount = couponCodes[code.toUpperCase()];
    
    if (discount) {
      return {
        success: true,
        message: `Coupon applied! ${discount}% off your order`,
        discount,
      };
    }

    return {
      success: false,
      message: 'Invalid coupon code',
    };
  };

  return {
    // Data
    cartItems: getSortedCartItems,
    cartCount: getCartCount(),
    uniqueProductCount: getUniqueProductCount(),

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    moveToWishlist,
    moveAllToWishlist,
    applyCoupon,

    // Queries
    isInCart,
    getCartItemsByCategory,
    getOnSaleCartItems,
    getInStockCartItems,
    getOutOfStockCartItems,
    searchCart,
    filterCartByPrice,
    filterCartByRating,
    getCartCategories,
    getRecentCartItems,
    getMostExpensiveItem,
    getCheapestItem,
    getItemsByVendor,
    getProductQuantity,
    hasInsufficientStock,
    getInsufficientStockItems,

    // Statistics
    cartStats: getCartStats(),

    // Helper values
    isEmpty: cartItems.length === 0,
    hasOutOfStockItems: cartItems.some(item => !item.product.inStock),
    hasOnSaleItems: cartItems.some(item => item.product.isOnSale),
  };
}

// Persistent cart hook using localStorage
export function usePersistentCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage or use mock data if empty
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : mockCartItems;
    }
    return mockCartItems;
  });

  // Helper function to update both state and localStorage
  const updateCart = (newCart: CartItem[]) => {
    setCartItems(newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev: CartItem[]) => {
      // Check if product is already in cart
      const existingItemIndex = prev.findIndex(item => item.productId === product.id);
      let newCart: CartItem[];

      if (existingItemIndex !== -1) {
        // Update quantity if product already exists
        newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          productId: product.id,
          product,
          quantity,
          addedAt: new Date().toISOString(),
        };
        newCart = [...prev, newItem];
      }

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }

      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev: CartItem[]) => {
      const newCart = prev.filter(item => item.productId !== productId);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev: CartItem[]) => {
      const newCart = prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }

      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify([]));
    }
  };

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    return cartItems.some(item => item.productId === productId);
  };

  // Get cart item count (total quantity of all items)
  const getCartCount = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get unique product count (number of distinct products)
  const getUniqueProductCount = (): number => {
    return cartItems.length;
  };

  // Get cart items sorted by date added (newest first)
  const getSortedCartItems = useMemo(() => {
    return [...cartItems].sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, [cartItems]);

  return {
    // Data
    cartItems: getSortedCartItems,
    cartCount: getCartCount(),
    uniqueProductCount: getUniqueProductCount(),

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateCart,

    // Queries
    isInCart,

    // Helper values
    isEmpty: cartItems.length === 0,
  };
}