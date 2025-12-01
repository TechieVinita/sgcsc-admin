// admin-panel/src/api/axiosInstance.js
import axios from "axios";

// In prod (Vercel): set REACT_APP_API_URL to your backend API root
// For example: https://sgcsc-backend.onrender.com/api
const envUrl = (process.env.REACT_APP_API_URL || "").trim();

const API_BASE_URL =
  envUrl ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://sgcsc-backend.onrender.com/api");

// DEBUG: see what base URL the app is actually using
console.log("[ADMIN API] baseURL =", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach auth token on each request
api.interceptors.request.use(
  (config) => {
    try {
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore localStorage errors
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default api;
