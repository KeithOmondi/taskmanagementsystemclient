import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// axios.ts
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops if /refresh itself returns 401
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await refreshInstance.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshErr) {
        // If refresh fails, the session is truly dead
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
