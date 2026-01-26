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
  code: string;
  coverImageUrl?: string;
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
  categoryFeed: Category[];
  popularCategories: Category[];
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
  categoryFeed: [],
  popularCategories: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
};

// ==================== CATEGORY ENDPOINTS ====================

// Get all categories (Admin)
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
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

// Get all categories (Public) - for vendors and public access
export const fetchPublicCategories = createAsyncThunk(
  "categories/fetchPublic",
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

// Get category feed for home screen (Public - if available)
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

// Get categories sorted by popularity (Public - if available)
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

// Get a category by ID (Admin)
export const fetchCategory = createAsyncThunk(
  "categories/fetchOne",
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

// Create a new category (Admin)
export const createCategory = createAsyncThunk(
  "categories/create",
  async (
    categoryData: { name: string; description?: string; icon?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/admin/categories/create", categoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

// Update a category (Admin)
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

// Update category status (Admin)
export const updateCategoryStatus = createAsyncThunk(
  "categories/updateStatus",
  async (
    { id, isActive }: { id: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/admin/categories/${id}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category status"
      );
    }
  }
);

// Delete a category (Admin)
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

// ==================== SUBCATEGORY ENDPOINTS ====================

// Get all subcategories for a category (Admin)
export const fetchSubcategoriesByCategory = createAsyncThunk(
  "subcategories/fetchByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/categories/${categoryId}/subcategories`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subcategories"
      );
    }
  }
);

// Get all subcategories for a category (Public) - for vendors and public access
export const fetchPublicSubcategoriesByCategory = createAsyncThunk(
  "subcategories/fetchPublicByCategory",
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

// Create a new subcategory (Admin)
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
          isActive: data.isActive,
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

// Update a subcategory (Admin)
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

// Update subcategory status (Admin)
export const updateSubcategoryStatus = createAsyncThunk(
  "subcategories/updateStatus",
  async (
    { categoryId, id, isActive }: { categoryId: string; id: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/api/v1/admin/categories/${categoryId}/subcategories/${id}/status`,
        { isActive }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subcategory status"
      );
    }
  }
);

// Delete a subcategory (Admin)
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

// ==================== ATTRIBUTE ENDPOINTS ====================

// Get all attributes (Admin)
export const fetchAttributes = createAsyncThunk(
  "attributes/fetchAll",
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

// Get attributes by category (Admin)
export const fetchAttributesByCategory = createAsyncThunk(
  "attributes/fetchByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/attributes/category/${categoryId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category attributes"
      );
    }
  }
);

// Get an attribute by ID (Admin)
export const fetchAttribute = createAsyncThunk(
  "attributes/fetchOne",
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

// Create a new attribute for a category (Admin)
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
      const response = await api.post(`/api/v1/admin/attributes/category/${categoryId}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create attribute"
      );
    }
  }
);

// Update an attribute (Admin)
export const updateAttribute = createAsyncThunk(
  "attributes/update",
  async (
    { id, data }: { id: string; data: Partial<Attribute> },
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

// Delete an attribute (Admin)
export const deleteAttribute = createAsyncThunk(
  "attributes/delete",
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

// Assign attributes to subcategory (Admin)
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

// ==================== PRODUCT TYPE ENDPOINTS ====================

// Get all product types (Admin)
export const fetchProductTypes = createAsyncThunk(
  "productTypes/fetchAll",
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

// Get product types by subcategory (Admin)
export const fetchProductTypesBySubcategory = createAsyncThunk(
  "productTypes/fetchBySubcategory",
  async (subcategoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/admin/product-types/subcategory/${subcategoryId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product types by subcategory"
      );
    }
  }
);

// Get product types by subcategory (Public) - for vendors and public access
export const fetchPublicProductTypesBySubcategory = createAsyncThunk(
  "productTypes/fetchPublicBySubcategory",
  async (subcategoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/product-types/subcategory/${subcategoryId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product types by subcategory"
      );
    }
  }
);

// Get a product type by ID (Admin)
export const fetchProductType = createAsyncThunk(
  "productTypes/fetchOne",
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

// Create a new product type (Admin)
export const createProductType = createAsyncThunk(
  "productTypes/create",
  async (
    {
      subcategoryId,
      data,
    }: {
      subcategoryId: string;
      data: {
        name: string;
        description?: string;
        code: string;
        coverImageUrl?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/v1/admin/product-types/subcategory/${subcategoryId}`,
        {
          name: data.name,
          description: data.description || "",
          code: data.code,
          coverImageUrl: data.coverImageUrl || "",
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product type"
      );
    }
  }
);

// Update a product type (Admin)
export const updateProductType = createAsyncThunk(
  "productTypes/update",
  async (
    { id, data }: { id: string; data: Partial<ProductType> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/admin/product-types/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product type"
      );
    }
  }
);

// Delete a product type (Admin)
export const deleteProductType = createAsyncThunk(
  "productTypes/delete",
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

      // Public categories
      .addCase(fetchPublicCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchPublicCategories.rejected, (state, action) => {
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

      .addCase(updateCategoryStatus.fulfilled, (state, action) => {
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

      // Public subcategories
      .addCase(fetchPublicSubcategoriesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicSubcategoriesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
      })
      .addCase(fetchPublicSubcategoriesByCategory.rejected, (state, action) => {
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

      .addCase(updateSubcategoryStatus.fulfilled, (state, action) => {
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

      .addCase(fetchProductTypesBySubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductTypesBySubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes = action.payload;
      })
      .addCase(fetchProductTypesBySubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Public product types
      .addCase(fetchPublicProductTypesBySubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProductTypesBySubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes = action.payload;
      })
      .addCase(fetchPublicProductTypesBySubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.productTypes.findIndex(pt => pt.id === action.payload.id);
        if (index !== -1) {
          state.productTypes[index] = action.payload;
        } else {
          state.productTypes.push(action.payload);
        }
      })
      .addCase(fetchProductType.rejected, (state, action) => {
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