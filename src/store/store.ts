import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import usersReducer from "./slices/userSlice";
import superAdminReducer from "./slices/superAdminSlice";
import categoriesReducer from "./slices/categoriesSlice";
import googleTasksReducer from "./slices/googleTasksSlice";

/**
 * Combine all reducers
 */
const appReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  user: usersReducer,
  superAdmin: superAdminReducer,
  categories: categoriesReducer,
  googleTasks: googleTasksReducer,
});

/**
 * 🔥 Root reducer that resets the store on logout
 */
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
  if (action.type === "auth/logout") {
    state = undefined; // 💥 clears EVERYTHING
  }

  return appReducer(state, action);
};

/**
 * Configure store
 */
export const store = configureStore({
  reducer: rootReducer,
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
