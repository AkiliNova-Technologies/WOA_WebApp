// In usersSlice.ts - Update the interface and fetchUsers thunk
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  address?: string;
  street?: string;
  createdAt: string;
  updatedAt: string;
  accountStatus?: 'active' | 'inactive' | 'suspended' | 'pending_deletion' | 'disabled' | 'deleted';
  isActive?: boolean;
  avatar?: string;
  vendorStatus?: string;
  userType?: string;
  roles?: string[];
  // Add these optional properties
  totalOrders?: number;
  totalSpent?: number;
  tier?: string;
  [key: string]: any; // Allow additional properties
}

// Add paginated response interface
export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T[];
}

export interface KYCData {
  businessName: string;
  businessRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  businessAddress: string;
  city: string;
  country: string;
  postalCode?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPhoneNumber: string;
  ownerEmail: string;
  idType: 'national_id' | 'passport' | 'driving_license';
  idNumber: string;
  idFrontImage: string;
  idBackImage: string;
  businessLicenseImage?: string;
  taxCertificateImage?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
  termsAccepted: boolean;
}

interface UsersState {
  profile: UserProfile | null;
  usersList: UserProfile[];
  loading: boolean;
  error: string | null;
  kycLoading: boolean;
  kycError: string | null;
  kycSubmitted: boolean;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const initialState: UsersState = {
  profile: null,
  usersList: [],
  loading: false,
  error: null,
  kycLoading: false,
  kycError: null,
  kycSubmitted: false,
  pagination: {
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  },
};

// Get user profile
export const fetchUserProfile = createAsyncThunk(
  'users/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/user/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile'
      );
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'users/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await api.patch('/api/v1/user/profile/edit', profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

// Delete user account
export const deleteUserAccount = createAsyncThunk(
  'users/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/api/v1/user/delete/account');
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete account'
      );
    }
  }
);

// Submit vendor KYC
export const submitVendorKYC = createAsyncThunk(
  'users/submitKYC',
  async (kycData: KYCData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/users/vendor/kyc', kycData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit KYC'
      );
    }
  }
);

// List users (admin only) - FIXED to handle paginated response
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters: { 
    role?: string; 
    page?: number; 
    limit?: number; 
    sort?: string;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      // Convert page to offset if provided
      const params: any = { ...filters };
      if (params.page && params.limit) {
        params.offset = (params.page - 1) * params.limit;
        delete params.page;
      }
      
      const response = await api.get('/api/v1/users', { params });
      return response.data as PaginatedResponse<UserProfile>;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

// Update user role (admin only)
export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ id, role }: { id: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/users/${id}`, { role });
      return response.data as UserProfile;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user role'
      );
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    clearError: (state) => {
      state.error = null;
      state.kycError = null;
    },
    resetKYCState: (state) => {
      state.kycSubmitted = false;
      state.kycError = null;
    },
    clearUsersList: (state) => {
      state.usersList = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete account
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Submit KYC
      .addCase(submitVendorKYC.pending, (state) => {
        state.kycLoading = true;
        state.kycError = null;
      })
      .addCase(submitVendorKYC.fulfilled, (state) => {
        state.kycLoading = false;
        state.kycSubmitted = true;
        if (state.profile) {
          state.profile.vendorStatus = 'pending';
        }
      })
      .addCase(submitVendorKYC.rejected, (state, action) => {
        state.kycLoading = false;
        state.kycError = action.payload as string;
      })
      
      // Fetch users list - FIXED to handle paginated response
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array and paginated response
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.usersList = action.payload.data;
          state.pagination = {
            total: action.payload.total || action.payload.data.length,
            limit: action.payload.limit || 50,
            offset: action.payload.offset || 0,
            hasMore: action.payload.offset + action.payload.limit < action.payload.total,
          };
        } else if (Array.isArray(action.payload)) {
          // Fallback for non-paginated response
          state.usersList = action.payload;
          state.pagination = {
            total: action.payload.length,
            limit: 50,
            offset: 0,
            hasMore: false,
          };
        } else {
          state.usersList = [];
          state.pagination = initialState.pagination;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        // Update the user in the list
        const updatedUser = action.payload;
        state.usersList = state.usersList.map(user =>
          user.id === updatedUser.id ? updatedUser : user
        );
        // Also update profile if it's the current user
        if (state.profile?.id === updatedUser.id) {
          state.profile = updatedUser;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProfile, clearProfile, clearError, resetKYCState, clearUsersList } = usersSlice.actions;

// Selectors - Add pagination selector
export const selectUserProfile = (state: { users: UsersState }) => state.users.profile;
export const selectUsersList = (state: { users: UsersState }) => state.users.usersList;
export const selectUsersLoading = (state: { users: UsersState }) => state.users.loading;
export const selectUsersError = (state: { users: UsersState }) => state.users.error;
export const selectKYCLoading = (state: { users: UsersState }) => state.users.kycLoading;
export const selectKYCError = (state: { users: UsersState }) => state.users.kycError;
export const selectKYCSubmitted = (state: { users: UsersState }) => state.users.kycSubmitted;
export const selectUsersPagination = (state: { users: UsersState }) => state.users.pagination;

export default usersSlice.reducer;