export type ProductReview = {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  helpful: number;
  verified: boolean;
};

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  attributes: Record<string, string>; 
  images?: string[];
};

export type Vendor = {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  itemsSold: number;
  memberMonths: number;
  avatar: string;
};

export type ShippingInfo = {
  arrives: string;
  from: string;
  cost: number;
  freeShippingThreshold?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  userFeedback?: number;

  image: string;
  images: string[];
  categoryId: string;
  subCategoryId: string;
  subCategoryTypeId?: string;
  tags: string[];
  inStock: boolean;
  stockQuantity: number;
  isFeatured: boolean;
  isOnSale: boolean;
  createdAt: string;
  updatedAt: string;
  specifications: Record<string, string>;
  productionMethod: ProductionMethod;
  sku?: string;
  material?: string;
  colors?: string[];
  sizes?: string[];
  careInstructions?: string[];
  variants?: ProductVariant[];
  
  // Vendor information
  vendor?: string | Vendor;
  
  // Shipping information
  shippingInfo?: ShippingInfo;
  
  // Reviews
  productReviews?: ProductReview[];
  
  // Related products
  relatedProducts?: string[];
  
  // ADD THESE MISSING PROPERTIES:
  status: ProductStatus;
  sales: number;
  category?: string;
  [key: string]: any;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  subCategories: SubCategory[];
  isActive: boolean;
  createdAt: string;
};

export type SubCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  types: SubCategoryType[];
  isActive: boolean;
  createdAt: string;
};

export type SubCategoryType = {
  id: string;
  name: string;
  description: string;
  subCategoryId: string;
  isActive: boolean;
  createdAt: string;
};

export type ProductionMethod = 
  | "handwoven"
  | "hand-carved"
  | "custom-tailored"
  | "patchwork"
  | "metalwork"
  | "macrame"
  | "all-methods";

export type SortOption = 
  | "most-recent"
  | "price-low-high"
  | "price-high-low"
  | "popularity"
  | "newest-arrivals"
  | "rating";

export type FilterState = {
  categories: string[];
  subCategories: string[];
  types: string[];
  priceRange: [number, number];
  productionMethods: ProductionMethod[];
  vendors: string[];
  inStock: boolean;
  onSale: boolean;
  minRating: number;
};


export type ProductTab = 
  | "all" 
  | "active" 
  | "draft" 
  | "out-of-stock" 
  | "archived";

export type ProductStatus = 
  | "active" 
  | "draft" 
  | "out-of-stock" 
  | "archived";

export type ProductViewMode = "grid" | "list";