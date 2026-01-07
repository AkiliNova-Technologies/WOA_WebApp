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

export interface AdminWishlistStats {
  totalWishlistItems: number;
  totalConversions: number;
  wishlistChangePct: number;
  conversionsChangePct: number;
  thisMonth: {
    wishlistAdds: number;
    conversions: number;
  };
  previousMonth: {
    wishlistAdds: number;
    conversions: number;
  };
}

export interface AdminWishlistProduct {
  productId: string;
  name: string;
  image: string;
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  };
  wishlistCount: number;
  stock: number;
  lastWishlistedAt: string;
}

export interface AdminWishlistResponse {
  stats: AdminWishlistStats;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  data: AdminWishlistProduct[];
}

export interface AdminWishlistParams {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  page?: number;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  adding: boolean;
  removing: boolean;
  // Admin state
  adminData: {
    stats: AdminWishlistStats | null;
    products: AdminWishlistProduct[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    } | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  adding: false,
  removing: false,
  adminData: {
    stats: null,
    products: [],
    pagination: null,
    loading: false,
    error: null,
  },
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

// Fetch admin wishlist
export const fetchAdminWishlist = createAsyncThunk(
  "wishlist/fetchAdmin",
  async (params: AdminWishlistParams | undefined = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
      if (params?.subcategoryId) queryParams.append("subcategoryId", params.subcategoryId);
      if (params?.page) queryParams.append("page", params.page.toString());

      const queryString = queryParams.toString();
      const url = `/api/v1/admin/wishlist${queryString ? `?${queryString}` : ""}`;
      
      const response = await api.get(url);
      return response.data as AdminWishlistResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin wishlist"
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
    clearAdminError: (state) => {
      state.adminData.error = null;
    },
    clearAdminData: (state) => {
      state.adminData = {
        stats: null,
        products: [],
        pagination: null,
        loading: false,
        error: null,
      };
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
      })

      // Fetch admin wishlist
      .addCase(fetchAdminWishlist.pending, (state) => {
        state.adminData.loading = true;
        state.adminData.error = null;
      })
      .addCase(fetchAdminWishlist.fulfilled, (state, action) => {
        state.adminData.loading = false;
        state.adminData.stats = action.payload.stats;
        state.adminData.products = action.payload.data;
        state.adminData.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminWishlist.rejected, (state, action) => {
        state.adminData.loading = false;
        state.adminData.error = action.payload as string;
      });
  },
});

export const { clearWishlist, clearError, clearAdminError, clearAdminData } = wishlistSlice.actions;

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

// Admin selectors
export const selectAdminWishlistStats = (state: { wishlist: WishlistState }) =>
  state.wishlist.adminData.stats;
export const selectAdminWishlistProducts = (state: { wishlist: WishlistState }) =>
  state.wishlist.adminData.products;
export const selectAdminWishlistPagination = (state: { wishlist: WishlistState }) =>
  state.wishlist.adminData.pagination;
export const selectAdminWishlistLoading = (state: { wishlist: WishlistState }) =>
  state.wishlist.adminData.loading;
export const selectAdminWishlistError = (state: { wishlist: WishlistState }) =>
  state.wishlist.adminData.error;

export default wishlistSlice.reducer;