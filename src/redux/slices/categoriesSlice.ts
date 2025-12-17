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
  image?: string;
  parentId?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  categoryId: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  order: number;
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

// Categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/categories");
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

export const createCategory = createAsyncThunk(
  "categories/create",
  async (
    categoryData: Omit<
      Category,
      "id" | "createdAt" | "updatedAt" | "subcategories"
    >,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/categories", categoryData);
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
      const response = await api.patch(`/api/v1/categories/${id}`, data);
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
      await api.delete(`/api/v1/categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

// Subcategories
export const fetchSubcategories = createAsyncThunk(
  "subcategories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/subcategories");
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

export const createSubcategory = createAsyncThunk(
  "categories/createSubcategory",
  async (
    {
      categoryId,
      data,
    }: {
      categoryId: string;
      data: Omit<SubCategory, "id" | "createdAt" | "updatedAt">;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/categories/${categoryId}/subcategories`,
        data
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
    { id, data }: { id: string; data: Partial<SubCategory> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/subcategories/${id}`, data);
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
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/subcategories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subcategory"
      );
    }
  }
);

// Attributes
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

export const fetchCategoryAttributes = createAsyncThunk(
  "attributes/fetchByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/v1/attributes/category/${categoryId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category attributes"
      );
    }
  }
);

export const createAttribute = createAsyncThunk(
  "attributes/create",
  async (
    {
      categoryId,
      data,
    }: {
      categoryId: string;
      data: Omit<Attribute, "id" | "createdAt" | "updatedAt">;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/attributes/category/${categoryId}`,
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
        `/api/v1/attributes/subcategory/${subcategoryId}/assign`,
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

// Product Types
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

export const fetchSubcategoryProductTypes = createAsyncThunk(
  "productTypes/fetchBySubcategory",
  async (subcategoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/v1/product-types/subcategory/${subcategoryId}`
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
      // Fetch categories
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

      // Fetch category
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

      // Fetch subcategories
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

      // Create Sub Categories
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
