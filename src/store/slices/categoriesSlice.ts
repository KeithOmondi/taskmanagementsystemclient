import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =====================================
    INTERFACES
===================================== */
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  parentId: string | null;
  isSystemDefined: boolean;
  children?: Category[];
}

export interface CategoryState {
  categories: Category[];
  categoryTree: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  categoryTree: [],
  loading: false,
  error: null,
};

/* =====================================
    ASYNC THUNKS
===================================== */

export const fetchCategoryTree = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchTree", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/categories/tree");
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch tree");
  }
});

export const fetchAllCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/categories/get");
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch categories");
  }
});

export const createCategory = createAsyncThunk<
  Category,
  Partial<Category>,
  { rejectValue: string }
>("categories/create", async (categoryData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post("/categories/category", categoryData);
    dispatch(fetchCategoryTree());
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to create category");
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("categories/delete", async (id, { rejectWithValue, dispatch }) => {
  try {
    await api.delete(`/categories/delete/${id}`);
    dispatch(fetchCategoryTree());
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete");
  }
});

/* =====================================
    SLICE
===================================== */

const categorySlice = createSlice({
  name: "categories",
  // 🟢 FIREWALL: Explicitly casting here prevents Immer internal types from leaking
  initialState: initialState as CategoryState, 
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categoryTree = action.payload;
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.categories = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
// 🟢 The "export default" will now be clean of 'WritableNonArrayDraft'
export default categorySlice.reducer;