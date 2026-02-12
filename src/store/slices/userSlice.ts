import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =====================================
   INTERFACES
===================================== */
export interface IUser {
  _id: string;
  name: string;
  email: string;
  pjNumber: string;
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
}

interface UsersState {
  users: IUser[];
  selectedUser: IUser | null; // Added to align with router.get("/:id")
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  message: null,
};

/* =====================================
   ASYNC THUNKS (Aligned with Express Router)
===================================== */

// 1. GET /  (getUsers)
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async ({ role }: { role?: string } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users${role ? `?role=${role}` : ""}`);
      return data.users as IUser[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

// 2. GET /:id (getUser) - New Thunk
export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${id}`);
      return data.user as IUser;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "User not found");
    }
  }
);

// 3. POST / (createUser)
export const createUser = createAsyncThunk(
  "users/create",
  async (userData: Partial<IUser>, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users", userData);
      return data.user as IUser;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create user");
    }
  }
);

// 4. PUT /:id (updateUser)
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, updates }: { id: string; updates: Partial<IUser> }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${id}`, updates);
      return data.user as IUser;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update user");
    }
  }
);

// 5. PATCH /:id/toggle-status (toggleUserStatus)
export const toggleUserStatus = createAsyncThunk(
  "users/toggleStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/users/${id}/toggle-status`);
      return { id, isActive: data.user.isActive };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle status");
    }
  }
);

/* =====================================
   SLICE
===================================== */
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (state) => { state.error = null; },
    clearUsersMessage: (state) => { state.message = null; },
    setSelectedUser: (state, action: PayloadAction<IUser | null>) => {
      state.selectedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH BY ID
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })

      // CREATE
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload); // Add to top of list
        state.message = "Operator identity created";
      })

      // UPDATE
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.users[index] = action.payload;
        if (state.selectedUser?._id === action.payload._id) state.selectedUser = action.payload;
        state.message = "Operator telemetry updated";
      })

      // TOGGLE STATUS
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u._id === action.payload.id);
        if (index !== -1) state.users[index].isActive = action.payload.isActive;
        state.message = `Access ${action.payload.isActive ? "Authorized" : "Revoked"}`;
      });
  },
});

export const { clearUsersError, clearUsersMessage, setSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;