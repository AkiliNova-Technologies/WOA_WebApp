import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface Address {
  id: string;
  // Backend fields (from API response)
  recipient?: string;
  addLine1?: string;
  addLine2?: string | null;
  addLine3?: string | null;
  postCode?: string;
  country: string;
  isDefault: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Frontend fields (may not be in API response)
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  street?: string;
  address?: string;
  district?: string;
  additionalDetails?: string;
}

export interface CreateAddressDTO {
  // Backend expects these fields
  recipient?: string;
  addLine1?: string;
  addLine2?: string | null;
  addLine3?: string | null;
  postCode?: string;
  country: string;
  isDefault?: boolean;
  
  // Legacy frontend fields (kept for compatibility)
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  street?: string;
  address?: string;
  district?: string;
  additionalDetails?: string;
}

export interface UpdateAddressDTO extends Partial<CreateAddressDTO> {
  id: string;
}

export interface AddressesState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  currentAddress: Address | null;
  loadingCurrent: boolean;
  selectedAddress: Address | null;
  loadingSelected: boolean;
}

const initialState: AddressesState = {
  addresses: [],
  loading: false,
  error: null,
  currentAddress: null,
  loadingCurrent: false,
  selectedAddress: null,
  loadingSelected: false,
};

// Async thunks
export const fetchAddresses = createAsyncThunk<
  Address[], 
  void, 
  { rejectValue: string }
>("addresses/fetchAddresses", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/v1/me/addresses");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch addresses"
    );
  }
});

export const fetchAddressById = createAsyncThunk<
  Address,
  string,
  { rejectValue: string }
>("addresses/fetchAddressById", async (addressId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/v1/me/addresses/${addressId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch address"
    );
  }
});

export const createAddress = createAsyncThunk<
  Address,
  CreateAddressDTO,
  { rejectValue: string }
>("addresses/createAddress", async (addressData, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/v1/me/addresses", addressData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create address"
    );
  }
});

export const updateAddress = createAsyncThunk<
  Address,
  UpdateAddressDTO,
  { rejectValue: string }
>("addresses/updateAddress", async ({ id, ...updateData }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/api/v1/me/addresses/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update address"
    );
  }
});

export const deleteAddress = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("addresses/deleteAddress", async (addressId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/v1/me/addresses/${addressId}`);
    return addressId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete address"
    );
  }
});

export const setDefaultAddress = createAsyncThunk<
  Address,
  string,
  { rejectValue: string }
>("addresses/setDefaultAddress", async (addressId, { rejectWithValue }) => {
  try {
    const response = await api.patch(
      `/api/v1/me/addresses/${addressId}/default`
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to set default address"
    );
  }
});

const addressesSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
      // Set default address as current
      const defaultAddress = action.payload.find((addr) => addr.isDefault);
      if (defaultAddress) {
        state.currentAddress = defaultAddress;
      }
    },
    setCurrentAddress: (state, action: PayloadAction<Address | null>) => {
      state.currentAddress = action.payload;
    },
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
    clearAddresses: (state) => {
      state.addresses = [];
      state.currentAddress = null;
      state.selectedAddress = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedAddress: (state) => {
      state.selectedAddress = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch addresses
    builder.addCase(fetchAddresses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAddresses.fulfilled, (state, action) => {
      state.loading = false;
      state.addresses = action.payload;
      // TypeScript knows action.payload is Address[]
      const defaultAddress = action.payload.find((addr) => addr.isDefault);
      state.currentAddress =
        defaultAddress ||
        (action.payload.length > 0 ? action.payload[0] : null);
    });
    builder.addCase(fetchAddresses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch addresses";
    });

    // Fetch address by ID
    builder.addCase(fetchAddressById.pending, (state) => {
      state.loadingSelected = true;
      state.error = null;
    });
    builder.addCase(fetchAddressById.fulfilled, (state, action) => {
      state.loadingSelected = false;
      state.selectedAddress = action.payload;
      
      // Also update the address in the addresses array if it exists
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        state.addresses[index] = action.payload;
      } else {
        // If address is not in the list, add it
        state.addresses.push(action.payload);
      }
      
      // Update current address if it's the same one
      if (state.currentAddress?.id === action.payload.id) {
        state.currentAddress = action.payload;
      }
    });
    builder.addCase(fetchAddressById.rejected, (state, action) => {
      state.loadingSelected = false;
      state.error = action.payload || "Failed to fetch address";
    });

    // Create address
    builder.addCase(createAddress.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createAddress.fulfilled, (state, action) => {
      state.loading = false;
      // Add new address to list
      state.addresses.push(action.payload);

      // If this is set as default, update all other addresses
      if (action.payload.isDefault) {
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === action.payload.id,
        }));
        state.currentAddress = action.payload;
      }
    });
    builder.addCase(createAddress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to create address";
    });

    // Update address
    builder.addCase(updateAddress.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAddress.fulfilled, (state, action) => {
      state.loading = false;
      // Update address in list
      state.addresses = state.addresses.map((addr) =>
        addr.id === action.payload.id ? action.payload : addr
      );

      // If this is set as default, update all other addresses
      if (action.payload.isDefault) {
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === action.payload.id,
        }));
        state.currentAddress = action.payload;
      } else if (state.currentAddress?.id === action.payload.id) {
        state.currentAddress = action.payload;
      }
      
      // Update selected address if it's the same one
      if (state.selectedAddress?.id === action.payload.id) {
        state.selectedAddress = action.payload;
      }
    });
    builder.addCase(updateAddress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update address";
    });

    // Delete address
    builder.addCase(deleteAddress.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAddress.fulfilled, (state, action) => {
      state.loading = false;
      // Remove address from list
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.payload
      );

      // If deleted address was current, update current address
      if (state.currentAddress?.id === action.payload) {
        state.currentAddress =
          state.addresses.length > 0 ? state.addresses[0] : null;
      }
      
      // Clear selected address if it was deleted
      if (state.selectedAddress?.id === action.payload) {
        state.selectedAddress = null;
      }
    });
    builder.addCase(deleteAddress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete address";
    });

    // Set default address
    builder.addCase(setDefaultAddress.pending, (state) => {
      state.loadingCurrent = true;
      state.error = null;
    });
    builder.addCase(setDefaultAddress.fulfilled, (state, action) => {
      state.loadingCurrent = false;
      // Update all addresses to set the correct default
      state.addresses = state.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === action.payload.id,
      }));
      state.currentAddress = action.payload;
      
      // Update selected address if it's the same one
      if (state.selectedAddress?.id === action.payload.id) {
        state.selectedAddress = action.payload;
      }
    });
    builder.addCase(setDefaultAddress.rejected, (state, action) => {
      state.loadingCurrent = false;
      state.error = action.payload || "Failed to set default address";
    });
  },
});

export const { 
  setAddresses, 
  setCurrentAddress, 
  setSelectedAddress,
  clearAddresses, 
  clearError,
  clearSelectedAddress,
} = addressesSlice.actions;

export default addressesSlice.reducer;