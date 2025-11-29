// src/pages/CreateCourse.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function CreateCourse() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get("id");

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] = useState("long");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing course when editing
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setInitialLoaded(true);
        return;
      }

      try {
        const data = await API.unwrap(API.get(`/courses/${courseId}`));
        const c =
          data && typeof data === "object" && !Array.isArray(data)
            ? data
            : data?.data || {};

        setTitle(c.title || c.name || "");
        setDescription(c.description || "");
        setDuration(c.duration || "");
        setType(c.type || "long");
      } catch (err) {
        console.error("load course for edit", err);
        setError(err.userMessage || "Failed to load course");
      } finally {
        setInitialLoaded(true);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Course name / title is required");
      return;
    }

    setSaving(true);
    try {
      // still use FormData so we don't break the existing backend
      const form = new FormData();
      form.append("title", trimmedTitle);
      form.append("description", description || "");
      form.append("duration", duration || "");
      form.append("type", type || "long");

      if (courseId) {
        await API.unwrap(
          API.put(`/courses/${courseId}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        );
      } else {
        await API.unwrap(
          API.post("/courses", form, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        );
      }

      navigate("/courses");
    } catch (err) {
      console.error("save course error", err);
      const backendMessage =
        err?.response?.data?.message ||
        err.userMessage ||
        "Failed to save course";
      setError(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/courses");
  };

  if (!initialLoaded) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border" role="status" />
        <span className="ms-2">Loading…</span>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">
                {courseId ? "Edit Course" : "Create Course"}
              </h2>
              <div className="small text-muted">
                Name, duration and description for the course.
              </div>
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Back to Courses
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="card shadow-sm p-4"
            style={{ maxWidth: 800 }}
          >
            <div className="mb-3">
              <label className="form-label">Course Name *</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="long">Long Term (1 Year)</option>
                  <option value="short">Short Term (6 Months)</option>
                  <option value="certificate">Certificate (3 Months)</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Duration (text)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 1 Year"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? courseId
                    ? "Saving…"
                    : "Creating…"
                  : courseId
                  ? "Save Changes"
                  : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
