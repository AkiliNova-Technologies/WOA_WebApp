import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

// ====================== TYPES & INTERFACES ======================

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface ProductType {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice?: number;
  baseCompareAtPrice?: number;
  price: number;
  compareAtPrice?: number;

  // Product status
  status:
    | "active"
    | "draft"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "RE_EVALUATION"
    | "published"
    | "archived"
    | "out-of-stock"
    | "deleted";

  // Attributes and variants
  attributes?: Record<string, string>; 
  variants: ProductVariant[];

  // Relations
  sellerId?: string;
  seller?: Seller;
  categoryId: string;
  category?: Category;
  subcategoryId?: string;
  subcategory?: SubCategory;
  productTypeId?: string;
  productType?: ProductType;
  image?: string;
  images: ProductImage[];
  gallery?: string[];
  averageRating?: number;
  reviewCount?: number;
  isInWishlist?: boolean;
  viewCount?: number;
  lastViewed?: string;
  vendorId?: string;
  vendorName?: string;
  sellerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  basePrice: number;
  baseCompareAtPrice?: number;
  attributes: Record<string, string>;
  categoryId: string;
  subcategoryId: string;
  productTypeId: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  basePrice?: number;
  baseCompareAtPrice?: number;
  attributes?: Record<string, string>;
  categoryId?: string;
  subcategoryId?: string;
  productTypeId?: string;
}

export interface ProductSearchParams {
  q?: string; 
  categoryId?: string;
  subcategoryId?: string;
  productTypeId?: string;
  filters?: Record<string, string | string[]>;
  sort?: "price_asc" | "price_desc" | "created_asc" | "created_desc";
  page?: number;
  limit?: number;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  subcategoryId?: string;
  sellerId?: string;
}

export interface RecentlyViewedParams {
  page?: number;
  limit?: number;
  sortBy?: "date" | "price" | "rating";
  order?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface SearchSuggestion {
  id: string;
  type: "productType" | "product";
  label: string;
}

export interface AvailableFilters {
  filters: Record<string, string[]>;
}

// ====================== STATE ======================

interface ProductsState {
  // Product lists
  allProducts: Product[];
  products: Product[];
  publicProducts: Product[];
  relatedProducts: Product[];
  recentlyViewedProducts: Product[];
  searchResults: Product[];
  productReviews: any[];
  vendorReviews: any[];

  // Single product
  product: Product | null;

  // Search helpers
  searchSuggestions: SearchSuggestion[];
  availableFilters: AvailableFilters | null;

  // Loading states
  loading: boolean;
  createLoading: boolean;
  recentlyViewedLoading: boolean;
  searchLoading: boolean;
  allProductsLoading: boolean;
  reviewsLoading: boolean;

  // Loading states

  // Error states
  error: string | null;
  createError: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

const initialState: ProductsState = {
  products: [],
  publicProducts: [],
  allProducts: [],
  productReviews: [],
  vendorReviews: [],
  allProductsLoading: false,
  reviewsLoading: false,
  relatedProducts: [],
  recentlyViewedProducts: [],
  searchResults: [],
  product: null,
  searchSuggestions: [],
  availableFilters: null,
  loading: false,
  createLoading: false,
  recentlyViewedLoading: false,
  searchLoading: false,
  error: null,
  createError: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
};

// ====================== HELPER FUNCTIONS ======================

/**
 * Enrich product data with calculated fields
 */
const enrichProduct = (product: any): Product => {
  // Get first active variant for display pricing
  const firstActiveVariant =
    product.variants?.find((v: any) => v.isActive !== false) ||
    product.variants?.[0];

  return {
    ...product,
    // Ensure price fields exist (from first variant or base)
    price: firstActiveVariant?.price || product.basePrice || 0,
    compareAtPrice:
      firstActiveVariant?.compareAtPrice || product.baseCompareAtPrice,

    // Ensure rating fields exist
    averageRating: product.averageRating || 0,
    reviewCount: product.reviewCount || 0,

    // Ensure image field exists
    image:
      product.image ||
      product.images?.find((img: any) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      "",

    // Ensure variants array exists
    variants: product.variants || [],

    // Ensure images array exists
    images: product.images || [],

    // Add vendor name shortcut
    vendorName:
      product.seller?.businessName ||
      `${product.seller?.firstName || ""} ${
        product.seller?.lastName || ""
      }`.trim() ||
      "Unknown Vendor",

    // Add seller name shortcut
    sellerName:
      `${product.seller?.firstName || ""} ${
        product.seller?.lastName || ""
      }`.trim() ||
      product.seller?.businessName ||
      "Unknown Seller",
  };
};

// ====================== ASYNC THUNKS ======================

// ========== ADMIN PRODUCT LISTING ==========

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (
    params: ProductListParams & {
      productTypeId?: string;
      sellerId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.categoryId)
        queryParams.append("categoryId", params.categoryId);
      if (params.subcategoryId)
        queryParams.append("subcategoryId", params.subcategoryId);
      if (params.sellerId) queryParams.append("sellerId", params.sellerId);
      if (params.productTypeId)
        queryParams.append("productTypeId", params.productTypeId);

      const url = `/api/v1/products/all${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);

      console.log("📦 fetchAllProducts response:", response.data);

      // Use 'response.data' directly
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20,
        totalPages: response.data.totalPages || 1,
      };
    } catch (error: any) {
      console.error("❌ fetchAllProducts error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all products"
      );
    }
  }
);

// ========== PUBLIC PRODUCT LISTING ==========

export const fetchPublicProducts = createAsyncThunk(
  "products/fetchPublicProducts",
  async (params: ProductListParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.categoryId)
        queryParams.append("categoryId", params.categoryId);
      if (params.subcategoryId)
        queryParams.append("subcategoryId", params.subcategoryId);
      if (params.sellerId) queryParams.append("sellerId", params.sellerId);

      // CHANGE HERE: Use 'approved' endpoint instead of 'all'
      const url = `/api/v1/products/approved${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);

      console.log("📦 fetchPublicProducts response:", response.data);

      // CORRECTION: Use 'response.data' instead of 'responseData'
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20,
        totalPages: response.data.totalPages || 1,
      };
    } catch (error: any) {
      console.error("❌ fetchPublicProducts error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchPublicProduct = createAsyncThunk(
  "products/fetchPublicProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/products/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelatedProducts",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/products/${productId}/related`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch related products"
      );
    }
  }
);

// ========== PRODUCT SEARCH & FILTERING ==========

export const searchProducts = createAsyncThunk(
  "products/search",
  async (params: ProductSearchParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.q) queryParams.append("q", params.q);
      if (params.categoryId) queryParams.append("categoryId", params.categoryId);
      if (params.subcategoryId) queryParams.append("subcategoryId", params.subcategoryId);
      if (params.productTypeId) queryParams.append("productTypeId", params.productTypeId);
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      
      const response = await api.get(`/api/v1/products/approved?${queryParams.toString()}`);
      
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20,
        totalPages: response.data.totalPages || 1,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search products"
      );
    }
  }
);

export const fetchSearchFilters = createAsyncThunk(
  "products/fetchSearchFilters",
  async (
    params: { q?: string; categoryId?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.append("q", params.q);
      if (params.categoryId)
        queryParams.append("categoryId", params.categoryId);

      const response = await api.get(
        `/api/v1/public/search/filters?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch filters"
      );
    }
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  "products/fetchSearchSuggestions",
  async (params: { q: string; limit?: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("q", params.q);
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get(
        `/api/v1/public/search/suggestions?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch suggestions"
      );
    }
  }
);

// ========== RECENTLY VIEWED PRODUCTS ==========

export const trackProductView = createAsyncThunk(
  "products/trackView",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/v1/products/recently-viewed/${productId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to track product view"
      );
    }
  }
);

export const fetchRecentlyViewedProducts = createAsyncThunk(
  "products/fetchRecentlyViewed",
  async (params: RecentlyViewedParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.order) queryParams.append("order", params.order);
      if (params.minPrice)
        queryParams.append("minPrice", params.minPrice.toString());
      if (params.maxPrice)
        queryParams.append("maxPrice", params.maxPrice.toString());
      if (params.minRating)
        queryParams.append("minRating", params.minRating.toString());

      const url = `/api/v1/products/recently-viewed${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);

      const data = response.data;
      return {
        data: Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data?.data)
          ? data.data
          : [],
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || 10,
        totalPages: data?.totalPages || 1,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch recently viewed products"
      );
    }
  }
);

export const removeFromRecentlyViewed = createAsyncThunk(
  "products/removeFromRecentlyViewed",
  async (productId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/products/recently-viewed/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from recently viewed"
      );
    }
  }
);

// ========== PRODUCT REVIEW MANAGEMENT ==========

export const fetchProductReviews = createAsyncThunk(
  "products/fetchProductReviews",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/products/${productId}/reviews`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product reviews"
      );
    }
  }
);

export const fetchVendorReviews = createAsyncThunk(
  "products/fetchVendorReviews",
  async (vendorId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/v1/products/vendor/${vendorId}/reviews`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendor reviews"
      );
    }
  }
);

// ========== VENDOR PRODUCT MANAGEMENT ==========

export const createProduct = createAsyncThunk(
  "products/create",
  async (productData: CreateProductData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/v1/products/create", productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/products/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async (
    { id, data }: { id: string; data: UpdateProductData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/api/v1/products/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/products/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

export const softDeleteProduct = createAsyncThunk(
  "products/softDelete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/product/status/delete/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to soft delete product"
      );
    }
  }
);

export const submitForReview = createAsyncThunk(
  "products/submitForReview",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/v1/products/${id}/submit-for-review`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit for review"
      );
    }
  }
);

export const uploadProductMedia = createAsyncThunk(
  "products/uploadMedia",
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        `/api/v1/products/${id}/upload-media`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload media"
      );
    }
  }
);

// ====================== SLICE ======================

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProduct: (state, action: PayloadAction<Product>) => {
      state.product = action.payload;
    },
    clearProduct: (state) => {
      state.product = null;
    },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    clearProducts: (state) => {
      state.products = [];
      state.publicProducts = [];
      state.relatedProducts = [];
      state.recentlyViewedProducts = [];
      state.searchResults = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalProducts = 0;
    },
    clearPublicProducts: (state) => {
      state.publicProducts = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.availableFilters = null;
      state.searchSuggestions = [];
    },
    clearRelatedProducts: (state) => {
      state.relatedProducts = [];
    },
    clearRecentlyViewedProducts: (state) => {
      state.recentlyViewedProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== PUBLIC PRODUCTS ==========
      .addCase(fetchPublicProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Enrich each product with calculated fields
        state.publicProducts = action.payload.data.map(enrichProduct);
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalProducts = action.payload.total;
      })
      .addCase(fetchPublicProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchPublicProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = enrichProduct(action.payload);
      })
      .addCase(fetchPublicProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchRelatedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedProducts = Array.isArray(action.payload)
          ? action.payload.map(enrichProduct)
          : [];
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ========== PRODUCT SEARCH ==========
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data.map(enrichProduct);
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalProducts = action.payload.total;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchSearchFilters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSearchFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.availableFilters = action.payload;
      })
      .addCase(fetchSearchFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchSearchSuggestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.searchSuggestions = action.payload;
      })
      .addCase(fetchSearchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ========== RECENTLY VIEWED ==========
      .addCase(trackProductView.fulfilled, () => {
        // Silent success
      })
      .addCase(trackProductView.rejected, (_state, action) => {
        console.error("Failed to track view:", action.payload);
      })

      .addCase(fetchRecentlyViewedProducts.pending, (state) => {
        state.recentlyViewedLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentlyViewedProducts.fulfilled, (state, action) => {
        state.recentlyViewedLoading = false;
        state.recentlyViewedProducts = action.payload.data.map(enrichProduct);
      })
      .addCase(fetchRecentlyViewedProducts.rejected, (state, action) => {
        state.recentlyViewedLoading = false;
        state.error = action.payload as string;
      })

      .addCase(removeFromRecentlyViewed.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromRecentlyViewed.fulfilled, (state, action) => {
        state.loading = false;
        state.recentlyViewedProducts = state.recentlyViewedProducts.filter(
          (product) => product.id !== action.payload
        );
      })
      .addCase(removeFromRecentlyViewed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ========== VENDOR PRODUCT MANAGEMENT ==========
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        const enrichedProduct = enrichProduct(action.payload);
        state.products.unshift(enrichedProduct);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = enrichProduct(action.payload);
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const enrichedProduct = enrichProduct(action.payload);
        state.product = enrichedProduct;
        state.products = state.products.map((product) =>
          product.id === enrichedProduct.id ? enrichedProduct : product
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
        if (state.product?.id === action.payload) {
          state.product = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(submitForReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitForReview.fulfilled, (state, action) => {
        state.loading = false;
        const enrichedProduct = enrichProduct(action.payload);
        state.product = enrichedProduct;
        state.products = state.products.map((product) =>
          product.id === enrichedProduct.id ? enrichedProduct : product
        );
      })
      .addCase(submitForReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(uploadProductMedia.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProductMedia.fulfilled, (state, action) => {
        state.loading = false;
        if (state.product) {
          state.product.images = action.payload.images;
        }
      })
      .addCase(uploadProductMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ========== ALL PRODUCTS (VENDOR/ADMIN) ==========
      .addCase(fetchAllProducts.pending, (state) => {
        state.allProductsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.allProductsLoading = false;
        state.allProducts = action.payload.data.map(enrichProduct);
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.allProductsLoading = false;
        state.error = action.payload as string;
      })

      // ========== REVIEWS ==========
      .addCase(fetchProductReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.productReviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchVendorReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.vendorReviews = action.payload;
      })
      .addCase(fetchVendorReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload as string;
      })

      // ========== SOFT DELETE ==========
      .addCase(softDeleteProduct.fulfilled, (state, action) => {
        const enrichedProduct = enrichProduct(action.payload);
        state.allProducts = state.allProducts.map((product) =>
          product.id === enrichedProduct.id ? enrichedProduct : product
        );
        if (state.product?.id === enrichedProduct.id) {
          state.product = enrichedProduct;
        }
      });
  },
});

export const {
  setProduct,
  clearProduct,
  clearError,
  clearProducts,
  clearPublicProducts,
  clearSearchResults,
  clearRelatedProducts,
  clearRecentlyViewedProducts,
} = productsSlice.actions;

// ====================== SELECTORS ======================

export const selectProducts = (state: { products: ProductsState }) =>
  state.products.products;
export const selectPublicProducts = (state: { products: ProductsState }) =>
  state.products.publicProducts;
export const selectSearchResults = (state: { products: ProductsState }) =>
  state.products.searchResults;
export const selectRelatedProducts = (state: { products: ProductsState }) =>
  state.products.relatedProducts;
export const selectRecentlyViewedProducts = (state: {
  products: ProductsState;
}) => state.products.recentlyViewedProducts;
export const selectProduct = (state: { products: ProductsState }) =>
  state.products.product;
export const selectSearchSuggestions = (state: { products: ProductsState }) =>
  state.products.searchSuggestions;
export const selectAvailableFilters = (state: { products: ProductsState }) =>
  state.products.availableFilters;
export const selectProductsLoading = (state: { products: ProductsState }) =>
  state.products.loading;
export const selectSearchLoading = (state: { products: ProductsState }) =>
  state.products.searchLoading;
export const selectRecentlyViewedLoading = (state: {
  products: ProductsState;
}) => state.products.recentlyViewedLoading;
export const selectProductsError = (state: { products: ProductsState }) =>
  state.products.error;
export const selectCreateProductLoading = (state: {
  products: ProductsState;
}) => state.products.createLoading;
export const selectCreateProductError = (state: { products: ProductsState }) =>
  state.products.createError;

const selectCurrentPage = (state: { products: ProductsState }) =>
  state.products.currentPage;
const selectTotalPages = (state: { products: ProductsState }) =>
  state.products.totalPages;
const selectTotalProducts = (state: { products: ProductsState }) =>
  state.products.totalProducts;

export const selectProductsPagination = createSelector(
  [selectCurrentPage, selectTotalPages, selectTotalProducts],
  (currentPage, totalPages, totalProducts) => ({
    currentPage,
    totalPages,
    totalProducts,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  })
);

export const selectAllProducts = (state: { products: ProductsState }) =>
  state.products.allProducts;
export const selectProductReviews = (state: { products: ProductsState }) =>
  state.products.productReviews;
export const selectVendorReviews = (state: { products: ProductsState }) =>
  state.products.vendorReviews;
export const selectAllProductsLoading = (state: { products: ProductsState }) =>
  state.products.allProductsLoading;
export const selectReviewsLoading = (state: { products: ProductsState }) =>
  state.products.reviewsLoading;

export default productsSlice.reducer;
