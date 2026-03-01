import API from "./axiosInstance";

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

/* ===================== SETTINGS ===================== */

export const getSettings = async () => {
  const res = await API.get("/settings");
  return res.data?.data || null;
};

export const updateSocialLinks = async (socialLinks) => {
  const res = await API.put("/settings/social", { socialLinks });
  return res.data;
};

export default API;
