import axios from 'axios';

// Use CRA-style environment variable (safe fallback to localhost)
// const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const baseURL = 'http://localhost:5000/api';


const API = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds
});

// Automatically attach JWT token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized — possibly invalid or expired token.');
      // Optional: handle redirect to login or show a message
    }
    return Promise.reject(error);
  }
);

export default API;
