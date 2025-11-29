// src/pages/Courses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await API.unwrap(API.get("/courses"));
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setCourses(arr);
    } catch (err) {
      console.error("load courses", err);
      setError(err.userMessage || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = () => {
    navigate("/courses/create");
  };

  const handleEdit = (course) => {
    const id = course._id || course.id;
    navigate(`/courses/create?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await API.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      console.error("delete course", err);
      alert(err.userMessage || "Failed to delete course");
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Courses</h2>
              <div className="small text-muted">
                Manage long / short / certificate courses
              </div>
            </div>
            <div>
              <button
                className="btn btn-outline-secondary me-2"
                onClick={load}
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <button className="btn btn-primary" onClick={handleAdd}>
                Add Course
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-muted">Loading courses…</div>
          ) : courses.length === 0 ? (
            <div className="text-muted">
              No courses yet. Click <strong>Add Course</strong> to create one.
            </div>
          ) : (
            <div className="row">
              {courses.map((c) => (
                <div className="col-md-4 mb-3" key={c._id || c.id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title mb-1">
                        {c.title || c.name || "Untitled course"}
                      </h5>

                      <p
                        className="card-text small text-muted mb-2"
                        style={{ flex: 1 }}
                      >
                        {c.description || "No description provided."}
                      </p>

                      <div className="small text-muted mb-2">
                        {(c.type || "long")}{" "}
                        {c.duration ? `• ${c.duration}` : ""}
                      </div>

                      <div className="d-flex justify-content-end mt-auto">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(c._id || c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
