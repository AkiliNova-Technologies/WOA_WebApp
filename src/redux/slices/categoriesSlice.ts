import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  attributes?: Attribute[];
  productTypes?: ProductType[];
}

export interface Attribute {
  id: string;
  name: string;
  description?: string;
  inputType:
    | "dropdown"
    | "multiselect"
    | "boolean"
    | "text"
    | "number"
    | "textarea";
  purpose: "filter" | "specification" | "both";
  values: string[];
  isRequired: boolean;
  filterStatus: "active" | "inactive";
  order: number;
  categoryId?: string;
  subcategoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductType {
  id: string;
  name: string;
  description?: string;
  image?: string;
  subcategoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesState {
  categories: Category[];
  subcategories: SubCategory[];
  attributes: Attribute[];
  productTypes: ProductType[];
  selectedCategory: Category | null;
  selectedSubcategory: SubCategory | null;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  subcategories: [],
  attributes: [],
  productTypes: [],
  selectedCategory: null,
  selectedSubcategory: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
};

// ==================== PUBLIC ENDPOINTS ====================

// Public Category Endpoints
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (
    params: { skip?: number; take?: number; search?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/api/v1/categories", { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchCategory = createAsyncThunk(
  "categories/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/categories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  }
);

// Public SubCategory Endpoints
export const fetchSubcategories = createAsyncThunk(
  "subcategories/fetchAll",
  async (
    params: {
      categoryId?: string;
      skip?: number;
      take?: number;
      search?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/api/v1/subcategories", { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subcategories"
      );
    }
  }
);

export const fetchSubcategory = createAsyncThunk(
  "subcategories/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/subcategories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subcategory"
      );
    }
  }
);

// ==================== ADMIN ENDPOINTS ====================

// Admin Category Endpoints
export const createCategory = createAsyncThunk(
  "categories/create",
  async (
    categoryData: { name: string; description?: string; icon?: string },
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

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, data }: { id: string; data: Partial<Category> },
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
  "categories/delete",
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

export const fetchAdminCategories = createAsyncThunk(
  "categories/fetchAdminAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/admin/categories");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin categories"
      );
    }
  }
);

export const fetchAdminCategory = createAsyncThunk(
  "categories/fetchAdminOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/categories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin category"
      );
    }
  }
);

// Admin SubCategory Endpoints
export const createSubcategory = createAsyncThunk(
  "subcategories/create",
  async (
    data: {
      name: string;
      description?: string;
      categoryId: string;
      coverImageUrl: string;
      isActive?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/admin/categories/${data.categoryId}/subcategories`,
        {
          name: data.name,
          description: data.description,
          coverImageUrl: data.coverImageUrl,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subcategory"
      );
    }
  }
);

export const updateSubcategory = createAsyncThunk(
  "subcategories/update",
  async (
    { 
      categoryId, 
      id, 
      data 
    }: { 
      categoryId: string;
      id: string; 
      data: Partial<SubCategory> 
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/api/v1/admin/categories/${categoryId}/subcategories/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subcategory"
      );
    }
  }
);

export const deleteSubcategory = createAsyncThunk(
  "subcategories/delete",
  async (
    { categoryId, id }: { categoryId: string; id: string },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(
        `/api/v1/admin/categories/${categoryId}/subcategories/${id}`
      );
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subcategory"
      );
    }
  }
);

export const fetchAdminSubcategories = createAsyncThunk(
  "subcategories/fetchAdminAll",
  async (
    { categoryId }: { categoryId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/api/v1/admin/categories/${categoryId}/subcategories`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin subcategories"
      );
    }
  }
);

export const fetchAdminSubcategory = createAsyncThunk(
  "subcategories/fetchAdminOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/subcategories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin subcategory"
      );
    }
  }
);

// ==================== ATTRIBUTE ENDPOINTS ====================

export const fetchAttributes = createAsyncThunk(
  "attributes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/attributes");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attributes"
      );
    }
  }
);

export const createAttribute = createAsyncThunk(
  "attributes/create",
  async (
    data: Omit<Attribute, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/attributes", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create attribute"
      );
    }
  }
);

export const assignAttributesToSubcategory = createAsyncThunk(
  "attributes/assignToSubcategory",
  async (
    {
      subcategoryId,
      attributeIds,
    }: { subcategoryId: string; attributeIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/subcategories/${subcategoryId}/attributes/assign`,
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

// ==================== PRODUCT TYPE ENDPOINTS ====================

export const fetchProductTypes = createAsyncThunk(
  "productTypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/product-types");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product types"
      );
    }
  }
);

export const createProductType = createAsyncThunk(
  "productTypes/create",
  async (
    {
      subcategoryId,
      data,
    }: {
      subcategoryId: string;
      data: Omit<ProductType, "id" | "createdAt" | "updatedAt">;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/product-types/subcategory/${subcategoryId}`,
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

export const updateProductType = createAsyncThunk(
  "productTypes/update",
  async (
    { id, data }: { id: string; data: Partial<ProductType> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/product-types/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product type"
      );
    }
  }
);

export const deleteProductType = createAsyncThunk(
  "productTypes/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/product-types/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product type"
      );
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedSubcategory: (state, action: PayloadAction<SubCategory>) => {
      state.selectedSubcategory = action.payload;
    },
    clearSelected: (state) => {
      state.selectedCategory = null;
      state.selectedSubcategory = null;
    },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Public categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single category
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

      // Public subcategories
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single subcategory
      .addCase(fetchSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubcategory = action.payload;
      })
      .addCase(fetchSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Admin categories
      .addCase(fetchAdminCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single admin category
      .addCase(fetchAdminCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchAdminCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create category
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

      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (cat) => cat.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = {
            ...state.categories[index],
            ...action.payload,
          };
        }
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = {
            ...state.selectedCategory,
            ...action.payload,
          };
        }
      })

      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (cat) => cat.id !== action.payload
        );
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })

      // Admin subcategories
      .addCase(fetchAdminSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
      })
      .addCase(fetchAdminSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single admin subcategory
      .addCase(fetchAdminSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubcategory = action.payload;
      })
      .addCase(fetchAdminSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create subcategory
      .addCase(createSubcategory.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.createLoading = false;
        state.subcategories.push(action.payload);
      })
      .addCase(createSubcategory.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      // Update subcategory
      .addCase(updateSubcategory.fulfilled, (state, action) => {
        const index = state.subcategories.findIndex(
          (sub) => sub.id === action.payload.id
        );
        if (index !== -1) {
          state.subcategories[index] = {
            ...state.subcategories[index],
            ...action.payload,
          };
        }
        if (state.selectedSubcategory?.id === action.payload.id) {
          state.selectedSubcategory = {
            ...state.selectedSubcategory,
            ...action.payload,
          };
        }
      })

      // Delete subcategory
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.subcategories = state.subcategories.filter(
          (sub) => sub.id !== action.payload
        );
        if (state.selectedSubcategory?.id === action.payload) {
          state.selectedSubcategory = null;
        }
      })

      // Fetch attributes
      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = action.payload;
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create attribute
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

      // Assign attributes to subcategory
      .addCase(assignAttributesToSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignAttributesToSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        // Update the subcategory with assigned attributes if needed
        if (state.selectedSubcategory) {
          state.selectedSubcategory = action.payload;
        }
      })
      .addCase(assignAttributesToSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch product types
      .addCase(fetchProductTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes = action.payload;
      })
      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create product type
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

      // Update product type
      .addCase(updateProductType.fulfilled, (state, action) => {
        const index = state.productTypes.findIndex(
          (pt) => pt.id === action.payload.id
        );
        if (index !== -1) {
          state.productTypes[index] = {
            ...state.productTypes[index],
            ...action.payload,
          };
        }
      })

      // Delete product type
      .addCase(deleteProductType.fulfilled, (state, action) => {
        state.productTypes = state.productTypes.filter(
          (pt) => pt.id !== action.payload
        );
      });
  },
});

export const {
  setSelectedCategory,
  setSelectedSubcategory,
  clearSelected,
  clearError,
} = categoriesSlice.actions;

// Selectors
export const selectCategories = (state: { categories: CategoriesState }) =>
  state.categories.categories;
export const selectSubcategories = (state: { categories: CategoriesState }) =>
  state.categories.subcategories;
export const selectAttributes = (state: { categories: CategoriesState }) =>
  state.categories.attributes;
export const selectProductTypes = (state: { categories: CategoriesState }) =>
  state.categories.productTypes;
export const selectSelectedCategory = (state: {
  categories: CategoriesState;
}) => state.categories.selectedCategory;
export const selectSelectedSubcategory = (state: {
  categories: CategoriesState;
}) => state.categories.selectedSubcategory;
export const selectCategoriesLoading = (state: {
  categories: CategoriesState;
}) => state.categories.loading;
export const selectCategoriesError = (state: { categories: CategoriesState }) =>
  state.categories.error;
export const selectCreateCategoryLoading = (state: {
  categories: CategoriesState;
}) => state.categories.createLoading;
export const selectCreateCategoryError = (state: {
  categories: CategoriesState;
}) => state.categories.createError;

export default categoriesSlice.reducer;
