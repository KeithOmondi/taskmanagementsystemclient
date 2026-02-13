import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =====================================
    INTERFACES
===================================== */
// 🟢 Exported to allow store.ts and hooks.ts to name these types
export interface User {
  id: string;
  role: string;
  name: string;
  pjNumber?: string;
}

export interface AuthState {
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

/**
 * Login / Request OTP
 */
export const loginRequest = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>("auth/loginRequest", async (pjNumber, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", { pjNumber });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

/**
 * Resend OTP
 */
export const resendOtpRequest = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>("auth/resendOtp", async (pjNumber, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/resend-otp", { pjNumber });
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to resend OTP",
    );
  }
});

/**
 * Verify OTP
 */
export const verifyOtpRequest = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("auth/verifyOtp", async (otp, { rejectWithValue }) => {
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
});

// src/store/slices/authSlice.ts
export const refreshSession = createAsyncThunk<User, void, { rejectValue: null }>(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/refresh", {}, { withCredentials: true });

      const user: User = {
        ...data.user,
        name: data.user.name || data.user.pjNumber || data.user.role || "User",
      };

      // Store new accessToken locally for Axios header
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);

      return user;
    } catch (err: any) {
      return rejectWithValue(null); // session is invalid
    }
  },
);


/**
 * Logout
 */
export const logoutRequest = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post("/auth/logout");
  } catch (err: any) {
    return rejectWithValue("Logout failed");
  }
});

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
        state.error = (action.payload as string) || "Login failed";
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
        state.error = (action.payload as string) || "Failed to resend OTP";
      })

      // VERIFY OTP
      .addCase(verifyOtpRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        verifyOtpRequest.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.user = action.payload;
          state.otpSent = false;
          state.message = null;
        },
      )
      .addCase(verifyOtpRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Invalid OTP";
      })

      // REFRESH
      .addCase(refreshSession.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(
        refreshSession.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.user = action.payload;
          state.isCheckingAuth = false;
        },
      )
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
