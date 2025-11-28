// admin-panel/src/api/api.js
import api from './axiosInstance';

// Use the shared axios instance as the base
const API = api;

// ---- Global response / error handling ----
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // If unauthorized, clear auth and kick back to login
    if (status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
      } catch {
        // ignore
      }

      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'An unexpected error occurred';

    return Promise.reject({ ...error, userMessage: message });
  }
);

// ---- Helpers ----

// Usage: const data = await API.unwrap(API.get('/students'));
API.unwrap = async (promise) => {
  const res = await promise;
  // prefer { success:true, data } but fall back to plain data
  return res?.data?.data ?? res?.data;
};

// Try to fetch authenticated admin user. Returns object or null.
API.getAuthUser = async () => {
  try {
    const r = await API.get('/auth/me');
    return r?.data?.data ?? r?.data;
  } catch {
    try {
      const r2 = await API.get('/admins/me');
      return r2?.data?.data ?? r2?.data;
    } catch {
      return null;
    }
  }
};

export default API;
