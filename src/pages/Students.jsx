// src/pages/Students.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import StudentTable from "../components/StudentTable";

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10); // yyyy-mm-dd for <input type="date">
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [viewMode, setViewMode] = useState("all"); // "all" | "franchise"

  // edit modal state
  const [editing, setEditing] = useState(null); // student object
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Initialise view mode from query param (?view=franchise)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get("view");
    if (view === "franchise") {
      setViewMode("franchise");
    } else {
      setViewMode("all");
    }
  }, [location.search]);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/students");
      const data = res.data;

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      setStudents(arr);
    } catch (err) {
      console.error("fetchStudents:", err);
      setError(err.userMessage || "Failed to fetch students");

      if (err?.response?.status === 401) {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
        } catch (_) {}
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await API.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch (err) {
      console.error("delete student:", err);
      setError(err.userMessage || "Failed to delete student");
    }
  };

  // OPEN EDIT MODAL
  const handleOpenEdit = (student) => {
    const s = student || {};
    setEditing(s);
    setEditError("");
    setEditForm({
      centerName: s.centerName || s.franchiseName || s.instituteName || "",
      name: s.name || s.studentName || "",
      gender: s.gender || "",
      dob: fmtDate(s.dob),
      email: s.email || "",
      mobile: s.mobile || s.contact || "",
      state: s.state || "",
      district: s.district || "",
      address: s.address || "",
      examPassed: s.examPassed || "",
      marksOrGrade: s.marksOrGrade || "",
      board: s.board || "",
      passingYear: s.passingYear || "",
      courseName: s.courseName || "",
      sessionStart: fmtDate(s.sessionStart),
      sessionEnd: fmtDate(s.sessionEnd),
      photo: s.photo || s.photoUrl || "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm({});
    setEditError("");
    setSavingEdit(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    const id = editing._id || editing.id;
    if (!id) return;

    setSavingEdit(true);
    setEditError("");

    try {
      const payload = {
        centerName: editForm.centerName.trim(),
        name: editForm.name.trim(),
        gender: editForm.gender,
        dob: editForm.dob || null,
        email: editForm.email.trim(),
        mobile: editForm.mobile.trim(),
        state: editForm.state.trim(),
        district: editForm.district.trim(),
        address: editForm.address.trim(),
        examPassed: editForm.examPassed.trim(),
        marksOrGrade: editForm.marksOrGrade.trim(),
        board: editForm.board.trim(),
        passingYear: editForm.passingYear.trim(),
        courseName: editForm.courseName.trim(),
        sessionStart: editForm.sessionStart || null,
        sessionEnd: editForm.sessionEnd || null,
        photo: editForm.photo.trim(),
      };

      const res = await API.put(`/students/${id}`, payload);
      const updated = res.data;


      const updatedStudent =
        updated && updated.data && updated.success ? updated.data : updated;

      setStudents((prev) =>
        prev.map((s) =>
          (s._id || s.id) === (updatedStudent._id || updatedStudent.id)
            ? { ...s, ...updatedStudent }
            : s
        )
      );

      closeEdit();
    } catch (err) {
      console.error("update student error:", err);
      setEditError(err.userMessage || "Failed to update student");
    } finally {
      setSavingEdit(false);
    }
  };

  const centers = useMemo(() => {
    const set = new Set();
    (students || []).forEach((s) => {
      const name =
        s.centerName ||
        s.franchiseName ||
        s.instituteName ||
        s.center ||
        "";
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [students]);

  // Apply search + center filter
  const filteredStudents = useMemo(() => {
    let list = students || [];

    if (selectedCenter !== "all") {
      list = list.filter((s) => {
        const name =
          s.centerName ||
          s.franchiseName ||
          s.instituteName ||
          s.center ||
          "";
        return name === selectedCenter;
      });
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter((s) => {
        const fields = [
          s.name,
          s.studentName,
          s.centerName,
          s.franchiseName,
          s.instituteName,
          s.email,
          s.mobile,
          s.state,
          s.district,
          s.examPassed,
          s.board,
          s.username,
          s.courseName,
        ];
        return fields.some(
          (v) => typeof v === "string" && v.toLowerCase().includes(term)
        );
      });
    }

    return list;
  }, [students, search, selectedCenter]);

  // Group by center for franchise view
  const groupedByCenter = useMemo(() => {
    const groups = {};
    filteredStudents.forEach((s) => {
      const key =
        s.centerName ||
        s.franchiseName ||
        s.instituteName ||
        s.center ||
        "Unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [filteredStudents]);

  const switchView = (mode) => {
    setViewMode(mode);
    const params = new URLSearchParams(location.search);
    if (mode === "franchise") {
      params.set("view", "franchise");
    } else {
      params.delete("view");
    }
    navigate({ pathname: "/students", search: params.toString() });
  };

  return (
    <div className="container-fluid p-4">
      {/* Header similar to Franchise List */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-0">Students</h2>
          <div className="small text-muted">
            All students, with optional grouping by franchise/center.
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={fetchStudents}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/students/add")}
          >
            Add Student
          </button>
        </div>
      </div>

      {/* Filters / search / view mode */}
      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap gap-3 align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">View:</span>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={
                  viewMode === "all"
                    ? "btn btn-sm btn-primary"
                    : "btn btn-sm btn-outline-primary"
                }
                onClick={() => switchView("all")}
              >
                All Students
              </button>
              <button
                type="button"
                className={
                  viewMode === "franchise"
                    ? "btn btn-sm btn-primary"
                    : "btn btn-sm btn-outline-primary"
                }
                onClick={() => switchView("franchise")}
              >
                By Franchise / Center
              </button>
            </div>
          </div>

          <div style={{ minWidth: 220 }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search name, center, email, mobile, board..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 200 }}
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
            >
              <option value="all">All Centers</option>
              {centers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="ms-auto small text-muted">
            Showing <strong>{filteredStudents.length}</strong> of{" "}
            <strong>{students.length}</strong> students
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* MAIN CONTENT */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center">Loading students…</div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card">
          <div className="card-body text-center text-muted">
            No students found. Try changing filters or add a new student.
          </div>
        </div>
      ) : viewMode === "all" ? (
        // Franchise-like card + table
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <StudentTable
              students={filteredStudents}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      ) : (
        // Grouped by center / franchise
        <div className="accordion" id="studentsByCenterAccordion">
          {Object.entries(groupedByCenter).map(([centerName, list], idx) => (
            <div className="accordion-item mb-2" key={centerName}>
              <h2 className="accordion-header">
                <button
                  className={
                    "accordion-button " + (idx === 0 ? "" : "collapsed")
                  }
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#center-${idx}`}
                  aria-expanded={idx === 0 ? "true" : "false"}
                >
                  <div className="d-flex flex-column">
                    <span className="fw-semibold">{centerName}</span>
                    <span className="small text-muted">
                      {list.length} student{list.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              </h2>
              <div
                id={`center-${idx}`}
                className={
                  "accordion-collapse collapse " + (idx === 0 ? "show" : "")
                }
                data-bs-parent="#studentsByCenterAccordion"
              >
                <div className="accordion-body p-0">
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Student</th>
                          <th>Mobile</th>
                          <th>Course</th>
                          <th>Session</th>
                          <th>Exam / Board</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((s) => {
                          const id = s._id || s.id;
                          const name = s.name || s.studentName || "-";
                          const course =
                            s.courseName ||
                            (Array.isArray(s.courses) &&
                              s.courses[0]?.name) ||
                            "-";
                          const session =
                            (s.sessionStart || s.sessionEnd) &&
                            `${fmtDate(s.sessionStart)} – ${fmtDate(
                              s.sessionEnd
                            )}`;
                          return (
                            <tr key={id}>
                              <td>
                                <div className="fw-semibold">{name}</div>
                                <div className="small text-muted">
                                  {s.email || ""}
                                </div>
                              </td>
                              <td>{s.mobile || "-"}</td>
                              <td>{course}</td>
                              <td className="small text-muted">
                                {session || "-"}
                              </td>
                              <td className="small text-muted">
                                {s.examPassed || "-"}
                                {s.board ? `, ${s.board}` : ""}
                                {s.marksOrGrade ? ` (${s.marksOrGrade})` : ""}
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleOpenEdit(s)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL (like Franchise edit) */}
      {editing && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <form onSubmit={saveEdit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    Edit Student – {editing.name || editing.studentName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeEdit}
                  />
                </div>

                <div className="modal-body">
                  {editError && (
                    <div className="alert alert-danger" role="alert">
                      {editError}
                    </div>
                  )}

                  {/* Center + Name */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Center Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="centerName"
                        value={editForm.centerName || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Student Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={editForm.name || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  {/* Gender / DOB */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={editForm.gender || ""}
                        onChange={handleEditChange}
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
                        value={editForm.dob || ""}
                        onChange={handleEditChange}
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
                        value={editForm.email || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Mobile</label>
                      <input
                        type="text"
                        className="form-control"
                        name="mobile"
                        value={editForm.mobile || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={editForm.state || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">District</label>
                      <input
                        type="text"
                        className="form-control"
                        name="district"
                        value={editForm.district || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Full Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={editForm.address || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  {/* Exam / board / marks */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Exam Passed</label>
                      <input
                        type="text"
                        className="form-control"
                        name="examPassed"
                        value={editForm.examPassed || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Board</label>
                      <input
                        type="text"
                        className="form-control"
                        name="board"
                        value={editForm.board || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Marks / Grade</label>
                      <input
                        type="text"
                        className="form-control"
                        name="marksOrGrade"
                        value={editForm.marksOrGrade || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  {/* Course + session */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Course Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="courseName"
                        value={editForm.courseName || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Session Start</label>
                      <input
                        type="date"
                        className="form-control"
                        name="sessionStart"
                        value={editForm.sessionStart || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Session End</label>
                      <input
                        type="date"
                        className="form-control"
                        name="sessionEnd"
                        value={editForm.sessionEnd || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  {/* Photo string (URL or /uploads/filename) */}
                  <div className="mb-3">
                    <label className="form-label">
                      Photo (URL or /uploads/filename)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="photo"
                      value={editForm.photo || ""}
                      onChange={handleEditChange}
                      placeholder="e.g. /uploads/student-123.jpg"
                    />
                    <div className="form-text">
                      This should match what your Add Student form saves in the
                      photo field.
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeEdit}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
