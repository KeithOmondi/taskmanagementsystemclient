// src/api/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AppDispatch } from "../store/store";
import { logout } from "../store/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // cookies sent automatically
  headers: { "Content-Type": "application/json" },
});

// Inject Redux dispatch (for auto logout)
let dispatch: AppDispatch | null = null;
export const injectDispatch = (d: AppDispatch) => (dispatch = d);

// Request interceptor
api.interceptors.request.use((config) => {
  // FormData check: remove Content-Type so browser sets multipart boundary
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status !== 401 || !originalRequest) return Promise.reject(error);

    // Prevent retrying refresh endpoint itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      if (dispatch) dispatch(logout());
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      if (dispatch) dispatch(logout());
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Refresh using cookies
      await api.post("/auth/refresh");

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      if (dispatch) dispatch(logout());
      return Promise.reject(refreshError);
    }
  },
);


export default api;
