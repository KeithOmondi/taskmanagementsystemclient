import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ==============================
// Types
// ==============================
interface GoogleTask {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  priority: string;
  source: "google";
}

interface GoogleState {
  events: GoogleTask[];
  loading: boolean;
  error: string | null;
  isSynced: boolean;
  authUrl: string | null;
}

const initialState: GoogleState = {
  events: [],
  loading: false,
  error: null,
  isSynced: false,
  authUrl: null,
};

// ======================================================
// 1️⃣ Get Google Auth URL
// ======================================================
export const getGoogleAuthUrl = createAsyncThunk(
  "googleTasks/getAuthUrl",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/calendar/auth/google/url", {
        withCredentials: true,
      });

      return response.data.url;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to get Google auth URL",
      );
    }
  },
);

// ======================================================
// 2️⃣ Fetch Google Calendar Events
// ======================================================
export const fetchGoogleCalendar = createAsyncThunk(
  "googleTasks/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/calendar/events", {
        withCredentials: true,
      });

      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch Google events",
      );
    }
  },
);

// ======================================================
// Slice
// ======================================================
const googleTasksSlice = createSlice({
  name: "googleTasks",
  initialState,
  reducers: {
    clearGoogleEvents: (state) => {
      state.events = [];
      state.isSynced = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // 🔹 Auth URL
      .addCase(getGoogleAuthUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoogleAuthUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.authUrl = action.payload;
      })
      .addCase(getGoogleAuthUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Fetch Events
      .addCase(fetchGoogleCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoogleCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        state.isSynced = true;
      })
      .addCase(fetchGoogleCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isSynced = false;
      });
  },
});

export const { clearGoogleEvents } = googleTasksSlice.actions;
export default googleTasksSlice.reducer;
