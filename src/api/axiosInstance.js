// src/api/axiosInstance.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://sgcsc-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// inject token if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) { /* ignore */ }
  return config;
}, (err) => Promise.reject(err));

export default api;
