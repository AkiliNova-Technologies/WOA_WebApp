import {
  createAsyncThunk,
  createSlice,
  // type PayloadAction
} from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    images: Array<{
      url: string;
      isPrimary: boolean;
    }>;
    vendor: {
      id: string;
      businessName: string;
    };
  };
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  adding: boolean;
  removing: boolean;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  adding: false,
  removing: false,
};

// Fetch wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/me/wishlist");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/v1/me/wishlist", { productId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to wishlist"
      );
    }
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/me/wishlist/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from wishlist"
      );
    }
  }
);

// Move to cart
export const moveToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/me/wishlist/${id}/move-to-cart`);
      return { id, cartItem: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to move to cart"
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.adding = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.adding = false;
        // Check if item already exists
        const exists = state.items.some(
          (item) => item.productId === action.payload.productId
        );
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.adding = false;
        state.error = action.payload as string;
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.removing = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.removing = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.removing = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist, clearError } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state: { wishlist: WishlistState }) =>
  state.wishlist.items;
export const selectWishlistLoading = (state: { wishlist: WishlistState }) =>
  state.wishlist.loading;
export const selectWishlistError = (state: { wishlist: WishlistState }) =>
  state.wishlist.error;
export const selectAddingToWishlist = (state: { wishlist: WishlistState }) =>
  state.wishlist.adding;
export const selectRemovingFromWishlist = (state: {
  wishlist: WishlistState;
}) => state.wishlist.removing;

export default wishlistSlice.reducer;
