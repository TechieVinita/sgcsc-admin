import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

// Safe unwrap helper – will use API.unwrap if it exists,
// otherwise falls back to axios-style response.data
async function unwrap(promise) {
  if (typeof API.unwrap === "function") {
    return API.unwrap(promise);
  }
  const res = await promise;
  return res?.data?.data ?? res?.data;
}

export default function AddMember() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    designation: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const name = form.name.trim();
    const designation = form.designation.trim();

    if (!name) {
      setError("Name is required.");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      designation,
      isActive: !!form.isActive,
    };

    try {
      // This will work even if API.unwrap is broken/missing
      const created = await unwrap(API.post("/members", payload));
      console.log("member created:", created);

      setMessage("Member added successfully");

      // Short delay for the success alert to be visible
      setTimeout(() => {
        navigate("/members", {
          state: { flash: "Member added successfully" },
        });
      }, 400);
    } catch (err) {
      console.error("add member error:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to add member";

      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">Add Institute Member</h2>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/members")}
          disabled={saving}
        >
          ← Back to Members
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Director, Principal, HOD"
              />
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="member-active"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="member-active">
                  Show on site
                </label>
              </div>
            </div>

            <div className="col-12 mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Member"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => navigate("/members")}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
