// src/api/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AppDispatch } from "../store/store";
import { logoutRequest } from "../store/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ important for cookies
  headers: { "Content-Type": "application/json" },
});

const refreshInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Inject Redux dispatch (so interceptors can logout)
let dispatch: AppDispatch | null = null;
export const injectDispatch = (d: AppDispatch) => (dispatch = d);

// Queue to handle multiple requests while refreshing
let isRefreshing = false;
type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
};
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  failedQueue = [];
};

// Add Authorization header automatically if accessToken exists
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});

// Response interceptor for auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Not a 401 or no config → reject
    if (status !== 401 || !originalRequest) return Promise.reject(error);

    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    // Refresh endpoint failed → logout immediately
    if (originalRequest.url?.includes("/auth/refresh")) {
      localStorage.removeItem("accessToken");
      if (dispatch) dispatch(logoutRequest());
      return Promise.reject(error);
    }

    // If a refresh is already happening, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) =>
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        }),
      );
    }

    isRefreshing = true;

    try {
      // Call refresh endpoint (cookies sent automatically)
      const refreshRes = await refreshInstance.post("/auth/refresh", {}, { withCredentials: true });
      const { accessToken } = refreshRes.data as { accessToken: string };

      if (!accessToken) throw new Error("Refresh succeeded but no token returned");

      // Save new accessToken
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      // Resolve all queued requests
      processQueue(null, accessToken);

      return api(originalRequest);
    } catch (refreshError: any) {
      // Reject all queued requests and logout
      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      if (dispatch) dispatch(logoutRequest());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
