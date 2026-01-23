import { createAsyncThunk, createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  salePrice?: number;
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
    stock: number;
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

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  updating: false,
};

// Helper function to transform API response to match CartItem structure
const transformCartData = (apiCart: any): Cart => {
  const transformedItems = apiCart.items.map((item: any) => {
    // Get variant data - either from item.variant or first variant in product.variants
    const variant = item.variant || item.product?.variants?.[0];
    
    // Determine pricing
    const comparePrice = variant?.compareAtPrice;
    const currentPrice = variant?.price;
    
    return {
      ...item,
      // If there's a compareAtPrice, use it as the original price
      price: comparePrice || currentPrice || 0,
      // The current price becomes the sale price if there's a compare price
      salePrice: comparePrice ? currentPrice : undefined,
      product: {
        ...item.product,
        // Use the variant's SKU or fallback to product-level SKU
        sku: variant?.sku || item.product?.sku || '',
        // Ensure stock is available
        stock: variant?.stockQuantity ?? 0,
        // Add vendor if not present (you may need to adjust based on your API structure)
        vendor: item.product?.vendor || {
          id: '',
          businessName: 'Unknown Vendor'
        }
      }
    };
  });

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

// Get or create cart
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/cart');
      return transformCartData(response.data.cart);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart'
      );
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/cart/items', { productId, quantity });
      return transformCartData(response.data.cart);
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
      return transformCartData(response.data.cart);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update cart item'
      );
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/cart/items/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item from cart'
      );
    }
  }
);

// Move item to wishlist
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

// Merge guest cart with user cart
export const mergeCart = createAsyncThunk(
  'cart/merge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/cart/merge');
      return transformCartData(response.data.cart);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to merge cart'
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
        if (state.cart) {
          state.cart.items = state.cart.items.filter(item => item.id !== action.payload);
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
      });
  },
});

export const { setCart, clearCart, clearError, updateCartItemQuantity } = cartSlice.actions;

// Basic selectors
// const selectCartState = (state: { cart: CartState }) => state.cart;
export const selectCart = (state: { cart: CartState }) => state.cart.cart;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectCartUpdating = (state: { cart: CartState }) => state.cart.updating;

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

export default cartSlice.reducer;