import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  categoryId: string;
  subcategoryId: string;
  productTypeId?: string;
  vendorId: string;
  status:
    | "draft"
    | "pending_review"
    | "approved"
    | "rejected"
    | "published"
    | "archived";
  attributes: Record<string, any>;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;

  // Keep the vendor object
  vendor?: {
    id: string;
    businessName: string;
  };

  // ADD THIS: vendor name as string for easier access
  vendorName?: string;

  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  categoryId: string;
  subcategoryId: string;
  productTypeId?: string;
  attributes: Record<string, any>;
}

export interface PaginatedProducts {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminProduct extends Product {
  // Additional admin-specific fields
  reviewNotes?: string;
  adminNotes?: string;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface ProductsState {
  products: Product[];
  adminProducts: Product[]; // Admin-only products list
  product: Product | null;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  publicProducts: Product[]; // Public products cache
  relatedProducts: Product[]; // Related products cache
}

const initialState: ProductsState = {
  products: [],
  adminProducts: [],
  product: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  publicProducts: [],
  relatedProducts: [],
};

// ====================== PUBLIC PRODUCTS ======================

// Get public product details
export const fetchPublicProduct = createAsyncThunk(
  "products/fetchPublic",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/products/public/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

// List approved products with optional filtering and pagination
export const fetchPublicProducts = createAsyncThunk(
  "products/fetchPublicProducts",
  async (
    params: {
      page?: number;
      limit?: number;
      categoryId?: string;
      vendorId?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.categoryId)
        queryParams.append("categoryId", params.categoryId);
      if (params?.vendorId) queryParams.append("vendorId", params.vendorId);
      if (params?.minPrice)
        queryParams.append("minPrice", params.minPrice.toString());
      if (params?.maxPrice)
        queryParams.append("maxPrice", params.maxPrice.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `/api/v1/products/public${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      // Transform the data
      const transformedData = {
        ...response.data,
        products: response.data.products?.map((product: any) => ({
          ...product,
          // Add vendorName for easy access
          vendorName: product.vendor?.businessName || "Unknown Vendor",
        })),
      };

      return transformedData;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch public products"
      );
    }
  }
);

// Get related products
export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelated",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/v1/products/public/${productId}/related`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch related products"
      );
    }
  }
);

// ====================== REGULAR PRODUCTS (VENDOR) ======================

// Create product
export const createProduct = createAsyncThunk(
  "products/create",
  async (productData: CreateProductData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/v1/products", productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

// Get product by ID
export const fetchProduct = createAsyncThunk(
  "products/fetch",
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

// Update product
export const updateProduct = createAsyncThunk(
  "products/update",
  async (
    { id, data }: { id: string; data: Partial<CreateProductData> },
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

// Delete product
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

// Submit product for review
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

// Upload product media
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

// ====================== ADMIN PRODUCTS ======================

// Get detailed product info for admin review
export const fetchAdminProduct = createAsyncThunk(
  "products/fetchAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/products/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin product"
      );
    }
  }
);

// List all products for admin (with filtering)
export const fetchAdminProducts = createAsyncThunk(
  "products/fetchAdminProducts",
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      vendorId?: string;
      categoryId?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);
      if (params?.vendorId) queryParams.append("vendorId", params.vendorId);
      if (params?.categoryId)
        queryParams.append("categoryId", params.categoryId);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `/api/v1/admin/inventory/${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin products"
      );
    }
  }
);

// Update product low-stock alert threshold
export const updateLowStockThreshold = createAsyncThunk(
  "products/updateLowStockThreshold",
  async (
    { productId, threshold }: { productId: string; threshold: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/api/v1/orders/products/${productId}/low-stock-threshold`,
        { threshold }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update low stock threshold"
      );
    }
  }
);

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
      state.adminProducts = [];
      state.publicProducts = [];
      state.relatedProducts = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalProducts = 0;
    },
    clearPublicProducts: (state) => {
      state.publicProducts = [];
    },
    clearRelatedProducts: (state) => {
      state.relatedProducts = [];
    },
    clearAdminProducts: (state) => {
      state.adminProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      // Fetch product
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch public product
      .addCase(fetchPublicProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchPublicProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch public products
      .addCase(fetchPublicProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.publicProducts = action.payload.products || action.payload;
        if (action.payload.currentPage) {
          state.currentPage = action.payload.currentPage;
          state.totalPages = action.payload.totalPages;
          state.totalProducts = action.payload.totalProducts;
        }
      })
      .addCase(fetchPublicProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        // Update in products list if exists
        state.products = state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        );
        // Update in public products list if exists
        state.publicProducts = state.publicProducts.map((product) =>
          product.id === action.payload.id ? action.payload : product
        );
        // Update in admin products list if exists
        state.adminProducts = state.adminProducts.map((product) =>
          product.id === action.payload.id ? action.payload : product
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from products list
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
        // Remove from public products list
        state.publicProducts = state.publicProducts.filter(
          (product) => product.id !== action.payload
        );
        // Remove from admin products list
        state.adminProducts = state.adminProducts.filter(
          (product) => product.id !== action.payload
        );
        // Clear current product if it was deleted
        if (state.product?.id === action.payload) {
          state.product = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Submit for review
      .addCase(submitForReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitForReview.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        // Update in products list if exists
        state.products = state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        );
      })
      .addCase(submitForReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload media
      .addCase(uploadProductMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
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

      // Fetch related products
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch admin product
      .addCase(fetchAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch admin products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.adminProducts = action.payload.products || action.payload;
        if (action.payload.currentPage) {
          state.currentPage = action.payload.currentPage;
          state.totalPages = action.payload.totalPages;
          state.totalProducts = action.payload.totalProducts;
        }
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update low stock threshold
      .addCase(updateLowStockThreshold.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLowStockThreshold.fulfilled, (state, action) => {
        state.loading = false;
        if (state.product) {
          state.product = { ...state.product, ...action.payload };
        }
      })
      .addCase(updateLowStockThreshold.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProduct,
  clearProduct,
  clearError,
  clearProducts,
  clearPublicProducts,
  clearRelatedProducts,
  clearAdminProducts,
} = productsSlice.actions;

// Selectors
export const selectProducts = (state: { products: ProductsState }) =>
  state.products.products;
export const selectAdminProducts = (state: { products: ProductsState }) =>
  state.products.adminProducts;
export const selectPublicProducts = (state: { products: ProductsState }) =>
  state.products.publicProducts;
export const selectRelatedProducts = (state: { products: ProductsState }) =>
  state.products.relatedProducts;
export const selectProduct = (state: { products: ProductsState }) =>
  state.products.product;
export const selectProductsLoading = (state: { products: ProductsState }) =>
  state.products.loading;
export const selectProductsError = (state: { products: ProductsState }) =>
  state.products.error;
export const selectCreateProductLoading = (state: {
  products: ProductsState;
}) => state.products.createLoading;
export const selectCreateProductError = (state: { products: ProductsState }) =>
  state.products.createError;
export const selectProductsPagination = (state: {
  products: ProductsState;
}) => ({
  currentPage: state.products.currentPage,
  totalPages: state.products.totalPages,
  totalProducts: state.products.totalProducts,
});

export default productsSlice.reducer;
