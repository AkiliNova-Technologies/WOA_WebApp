import { createAsyncThunk, createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  salePrice?: number;
  addedAt?: string;
  product: {
    id: string;
    name: string;
    sku: string;
    images: Array<{
      url: string;
      isPrimary: boolean;
    }>;
    vendor: {
      id: string;
      businessName: string;
    };
    category?: {
      id: string;
      name: string;
    };
    stock: number;
  };
  variant?: {
    id: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    stockQuantity: number;
    attributes?: Record<string, string>;
  };
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// Admin cart item structure (matches actual API response)
export interface AdminCartItem {
  cartItemId: string;
  cartId: string;
  clientId: string | null;
  vendorId: string;
  quantity: number;
  priceAtAdd: number | null;
  compareAtPriceAtAdd: number | null;
  productNameSnapshot: string;
  variantNameSnapshot: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    description: string;
    status: string;
    sellerId: string;
    vendorProfileId: string;
    categoryId: string;
    subcategoryId: string;
    productTypeId: string;
    basePrice: number;
    baseCompareAtPrice: number | null;
    wishlistCount: number;
    createdAt: string;
    updatedAt: string;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    isActive: boolean;
    price: number;
    compareAtPrice: number | null;
  } | null;
}

export interface AdminCartResponse {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  data: AdminCartItem[];
}

export interface AdminCartStats {
  totalItems: number;
  totalCarts: number;
  totalValue: number;
  inStockCount: number;
  limitedStockCount: number;
  outOfStockCount: number;
}

interface CartState {
  // User cart
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  
  // Admin cart management
  adminCartItems: AdminCartItem[];
  adminCartStats: AdminCartStats | null;
  adminLoading: boolean;
  adminError: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  updating: false,
  
  adminCartItems: [],
  adminCartStats: null,
  adminLoading: false,
  adminError: null,
};

// Helper function to transform API response to match CartItem structure
const transformCartData = (apiCart: any): Cart => {
  const transformedItems = apiCart.items?.map((item: any) => {
    // Get variant data - either from item.variant or first variant in product.variants
    const variant = item.variant || item.product?.variants?.[0];
    
    // Determine pricing
    const comparePrice = variant?.compareAtPrice;
    const currentPrice = variant?.price || item.price;
    
    return {
      ...item,
      // If there's a compareAtPrice, use it as the original price
      price: comparePrice || currentPrice || 0,
      // The current price becomes the sale price if there's a compare price
      salePrice: comparePrice ? currentPrice : undefined,
      addedAt: item.addedAt || item.createdAt,
      product: {
        ...item.product,
        // Use the variant's SKU or fallback to product-level SKU
        sku: variant?.sku || item.product?.sku || '',
        // Ensure stock is available
        stock: variant?.stockQuantity ?? item.product?.stock ?? 0,
        // Add vendor if not present
        vendor: item.product?.vendor || {
          id: '',
          businessName: 'Unknown Vendor'
        },
        category: item.product?.category || null,
      },
      variant: variant || null,
    };
  }) || [];

  // Calculate totals
  const itemCount = transformedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const total = transformedItems.reduce((sum: number, item: any) => {
    const price = item.salePrice || item.price;
    return sum + (price * item.quantity);
  }, 0);

  return {
    ...apiCart,
    items: transformedItems,
    itemCount,
    total
  };
};

// ==================== USER CART ENDPOINTS ====================

// Get or create cart (guest or authenticated)
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/cart');
      return transformCartData(response.data.cart || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart'
      );
    }
  }
);

// Add item to cart (guest or authenticated)
export const addToCart = createAsyncThunk(
  'cart/addItem',
  async (
    { productId, quantity = 1, variantId }: { productId: string; quantity?: number; variantId?: string },
    { rejectWithValue }
  ) => {
    try {
      const payload: any = { productId, quantity };
      if (variantId) payload.variantId = variantId;
      
      const response = await api.post('/api/v1/cart/items', payload);
      return transformCartData(response.data.cart || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add item to cart'
      );
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ id, quantity }: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/cart/items/${id}`, { quantity });
      return transformCartData(response.data.cart || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update cart item'
      );
    }
  }
);

// Remove cart item
export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/v1/cart/items/${id}`);
      // If API returns updated cart, use it; otherwise just return the id
      if (response.data?.cart) {
        return { cart: transformCartData(response.data.cart), removedId: id };
      }
      return { removedId: id };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item from cart'
      );
    }
  }
);

// Change cart item variant (e.g., change size or color)
export const changeCartItemVariant = createAsyncThunk(
  'cart/changeVariant',
  async ({ id, variantId }: { id: string; variantId: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/cart/items/${id}/variant`, { variantId });
      return transformCartData(response.data.cart || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change item variant'
      );
    }
  }
);

// Move cart item to wishlist (auth required)
export const moveToWishlist = createAsyncThunk(
  'cart/moveToWishlist',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/cart/items/${id}/move-to-wishlist`);
      return { id, wishlistItem: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to move to wishlist'
      );
    }
  }
);

// Merge guest cart into user cart on login
export const mergeCart = createAsyncThunk(
  'cart/merge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/cart/merge');
      return transformCartData(response.data.cart || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to merge cart'
      );
    }
  }
);

// ==================== ADMIN CART ENDPOINTS ====================

// List all cart items with product details (Admin)
export const fetchAllAdminCartItems = createAsyncThunk(
  'cart/fetchAllAdmin',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const queryString = queryParams.toString();
      const url = `/api/v1/admin/cart/all${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch admin cart items'
      );
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
    },
    clearCart: (state) => {
      state.cart = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAdminError: (state) => {
      state.adminError = null;
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      if (state.cart) {
        const item = state.cart.items.find(item => item.id === action.payload.id);
        if (item) {
          item.quantity = action.payload.quantity;
          // Recalculate totals
          state.cart.itemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
          state.cart.total = state.cart.items.reduce(
            (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
            0
          );
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== USER CART ====================
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.updating = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.updating = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload.cart) {
          state.cart = action.payload.cart;
        } else if (state.cart) {
          state.cart.items = state.cart.items.filter(item => item.id !== action.payload.removedId);
          // Recalculate totals
          state.cart.itemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
          state.cart.total = state.cart.items.reduce(
            (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
            0
          );
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      
      // Change variant
      .addCase(changeCartItemVariant.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(changeCartItemVariant.fulfilled, (state, action) => {
        state.updating = false;
        state.cart = action.payload;
      })
      .addCase(changeCartItemVariant.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      
      // Move to wishlist
      .addCase(moveToWishlist.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(moveToWishlist.fulfilled, (state, action) => {
        state.updating = false;
        if (state.cart) {
          state.cart.items = state.cart.items.filter(item => item.id !== action.payload.id);
          // Recalculate totals
          state.cart.itemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
          state.cart.total = state.cart.items.reduce(
            (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
            0
          );
        }
      })
      .addCase(moveToWishlist.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      
      // Merge cart
      .addCase(mergeCart.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.updating = false;
        state.cart = action.payload;
      })
      .addCase(mergeCart.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      
      // ==================== ADMIN CART ====================
      .addCase(fetchAllAdminCartItems.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAllAdminCartItems.fulfilled, (state, action) => {
        state.adminLoading = false;
        // Handle the actual API response structure: { pagination, data }
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.adminCartItems = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.adminCartItems = action.payload;
        } else {
          state.adminCartItems = [];
        }
        
        // Extract pagination/stats if provided
        if (action.payload?.pagination) {
          state.adminCartStats = {
            totalItems: action.payload.pagination.total || 0,
            totalCarts: 0,
            totalValue: 0,
            inStockCount: 0,
            limitedStockCount: 0,
            outOfStockCount: 0,
          };
        }
      })
      .addCase(fetchAllAdminCartItems.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
      });
  },
});

export const { 
  setCart, 
  clearCart, 
  clearError, 
  clearAdminError,
  updateCartItemQuantity 
} = cartSlice.actions;

// ==================== SELECTORS ====================

// User cart selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectCartUpdating = (state: { cart: CartState }) => state.cart.updating;

// Admin cart selectors
export const selectAdminCartItems = (state: { cart: CartState }) => state.cart.adminCartItems;
export const selectAdminCartStats = (state: { cart: CartState }) => state.cart.adminCartStats;
export const selectAdminCartLoading = (state: { cart: CartState }) => state.cart.adminLoading;
export const selectAdminCartError = (state: { cart: CartState }) => state.cart.adminError;

// Memoized selectors to prevent unnecessary re-renders
export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart?.items || []
);

export const selectCartTotal = createSelector(
  [selectCart],
  (cart) => cart?.total || 0
);

export const selectCartItemCount = createSelector(
  [selectCart],
  (cart) => cart?.itemCount || 0
);

// Admin memoized selectors
export const selectAdminCartItemCount = createSelector(
  [selectAdminCartItems],
  (items) => items.length
);

export const selectAdminCartTotalValue = createSelector(
  [selectAdminCartItems],
  (items) => items.reduce((sum, item) => {
    // Use priceAtAdd, or fall back to variant price, or product basePrice
    const price = item.priceAtAdd ?? item.variant?.price ?? item.product?.basePrice ?? 0;
    return sum + (price * item.quantity);
  }, 0)
);

export default cartSlice.reducer;