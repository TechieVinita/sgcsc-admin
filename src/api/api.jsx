// src/api/api.jsx
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL,
  timeout: 15000,
});

// attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// global response handler for common cases
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // If unauthorized, clear local auth and redirect to login
    if (status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) { /* ignore */ }
      // redirect to login page (replace history)
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }

    // Normalize message
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'An unexpected error occurred';

    return Promise.reject({ ...error, userMessage: message });
  }
);

/**
 * Helper to consistently return underlying data payload
 * Usage: const data = await API.unwrap(API.get('/students'));
 */
API.unwrap = async (promise) => {
  const res = await promise;
  // prefer { success:true, data } shape but fall back
  return res?.data?.data ?? res?.data;
};

/**
 * Try to fetch authenticated admin user info.
 * Tries common endpoints in case server uses different path.
 * Returns user object or null.
 */
API.getAuthUser = async () => {
  try {
    const r = await API.get('/auth/me');
    return r?.data?.data ?? r?.data;
  } catch (err) {
    // fallback try /admins/me
    try {
      const r2 = await API.get('/admins/me');
      return r2?.data?.data ?? r2?.data;
    } catch (err2) {
      return null;
    }
  }
};

export default API;
