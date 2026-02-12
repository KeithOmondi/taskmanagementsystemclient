import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =====================================
   INTERFACES
===================================== */
interface User {
  id: string;
  role: string;
  name: string; // always populated
  pjNumber?: string; // optional fallback
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  message: string | null;
  isCheckingAuth: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  otpSent: false,
  message: null,
  isCheckingAuth: true,
};

/* =====================================
   ASYNC THUNKS
===================================== */

// Login / Request OTP
export const loginRequest = createAsyncThunk(
  "auth/loginRequest",
  async (pjNumber: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", { pjNumber });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Resend OTP
export const resendOtpRequest = createAsyncThunk(
  "auth/resendOtp",
  async (pjNumber: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/resend-otp", { pjNumber });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to resend OTP");
    }
  }
);

// Verify OTP
export const verifyOtpRequest = createAsyncThunk(
  "auth/verifyOtp",
  async (otp: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/verify-otp", { otp });
      const user: User = {
        ...data.user,
        name: data.user.name || data.user.pjNumber || data.user.role || "User",
      };
      return user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Invalid OTP");
    }
  }
);

// Refresh session
// authSlice.ts - Inside ASYNC THUNKS section
export const refreshSession = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      // ✅ CHANGED FROM .get TO .post TO MATCH BACKEND
      const { data } = await api.post("/auth/refresh"); 
      
      const user: User = {
        ...data.user,
        name: data.user.name || data.user.pjNumber || data.user.role || "User",
      };
      return user;
    } catch (err: any) {
      // If we get a 404 here, it's definitely a route naming issue
      if (err.response?.status === 404) {
        console.error("Endpoint not found. Check if BASE_URL includes /api/v1");
      }
      return rejectWithValue(null);
    }
  }
);

// Logout
export const logoutRequest = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
    } catch (err: any) {
      return rejectWithValue("Logout failed");
    }
  }
);

/* =====================================
   SLICE
===================================== */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.otpSent = false;
      state.message = null;
      state.error = null;
      state.isCheckingAuth = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: (state) => {
      state.otpSent = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.message = action.payload.message || "OTP sent successfully";
      })
      .addCase(loginRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Login failed";
      })

      // RESEND OTP
      .addCase(resendOtpRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtpRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "OTP resent successfully";
      })
      .addCase(resendOtpRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to resend OTP";
      })

      // VERIFY OTP
      .addCase(verifyOtpRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpRequest.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.otpSent = false;
        state.message = null;
      })
      .addCase(verifyOtpRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Invalid OTP";
      })

      // REFRESH
      .addCase(refreshSession.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(refreshSession.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.isCheckingAuth = false;
      })

      // LOGOUT
      .addCase(logoutRequest.fulfilled, (state) => {
        state.user = null;
        state.otpSent = false;
        state.message = null;
        state.error = null;
        state.isCheckingAuth = false;
      });
  },
});

export const { logout, clearError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
