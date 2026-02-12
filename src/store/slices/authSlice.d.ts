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
/**
 * Login / Request OTP
 */
export declare const loginRequest: import("@reduxjs/toolkit").AsyncThunk<{
    message: string;
}, string, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
/**
 * Resend OTP
 */
export declare const resendOtpRequest: import("@reduxjs/toolkit").AsyncThunk<{
    message: string;
}, string, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
/**
 * Verify OTP
 */
export declare const verifyOtpRequest: import("@reduxjs/toolkit").AsyncThunk<User, string, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
/**
 * Refresh Session
 */
export declare const refreshSession: import("@reduxjs/toolkit").AsyncThunk<User, void, {
    rejectValue: null;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
/**
 * Logout
 */
export declare const logoutRequest: import("@reduxjs/toolkit").AsyncThunk<void, void, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const logout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/logout">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/clearError">, resetAuthState: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/resetAuthState">;
declare const _default: import("redux").Reducer<{
    user: {
        id: string;
        role: string;
        name: string;
        pjNumber?: string;
    };
    loading: boolean;
    error: string | null;
    otpSent: boolean;
    message: string | null;
    isCheckingAuth: boolean;
}>;
export default _default;
//# sourceMappingURL=authSlice.d.ts.map