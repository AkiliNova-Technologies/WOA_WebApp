import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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
  phoneNumber?: string;
  department?: string;
  userType: "SYSTEM_MANAGER";
  role: string;
  roles: Role[];
  appRoleIds?: string[];
  permissionIds?: string[];
  accountStatus: "active" | "suspended" | "pending_deletion";
  lastLogin?: string;
  inviteLink?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  options?: string[];
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductType {
  id: string;
  subcategoryId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  // Permissions & Roles
  permissions: Permission[];
  roles: Role[];
  selectedRole: Role | null;

  // Admin Users
  admins: AdminUser[];
  selectedAdmin: AdminUser | null;

  // Categories & Attributes
  categories: Category[];
  selectedCategory: Category | null;
  subcategories: Subcategory[];
  attributes: Attribute[];

  // Product Types
  productTypes: ProductType[];
  selectedProductType: ProductType | null;

  // Products
  products: Product[];
  selectedProduct: Product | null;

  // Loading states
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
}

const initialState: AdminState = {
  permissions: [],
  roles: [],
  selectedRole: null,
  admins: [],
  selectedAdmin: null,
  categories: [],
  selectedCategory: null,
  subcategories: [],
  attributes: [],
  productTypes: [],
  selectedProductType: null,
  products: [],
  selectedProduct: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

// ============================================================================
// ASYNC THUNKS - PERMISSIONS
// ============================================================================

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
    permissionData: {
      key: string;
      name: string;
      description?: string;
      module: string;
    },
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

export const fetchPermission = createAsyncThunk(
  "admin/fetchPermission",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/permission/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch permission"
      );
    }
  }
);

export const updatePermission = createAsyncThunk(
  "admin/updatePermission",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/api/v1/admin/permission/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update permission"
      );
    }
  }
);

// ============================================================================
// ASYNC THUNKS - ROLES
// ============================================================================

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

export const fetchRole = createAsyncThunk(
  "admin/fetchRole",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/roles/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch role"
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

// ============================================================================
// ASYNC THUNKS - ADMIN USERS
// ============================================================================

export const fetchAdmins = createAsyncThunk(
  "admin/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/admin/admins");
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
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      department?: string;
      role: string;
      appRoleIds?: string[];
      permissionIds?: string[];
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
    }: {
      id: string;
      data: {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        department?: string;
      };
    },
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

// ============================================================================
// ASYNC THUNKS - CATEGORIES
// ============================================================================

export const fetchCategories = createAsyncThunk(
  "admin/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/admin/categories");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "admin/createCategory",
  async (
    categoryData: { name: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/admin/categories", categoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const fetchCategory = createAsyncThunk(
  "admin/fetchCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/categories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "admin/updateCategory",
  async (
    {
      id,
      data,
    }: { id: string; data: { name?: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/admin/categories/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "admin/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

export const uploadCategoryCoverImage = createAsyncThunk(
  "admin/uploadCategoryCoverImage",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/admin/categories/${id}/cover-image`,
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
        error.response?.data?.message || "Failed to upload cover image"
      );
    }
  }
);

// ============================================================================
// ASYNC THUNKS - ATTRIBUTES
// ============================================================================

export const fetchAttributes = createAsyncThunk(
  "admin/fetchAttributes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/admin/attributes");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attributes"
      );
    }
  }
);

export const fetchAttributesByCategory = createAsyncThunk(
  "admin/fetchAttributesByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/v1/admin/attributes/category/${categoryId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attributes"
      );
    }
  }
);

export const createAttribute = createAsyncThunk(
  "admin/createAttribute",
  async (
    {
      categoryId,
      data,
    }: {
      categoryId: string;
      data: {
        name: string;
        type: string;
        options?: string[];
        required: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/admin/attributes/category/${categoryId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create attribute"
      );
    }
  }
);

export const fetchAttribute = createAsyncThunk(
  "admin/fetchAttribute",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/attributes/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attribute"
      );
    }
  }
);

export const updateAttribute = createAsyncThunk(
  "admin/updateAttribute",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        type?: string;
        options?: string[];
        required?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/admin/attributes/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update attribute"
      );
    }
  }
);

export const deleteAttribute = createAsyncThunk(
  "admin/deleteAttribute",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/attributes/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete attribute"
      );
    }
  }
);

export const assignAttributesToSubcategory = createAsyncThunk(
  "admin/assignAttributesToSubcategory",
  async (
    {
      subcategoryId,
      attributeIds,
    }: { subcategoryId: string; attributeIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/admin/attributes/assign/subcategory/${subcategoryId}`,
        { attributeIds }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign attributes"
      );
    }
  }
);

// ============================================================================
// ASYNC THUNKS - PRODUCT TYPES
// ============================================================================

export const fetchProductTypes = createAsyncThunk(
  "admin/fetchProductTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/admin/product-types");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product types"
      );
    }
  }
);

export const fetchProductTypesBySubcategory = createAsyncThunk(
  "admin/fetchProductTypesBySubcategory",
  async (subcategoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/v1/admin/product-types/subcategory/${subcategoryId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product types"
      );
    }
  }
);

export const createProductType = createAsyncThunk(
  "admin/createProductType",
  async (
    {
      subcategoryId,
      data,
    }: {
      subcategoryId: string;
      data: { name: string; description?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/admin/product-types/subcategory/${subcategoryId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product type"
      );
    }
  }
);

export const fetchProductType = createAsyncThunk(
  "admin/fetchProductType",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/product-types/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product type"
      );
    }
  }
);

export const updateProductType = createAsyncThunk(
  "admin/updateProductType",
  async (
    {
      id,
      data,
    }: { id: string; data: { name?: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/api/v1/admin/product-types/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product type"
      );
    }
  }
);

export const deleteProductType = createAsyncThunk(
  "admin/deleteProductType",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/product-types/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product type"
      );
    }
  }
);

export const uploadProductTypeCoverImage = createAsyncThunk(
  "admin/uploadProductTypeCoverImage",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/admin/product-types/${id}/cover-image`,
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
        error.response?.data?.message || "Failed to upload cover image"
      );
    }
  }
);

// ============================================================================
// ASYNC THUNKS - PRODUCTS
// ============================================================================

export const fetchProduct = createAsyncThunk(
  "admin/fetchProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/products/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

export const reviewProduct = createAsyncThunk(
  "admin/reviewProduct",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        status: "approved" | "rejected" | "suspended";
        reviewNotes?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/admin/products/${id}/review`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to review product"
      );
    }
  }
);

// ============================================================================
// ASYNC THUNKS - SUPER ADMIN
// ============================================================================

export const resetUserPassword = createAsyncThunk(
  "admin/resetUserPassword",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/v1/super-admin/users/${userId}/reset-password`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset user password"
      );
    }
  }
);

export const disableAdminAccount = createAsyncThunk(
  "admin/disableAdminAccount",
  async (adminId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/v1/super-admin/admins/${adminId}/disable`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to disable admin account"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // Admin selection
    setSelectedAdmin: (state, action: PayloadAction<AdminUser>) => {
      state.selectedAdmin = action.payload;
    },
    clearSelectedAdmin: (state) => {
      state.selectedAdmin = null;
    },

    // Role selection
    setSelectedRole: (state, action: PayloadAction<Role>) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },

    // Category selection
    setSelectedCategory: (state, action: PayloadAction<Category>) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },

    // Product Type selection
    setSelectedProductType: (state, action: PayloadAction<ProductType>) => {
      state.selectedProductType = action.payload;
    },
    clearSelectedProductType: (state) => {
      state.selectedProductType = null;
    },

    // Product selection
    setSelectedProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    // Error clearing
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // PERMISSIONS
      // ========================================================================
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload.data || action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createPermission.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.createLoading = false;
        state.permissions.push(action.payload);
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      // ========================================================================
      // ROLES
      // ========================================================================
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.data || action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

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

      .addCase(fetchRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRole = action.payload;
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateRole.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.roles.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      .addCase(deleteRole.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.roles = state.roles.filter((r) => r.id !== action.payload);
        if (state.selectedRole?.id === action.payload) {
          state.selectedRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })

      // ========================================================================
      // ADMIN USERS
      // ========================================================================
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.admins = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.admins = action.payload;
        } else {
          state.admins = [];
        }
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

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
      })

      .addCase(updateAdmin.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.admins.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
        if (state.selectedAdmin?.id === action.payload.id) {
          state.selectedAdmin = action.payload;
        }
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      .addCase(deleteAdmin.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.admins = state.admins.filter((a) => a.id !== action.payload);
        if (state.selectedAdmin?.id === action.payload) {
          state.selectedAdmin = null;
        }
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })

      .addCase(suspendAdmin.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(suspendAdmin.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.admins.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
        if (state.selectedAdmin?.id === action.payload.id) {
          state.selectedAdmin = action.payload;
        }
      })
      .addCase(suspendAdmin.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      .addCase(activateAdmin.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(activateAdmin.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.admins.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
        if (state.selectedAdmin?.id === action.payload.id) {
          state.selectedAdmin = action.payload;
        }
      })
      .addCase(activateAdmin.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      // ========================================================================
      // CATEGORIES
      // ========================================================================
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data || action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createCategory.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.createLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCategory.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      .addCase(deleteCategory.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })

      // ========================================================================
      // ATTRIBUTES
      // ========================================================================
      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = action.payload.data || action.payload;
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAttributesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = action.payload.data || action.payload;
      })
      .addCase(fetchAttributesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createAttribute.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createAttribute.fulfilled, (state, action) => {
        state.createLoading = false;
        state.attributes.push(action.payload);
      })
      .addCase(createAttribute.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      .addCase(updateAttribute.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.attributes.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.attributes[index] = action.payload;
        }
      })
      .addCase(updateAttribute.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      .addCase(deleteAttribute.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteAttribute.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.attributes = state.attributes.filter(
          (a) => a.id !== action.payload
        );
      })
      .addCase(deleteAttribute.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })

      // ========================================================================
      // PRODUCT TYPES
      // ========================================================================
      .addCase(fetchProductTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes = action.payload.data || action.payload;
      })
      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchProductTypesBySubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductTypesBySubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes = action.payload.data || action.payload;
      })
      .addCase(fetchProductTypesBySubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createProductType.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createProductType.fulfilled, (state, action) => {
        state.createLoading = false;
        state.productTypes.push(action.payload);
      })
      .addCase(createProductType.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      .addCase(fetchProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductType.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProductType = action.payload;
      })
      .addCase(fetchProductType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateProductType.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProductType.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.productTypes.findIndex(
          (pt) => pt.id === action.payload.id
        );
        if (index !== -1) {
          state.productTypes[index] = action.payload;
        }
        if (state.selectedProductType?.id === action.payload.id) {
          state.selectedProductType = action.payload;
        }
      })
      .addCase(updateProductType.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      .addCase(deleteProductType.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteProductType.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.productTypes = state.productTypes.filter(
          (pt) => pt.id !== action.payload
        );
        if (state.selectedProductType?.id === action.payload) {
          state.selectedProductType = null;
        }
      })
      .addCase(deleteProductType.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })

      // ========================================================================
      // PRODUCTS
      // ========================================================================
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(reviewProduct.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(reviewProduct.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(reviewProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });
  },
});

export const {
  setSelectedAdmin,
  clearSelectedAdmin,
  setSelectedRole,
  clearSelectedRole,
  setSelectedCategory,
  clearSelectedCategory,
  setSelectedProductType,
  clearSelectedProductType,
  setSelectedProduct,
  clearSelectedProduct,
  clearError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
} = adminSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectPermissions = (state: { admin: AdminState }) =>
  state.admin.permissions;
export const selectRoles = (state: { admin: AdminState }) => state.admin.roles;
export const selectSelectedRole = (state: { admin: AdminState }) =>
  state.admin.selectedRole;

export const selectAdmins = (state: { admin: AdminState }) =>
  state.admin.admins;
export const selectSelectedAdmin = (state: { admin: AdminState }) =>
  state.admin.selectedAdmin;

export const selectCategories = (state: { admin: AdminState }) =>
  state.admin.categories;
export const selectSelectedCategory = (state: { admin: AdminState }) =>
  state.admin.selectedCategory;

export const selectSubcategories = (state: { admin: AdminState }) =>
  state.admin.subcategories;
export const selectAttributes = (state: { admin: AdminState }) =>
  state.admin.attributes;

export const selectProductTypes = (state: { admin: AdminState }) =>
  state.admin.productTypes;
export const selectSelectedProductType = (state: { admin: AdminState }) =>
  state.admin.selectedProductType;

export const selectProducts = (state: { admin: AdminState }) =>
  state.admin.products;
export const selectSelectedProduct = (state: { admin: AdminState }) =>
  state.admin.selectedProduct;

export const selectAdminLoading = (state: { admin: AdminState }) =>
  state.admin.loading;
export const selectCreateLoading = (state: { admin: AdminState }) =>
  state.admin.createLoading;
export const selectUpdateLoading = (state: { admin: AdminState }) =>
  state.admin.updateLoading;
export const selectDeleteLoading = (state: { admin: AdminState }) =>
  state.admin.deleteLoading;

export const selectAdminError = (state: { admin: AdminState }) =>
  state.admin.error;
export const selectCreateError = (state: { admin: AdminState }) =>
  state.admin.createError;
export const selectUpdateError = (state: { admin: AdminState }) =>
  state.admin.updateError;
export const selectDeleteError = (state: { admin: AdminState }) =>
  state.admin.deleteError;

export default adminSlice.reducer;