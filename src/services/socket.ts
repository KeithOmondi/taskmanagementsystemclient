import { io } from "socket.io-client";

// This check handles both Vite and standard environments safely
const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:8000";
};

export const socket = io(getBaseUrl(), {
  withCredentials: true,
  autoConnect: false,
});