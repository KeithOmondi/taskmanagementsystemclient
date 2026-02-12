import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice"
import taskReducer from "./slices/taskSlice"
import usersReducer from "./slices/userSlice"
import superAdminReducer from "./slices/superAdminSlice"
import categoriesReducer from "./slices/categoriesSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    user: usersReducer,
    superAdmin: superAdminReducer,
    categories: categoriesReducer,
  },
  // DevTools is enabled by default in development
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;