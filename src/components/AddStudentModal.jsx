import React, { useState } from "react";
import API from "../api/api";

export default function AddStudentModal({ show, onClose, onStudentAdded }) {
  const [formData, setFormData] = useState({
    rollNo: "",
    name: "",
    email: "",
    password: "",
    dob: "",
    course: "",
    semester: "",
    contact: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await API.post("/students", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onStudentAdded(res.data); // add new student to parent state
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show fade"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "600px" }}
      >
        <div
          className="modal-content p-4"
          style={{ backgroundColor: "#ffffff", borderRadius: "0.5rem" }}
        >
          <div className="modal-header">
            <h5 className="modal-title">Add Student</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="modal-body">
            <div className="mb-2">
              <label>Roll No</label>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-2">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-2">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-2">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-2">
              <label>DOB</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Semester</label>
              <input
                type="text"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Student"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
