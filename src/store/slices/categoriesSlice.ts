import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Define the shape of your state
interface CategoryState {
  items: any[]; // Replace 'any' with your actual Category type
  loading: boolean;
  error: string | null;
}

// 2. Define the initial state with the interface
const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null,
};

// 3. Create the slice
// Note: We don't manually type 'const categorySlice: Slice<...>'
// RTK infers the 'Draft' state automatically inside the reducers.
export const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      // 'state' is automatically inferred as Draft<CategoryState>
      state.error = null;
    },
    // Example of a reducer with a payload
    setCategories: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    }
  },
});

// 4. Export actions and the reducer
export const { clearCategoryError, setCategories } = categorySlice.actions;
export default categorySlice.reducer;