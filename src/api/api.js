import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL ||
  "https://sgcsc-backend.onrender.com/api";

const API = axios.create({
  baseURL,
  timeout: 15000,
});

/* ===================== Error Normalization ===================== */
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err.message ||
      "Request failed";
    return Promise.reject({ ...err, userMessage: msg });
  }
);

/* ===================== COURSES ===================== */

// PUBLIC / ADMIN – list courses
export const getCourses = async () => {
  const res = await API.get("/courses");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

/* ===================== STUDENTS ===================== */

// Lookup student by enrollment/roll number
export const getStudentByEnrollment = async (enrollmentNumber) => {
  const res = await API.get(`/students/lookup/${enrollmentNumber}`);
  return res.data?.data || null;
};

export default API;
