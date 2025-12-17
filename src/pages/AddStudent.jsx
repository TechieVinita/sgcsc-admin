// src/pages/AddStudent.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

// ---- Constants ----
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Keep full only for a couple of states. You can extend later.
const DISTRICTS_BY_STATE = {
  Bihar: [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran",
  ],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Prayagraj",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Azamgarh",
    // ...complete if needed
  ],
  // other states can be filled later
};

const initialForm = {
  centerName: "",
  name: "",
  gender: "",
  fatherName: "",
  motherName: "",
  dob: "",
  email: "",
  mobile: "", // we'll store ONLY the 10 digits here
  state: "",
  district: "",
  address: "",
  examPassed: "",
  marksOrGrade: "",
  board: "",
  passingYear: "",
  username: "",
  password: "",
  courseId: "",
  courseName: "",
  sessionStart: "",
  sessionEnd: "",
};

const MAX_PHOTO_SIZE_MB = 2;
const MAX_PHOTO_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

export default function AddStudent() {
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ---------- Meta (courses + franchises) ----------
  useEffect(() => {
    let mounted = true;

    async function loadMeta() {
      setLoadingMeta(true);
      setError("");
      try {
        const [coursesRes, franchisesRes] = await Promise.allSettled([
          API.get("/courses"),
          API.get("/franchises"),
        ]);


        if (mounted && coursesRes.status === "fulfilled") {
          const data = coursesRes.value.data;
          setCourses(Array.isArray(data) ? data : data?.data || []);
        }

        if (mounted && franchisesRes.status === "fulfilled") {
          const data = franchisesRes.value.data;
          setFranchises(Array.isArray(data) ? data : data?.data || []);
        }

      } catch (err) {
        console.error("loadMeta error:", err);
        if (mounted) {
          setError(
            err.userMessage ||
              "Failed to load courses / franchises. You can still fill the form."
          );
        }
      } finally {
        if (mounted) setLoadingMeta(false);
      }
    }

    loadMeta();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- Helpers ----------
  const districtOptions = DISTRICTS_BY_STATE[form.state] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mobile: keep only digits, max 10
    if (name === "mobile") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, mobile: digits }));
      return;
    }

    // State change: reset district
    if (name === "state") {
      setForm((prev) => ({
        ...prev,
        state: value,
        district: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseChange = (e) => {
    const value = e.target.value;
    const selected = courses.find(
      (c) => (c._id || c.id || "").toString() === value
    );
    setForm((prev) => ({
      ...prev,
      courseId: value,
      courseName: selected ? selected.name || selected.title || "" : "",
    }));
  };

  const handleFranchiseChange = (e) => {
    const value = e.target.value;
    const selected = franchises.find(
      (f) => (f._id || f.id || "").toString() === value
    );
    setForm((prev) => ({
      ...prev,
      centerName:
        selected?.instituteName ||
        selected?.centerName ||
        selected?.name ||
        "",
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;

    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setError(
        `Photo is too large. Maximum allowed size is ${MAX_PHOTO_SIZE_MB} MB.`
      );
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }

    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const isValidMobile = (digits) => /^\d{10}$/.test(digits || "");

  const validateForm = () => {
    if (!form.centerName.trim()) {
      setError("Center Name is required.");
      return false;
    }
    if (!form.name.trim()) {
      setError("Student Name is required.");
      return false;
    }
    if (!isValidMobile(form.mobile)) {
      setError("Mobile number must be exactly 10 digits (without +91).");
      return false;
    }
    if (!form.state) {
      setError("State is required.");
      return false;
    }
    if (!form.district) {
      setError("District is required.");
      return false;
    }
    if (!form.address.trim()) {
      setError("Full address is required.");
      return false;
    }
    return true;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const fd = new FormData();

      // Append form fields
      const payload = {
        ...form,
        // store with +91 prefix as requested
        mobile: `+91${form.mobile}`,
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          fd.append(key, value);
        }
      });

      // Append photo file
      if (photoFile) {
        fd.append("photo", photoFile); // backend field name: "photo"
      }

      const res = await API.post("/students", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const created = res.data;

      console.log("student created:", created);

      setSuccess("Student added successfully.");
      setForm(initialForm);
      setPhotoFile(null);
      setPhotoPreview("");

      setTimeout(() => {
        navigate("/students");
      }, 800);
    } catch (err) {
      console.error("add student error:", err);
      setError(err.userMessage || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0">Add Student</h2>
          <small className="text-muted">
            Fill all required details to register a new student.
          </small>
        </div>
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => navigate("/students")}
        >
          Back to Students
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card shadow-sm"
        style={{ maxWidth: "1000px" }}
      >
        <div className="card-body">
          {loadingMeta && (
            <div className="mb-3 small text-muted">
              Loading courses / franchises…
            </div>
          )}

          {/* Center / Franchise */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">
                Center / Institute (Franchise)
              </label>
              <select
                className="form-select"
                onChange={handleFranchiseChange}
                disabled={!franchises.length}
              >
                <option value="">Select Franchise (optional)</option>
                {franchises.map((f) => (
                  <option key={f._id || f.id} value={f._id || f.id}>
                    {f.instituteName || f.centerName || f.ownerName || "Unnamed"}
                  </option>
                ))}
              </select>
              <small className="text-muted">
                This will pre-fill the center name, or you can type manually.
              </small>
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Center Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="centerName"
                value={form.centerName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Basic identity */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Student Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="dob"
                value={form.dob}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Parents */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Father&apos;s Name</label>
              <input
                type="text"
                className="form-control"
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Mother&apos;s Name</label>
              <input
                type="text"
                className="form-control"
                name="motherName"
                value={form.motherName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Mobile Number <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">+91</span>
                <input
                  type="tel"
                  className="form-control"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10 digit number"
                  required
                />
              </div>
              <small className="text-muted">
                Enter only 10 digits. +91 is added automatically.
              </small>
            </div>
          </div>

          {/* Location */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">
                State <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="state"
                value={form.state}
                onChange={handleChange}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                District <span className="text-danger">*</span>
              </label>
              {districtOptions.length > 0 ? (
                <select
                  className="form-select"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  disabled={!form.state}
                >
                  <option value="">Select District</option>
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  disabled={!form.state}
                  placeholder={
                    form.state
                      ? "Enter district (list not configured yet)"
                      : "Select state first"
                  }
                />
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Full Address <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Academic background */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Exam Passed</label>
              <input
                type="text"
                className="form-control"
                name="examPassed"
                value={form.examPassed}
                onChange={handleChange}
                placeholder="10th / 12th / Graduation, etc."
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Marks (%) / Grade</label>
              <input
                type="text"
                className="form-control"
                name="marksOrGrade"
                value={form.marksOrGrade}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Board</label>
              <input
                type="text"
                className="form-control"
                name="board"
                value={form.board}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Passing Year</label>
              <input
                type="text"
                className="form-control"
                name="passingYear"
                value={form.passingYear}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Course selection + session */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Selected Course</label>
              <select
                className="form-select"
                name="courseId"
                value={form.courseId}
                onChange={handleCourseChange}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name || c.title || "Untitled"}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Session Start</label>
              <input
                type="date"
                className="form-control"
                name="sessionStart"
                value={form.sessionStart}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Session End</label>
              <input
                type="date"
                className="form-control"
                name="sessionEnd"
                value={form.sessionEnd}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Photo upload */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">
                Student Photo (max {MAX_PHOTO_SIZE_MB} MB)
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <small className="text-muted">
                This will be saved on the server and shown in the student
                table.
              </small>
            </div>
            {photoPreview && (
              <div className="col-md-3 d-flex flex-column align-items-start">
                <label className="form-label">Preview</label>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}
          </div>

          {/* Login credentials */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
              <small className="text-muted">
                Password will be hashed and managed on the server side.
              </small>
            </div>
          </div>
        </div>

        <div className="card-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/students")}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Save Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
