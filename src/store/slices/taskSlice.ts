import { createSlice, createAsyncThunk, type PayloadAction, isAnyOf } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =====================================
    ENUMS & TYPES
===================================== */
export enum TaskStatus {
  PENDING = "Pending",
  ACKNOWLEDGED = "Acknowledged",
  COMPLETED = "Completed",
  ON_HOLD = "On Hold",
  ARCHIVED = "Archived",
}

export enum TaskPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  URGENT = "Urgent",
}

interface UserReference {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: UserReference[];
  startDate?: string;
  dueDate: string; // Aligned with Backend
  acknowledgedAt?: string;
  completedAt?: string;
  category?: { _id: string; name: string };
  boardColumn?: string;
  createdAt: string;
  daysRemaining?: number;
  isOverdue?: boolean;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  total: 0,
};

/* =====================================
    THUNKS
===================================== */

export const fetchMyTasks = createAsyncThunk<
  { data: Task[]; total: number },
  { timeframe?: string; status?: string; priority?: string } | undefined,
  { rejectValue: string }
>("tasks/fetchAll", async (filters = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/tasks/get", { params: filters });
    return { data: data.data, total: data.total };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch tasks");
  }
});

export const fetchTaskDetails = createAsyncThunk<Task, string, { rejectValue: string }>(
  "tasks/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load details");
    }
  }
);

export const updateTask = createAsyncThunk<
  Task,
  { id: string; status?: TaskStatus; boardColumn?: string; description?: string },
  { rejectValue: string }
>("tasks/update", async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    // Matches the PATCH /api/tasks/:id route
    const { data } = await api.patch(`/tasks/${id}`, updates);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Update failed");
  }
});

export const addTimeLog = createAsyncThunk<
  Task,
  { id: string; startedAt: string; durationMinutes: number },
  { rejectValue: string }
>("tasks/addTimeLog", async ({ id, ...logData }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/tasks/${id}/time-logs`, logData);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to log time");
  }
});

/* =====================================
    SLICE
===================================== */
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- List Fetching --- */
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.tasks = payload.data;
        state.total = payload.total;
      })
      .addCase(fetchMyTasks.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? "Critical error fetching tasks";
      })

      /* --- Single Task Updates (Matcher) --- */
      .addMatcher(
        isAnyOf(fetchTaskDetails.fulfilled, updateTask.fulfilled, addTimeLog.fulfilled),
        (state, { payload }: PayloadAction<Task>) => {
          const index = state.tasks.findIndex((t) => t._id === payload._id);
          if (index !== -1) {
            state.tasks[index] = payload;
          } else {
            state.tasks.unshift(payload);
          }
          state.loading = false;
        }
      )

      /* --- Global Single-Action Pending/Rejected --- */
      .addMatcher(
        (action) => action.type.endsWith("/pending") && !action.type.includes("fetchAll"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected") && !action.type.includes("fetchAll"),
        (state, { payload }: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = payload ?? "Action failed";
        }
      );
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;