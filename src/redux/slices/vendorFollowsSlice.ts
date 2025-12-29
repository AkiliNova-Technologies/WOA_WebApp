import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface Vendor {
  id: string;
  name: string;
  avatar: string;
  store: string;
  vendorScore: number;
  itemsSold: number;
  followersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowResponse {
  vendorId: string;
  userId: string;
  createdAt: string;
}

export interface FollowerCountResponse {
  count: number;
}

export interface IsFollowingResponse {
  isFollowing: boolean;
}

export interface FollowingVendorsResponse {
  following: Vendor[];
  total: number;
  limit: number;
  offset: number;
}

export interface VendorFollowsState {
  followingVendors: Vendor[];
  followers: Vendor[];
  loading: boolean;
  error: string | null;
  followingLoading: { [vendorId: string]: boolean };
  followerCounts: { [vendorId: string]: number };
  isFollowingMap: { [vendorId: string]: boolean };
}

const initialState: VendorFollowsState = {
  followingVendors: [],
  followers: [],
  loading: false,
  error: null,
  followingLoading: {},
  followerCounts: {},
  isFollowingMap: {},
};

// Async thunks
export const fetchFollowingVendors = createAsyncThunk<
  Vendor[],
  void,
  { rejectValue: string }
>("vendorFollows/fetchFollowingVendors", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/v1/vendor-follows/following");
    // API returns { following: [], total: 0, limit: 20, offset: 0 }
    return response.data.following || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch following vendors"
    );
  }
});

export const fetchFollowers = createAsyncThunk<
  Vendor[],
  void,
  { rejectValue: string }
>("vendorFollows/fetchFollowers", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/v1/vendor-follows/followers");
    // Handle both array response and object with followers array
    return Array.isArray(response.data) 
      ? response.data 
      : response.data.followers || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch followers"
    );
  }
});

export const followVendor = createAsyncThunk<
  FollowResponse,
  string,
  { rejectValue: string }
>("vendorFollows/followVendor", async (vendorId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/api/v1/vendor-follows/${vendorId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to follow vendor"
    );
  }
});

export const unfollowVendor = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("vendorFollows/unfollowVendor", async (vendorId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/v1/vendor-follows/${vendorId}`);
    return vendorId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to unfollow vendor"
    );
  }
});

export const fetchFollowerCount = createAsyncThunk<
  { vendorId: string; count: number },
  string,
  { rejectValue: string }
>(
  "vendorFollows/fetchFollowerCount",
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/v1/vendor-follows/${vendorId}/followers/count`
      );
      return { vendorId, count: response.data.count };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch follower count"
      );
    }
  }
);

export const checkIsFollowing = createAsyncThunk<
  { vendorId: string; isFollowing: boolean },
  string,
  { rejectValue: string }
>("vendorFollows/checkIsFollowing", async (vendorId, { rejectWithValue }) => {
  try {
    const response = await api.get(
      `/api/v1/vendor-follows/${vendorId}/is-following`
    );
    return { vendorId, isFollowing: response.data.isFollowing };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to check following status"
    );
  }
});

const vendorFollowsSlice = createSlice({
  name: "vendorFollows",
  initialState,
  reducers: {
    setFollowingVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.followingVendors = action.payload;
    },
    setFollowers: (state, action: PayloadAction<Vendor[]>) => {
      state.followers = action.payload;
    },
    clearFollowingVendors: (state) => {
      state.followingVendors = [];
    },
    clearFollowers: (state) => {
      state.followers = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setIsFollowing: (
      state,
      action: PayloadAction<{ vendorId: string; isFollowing: boolean }>
    ) => {
      state.isFollowingMap[action.payload.vendorId] =
        action.payload.isFollowing;
    },
  },
  extraReducers: (builder) => {
    // Fetch following vendors
    builder.addCase(fetchFollowingVendors.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFollowingVendors.fulfilled, (state, action) => {
      state.loading = false;
      state.followingVendors = action.payload;
      // Update isFollowingMap
      action.payload.forEach((vendor) => {
        state.isFollowingMap[vendor.id] = true;
      });
    });
    builder.addCase(fetchFollowingVendors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch following vendors";
    });

    // Fetch followers
    builder.addCase(fetchFollowers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFollowers.fulfilled, (state, action) => {
      state.loading = false;
      state.followers = action.payload;
    });
    builder.addCase(fetchFollowers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch followers";
    });

    // Follow vendor
    builder.addCase(followVendor.pending, (state, action) => {
      state.followingLoading[action.meta.arg] = true;
      state.error = null;
    });
    builder.addCase(followVendor.fulfilled, (state, action) => {
      state.followingLoading[action.payload.vendorId] = false;
      state.isFollowingMap[action.payload.vendorId] = true;
      // Increment follower count if it exists
      if (state.followerCounts[action.payload.vendorId] !== undefined) {
        state.followerCounts[action.payload.vendorId]++;
      }
    });
    builder.addCase(followVendor.rejected, (state, action) => {
      state.followingLoading[action.meta.arg] = false;
      state.error = action.payload || "Failed to follow vendor";
    });

    // Unfollow vendor
    builder.addCase(unfollowVendor.pending, (state, action) => {
      state.followingLoading[action.meta.arg] = true;
      state.error = null;
    });
    builder.addCase(unfollowVendor.fulfilled, (state, action) => {
      const vendorId = action.payload;
      state.followingLoading[vendorId] = false;
      state.isFollowingMap[vendorId] = false;
      // Remove from following list
      state.followingVendors = state.followingVendors.filter(
        (vendor) => vendor.id !== vendorId
      );
      // Decrement follower count if it exists
      if (state.followerCounts[vendorId] !== undefined) {
        state.followerCounts[vendorId] = Math.max(
          0,
          state.followerCounts[vendorId] - 1
        );
      }
    });
    builder.addCase(unfollowVendor.rejected, (state, action) => {
      state.followingLoading[action.meta.arg] = false;
      state.error = action.payload || "Failed to unfollow vendor";
    });

    // Fetch follower count
    builder.addCase(fetchFollowerCount.fulfilled, (state, action) => {
      state.followerCounts[action.payload.vendorId] = action.payload.count;
    });

    // Check is following
    builder.addCase(checkIsFollowing.fulfilled, (state, action) => {
      state.isFollowingMap[action.payload.vendorId] =
        action.payload.isFollowing;
    });
  },
});

export const {
  setFollowingVendors,
  setFollowers,
  clearFollowingVendors,
  clearFollowers,
  clearError,
  setIsFollowing,
} = vendorFollowsSlice.actions;

export default vendorFollowsSlice.reducer;