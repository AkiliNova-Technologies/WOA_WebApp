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
  // Add fields for popular categories
  productCount?: number;
  viewCount?: number;
  popularityScore?: number;
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
  categoryFeed: Category[]; // New state for home screen feed
  popularCategories: Category[]; // New state for popular categories
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
  categoryFeed: [], // New
  popularCategories: [], // New
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
};

// ==================== CATEGORY ENDPOINTS ====================

// Get all categories
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

// Get category feed for home screen
export const fetchCategoryFeed = createAsyncThunk(
  "categories/fetchFeed",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/categories/feed");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category feed"
      );
    }
  }
);

// Get categories sorted by popularity
export const fetchPopularCategories = createAsyncThunk(
  "categories/fetchPopular",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/categories/popular");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch popular categories"
      );
    }
  }
);

// Get a category by ID
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

// ==================== SUBCATEGORY ENDPOINTS ====================

// Get all subcategories for a category
export const fetchSubcategoriesByCategory = createAsyncThunk(
  "subcategories/fetchByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/categories/${categoryId}/subcategories`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subcategories"
      );
    }
  }
);

// Get a subcategory by ID under a specific category
export const fetchSubcategory = createAsyncThunk(
  "subcategories/fetchOne",
  async (
    { categoryId, id }: { categoryId: string; id: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/api/v1/categories/${categoryId}/subcategories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subcategory"
      );
    }
  }
);

// ==================== ATTRIBUTE ENDPOINTS ====================

// Get all attributes
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

// Get attributes by category
export const fetchAttributesByCategory = createAsyncThunk(
  "attributes/fetchByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/attributes/category/${categoryId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category attributes"
      );
    }
  }
);

// Get an attribute by ID
export const fetchAttribute = createAsyncThunk(
  "attributes/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/attributes/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attribute"
      );
    }
  }
);

// Create a new attribute for a category
export const createAttribute = createAsyncThunk(
  "attributes/create",
  async (
    { 
      categoryId, 
      data 
    }: { 
      categoryId: string; 
      data: Omit<Attribute, "id" | "createdAt" | "updatedAt">
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/api/v1/attributes/category/${categoryId}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create attribute"
      );
    }
  }
);

// Update an attribute
export const updateAttribute = createAsyncThunk(
  "attributes/update",
  async (
    { id, data }: { id: string; data: Partial<Attribute> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/attributes/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update attribute"
      );
    }
  }
);

// Delete an attribute
export const deleteAttribute = createAsyncThunk(
  "attributes/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/attributes/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete attribute"
      );
    }
  }
);

// Assign attributes to subcategory
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

// ==================== ADMIN ENDPOINTS (Based on common patterns) ====================

// Note: Swagger doesn't show admin endpoints. These are based on typical REST patterns.
// You may need to adjust based on actual API.

export const createCategory = createAsyncThunk(
  "categories/create",
  async (
    categoryData: { name: string; description?: string; icon?: string },
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
        `/api/v1/categories/${data.categoryId}/subcategories`,
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
        `/api/v1/categories/${categoryId}/subcategories/${id}`,
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
        `/api/v1/categories/${categoryId}/subcategories/${id}`
      );
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subcategory"
      );
    }
  }
);

// ==================== PRODUCT TYPE ENDPOINTS ====================

// Note: These aren't in Swagger, but you may still need them
export const fetchProductTypes = createAsyncThunk(
  "productTypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/product-types"); // Adjust endpoint as needed
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
        `/api/v1/product-types/subcategory/${subcategoryId}`, // Adjust endpoint as needed
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
    clearCategoryFeed: (state) => {
      state.categoryFeed = [];
    },
    clearPopularCategories: (state) => {
      state.popularCategories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== CATEGORIES ====================
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

      .addCase(fetchCategoryFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryFeed = action.payload;
      })
      .addCase(fetchCategoryFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchPopularCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.popularCategories = action.payload;
      })
      .addCase(fetchPopularCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (cat) => cat.id !== action.payload
        );
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })

      // ==================== SUBCATEGORIES ====================
      .addCase(fetchSubcategoriesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategoriesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
      })
      .addCase(fetchSubcategoriesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

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

      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.subcategories = state.subcategories.filter(
          (sub) => sub.id !== action.payload
        );
        if (state.selectedSubcategory?.id === action.payload) {
          state.selectedSubcategory = null;
        }
      })

      // ==================== ATTRIBUTES ====================
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

      .addCase(fetchAttributesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = action.payload;
      })
      .addCase(fetchAttributesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAttribute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttribute.fulfilled, (state, action) => {
        state.loading = false;
        // You might want to handle this differently
        // For now, just update the attributes array
        const index = state.attributes.findIndex(attr => attr.id === action.payload.id);
        if (index !== -1) {
          state.attributes[index] = action.payload;
        } else {
          state.attributes.push(action.payload);
        }
      })
      .addCase(fetchAttribute.rejected, (state, action) => {
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

      .addCase(updateAttribute.fulfilled, (state, action) => {
        const index = state.attributes.findIndex(
          (attr) => attr.id === action.payload.id
        );
        if (index !== -1) {
          state.attributes[index] = {
            ...state.attributes[index],
            ...action.payload,
          };
        }
      })

      .addCase(deleteAttribute.fulfilled, (state, action) => {
        state.attributes = state.attributes.filter(
          (attr) => attr.id !== action.payload
        );
      })

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

      // ==================== PRODUCT TYPES ====================
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
      });
  },
});

export const {
  setSelectedCategory,
  setSelectedSubcategory,
  clearSelected,
  clearError,
  clearCategoryFeed,
  clearPopularCategories,
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
export const selectCategoryFeed = (state: { categories: CategoriesState }) =>
  state.categories.categoryFeed;
export const selectPopularCategories = (state: { categories: CategoriesState }) =>
  state.categories.popularCategories;
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