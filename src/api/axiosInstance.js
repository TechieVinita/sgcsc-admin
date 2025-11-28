// admin-panel/src/api/axiosInstance.js
import axios from 'axios';

// In dev: always talk to local server with /api prefix
// In prod: use env var (set on Vercel) or fall back to Render
const API_BASE_URL =
  (process.env.REACT_APP_API_URL || '').trim() ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api'
    : 'https://sgcsc-backend.onrender.com/api');

// DEBUG: see what base URL the app is actually using
console.log('[ADMIN API] baseURL =', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    try {
      const token =
        localStorage.getItem('admin_token') || localStorage.getItem('token');
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
