import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import usersReducer from "./slices/userSlice";
import superAdminReducer from "./slices/superAdminSlice";
import categoriesReducer from "./slices/categoriesSlice";

/**
 * Explicitly defining the Store structure here creates a 
 * final 'lock' on the types, preventing internal Immer 
 * types from leaking into your RootState.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    user: usersReducer,
    superAdmin: superAdminReducer,
    categories: categoriesReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;