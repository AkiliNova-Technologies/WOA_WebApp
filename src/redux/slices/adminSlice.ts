import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string;
  module: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "SYSTEM_MANAGER";
  roles: Role[];
  accountStatus: "active" | "suspended" | "pending_deletion";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  permissions: Permission[];
  roles: Role[];
  admins: AdminUser[];
  selectedAdmin: AdminUser | null;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
}

const initialState: AdminState = {
  permissions: [],
  roles: [],
  admins: [],
  selectedAdmin: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
};

// Permissions
export const fetchPermissions = createAsyncThunk(
  "admin/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/admin/permissions");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch permissions"
      );
    }
  }
);

export const createPermission = createAsyncThunk(
  "admin/createPermission",
  async (
    permissionData: Omit<Permission, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        "/api/v1/admin/create/permission",
        permissionData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create permission"
      );
    }
  }
);

// Roles
export const fetchRoles = createAsyncThunk(
  "admin/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/admin/roles");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles"
      );
    }
  }
);

export const createRole = createAsyncThunk(
  "admin/createRole",
  async (
    {
      name,
      description,
      permissionIds,
    }: { name: string; description?: string; permissionIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/admin/roles", {
        name,
        description,
        permissionIds,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create role"
      );
    }
  }
);

export const updateRole = createAsyncThunk(
  "admin/updateRole",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string; permissionIds?: string[] };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/api/v1/admin/roles/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role"
      );
    }
  }
);

export const deleteRole = createAsyncThunk(
  "admin/deleteRole",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/roles/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete role"
      );
    }
  }
);

// Admin Users
export const fetchAdmins = createAsyncThunk(
  "admin/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/admin/admins");
      console.log("Fetch Admins Response:", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admins"
      );
    }
  }
);

export const createAdmin = createAsyncThunk(
  "admin/createAdmin",
  async (
    adminData: {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/admin/create-admin", adminData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create admin"
      );
    }
  }
);

export const fetchAdmin = createAsyncThunk(
  "admin/fetchAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/admins/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin"
      );
    }
  }
);

export const updateAdmin = createAsyncThunk(
  "admin/updateAdmin",
  async (
    {
      id,
      data,
    }: { id: string; data: { firstName?: string; lastName?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/admin/admins/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update admin"
      );
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  "admin/deleteAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/admins/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete admin"
      );
    }
  }
);

export const suspendAdmin = createAsyncThunk(
  "admin/suspendAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/admin/admins/${id}/suspend`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to suspend admin"
      );
    }
  }
);

export const activateAdmin = createAsyncThunk(
  "admin/activateAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/admin/admins/${id}/activate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to activate admin"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setSelectedAdmin: (state, action: PayloadAction<AdminUser>) => {
      state.selectedAdmin = action.payload;
    },
    clearSelectedAdmin: (state) => {
      state.selectedAdmin = null;
    },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.data || [];
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create role
      .addCase(createRole.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.createLoading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      // Fetch admins
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;

        if (
          action.payload &&
          action.payload.data &&
          Array.isArray(action.payload.data)
        ) {
          state.admins = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.admins = action.payload;
        } else {
          console.error("Unexpected API response format:", action.payload);
          state.admins = [];
        }

        console.log("Admins after processing:", state.admins);
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create admin
      .addCase(createAdmin.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.createLoading = false;
        state.admins.push(action.payload);
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      // Fetch admin
      .addCase(fetchAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAdmin = action.payload;
      })
      .addCase(fetchAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAdmin, clearSelectedAdmin, clearError } =
  adminSlice.actions;

// Selectors
export const selectPermissions = (state: { admin: AdminState }) =>
  state.admin.permissions;
export const selectRoles = (state: { admin: AdminState }) => state.admin.roles;
export const selectAdmins = (state: { admin: AdminState }) =>
  state.admin.admins;
export const selectSelectedAdmin = (state: { admin: AdminState }) =>
  state.admin.selectedAdmin;
export const selectAdminLoading = (state: { admin: AdminState }) =>
  state.admin.loading;
export const selectAdminError = (state: { admin: AdminState }) =>
  state.admin.error;
export const selectCreateAdminLoading = (state: { admin: AdminState }) =>
  state.admin.createLoading;
export const selectCreateAdminError = (state: { admin: AdminState }) =>
  state.admin.createError;

export default adminSlice.reducer;
