import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  parentId: string | null;
  isSystemDefined: boolean;
  children?: Category[]; // Nested children from /tree
}

interface CategoryState {
  categories: Category[]; // Flat list for general use/dropdowns
  categoryTree: Category[]; // Hierarchical list for grouped tables
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  categoryTree: [],
  loading: false,
  error: null,
};

// --- Async Thunks ---

/**
 * Fetch the nested tree structure
 * GET /api/categories/tree
 */
export const fetchCategoryTree = createAsyncThunk(
  "categories/fetchTree",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories/tree");
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch tree",
      );
    }
  },
);

/**
 * Fetch all categories (Flat List)
 * GET /api/categories/get
 */
export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories/get");
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

/**
 * Create a new category or sub-category
 * POST /api/categories/category
 */
export const createCategory = createAsyncThunk(
  "categories/create",
  async (categoryData: Partial<Category>, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/categories/category", categoryData);
      // REFRESH: Immediately fetch the tree again to ensure UI hierarchy is correct
      dispatch(fetchCategoryTree());
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create category",
      );
    }
  },
);

/**
 * Delete a category (and its children)
 * DELETE /api/categories/delete/:id
 */
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/categories/delete/${id}`);
      // REFRESH: Fetch tree again because children are also deleted on the backend
      dispatch(fetchCategoryTree());
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  },
);

// --- The Slice ---

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tree
      .addCase(fetchCategoryTree.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchCategoryTree.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.loading = false;
          state.categoryTree = action.payload;
        },
      )
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Flat List
      .addCase(
        fetchAllCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.categories = action.payload;
        },
      )

      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        createCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.loading = false;
          state.categories.push(action.payload);
        },
      )
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Category
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<string>) => {
          // Optimistic update for flat list
          state.categories = state.categories.filter(
            (cat) => cat._id !== action.payload,
          );
        },
      );
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
