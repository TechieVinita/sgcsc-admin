// admin-panel/src/api/api.js
import api from './axiosInstance';

const API = api;

/* ===================== Response / Error Interceptor ===================== */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Handle auth expiry centrally
    if (status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
      } catch (_) {}

      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }

    const userMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unexpected error';

    return Promise.reject({
      ...error,
      status,
      userMessage,
    });
  }
);

/* ===================== Helpers ===================== */

// Always returns the actual payload
API.unwrap = async (promise) => {
  const res = await promise;
  if (!res) return null;

  if (res.data && typeof res.data === 'object') {
    return res.data.data ?? res.data;
  }
  return res.data;
};

// Fetch logged-in admin safely
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
