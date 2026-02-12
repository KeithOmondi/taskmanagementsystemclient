import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ---------------- CONSTANTS ---------------- //

export const TaskPriority = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskStatus = {
  PENDING: "Pending",
  ACKNOWLEDGED: "Acknowledged",
  COMPLETED: "Completed",
  ON_HOLD: "Hold",
  ARCHIVED: "Archived",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

// ---------------- TYPES ---------------- //

export interface IAttachment {
  name: string;
  url: string;
  fileType: string;
  publicId: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  assignedTo: any[];
  status: TaskStatus;
  priority: TaskPriority;
  attachments?: IAttachment[];
  createdBy: { _id: string; name: string; role?: string };
  dueDate?: string;
  startDate?: string;
  createdAt?: string;
  category?: {
    _id: string;
    name: string;
  };
}

interface SuperAdminTaskState {
  tasks: ITask[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: SuperAdminTaskState = {
  tasks: [],
  loading: false,
  error: null,
  total: 0,
};

// ---------------- ASYNC THUNKS ---------------- //

export const fetchAllTasks = createAsyncThunk<
  { data: ITask[]; total: number },
  { timeframe?: string; status?: string } | void,
  { rejectValue: string }
>("superAdmin/fetchAllTasks", async (filters, { rejectWithValue }) => {
  try {
    const res = await api.get("/superadmin/tasks", { params: filters || {} });
    return res.data; 
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch registry");
  }
});

export const createTask = createAsyncThunk<
  ITask,
  FormData,
  { rejectValue: string }
>("superAdmin/createTask", async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post("/superadmin/tasks/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Deployment failed");
  }
});

export const updateTask = createAsyncThunk<
  ITask,
  { id: string; updates: FormData | Partial<ITask> },
  { rejectValue: string }
>("superAdmin/updateTask", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const config = updates instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const res = await api.put(`/superadmin/tasks/${id}`, updates, config);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Update failed");
  }
});

export const reviewTask = createAsyncThunk<
  ITask,
  { id: string; action: "APPROVE" | "REJECT"; feedback?: string },
  { rejectValue: string }
>("superAdmin/reviewTask", async ({ id, action, feedback }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/superadmin/tasks/review/${id}`, { action, feedback });
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Review failed");
  }
});

export const deleteTask = createAsyncThunk<
  string, 
  string,
  { rejectValue: string }
>("superAdmin/deleteTask", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/superadmin/tasks/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue("Deletions restricted");
  }
});

// ---------------- SLICE ---------------- //

const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  reducers: {
    resetSuperAdminTasks: () => initialState,
    clearError: (state: SuperAdminTaskState) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      /* STEP 1: ALL Specific addCase calls 
      */
      .addCase(fetchAllTasks.pending, (state: SuperAdminTaskState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state: SuperAdminTaskState, action: PayloadAction<{ data: ITask[]; total: number }>) => {
        state.loading = false;
        const payloadData = action.payload?.data;
        state.tasks = Array.isArray(payloadData) ? payloadData : [];
        state.total = action.payload?.total || 0;
      })
      .addCase(createTask.fulfilled, (state: SuperAdminTaskState, action: PayloadAction<ITask>) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          state.tasks.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(deleteTask.fulfilled, (state: SuperAdminTaskState, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        state.total -= 1;
      })
      .addCase(updateTask.fulfilled, (state: SuperAdminTaskState, action: PayloadAction<ITask>) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(reviewTask.fulfilled, (state: SuperAdminTaskState, action: PayloadAction<ITask>) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })

      /* STEP 2: Generic Matchers (MUST BE LAST)
      */
      .addMatcher(
        (action): action is PayloadAction<string> => action.type.endsWith("/rejected"),
        (state: SuperAdminTaskState, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        }
      );
  },
});

export const { resetSuperAdminTasks, clearError } = superAdminSlice.actions;
export default superAdminSlice.reducer;