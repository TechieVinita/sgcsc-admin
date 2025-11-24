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
    const status = error.response?.status;
    if (status === 401) {
      // token expired / unauthorized — clear and redirect to login
      localStorage.removeItem('token');
      // try to avoid redirect during API calls (optional)
      window.location.href = '/';
    }
    // normalize message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
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
  return res.data?.data ?? res.data;
};

export default API;
