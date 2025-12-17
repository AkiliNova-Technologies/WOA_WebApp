// redux/slices/vendorsSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

export interface VendorKYC {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  taxId?: string;
  registrationNumber?: string;
  businessType: 'individual' | 'company' | 'cooperative';
  documents: Array<{
    type: 'id_card' | 'business_registration' | 'tax_certificate' | 'utility_bill' | 'other';
    url: string;
    uploadedAt: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewNotes?: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  businessLogo?: string;
  businessBanner?: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  rating: number;
  reviewCount: number;
  followerCount: number;
  productCount: number;
  vendorStatus: 'pending' | 'active' | 'suspended' | 'deactivated' | 'deleted';
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt: string;
  kyc?: VendorKYC;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export interface PublicVendor {
  id: string;
  businessName: string;
  businessDescription?: string;
  businessLogo?: string;
  businessBanner?: string;
  rating: number;
  reviewCount: number;
  followerCount: number;
  productCount: number;
  isVerified: boolean;
  joinedAt: string;
  isFollowing?: boolean;
}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  suspendedVendors: number;
  deactivatedVendors: number;
  deletedVendors: number;
  averageRating: number;
  totalProducts: number;
  totalFollowers: number;
}

interface VendorsState {
  vendors: VendorProfile[];
  publicVendors: PublicVendor[];
  pendingVendors: VendorProfile[];
  selectedVendor: VendorProfile | null;
  stats: VendorStats | null;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  actionError: string | null;
}

const initialState: VendorsState = {
  vendors: [],
  publicVendors: [],
  pendingVendors: [],
  selectedVendor: null,
  stats: null,
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
};

// Vendor KYC submission/update
export const submitVendorKYC = createAsyncThunk(
  'vendors/submitKYC',
  async (kycData: FormData | any, { rejectWithValue }) => {
    try {
      const isFormData = kycData instanceof FormData;
      const response = await api.post('/api/v1/vendor/kyc', kycData, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : {},
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit KYC'
      );
    }
  }
);

// Close own shop
export const closeVendorShop = createAsyncThunk(
  'vendors/closeShop',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/vendor/close');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to close shop'
      );
    }
  }
);

// Soft delete own vendor profile
export const deleteVendorProfile = createAsyncThunk(
  'vendors/deleteProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/vendor/delete');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete profile'
      );
    }
  }
);

// Admin: Suspend a vendor
export const suspendVendor = createAsyncThunk(
  'vendors/suspend',
  async (vendorId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/vendor/suspend`, { vendorId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to suspend vendor'
      );
    }
  }
);

// Admin: Activate a vendor
export const activateVendor = createAsyncThunk(
  'vendors/activate',
  async (vendorId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/vendor/activate`, { vendorId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to activate vendor'
      );
    }
  }
);

// Admin: Approve vendor KYC
export const approveVendorKYC = createAsyncThunk(
  'vendors/approveKYC',
  async (vendorId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/vendor/approve`, { vendorId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve KYC'
      );
    }
  }
);

// Admin: List all vendors with pending KYC
export const fetchPendingVendors = createAsyncThunk(
  'vendors/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/vendor/pending');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch pending vendors'
      );
    }
  }
);

// Get single vendor details
export const fetchVendor = createAsyncThunk(
  'vendors/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/vendor/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vendor'
      );
    }
  }
);

// Admin: Reactivate soft-deleted vendor
export const reactivateVendor = createAsyncThunk(
  'vendors/reactivate',
  async (vendorId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/vendor/${vendorId}/reactivate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reactivate vendor'
      );
    }
  }
);

// Public: Get vendor storefront data
export const fetchPublicVendor = createAsyncThunk(
  'vendors/fetchPublic',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/vendor/public/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch public vendor'
      );
    }
  }
);

// Follow or unfollow a vendor
export const toggleFollowVendor = createAsyncThunk(
  'vendors/toggleFollow',
  async (vendorId: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/vendor/me/followed-vendors', { vendorId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle follow'
      );
    }
  }
);

// Get followed vendors
export const fetchFollowedVendors = createAsyncThunk(
  'vendors/fetchFollowed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/vendor/me/followed-vendors');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch followed vendors'
      );
    }
  }
);

// Get all vendors (admin)
export const fetchAllVendors = createAsyncThunk(
  'vendors/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/vendor');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vendors'
      );
    }
  }
);

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setSelectedVendor: (state, action: PayloadAction<VendorProfile>) => {
      state.selectedVendor = action.payload;
    },
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },
    clearError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    updateVendorInList: (state, action: PayloadAction<VendorProfile>) => {
      const index = state.vendors.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
      if (state.selectedVendor?.id === action.payload.id) {
        state.selectedVendor = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit KYC
      .addCase(submitVendorKYC.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(submitVendorKYC.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedVendor = action.payload;
      })
      .addCase(submitVendorKYC.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })
      
      // Close shop
      .addCase(closeVendorShop.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(closeVendorShop.fulfilled, (state, _action) => {
        state.actionLoading = false;
        if (state.selectedVendor) {
          state.selectedVendor.vendorStatus = 'deactivated';
        }
      })
      .addCase(closeVendorShop.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })
      
      // Delete profile
      .addCase(deleteVendorProfile.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteVendorProfile.fulfilled, (state, _action) => {
        state.actionLoading = false;
        if (state.selectedVendor) {
          state.selectedVendor.vendorStatus = 'deleted';
        }
      })
      .addCase(deleteVendorProfile.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })
      
      // Suspend vendor
      .addCase(suspendVendor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(suspendVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const vendor = state.vendors.find(v => v.id === action.payload.id);
        if (vendor) {
          vendor.vendorStatus = 'suspended';
        }
      })
      .addCase(suspendVendor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })
      
      // Activate vendor
      .addCase(activateVendor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(activateVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const vendor = state.vendors.find(v => v.id === action.payload.id);
        if (vendor) {
          vendor.vendorStatus = 'active';
        }
      })
      .addCase(activateVendor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })
      
      // Approve KYC
      .addCase(approveVendorKYC.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(approveVendorKYC.fulfilled, (state, action) => {
        state.actionLoading = false;
        const vendor = state.vendors.find(v => v.id === action.payload.id);
        if (vendor && vendor.kyc) {
          vendor.kyc.status = 'approved';
          vendor.vendorStatus = 'active';
        }
      })
      .addCase(approveVendorKYC.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })
      
      // Fetch pending vendors
      .addCase(fetchPendingVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingVendors = action.payload;
      })
      .addCase(fetchPendingVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single vendor
      .addCase(fetchVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVendor = action.payload;
      })
      .addCase(fetchVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reactivate vendor
      .addCase(reactivateVendor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(reactivateVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const vendor = state.vendors.find(v => v.id === action.payload.id);
        if (vendor) {
          vendor.vendorStatus = 'active';
        }
      })
      .addCase(reactivateVendor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })
      
      // Fetch public vendor
      .addCase(fetchPublicVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVendor = action.payload;
      })
      .addCase(fetchPublicVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Toggle follow
      .addCase(toggleFollowVendor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(toggleFollowVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update follower count and following status
        const vendor = state.publicVendors.find(v => v.id === action.payload.vendorId);
        if (vendor) {
          vendor.isFollowing = action.payload.isFollowing;
          vendor.followerCount = action.payload.followerCount;
        }
      })
      .addCase(toggleFollowVendor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      })
      
      // Fetch followed vendors
      .addCase(fetchFollowedVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowedVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.publicVendors = action.payload;
      })
      .addCase(fetchFollowedVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch all vendors
      .addCase(fetchAllVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchAllVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedVendor, clearSelectedVendor, clearError, updateVendorInList } = vendorsSlice.actions;

// Selectors
export const selectVendors = (state: { vendors: VendorsState }) => state.vendors.vendors;
export const selectPublicVendors = (state: { vendors: VendorsState }) => state.vendors.publicVendors;
export const selectPendingVendors = (state: { vendors: VendorsState }) => state.vendors.pendingVendors;
export const selectSelectedVendor = (state: { vendors: VendorsState }) => state.vendors.selectedVendor;
export const selectVendorStats = (state: { vendors: VendorsState }) => state.vendors.stats;
export const selectVendorsLoading = (state: { vendors: VendorsState }) => state.vendors.loading;
export const selectVendorsError = (state: { vendors: VendorsState }) => state.vendors.error;
export const selectVendorActionLoading = (state: { vendors: VendorsState }) => state.vendors.actionLoading;
export const selectVendorActionError = (state: { vendors: VendorsState }) => state.vendors.actionError;

export default vendorsSlice.reducer;